from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
import random

from .models import Place, PlaceImage, PlaceReport
from .serializers import (
    PlaceListSerializer, PlaceDetailSerializer,
    PlaceImageSerializer, PlaceReportSerializer
)


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """Allow owner or admin (is_staff) to update/delete. Everyone can read."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.added_by == request.user or request.user.is_staff


class PlaceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Auto-seed if production database is empty
        if Place.objects.count() == 0:
            from django.core.management import call_command
            try:
                call_command('seed_data')
            except Exception:
                pass

        qs = Place.objects.select_related('added_by').prefetch_related('reviews')
        try:
            qs = Place.objects.select_related('added_by').prefetch_related('reviews', 'images')
        except Exception:
            pass

        if self.request.method in ('GET',):
            user = self.request.user
            if user.is_authenticated:
                qs = qs.filter(models.Q(status='approved') | models.Q(added_by=user))
            else:
                qs = qs.filter(status='approved')

        district = self.request.query_params.get('district')
        category = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        best_season = self.request.query_params.get('best_season')
        search = self.request.query_params.get('search')
        sort = self.request.query_params.get('sort', 'latest')

        if district:
            qs = qs.filter(district=district)
        if category:
            qs = qs.filter(category=category)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        if best_season:
            qs = qs.filter(best_season=best_season)
        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(description__icontains=search) | qs.filter(district__icontains=search)

        if sort == 'oldest':
            qs = qs.order_by('created_at')
        else:
            qs = qs.order_by('-created_at')

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlaceDetailSerializer
        return PlaceListSerializer

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class PlaceRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlaceDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdminOrReadOnly]

    def get_queryset(self):
        try:
            return Place.objects.select_related('added_by').prefetch_related('reviews', 'images')
        except Exception:
            return Place.objects.select_related('added_by').prefetch_related('reviews')


class PlaceImageUploadView(APIView):
    """POST /api/places/:id/images/ — upload image to a place (owner only, max 5)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, place_id):
        try:
            place = Place.objects.get(pk=place_id)
        except Place.DoesNotExist:
            return Response({'error': 'Place not found.'}, status=status.HTTP_404_NOT_FOUND)

        if place.added_by != request.user and not request.user.is_staff:
            return Response({'error': 'You do not have permission to upload images for this place.'}, status=status.HTTP_403_FORBIDDEN)

        if place.images.count() >= 5:
            return Response({'error': 'Maximum 5 images allowed per place.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        caption = request.data.get('caption', '')
        order = request.data.get('order', place.images.count())

        img = PlaceImage.objects.create(place=place, image=image_file, caption=caption, order=order)
        serializer = PlaceImageSerializer(img, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PlaceImageDeleteView(APIView):
    """DELETE /api/places/:id/images/:image_id/ — delete a specific place image (owner only)."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, place_id, image_id):
        try:
            place = Place.objects.get(pk=place_id)
            img = PlaceImage.objects.get(pk=image_id, place=place)
        except (Place.DoesNotExist, PlaceImage.DoesNotExist):
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if place.added_by != request.user and not request.user.is_staff:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        img.image.delete(save=False)
        img.delete()
        return Response({'message': 'Image deleted.'}, status=status.HTTP_204_NO_CONTENT)


class PlaceShareView(APIView):
    """POST /api/places/:id/share/ — increment share count."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, place_id):
        try:
            place = Place.objects.get(pk=place_id, status='approved')
        except Place.DoesNotExist:
            return Response({'error': 'Place not found.'}, status=status.HTTP_404_NOT_FOUND)

        place.share_count += 1
        place.save(update_fields=['share_count'])
        return Response({'share_count': place.share_count})


class PlaceReportView(APIView):
    """POST /api/places/:id/report/ — report a place (authenticated)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, place_id):
        try:
            place = Place.objects.get(pk=place_id)
        except Place.DoesNotExist:
            return Response({'error': 'Place not found.'}, status=status.HTTP_404_NOT_FOUND)

        if PlaceReport.objects.filter(place=place, reported_by=request.user).exists():
            return Response({'error': 'You have already reported this place.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PlaceReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(place=place, reported_by=request.user)
            return Response({'message': 'Report submitted. Our team will review it.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlaceSurpriseView(APIView):
    """GET /api/places/surprise/ — return a random approved place."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = Place.objects.filter(status='approved').prefetch_related('reviews', 'images').select_related('added_by')
        district = request.query_params.get('district')
        if district:
            qs = qs.filter(district=district)

        place = qs.order_by('?').first()
        if not place:
            return Response({'error': 'No places found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PlaceDetailSerializer(place, context={'request': request})
        return Response(serializer.data)


class DistrictListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        districts = [choice[0] for choice in Place.DISTRICT_CHOICES]
        return Response({'districts': districts})


class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category_icons = {
            'Waterfall': '🌊', 'Trekking': '🥾', 'Viewpoint': '🏔️',
            'Beach': '🏖️', 'Village': '🏘️', 'Forest': '🌲',
            'Cave': '🦇', 'River': '🚣', 'Lake': '🛶', 'Historic': '🏛️'
        }
        categories = [
            {'name': choice[0], 'icon': category_icons.get(choice[0], '📍')}
            for choice in Place.CATEGORY_CHOICES
        ]
        return Response({'categories': categories})


class AutoSeedView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.core.management import call_command
        try:
            call_command('seed_data')
            count = Place.objects.count()
            return Response({'status': 'success', 'message': f'{count} places and accounts seeded successfully!'})
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
