import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of (toastService.toasts$ | async) || []; track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type">
          <span>{{ toast.icon }}</span>
          <span>{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)"><i class="fas fa-times"></i></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 90px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; max-width: 360px; }
    .toast-item {
      display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15); font-family: 'Poppins',sans-serif; font-size: 0.875rem; font-weight: 500;
      animation: slideIn 0.3s ease;
    }
    .toast-item span:last-of-type { flex: 1; }
    .toast-item button { background: none; border: none; cursor: pointer; opacity: 0.5; color: inherit; }
    .toast-item button:hover { opacity: 1; }
    .toast-success { background: #ecfdf5; color: #065f46; border-left: 4px solid #10b981; }
    .toast-error { background: #fef2f2; color: #991b1b; border-left: 4px solid #ef4444; }
    .toast-info { background: #eff6ff; color: #1e40af; border-left: 4px solid #3b82f6; }
    @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
