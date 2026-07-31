from django.contrib import admin
from .models import TravelTip


@admin.register(TravelTip)
class TravelTipAdmin(admin.ModelAdmin):
    list_display = ['place', 'tip_type', 'added_by', 'helpful_count', 'is_approved', 'created_at']
    list_filter = ['tip_type', 'is_approved', 'created_at']
    search_fields = ['place__title', 'content', 'added_by__username']
    readonly_fields = ['created_at', 'helpful_count']
    list_editable = ['is_approved']
