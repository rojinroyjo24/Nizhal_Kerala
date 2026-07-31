import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Place } from '../../models/place.model';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-place-card',
  standalone: true,
  imports: [RouterLink, CommonModule, StarRatingComponent],
  template: `
    <div class="place-card">
      <div class="place-img-wrapper">
        <img [src]="displayImage" [alt]="place.title" loading="lazy" (error)="onImgError($event)">
        <div class="img-gradient"></div>
        <span class="badge-top-left"><span class="badge-cat">{{ getCategoryIcon(place.category) }} {{ place.category }}</span></span>
        <span class="badge-top-right"><span [class]="'badge-diff badge-' + place.difficulty.toLowerCase()">{{ place.difficulty }}</span></span>
        @if (imageCount > 1) {
          <div class="img-count-badge"><i class="fas fa-images"></i> {{ imageCount }}</div>
        }
      </div>
      <div class="card-body">
        <h3 class="place-title">{{ place.title }}</h3>
        <p class="place-district"><i class="fas fa-map-marker-alt"></i> {{ place.district }}</p>
        <p class="place-desc">{{ place.description }}</p>
        <div class="card-footer">
          <div class="rating-row">
            <app-star-rating [rating]="place.average_rating" [readonly]="true" [size]="'sm'"></app-star-rating>
            <span class="review-count">({{ place.review_count }})</span>
          </div>
          <a [routerLink]="['/place', place.id]" class="view-link">View Details <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .place-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(27,67,50,0.1); transition: all 0.3s ease; border: 1px solid rgba(27,67,50,0.08); height: 100%; display: flex; flex-direction: column; }
    .place-card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(27,67,50,0.18); }
    .place-img-wrapper { position: relative; height: 200px; overflow: hidden; flex-shrink: 0; }
    .place-img-wrapper img { width: 100%; height: 100%; object-fit: cover; object-position: center; transition: transform 0.4s; display: block; }
    .place-card:hover .place-img-wrapper img { transform: scale(1.05); }
    .img-gradient { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%); pointer-events: none; }
    .badge-top-left { position: absolute; top: 12px; left: 12px; z-index: 2; }
    .badge-top-right { position: absolute; top: 12px; right: 12px; z-index: 2; }
    .img-count-badge { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.55); color: white; border-radius: 20px; padding: 3px 8px; font-size: 0.7rem; font-weight: 600; font-family: 'Poppins',sans-serif; display: flex; align-items: center; gap: 4px; backdrop-filter: blur(4px); }
    .badge-cat { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 50px; font-size: 0.72rem; font-weight: 600; background: rgba(255,255,255,0.92); color: #1B4332; font-family: 'Poppins',sans-serif; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .badge-diff { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 50px; font-size: 0.72rem; font-weight: 600; color: white; font-family: 'Poppins',sans-serif; }
    .badge-easy { background: rgba(16,185,129,0.9); }
    .badge-moderate { background: rgba(245,158,11,0.9); }
    .badge-hard { background: rgba(239,68,68,0.9); }
    .card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; min-height: 0; }
    .place-title { font-family: 'Playfair Display',serif; font-size: 1.05rem; color: #2C2C2C; margin-bottom: 6px; font-weight: 700; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
    .place-district { color: #6B7280; font-size: 0.8rem; margin-bottom: 10px; font-family: 'Poppins',sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .place-district i { color: #2D6A4F; margin-right: 4px; }
    .place-desc { color: #6B7280; font-size: 0.82rem; line-height: 1.55; font-family: 'Poppins',sans-serif; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; margin-bottom: 14px; flex: 1; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #f0f0f0; gap: 8px; margin-top: auto; flex-shrink: 0; }
    .rating-row { display: flex; align-items: center; gap: 6px; }
    .review-count { font-size: 0.78rem; color: #6B7280; font-family: 'Poppins',sans-serif; }
    .view-link { color: #F4A261; text-decoration: none; font-size: 0.82rem; font-weight: 600; font-family: 'Poppins',sans-serif; display: flex; align-items: center; gap: 4px; white-space: nowrap; transition: gap 0.2s; flex-shrink: 0; }
    .view-link:hover { gap: 8px; }
  `]
})
export class PlaceCardComponent {
  @Input() place!: Place;

  get displayImage(): string {
    // Priority: main image → first gallery image → default
    return this.place.image_url || this.place.first_gallery_image || this.getDefaultImage(this.place.category);
  }

  get imageCount(): number {
    let count = this.place.image_url ? 1 : 0;
    count += (this.place.images?.length || 0);
    return count;
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = { 'Waterfall': '🌊', 'Trekking': '🥾', 'Viewpoint': '🏔️', 'Beach': '🏖️', 'Village': '🏘️', 'Forest': '🌲', 'River': '🏞️', 'Heritage': '🏛️' };
    return icons[category] || '📍';
  }

  getDefaultImage(category: string): string {
    const imgs: Record<string, string> = {
      'Waterfall': 'https://images.unsplash.com/photo-1591001776742-3b08b67b7b9f?w=600&q=80',
      'Trekking': 'https://images.unsplash.com/photo-1580547283-d5e4c38c9f59?w=600&q=80',
      'Viewpoint': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
      'Beach': 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&q=80',
      'Village': 'https://images.unsplash.com/photo-1547751574-d23b2699caf6?w=600&q=80',
      'Forest': 'https://images.unsplash.com/photo-1573407698434-6aed30a22c91?w=600&q=80',
      'River': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80',
      'Heritage': 'https://images.unsplash.com/photo-1596395697569-7b47b15ccb48?w=600&q=80',
    };
    return imgs[category] || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80';
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = this.getDefaultImage(this.place.category);
  }
}
