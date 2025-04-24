import axios, { AxiosError } from 'axios';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_XENI_API_URL,
  API_KEY: process.env.NEXT_PUBLIC_XENI_API_KEY,
}

if (!API_CONFIG.BASE_URL || !API_CONFIG.API_KEY) {
  console.error('Missing API configuration:', {
    baseUrl: API_CONFIG.BASE_URL ? '[SET]' : '[MISSING]',
    apiKey: API_CONFIG.API_KEY ? '[SET]' : '[MISSING]'
  });
}

// Test API connection
export async function testApiConnection() {
  try {
    console.log('API Test: Starting connection test...');
    console.log('API Test: Using base URL:', API_CONFIG.BASE_URL);
    console.log('API Test: API key present:', !!API_CONFIG.API_KEY);

    const response = await api.post('/api/ext/hotel/autosuggest', {
      text: 'London'
    });
    
    console.log('API Test: Response status:', response.status);
    console.log('API Test: Response data:', response.data);
    
    return response.status === 200 && response.data?.status === true;
  } catch (error) {
    console.error('API Test: Connection test failed:', error);
    return false;
  }
}

// Common headers for all API requests
export const getHeaders = (sessionId: string) => ({
  'x-api-key': API_CONFIG.API_KEY,
  'accept-language': 'en',
  'x-session-id': sessionId,
  'Content-Type': 'application/json',
})

// Types for Hotel API
export interface LocationSuggestion {
  id: string;
  name: string;
  fullName: string;
  type: string;
  country: string;
  coordinates: {
    lat: number;
    long: number;
  };
}

export interface AutosuggestResponse {
  status: boolean;
  message: string;
  data?: {
    locationSuggestions?: LocationSuggestion[];
  };
}

export interface HotelSearchParams {
  checkInDate: string
  checkOutDate: string
  lat: number
  lng: number
  nationality: string
  type: string
  occupancies: {
    numOfRoom: number
    numOfAdults: number
    numOfChildren: number
    childAges: number[]
  }[]
  destinationCountryCode: string
  radius: number
  isPolling: boolean
  countryOfResidence: string
  currency: string
  locationId: string
  filterBy?: {
    sortOrder?: string
    sortBy?: string
    distance?: number
    rating?: number[]
    exclusiveDeal?: boolean
    inclusiveDeal?: boolean
    services?: string[]
    searchByHotelname?: string
  }
}

// API Error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_CONFIG.API_KEY,
    'accept-language': 'en'
  }
});

// Add request interceptor for session ID
api.interceptors.request.use(
  (config) => {
    // Generate a unique session ID for each request
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    if (config.headers) {
      config.headers['x-session-id'] = sessionId;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
); 