import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlaceService } from '../../services/place.service';
import { Place } from '../../models/place.model';
import { PlaceCardComponent } from '../../components/place-card/place-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PlaceCardComponent],
  template: `
    <!-- HERO -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge" data-aos="fade-down">🌴 Discover Kerala's Best Kept Secrets</div>
        <h1 class="hero-title" data-aos="fade-up" data-aos-delay="100">Explore the Soul<br>of Kerala</h1>
        <p class="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
          Hidden waterfalls, secret trails, untouched beaches —<br>found by explorers like you
        </p>
        <div class="hero-buttons" data-aos="fade-up" data-aos-delay="300">
          <a routerLink="/explore" class="btn-hero-primary">Start Exploring <i class="fas fa-arrow-right"></i></a>
          <a routerLink="/add-place" class="btn-hero-outline"><i class="fas fa-plus"></i> Share a Place</a>
          <button class="btn-hero-surprise" (click)="goSurprise()" [disabled]="surpriseLoading">
            @if (surpriseLoading) { <i class="fas fa-spinner fa-spin"></i> Finding... }
            @else { <i class="fas fa-dice"></i> Surprise Me }
          </button>
        </div>
        <div class="hero-search" data-aos="fade-up" data-aos-delay="400">
          <select [(ngModel)]="searchDistrict" class="search-select">
            <option value="">All Districts</option>
            @for (d of districts; track d) { <option [value]="d">{{ d }}</option> }
          </select>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search hidden gems..." class="search-input" (keyup.enter)="doSearch()">
          <button class="search-btn" (click)="doSearch()"><i class="fas fa-search"></i> Search</button>
        </div>
      </div>
      <div class="scroll-indicator"><div class="scroll-arrow"><i class="fas fa-chevron-down"></i></div></div>
    </section>

    <!-- STATS -->
    <section class="stats-bar">
      <div class="hk-container">
        <div class="stats-grid">
          @for (stat of stats; track stat.label) {
            <div class="stat-item" data-aos="fade-up">
              <span class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-number">{{ stat.value }}</span>
              <p>{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- FEATURED PLACES -->
    <section class="hk-section">
      <div class="hk-container">
        <div class="section-header" data-aos="fade-up">
          <h2 class="section-title">✨ Trending Hidden Gems</h2>
          <p class="section-sub">Handpicked places loved by our explorer community</p>
        </div>
        @if (isLoading) {
          <div class="places-grid">
            @for (i of [1,2,3]; track i) {
              <div class="skeleton-card">
                <div class="sk sk-img"></div>
                <div style="padding:20px"><div class="sk sk-title"></div><div class="sk sk-text"></div></div>
              </div>
            }
          </div>
        } @else {
          <div class="places-grid">
            @for (place of featuredPlaces; track place.id) {
              <app-place-card [place]="place"></app-place-card>
            }
          </div>
        }
        <div class="text-center" style="margin-top:40px" data-aos="fade-up">
          <a routerLink="/explore" class="btn-explore-all">View All Hidden Gems <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="hk-section" style="background:#f8f6f0">
      <div class="hk-container">
        <div class="section-header" data-aos="fade-up">
          <h2 class="section-title">Browse by Category</h2>
          <p class="section-sub">Find exactly the adventure you're looking for</p>
        </div>
        <div class="categories-grid" data-aos="fade-up" data-aos-delay="100">
          @for (cat of categories; track cat.name) {
            <div class="cat-card" (click)="browseCategory(cat.name)">
              <span class="cat-emoji">{{ cat.icon }}</span>
              <span>{{ cat.name }}</span>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- DISTRICTS -->
    <section class="hk-section">
      <div class="hk-container">
        <div class="section-header" data-aos="fade-up">
          <h2 class="section-title">Explore by District</h2>
          <p class="section-sub">Kerala has 14 districts, each with its own hidden treasures</p>
        </div>
        <div class="districts-wrap" data-aos="fade-up" data-aos-delay="100">
          @for (district of districts; track district) {
            <button class="district-pill" (click)="browseDistrict(district)">{{ district }}</button>
          }
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="hk-section" style="background:#f8f6f0">
      <div class="hk-container">
        <div class="section-header" data-aos="fade-up">
          <h2 class="section-title">How It Works</h2>
          <p class="section-sub">Joining our explorer community is simple</p>
        </div>
        <div class="steps-grid">
          @for (step of steps; track step.number) {
            <div class="step-card" data-aos="fade-up" [attr.data-aos-delay]="step.number * 100">
              <div class="step-num">{{ step.number }}</div>
              <span class="step-icon">{{ step.icon }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="cta-banner">
      <div class="hk-container">
        <div class="cta-content" data-aos="fade-up">
          <h2>Know a Hidden Gem? 🌿</h2>
          <p>Be the first to share this place with fellow explorers</p>
          <a routerLink="/add-place" class="btn-cta"><i class="fas fa-plus-circle"></i> Add Your Place</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      height: 100vh; min-height: 600px;
      background-image: url('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=85');
      background-size: cover; background-position: center; background-attachment: fixed;
      position: relative; display: flex; align-items: center; justify-content: center;
    }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg,rgba(27,67,50,0.88),rgba(26,26,46,0.75)); }
    .hero-content { position: relative; z-index: 1; text-align: center; padding: 0 24px; max-width: 800px; width: 100%; }
    .hero-badge { display: inline-block; background: rgba(244,162,97,0.2); border: 1px solid rgba(244,162,97,0.5); color: #F4A261; padding: 8px 20px; border-radius: 50px; font-size: 0.85rem; font-weight: 600; font-family: 'Poppins',sans-serif; margin-bottom: 24px; }
    .hero-title { font-family: 'Playfair Display',serif; font-size: clamp(2.5rem,6vw,4rem); color: white; line-height: 1.1; margin-bottom: 20px; font-weight: 700; }
    .hero-subtitle { font-family: 'Poppins',sans-serif; font-size: 1.1rem; color: rgba(255,255,255,0.85); font-weight: 300; line-height: 1.7; margin-bottom: 36px; }
    .hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px; }
    .btn-hero-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: linear-gradient(135deg,#F4A261,#e76f51); color: white; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 20px rgba(244,162,97,0.4); transition: all 0.3s; }
    .btn-hero-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(244,162,97,0.5); color: white; }
    .btn-hero-outline { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border: 2px solid rgba(255,255,255,0.75); color: white; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 1rem; transition: all 0.3s; }
    .btn-hero-outline:hover { background: rgba(255,255,255,0.15); border-color: white; transform: translateY(-3px); color: white; }
    .btn-hero-surprise { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border: 2px dashed rgba(255,255,255,0.6); color: rgba(255,255,255,0.9); border-radius: 50px; background: transparent; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s; }
    .btn-hero-surprise:hover:not([disabled]) { background: rgba(255,255,255,0.1); border-color: white; transform: translateY(-3px); }
    .btn-hero-surprise[disabled] { opacity: 0.6; cursor: not-allowed; }
    .hero-search { display: flex; background: rgba(255,255,255,0.96); border-radius: 50px; overflow: hidden; max-width: 640px; margin: 0 auto; box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
    .search-select { padding: 14px 16px; border: none; font-family: 'Poppins',sans-serif; font-size: 0.875rem; color: #374151; background: transparent; outline: none; border-right: 1px solid #e5e7eb; min-width: 150px; cursor: pointer; }
    .search-input { flex: 1; padding: 14px 16px; border: none; outline: none; font-family: 'Poppins',sans-serif; font-size: 0.875rem; color: #374151; background: transparent; }
    .search-btn { padding: 14px 24px; background: #1B4332; color: white; border: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s; }
    .search-btn:hover { background: #2D6A4F; }
    .scroll-indicator { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); z-index: 1; }
    .scroll-arrow { color: rgba(255,255,255,0.7); font-size: 1.2rem; animation: bounce 2s infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }

    .stats-bar { background: #0d2f22; padding: 36px 0; }
    .hk-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
    .stat-item { text-align: center; padding: 8px; }
    .stat-icon { font-size: 1.8rem; display: block; margin-bottom: 4px; }
    .stat-number { display: block; font-family: 'Playfair Display',serif; font-size: 2rem; font-weight: 700; color: #E9C46A; }
    .stat-item p { color: rgba(255,255,255,0.7); font-size: 0.8rem; font-family: 'Poppins',sans-serif; margin: 0; }

    .hk-section { padding: 80px 0; }
    .section-header { text-align: center; margin-bottom: 48px; }
    .section-title { font-family: 'Playfair Display',serif; font-size: 2.25rem; color: #2C2C2C; margin-bottom: 12px; display: block; }
    .section-sub { color: #6B7280; font-size: 1rem; font-family: 'Poppins',sans-serif; margin: 0; }

    .places-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
    .skeleton-card { border-radius: 16px; overflow: hidden; background: white; box-shadow: 0 4px 24px rgba(27,67,50,0.1); }
    .sk { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
    .sk-img { height: 220px; border-radius: 0; }
    .sk-title { height: 24px; margin-bottom: 12px; }
    .sk-text { height: 14px; width: 80%; }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    .btn-explore-all { display: inline-flex; align-items: center; gap: 8px; padding: 14px 36px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 20px rgba(27,67,50,0.3); transition: all 0.3s; }
    .btn-explore-all:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(27,67,50,0.4); color: white; }

    .categories-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
    .cat-card { display: flex; flex-direction: column; align-items: center; padding: 28px 16px; border-radius: 16px; background: white; box-shadow: 0 4px 24px rgba(27,67,50,0.08); cursor: pointer; transition: all 0.3s; border: 2px solid transparent; text-align: center; }
    .cat-card:hover { border-color: #2D6A4F; transform: translateY(-6px); box-shadow: 0 12px 40px rgba(27,67,50,0.15); background: linear-gradient(135deg,#1B4332,#2D6A4F); }
    .cat-card:hover .cat-emoji { transform: scale(1.2); }
    .cat-card:hover span:last-child { color: white; }
    .cat-emoji { font-size: 2.5rem; margin-bottom: 12px; display: block; transition: transform 0.3s; }
    .cat-card span:last-child { font-weight: 600; font-size: 0.85rem; color: #2C2C2C; font-family: 'Poppins',sans-serif; transition: color 0.3s; }

    .districts-wrap { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; max-width: 800px; margin: 0 auto; }
    .district-pill { padding: 9px 22px; border-radius: 50px; border: 2px solid #1B4332; color: #1B4332; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.25s; background: transparent; font-family: 'Poppins',sans-serif; }
    .district-pill:hover { background: #1B4332; color: white; transform: translateY(-2px); }

    .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
    .step-card { text-align: center; padding: 40px 28px; border-radius: 16px; background: white; box-shadow: 0 4px 24px rgba(27,67,50,0.08); position: relative; overflow: hidden; }
    .step-num { font-family: 'Playfair Display',serif; font-size: 6rem; font-weight: 700; color: rgba(233,196,106,0.18); position: absolute; top: -10px; right: 12px; line-height: 1; pointer-events: none; }
    .step-icon { font-size: 3rem; margin-bottom: 16px; display: block; }
    .step-card h3 { font-size: 1.2rem; margin-bottom: 12px; color: #1B4332; font-family: 'Playfair Display',serif; }
    .step-card p { color: #6B7280; font-size: 0.875rem; line-height: 1.7; font-family: 'Poppins',sans-serif; margin: 0; }

    .cta-banner { background: linear-gradient(135deg,#1B4332,#2D6A4F); padding: 80px 0; position: relative; overflow: hidden; }
    .cta-content { position: relative; z-index: 1; text-align: center; color: white; }
    .cta-content h2 { font-family: 'Playfair Display',serif; font-size: 2.5rem; color: white; margin-bottom: 12px; }
    .cta-content p { font-size: 1.05rem; opacity: 0.85; margin-bottom: 32px; font-family: 'Poppins',sans-serif; }
    .btn-cta { display: inline-flex; align-items: center; gap: 10px; padding: 15px 36px; background: #F4A261; color: white; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: all 0.3s; }
    .btn-cta:hover { background: #e76f51; transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.25); color: white; }

    .text-center { text-align: center; }

    @media (max-width: 992px) { .places-grid,.categories-grid,.steps-grid { grid-template-columns: repeat(2,1fr); } .stats-grid { grid-template-columns: repeat(2,2fr); gap: 24px; } }
    @media (max-width: 576px) { .places-grid,.steps-grid { grid-template-columns: 1fr; } .categories-grid { grid-template-columns: repeat(2,1fr); } .stats-grid { grid-template-columns: repeat(2,1fr); } .hero-search { flex-direction: column; border-radius: 16px; } .search-select { border-right: none; border-bottom: 1px solid #e5e7eb; min-width: auto; } .hero-buttons { flex-direction: column; align-items: center; } }
  `]
})
export class HomeComponent implements OnInit {
  private placeService = inject(PlaceService);
  private router = inject(Router);

