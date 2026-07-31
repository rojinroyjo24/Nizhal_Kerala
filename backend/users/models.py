from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model using email as the primary identifier.
    """
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    def __str__(self):
        return self.email
