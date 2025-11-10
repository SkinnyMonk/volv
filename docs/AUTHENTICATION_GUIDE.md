# Authentication Implementation Guide

## Quick Start

### 1. Access the Login Page
Navigate to: `http://localhost:3000/auth/login`

### 2. Multi-Step Authentication Flow

#### Step 1: Client ID Login
```
┌─────────────────────────────────────┐
│         Thak                        │
│  Secure Trading Platform Login      │
├─────────────────────────────────────┤
│  1 Client ID  2 OTP  3 2FA         │
├─────────────────────────────────────┤
│  Client ID                          │
│  [________________]                 │
│  [Continue Button]                  │
└─────────────────────────────────────┘
```

**Expected Response:**
```json
{
  "data": {
    "name": "MAPURI SHAILAJA",
    "timer": { "second": 30, "minute": 0 },
    "alert": "Login OTP",
    "login_id": "MS3122",
    "reference_token": "A31ypW7WKo8...",
    "twofa_enabled": true
  },
  "status": "success"
}
```

#### Step 2: OTP Verification
```
┌─────────────────────────────────────┐
│         Thak                        │
│  Secure Trading Platform Login      │
├─────────────────────────────────────┤
│  1 Client ID  2 OTP  3 2FA         │
├─────────────────────────────────────┤
│  OTP Code                           │
│  Enter the OTP sent to your mobile  │
│  [000000]  (6-digit input)          │
│  Time remaining: 0:30               │
│  [Verify OTP Button]                │
└─────────────────────────────────────┘
```

**Expected Response:**
```json
{
  "data": {
    "name": "MAPURI SHAILAJA",
    "login_id": "MS3122",
    "twofa_enabled": true,
    "twofa": {
      "type": "PIN",
      "twofa_token": "A31ypWQapOBA6Q6...",
      "questions": [
        {
          "question": "Please enter your pin",
          "question_id": 22
        }
      ]
    }
  },
  "status": "success"
}
```

#### Step 3: 2FA PIN Verification
```
┌─────────────────────────────────────┐
│         Thak                        │
│  Secure Trading Platform Login      │
├─────────────────────────────────────┤
│  1 Client ID  2 OTP  3 2FA         │
├─────────────────────────────────────┤
│  Please enter your pin              │
│  [__________]                       │
│  [Verify PIN Button]                │
└─────────────────────────────────────┘
```

**Expected Response:**
```json
{
  "data": {
    "auth_token": "eyJhbGciOiJIUzI1NiIs...",
    "session_expiry": 1234567890,
    "name": "MAPURI SHAILAJA",
    "login_id": "MS3122"
  },
  "status": "success"
}
```

#### Step 4: Success
```
┌─────────────────────────────────────┐
│         Thak                        │
│  Secure Trading Platform Login      │
├─────────────────────────────────────┤
│         ✓                           │
│   Login Successful!                 │
│   Welcome, MAPURI SHAILAJA          │
│   [Go to Dashboard]                 │
└─────────────────────────────────────┘
```

## Project Structure

```
app/
├── auth/
│   ├── layout.tsx          # Auth layout (no header/sidebar)
│   └── login/
│       └── page.tsx        # Main login page
├── api/
│   └── auth/
│       ├── login/
│       │   └── route.ts    # Login endpoint
│       ├── verify-otp/
│       │   └── route.ts    # OTP verification endpoint
│       └── verify-twofa/
│           └── route.ts    # 2FA verification endpoint
└── layout.tsx              # Root layout with AuthProvider

components/auth/
├── ClientIdForm.tsx        # Step 1 component
├── OTPForm.tsx            # Step 2 component
└── TwoFAForm.tsx          # Step 3 component

lib/auth/
├── authService.ts         # API service functions
├── AuthContext.tsx        # Context & state management
└── useAuthPersistence.ts  # Auth persistence hook

types/
└── auth.ts                # TypeScript type definitions
```

## Code Examples

### Using Authentication in Components

```tsx
'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function Dashboard() {
  const { isAuthenticated, user, authToken, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div>
        <p>Please log in first</p>
        <Link href="/auth/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Your Login ID: {user?.loginId}</p>
      <p>Auth Token: {authToken?.substring(0, 20)}...</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

export function MyComponent() {
  const { authToken } = useAuth();

  const fetchUserData = async () => {
    const response = await fetch('/api/user/data', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  };

  return (
    <button onClick={fetchUserData}>
      Fetch Data
    </button>
  );
}
```

## Error Handling

The system handles various error scenarios:

1. **Invalid Client ID**
   - Message: "Login failed"
   - User is redirected to error state

2. **OTP Timeout**
   - Countdown timer shows "OTP expired"
   - User cannot submit OTP

3. **Incorrect PIN**
   - Message from backend: "2FA verification failed"
   - User can retry

4. **Network Errors**
   - Message: "An error occurred"
   - Specific error details logged to console

## Testing

### Test with cURL

```bash
# Step 1: Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"clientId":"MS3122"}'

# Step 2: Verify OTP (use reference_token from Step 1)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "loginId":"MS3122",
    "otp":"123456",
    "referenceToken":"<reference_token_from_step1>"
  }'

# Step 3: Verify 2FA (use twofa_token from Step 2)
curl -X POST http://localhost:3000/api/auth/verify-twofa \
  -H "Content-Type: application/json" \
  -d '{
    "loginId":"MS3122",
    "pin":"111111",
    "twoFAToken":"<twofa_token_from_step2>",
    "questionId":22
  }'
```

Or use the provided test script:
```bash
bash scripts/test-auth.sh
```

## Environment Variables

Create a `.env.local` file (not provided in repo):

```
NEXT_PUBLIC_AUTH_BASE_URL=https://zyro.basanonline.com
NEXT_PUBLIC_LOGIN_ENDPOINT=/api/v4/user/login
NEXT_PUBLIC_TWOFA_ENDPOINT=/api/v4/user/twofa
```

## Security Notes

✅ **Implemented:**
- HTTPS-only API calls
- No credentials logging
- Token stored in memory (by default)
- CORS-compliant headers
- Input validation

⚠️ **Recommended for Production:**
- Use HttpOnly cookies for token storage
- Implement CSRF protection
- Add rate limiting on login attempts
- Implement session timeout
- Add audit logging
- Use secure token refresh mechanism

## Troubleshooting

### "Session expired" error
- The reference token or 2FA token has expired
- User needs to restart from Step 1

### OTP not received
- Check email/SMS settings on backend
- Verify phone number and email in account
- Wait for timer to complete, may need resend

### PIN verification fails
- Ensure PIN is entered correctly
- Check 2FA is enabled on account
- Verify question_id matches the question provided

### CORS errors
- Ensure backend is accessible from frontend domain
- Check browser console for specific CORS error
- Verify Request headers match expectations

## Next Steps

1. **Protected Routes** - Add middleware to protect routes
2. **Token Refresh** - Implement token refresh mechanism
3. **Remember Me** - Add "Remember Device" feature
4. **Social Login** - Add alternative authentication methods
5. **2FA Setup** - Add page for users to configure 2FA
