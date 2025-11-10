const AUTH_BASE_URL = 'https://zyro.basanonline.com';

export interface LoginResponse {
  data: {
    name: string;
    timer?: {
      second: number;
      minute: number;
    };
    alert: string;
    login_id: string;
    auth_token: string;
    reference_token: string | null;
    twofa_enabled: boolean;
    reset_password: boolean;
    reset_two_fa: boolean;
    twofa: {
      type?: string;
      twofa_token?: string;
      questions?: Array<{
        question: string;
        question_id: number;
      }>;
    };
    check_pan: boolean;
    session_expiry: number;
    account_status: string;
    account_unfreeze_requested: boolean;
    social_identity_provider?: string | null;
    [key: string]: unknown;
  };
  message: string;
  status: string;
}

export interface TwoFAResponse {
  data: {
    auth_token: string;
    session_expiry: number;
    name?: string;
    login_id?: string;
    [key: string]: unknown;
  };
  message: string;
  status: string;
}

const commonHeaders = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  'Content-Type': 'application/json',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-GPC': '1',
  'x-device-type': 'web',
};

/**
 * Step 1: Login with client ID to initiate OTP
 */
export async function loginWithClientId(clientId: string): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/api/v4/user/login`, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      'Origin': AUTH_BASE_URL,
      'Referer': `${AUTH_BASE_URL}/login`,
    },
    body: JSON.stringify({
      channel_id: clientId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Step 2: Submit OTP for verification
 */
export async function verifyOTP(
  loginId: string,
  otp: string,
  referenceToken: string
): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/api/v4/user/login/otp`, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      'Origin': AUTH_BASE_URL,
      'Referer': `${AUTH_BASE_URL}/login`,
    },
    body: JSON.stringify({
      login_id: loginId,
      otp: otp,
      reference_token: referenceToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`OTP verification failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Step 3: Submit 2FA PIN/answer for final authentication
 */
export async function verifyTwoFA(
  loginId: string,
  pin: string,
  twoFAToken: string,
  questionId: number
): Promise<TwoFAResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/api/v4/user/twofa`, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      'Origin': AUTH_BASE_URL,
      'Referer': `${AUTH_BASE_URL}/login`,
    },
    body: JSON.stringify({
      login_id: loginId,
      twofa: [
        {
          question_id: questionId,
          answer: pin,
        },
      ],
      twofa_token: twoFAToken,
      type: 'PIN',
    }),
  });

  if (!response.ok) {
    throw new Error(`2FA verification failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}
