import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-split">
      <div class="auth-img-side">
        <div class="auth-quote">
          <blockquote>"Kerala — where every path leads to a new wonder"</blockquote>
          <p>Join thousands of explorers uncovering hidden Kerala</p>
        </div>
      </div>
      <div class="auth-form-side">
        <a routerLink="/" class="auth-logo">
          <span>🌿</span>
          <span class="auth-logo-text">
            <span class="auth-logo-main">NIZHAL</span>
            <span class="auth-logo-sub">നിഴൽ</span>
          </span>
        </a>
        <h1>Welcome Back, Explorer 🌿</h1>
        <p class="auth-sub">Sign in to share and discover hidden places</p>
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="field-group">
            <label>Email Address</label>
            <div class="icon-wrap"><i class="fas fa-envelope"></i>
              <input type="email" name="email" [(ngModel)]="form.email" required placeholder="explorer@example.com" #emCtrl="ngModel" [class.err]="emCtrl.invalid && emCtrl.touched">
            </div>
            @if (emCtrl.invalid && emCtrl.touched) { <span class="err-msg">Please enter a valid email address.</span> }
          </div>
          <div class="field-group">
            <label>Password</label>
            <div class="icon-wrap"><i class="fas fa-lock"></i>
              <input [type]="showPass ? 'text' : 'password'" name="password" [(ngModel)]="form.password" required placeholder="Your password" #pwCtrl="ngModel" [class.err]="pwCtrl.invalid && pwCtrl.touched">
              <button type="button" class="toggle-pass" (click)="showPass=!showPass"><i [class]="showPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
            </div>
            @if (pwCtrl.invalid && pwCtrl.touched) { <span class="err-msg">Password is required.</span> }
          </div>
          @if (apiError) { <div class="api-err"><i class="fas fa-exclamation-circle"></i> {{ apiError }}</div> }
          <button type="submit" class="auth-btn" [disabled]="isLoading || loginForm.invalid">
            @if (isLoading) { <i class="fas fa-spinner fa-spin"></i> Signing In... } @else { <i class="fas fa-sign-in-alt"></i> Login }
          </button>
          <div class="auth-divider"><span>or</span></div>
          <p class="auth-switch">New explorer? <a routerLink="/register">Register here</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-split { min-height: 100vh; display: flex; }
    .auth-img-side { flex: 1; background-image: url('https://images.unsplash.com/photo-1579983219921-9890f9da5af4?w=1200&q=80'); background-size: cover; background-position: center; position: relative; display: flex; align-items: center; justify-content: center; padding: 48px; }
    .auth-img-side::before { content:''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(27,67,50,0.88),rgba(26,26,46,0.75)); }
    .auth-quote { position: relative; z-index: 1; text-align: center; color: white; }
    .auth-quote blockquote { font-family: 'Dancing Script',cursive; font-size: 2rem; color: #FFDDD2; margin-bottom: 16px; line-height: 1.4; }
    .auth-quote p { font-family: 'Poppins',sans-serif; font-size: 0.9rem; opacity: 0.8; }
    .auth-form-side { width: 480px; padding: 48px 40px; display: flex; flex-direction: column; justify-content: center; background: white; overflow-y: auto; }
    .auth-logo { font-family: 'Playfair Display',serif; color: #1B4332; text-decoration: none; margin-bottom: 32px; display: inline-flex; align-items: center; gap: 10px; }
    .auth-logo > span:first-child { font-size: 1.4rem; }
    .auth-logo-text { display: flex; flex-direction: column; line-height: 1; }
    .auth-logo-main { font-size: 1.2rem; font-weight: 700; letter-spacing: 0.08em; color: #1B4332; }
    .auth-logo-sub { font-size: 0.68rem; color: #2D6A4F; letter-spacing: 0.05em; }
    h1 { font-family: 'Playfair Display',serif; font-size: 1.75rem; color: #2C2C2C; margin-bottom: 8px; }
    .auth-sub { color: #6B7280; font-family: 'Poppins',sans-serif; font-size: 0.9rem; margin-bottom: 32px; }
    .field-group { margin-bottom: 20px; }
    .field-group label { display: block; font-size: 0.83rem; font-weight: 600; color: #374151; font-family: 'Poppins',sans-serif; margin-bottom: 6px; }
    .icon-wrap { position: relative; }
    .icon-wrap i.fas { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.875rem; }
    .icon-wrap input { width: 100%; padding: 12px 44px 12px 40px; border: 2px solid #e5e7eb; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
    .icon-wrap input:focus { border-color: #2D6A4F; box-shadow: 0 0 0 3px rgba(27,67,50,0.1); }
    .icon-wrap input.err { border-color: #ef4444; }
    .toggle-pass { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 0.875rem; padding: 4px; }
    .err-msg { display: block; color: #dc2626; font-size: 0.78rem; font-family: 'Poppins',sans-serif; margin-top: 4px; }
    .api-err { background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; padding: 12px 16px; border-radius: 8px; font-size: 0.85rem; font-family: 'Poppins',sans-serif; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .auth-btn { width: 100%; padding: 14px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border: none; border-radius: 10px; font-family: 'Poppins',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .auth-btn:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(27,67,50,0.3); }
    .auth-btn[disabled] { opacity: 0.6; cursor: not-allowed; }
    .auth-divider { text-align: center; margin: 20px 0; position: relative; }
    .auth-divider::before { content:''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e5e7eb; }
    .auth-divider span { position: relative; background: white; padding: 0 12px; color: #9ca3af; font-size: 0.8rem; font-family: 'Poppins',sans-serif; }
    .auth-switch { text-align: center; font-family: 'Poppins',sans-serif; font-size: 0.875rem; color: #6B7280; margin: 0; }
    .auth-switch a { color: #1B4332; font-weight: 600; text-decoration: none; }
    .auth-switch a:hover { text-decoration: underline; }
    @media (max-width: 768px) { .auth-split { flex-direction: column; } .auth-img-side { height: 220px; flex: none; } .auth-form-side { width: 100%; padding: 32px 24px; } }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = { email: '', password: '' };
  showPass = false;
  isLoading = false;
  apiError = '';

  onLogin() {
    this.apiError = '';
    this.isLoading = true;
    this.authService.login(this.form).subscribe({
      next: (r) => {
        this.toastService.success(r.message || 'Welcome back! 🌿');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => { this.isLoading = false; this.apiError = err.error?.error || 'Login failed. Please try again.'; }
    });
  }
}
