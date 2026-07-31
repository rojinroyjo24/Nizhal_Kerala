import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf-page">
      <div class="nf-content">
        <span class="nf-emoji">🌿</span>
        <h1 class="nf-code">404</h1>
        <h2>Page Not Found</h2>
        <p>Looks like you've ventured off the trail.<br>This hidden gem doesn't exist — yet!</p>
        <div class="nf-buttons">
          <a routerLink="/" class="btn-home"><i class="fas fa-home"></i> Go Home</a>
          <a routerLink="/explore" class="btn-explore"><i class="fas fa-compass"></i> Explore Places</a>
        </div>
        <p class="nf-quote">"Not all those who wander are lost"</p>
      </div>
    </div>
  `,
  styles: [`
    .nf-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8f6f0; padding: 80px 24px; }
    .nf-content { text-align: center; }
    .nf-emoji { font-size: 5rem; display: block; margin-bottom: 12px; animation: float 3s ease-in-out infinite; }
    .nf-code { font-family: 'Playfair Display',serif; font-size: 7rem; font-weight: 700; color: #1B4332; opacity: 0.15; line-height: 1; margin-bottom: -20px; }
    h2 { font-family: 'Playfair Display',serif; font-size: 2rem; color: #2C2C2C; margin-bottom: 12px; }
    p { color: #6B7280; font-family: 'Poppins',sans-serif; font-size: 1rem; line-height: 1.7; margin-bottom: 36px; }
    .nf-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 32px; }
    .btn-home { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.95rem; transition: all 0.25s; box-shadow: 0 4px 16px rgba(27,67,50,0.25); }
    .btn-home:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(27,67,50,0.35); color: white; }
    .btn-explore { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border: 2px solid #1B4332; color: #1B4332; border-radius: 50px; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.95rem; transition: all 0.25s; }
    .btn-explore:hover { background: #1B4332; color: white; transform: translateY(-3px); }
    .nf-quote { font-family: 'Dancing Script',cursive; font-size: 1.3rem; color: #1B4332; opacity: 0.6; margin: 0; }
    @keyframes float { 0%,100%{transform:translateY(0) rotate(0)} 33%{transform:translateY(-12px) rotate(-5deg)} 66%{transform:translateY(-6px) rotate(5deg)} }
  `]
})
export class NotFoundComponent {}
