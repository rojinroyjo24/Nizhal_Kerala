export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
  is_staff: boolean;
  date_joined: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}
