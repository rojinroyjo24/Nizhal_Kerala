from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    """GET /api/notifications/ — list all notifications for logged-in user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notif_type = request.query_params.get('type', '')
        is_read = request.query_params.get('unread', '')
        qs = Notification.objects.filter(recipient=request.user).select_related('related_place')
        if notif_type:
            qs = qs.filter(notification_type=notif_type)
        if is_read == 'true':
            qs = qs.filter(is_read=False)
        serializer = NotificationSerializer(qs, many=True)
        return Response({'count': qs.count(), 'results': serializer.data})


class NotificationUnreadCountView(APIView):
    """GET /api/notifications/unread-count/ — quick count for badge."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'unread_count': count})


class NotificationMarkReadView(APIView):
    """PATCH /api/notifications/:id/read/ — mark single notification as read."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'id': notif.id, 'is_read': True})


class NotificationMarkAllReadView(APIView):
    """PATCH /api/notifications/read-all/ — mark all as read for user."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        updated = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'marked_read': updated})
