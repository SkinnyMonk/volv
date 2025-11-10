/**
 * Authentication Configuration
 * Centralized configuration for the authentication system
 */

export const AUTH_CONFIG = {
  // Base URL for the authentication service
  BASE_URL: process.env.NEXT_PUBLIC_AUTH_BASE_URL || 'https://zyro.basanonline.com',

  // API endpoints
  ENDPOINTS: {
    LOGIN: '/api/v4/user/login',
    TWOFA: '/api/v4/user/twofa',
    VERIFY_OTP: '/api/v4/user/login', // Same as login endpoint
  },

  // Timeouts and limits
  TIMEOUTS: {
    OTP_EXPIRY_SECONDS: 1800, // 30 minutes
    SESSION_TIMEOUT_MS: 1800000, // 30 minutes
    API_TIMEOUT_MS: 30000, // 30 seconds
  },

  // Validation rules
  VALIDATION: {
    CLIENT_ID_MIN_LENGTH: 1,
    CLIENT_ID_MAX_LENGTH: 50,
    OTP_LENGTH: 6,
    PIN_MIN_LENGTH: 1,
    PIN_MAX_LENGTH: 100,
  },

  // UI Configuration
  UI: {
    SHOW_STEP_INDICATOR: true,
    SHOW_OTP_TIMER: true,
    ALLOW_OTP_RESEND: false, // Change to true if backend supports resend
  },

  // Error messages
  ERRORS: {
    INVALID_CLIENT_ID: 'Please enter a valid Client ID',
    INVALID_OTP: 'Please enter a valid 6-digit OTP',
    INVALID_PIN: 'Please enter your PIN',
    SESSION_EXPIRED: 'Session expired. Please try again.',
    LOGIN_FAILED: 'Login failed. Please try again.',
    OTP_VERIFICATION_FAILED: 'OTP verification failed. Please try again.',
    TWOFA_VERIFICATION_FAILED: '2FA verification failed. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },

  // Success messages
  MESSAGES: {
    LOGIN_SUCCESS: 'Login successful!',
    OTP_SENT: 'OTP sent to your registered phone and email',
    CHECK_OTP: 'Please enter the OTP sent to your phone/email',
    ENTER_PIN: 'Please enter your security PIN',
  },
};

/**
 * Get full API URL for a given endpoint
 */
export function getApiUrl(endpoint: keyof typeof AUTH_CONFIG.ENDPOINTS): string {
  const baseUrl = AUTH_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const path = AUTH_CONFIG.ENDPOINTS[endpoint];
  return `${baseUrl}${path}`;
}

/**
 * Get frontend API URL for a given endpoint
 */
export function getFrontendApiUrl(endpoint: 'login' | 'otp' | 'twofa'): string {
  return `/api/auth/${endpoint}`;
}

/**
 * Validate client ID format
 */
export function isValidClientId(clientId: string): boolean {
  const { CLIENT_ID_MIN_LENGTH, CLIENT_ID_MAX_LENGTH } = AUTH_CONFIG.VALIDATION;
  return (
    typeof clientId === 'string' &&
    clientId.length >= CLIENT_ID_MIN_LENGTH &&
    clientId.length <= CLIENT_ID_MAX_LENGTH
  );
}

/**
 * Validate OTP format (must be 6 digits)
 */
export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Validate PIN format
 */
export function isValidPin(pin: string): boolean {
  const { PIN_MIN_LENGTH, PIN_MAX_LENGTH } = AUTH_CONFIG.VALIDATION;
  return (
    typeof pin === 'string' &&
    pin.length >= PIN_MIN_LENGTH &&
    pin.length <= PIN_MAX_LENGTH
  );
}

/**
 * Format time remaining (seconds to MM:SS)
 */
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(expirySeconds: number, currentSeconds: number): boolean {
  return currentSeconds >= expirySeconds;
}
