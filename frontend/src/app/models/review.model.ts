export interface ReviewUser {
  id: number;
  username: string;
  full_name: string;
  initials: string;
}

export interface ReviewReply {
  id: number;
  replied_by: ReviewUser;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user: ReviewUser;
  rating: number;
  comment: string;
  created_at: string;
  replies: ReviewReply[];
  reply_count: number;
}

export interface ReviewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}
