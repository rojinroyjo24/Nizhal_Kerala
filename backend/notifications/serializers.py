from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    place_id = serializers.SerializerMethodField()
    place_title = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'place_id', 'place_title', 'is_read', 'created_at', 'time_ago'
        ]

    def get_place_id(self, obj):
        return obj.related_place_id

    def get_place_title(self, obj):
        return obj.related_place.title if obj.related_place else None

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        now = timezone.now()
        diff = now - obj.created_at
        if diff < timedelta(minutes=1):
            return 'just now'
        elif diff < timedelta(hours=1):
            mins = int(diff.total_seconds() / 60)
            return f'{mins} minute{"s" if mins > 1 else ""} ago'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'{hours} hour{"s" if hours > 1 else ""} ago'
        elif diff < timedelta(days=30):
            days = diff.days
            return f'{days} day{"s" if days > 1 else ""} ago'
        else:
            return obj.created_at.strftime('%b %d, %Y')
