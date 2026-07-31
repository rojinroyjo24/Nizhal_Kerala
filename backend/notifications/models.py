from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    TYPE_CHOICES = [
        ('place_approved', 'Place Approved'),
        ('place_rejected', 'Place Rejected'),
        ('new_review', 'New Review'),
        ('review_reply', 'Review Reply'),
        ('place_reported', 'Place Reported'),
        ('report_resolved', 'Report Resolved'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_place = models.ForeignKey(
        'places.Place', null=True, blank=True, on_delete=models.SET_NULL, related_name='notifications'
    )
    related_review = models.ForeignKey(
        'reviews.Review', null=True, blank=True, on_delete=models.SET_NULL, related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] → {self.recipient.username}: {self.title}"
