import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="notif-page">
      <div class="notif-container">
        <div class="page-hdr">
          <h1>🔔 Notifications</h1>
          <button class="mark-all-btn" (click)="markAllRead()" [disabled]="unreadCount===0">
            Mark all as read
          </button>
        </div>
        @if (isLoading) {
          <div class="loading"><div class="spinner"></div></div>
        } @else if (notifications.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>We'll let you know when something happens!</p>
            <a routerLink="/explore" class="btn-explore">Explore Places</a>
          </div>
        } @else {
          <div class="notif-list">
            @for (n of notifications; track n.id) {
              <div class="notif-card" [class.unread]="!n.is_read" (click)="open(n)">
                <div class="notif-strip" [class]="'strip-' + n.notification_type"></div>
                <div class="notif-icon">{{ getIcon(n.notification_type) }}</div>
                <div class="notif-body">
                  <div class="notif-title">{{ n.title }}</div>
                  <div class="notif-msg">{{ n.message }}</div>
                  @if (n.place_title) {
                    <div class="notif-place">📍 {{ n.place_title }}</div>
                  }
                  <div class="notif-time">{{ n.time_ago }}</div>
                </div>
                @if (!n.is_read) { <div class="unread-dot"></div> }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notif-page { min-height: 100vh; background: #f8f6f0; padding: 100px 0 80px; }
    .notif-container { max-width: 720px; margin: 0 auto; padding: 0 24px; }
    .page-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
    .page-hdr h1 { font-family: 'Playfair Display',serif; font-size: 2rem; color: #1B4332; margin: 0; }
    .mark-all-btn { padding: 9px 20px; background: #1B4332; color: white; border: none; border-radius: 50px; font-family: 'Poppins',sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .mark-all-btn:hover:not([disabled]) { background: #2D6A4F; transform: translateY(-1px); }
    .mark-all-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .loading { display: flex; justify-content: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #1B4332; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 80px 24px; background: white; border-radius: 20px; box-shadow: 0 4px 24px rgba(27,67,50,0.08); }
    .empty-icon { font-size: 4rem; margin-bottom: 16px; }
    .empty-state h3 { font-family: 'Playfair Display',serif; color: #2C2C2C; margin-bottom: 8px; }
    .empty-state p { color: #6B7280; font-family: 'Poppins',sans-serif; margin-bottom: 24px; }
    .btn-explore { display: inline-flex; padding: 12px 28px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; }
    .btn-explore:hover { transform: translateY(-2px); color: white; }
    .notif-list { display: flex; flex-direction: column; gap: 12px; }
    .notif-card { display: flex; gap: 16px; align-items: flex-start; background: white; border-radius: 14px; padding: 18px; box-shadow: 0 2px 12px rgba(27,67,50,0.06); cursor: pointer; transition: all 0.2s; border: 1px solid transparent; position: relative; overflow: hidden; }
    .notif-card:hover { box-shadow: 0 6px 24px rgba(27,67,50,0.12); transform: translateY(-2px); }
    .notif-card.unread { background: rgba(27,67,50,0.03); border-color: rgba(27,67,50,0.12); }
    .notif-strip { width: 4px; border-radius: 2px; align-self: stretch; flex-shrink: 0; min-height: 40px; }
    .strip-place_approved { background: #10b981; }
    .strip-place_rejected { background: #ef4444; }
    .strip-new_review { background: #E9C46A; }
    .strip-review_reply { background: #3b82f6; }
    .strip-place_reported, .strip-report_resolved { background: #8b5cf6; }
    .notif-icon { font-size: 1.5rem; flex-shrink: 0; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-family: 'Poppins',sans-serif; font-size: 0.9rem; font-weight: 700; color: #2C2C2C; margin-bottom: 4px; }
    .notif-msg { font-family: 'Poppins',sans-serif; font-size: 0.82rem; color: #4b5563; line-height: 1.5; margin-bottom: 6px; }
    .notif-place { font-family: 'Poppins',sans-serif; font-size: 0.78rem; color: #2D6A4F; font-weight: 600; margin-bottom: 4px; }
    .notif-time { font-family: 'Poppins',sans-serif; font-size: 0.75rem; color: #9ca3af; }
    .unread-dot { width: 10px; height: 10px; border-radius: 50%; background: #1B4332; flex-shrink: 0; margin-top: 4px; }
  `]
})
export class NotificationsComponent implements OnInit {
  private notifService = inject(NotificationService);
  private router = inject(Router);

  notifications: Notification[] = [];
  isLoading = true;
  get unreadCount() { return this.notifications.filter(n => !n.is_read).length; }

  ngOnInit() {
    this.notifService.getNotifications().subscribe({
      next: (r) => { this.notifications = r.results; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  open(n: Notification) {
    if (!n.is_read) {
      this.notifService.markRead(n.id).subscribe({ next: () => { n.is_read = true; this.notifService.unreadCount$.next(this.unreadCount); } });
    }
    if (n.place_id) this.router.navigate(['/place', n.place_id]);
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe({
      next: () => { this.notifications.forEach(n => n.is_read = true); this.notifService.unreadCount$.next(0); }
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'place_approved': '✅', 'place_rejected': '❌', 'new_review': '⭐',
      'review_reply': '💬', 'place_reported': '🚩', 'report_resolved': '🛡️'
    };
    return icons[type] || '🔔';
  }
}
