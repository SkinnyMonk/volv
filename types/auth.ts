/**
 * Authentication Types
 */

export type AuthStep = 'idle' | 'clientId' | 'otp' | 'twofa' | 'success' | 'error';

export interface User {
  name: string;
  loginId: string;
}

export interface TwoFAQuestion {
  question: string;
  question_id: number;
}

export interface Timer {
  second: number;
  minute: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  authToken: string | null;
  user: User | null;
  currentStep: AuthStep;
  clientId: string;
  loginId: string;
  referenceToken: string | null;
  twoFAToken: string | null;
  twoFAType: string | null;
  twoFAQuestions: TwoFAQuestion[];
  otpTimer: Timer | null;
  errorMessage: string;
}

export interface LoginRequest {
  channel_id: string;
}

export interface OTPVerificationRequest {
  login_id: string;
  otp: string;
  reference_token: string;
}

export interface TwoFAVerificationRequest {
  login_id: string;
  twofa: Array<{
    question_id: number;
    answer: string;
  }>;
  twofa_token: string;
  type: string;
}

export interface TwoFAData {
  type?: string;
  twofa_token?: string;
  questions?: TwoFAQuestion[];
}

export interface LoginResponseData {
  name: string;
  timer?: Timer;
  alert: string;
  login_id: string;
  auth_token: string;
  reference_token: string | null;
  twofa_enabled: boolean;
  reset_password: boolean;
  reset_two_fa: boolean;
  twofa: TwoFAData;
  check_pan: boolean;
  session_expiry: number;
  account_status: string;
  account_unfreeze_requested: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error' | 'failure';
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface TwoFAResponseData {
  auth_token: string;
  session_expiry: number;
  name?: string;
  login_id?: string;
}

export type TwoFAResponse = ApiResponse<TwoFAResponseData>;
