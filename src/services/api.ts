import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { XENI_API_KEY, XENI_BASE_URL } from '../config/xeni';

// Debug log for environment variables
if (typeof window === 'undefined') {
  // Only log on the server side
  // Mask most of the API key for security
  const maskedKey = XENI_API_KEY ? XENI_API_KEY.slice(0, 6) + '...' : '[NOT SET]';
  console.log('[API DEBUG] XENI_API_KEY:', maskedKey);
  console.log('[API DEBUG] XENI_BASE_URL:', XENI_BASE_URL);
}

// Generate a session ID (simple approach: generate once per module load)
const sessionId = uuidv4();

export const api = axios.create({
  baseURL: XENI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-xeni-token': XENI_API_KEY,
    'accept-language': 'en',
    'x-session-id': sessionId,
  },
});

// Add request interceptor to ensure headers are always present
api.interceptors.request.use(
  (config) => {
    if (config.headers) {
      config.headers['x-xeni-token'] = XENI_API_KEY;
      config.headers['x-session-id'] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
); 