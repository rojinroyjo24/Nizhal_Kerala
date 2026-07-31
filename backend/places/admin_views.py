"""
Custom admin API views for the Nizhal admin dashboard.
These are separate from Django's built-in admin and require is_staff permission.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth import get_user_model
from django.utils import timezone

from places.models import Place, PlaceReport
from places.serializers import PlaceDetailSerializer, PlaceListSerializer, PlaceReportSerializer
from reviews.models import Review

User = get_user_model()


class IsStaffUser(permissions.BasePermission):
    """Only Django staff/superusers can access these endpoints."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff


class AdminDashboardStatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        return Response({
            'total_places': Place.objects.count(),
            'pending_places': Place.objects.filter(status='pending').count(),
            'approved_places': Place.objects.filter(status='approved').count(),
            'rejected_places': Place.objects.filter(status='rejected').count(),
            'total_users': User.objects.count(),
            'total_reviews': Review.objects.count(),
            'recent_places': PlaceListSerializer(
                Place.objects.order_by('-created_at')[:5],
                many=True, context={'request': request}
            ).data,
        })


class AdminPlaceListView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        status_filter = request.query_params.get('status', '')
        qs = Place.objects.select_related('added_by').prefetch_related('reviews').order_by('-created_at')
        if status_filter:
            qs = qs.filter(status=status_filter)
        serializer = PlaceListSerializer(qs, many=True, context={'request': request})
        return Response({'count': qs.count(), 'results': serializer.data})


class AdminPlaceApproveView(APIView):
    permission_classes = [IsStaffUser]

    def patch(self, request, pk):
        try:
            place = Place.objects.get(pk=pk)
        except Place.DoesNotExist:
            return Response({'error': 'Place not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        note = request.data.get('admin_note', '')

        if action == 'approve':
            place.status = 'approved'
        elif action == 'reject':
            place.status = 'rejected'
        elif action == 'pending':
            place.status = 'pending'
        else:
            return Response({'error': 'Invalid action. Use: approve, reject, or pending.'}, status=status.HTTP_400_BAD_REQUEST)

        if note:
            place.admin_note = note
        place.save()

        return Response({
            'id': place.id,
            'status': place.status,
            'message': f'Place "{place.title}" has been {place.status}.'
        })

    def delete(self, request, pk):
        try:
            place = Place.objects.get(pk=pk)
        except Place.DoesNotExist:
            return Response({'error': 'Place not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            title = place.title
            place.delete()
            return Response({'message': f'Place "{title}" has been deleted.'})
        except Exception as e:
            return Response({'error': f'Deletion failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminUserListView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        data = []
        for user in users:
            data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
                'places_count': user.places.count(),
            })
        return Response({'count': len(data), 'results': data})


class AdminReportListView(APIView):
    """GET /api/admin/reports/ — list all reports for staff review."""
    permission_classes = [IsStaffUser]

    def get(self, request):
        is_resolved = request.query_params.get('resolved', '')
        reason = request.query_params.get('reason', '')
        qs = PlaceReport.objects.select_related('place', 'reported_by', 'resolved_by').order_by('is_resolved', '-created_at')
        if is_resolved == 'true':
            qs = qs.filter(is_resolved=True)
        elif is_resolved == 'false':
            qs = qs.filter(is_resolved=False)
        if reason:
            qs = qs.filter(reason=reason)
        serializer = PlaceReportSerializer(qs, many=True)
        return Response({
            'count': qs.count(),
            'unresolved_count': PlaceReport.objects.filter(is_resolved=False).count(),
            'results': serializer.data
        })


class AdminReportResolveView(APIView):
    """PATCH /api/admin/reports/:id/resolve/ — mark a report as resolved."""
    permission_classes = [IsStaffUser]

    def patch(self, request, pk):
        try:
            report = PlaceReport.objects.get(pk=pk)
        except PlaceReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

        report.is_resolved = True
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        report.save()

        # Notify the reporter
        try:
            from notifications.models import Notification
            Notification.objects.create(
                recipient=report.reported_by,
                notification_type='report_resolved',
                title='Your report has been reviewed',
                message=f'Your report on "{report.place.title}" has been reviewed by our team.',
                related_place=report.place
            )
        except Exception:
            pass

        return Response({'message': 'Report marked as resolved.'})
