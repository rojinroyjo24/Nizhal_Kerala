import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlaceService } from '../../services/place.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Place } from '../../models/place.model';
import { Review } from '../../models/review.model';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';

@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StarRatingComponent],
  template: `
    @if (isLoading) {
      <div class="loading-state"><div class="spinner"></div><p>Loading place details...</p></div>
    } @else if (place) {
      <div class="detail-hero" [style.background-image]="'url(' + (place.image_url || getDefaultImg(place.category)) + ')'">
        <div class="detail-hero-overlay">
          <div class="det-container">
            <div class="detail-hero-content">
              <nav class="breadcrumb"><a routerLink="/">Home</a> <span>›</span> <a routerLink="/explore">Explore</a> <span>›</span> <span>{{ place.title }}</span></nav>
              <div class="detail-badges">
                <span class="badge-cat">{{ getCatIcon(place.category) }} {{ place.category }}</span>
                <span [class]="'badge-diff badge-' + place.difficulty.toLowerCase()">{{ place.difficulty }}</span>
                <span class="badge-dist">📍 {{ place.district }}</span>
              </div>
              <h1>{{ place.title }}</h1>
              @if (canEdit) {
                <div class="hero-actions">
                  <a [routerLink]="['/edit-place', place.id]" class="btn-edit-hero">
                    <i class="fas fa-edit"></i> Edit Place
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="detail-content">
        <div class="det-container">
          <div class="detail-grid">
            <div class="detail-main">
              <div class="detail-card" data-aos="fade-up">
                <h2>About This Place</h2>
                <p class="desc-text">{{ place.description }}</p>
              </div>
              <div class="detail-card" data-aos="fade-up">
                <h2>Place Details</h2>
                <div class="info-grid">
                  <div class="info-item"><span>📍</span><div><span class="info-lbl">District</span><span class="info-val">{{ place.district }}</span></div></div>
                  <div class="info-item"><span>🏷️</span><div><span class="info-lbl">Category</span><span class="info-val">{{ place.category }}</span></div></div>
                  <div class="info-item"><span>⚡</span><div><span class="info-lbl">Difficulty</span><span class="info-val">{{ place.difficulty }}</span></div></div>
                  <div class="info-item"><span>👤</span><div><span class="info-lbl">Added By</span><span class="info-val">{{ place.added_by.full_name || place.added_by.username }}</span></div></div>
                  <div class="info-item"><span>📅</span><div><span class="info-lbl">Date Added</span><span class="info-val">{{ place.created_at | date:'mediumDate' }}</span></div></div>
                </div>
                @if (place.google_maps_link) {
                  <a [href]="place.google_maps_link" target="_blank" rel="noopener" class="maps-btn"><i class="fas fa-map-marked-alt"></i> Open in Google Maps</a>
                }
              </div>
            </div>

            <aside class="detail-sidebar">
              <div class="rating-card" data-aos="fade-left">
                <h3>Community Rating</h3>
                <div class="rating-big">
                  <span class="rating-num">{{ place.average_rating || '—' }}</span>
                  <div>
                    <app-star-rating [rating]="place.average_rating" [readonly]="true" [size]="'lg'"></app-star-rating>
                    <p>{{ place.review_count }} {{ place.review_count === 1 ? 'review' : 'reviews' }}</p>
                  </div>
                </div>
              </div>

              @if (isLoggedIn) {
                <div class="write-review-card" data-aos="fade-left" data-aos-delay="100">
                  <h3>Write a Review</h3>
                  <div class="review-form">
                    <div class="rating-input-row">
                      <label>Your Rating</label>
                      <app-star-rating [rating]="reviewForm.rating" [readonly]="false" [size]="'lg'" (ratingChange)="reviewForm.rating = $event"></app-star-rating>
                    </div>
                    <div class="field-grp">
                      <label>Your Experience</label>
                      <textarea [(ngModel)]="reviewForm.comment" placeholder="Share your experience..." rows="4"></textarea>
                    </div>
                    <button class="submit-rev-btn" (click)="submitReview()" [disabled]="isSubmitting">
                      @if (isSubmitting) { <span>Submitting...</span> } @else { <span><i class="fas fa-paper-plane"></i> Submit Review</span> }
                    </button>
                  </div>
                </div>
              } @else {
                <div class="login-review-box"><p>🔐 <a routerLink="/login">Login</a> to write a review</p></div>
              }

              <div class="reviews-card" data-aos="fade-left" data-aos-delay="200">
                <h3>Reviews ({{ reviews.length }})</h3>
                @if (reviewsLoading) {
                  <div style="text-align:center;padding:20px"><div class="spinner-sm"></div></div>
                } @else if (reviews.length === 0) {
                  <p class="no-reviews">No reviews yet. Be the first!</p>
                } @else {
                  <div class="reviews-list">
                    @for (review of reviews; track review.id) {
                      <div class="review-item">
                        <div class="rev-hdr">
                          <div class="user-avatar">{{ review.user.initials }}</div>
                          <div class="rev-info">
                            <strong>{{ review.user.full_name || review.user.username }}</strong>
                            <span class="rev-date">{{ review.created_at | date:'MMM d, y' }}</span>
                          </div>
                          <app-star-rating [rating]="review.rating" [readonly]="true" [size]="'sm'"></app-star-rating>
                        </div>
                        <p class="rev-comment">{{ review.comment }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            </aside>
          </div>
        </div>
      </div>

      <!-- ✦ POLAROID GALLERY (after content) ✦ -->
      @if (place.images && place.images.length > 0) {
        <section class="polaroid-gallery">
          <div class="pg-header">
            <div class="pg-line"></div>
            <span class="pg-label"><i class="fas fa-camera-retro"></i> Gallery</span>
            <div class="pg-line"></div>
            <button class="pg-all-btn" (click)="openLightbox(0)">
              <i class="fas fa-expand"></i> View All {{ place.images.length }}
            </button>
          </div>
          <div class="pg-scatter">
            @for (img of place.images.slice(0, 5); track img.id; let i = $index) {
              <div class="polaroid" [class]="'pol-' + i" (click)="openLightbox(i)">
                <div class="pol-frame">
                  <img [src]="img.image_url" [alt]="img.caption || place.title" loading="lazy">
                  @if (i === 4 && place.images.length > 5) {
                    <div class="pol-more">+{{ place.images.length - 5 }}</div>
                  }
                </div>
                <div class="pol-caption">{{ img.caption || (i === 0 ? place.title : '📍 ' + place.district) }}</div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Fullscreen Lightbox -->
      @if (lightboxOpen && place && place.images) {
        <div class="lb-overlay" (click)="lightboxOpen = false">
          <button class="lb-close" (click)="lightboxOpen = false"><i class="fas fa-times"></i></button>
          <button class="lb-nav lb-prev" (click)="$event.stopPropagation(); lbPrev()" [disabled]="lbIndex === 0">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="lb-img-wrap" (click)="$event.stopPropagation()">
            <img [src]="place.images[lbIndex]?.image_url" [alt]="place.images[lbIndex]?.caption || place.title" class="lb-img">
            <div class="lb-caption">
              <span>{{ place.images[lbIndex]?.caption || place.title }}</span>
              <span class="lb-counter">{{ lbIndex + 1 }} / {{ place.images.length }}</span>
            </div>
          </div>
          <button class="lb-nav lb-next" (click)="$event.stopPropagation(); lbNext()" [disabled]="lbIndex === place.images.length - 1">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      }

    } @else {
      <div class="loading-state"><h2>Place not found 😔</h2><a routerLink="/explore">← Back to Explore</a></div>
    }
  `,
  styles: [`
    .loading-state { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; font-family: 'Poppins',sans-serif; color: #6B7280; }
    .spinner { width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: #1B4332; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .spinner-sm { width: 28px; height: 28px; border: 3px solid #e5e7eb; border-top-color: #1B4332; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .detail-hero { height: 60vh; min-height: 350px; background-size: cover; background-position: center; position: relative; margin-top: 70px; }
    .detail-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.3) 50%,transparent 100%); display: flex; align-items: flex-end; }
    .det-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; width: 100%; }
    .detail-hero-content { padding-bottom: 40px; color: white; }
    .detail-hero-content h1 { font-family: 'Playfair Display',serif; font-size: clamp(1.8rem,4vw,3rem); color: white; margin: 0 0 16px 0; }
    .hero-actions { margin-top: 4px; }
    .btn-edit-hero { display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.6); border-radius: 50px; color: white; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.85rem; backdrop-filter: blur(4px); transition: all 0.2s; }
    .btn-edit-hero:hover { background: rgba(255,255,255,0.25); border-color: white; color: white; transform: translateY(-1px); }
    .breadcrumb { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 16px; }
    .breadcrumb a { color: rgba(255,255,255,0.7); text-decoration: none; } .breadcrumb a:hover { color: white; } .breadcrumb span { margin: 0 6px; }
    .detail-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .badge-cat,.badge-dist,.badge-diff { display: inline-flex; align-items: center; padding: 5px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; font-family: 'Poppins',sans-serif; }
    .badge-cat { background: rgba(255,255,255,0.9); color: #1B4332; }
    .badge-dist { background: rgba(27,67,50,0.8); color: white; border: 1px solid rgba(255,255,255,0.3); }
    .badge-easy { background: rgba(16,185,129,0.9); color: white; }
    .badge-moderate { background: rgba(245,158,11,0.9); color: white; }
    .badge-hard { background: rgba(239,68,68,0.9); color: white; }

    .detail-content { background: #f8f6f0; padding: 48px 0 24px; overflow-x: hidden; }
    .detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 32px; align-items: start; }
    .detail-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(27,67,50,0.08); margin-bottom: 24px; overflow: hidden; }
    .detail-card h2 { font-family: 'Playfair Display',serif; font-size: 1.5rem; color: #1B4332; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #f0f0f0; }
    .desc-text { color: #374151; font-family: 'Poppins',sans-serif; font-size: 0.95rem; line-height: 1.8; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; }
    .info-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; margin-bottom: 24px; }
    .info-item { display: flex; align-items: flex-start; gap: 12px; }
    .info-item > span { font-size: 1.3rem; flex-shrink: 0; margin-top: 2px; }
    .info-lbl { display: block; font-size: 0.75rem; color: #9ca3af; font-family: 'Poppins',sans-serif; margin-bottom: 2px; }
    .info-val { display: block; font-size: 0.9rem; font-weight: 600; color: #2C2C2C; font-family: 'Poppins',sans-serif; }
    .maps-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border-radius: 12px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
    .maps-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(27,67,50,0.3); color: white; }

    .detail-sidebar { position: sticky; top: 90px; }
    .rating-card,.write-review-card,.reviews-card,.login-review-box { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 24px rgba(27,67,50,0.08); margin-bottom: 20px; }
    .rating-card h3,.write-review-card h3,.reviews-card h3 { font-family: 'Playfair Display',serif; font-size: 1.15rem; color: #1B4332; margin-bottom: 16px; }
    .rating-big { display: flex; align-items: center; gap: 16px; }
    .rating-num { font-family: 'Playfair Display',serif; font-size: 3.5rem; font-weight: 700; color: #E9C46A; line-height: 1; }
    .rating-big p { color: #6B7280; font-size: 0.8rem; font-family: 'Poppins',sans-serif; margin-top: 4px; }
    .rating-input-row { margin-bottom: 16px; }
    .rating-input-row label,.field-grp label { display: block; font-size: 0.8rem; font-weight: 600; color: #6B7280; font-family: 'Poppins',sans-serif; margin-bottom: 8px; }
    .field-grp { margin-bottom: 16px; }
    .field-grp textarea { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.875rem; resize: vertical; outline: none; }
    .field-grp textarea:focus { border-color: #2D6A4F; }
    .submit-rev-btn { width: 100%; padding: 12px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border: none; border-radius: 10px; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .submit-rev-btn:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(27,67,50,0.3); }
    .submit-rev-btn[disabled] { opacity: 0.6; cursor: not-allowed; }
    .login-review-box p { font-family: 'Poppins',sans-serif; font-size: 0.875rem; color: #6B7280; margin: 0; }
    .login-review-box a { color: #1B4332; font-weight: 600; }
    .review-item { padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .review-item:last-child { border-bottom: none; }
    .rev-hdr { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; font-family: 'Poppins',sans-serif; flex-shrink: 0; }
    .rev-info { flex: 1; }
    .rev-info strong { display: block; font-size: 0.875rem; font-family: 'Poppins',sans-serif; color: #2C2C2C; }
    .rev-date { font-size: 0.75rem; color: #9ca3af; font-family: 'Poppins',sans-serif; }
    .rev-comment { font-size: 0.875rem; color: #4b5563; font-family: 'Poppins',sans-serif; line-height: 1.6; margin: 0; }
    .no-reviews { color: #9ca3af; font-size: 0.875rem; font-family: 'Poppins',sans-serif; text-align: center; padding: 16px; }

    /* ✦ POLAROID GALLERY ✦ */
    .polaroid-gallery { background: linear-gradient(160deg, #faf7f2 0%, #f0ede6 100%); padding: 20px 0 52px; overflow: hidden; }

    .pg-header { display: flex; align-items: center; gap: 14px; padding: 0 40px 32px; }
    .pg-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, #d1c9bc); }
    .pg-line:last-of-type { background: linear-gradient(to left, transparent, #d1c9bc); }
    .pg-label { font-family: 'Poppins',sans-serif; font-size: 0.78rem; font-weight: 700; color: #1B4332; letter-spacing: 3px; text-transform: uppercase; white-space: nowrap; display: flex; align-items: center; gap: 7px; }
    .pg-all-btn { display: flex; align-items: center; gap: 7px; padding: 8px 18px; background: #1B4332; color: white; border: none; border-radius: 50px; font-family: 'Poppins',sans-serif; font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.25s; box-shadow: 0 4px 14px rgba(27,67,50,0.3); }
    .pg-all-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(27,67,50,0.4); }

    .pg-scatter { display: flex; justify-content: center; align-items: center; gap: 0; padding: 20px 40px 10px; flex-wrap: wrap; min-height: 300px; }

    .polaroid { background: white; padding: 10px 10px 36px; box-shadow: 0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s; position: relative; margin: -10px; flex-shrink: 0; z-index: 1; }
    .polaroid:hover { z-index: 10; box-shadow: 0 24px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1); }

    /* Rotation per position */
    .pol-0 { transform: rotate(-4deg) translateY(8px); width: 260px; }
    .pol-1 { transform: rotate(3deg) translateY(-12px); width: 220px; }
    .pol-2 { transform: rotate(-2deg) translateY(4px); width: 240px; }
    .pol-3 { transform: rotate(5deg) translateY(-8px); width: 210px; }
    .pol-4 { transform: rotate(-3deg) translateY(6px); width: 230px; }

    /* Hover straightens */
    .pol-0:hover { transform: rotate(0deg) translateY(-12px) scale(1.04); }
    .pol-1:hover { transform: rotate(0deg) translateY(-16px) scale(1.04); }
    .pol-2:hover { transform: rotate(0deg) translateY(-12px) scale(1.04); }
    .pol-3:hover { transform: rotate(0deg) translateY(-16px) scale(1.04); }
    .pol-4:hover { transform: rotate(0deg) translateY(-12px) scale(1.04); }

    .pol-frame { position: relative; overflow: hidden; width: 100%; aspect-ratio: 4/3; background: #e5e7eb; }
    .pol-frame img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
    .polaroid:hover .pol-frame img { transform: scale(1.06); }
    .pol-more { position: absolute; inset: 0; background: rgba(27,67,50,0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display',serif; font-size: 2.2rem; font-weight: 700; color: white; }
    .pol-caption { margin-top: 8px; font-family: 'Poppins',sans-serif; font-size: 0.7rem; color: #6B7280; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-style: italic; }

    @media (max-width: 768px) { .pg-scatter { gap: 16px; padding: 10px 16px; } .polaroid { margin: 0 !important; width: calc(50% - 8px) !important; } .pol-0,.pol-1,.pol-2,.pol-3,.pol-4 { transform: rotate(0); } }

    /* Lightbox */
    .lb-overlay { position: fixed; inset: 0; background: rgba(5,5,15,0.96); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: lbFadeIn 0.25s ease; }
    @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .lb-img-wrap { max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .lb-img { max-width: 100%; max-height: 80vh; border-radius: 12px; object-fit: contain; box-shadow: 0 32px 80px rgba(0,0,0,0.8); }
    .lb-caption { display: flex; justify-content: space-between; width: 100%; padding: 0 4px; font-family: 'Poppins',sans-serif; font-size: 0.82rem; color: rgba(255,255,255,0.65); }
    .lb-counter { color: #10b981; font-weight: 600; }
    .lb-close { position: absolute; top: 20px; right: 20px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 1; }
    .lb-close:hover { background: rgba(239,68,68,0.5); border-color: #ef4444; }
    .lb-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: white; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 1; }
    .lb-nav:hover:not([disabled]) { background: rgba(16,185,129,0.4); border-color: #10b981; }
    .lb-nav[disabled] { opacity: 0.2; cursor: not-allowed; }
    .lb-prev { left: 24px; } .lb-next { right: 24px; }

    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .detail-sidebar { position: static; } .info-grid { grid-template-columns: 1fr; } .pw-bar { padding: 14px 16px 10px; } .pw-3,.pw-4,.pw-5 { grid-template-columns: 1fr 1fr; grid-template-rows: auto; height: auto; } .pw-3 .pw-cell-0,.pw-4 .pw-cell-0,.pw-5 .pw-cell-0 { grid-column: span 2; height: 220px; } .pw-cell { min-height: 150px; } .pw-2 { height: auto; } .pw-2 .pw-cell { height: 200px; } .lb-nav { display: none; } }
  `]
})
export class PlaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private placeService = inject(PlaceService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  place: Place | null = null;
  reviews: Review[] = [];
  isLoading = true;
  reviewsLoading = true;
  isSubmitting = false;
  isLoggedIn = false;
  canEdit = false;
  reviewForm = { rating: 0, comment: '' };
  // Gallery
  lbIndex = 0;
  lightboxOpen = false;
  activeGalleryChip = 'All';
  readonly Math = Math;
  galleryChips = [
    { label: 'All', icon: '🌐' },
    { label: 'Beach', icon: '🏖️' },
    { label: 'Nature', icon: '🌿' },
    { label: 'Adventure', icon: '🥾' },
    { label: 'Sunset', icon: '🌅' },
  ];

  openLightbox(index: number) { this.lbIndex = index; this.lightboxOpen = true; }
  lbNext() { if (this.place?.images && this.lbIndex < this.place.images.length - 1) this.lbIndex++; }
  lbPrev() { if (this.lbIndex > 0) this.lbIndex--; }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.loadPlace(+id); this.loadReviews(+id); }
  }

  loadPlace(id: number) {
    this.placeService.getPlace(id).subscribe({
      next: (p) => {
        this.place = p;
        const user = this.authService.getCurrentUser();
        this.canEdit = !!user && (user.is_staff || (p as any).added_by?.id === user.id);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadReviews(id: number) {
    this.reviewService.getReviews(id).subscribe({
      next: (r) => { this.reviews = r.results; this.reviewsLoading = false; },
      error: () => { this.reviewsLoading = false; }
    });
  }

  submitReview() {
    if (!this.reviewForm.rating) { this.toastService.error('Please select a star rating!'); return; }
    if (!this.reviewForm.comment.trim()) { this.toastService.error('Please write a comment.'); return; }
    this.isSubmitting = true;
    const placeId = this.place!.id;
    this.reviewService.submitReview(placeId, this.reviewForm).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.reviewForm = { rating: 0, comment: '' };
        this.isSubmitting = false;
        this.toastService.success('Review submitted! 🌿');
        this.loadPlace(placeId);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.detail || 'Failed to submit review.');
      }
    });
  }

  getCatIcon(category: string): string {
    const icons: Record<string,string> = {'Waterfall':'🌊','Trekking':'🥾','Viewpoint':'🏔️','Beach':'🏖️','Village':'🏘️','Forest':'🌲','River':'🏞️','Heritage':'🏛️'};
    return icons[category] || '📍';
  }

  getDefaultImg(category: string): string {
    const imgs: Record<string,string> = {
      'Waterfall':'https://images.unsplash.com/photo-1591001776742-3b08b67b7b9f?w=1200&q=80',
      'Trekking':'https://images.unsplash.com/photo-1580547283-d5e4c38c9f59?w=1200&q=80',
      'Viewpoint':'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80',
      'Beach':'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1200&q=80',
      'Village':'https://images.unsplash.com/photo-1547751574-d23b2699caf6?w=1200&q=80',
      'Forest':'https://images.unsplash.com/photo-1573407698434-6aed30a22c91?w=1200&q=80',
      'River':'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200&q=80',
      'Heritage':'https://images.unsplash.com/photo-1596395697569-7b47b15ccb48?w=1200&q=80',
    };
    return imgs[category] || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80';
  }
}
