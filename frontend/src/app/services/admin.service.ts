import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  total_places: number;
  pending_places: number;
  approved_places: number;
  rejected_places: number;
  total_users: number;
  total_reviews: number;
  recent_places: any[];
}

export interface AdminPlaceItem {
  id: number;
  title: string;
  district: string;
  category: string;
  difficulty: string;
  status: string;
  added_by: { id: number; username: string; full_name: string };
  average_rating: number;
  review_count: number;
  image_url: string | null;
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  places_count: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/admin/dashboard/`);
  }

  getAdminPlaces(status?: string): Observable<{ count: number; results: AdminPlaceItem[] }> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<{ count: number; results: AdminPlaceItem[] }>(`${this.api}/admin/places/${params}`);
  }

  updatePlaceStatus(id: number, action: 'approve' | 'reject' | 'pending', note?: string): Observable<any> {
    return this.http.patch(`${this.api}/admin/places/${id}/`, { action, admin_note: note || '' });
  }

  deletePlace(id: number): Observable<any> {
    return this.http.delete(`${this.api}/admin/places/${id}/`);
  }

  getAdminUsers(): Observable<{ count: number; results: AdminUser[] }> {
    return this.http.get<{ count: number; results: AdminUser[] }>(`${this.api}/admin/users/`);
  }
}
