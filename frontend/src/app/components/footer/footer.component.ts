import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <span>🌿</span>
              <span class="fl-main">NIZHAL</span>
              <span class="fl-sub">നിഴൽ</span>
            </div>
            <p class="footer-tagline">Find Your Shadow. Explore Kerala.</p>
            <p>The cool shadow of hidden places — secret waterfalls, forest trails, and untouched shores found by explorers like you.</p>
            <div class="social-links">
              <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
            </div>
          </div>
          <div class="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a routerLink="/">🏠 Home</a></li>
              <li><a routerLink="/explore">🗺️ Explore Places</a></li>
              <li><a routerLink="/add-place">📍 Add a Place</a></li>
              <li><a routerLink="/login">🔐 Login</a></li>
              <li><a routerLink="/register">✨ Join Community</a></li>
            </ul>
          </div>
          <div class="footer-districts">
            <h4>Explore Districts</h4>
            <div class="district-tags">
              @for (district of districts; track district) {
                <a [routerLink]="['/explore']" [queryParams]="{district}" class="district-tag">{{ district }}</a>
              }
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2024 Nizhal – Hidden Kerala Explorer. All rights reserved.</p>
          <p class="made-with">Made with ❤️ in Kerala 🌴</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer { background: #1A1A2E; color: rgba(255,255,255,0.7); padding: 64px 0 0; }
    .footer-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1.5fr; gap: 48px; padding-bottom: 48px; }
    .footer-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .footer-logo > span:first-child { font-size: 1.4rem; }
    .fl-main { font-family: 'Playfair Display',serif; font-size: 1.4rem; font-weight: 700; color: white; letter-spacing: 0.08em; }
    .fl-sub { font-size: 0.8rem; color: rgba(255,255,255,0.55); letter-spacing: 0.05em; }
    .footer-tagline { font-family: 'Playfair Display',serif; font-style: italic; color: #F4A261; font-size: 0.85rem; margin-bottom: 10px; }
    .footer-brand p { font-size: 0.875rem; line-height: 1.7; color: rgba(255,255,255,0.6); margin-bottom: 24px; font-family: 'Poppins',sans-serif; }
    .social-links { display: flex; gap: 12px; }
    .social-icon {
      width: 40px; height: 40px; border-radius: 50%; background: rgba(45,106,79,0.4);
      color: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center;
      text-decoration: none; transition: all 0.2s; font-size: 0.9rem;
    }
    .social-icon:hover { background: #2D6A4F; color: white; transform: translateY(-3px); }
    h4 { font-family: 'Playfair Display',serif; font-size: 1.1rem; color: white; margin-bottom: 20px; }
    .footer-links ul { list-style: none; padding: 0; }
    .footer-links li { margin-bottom: 10px; }
    .footer-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.875rem; font-family: 'Poppins',sans-serif; transition: color 0.2s; }
    .footer-links a:hover { color: #F4A261; }
    .district-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .district-tag {
      padding: 4px 12px; border: 1px solid rgba(255,255,255,0.2); border-radius: 50px;
      color: rgba(255,255,255,0.6); font-size: 0.75rem; text-decoration: none;
      font-family: 'Poppins',sans-serif; transition: all 0.2s;
    }
    .district-tag:hover { border-color: #2D6A4F; color: white; background: rgba(45,106,79,0.3); }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.1); padding: 24px 0;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.8rem; font-family: 'Poppins',sans-serif;
    }
    .footer-bottom p { margin: 0; }
    .made-with { color: #F4A261; }
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr; gap: 32px; }
      .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    }
  `]
})
export class FooterComponent {
  districts = ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'];
}
