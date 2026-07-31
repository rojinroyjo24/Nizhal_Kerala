from django.urls import path
from .views import ReviewListCreateView, ReviewReplyCreateView, ReviewReplyDetailView

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list-create'),
    path('<int:review_id>/reply/', ReviewReplyCreateView.as_view(), name='review-reply-create'),
    path('<int:review_id>/replies/<int:reply_id>/', ReviewReplyDetailView.as_view(), name='review-reply-detail'),
]
