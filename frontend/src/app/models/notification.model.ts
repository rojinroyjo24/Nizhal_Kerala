export interface Notification {
  id: number;
  notification_type: 'place_approved' | 'place_rejected' | 'new_review' | 'review_reply' | 'place_reported' | 'report_resolved';
  title: string;
  message: string;
  place_id: number | null;
  place_title: string | null;
  is_read: boolean;
  created_at: string;
  time_ago: string;
}

export interface NotificationsResponse {
  count: number;
  results: Notification[];
}

export interface TravelTip {
  id: number;
  added_by: { id: number; username: string; full_name: string; };
  tip_type: string;
  content: string;
  helpful_count: number;
  is_approved: boolean;
  created_at: string;
}

export interface TipsResponse {
  count: number;
  results: TravelTip[];
}

export interface PlaceReport {
  id: number;
  place: number;
  place_title: string;
  reported_by: { id: number; username: string; full_name: string; };
  reason: string;
  description: string;
  created_at: string;
  is_resolved: boolean;
}
