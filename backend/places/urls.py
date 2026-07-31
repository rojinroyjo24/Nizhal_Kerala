from django.urls import path, include
from .views import (
    PlaceListCreateView,
    PlaceRetrieveUpdateDestroyView,
    PlaceImageUploadView,
    PlaceImageDeleteView,
    PlaceShareView,
    PlaceReportView,
    PlaceSurpriseView,
    DistrictListView,
    CategoryListView,
)
from .admin_views import (
    AdminDashboardStatsView,
    AdminPlaceListView,
    AdminPlaceApproveView,
    AdminUserListView,
    AdminReportListView,
    AdminReportResolveView,
)

urlpatterns = [
    # Public place endpoints
    path('places/surprise/', PlaceSurpriseView.as_view(), name='place-surprise'),
    path('places/', PlaceListCreateView.as_view(), name='place-list'),
    path('places/<int:pk>/', PlaceRetrieveUpdateDestroyView.as_view(), name='place-detail'),
    path('places/<int:place_id>/reviews/', include('reviews.urls')),
    path('places/<int:place_id>/images/', PlaceImageUploadView.as_view(), name='place-image-upload'),
    path('places/<int:place_id>/images/<int:image_id>/', PlaceImageDeleteView.as_view(), name='place-image-delete'),
    path('places/<int:place_id>/share/', PlaceShareView.as_view(), name='place-share'),
    path('places/<int:place_id>/report/', PlaceReportView.as_view(), name='place-report'),
    path('places/<int:place_id>/tips/', include('traveltips.urls')),
    path('districts/', DistrictListView.as_view(), name='district-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # Admin dashboard endpoints (staff only)
    path('admin/dashboard/', AdminDashboardStatsView.as_view(), name='admin-dashboard'),
    path('admin/places/', AdminPlaceListView.as_view(), name='admin-places'),
    path('admin/places/<int:pk>/', AdminPlaceApproveView.as_view(), name='admin-place-action'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('admin/reports/<int:pk>/resolve/', AdminReportResolveView.as_view(), name='admin-report-resolve'),
]
