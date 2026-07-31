import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../services/place.service';
import { Place, PlaceFilters } from '../../models/place.model';
import { PlaceCardComponent } from '../../components/place-card/place-card.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PlaceCardComponent],
  template: `
    <div class="page-hero">
      <div class="exp-container">
        <div style="position:relative;z-index:1;color:white;padding-bottom:40px">
          <nav class="breadcrumb"><a routerLink="/">Home</a> <span>›</span> <span>Explore</span></nav>
          <h1>Hidden Gems of Kerala</h1>
          <p>{{ totalCount }} places discovered by explorers</p>
        </div>
      </div>
    </div>

    <div class="explore-layout">
      <div class="exp-container">
        <div class="explore-inner">
          <aside class="filter-sidebar" [class.mobile-open]="filterOpen">
            <div class="filter-card">
              <div class="filter-hdr">
                <h3>🗺️ Filter Places</h3>
                <button class="clear-btn" (click)="clearFilters()">Clear All</button>
              </div>
              <div class="filter-group">
                <label>District</label>
                <select [(ngModel)]="filters.district" class="filter-sel">
                  <option value="">All Districts</option>
                  @for (d of districts; track d) { <option [value]="d">{{ d }}</option> }
                </select>
              </div>
              <div class="filter-group">
                <label>Category</label>
                <select [(ngModel)]="filters.category" class="filter-sel">
                  <option value="">All Categories</option>
                  @for (c of categories; track c.name) { <option [value]="c.name">{{ c.icon }} {{ c.name }}</option> }
                </select>
              </div>
              <div class="filter-group">
                <label>Difficulty</label>
                <div class="diff-btns">
                  <button class="diff-btn easy" [class.active]="filters.difficulty==='Easy'" (click)="toggleDiff('Easy')">🟢 Easy</button>
                  <button class="diff-btn moderate" [class.active]="filters.difficulty==='Moderate'" (click)="toggleDiff('Moderate')">🟡 Moderate</button>
                  <button class="diff-btn hard" [class.active]="filters.difficulty==='Hard'" (click)="toggleDiff('Hard')">🔴 Hard</button>
                </div>
              </div>
              <div class="filter-group">
                <label>Best Time to Visit</label>
                <select [(ngModel)]="filters.best_season" class="filter-sel">
                  <option value="">Any Season</option>
                  @for (s of seasons; track s.value) { <option [value]="s.value">{{ s.icon }} {{ s.label }}</option> }
                </select>
                @if (currentSeasonHint) {
                  <small class="season-hint">🗓️ Currently best: <strong>{{ currentSeasonHint }}</strong></small>
                }
              </div>
              <button class="apply-btn" (click)="applyFilters()"><i class="fas fa-filter"></i> Apply Filters</button>
            </div>
          </aside>

          <main class="places-area">
            <div class="toolbar">
              <div class="search-bar">
                <i class="fas fa-search"></i>
                <input type="text" [(ngModel)]="filters.search" placeholder="Search places..." (keyup.enter)="applyFilters()">
              </div>
              <div class="toolbar-right">
                <select [(ngModel)]="filters.sort" (change)="applyFilters()" class="sort-sel">
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>
                <button class="mobile-filter-btn" (click)="filterOpen=!filterOpen">
                  <i class="fas fa-sliders-h"></i> Filters
                  @if (activeFilterCount > 0) { <span class="f-badge">{{ activeFilterCount }}</span> }
                </button>
              </div>
            </div>

            @if (isLoading) {
              <div class="exp-grid">
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="sk-card"><div class="sk sk-img"></div><div style="padding:20px"><div class="sk sk-title"></div><div class="sk sk-text"></div></div></div>
                }
              </div>
            } @else if (places.length === 0) {
              <div class="empty-state">
                <div style="font-size:4rem;margin-bottom:16px">🔍</div>
                <h3>No hidden gems found</h3>
                <p>Try different filters or be the first to add a place!</p>
                <a routerLink="/add-place" class="btn-add-first"><i class="fas fa-plus"></i> Add a Place</a>
              </div>
            } @else {
              <div class="exp-grid">
                @for (place of places; track place.id) { <app-place-card [place]="place"></app-place-card> }
              </div>
              @if (totalPages > 1) {
                <div class="pagination-bar">
                  <button class="page-btn" [disabled]="currentPage===1" (click)="goToPage(currentPage-1)"><i class="fas fa-chevron-left"></i></button>
                  @for (p of pageNumbers; track p) {
                    <button class="page-btn" [class.active]="p===currentPage" (click)="goToPage(p)">{{ p }}</button>
                  }
                  <button class="page-btn" [disabled]="currentPage===totalPages" (click)="goToPage(currentPage+1)"><i class="fas fa-chevron-right"></i></button>
                </div>
              }
            }
          </main>
        </div>
      </div>
    </div>

    <!-- Surprise Me FAB -->
    <button class="surprise-fab" (click)="goSurprise()" [disabled]="surpriseLoading" title="Take me somewhere hidden!">
      @if (surpriseLoading) { <i class="fas fa-spinner fa-spin"></i> }
      @else { <i class="fas fa-dice"></i> }
    </button>
  `,
  styles: [`
    .page-hero { height: 50vh; min-height: 280px; background-image: url('https://images.unsplash.com/photo-1547751574-d23b2699caf6?w=1600&q=80'); background-size: cover; background-position: center; position: relative; display: flex; align-items: flex-end; padding-top: 70px; }
    .page-hero::before { content:''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(27,67,50,0.88),rgba(26,26,46,0.75)); }
    .exp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; width: 100%; }
    .page-hero h1 { font-family: 'Playfair Display',serif; font-size: 2.5rem; color: white; margin-bottom: 8px; }
    .page-hero p { font-family: 'Poppins',sans-serif; font-size: 1rem; opacity: 0.85; margin: 0; }
    .breadcrumb { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 12px; }
    .breadcrumb a { color: rgba(255,255,255,0.7); text-decoration: none; } .breadcrumb a:hover { color: white; } .breadcrumb span { margin: 0 6px; }
    .explore-layout { padding: 40px 0 80px; background: #f8f6f0; min-height: 60vh; }
    .explore-inner { display: grid; grid-template-columns: 280px 1fr; gap: 32px; align-items: start; }
    .filter-sidebar { position: sticky; top: 90px; }
    .filter-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 24px rgba(27,67,50,0.08); }
    .filter-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .filter-hdr h3 { font-family: 'Playfair Display',serif; font-size: 1.1rem; color: #1B4332; margin: 0; }
    .clear-btn { background: none; border: none; color: #F4A261; font-family: 'Poppins',sans-serif; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .clear-btn:hover { text-decoration: underline; }
    .filter-group { margin-bottom: 20px; }
    .filter-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #6B7280; font-family: 'Poppins',sans-serif; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .filter-sel { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.875rem; outline: none; background: white; cursor: pointer; }
    .filter-sel:focus { border-color: #2D6A4F; }
    .diff-btns { display: flex; flex-direction: column; gap: 8px; }
    .diff-btn { padding: 8px 16px; border-radius: 8px; border: 2px solid #e5e7eb; background: white; font-family: 'Poppins',sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-align: left; transition: all 0.2s; }
    .diff-btn.easy.active { background: rgba(16,185,129,0.1); border-color: #10b981; color: #059669; }
    .diff-btn.moderate.active { background: rgba(245,158,11,0.1); border-color: #f59e0b; color: #d97706; }
    .diff-btn.hard.active { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #dc2626; }
    .diff-btn:hover:not(.active) { border-color: #9ca3af; }
    .apply-btn { width: 100%; padding: 12px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border: none; border-radius: 10px; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; transition: all 0.2s; }
    .apply-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(27,67,50,0.3); }
    .places-area { min-width: 0; }
    .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; }
    .search-bar { flex: 1; display: flex; align-items: center; gap: 10px; background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 10px 16px; min-width: 200px; }
    .search-bar i { color: #9ca3af; }
    .search-bar input { flex: 1; border: none; outline: none; font-family: 'Poppins',sans-serif; font-size: 0.875rem; color: #374151; }
    .toolbar-right { display: flex; gap: 10px; align-items: center; }
    .sort-sel { padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.85rem; background: white; outline: none; cursor: pointer; }
    .mobile-filter-btn { display: none; padding: 10px 16px; background: #1B4332; color: white; border: none; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; align-items: center; gap: 6px; }
    .f-badge { background: #F4A261; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.7rem; display: inline-flex; align-items: center; justify-content: center; margin-left: 4px; }
    .exp-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
    .sk-card { border-radius: 16px; overflow: hidden; background: white; }
    .sk { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
    .sk-img { height: 220px; border-radius: 0; }
    .sk-title { height: 24px; margin-bottom: 12px; }
    .sk-text { height: 14px; width: 80%; }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    .empty-state { text-align: center; padding: 80px 24px; background: white; border-radius: 16px; }
    .empty-state h3 { font-family: 'Playfair Display',serif; color: #2C2C2C; margin-bottom: 8px; }
    .empty-state p { color: #6B7280; font-family: 'Poppins',sans-serif; margin-bottom: 24px; }
    .btn-add-first { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; }
    .btn-add-first:hover { transform: translateY(-2px); color: white; }
    .pagination-bar { display: flex; justify-content: center; gap: 8px; margin-top: 32px; }
    .page-btn { min-width: 40px; height: 40px; border-radius: 8px; border: 2px solid rgba(27,67,50,0.2); background: white; color: #1B4332; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
    .page-btn.active, .page-btn:hover:not([disabled]) { background: #1B4332; border-color: #1B4332; color: white; }
    .page-btn[disabled] { opacity: 0.4; cursor: not-allowed; }
    .season-hint { color: #2D6A4F; font-family: 'Poppins',sans-serif; font-size: 0.75rem; margin-top: 6px; display: block; }
    .surprise-fab { position: fixed; bottom: 32px; right: 32px; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border: none; font-size: 1.4rem; cursor: pointer; box-shadow: 0 6px 24px rgba(27,67,50,0.4); transition: all 0.3s; display: flex; align-items: center; justify-content: center; z-index: 500; }
    .surprise-fab:hover:not([disabled]) { transform: scale(1.15) rotate(-15deg); box-shadow: 0 10px 32px rgba(27,67,50,0.5); }
    .surprise-fab[disabled] { opacity: 0.6; cursor: not-allowed; }
    @media (max-width: 992px) { .explore-inner { grid-template-columns: 1fr; } .filter-sidebar { position: static; display: none; } .filter-sidebar.mobile-open { display: block; } .mobile-filter-btn { display: flex; } .exp-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 576px) { .exp-grid { grid-template-columns: 1fr; } }
  `]
})
export class ExploreComponent implements OnInit {
  private placeService = inject(PlaceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  places: Place[] = [];
  isLoading = true;
  filterOpen = false;
  totalCount = 0;
  currentPage = 1;
  totalPages = 1;

  filters: PlaceFilters = { district: '', category: '', difficulty: '', best_season: '', search: '', sort: 'latest' };

  districts = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];
  categories = [{ name: 'Waterfall', icon: '🌊' }, { name: 'Trekking', icon: '🥾' }, { name: 'Viewpoint', icon: '🏔️' }, { name: 'Beach', icon: '🏖️' }, { name: 'Village', icon: '🏘️' }, { name: 'Forest', icon: '🌲' }, { name: 'River', icon: '🏞️' }, { name: 'Heritage', icon: '🏛️' }];
  seasons = [
    { value: 'Monsoon', label: 'Monsoon (Jun–Aug)', icon: '🌧️' },
    { value: 'Winter', label: 'Winter (Nov–Feb)', icon: '❄️' },
    { value: 'Summer', label: 'Summer (Mar–May)', icon: '☀️' },
    { value: 'Year Round', label: 'Year Round', icon: '📅' },
  ];
  surpriseLoading = false;

