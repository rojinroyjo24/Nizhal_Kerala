from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Review, ReviewReply
from .serializers import ReviewSerializer, ReviewReplySerializer
from places.models import Place


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        place_id = self.kwargs.get('place_id')
        return Review.objects.filter(place_id=place_id).select_related('user').prefetch_related('replies__replied_by')

    def perform_create(self, serializer):
        place_id = self.kwargs.get('place_id')
        place = Place.objects.get(pk=place_id)

        # Prevent duplicate reviews
        if Review.objects.filter(place=place, user=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'You have already reviewed this place.'})

        review = serializer.save(user=self.request.user, place=place)

        # Trigger notification to place owner
        try:
            from notifications.models import Notification
            if place.added_by != self.request.user:
                Notification.objects.create(
                    recipient=place.added_by,
                    notification_type='new_review',
                    title=f'New review on your place',
                    message=f'{self.request.user.full_name or self.request.user.username} reviewed "{place.title}" ⭐{review.rating}',
                    related_place=place,
                    related_review=review
                )
        except Exception:
            pass


class ReviewReplyCreateView(APIView):
    """POST /api/reviews/:id/reply/ — reply to a review."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, review_id):
        try:
            review = Review.objects.select_related('place__added_by', 'user').get(pk=review_id)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Place owner can only reply once
        place = review.place
        if place.added_by == request.user:
            if ReviewReply.objects.filter(review=review, replied_by=request.user).exists():
                return Response({'error': 'You have already replied to this review as place owner.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewReplySerializer(data=request.data)
        if serializer.is_valid():
            reply = serializer.save(review=review, replied_by=request.user)

            # Notify reviewer when place owner replies
            try:
                from notifications.models import Notification
                if place.added_by == request.user and review.user != request.user:
                    Notification.objects.create(
                        recipient=review.user,
                        notification_type='review_reply',
                        title='Place owner replied to your review',
                        message=f'The owner of "{place.title}" replied to your review.',
                        related_place=place,
                        related_review=review
                    )
            except Exception:
                pass

            return Response(ReviewReplySerializer(reply).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewReplyDetailView(APIView):
    """PUT/DELETE /api/reviews/:id/replies/:reply_id/ — edit or delete a reply."""
    permission_classes = [permissions.IsAuthenticated]

    def _get_reply(self, review_id, reply_id):
        try:
            return ReviewReply.objects.select_related('replied_by', 'review__place').get(
                pk=reply_id, review_id=review_id
            )
        except ReviewReply.DoesNotExist:
            return None

    def put(self, request, review_id, reply_id):
        reply = self._get_reply(review_id, reply_id)
        if not reply:
            return Response({'error': 'Reply not found.'}, status=status.HTTP_404_NOT_FOUND)
        if reply.replied_by != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ReviewReplySerializer(reply, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, review_id, reply_id):
        reply = self._get_reply(review_id, reply_id)
        if not reply:
            return Response({'error': 'Reply not found.'}, status=status.HTTP_404_NOT_FOUND)
        is_owner = reply.replied_by == request.user
        is_place_admin = reply.review.place.added_by == request.user
        is_staff = request.user.is_staff
        if not (is_owner or is_place_admin or is_staff):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        reply.delete()
        return Response({'message': 'Reply deleted.'}, status=status.HTTP_204_NO_CONTENT)
