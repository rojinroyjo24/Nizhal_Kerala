from django.urls import path
from .views import TravelTipListCreateView, TravelTipHelpfulView, TravelTipDeleteView

# These are mounted at /api/places/<place_id>/tips/ and /api/tips/
urlpatterns = [
    path('', TravelTipListCreateView.as_view(), name='tip-list-create'),
]

# Standalone tip endpoints mounted separately in config/urls.py
tip_standalone_urlpatterns = [
    path('<int:tip_id>/helpful/', TravelTipHelpfulView.as_view(), name='tip-helpful'),
    path('<int:tip_id>/', TravelTipDeleteView.as_view(), name='tip-delete'),
]
