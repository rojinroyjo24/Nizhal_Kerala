import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthResponse, LoginData, RegisterData, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login/`, data).pipe(
      tap(response => this.saveSession(response))
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register/`, data).pipe(
      tap(response => this.saveSession(response))
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/auth/logout/`, {}).subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('hk_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem('hk_token', response.token);
    localStorage.setItem('hk_user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private clearSession(): void {
    localStorage.removeItem('hk_token');
    localStorage.removeItem('hk_user');
    this.currentUserSubject.next(null);
  }

  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem('hk_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}
