"""
URL configuration for the Nizhal – Hidden Kerala Explorer Django project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from traveltips.urls import tip_standalone_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('places.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/tips/', include(tip_standalone_urlpatterns)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
