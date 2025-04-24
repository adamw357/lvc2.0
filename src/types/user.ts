export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isInsiderMember: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends UserCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
} 