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
    // Add other fields like distance, facilities if needed later
} 