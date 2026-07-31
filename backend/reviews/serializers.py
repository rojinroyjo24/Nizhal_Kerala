from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Review, ReviewReply

User = get_user_model()


class ReviewUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'initials']

    def get_full_name(self, obj):
        return obj.full_name

    def get_initials(self, obj):
        name = obj.full_name or obj.username
        parts = name.split()
        return ''.join(p[0].upper() for p in parts[:2])


class ReviewReplySerializer(serializers.ModelSerializer):
    replied_by = ReviewUserSerializer(read_only=True)

    class Meta:
        model = ReviewReply
        fields = ['id', 'replied_by', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'replied_by', 'created_at', 'updated_at']

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Reply content cannot be empty.')
        if len(value) > 500:
            raise serializers.ValidationError('Reply cannot exceed 500 characters.')
        return value


class ReviewSerializer(serializers.ModelSerializer):
    user = ReviewUserSerializer(read_only=True)
    replies = ReviewReplySerializer(many=True, read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at', 'replies', 'reply_count']
        read_only_fields = ['id', 'user', 'created_at']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def get_reply_count(self, obj):
        return obj.replies.count()
