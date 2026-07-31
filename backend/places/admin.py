from django.contrib import admin
from django.utils.html import format_html
from .models import Place, PlaceImage, PlaceReport


def approve_places(modeladmin, request, queryset):
    queryset.update(status='approved')
    modeladmin.message_user(request, f'✅ {queryset.count()} place(s) approved.')
approve_places.short_description = '✅ Approve selected places'


def reject_places(modeladmin, request, queryset):
    queryset.update(status='rejected')
    modeladmin.message_user(request, f'❌ {queryset.count()} place(s) rejected.')
reject_places.short_description = '❌ Reject selected places'


def reset_to_pending(modeladmin, request, queryset):
    queryset.update(status='pending')
    modeladmin.message_user(request, f'🔄 {queryset.count()} place(s) reset to pending.')
reset_to_pending.short_description = '🔄 Reset to Pending'


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'district', 'category', 'difficulty', 'best_season',
        'added_by', 'status_badge', 'average_rating', 'review_count',
        'share_count', 'created_at'
    ]
    list_filter = ['status', 'district', 'category', 'difficulty', 'best_season']
    search_fields = ['title', 'description', 'district', 'added_by__email']
    readonly_fields = ['created_at', 'updated_at', 'average_rating', 'review_count', 'image_preview', 'share_count']
    ordering = ['status', '-created_at']
    actions = [approve_places, reject_places, reset_to_pending]

    fieldsets = (
        ('📍 Place Information', {
            'fields': ('title', 'description', 'district', 'category', 'difficulty', 'best_season', 'google_maps_link')
        }),
        ('🖼️ Image', {
            'fields': ('image', 'image_preview')
        }),
        ('✅ Approval Status', {
            'fields': ('status', 'admin_note'),
            'description': 'Set status to "Approved" for the place to appear publicly.',
        }),
        ('📊 Stats', {
            'fields': ('average_rating', 'review_count', 'share_count', 'added_by', 'created_at', 'updated_at'),
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending': '#f59e0b',
            'approved': '#10b981',
            'rejected': '#ef4444',
        }
        labels = {
            'pending': '⏳ Pending',
            'approved': '✅ Approved',
            'rejected': '❌ Rejected',
        }
        color = colors.get(obj.status, '#6b7280')
        label = labels.get(obj.status, obj.status)
        return format_html(
            '<span style="background:{};color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">{}</span>',
            color, label
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:200px;border-radius:8px"/>', obj.image.url)
        return '—'
    image_preview.short_description = 'Image Preview'


@admin.register(PlaceImage)
class PlaceImageAdmin(admin.ModelAdmin):
    list_display = ['place', 'caption', 'order', 'uploaded_at', 'image_thumb']
    list_filter = ['place__district', 'uploaded_at']
    search_fields = ['place__title', 'caption']
    readonly_fields = ['uploaded_at', 'image_thumb']

    def image_thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:60px;border-radius:4px"/>', obj.image.url)
        return '—'
    image_thumb.short_description = 'Preview'


@admin.register(PlaceReport)
class PlaceReportAdmin(admin.ModelAdmin):
    list_display = ['place', 'reported_by', 'reason', 'is_resolved', 'created_at', 'resolved_by']
    list_filter = ['is_resolved', 'reason', 'created_at']
    search_fields = ['place__title', 'reported_by__username', 'description']
    readonly_fields = ['created_at', 'resolved_at', 'reported_by', 'place']
    ordering = ['is_resolved', '-created_at']
