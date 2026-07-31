import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review, ReviewReply, ReviewsResponse, ReviewFormData } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReviews(placeId: number): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(`${this.apiUrl}/places/${placeId}/reviews/`);
  }

  submitReview(placeId: number, data: ReviewFormData): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/places/${placeId}/reviews/`, data);
  }

  submitReply(reviewId: number, content: string, placeId: number): Observable<ReviewReply> {
    return this.http.post<ReviewReply>(`${this.apiUrl}/places/${placeId}/reviews/${reviewId}/reply/`, { content });
  }

  deleteReply(reviewId: number, replyId: number, placeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/places/${placeId}/reviews/${reviewId}/replies/${replyId}/`);
  }
}
