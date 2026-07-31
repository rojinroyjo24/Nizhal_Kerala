import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Notification, NotificationsResponse, TravelTip, TipsResponse, PlaceReport } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = environment.apiUrl;
  public unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getNotifications(type?: string, unreadOnly?: boolean): Observable<NotificationsResponse> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (unreadOnly) params = params.set('unread', 'true');
    return this.http.get<NotificationsResponse>(`${this.apiUrl}/notifications/`, { params });
  }

  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${this.apiUrl}/notifications/unread-count/`);
  }

  markRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${id}/read/`, {});
  }

  markAllRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/read-all/`, {});
  }

  refreshUnreadCount() {
    this.getUnreadCount().subscribe({
      next: (r) => this.unreadCount$.next(r.unread_count),
      error: () => {}
    });
  }

  // Travel Tips
  getTips(placeId: number): Observable<TipsResponse> {
    return this.http.get<TipsResponse>(`${this.apiUrl}/places/${placeId}/tips/`);
  }

  addTip(placeId: number, data: { tip_type: string; content: string }): Observable<TravelTip> {
    return this.http.post<TravelTip>(`${this.apiUrl}/places/${placeId}/tips/`, data);
  }

  markTipHelpful(tipId: number): Observable<{ helpful_count: number }> {
    return this.http.post<{ helpful_count: number }>(`${this.apiUrl}/tips/${tipId}/helpful/`, {});
  }

  deleteTip(tipId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tips/${tipId}/`);
  }

  // Admin Reports
  getAdminReports(resolved?: string, reason?: string): Observable<any> {
    let params = new HttpParams();
    if (resolved) params = params.set('resolved', resolved);
    if (reason) params = params.set('reason', reason);
    return this.http.get(`${this.apiUrl}/admin/reports/`, { params });
  }

  resolveReport(reportId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/reports/${reportId}/resolve/`, {});
  }
}
