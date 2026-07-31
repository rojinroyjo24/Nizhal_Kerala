export interface PlaceUser {
  id: number;
  username: string;
  full_name: string;
}

export interface PlaceImage {
  id: number;
  image_url: string;
  caption: string;
  order: number;
  uploaded_at: string;
}

export interface Place {
  id: number;
  title: string;
  description: string;
  district: string;
  category: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  best_season?: string;
  google_maps_link?: string;
  image?: string;
  image_url?: string;
  images?: PlaceImage[];
  first_gallery_image?: string;
  added_by: PlaceUser;
  average_rating: number;
  review_count: number;
  share_count: number;
  created_at: string;
  updated_at?: string;
  status?: string;
}

export interface PlacesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Place[];
}

export interface PlaceFormData {
  title: string;
  description: string;
  district: string;
  category: string;
  difficulty: string;
  best_season?: string;
  google_maps_link?: string;
  image?: File;
}

export interface PlaceFilters {
  district?: string;
  category?: string;
  difficulty?: string;
  best_season?: string;
  search?: string;
  sort?: string;
  page?: number;
}
