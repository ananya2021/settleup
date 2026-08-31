export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthState {
  user: { id: string; email: string } | null;
  loading: boolean;
}
