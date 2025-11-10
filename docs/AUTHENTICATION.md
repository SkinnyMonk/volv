# Authentication System Documentation

## Overview

The authentication system implements a multi-step verification process:
1. **Client ID Login** - User enters their client ID (e.g., MS3122)
2. **OTP Verification** - User receives and enters an OTP sent to phone/email
3. **2FA PIN Verification** - User enters their security PIN for two-factor authentication

## Architecture

### Core Files

#### Authentication Service (`lib/auth/authService.ts`)
Handles all API calls to the backend authentication endpoints:
- `loginWithClientId(clientId)` - Step 1: Initiates login with client ID
- `verifyOTP(loginId, otp, referenceToken)` - Step 2: Verifies OTP
- `verifyTwoFA(loginId, pin, twoFAToken, questionId)` - Step 3: Verifies 2FA PIN

#### Authentication Context (`lib/auth/AuthContext.tsx`)
Global state management using React Context:
- Manages auth flow state (`currentStep`, `errorMessage`)
- Stores user information and tokens
- Provides auth methods to components via `useAuth()` hook

#### API Routes
- `/api/auth/login` - Forwards client ID login request
- `/api/auth/verify-otp` - Forwards OTP verification request
- `/api/auth/verify-twofa` - Forwards 2FA verification request

### Components

#### `components/auth/ClientIdForm.tsx`
First step - prompts user for Client ID

#### `components/auth/OTPForm.tsx`
Second step - prompts user for OTP with countdown timer

#### `components/auth/TwoFAForm.tsx`
Third step - prompts user for 2FA PIN

#### `app/auth/login/page.tsx`
Main login page that orchestrates all three forms with progress indicator

## Usage

### In a Component

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

function MyComponent() {
  const { 
    isAuthenticated, 
    user, 
    authToken,
    currentStep,
    errorMessage 
  } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in first</div>;
  }

  return <div>Welcome {user?.name}!</div>;
}
```

### Authentication Flow Diagram

```
[Client ID Input]
        ↓
    /api/auth/login
        ↓
[OTP Input] ← Timer (30 seconds)
        ↓
   /api/auth/verify-otp
        ↓
[2FA PIN Input]
        ↓
  /api/auth/verify-twofa
        ↓
[Success - Store Auth Token]
```

## API Endpoints

All endpoints are relative to `https://zyro.basanonline.com/api/v4/`

### 1. Login Endpoint

**POST** `/user/login`

Request:
```json
{
  "channel_id": "MS3122"
}
```

Response:
```json
{
  "data": {
    "name": "MAPURI SHAILAJA",
    "timer": { "second": 30, "minute": 0 },
    "alert": "Login OTP",
    "login_id": "MS3122",
    "reference_token": "...",
    "twofa_enabled": true,
    ...
  },
  "message": "Please enter otp sent on mobile and email",
  "status": "success"
}
```

### 2. OTP Verification Endpoint

**POST** `/user/login`

Request:
```json
{
  "login_id": "MS3122",
  "otp": "123456",
  "reference_token": "..."
}
```

Response:
```json
{
  "data": {
    "name": "MAPURI SHAILAJA",
    "login_id": "MS3122",
    "twofa_enabled": true,
    "twofa": {
      "type": "PIN",
      "twofa_token": "...",
      "questions": [
        {
          "question": "Please enter your pin",
          "question_id": 22
        }
      ]
    },
    ...
  },
  "message": "",
  "status": "success"
}
```

### 3. 2FA Verification Endpoint

**POST** `/user/twofa`

Request:
```json
{
  "login_id": "MS3122",
  "twofa": [
    {
      "question_id": 22,
      "answer": "111111"
    }
  ],
  "twofa_token": "...",
  "type": "PIN"
}
```

Response:
```json
{
  "data": {
    "auth_token": "...",
    "session_expiry": 1234567890,
    ...
  },
  "message": "",
  "status": "success"
}
```

## Error Handling

The system handles errors gracefully:
- Network errors are caught and displayed to the user
- Invalid inputs are validated before submission
- Session timeouts redirect to login
- OTP expiration is handled with a countdown timer

## State Management

Current auth state can be accessed via the `useAuth()` hook:

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  authToken: string | null;
  user: { name: string; loginId: string } | null;
  currentStep: 'idle' | 'clientId' | 'otp' | 'twofa' | 'success' | 'error';
  clientId: string;
  loginId: string;
  errorMessage: string;
  // ... and more
}
```

## Security Considerations

1. **Tokens are stored in memory** - Not persisted to localStorage by default (can be modified)
2. **HTTPS only** - All API calls are made over HTTPS
3. **CORS headers** - Requests include appropriate CORS headers
4. **No credentials exposed** - Passwords/PINs are never logged or exposed
5. **Session timeout** - Backend manages session expiry

## Customization

To customize the authentication system:

1. **Update API endpoints** - Modify `AUTH_BASE_URL` in `authService.ts`
2. **Styling** - Edit Tailwind classes in form components
3. **Flow** - Add/remove steps in the `AuthContext` state
4. **Error messages** - Customize error handling in each form component
