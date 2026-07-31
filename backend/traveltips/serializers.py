from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TravelTip

User = get_user_model()


class TipUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name']

    def get_full_name(self, obj):
        return obj.full_name


class TravelTipSerializer(serializers.ModelSerializer):
    added_by = TipUserSerializer(read_only=True)

    class Meta:
        model = TravelTip
        fields = ['id', 'added_by', 'tip_type', 'content', 'helpful_count', 'is_approved', 'created_at']
        read_only_fields = ['id', 'added_by', 'helpful_count', 'is_approved', 'created_at']

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Tip content cannot be empty.')
        if len(value) > 500:
            raise serializers.ValidationError('Tip cannot exceed 500 characters.')
        return value
