import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Determine the base URL dynamically
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // In the browser, use the current origin
    return `${window.location.origin}/api`;
  }
  // In Node.js (during SSR), use the environment variable or default
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
};

// Generate a session ID (simple approach: generate once per module load)
// A more robust solution might involve session storage or context
const sessionId = uuidv4();

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'x-xeni-token': process.env.NEXT_PUBLIC_XENI_API_KEY || '',
    'accept-language': 'en',
    'x-session-id': sessionId,
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
); 