// src/types/hotel.ts

// Centralized Hotel type definition based on observed API data
export interface Hotel {
    id: string;
    hotelName: string;
    image?: string;
    address?: {
        line1?: string;
        city?: { name?: string };
        state?: { name?: string };
        country?: { code?: string };
    };
    rate?: {
        currency?: string;
        perNightRate?: number;
        totalRate?: number; // Added from log observation
        baseRate?: number; // Added from log observation
    };
    rating?: string;
    freeCancellation?: boolean;
    lat?: string;
    lng?: string;
    facilities?: { groupId?: string; id?: string; name?: string }[];
    // Add other fields like distance, facilities if needed later
}

// Define the detailed RoomRate type based on API response
export interface RoomRate {
  groupId?: string;
  name?: string;
  beds?: { type?: string; count?: string }[];
  totalSleep?: number;
  roomArea?: string;
  availability?: string;
  roomRating?: string;
  images?: { links?: { url?: string; size?: string; }[]; caption?: string }[];
  roomAmenities?: string[];
  extra?: { 
    additionalCharges?: any[][]; 
    boardBasis?: string;
    cancellationPolicies?: any[];
    price?: { 
      total?: number;
      baseRate?: number;
      TaxAndExtras?: number;
      publishedRate?: number;
      perNightStay?: number;
    };
    showPublishedPrice?: boolean;
    refundability?: string;
    refundable?: boolean;
    recommendationId?: string;
    rateId?: string[];
    isPackageRate?: boolean;
    policies?: any[];
    currency?: string;
  }[];
  rateId?: string | null; 
  roomId?: string; 
} 