import { API_CONFIG, getHeaders, LocationSuggestion, HotelSearchParams as ApiHotelSearchParams, AutosuggestResponse } from './api'
import { api } from './api'
import axios, { AxiosError } from 'axios'

// Updated interfaces for new endpoints
export interface RoomRate {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  rates: {
    currency: string;
    baseRate: number;
    totalRate: number;
    taxes: {
      type: string;
      amount: number;
    }[];
    cancellationPolicies: {
      deadline: string;
      amount: number;
      type: string;
    }[];
  };
  amenities: string[];
  images: string[];
}

export interface BookingDetails {
  bookingId: string;
  status: string;
  hotelDetails: Hotel;
  roomDetails: RoomRate;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentInfo: {
    amount: number;
    currency: string;
    status: string;
  };
  checkIn: string;
  checkOut: string;
  cancellationPolicy: {
    deadline: string;
    refundAmount: number;
    penaltyAmount: number;
  };
}

// Updated SearchParams to match API requirements
interface SearchParams {
  locationId: string; // Changed from location: string
  checkInDate: string; // Changed from checkIn: string
  checkOutDate: string; // Changed from checkOut: string
  occupancies: {
    numOfRoom: number;
    numOfAdults: number;
    numOfChildren: number;
    childAges: number[];
  }[];
  // Optional params based on testing
  lat?: number;
  lng?: number;
  nationality?: string;
  type?: string; // e.g., CITY
  destinationCountryCode?: string;
  radius?: number;
  isPolling?: boolean;
  countryOfResidence?: string;
  currency?: string;
}

// Define Hotel interface based on successful API response structure
export interface Hotel {
  id: string;
  hotelName: string; // Changed from name
  rate: {
    currency: string;
    baseRate: number;
    totalRate: number;
    publishedRate: number;
    perNightRate: number;
  };
  lat: string; // API returns strings
  lng: string; // API returns strings
  rating: string; // API returns string
  facilities: {
    groupId: string;
    id: string;
    name: string;
  }[];
  address: {
    line1: string;
    city: { name: string; code?: string };
    state: { name?: string }; // State might not always be present
    country: { name: string; code: string };
  };
  freeCancellation: boolean;
  image: string;
  distance?: string; // Optional based on response
  distanceFrom?: string; // Optional based on response
  reviews?: {
    count: string;
    rating: string;
  }[];
  isRecommended?: boolean; // Optional based on response
}

class HotelService {
  // Removed baseUrl as it's handled by the Axios instance

  async searchHotels(params: SearchParams): Promise<Hotel[]> {
    try {
      const response = await api.post('/api/ext/hotelsearch', params);
      return response.data.data.hotels || [];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return []; // Return empty array for no results
      }
      throw error;
    }
  }

  async getLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
    if (!query || query.trim().length === 0) {
      console.log('Empty query provided to getLocationSuggestions');
      return [];
    }

    try {
      console.log('Making autosuggest request with query:', query);
      const response = await api.post<AutosuggestResponse>('/api/ext/hotel/autosuggest', {
        text: query.trim()
      });

      console.log('Autosuggest API response:', response.data);

      // Check for 401 unauthorized
      if (response.status === 401) {
        console.error('Unauthorized access to autosuggest API');
        throw new Error('Unauthorized access. Please check API key.');
      }

      // Return empty array if no suggestions
      if (!response.data?.data?.locationSuggestions) {
        return [];
      }

      return response.data.data.locationSuggestions;

    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          console.error('Unauthorized: Invalid API key or missing credentials');
          throw new Error('Unauthorized access. Please check API key.');
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
  }

  async getHotelDetails(hotelId: string): Promise<Hotel> {
    try {
      const response = await api.get(`/api/ext/hotel/${hotelId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Enhanced getRoomsAndRates with proper typing
  async getRoomsAndRates(params: {
    checkInDate: string;
    checkOutDate: string;
    currency: string;
    hotelId: string;
    occupancies: {
      childAges: number[];
      numOfAdults: number;
      numOfChildren: number;
      numOfRoom: number;
    }[];
  }): Promise<RoomRate[]> {
    try {
      const response = await api.post('/api/ext/hotel/roomsandrates', params);
      return response.data.data.rooms || [];
    } catch (error) {
      throw error;
    }
  }

  // Get price recommendation for a specific room
  async getPriceRecommendation(hotelId: string, sessionId: string, roomChoiceId: string) {
    try {
      const response = await api.get(
        `/api/ext/hotel/${hotelId}/${sessionId}/price/recommendation/${roomChoiceId}`
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Book a hotel room with proper typing
  async bookHotel(
    hotelId: string,
    token: string,
    params: {
      guestInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        specialRequests?: string;
      };
      paymentInfo: {
        cardNumber: string;
        expiryMonth: string;
        expiryYear: string;
        cvv: string;
        cardHolderName: string;
      };
      roomId: string;
      checkInDate: string;
      checkOutDate: string;
      occupancy: {
        adults: number;
        children: number;
        childAges: number[];
      };
    }
  ): Promise<BookingDetails> {
    try {
      const response = await api.post(`/api/ext/hotel/${hotelId}/${token}/book`, params);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Get booking details
  async getBookingDetails(bookingId: string, currency: string): Promise<BookingDetails> {
    try {
      const response = await api.get('/api/ext/hotel/getBookingDetails', {
        params: { bookingId, currency }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Get cancellation penalties
  async getCancellationPenalties(bookingId: string) {
    try {
      const response = await api.get('/api/ext/hotel/bookingCancellationFee', {
        params: { bookingId }
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId: string, token: string) {
    try {
      const response = await api.post('/api/ext/hotel/booking/cancel', { bookingId, token });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export const hotelService = new HotelService(); 