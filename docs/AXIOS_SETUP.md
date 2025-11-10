# Axios Setup & API Integration Guide

## Overview
The application is now configured with Axios for making API requests with automatic authentication token handling.

## Features

✅ **Automatic Token Management**
- Auth token is automatically added to all API requests
- Token is stored in memory after successful login
- Token is removed on logout

✅ **Request Interceptors**
- Automatically includes `Authorization: Bearer <token>` header
- Sets base URL to backend API
- Includes device type and content type headers

✅ **Response Interceptors**
- Handles 401 Unauthorized errors
- Automatically redirects to login on token expiration
- Clears token and redirects to /auth/login

## Usage Examples

### 1. Basic API Call
```typescript
import axiosInstance from '@/lib/axios';

// GET request
const response = await axiosInstance.get('/user/profile');

// POST request
const response = await axiosInstance.post('/orders', {
  symbol: 'RELIANCE',
  quantity: 10,
});

// PUT request
const response = await axiosInstance.put('/orders/123', {
  quantity: 20,
});

// DELETE request
await axiosInstance.delete('/orders/123');
```

### 2. With Error Handling
```typescript
import axiosInstance from '@/lib/axios';

try {
  const { data } = await axiosInstance.get('/user/holdings');
  console.log('Holdings:', data);
} catch (error) {
  if (error.response?.status === 401) {
    // User will be redirected to login automatically
  } else if (error.response?.status === 400) {
    console.log('Bad request:', error.response.data);
  } else {
    console.error('Error:', error.message);
  }
}
```

### 3. In React Components
```typescript
'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/lib/auth/AuthContext';

export function UserProfile() {
  const { authToken } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authToken) return;

    async function fetchUser() {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/user/profile');
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [authToken]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data</div>;

  return <div>{user.name}</div>;
}
```

### 4. Custom Headers
```typescript
import axiosInstance from '@/lib/axios';

// Add custom headers to a specific request
const response = await axiosInstance.get('/data', {
  headers: {
    'X-Custom-Header': 'value',
  },
});

// Override base headers
const response = await axiosInstance.post('/data', data, {
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 5. Timeout Configuration
```typescript
import axiosInstance from '@/lib/axios';

// Default timeout is 30 seconds
// Override for specific request
const response = await axiosInstance.get('/slow-endpoint', {
  timeout: 60000, // 60 seconds
});
```

## Authentication Flow

### Login Process
1. User enters Client ID
2. System sends OTP
3. User enters 4-digit OTP
4. User answers 2FA question (6 digits)
5. Backend returns `auth_token`
6. Token is saved in AuthContext
7. Axios interceptor automatically includes token in all requests
8. User redirected to dashboard

### Token Handling
```typescript
// Token is automatically:
// 1. Saved in AuthContext
// 2. Added to axios instance
// 3. Included in every request header
// 4. Cleared on logout
```

## Configuration

### Environment Variables
```env
# In .env.local or .env.production
NEXT_PUBLIC_API_BASE_URL=https://zyro.basanonline.com/api/v4
```

### Default Headers
```typescript
{
  'Content-Type': 'application/json',
  'x-device-type': 'web',
  'Authorization': 'Bearer <token>' // Added automatically after login
}
```

## Available Endpoints

Based on your backend API, common endpoints include:

```
POST   /user/login              - Initial login with Client ID
PUT    /user/login/otp          - Verify 4-digit OTP
POST   /user/twofa              - Verify 2FA response
GET    /user/profile            - Get user profile
GET    /user/holdings           - Get user holdings
POST   /orders                  - Create new order
GET    /orders                  - Get user orders
PUT    /orders/:id              - Update order
DELETE /orders/:id              - Cancel order
```

## Error Handling

### HTTP Status Codes
| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Process response |
| 400 | Bad Request | Show error message |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show 404 error |
| 500 | Server Error | Retry or show error |

### Example Error Handler
```typescript
import axiosInstance from '@/lib/axios';

async function makeRequest() {
  try {
    const response = await axiosInstance.get('/data');
    return response.data;
  } catch (error) {
    if (!error.response) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        throw new Error(data.message || 'Invalid request');
      case 401:
        // Automatically redirected by interceptor
        throw new Error('Session expired');
      case 403:
        throw new Error('You do not have permission');
      case 404:
        throw new Error('Resource not found');
      default:
        throw new Error(data.message || 'An error occurred');
    }
  }
}
```

## Security Notes

⚠️ **Important**
- Token is stored in memory only (cleared on page refresh)
- For persistent sessions, implement localStorage with encryption
- Token is never exposed in browser console
- Always use HTTPS in production
- Token is automatically included in all requests via interceptor

## Testing

To test API calls in the console:
```javascript
// Import axios
import axiosInstance from '@/lib/axios';

// Make a test call
await axiosInstance.get('/user/profile');

// Check current token
import { getAuthToken } from '@/lib/axios';
console.log(getAuthToken());
```

## Troubleshooting

### Token not being sent
- Ensure you're logged in (check `useAuth().isAuthenticated`)
- Check browser DevTools → Network tab → Request Headers
- Verify `Authorization: Bearer <token>` is present

### 401 Unauthorized errors
- Token may have expired
- Verify token in AuthContext: `useAuth().authToken`
- Re-login if token is missing

### CORS errors
- All requests go through Next.js API proxy (no direct browser requests)
- Frontend → Next.js API Route → Backend

## Next Steps

1. ✅ Axios is configured
2. ✅ Auth token handling is automatic
3. ✅ Login redirects to dashboard
4. Ready to use in any component!

Start making API calls with:
```typescript
import axiosInstance from '@/lib/axios';

const data = await axiosInstance.get('/endpoint');
```