  get currentSeasonHint(): string {
    const m = new Date().getMonth() + 1;
    if (m >= 6 && m <= 8) return 'Monsoon';
    if (m >= 11 || m <= 2) return 'Winter';
    if (m >= 3 && m <= 5) return 'Summer';
    return 'Year Round';
  }

  get activeFilterCount() { return [this.filters.district, this.filters.category, this.filters.difficulty, this.filters.best_season].filter(v => v && v.length > 0).length; }
  get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['district']) this.filters.district = params['district'];
      if (params['category']) this.filters.category = params['category'];
      if (params['search']) this.filters.search = params['search'];
      this.loadPlaces();
    });
  }

  loadPlaces() {
    this.isLoading = true;
    this.placeService.getPlaces({ ...this.filters, page: this.currentPage }).subscribe({
      next: (r) => { this.places = r.results; this.totalCount = r.count; this.totalPages = Math.ceil(r.count / 10); this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilters() { this.currentPage = 1; this.filterOpen = false; this.loadPlaces(); }
  clearFilters() { this.filters = { district: '', category: '', difficulty: '', best_season: '', search: '', sort: 'latest' }; this.currentPage = 1; this.loadPlaces(); }
  toggleDiff(d: string) { this.filters.difficulty = this.filters.difficulty === d ? '' : d; }
  goToPage(p: number) { if (p < 1 || p > this.totalPages) return; this.currentPage = p; this.loadPlaces(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  goSurprise() {
    this.surpriseLoading = true;
    const district = this.filters.district || undefined;
    this.placeService.getSurprise(district).subscribe({
      next: (p) => { this.surpriseLoading = false; this.router.navigate(['/place', p.id]); },
      error: () => { this.surpriseLoading = false; }
    });
  }
}
