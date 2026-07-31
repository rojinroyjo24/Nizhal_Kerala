from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Review(models.Model):
    place = models.ForeignKey('places.Place', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['place', 'user']  # One review per user per place

    def __str__(self):
        return f"{self.user.username} → {self.place.title} ({self.rating}★)"


class ReviewReply(models.Model):
    """Threaded replies to reviews (max 1 from place owner, unlimited from others)."""
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='replies')
    replied_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_replies')
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Reply by {self.replied_by.username} on review #{self.review.id}"
