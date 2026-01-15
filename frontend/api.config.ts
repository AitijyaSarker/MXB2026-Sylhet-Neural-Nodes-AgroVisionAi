// API configuration for both development and production
export const getAPIBaseURL = (): string => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  // Client-side
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getAPIBaseURL();
export const DISEASE_API = `${API_BASE_URL}/api/disease`;
export const MESSAGES_API = `${API_BASE_URL}/api/messages`;
export const AUTH_API = `${API_BASE_URL}/api/auth`;
