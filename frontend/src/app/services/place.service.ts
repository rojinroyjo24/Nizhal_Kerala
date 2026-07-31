import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Place, PlaceFilters, PlacesResponse, PlaceImage } from '../models/place.model';

@Injectable({ providedIn: 'root' })
export class PlaceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPlaces(filters: PlaceFilters = {}): Observable<PlacesResponse> {
    let params = new HttpParams();
    if (filters.district) params = params.set('district', filters.district);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
    if (filters.best_season) params = params.set('best_season', filters.best_season);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.page) params = params.set('page', filters.page.toString());
    return this.http.get<PlacesResponse>(`${this.apiUrl}/places/`, { params });
  }

  getPlace(id: number): Observable<Place> {
    return this.http.get<Place>(`${this.apiUrl}/places/${id}/`);
  }

  createPlace(formData: FormData): Observable<Place> {
    return this.http.post<Place>(`${this.apiUrl}/places/`, formData);
  }

  updatePlace(id: number, formData: FormData): Observable<Place> {
    return this.http.patch<Place>(`${this.apiUrl}/places/${id}/`, formData);
  }

  deletePlace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/places/${id}/`);
  }

  uploadImage(placeId: number, formData: FormData): Observable<PlaceImage> {
    return this.http.post<PlaceImage>(`${this.apiUrl}/places/${placeId}/images/`, formData);
  }

  deleteImage(placeId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/places/${placeId}/images/${imageId}/`);
  }

  sharePlace(placeId: number): Observable<{ share_count: number }> {
    return this.http.post<{ share_count: number }>(`${this.apiUrl}/places/${placeId}/share/`, {});
  }

  reportPlace(placeId: number, data: { reason: string; description: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/places/${placeId}/report/`, data);
  }

  getSurprise(district?: string): Observable<Place> {
    let params = new HttpParams();
    if (district) params = params.set('district', district);
    return this.http.get<Place>(`${this.apiUrl}/places/surprise/`, { params });
  }

  getDistricts(): Observable<{ districts: string[] }> {
    return this.http.get<{ districts: string[] }>(`${this.apiUrl}/districts/`);
  }

  getCategories(): Observable<{ categories: { name: string; icon: string }[] }> {
    return this.http.get<{ categories: { name: string; icon: string }[] }>(`${this.apiUrl}/categories/`);
  }
}
