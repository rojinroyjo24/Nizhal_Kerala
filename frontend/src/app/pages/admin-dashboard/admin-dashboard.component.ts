import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, DashboardStats, AdminPlaceItem, AdminUser } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-container">

        <!-- Header -->
        <div class="admin-header">
          <div>
            <h1>🛡️ Admin Dashboard</h1>
            <p>Manage Nizhal – Hidden Kerala Explorer — approve places, view users, monitor activity</p>
          </div>
          <div class="header-tabs">
            <button [class.active]="activeTab==='overview'" (click)="activeTab='overview'"><i class="fas fa-chart-pie"></i> Overview</button>
            <button [class.active]="activeTab==='places'" (click)="activeTab='places'; loadPlaces()"><i class="fas fa-map-marker-alt"></i> Places</button>
            <button [class.active]="activeTab==='users'" (click)="activeTab='users'; loadUsers()"><i class="fas fa-users"></i> Users</button>
          </div>
        </div>

        <!-- Stats Cards -->
        @if (activeTab === 'overview') {
          @if (!stats) {
            <div class="loading-state"><div class="spinner"></div></div>
          } @else {
            <div class="stats-grid">
              <div class="stat-card total"><div class="stat-icon">🗺️</div><div class="stat-info"><span class="stat-num">{{ stats.total_places }}</span><span>Total Places</span></div></div>
              <div class="stat-card pending"><div class="stat-icon">⏳</div><div class="stat-info"><span class="stat-num">{{ stats.pending_places }}</span><span>Pending Review</span></div></div>
              <div class="stat-card approved"><div class="stat-icon">✅</div><div class="stat-info"><span class="stat-num">{{ stats.approved_places }}</span><span>Approved</span></div></div>
              <div class="stat-card rejected"><div class="stat-icon">❌</div><div class="stat-info"><span class="stat-num">{{ stats.rejected_places }}</span><span>Rejected</span></div></div>
              <div class="stat-card users"><div class="stat-icon">👥</div><div class="stat-info"><span class="stat-num">{{ stats.total_users }}</span><span>Users</span></div></div>
              <div class="stat-card reviews"><div class="stat-icon">⭐</div><div class="stat-info"><span class="stat-num">{{ stats.total_reviews }}</span><span>Reviews</span></div></div>
            </div>
            <div class="section-title">Recent Submissions</div>
            <div class="places-table-wrap">
              <table class="places-table">
                <thead><tr><th>Place</th><th>District</th><th>Category</th><th>Status</th><th>Submitted By</th><th>Actions</th></tr></thead>
                <tbody>
                  @for (place of stats.recent_places; track place.id) {
                    <tr>
                      <td class="place-name"><a [routerLink]="['/place', place.id]">{{ place.title }}</a></td>
                      <td>{{ place.district }}</td>
                      <td>{{ place.category }}</td>
                      <td><span [class]="'status-badge ' + place.status">{{ place.status }}</span></td>
                      <td>{{ place.added_by?.full_name || place.added_by?.username }}</td>
                      <td class="action-btns">
                        @if (place.status !== 'approved') {
                          <button class="btn-approve" (click)="approve(place.id, stats.recent_places)">✅</button>
                        }
                        @if (place.status !== 'rejected') {
                          <button class="btn-reject" (click)="reject(place.id, stats.recent_places)">❌</button>
                        }
                        <button class="btn-delete" (click)="deletePlaceFromList(place.id, stats.recent_places)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <!-- Places Tab -->
        @if (activeTab === 'places') {
          <div class="tab-toolbar">
            <div class="status-filters">
              <button [class.active]="placeFilter===''" (click)="placeFilter=''; loadPlaces()">All ({{ places.length }})</button>
              <button class="f-pending" [class.active]="placeFilter==='pending'" (click)="placeFilter='pending'; loadPlaces()">⏳ Pending</button>
              <button class="f-approved" [class.active]="placeFilter==='approved'" (click)="placeFilter='approved'; loadPlaces()">✅ Approved</button>
              <button class="f-rejected" [class.active]="placeFilter==='rejected'" (click)="placeFilter='rejected'; loadPlaces()">❌ Rejected</button>
            </div>
            <input class="search-input" type="text" [(ngModel)]="placeSearch" placeholder="🔍 Search places...">
          </div>

          @if (placesLoading) {
            <div class="loading-state"><div class="spinner"></div></div>
          } @else {
            <div class="places-table-wrap">
              <table class="places-table">
                <thead><tr><th>Place</th><th>District</th><th>Category</th><th>Difficulty</th><th>Status</th><th>Submitted By</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  @for (place of filteredPlaces; track place.id) {
                    <tr>
                      <td class="place-name">
                        <div class="place-thumb">
                          @if (place.image_url) { <img [src]="place.image_url" [alt]="place.title"> }
                          @else { <div class="no-img">📍</div> }
                        </div>
                        <a [routerLink]="['/place', place.id]">{{ place.title }}</a>
                      </td>
                      <td>{{ place.district }}</td>
                      <td>{{ place.category }}</td>
                      <td><span [class]="'diff-badge diff-' + place.difficulty.toLowerCase()">{{ place.difficulty }}</span></td>
                      <td><span [class]="'status-badge ' + place.status">{{ place.status }}</span></td>
                      <td>{{ place.added_by?.full_name || place.added_by?.username }}</td>
                      <td class="date-cell">{{ place.created_at | date:'MMM d, y' }}</td>
                      <td class="action-btns">
                        @if (place.status !== 'approved') {
                          <button class="btn-approve" title="Approve" (click)="approve(place.id, places)">✅ Approve</button>
                        }
                        @if (place.status !== 'rejected') {
                          <button class="btn-reject" title="Reject" (click)="reject(place.id, places)">❌ Reject</button>
                        }
                        @if (place.status !== 'pending') {
                          <button class="btn-pending" title="Reset to Pending" (click)="setPending(place.id, places)">⏳</button>
                        }
                        <button class="btn-delete" title="Delete" (click)="deletePlaceFromList(place.id, places)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              @if (filteredPlaces.length === 0) {
                <div class="empty-table">No places found.</div>
              }
            </div>
          }
        }

        <!-- Users Tab -->
        @if (activeTab === 'users') {
          @if (usersLoading) {
            <div class="loading-state"><div class="spinner"></div></div>
          } @else {
            <div class="places-table-wrap">
              <table class="places-table">
                <thead><tr><th>User</th><th>Email</th><th>Username</th><th>Role</th><th>Places</th><th>Joined</th></tr></thead>
                <tbody>
                  @for (user of users; track user.id) {
                    <tr>
                      <td>
                        <div class="user-row">
                          <div class="user-av">{{ getInitials(user.full_name || user.username) }}</div>
                          <span>{{ user.full_name }}</span>
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>{{ user.username }}</td>
                      <td><span [class]="user.is_staff ? 'role-badge admin' : 'role-badge user'">{{ user.is_staff ? '🛡️ Admin' : '👤 User' }}</span></td>
                      <td><span class="places-count">{{ user.places_count }}</span></td>
                      <td class="date-cell">{{ user.date_joined | date:'MMM d, y' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

      </div>
    </div>
  `,
  styles: [`
    .admin-page { min-height: 100vh; background: #f1f5f9; padding: 90px 0 60px; }
    .admin-container { max-width: 1300px; margin: 0 auto; padding: 0 24px; }

    .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .admin-header h1 { font-family: 'Playfair Display',serif; font-size: 2rem; color: #1B4332; margin-bottom: 4px; }
    .admin-header p { color: #6B7280; font-family: 'Poppins',sans-serif; font-size: 0.9rem; margin: 0; }
    .header-tabs { display: flex; gap: 8px; background: white; padding: 6px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header-tabs button { padding: 8px 18px; border: none; border-radius: 8px; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.85rem; cursor: pointer; background: transparent; color: #6B7280; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
    .header-tabs button.active { background: #1B4332; color: white; }

    .stats-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 14px; border-left: 4px solid #e5e7eb; }
    .stat-card.total { border-left-color: #1B4332; }
    .stat-card.pending { border-left-color: #f59e0b; }
    .stat-card.approved { border-left-color: #10b981; }
    .stat-card.rejected { border-left-color: #ef4444; }
    .stat-card.users { border-left-color: #6366f1; }
    .stat-card.reviews { border-left-color: #E9C46A; }
    .stat-icon { font-size: 1.8rem; flex-shrink: 0; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-num { font-family: 'Playfair Display',serif; font-size: 2rem; font-weight: 700; color: #1a1a2e; line-height: 1; }
    .stat-info span:last-child { font-family: 'Poppins',sans-serif; font-size: 0.72rem; color: #6B7280; margin-top: 2px; }

    .section-title { font-family: 'Playfair Display',serif; font-size: 1.3rem; color: #1B4332; margin-bottom: 16px; }

    .tab-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .status-filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .status-filters button { padding: 7px 16px; border: 2px solid #e5e7eb; border-radius: 50px; font-family: 'Poppins',sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; background: white; color: #6B7280; transition: all 0.2s; }
    .status-filters button.active, .status-filters button:hover { background: #1B4332; color: white; border-color: #1B4332; }
    .status-filters button.f-pending.active { background: #f59e0b; border-color: #f59e0b; }
    .status-filters button.f-approved.active { background: #10b981; border-color: #10b981; }
    .status-filters button.f-rejected.active { background: #ef4444; border-color: #ef4444; }
    .search-input { padding: 9px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.875rem; outline: none; min-width: 250px; }
    .search-input:focus { border-color: #1B4332; }

    .places-table-wrap { background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
    .places-table { width: 100%; border-collapse: collapse; font-family: 'Poppins',sans-serif; }
    .places-table thead { background: #1B4332; color: white; }
    .places-table th { padding: 14px 16px; text-align: left; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .places-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.875rem; color: #374151; }
    .places-table tbody tr:hover { background: #f8f6f0; }
    .places-table tbody tr:last-child td { border-bottom: none; }

    .place-name { display: flex; align-items: center; gap: 10px; }
    .place-name a { color: #1B4332; text-decoration: none; font-weight: 600; }
    .place-name a:hover { text-decoration: underline; }
    .place-thumb { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
    .place-thumb img { width: 100%; height: 100%; object-fit: cover; }

    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 50px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
    .status-badge.pending { background: rgba(245,158,11,0.15); color: #d97706; }
    .status-badge.approved { background: rgba(16,185,129,0.15); color: #059669; }
    .status-badge.rejected { background: rgba(239,68,68,0.15); color: #dc2626; }

    .diff-badge { display: inline-block; padding: 3px 10px; border-radius: 50px; font-size: 0.72rem; font-weight: 700; }
    .diff-badge.diff-easy { background: rgba(16,185,129,0.12); color: #059669; }
    .diff-badge.diff-moderate { background: rgba(245,158,11,0.12); color: #d97706; }
    .diff-badge.diff-hard { background: rgba(239,68,68,0.12); color: #dc2626; }

    .action-btns { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .btn-approve { padding: 4px 10px; background: rgba(16,185,129,0.1); border: 1px solid #10b981; color: #059669; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Poppins',sans-serif; }
    .btn-approve:hover { background: #10b981; color: white; }
    .btn-reject { padding: 4px 10px; background: rgba(239,68,68,0.1); border: 1px solid #ef4444; color: #dc2626; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Poppins',sans-serif; }
    .btn-reject:hover { background: #ef4444; color: white; }
    .btn-pending { padding: 4px 10px; background: rgba(245,158,11,0.1); border: 1px solid #f59e0b; color: #d97706; border-radius: 6px; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; }
    .btn-pending:hover { background: #f59e0b; color: white; }
    .btn-delete { padding: 4px 8px; background: rgba(100,100,100,0.1); border: 1px solid #9ca3af; color: #6B7280; border-radius: 6px; font-size: 0.82rem; cursor: pointer; transition: all 0.2s; }
    .btn-delete:hover { background: #ef4444; border-color: #ef4444; color: white; }

    .date-cell { color: #9ca3af; font-size: 0.8rem; }
    .empty-table { text-align: center; padding: 40px; color: #9ca3af; font-family: 'Poppins',sans-serif; }
    .loading-state { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #1B4332; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .user-row { display: flex; align-items: center; gap: 10px; }
    .user-av { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; font-family: 'Poppins',sans-serif; }
    .role-badge { display: inline-block; padding: 3px 10px; border-radius: 50px; font-size: 0.72rem; font-weight: 700; }
    .role-badge.admin { background: rgba(99,102,241,0.15); color: #4f46e5; }
    .role-badge.user { background: rgba(107,114,128,0.12); color: #374151; }
    .places-count { font-weight: 700; color: #1B4332; }

    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3,1fr); } }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2,1fr); } .places-table { font-size: 0.78rem; } .places-table th, .places-table td { padding: 8px 10px; } }
    @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  activeTab = 'overview';
  stats: DashboardStats | null = null;
  places: AdminPlaceItem[] = [];
  users: AdminUser[] = [];
  placesLoading = false;
  usersLoading = false;
  placeFilter = '';
  placeSearch = '';

  get filteredPlaces(): AdminPlaceItem[] {
    let result = this.places;
    if (this.placeSearch) {
      const q = this.placeSearch.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe({
      next: (s) => { this.stats = s; },
      error: () => { this.toastService.error('Failed to load dashboard stats.'); }
    });
  }

  loadPlaces() {
    this.placesLoading = true;
    this.adminService.getAdminPlaces(this.placeFilter || undefined).subscribe({
      next: (r) => { this.places = r.results; this.placesLoading = false; },
      error: () => { this.placesLoading = false; }
    });
  }

  loadUsers() {
    this.usersLoading = true;
    this.adminService.getAdminUsers().subscribe({
      next: (r) => { this.users = r.results; this.usersLoading = false; },
      error: () => { this.usersLoading = false; }
    });
  }

  approve(id: number, list: any[]) {
    this.adminService.updatePlaceStatus(id, 'approve').subscribe({
      next: () => {
        const p = list.find(x => x.id === id);
        if (p) p.status = 'approved';
        this.toastService.success('Place approved! ✅');
        if (this.stats) this.stats.approved_places++;
        if (this.stats && this.stats.pending_places > 0) this.stats.pending_places--;
      },
      error: () => this.toastService.error('Failed to approve place.')
    });
  }

  reject(id: number, list: any[]) {
    this.adminService.updatePlaceStatus(id, 'reject').subscribe({
      next: () => {
        const p = list.find(x => x.id === id);
        if (p) p.status = 'rejected';
        this.toastService.error('Place rejected. ❌');
      },
      error: () => this.toastService.error('Failed to reject place.')
    });
  }

  setPending(id: number, list: any[]) {
    this.adminService.updatePlaceStatus(id, 'pending').subscribe({
      next: () => {
        const p = list.find(x => x.id === id);
        if (p) p.status = 'pending';
        this.toastService.info('Place reset to pending.');
      },
      error: () => this.toastService.error('Failed to update place.')
    });
  }

  deletePlaceFromList(id: number, list: any[]) {
    if (!confirm('Are you sure you want to delete this place?')) return;
    this.adminService.deletePlace(id).subscribe({
      next: () => {
        const idx = list.findIndex(x => x.id === id);
        if (idx > -1) list.splice(idx, 1);
        this.toastService.success('Place deleted.');
        if (this.stats) this.stats.total_places--;
      },
      error: () => this.toastService.error('Failed to delete place.')
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }
}