  featuredPlaces: Place[] = [];
  isLoading = true;
  surpriseLoading = false;
  searchQuery = '';
  searchDistrict = '';

  districts = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];
  categories = [{ name: 'Waterfall', icon: '🌊' }, { name: 'Trekking', icon: '🥾' }, { name: 'Viewpoint', icon: '🏔️' }, { name: 'Beach', icon: '🏖️' }, { name: 'Village', icon: '🏘️' }, { name: 'Forest', icon: '🌲' }, { name: 'River', icon: '🏞️' }, { name: 'Heritage', icon: '🏛️' }];
  stats = [{ icon: '🗺️', value: '200+', label: 'Hidden Places' }, { icon: '📍', value: '14', label: 'Districts' }, { icon: '⭐', value: '500+', label: 'Reviews' }, { icon: '👥', value: '1000+', label: 'Explorers' }];
  steps = [{ number: '1', icon: '🔍', title: 'Discover', description: 'Browse hidden gems by district or category.' }, { number: '2', icon: '📸', title: 'Share', description: 'Add your own discovered places with photos.' }, { number: '3', icon: '⭐', title: 'Review', description: 'Rate and review places you visited.' }];

  ngOnInit() {
    this.placeService.getPlaces({ sort: 'latest' }).subscribe({
      next: (r) => { this.featuredPlaces = r.results.slice(0, 3); this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  doSearch() { this.router.navigate(['/explore'], { queryParams: { district: this.searchDistrict || null, search: this.searchQuery || null } }); }
  browseCategory(category: string) { this.router.navigate(['/explore'], { queryParams: { category } }); }
  browseDistrict(district: string) { this.router.navigate(['/explore'], { queryParams: { district } }); }

  goSurprise() {
    this.surpriseLoading = true;
    this.placeService.getSurprise().subscribe({
      next: (p) => { this.surpriseLoading = false; this.router.navigate(['/place', p.id]); },
      error: () => { this.surpriseLoading = false; }
    });
  }
}
