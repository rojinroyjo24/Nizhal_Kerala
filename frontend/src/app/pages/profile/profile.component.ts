import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PlaceService } from '../../services/place.service';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { Place } from '../../models/place.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-container">

        <!-- Profile Hero Card -->
        <div class="profile-hero-card">
          <div class="profile-avatar-section">
            <div class="avatar-circle">{{ getInitials() }}</div>
            <div class="avatar-info">
              @if (!editMode) {
                <h1>{{ user?.full_name || user?.username }}</h1>
                <p class="username">&#64;{{ user?.username }}</p>
                <p class="email"><i class="fas fa-envelope"></i> {{ user?.email }}</p>
                <p class="joined"><i class="fas fa-calendar-alt"></i> Explorer since {{ user?.date_joined | date:'MMMM y' }}</p>
                <div class="profile-badges">
                  @if (user?.is_staff) { <span class="badge-admin">🛡️ Admin</span> }
                  <span class="badge-explorer">🌿 Explorer</span>
                  @if (myStats.approved > 0) { <span class="badge-contrib">📍 {{ myStats.approved }} Places Shared</span> }
                </div>
              } @else {
                <div class="edit-form">
                  <div class="edit-row">
                    <div class="field"><label>First Name</label><input [(ngModel)]="editData.first_name" placeholder="First Name"></div>
                    <div class="field"><label>Last Name</label><input [(ngModel)]="editData.last_name" placeholder="Last Name"></div>
                  </div>
                  <div class="edit-actions">
                    <button class="btn-save" (click)="saveProfile()" [disabled]="isSaving">
                      @if (isSaving) { Saving... } @else { <i class="fas fa-check"></i> Save Changes }
                    </button>
                    <button class="btn-cancel" (click)="editMode=false">Cancel</button>
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="profile-hero-actions">
            @if (!editMode) {
              <button class="btn-edit" (click)="startEdit()"><i class="fas fa-edit"></i> Edit Profile</button>
            }
            @if (user?.is_staff) {
              <a routerLink="/admin-dashboard" class="btn-admin"><i class="fas fa-shield-alt"></i> Admin Dashboard</a>
            }
          </div>
        </div>

        <!-- Stats Strip -->
        <div class="stats-strip">
          <div class="strip-stat"><span class="sn">{{ myStats.total }}</span><span>Total Submitted</span></div>
          <div class="strip-stat approved"><span class="sn">{{ myStats.approved }}</span><span>✅ Approved</span></div>
          <div class="strip-stat pending"><span class="sn">{{ myStats.pending }}</span><span>⏳ Pending</span></div>
          <div class="strip-stat rejected"><span class="sn">{{ myStats.rejected }}</span><span>❌ Rejected</span></div>
        </div>

        <!-- My Places -->
        <div class="section-card">
          <div class="section-hdr">
            <h2>📍 My Submitted Places</h2>
            <a routerLink="/add-place" class="btn-add-place"><i class="fas fa-plus"></i> Add New Place</a>
          </div>

          @if (placesLoading) {
            <div class="loading-state"><div class="spinner"></div></div>
          } @else if (myPlaces.length === 0) {
            <div class="empty-places">
              <span style="font-size:3rem">🗺️</span>
              <h3>No places submitted yet</h3>
              <p>Be the first to share a hidden Kerala gem!</p>
              <a routerLink="/add-place" class="btn-first-place"><i class="fas fa-plus-circle"></i> Add Your First Place</a>
            </div>
          } @else {
            <div class="my-places-grid">
              @for (place of myPlaces; track place.id) {
                <div class="my-place-card">
                  <div class="mpc-img">
                    <img [src]="place.image_url || getDefaultImg(place.category)" [alt]="place.title" (error)="onImgError($event, place.category)">
                    <span [class]="'mpc-status ' + place.status">{{ getStatusLabel(place.status || '') }}</span>
                  </div>
                  <div class="mpc-body">
                    <h4>{{ place.title }}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> {{ place.district }} · {{ place.category }}</p>
                    <div class="mpc-footer">
                      <span class="mpc-date">{{ place.created_at | date:'MMM d, y' }}</span>
                      <div class="mpc-actions">
                        <a [routerLink]="['/edit-place', place.id]" class="mpc-edit"><i class="fas fa-edit"></i> Edit</a>
                        <a [routerLink]="['/place', place.id]" class="mpc-view">View <i class="fas fa-arrow-right"></i></a>
                      </div>
                    </div>
                    @if (place.status === 'pending') {
                      <div class="pending-notice">⏳ Awaiting admin approval before going public</div>
                    }
                    @if (place.status === 'rejected') {
                      <div class="rejected-notice">❌ This place was rejected by admin</div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-page { min-height: 100vh; background: #f1f5f9; padding: 90px 0 60px; }
    .profile-container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }

    .profile-hero-card { background: white; border-radius: 20px; padding: 36px; box-shadow: 0 4px 24px rgba(27,67,50,0.08); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 24px; }
    .profile-avatar-section { display: flex; gap: 28px; align-items: flex-start; flex: 1; }
    .avatar-circle { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display',serif; font-size: 2.5rem; font-weight: 700; flex-shrink: 0; box-shadow: 0 8px 24px rgba(27,67,50,0.3); }
    .avatar-info h1 { font-family: 'Playfair Display',serif; font-size: 1.8rem; color: #1B4332; margin-bottom: 4px; }
    .username { font-family: 'Poppins',sans-serif; color: #6B7280; font-size: 0.875rem; margin-bottom: 8px; }
    .email, .joined { font-family: 'Poppins',sans-serif; font-size: 0.85rem; color: #6B7280; margin-bottom: 4px; }
    .email i, .joined i { color: #1B4332; margin-right: 6px; }
    .profile-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .badge-admin, .badge-explorer, .badge-contrib { display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.78rem; font-weight: 600; font-family: 'Poppins',sans-serif; }
    .badge-admin { background: rgba(99,102,241,0.12); color: #4f46e5; }
    .badge-explorer { background: rgba(27,67,50,0.1); color: #1B4332; }
    .badge-contrib { background: rgba(244,162,97,0.15); color: #e76f51; }
    .profile-hero-actions { display: flex; flex-direction: column; gap: 10px; }
    .btn-edit { padding: 10px 20px; border: 2px solid #1B4332; border-radius: 10px; color: #1B4332; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.875rem; cursor: pointer; background: transparent; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .btn-edit:hover { background: #1B4332; color: white; }
    .btn-admin { padding: 10px 20px; background: linear-gradient(135deg,#4f46e5,#7c3aed); color: white; border-radius: 10px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .btn-admin:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(79,70,229,0.3); color: white; }
    .edit-form { margin-top: 4px; }
    .edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .field label { display: block; font-size: 0.78rem; font-weight: 600; color: #6B7280; font-family: 'Poppins',sans-serif; margin-bottom: 4px; }
    .field input { width: 100%; padding: 9px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Poppins',sans-serif; font-size: 0.875rem; outline: none; }
    .field input:focus { border-color: #1B4332; }
    .edit-actions { display: flex; gap: 10px; }
    .btn-save { padding: 9px 20px; background: #1B4332; color: white; border: none; border-radius: 8px; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel { padding: 9px 20px; border: 2px solid #e5e7eb; border-radius: 8px; background: transparent; font-family: 'Poppins',sans-serif; font-size: 0.875rem; cursor: pointer; color: #6B7280; }

    .stats-strip { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 20px; }
    .strip-stat { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); text-align: center; border-top: 3px solid #e5e7eb; }
    .strip-stat.approved { border-top-color: #10b981; }
    .strip-stat.pending { border-top-color: #f59e0b; }
    .strip-stat.rejected { border-top-color: #ef4444; }
    .sn { display: block; font-family: 'Playfair Display',serif; font-size: 2.2rem; font-weight: 700; color: #1a1a2e; }
    .strip-stat span:last-child { font-family: 'Poppins',sans-serif; font-size: 0.78rem; color: #6B7280; margin-top: 4px; display: block; }

    .section-card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(27,67,50,0.08); }
    .section-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .section-hdr h2 { font-family: 'Playfair Display',serif; font-size: 1.5rem; color: #1B4332; margin: 0; }
    .btn-add-place { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border-radius: 10px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
    .btn-add-place:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(27,67,50,0.3); color: white; }
    .loading-state { display: flex; justify-content: center; padding: 40px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #1B4332; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-places { text-align: center; padding: 48px; }
    .empty-places h3 { font-family: 'Playfair Display',serif; color: #2C2C2C; margin-bottom: 8px; }
    .empty-places p { color: #6B7280; font-family: 'Poppins',sans-serif; margin-bottom: 20px; }
    .btn-first-place { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; }
    .btn-first-place:hover { transform: translateY(-2px); color: white; }
    .my-places-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
    .my-place-card { border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.25s; }
    .my-place-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(27,67,50,0.12); }
    .mpc-img { position: relative; height: 160px; overflow: hidden; }
    .mpc-img img { width: 100%; height: 100%; object-fit: cover; }
    .mpc-status { position: absolute; top: 10px; right: 10px; padding: 3px 10px; border-radius: 50px; font-size: 0.72rem; font-weight: 700; font-family: 'Poppins',sans-serif; }
    .mpc-status.approved { background: rgba(16,185,129,0.9); color: white; }
    .mpc-status.pending { background: rgba(245,158,11,0.9); color: white; }
    .mpc-status.rejected { background: rgba(239,68,68,0.9); color: white; }
    .mpc-body { padding: 16px; }
    .mpc-body h4 { font-family: 'Playfair Display',serif; font-size: 1rem; color: #2C2C2C; margin-bottom: 4px; }
    .mpc-body p { font-family: 'Poppins',sans-serif; font-size: 0.78rem; color: #6B7280; margin-bottom: 10px; }
    .mpc-body p i { color: #2D6A4F; margin-right: 3px; }
    .mpc-footer { display: flex; justify-content: space-between; align-items: center; }
    .mpc-date { font-size: 0.75rem; color: #9ca3af; font-family: 'Poppins',sans-serif; }
    .mpc-actions { display: flex; align-items: center; gap: 10px; }
    .mpc-edit { color: #6B7280; font-size: 0.8rem; font-weight: 600; text-decoration: none; font-family: 'Poppins',sans-serif; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
    .mpc-edit:hover { color: #1B4332; }
    .mpc-view { color: #F4A261; font-size: 0.8rem; font-weight: 600; text-decoration: none; font-family: 'Poppins',sans-serif; display: flex; align-items: center; gap: 4px; }
    .pending-notice, .rejected-notice { font-size: 0.75rem; font-family: 'Poppins',sans-serif; padding: 6px 10px; border-radius: 6px; margin-top: 8px; }
    .pending-notice { background: rgba(245,158,11,0.1); color: #d97706; }
    .rejected-notice { background: rgba(239,68,68,0.1); color: #dc2626; }

    @media (max-width: 768px) { .profile-avatar-section { flex-direction: column; } .stats-strip { grid-template-columns: repeat(2,1fr); } .my-places-grid { grid-template-columns: 1fr; } .edit-row { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  user: User | null = null;
  myPlaces: (Place & { status?: string })[] = [];
  myStats = { total: 0, approved: 0, pending: 0, rejected: 0 };
  placesLoading = true;
  editMode = false;
  isSaving = false;
  editData = { first_name: '', last_name: '' };

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.loadMyPlaces();
  }

  loadMyPlaces() {
    this.http.get<any>(`${environment.apiUrl}/auth/my-places/`).subscribe({
      next: (r) => {
        this.myStats = r.stats;
        this.myPlaces = r.results;
        this.placesLoading = false;
      },
      error: () => { this.placesLoading = false; }
    });
  }

  startEdit() {
    this.editData.first_name = this.user?.first_name || '';
    this.editData.last_name = this.user?.last_name || '';
    this.editMode = true;
  }

  saveProfile() {
    this.isSaving = true;
    this.http.patch<User>(`${environment.apiUrl}/auth/profile/`, this.editData).subscribe({
      next: (u) => {
        this.user = u;
        localStorage.setItem('hk_user', JSON.stringify(u));
        this.editMode = false;
        this.isSaving = false;
        this.toastService.success('Profile updated! 🌿');
      },
      error: () => { this.isSaving = false; this.toastService.error('Failed to update profile.'); }
    });
  }

  getInitials(): string {
    const name = this.user?.full_name || this.user?.username || '?';
    return name.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusLabel(status: string): string {
    return { approved: '✅ Approved', pending: '⏳ Pending', rejected: '❌ Rejected' }[status] || status;
  }

  getDefaultImg(category: string): string {
    const imgs: Record<string, string> = {
      'Waterfall': 'https://images.unsplash.com/photo-1591001776742-3b08b67b7b9f?w=400&q=80',
      'Trekking': 'https://images.unsplash.com/photo-1580547283-d5e4c38c9f59?w=400&q=80',
      'Viewpoint': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80',
      'Beach': 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=400&q=80',
    };
    return imgs[category] || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80';
  }

  onImgError(event: Event, category: string) {
    (event.target as HTMLImageElement).src = this.getDefaultImg(category);
  }
}
