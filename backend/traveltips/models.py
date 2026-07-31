from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class TravelTip(models.Model):
    TIP_TYPE_CHOICES = [
        ('Safety', 'Safety'),
        ('Transport', 'Transport'),
        ('Food and Water', 'Food and Water'),
        ('Best Time', 'Best Time'),
        ('What to Carry', 'What to Carry'),
        ('Permits Required', 'Permits Required'),
        ('Wildlife Warning', 'Wildlife Warning'),
        ('General', 'General'),
    ]

    place = models.ForeignKey('places.Place', on_delete=models.CASCADE, related_name='travel_tips')
    added_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='travel_tips')
    tip_type = models.CharField(max_length=30, choices=TIP_TYPE_CHOICES)
    content = models.TextField(max_length=500)
    helpful_count = models.IntegerField(default=0)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-helpful_count', '-created_at']

    def __str__(self):
        return f"[{self.tip_type}] {self.content[:60]} — {self.place.title}"
