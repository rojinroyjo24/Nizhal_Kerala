from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Place, PlaceImage, PlaceReport

User = get_user_model()


class PlaceUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name']

    def get_full_name(self, obj):
        return obj.full_name


class PlaceImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PlaceImage
        fields = ['id', 'image_url', 'caption', 'order', 'uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class PlaceReportSerializer(serializers.ModelSerializer):
    reported_by = PlaceUserSerializer(read_only=True)
    place_title = serializers.SerializerMethodField()

    class Meta:
        model = PlaceReport
        fields = [
            'id', 'place', 'place_title', 'reported_by', 'reason',
            'description', 'created_at', 'is_resolved', 'resolved_at'
        ]
        read_only_fields = ['id', 'reported_by', 'created_at', 'is_resolved', 'resolved_at']

    def get_place_title(self, obj):
        return obj.place.title


class PlaceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    added_by = PlaceUserSerializer(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    image_url = serializers.SerializerMethodField()
    first_gallery_image = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = [
            'id', 'title', 'description', 'district', 'category',
            'difficulty', 'best_season', 'image_url', 'first_gallery_image',
            'added_by', 'average_rating', 'review_count',
            'share_count', 'status', 'created_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_first_gallery_image(self, obj):
        request = self.context.get('request')
        first = obj.images.first()
        if first and request:
            return request.build_absolute_uri(first.image.url)
        return None


class PlaceDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""
    added_by = PlaceUserSerializer(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    image_url = serializers.SerializerMethodField()
    images = PlaceImageSerializer(many=True, read_only=True)

    class Meta:
        model = Place
        fields = [
            'id', 'title', 'description', 'district', 'category',
            'difficulty', 'best_season', 'google_maps_link', 'image', 'image_url',
            'images', 'added_by', 'average_rating', 'review_count',
            'share_count', 'created_at', 'updated_at'
        ]
        extra_kwargs = {'image': {'write_only': True, 'required': False}}

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
