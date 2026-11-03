import axios from 'axios';
import { auth } from '@/config/firebase';

// Session ID management (legacy — kept for backwards compatibility)
const SESSION_STORAGE_KEY = 'copilot_session_id';

export function getSessionId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setSessionId(sessionId) {
  if (typeof window === 'undefined') return;
  if (sessionId) {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
}

export function clearSessionId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Chat ID management (preferred over session_id)
const CHAT_STORAGE_KEY = 'copilot_chat_id';

export function getChatId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CHAT_STORAGE_KEY);
}

export function setChatId(chatId) {
  if (typeof window === 'undefined') return;
  if (chatId) {
    localStorage.setItem(CHAT_STORAGE_KEY, chatId);
  }
}

export function clearChatId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CHAT_STORAGE_KEY);
}

// Active store ID storage key
export const WORKSPACE_STORAGE_KEY = 'vyapar_active_store_id';

export function getActiveStoreId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(WORKSPACE_STORAGE_KEY);
}

export function setActiveStoreId(storeId) {
  if (typeof window === 'undefined') return;
  if (storeId) {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, storeId);
  } else {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  }
}

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach active store ID if available and not already specified
    const activeStoreId = getActiveStoreId();
    if (activeStoreId && !config.headers['x-store-id']) {
      config.headers['x-store-id'] = activeStoreId;
    }

    // Attach session ID if available
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with Silent Token Refresh & Workspace Revocation Handling
api.interceptors.response.use(
  (response) => {
    // Capture session ID from response headers
    const sessionId = response.headers['x-session-id'];
    if (sessionId) {
      setSessionId(sessionId);
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Silent token refresh & retry before forcing login redirect
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (auth && auth.currentUser) {
        try {
          console.log('[API INTERCEPTOR] Token expired (401). Attempting silent token refresh via Firebase...');
          const freshToken = await auth.currentUser.getIdToken(true);

          if (freshToken) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('authToken', freshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          console.error('[API INTERCEPTOR] Silent token refresh failed:', refreshErr);
        }
      }

      // If refresh was impossible (user signed out or session revoked), redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      const message = error.response?.data?.message || 'Access forbidden';

      // 1. Unregistered user scenario
      if (message.includes('not registered') || message.includes('complete registration')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/signUp';
        }
      }
      // 2. Multi-tenant access revocation scenario (store suspended, role removed, or membership revoked)
      else if (
        message.includes('permission to access this store') ||
        message.includes('suspended') ||
        message.includes('Role belongs to another store') ||
        message.includes('Only the store owner can perform this action')
      ) {
        console.warn('[API INTERCEPTOR] Store-level access rejected (403):', message);

        if (typeof window !== 'undefined') {
          // Clear active store ID from local storage
          localStorage.removeItem(WORKSPACE_STORAGE_KEY);

          // Dispatch event for UI notification and reactive workspace list refresh
          window.dispatchEvent(
            new CustomEvent('vyapar:workspace_revoked', {
              detail: { message },
            })
          );

          // If currently inside an affected store dashboard page, redirect back to workspace selector
          if (window.location.pathname.startsWith('/storeDashboard/')) {
            window.location.href = '/storeDashboard?revoked=true';
          }
        }
      }
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

// API methods
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);
export const apiPatch = (url, data = {}, config = {}) => api.patch(url, data, config);

export default api;
