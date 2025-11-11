import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    v1Instance.defaults.headers.common['x-authorization-token'] = token;
    v4Instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete v1Instance.defaults.headers.common['x-authorization-token'];
    delete v4Instance.defaults.headers.common['Authorization'];
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// API v1 instance (for positions, orders, etc.)
const v1Instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_V1_BASE_URL || 'https://zyro.basanonline.com/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-device-type': 'web',
  },
});
const v3Instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_V3_BASE_URL || 'https://zyro.basanonline.com/api/v3',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-device-type': 'web',
  },
});


// API v4 instance (for auth)
const v4Instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_V4_BASE_URL || 'https://zyro.basanonline.com/api/v4',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-device-type': 'web',
  },
});

// Request interceptor for v1
v1Instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers['x-authorization-token'] = authToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
v3Instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers['x-authorization-token'] = authToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor for v4
v4Instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for v1
v1Instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      authToken = null;
      delete v1Instance.defaults.headers.common['x-authorization-token'];
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Response interceptor for v4
v4Instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      authToken = null;
      delete v4Instance.defaults.headers.common['Authorization'];
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Export instances
export const apiV1 = v1Instance;
export const apiV3 = v3Instance;

export const apiV4 = v4Instance;

// Default export for backwards compatibility
export default v4Instance;
