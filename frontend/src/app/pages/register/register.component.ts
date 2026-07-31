import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-split">
      <div class="auth-img-side">
        <div class="auth-quote">
          <blockquote>"Be the one who found it first"</blockquote>
          <p>Join our community of passionate Kerala explorers</p>
          <div class="join-stats">
            <div><strong>1000+</strong><span>Explorers</span></div>
            <div><strong>200+</strong><span>Places</span></div>
            <div><strong>500+</strong><span>Reviews</span></div>
          </div>
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
        <h1>Join the Explorer Community 🌴</h1>
        <p class="auth-sub">Create your free account and start discovering</p>
        <form (ngSubmit)="onRegister()" #regForm="ngForm">
          <div class="name-row">
            <div class="field-group">
              <label>First Name *</label>
              <input type="text" name="first_name" [(ngModel)]="form.first_name" required placeholder="Arjun" #fnCtrl="ngModel" [class.err]="fnCtrl.invalid && fnCtrl.touched">
              @if (fnCtrl.invalid && fnCtrl.touched) { <span class="err-msg">Required.</span> }
            </div>
            <div class="field-group">
              <label>Last Name *</label>
              <input type="text" name="last_name" [(ngModel)]="form.last_name" required placeholder="Kumar" #lnCtrl="ngModel" [class.err]="lnCtrl.invalid && lnCtrl.touched">
              @if (lnCtrl.invalid && lnCtrl.touched) { <span class="err-msg">Required.</span> }
            </div>
          </div>
          <div class="field-group">
            <label>Username *</label>
            <div class="icon-wrap"><i class="fas fa-user"></i>
              <input type="text" name="username" [(ngModel)]="form.username" required minlength="3" placeholder="explorer_arjun" #unCtrl="ngModel" [class.err]="unCtrl.invalid && unCtrl.touched">
            </div>
            @if (unCtrl.invalid && unCtrl.touched) { <span class="err-msg">Username must be at least 3 characters.</span> }
          </div>
          <div class="field-group">
            <label>Email Address *</label>
            <div class="icon-wrap"><i class="fas fa-envelope"></i>
              <input type="email" name="email" [(ngModel)]="form.email" required placeholder="your@email.com" #emCtrl="ngModel" [class.err]="emCtrl.invalid && emCtrl.touched">
            </div>
            @if (emCtrl.invalid && emCtrl.touched) { <span class="err-msg">Valid email is required.</span> }
          </div>
          <div class="field-group">
            <label>Password *</label>
            <div class="icon-wrap"><i class="fas fa-lock"></i>
              <input [type]="showPass ? 'text' : 'password'" name="password" [(ngModel)]="form.password" required minlength="6" placeholder="Min. 6 characters" (input)="checkStrength()" #pwCtrl="ngModel" [class.err]="pwCtrl.invalid && pwCtrl.touched">
              <button type="button" class="toggle-pass" (click)="showPass=!showPass"><i [class]="showPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
            </div>
            @if (form.password) {
              <div class="strength-bar"><div class="strength-fill" [class]="strengthClass" [style.width]="strengthWidth"></div></div>
              <span class="strength-label">{{ strengthLabel }}</span>
            }
          </div>
          <div class="field-group">
            <label>Confirm Password *</label>
            <div class="icon-wrap"><i class="fas fa-lock"></i>
              <input [type]="showPass ? 'text' : 'password'" name="confirm_password" [(ngModel)]="form.confirm_password" required placeholder="Repeat password">
            </div>
            @if (form.confirm_password && form.password !== form.confirm_password) { <span class="err-msg">Passwords do not match.</span> }
          </div>
          @if (apiError) { <div class="api-err"><i class="fas fa-exclamation-circle"></i> {{ apiError }}</div> }
          <button type="submit" class="auth-btn" [disabled]="isLoading || regForm.invalid || form.password !== form.confirm_password">
            @if (isLoading) { <i class="fas fa-spinner fa-spin"></i> Creating Account... } @else { <i class="fas fa-user-plus"></i> Create Account }
          </button>
          <div class="auth-divider"><span>already have an account?</span></div>
          <p class="auth-switch"><a routerLink="/login">Login here →</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-split { min-height: 100vh; display: flex; }
    .auth-img-side { flex: 1; background-image: url('https://images.unsplash.com/photo-1573407698434-6aed30a22c91?w=1200&q=80'); background-size: cover; background-position: center; position: relative; display: flex; align-items: center; justify-content: center; padding: 48px; }
    .auth-img-side::before { content:''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(27,67,50,0.9),rgba(26,26,46,0.8)); }
    .auth-quote { position: relative; z-index: 1; text-align: center; color: white; }
    .auth-quote blockquote { font-family: 'Dancing Script',cursive; font-size: 2.2rem; color: #FFDDD2; margin-bottom: 12px; line-height: 1.3; }
    .auth-quote > p { font-family: 'Poppins',sans-serif; font-size: 0.9rem; opacity: 0.8; margin-bottom: 32px; }
    .join-stats { display: flex; justify-content: center; gap: 32px; }
    .join-stats div { text-align: center; }
    .join-stats strong { display: block; font-size: 1.5rem; color: #E9C46A; font-family: 'Playfair Display',serif; }
    .join-stats span { font-size: 0.8rem; opacity: 0.7; font-family: 'Poppins',sans-serif; }
    .auth-form-side { width: 520px; padding: 40px; display: flex; flex-direction: column; justify-content: center; background: white; overflow-y: auto; }
    .auth-logo { font-family: 'Playfair Display',serif; color: #1B4332; text-decoration: none; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 10px; }
    .auth-logo > span:first-child { font-size: 1.4rem; }
    .auth-logo-text { display: flex; flex-direction: column; line-height: 1; }
    .auth-logo-main { font-size: 1.2rem; font-weight: 700; letter-spacing: 0.08em; color: #1B4332; }
    .auth-logo-sub { font-size: 0.68rem; color: #2D6A4F; letter-spacing: 0.05em; }
    h1 { font-family: 'Playfair Display',serif; font-size: 1.6rem; color: #2C2C2C; margin-bottom: 6px; }
    .auth-sub { color: #6B7280; font-family: 'Poppins',sans-serif; font-size: 0.875rem; margin-bottom: 28px; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field-group { margin-bottom: 16px; }
    .field-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #374151; font-family: 'Poppins',sans-serif; margin-bottom: 5px; }
    .field-group input { width: 100%; padding: 11px 16px 11px 40px; border: 2px solid #e5e7eb; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
    .field-group input:focus { border-color: #2D6A4F; box-shadow: 0 0 0 3px rgba(27,67,50,0.1); }
    .field-group input.err { border-color: #ef4444; }
    .name-row .field-group input { padding-left: 16px; }
    .icon-wrap { position: relative; }
    .icon-wrap i.fas { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.85rem; }
    .toggle-pass { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 0.875rem; padding: 4px; }
    .err-msg { display: block; color: #dc2626; font-size: 0.75rem; font-family: 'Poppins',sans-serif; margin-top: 3px; }
    .strength-bar { height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 8px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease,background 0.3s ease; }
    .strength-fill.weak { background: #ef4444; }
    .strength-fill.fair { background: #f59e0b; }
    .strength-fill.good { background: #10b981; }
    .strength-fill.strong { background: #059669; }
    .strength-label { font-size: 0.72rem; font-family: 'Poppins',sans-serif; color: #6B7280; margin-top: 2px; display: block; }
    .api-err { background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; padding: 10px 14px; border-radius: 8px; font-size: 0.82rem; font-family: 'Poppins',sans-serif; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .auth-btn { width: 100%; padding: 13px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border: none; border-radius: 10px; font-family: 'Poppins',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .auth-btn:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(27,67,50,0.3); }
    .auth-btn[disabled] { opacity: 0.6; cursor: not-allowed; }
    .auth-divider { text-align: center; margin: 16px 0; position: relative; }
    .auth-divider::before { content:''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e5e7eb; }
    .auth-divider span { position: relative; background: white; padding: 0 12px; color: #9ca3af; font-size: 0.78rem; font-family: 'Poppins',sans-serif; }
    .auth-switch { text-align: center; font-family: 'Poppins',sans-serif; font-size: 0.875rem; margin: 0; }
    .auth-switch a { color: #1B4332; font-weight: 700; text-decoration: none; }
    @media (max-width: 768px) { .auth-split { flex-direction: column; } .auth-img-side { height: 180px; flex: none; } .auth-form-side { width: 100%; padding: 24px; } .name-row { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  form = { first_name:'', last_name:'', username:'', email:'', password:'', confirm_password:'' };
  showPass = false;
  isLoading = false;
  apiError = '';
  strengthWidth = '0%';
  strengthClass = '';
  strengthLabel = '';

  checkStrength() {
    const p = this.form.password;
    if (!p) { this.strengthWidth = '0%'; return; }
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const levels = [{class:'weak',label:'Weak',width:'25%'},{class:'fair',label:'Fair',width:'50%'},{class:'good',label:'Good',width:'75%'},{class:'strong',label:'Strong 💪',width:'100%'}];
    const l = levels[Math.min(score, 3)];
    this.strengthClass = l.class; this.strengthLabel = l.label; this.strengthWidth = l.width;
  }

  onRegister() {
    if (this.form.password !== this.form.confirm_password) return;
    this.apiError = ''; this.isLoading = true;
    this.authService.register(this.form).subscribe({
      next: (r) => { this.toastService.success(r.message || 'Welcome to Nizhal! 🌿'); this.router.navigate(['/']); },
      error: (err) => {
        this.isLoading = false;
        const errors = err.error;
        if (typeof errors === 'object') { this.apiError = Object.values(errors).flat().join(' '); }
        else { this.apiError = 'Registration failed. Please try again.'; }
      }
    });
  }
}
