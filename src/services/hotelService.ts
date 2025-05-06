import { api } from './api'
import { AxiosError } from 'axios'
import { XENI_API_KEY, XENI_BASE_URL } from '../config/xeni'

export interface SearchParams {
  locationId: string
  checkInDate: string
  checkOutDate: string
  occupancies: {
    numOfRoom: number
    numOfAdults: number
    numOfChildren: number
    childAges: number[]
  }[]
  lat: number
  lng: number
  nationality: string
  type: string
  destinationCountryCode?: string
  radius?: number
  isPolling?: boolean
  countryOfResidence?: string
  currency?: string
  filterBy?: object
}

export interface LocationSuggestion {
  id: string
  name: string
  type: string
  coordinates: { 
    lat: number;
    long: number;
  };
  country?: string;
  fullName?: string;
  isTermMatch?: boolean;
  referenceScore?: number;
  code?: string;
}

export const hotelService = {
  searchHotels: async (params: SearchParams, page: number = 1, limit: number = 50) => {
    const url = `/api/ext/hotelSearch?page=${page}&limit=${limit}`;
    const response = await api.post(url, params)
    return response.data
  },

  getLocationSuggestions: async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.trim().length === 0) {
      console.log('Query is empty, returning empty array');
      return [];
    }

    try {
      console.log('Making autosuggest request with query:', query);
      const response = await api.post('/api/ext/hotel/autosuggest', {
        text: query.trim()
      });

      console.log('Autosuggest API response:', response.data);

      if (response.data?.status === true && response.data?.data?.locationSuggestions) {
        console.log('Found suggestions:', response.data.data.locationSuggestions);
        return response.data.data.locationSuggestions;
      }

      console.warn('Unexpected response structure from autosuggest:', response.data);
      return [];
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          console.warn('Invalid autosuggest request:', error.response?.data?.message);
        } else {
          console.error('Autosuggest API error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
        }
      } else {
        console.error('Unexpected error during autosuggest:', error);
      }
      return [];
    }
  },

  getHotelDetails: async (hotelId: string) => {
    if (!hotelId) {
      throw new Error("Hotel ID is required to fetch details.");
    }
    const url = `/api/ext/hotel/details?hotelId=${hotelId}`;
    console.log(`Fetching hotel details from: ${url}`);
    try {
      const response = await api.get(url);
      console.log("Hotel Details API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch details for hotel ID ${hotelId}:`, error);
      throw error;
    }
  },

  getRoomsAndRates: async (params: {
    hotelId: string;
    checkInDate: string; 
    checkOutDate: string;
    occupancies: any[]; 
    lat: number;
    lng: number;
    currency: string;
  }) => {
    const path = '/api/ext/hotel/roomsandrates';
    const cleanBaseUrl = XENI_BASE_URL.replace(/\/$/, ''); 
    const cleanPath = path.replace(/^\//, '');
    const url = `${cleanBaseUrl}/${cleanPath}`;
    
    const sessionId = crypto.randomUUID();

    const requestBody = JSON.stringify(params);
    const headers = {
      'Content-Type': 'application/json',
      'x-xeni-token': XENI_API_KEY,
      'x-session-id': sessionId,
      'corelationId': sessionId,
    };

    console.log('hotelService.getRoomsAndRates: Calling API', { url, method: 'POST', headers, body: requestBody });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: requestBody,
      });

      // No need to get raw text first if response is ok
      // console.log('hotelService.getRoomsAndRates: Raw Response Text:', responseText); 

      if (!response.ok) {
        // Try to get error details from text response if not ok
        let errorDetails = response.statusText;
        try {
          const errorText = await response.text(); 
          const errorMatch = errorText.match(/<pre>(.*?)<\/pre>/i);
          if (errorMatch && errorMatch[1]) {
            errorDetails = errorMatch[1];
          }
        } catch {}
        console.error(`hotelService.getRoomsAndRates: API Error Status ${response.status} - ${errorDetails}`);
        throw new Error(`Failed to fetch rooms and rates: ${errorDetails} (Status: ${response.status})`);
      }

      // Use response.json() to parse directly
      const data = await response.json();
      
      return data; // Return the parsed data
      
    } catch (error) {
      // Catch errors from fetch, response.ok check, or response.json()
      console.error('hotelService.getRoomsAndRates: Fetch or JSON processing failed', error);
      if (error instanceof Error) {
         throw new Error(`Processing rooms/rates failed: ${error.message}`);
      } else {
         throw new Error('Processing rooms/rates failed due to an unknown error.');
      }
    }
  },

  // New function for combined Hotel Detail Page data
  getHotelPageDetails: async (params: {
    hotelId: string;
    checkInDate: string;
    checkOutDate: string;
    occupancies: any[]; 
    lat: number;
    lng: number;
    currency: string;
    destinationISOCode: string;
    nationalityISOCode: string;
    type: string; 
  }) => {
    // --- Format Occupancy Differently --- 
    // Extract details from the first occupancy object
    const firstOccupancy = params.occupancies?.[0];
    const adults = firstOccupancy?.numOfAdults?.toString();
    const children = firstOccupancy?.numOfChildren?.toString();
    // TODO: Figure out how to send childAges if needed

    // Construct query parameters
    const queryParamsObj: Record<string, string> = {
      hotelId: params.hotelId,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      currency: params.currency,
      destinationISOCode: params.destinationISOCode,
      nationalityISOCode: params.nationalityISOCode,
      type: params.type,
    };
    // Add occupancy params only if they exist
    if (adults) queryParamsObj.numOfAdults = adults;
    if (children) queryParamsObj.numOfChildren = children;
    // if (params.occupancies) queryParamsObj.occupancies = JSON.stringify(params.occupancies); // Removed this line

    const queryParams = new URLSearchParams(queryParamsObj).toString();
    // -----------------------------------

    const url = `/api/ext/hotelDetails?${queryParams}`;
    const sessionId = crypto.randomUUID();

    console.log('hotelService.getHotelPageDetails: Calling API', { url, method: 'GET' });

    try {
      const response = await api.get(url, {
        headers: {
          'x-xeni-token': XENI_API_KEY,
          'x-session-id': sessionId, 
          'corelationId': sessionId,
        }
      });
      
      console.log('hotelService.getHotelPageDetails: API Success', response.data);
      return response.data; 
    } catch (error) {
      console.error('hotelService.getHotelPageDetails: Fetch failed', error);
      if (error instanceof AxiosError) {
        console.error('Axios error details:', {
           status: error.response?.status,
           data: error.response?.data,
           message: error.message
        });
        throw new Error(`Fetching hotel details failed: ${error.response?.data?.message || error.message}`);
      } else if (error instanceof Error) {
         throw new Error(`Fetching hotel details failed: ${error.message}`);
      } else {
         throw new Error('Fetching hotel details failed due to an unknown error.');
      }
    }
  },
} 