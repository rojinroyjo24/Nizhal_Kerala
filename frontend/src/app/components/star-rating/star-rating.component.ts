import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="!readonly">
      @for (star of stars; track star.index) {
        <i
          [class]="star.class"
          [style.font-size]="sizePx"
          (click)="!readonly && onStarClick(star.index)"
          (mouseenter)="!readonly && onHover(star.index)"
          (mouseleave)="!readonly && onHoverEnd()"
        ></i>
      }
      @if (showCount && rating > 0) {
        <span class="rating-text">{{ rating.toFixed(1) }}</span>
      }
    </div>
  `,
  styles: [`
    .star-rating { display: inline-flex; align-items: center; gap: 2px; }
    .interactive i { cursor: pointer; transition: transform 0.15s; }
    .interactive i:hover { transform: scale(1.2); }
    .rating-text { font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.85rem; color: #E9C46A; margin-left: 4px; }
    i { color: #d1d5db; }
    i.fa-star, i.fa-star-half-alt { color: #E9C46A; }
  `]
})
export class StarRatingComponent implements OnChanges {
  @Input() rating: number = 0;
  @Input() readonly: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showCount: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars: { index: number; class: string }[] = [];

  get sizePx(): string {
    return this.size === 'sm' ? '13px' : this.size === 'lg' ? '24px' : '16px';
  }

  ngOnChanges() { this.buildStars(this.rating); }

  private buildStars(rating: number) {
    this.stars = [];
    for (let i = 1; i <= 5; i++) {
      let cls = rating >= i ? 'fas fa-star' : rating >= i - 0.5 ? 'fas fa-star-half-alt' : 'far fa-star';
      this.stars.push({ index: i, class: cls });
    }
  }

  onHover(index: number) { this.buildStars(index); }
  onHoverEnd() { this.buildStars(this.rating); }
  onStarClick(index: number) { this.ratingChange.emit(index); this.buildStars(index); }
}
