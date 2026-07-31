from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Place(models.Model):
    DISTRICT_CHOICES = [
        ('Thiruvananthapuram', 'Thiruvananthapuram'),
        ('Kollam', 'Kollam'),
        ('Pathanamthitta', 'Pathanamthitta'),
        ('Alappuzha', 'Alappuzha'),
        ('Kottayam', 'Kottayam'),
        ('Idukki', 'Idukki'),
        ('Ernakulam', 'Ernakulam'),
        ('Thrissur', 'Thrissur'),
        ('Palakkad', 'Palakkad'),
        ('Malappuram', 'Malappuram'),
        ('Kozhikode', 'Kozhikode'),
        ('Wayanad', 'Wayanad'),
        ('Kannur', 'Kannur'),
        ('Kasaragod', 'Kasaragod'),
    ]

    CATEGORY_CHOICES = [
        ('Waterfall', 'Waterfall'),
        ('Trekking', 'Trekking'),
        ('Viewpoint', 'Viewpoint'),
        ('Beach', 'Beach'),
        ('Village', 'Village'),
        ('Forest', 'Forest'),
        ('River', 'River'),
        ('Heritage', 'Heritage'),
    ]

    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Moderate', 'Moderate'),
        ('Hard', 'Hard'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    SEASON_CHOICES = [
        ('Monsoon', 'Monsoon (June–August)'),
        ('Winter', 'Winter (November–February)'),
        ('Summer', 'Summer (March–May)'),
        ('Year Round', 'Year Round'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    district = models.CharField(max_length=50, choices=DISTRICT_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Easy')
    best_season = models.CharField(max_length=20, choices=SEASON_CHOICES, blank=True)
    google_maps_link = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='places/', blank=True, null=True)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='places')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True, help_text='Internal note for approval/rejection reason')
    share_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.district})"

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    @property
    def review_count(self):
        return self.reviews.count()

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None


class PlaceImage(models.Model):
    """Multiple images per place (up to 5)."""
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='place_images/')
    caption = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.place.title} (order={self.order})"


class PlaceReport(models.Model):
    """Community reports on places for admin review."""
    REASON_CHOICES = [
        ('Incorrect Information', 'Incorrect Information'),
        ('Inappropriate Content', 'Inappropriate Content'),
        ('Spam or Fake', 'Spam or Fake'),
        ('Offensive Images', 'Offensive Images'),
        ('Place Does Not Exist', 'Place Does Not Exist'),
        ('Other', 'Other'),
    ]

    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='reports')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField(blank=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL,
        related_name='resolved_reports'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [('place', 'reported_by')]
        ordering = ['-created_at']

    def __str__(self):
        return f"Report: {self.reason} on '{self.place.title}' by {self.reported_by.username}"
