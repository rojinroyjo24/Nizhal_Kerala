import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar-kerala" [class.scrolled]="isScrolled">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">🌿</span>
          <span class="brand-text">
            <span class="brand-main">NIZHAL</span>
            <span class="brand-sub">നിഴൽ</span>
          </span>
        </a>

        <div class="nav-links" [class.mobile-visible]="mobileMenuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link" (click)="closeMobileMenu()">Home</a>
          <a routerLink="/explore" routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">Explore</a>
          <a routerLink="/add-place" routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">Add Place</a>

          <div class="nav-auth">
            @if (currentUser) {
              <!-- Notification Bell -->
              <div class="notif-bell" [class.open]="notifDropOpen">
                <button class="bell-btn" (click)="toggleNotifDrop()" title="Notifications">
                  <i class="fas fa-bell"></i>
                  @if (unreadCount > 0) {
                    <span class="bell-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
                  }
                </button>
                @if (notifDropOpen) {
                  <div class="notif-dropdown">
                    <div class="notif-hdr">
                      <span class="notif-title">Notifications</span>
                      <button class="mark-all-btn" (click)="markAllRead()">Mark all read</button>
                    </div>
                    <div class="notif-list">
                      @if (notifications.length === 0) {
                        <div class="notif-empty">No notifications yet 🔔</div>
                      } @else {
                        @for (n of notifications.slice(0, 8); track n.id) {
                          <div class="notif-item" [class.unread]="!n.is_read" (click)="openNotif(n)">
                            <div class="notif-dot" [class]="'dot-' + n.notification_type"></div>
                            <div class="notif-body">
                              <span class="notif-item-title">{{ n.title }}</span>
                              <span class="notif-msg">{{ n.message }}</span>
                              <span class="notif-time">{{ n.time_ago }}</span>
                            </div>
                          </div>
                        }
                      }
                    </div>
                    <a routerLink="/notifications" class="notif-all-link" (click)="notifDropOpen=false">View all notifications</a>
                  </div>
                }
              </div>

              <div class="user-menu" [class.open]="userMenuOpen">
                <button class="user-trigger" (click)="userMenuOpen=!userMenuOpen">
                  <div class="user-avatar">{{ getInitials(currentUser) }}</div>
                  <span class="user-name">{{ currentUser.full_name || currentUser.username }}</span>
                  <i class="fas fa-chevron-down arrow-icon"></i>
                </button>
                <div class="user-dropdown">
                  <a routerLink="/profile" class="dd-item" (click)="closeAll()"><i class="fas fa-user"></i> My Profile</a>
                  <a routerLink="/add-place" class="dd-item" (click)="closeAll()"><i class="fas fa-plus-circle"></i> Add Place</a>
                  <a routerLink="/notifications" class="dd-item" (click)="closeAll()"><i class="fas fa-bell"></i> Notifications @if (unreadCount > 0) { <span class="dd-badge">{{ unreadCount }}</span> }</a>
                  @if (currentUser.is_staff) {
                    <a routerLink="/admin-dashboard" class="dd-item admin-link" (click)="closeAll()"><i class="fas fa-shield-alt"></i> Admin Panel</a>
                  }
                  <div class="dd-divider"></div>
                  <button class="dd-item dd-logout" (click)="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
                </div>
              </div>
            } @else {
              <a routerLink="/login" class="btn-nav-outline" (click)="closeMobileMenu()">Login</a>
              <a routerLink="/register" class="btn-nav-filled" (click)="closeMobileMenu()">Join Free</a>
            }
          </div>
        </div>

        <button class="hamburger" (click)="toggleMobileMenu()" [class.open]="mobileMenuOpen" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-kerala {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      height: 70px;
      background: rgba(27,67,50,0.88);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      transition: all 0.3s ease;
    }
    .navbar-kerala.scrolled { background: rgba(13,47,34,0.97); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 100%; display: flex; align-items: center; justify-content: space-between; }
    .nav-brand { font-family: 'Playfair Display',serif; color: white; text-decoration: none; display: flex; align-items: center; gap: 10px; }
    .brand-icon { font-size: 1.4rem; }
    .brand-text { display: flex; flex-direction: column; line-height: 1; }
    .brand-main { font-size: 1.2rem; font-weight: 700; letter-spacing: 0.08em; color: white; }
    .brand-sub { font-size: 0.7rem; color: rgba(255,255,255,0.65); letter-spacing: 0.05em; }
    .nav-links { display: flex; align-items: center; gap: 8px; }
    .nav-link { color: rgba(255,255,255,0.88); text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 500; font-size: 0.9rem; padding: 6px 4px; position: relative; transition: color 0.2s; }
    .nav-link::after { content:''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: #F4A261; transition: width 0.3s; border-radius: 1px; }
    .nav-link:hover, .nav-link.active { color: white; }
    .nav-link:hover::after, .nav-link.active::after { width: 100%; }
    .nav-auth { display: flex; align-items: center; gap: 10px; margin-left: 24px; }
    .btn-nav-outline { padding: 7px 18px; border: 2px solid rgba(255,255,255,0.7); border-radius: 50px; color: white; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
    .btn-nav-outline:hover { background: rgba(255,255,255,0.15); border-color: white; color: white; }
    .btn-nav-filled { padding: 7px 18px; background: #F4A261; border-radius: 50px; color: white; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; border: none; }
    .btn-nav-filled:hover { background: #e76f51; transform: translateY(-1px); color: white; }

    /* Notification Bell */
    .notif-bell { position: relative; }
    .bell-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 38px; height: 38px; cursor: pointer; color: white; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.2s; }
    .bell-btn:hover { background: rgba(255,255,255,0.2); }
    .bell-badge { position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 0.65rem; font-weight: 700; font-family: 'Poppins',sans-serif; display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid rgba(27,67,50,0.9); }
    .notif-dropdown { position: absolute; top: calc(100% + 10px); right: 0; width: 340px; background: white; border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,0.18); z-index: 200; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); animation: dropDown 0.2s ease; }
    .notif-hdr { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
    .notif-title { font-family: 'Playfair Display',serif; font-size: 1rem; color: #1B4332; font-weight: 700; }
    .mark-all-btn { background: none; border: none; color: #F4A261; font-family: 'Poppins',sans-serif; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
    .mark-all-btn:hover { text-decoration: underline; }
    .notif-list { max-height: 360px; overflow-y: auto; }
    .notif-empty { padding: 32px; text-align: center; color: #9ca3af; font-family: 'Poppins',sans-serif; font-size: 0.875rem; }
    .notif-item { display: flex; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #fafafa; }
    .notif-item:hover { background: #f8f6f0; }
    .notif-item.unread { background: rgba(27,67,50,0.04); }
    .notif-dot { width: 4px; border-radius: 2px; flex-shrink: 0; min-height: 40px; }
    .dot-place_approved { background: #10b981; }
    .dot-place_rejected { background: #ef4444; }
    .dot-new_review { background: #E9C46A; }
    .dot-review_reply { background: #3b82f6; }
    .dot-place_reported,.dot-report_resolved { background: #8b5cf6; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-item-title { display: block; font-size: 0.82rem; font-weight: 700; color: #2C2C2C; font-family: 'Poppins',sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-msg { display: block; font-size: 0.76rem; color: #6B7280; font-family: 'Poppins',sans-serif; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-time { display: block; font-size: 0.7rem; color: #9ca3af; font-family: 'Poppins',sans-serif; margin-top: 4px; }
    .notif-all-link { display: block; text-align: center; padding: 12px; color: #1B4332; font-family: 'Poppins',sans-serif; font-size: 0.82rem; font-weight: 600; text-decoration: none; border-top: 1px solid #f0f0f0; transition: background 0.15s; }
    .notif-all-link:hover { background: #f8f6f0; }

    /* User dropdown */
    .user-menu { position: relative; }
    .user-trigger { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 14px 6px 6px; cursor: pointer; transition: all 0.2s; }
    .user-trigger:hover { background: rgba(255,255,255,0.18); }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: #F4A261; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; font-family: 'Poppins',sans-serif; }
    .user-name { color: white; font-size: 0.85rem; font-family: 'Poppins',sans-serif; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .arrow-icon { color: rgba(255,255,255,0.7); font-size: 0.7rem; transition: transform 0.2s; }
    .user-menu.open .arrow-icon { transform: rotate(180deg); }
    .user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: white; border-radius: 12px; padding: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); min-width: 200px; display: none; z-index: 100; border: 1px solid rgba(0,0,0,0.06); }
    .user-menu.open .user-dropdown { display: block; animation: dropDown 0.2s ease; }
    @keyframes dropDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .dd-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #374151; text-decoration: none; font-family: 'Poppins',sans-serif; font-size: 0.875rem; font-weight: 500; transition: all 0.15s; width: 100%; border: none; background: none; cursor: pointer; }
    .dd-item i { width: 16px; color: #9ca3af; text-align: center; }
    .dd-item:hover { background: #f8f6f0; color: #1B4332; }
    .dd-item:hover i { color: #1B4332; }
    .dd-badge { background: #ef4444; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 0.65rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; margin-left: auto; }
    .admin-link { color: #4f46e5 !important; }
    .admin-link i { color: #4f46e5 !important; }
    .admin-link:hover { background: rgba(99,102,241,0.08) !important; }
    .dd-divider { height: 1px; background: #e5e7eb; margin: 4px 0; }
    .dd-logout { color: #ef4444 !important; }
    .dd-logout i { color: #ef4444 !important; }
    .dd-logout:hover { background: rgba(239,68,68,0.08) !important; }

    .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 8px; }
    .hamburger span { width: 24px; height: 2px; background: white; border-radius: 2px; transition: all 0.3s; display: block; }
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

    @media (max-width: 768px) {
      .nav-links { display: none; position: absolute; top: 60px; left: 0; right: 0; background: rgba(13,47,34,0.98); flex-direction: column; padding: 24px; gap: 4px; border-top: 1px solid rgba(255,255,255,0.1); }
      .nav-links.mobile-visible { display: flex; }
      .nav-link { padding: 12px 0; font-size: 1rem; }
      .nav-auth { flex-direction: column; margin-left: 0; margin-top: 16px; width: 100%; }
      .user-menu, .user-dropdown { width: 100%; position: static; box-shadow: none; border: none; background: rgba(255,255,255,0.05); border-radius: 10px; display: block !important; }
      .user-trigger { width: 100%; justify-content: flex-start; border-radius: 10px; }
      .dd-item { color: rgba(255,255,255,0.85); }
      .dd-item:hover { background: rgba(255,255,255,0.1); color: white; }
      .dd-divider { background: rgba(255,255,255,0.15); }
      .hamburger { display: flex; }
      .notif-dropdown { position: fixed; left: 8px; right: 8px; width: auto; top: 70px; }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  isScrolled = false;
  mobileMenuOpen = false;
  userMenuOpen = false;
  notifDropOpen = false;
  currentUser: User | null = null;
  notifications: Notification[] = [];
  unreadCount = 0;

  private subs: Subscription[] = [];

  ngOnInit() {
    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) this.startPolling();
      })
    );
  }

  startPolling() {
    const poll$ = interval(60000).pipe(
      startWith(0),
      switchMap(() => this.notifService.getNotifications())
    );
    this.subs.push(
      poll$.subscribe({
        next: (r) => {
          this.notifications = r.results;
          this.unreadCount = r.results.filter(n => !n.is_read).length;
          this.notifService.unreadCount$.next(this.unreadCount);
        },
        error: () => {}
      })
    );
  }

  openNotif(n: Notification) {
    if (!n.is_read) {
      this.notifService.markRead(n.id).subscribe({ next: () => { n.is_read = true; this.unreadCount = Math.max(0, this.unreadCount - 1); } });
    }
    this.notifDropOpen = false;
    if (n.place_id) this.router.navigate(['/place', n.place_id]);
  }

  toggleNotifDrop() { this.notifDropOpen = !this.notifDropOpen; this.userMenuOpen = false; }

  markAllRead() {
    this.notifService.markAllRead().subscribe({
      next: () => { this.notifications.forEach(n => n.is_read = true); this.unreadCount = 0; }
    });
  }

  @HostListener('window:scroll')
  onScroll() { this.isScrolled = window.scrollY > 50; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu')) this.userMenuOpen = false;
    if (!target.closest('.notif-bell')) this.notifDropOpen = false;
  }

  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMobileMenu() { this.mobileMenuOpen = false; }
  closeAll() { this.userMenuOpen = false; this.mobileMenuOpen = false; this.notifDropOpen = false; }
  logout() { this.authService.logout(); this.closeAll(); }

  getInitials(user: User): string {
    const name = user.full_name || user.username;
    return name.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
