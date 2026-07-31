import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private idCounter = 0;

  success(message: string, duration = 3500): void {
    this.show({ message, type: 'success', icon: '✅' }, duration);
  }

  error(message: string, duration = 4500): void {
    this.show({ message, type: 'error', icon: '❌' }, duration);
  }

  info(message: string, duration = 3000): void {
    this.show({ message, type: 'info', icon: 'ℹ️' }, duration);
  }

  private show(toast: Omit<Toast, 'id'>, duration: number): void {
    const id = ++this.idCounter;
    const newToast: Toast = { ...toast, id };
    this.toastsSubject.next([...this.toastsSubject.value, newToast]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
