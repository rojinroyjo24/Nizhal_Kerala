from django.contrib import admin
from .models import Review, ReviewReply


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['place', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['place__title', 'user__username', 'comment']
    readonly_fields = ['created_at']


@admin.register(ReviewReply)
class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ['review', 'replied_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['review__place__title', 'replied_by__username', 'content']
    readonly_fields = ['created_at', 'updated_at']
