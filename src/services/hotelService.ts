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
        console.error('Autosuggest API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
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
    const url = '/api/ext/hotel/roomsandrates';
    const sessionId = crypto.randomUUID();

    try {
      const response = await api.post(url, params, {
        headers: {
          'x-xeni-token': XENI_API_KEY,
          'x-session-id': sessionId,
          'corelationId': sessionId,
        }
      });

      console.log('Rooms and Rates API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rooms and rates:', error);
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch rooms and rates: ${error.response?.data?.message || error.message}`);
      }
      throw error;
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

  createBooking: async (params: {
    hotelId: string;
    token: string;
    guestDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    checkInDate: string;
    checkOutDate: string;
    occupancies: any[];
    currency: string;
    rateId: string;
    recommendationId: string;
  }) => {
    const url = `/api/ext/hotel/${params.hotelId}/${params.token}/book`;
    const sessionId = crypto.randomUUID();

    try {
      const response = await api.post(url, {
        guestDetails: params.guestDetails,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        occupancies: params.occupancies,
        currency: params.currency,
        rateId: params.rateId,
        recommendationId: params.recommendationId
      }, {
        headers: {
          'x-xeni-token': XENI_API_KEY,
          'x-session-id': sessionId,
          'corelationId': sessionId,
        }
      });

      console.log('Booking API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Booking failed:', error);
      if (error instanceof AxiosError) {
        throw new Error(`Booking failed: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  },
} 