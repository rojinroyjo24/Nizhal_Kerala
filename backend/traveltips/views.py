from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from places.models import Place
from .models import TravelTip
from .serializers import TravelTipSerializer


class TravelTipListCreateView(APIView):
    """GET/POST /api/places/:id/tips/"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, place_id):
        try:
            Place.objects.get(pk=place_id)
        except Place.DoesNotExist:
            return Response({'error': 'Place not found.'}, status=status.HTTP_404_NOT_FOUND)

        tips = TravelTip.objects.filter(place_id=place_id, is_approved=True).select_related('added_by')
        serializer = TravelTipSerializer(tips, many=True)
        return Response({'count': tips.count(), 'results': serializer.data})

    def post(self, request, place_id):
        try:
            place = Place.objects.get(pk=place_id)
        except Place.DoesNotExist:
            return Response({'error': 'Place not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TravelTipSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(place=place, added_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TravelTipHelpfulView(APIView):
    """POST /api/tips/:id/helpful/ — upvote a tip."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, tip_id):
        try:
            tip = TravelTip.objects.get(pk=tip_id, is_approved=True)
        except TravelTip.DoesNotExist:
            return Response({'error': 'Tip not found.'}, status=status.HTTP_404_NOT_FOUND)

        tip.helpful_count += 1
        tip.save(update_fields=['helpful_count'])
        return Response({'helpful_count': tip.helpful_count})


class TravelTipDeleteView(APIView):
    """DELETE /api/tips/:id/ — delete tip (owner or admin)."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, tip_id):
        try:
            tip = TravelTip.objects.get(pk=tip_id)
        except TravelTip.DoesNotExist:
            return Response({'error': 'Tip not found.'}, status=status.HTTP_404_NOT_FOUND)

        if tip.added_by != request.user and not request.user.is_staff:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        tip.delete()
        return Response({'message': 'Tip deleted.'}, status=status.HTTP_204_NO_CONTENT)
