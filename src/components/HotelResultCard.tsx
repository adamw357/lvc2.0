import React from 'react';
import Image from 'next/image';
import { Hotel } from '@/types/hotel'; // Import the shared Hotel type
import { MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/solid'; // Import an icon for location and CheckCircleIcon
import { Waves, Sparkles, Dumbbell, Wifi, Utensils, Martini } from 'lucide-react'; // Import amenity icons

// Remove the local Hotel type definition
// type Hotel = {
//   id: string;
//   name: string;
//   price: number;
//   rating: number;
//   imageUrl: string;
//   reviewCount?: number;
//   // Add other relevant fields like location, amenities summary etc.
// };

interface HotelResultCardProps {
  hotel: Hotel; // Use the imported Hotel type
  onViewDetails: (hotelId: string) => void; // Function to trigger modal
}

// --- Helper Function to Render Amenity Icons ---
// (Copied from page.tsx - consider refactoring to a shared utils file later)
const renderAmenityIcons = (facilities: Hotel['facilities']) => {
  if (!facilities || facilities.length === 0) {
    return null;
  }

  // Style adjustments: Increased size, slightly different colors
  const keyAmenities: { [key: string]: React.ReactNode } = {
    pool: <Waves key="pool" size={24} className="text-blue-600" aria-label="Pool" />, // Larger size, adjusted color
    spa: <Sparkles key="spa" size={24} className="text-pink-600" aria-label="Spa" />, // Larger size, adjusted color
    fitness: <Dumbbell key="fitness" size={24} className="text-gray-800" aria-label="Fitness Center" />, // Larger size, adjusted color
    wifi: <Wifi key="wifi" size={24} className="text-cyan-600" aria-label="Free WiFi" />, // Larger size, adjusted color
    restaurant: <Utensils key="restaurant" size={24} className="text-orange-600" aria-label="Restaurant" />, // Larger size, adjusted color
    bar: <Martini key="bar" size={24} className="text-purple-700" aria-label="Bar/Lounge" />, // Larger size, adjusted color
    // Add more mappings as needed
  };

  const foundIcons: React.ReactNode[] = [];
  const addedKeys = new Set<string>(); // Prevent duplicate icon types

  for (const facility of facilities) {
    if (foundIcons.length >= 4) break; // Limit to max 4 icons
    if (!facility.name) continue;

    const facilityNameLower = facility.name.toLowerCase();

    for (const key in keyAmenities) {
      if (facilityNameLower.includes(key) && !addedKeys.has(key)) {
        foundIcons.push(keyAmenities[key]);
        addedKeys.add(key);
        break; // Move to next facility once a match is found for this one
      }
    }
  }

  if (foundIcons.length === 0) {
    return null; // Don't render the div if no icons are found
  }

  return (
    // Adjusted spacing for larger icons, added margin bottom
    <div className="flex items-center space-x-3 my-3"> 
      {foundIcons}
    </div>
  );
};

// --- Helper Function for Rating Description ---
const getRatingDescription = (rating: number): string => {
  if (rating >= 5) return 'Excellent';
  if (rating >= 4) return 'Very Good';
  if (rating >= 3) return 'Good';
  if (rating >= 2) return 'Fair';
  if (rating >= 1) return 'Okay';
  return ''; // No description for 0 or invalid
};

export const HotelResultCard: React.FC<HotelResultCardProps> = ({ hotel, onViewDetails }) => {
  // Convert rating string to number for star calculation, default to 0 if invalid
  const ratingNumber = parseInt(hotel.rating || '0', 10) || 0;
  const ratingDescription = getRatingDescription(ratingNumber);
  const pricePerNight = hotel.rate?.perNightRate; // Use optional chaining

  // Extract address parts safely
  const city = hotel.address?.city?.name;
  const state = hotel.address?.state?.name;
  const countryCode = hotel.address?.country?.code;
  
  // Format location string
  const locationParts = [city, state, countryCode].filter(Boolean); // Filter out undefined/null parts
  const locationString = locationParts.join(', ');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 flex flex-col md:flex-row">
      {/* Image Section */}
      <div className="relative w-full md:w-1/3 h-48 md:h-auto">
        <Image
          // Use hotel.image and provide a default fallback
          src={hotel.image || '/placeholder-image.jpg'} 
          alt={hotel.hotelName} // Use hotel.hotelName
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // Add onError handler for broken images
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
        />
      </div>

      {/* Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{hotel.hotelName}</h3>
          {/* Display location if available */}
          {locationString && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{locationString}</span>
            </div>
          )}
          <div className="flex items-center mb-2">
            {/* Updated Rating Display */}
            <span className="text-yellow-500 mr-1">{'★'.repeat(ratingNumber)}{'☆'.repeat(5 - ratingNumber)}</span>
            {ratingDescription && (
              <span className="text-sm text-gray-600 font-medium">{ratingDescription}</span>
            )}
            {/* TODO: Add review count if available in API response */}
            {/* {hotel.reviewCount && <span className="text-sm text-gray-500">({hotel.reviewCount} reviews)</span>} */}
          </div>

          {/* Render Amenity Icons Here */}
          {renderAmenityIcons(hotel.facilities)}

          {/* Display Free Cancellation if available */}
          {hotel.freeCancellation && (
            <div className="flex items-center text-sm text-green-600 mb-4">
              <CheckCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>Free Cancellation</span>
            </div>
          )}
        </div>

        {/* Price and Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 pt-4 border-t border-gray-200">
          <div className="mb-2 md:mb-0">
            {pricePerNight !== undefined ? (
              <>
                <span className="text-xs text-blue-700 font-semibold block mb-0.5">LVC Member Rate</span>
                <span className="text-lg font-bold text-gray-900">${pricePerNight.toFixed(2)}</span>
                <span className="text-sm text-gray-500"> / night</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Price not available</span>
            )}
          </div>
          {/* Updated CTA Button */}
          <button 
            onClick={() => onViewDetails(hotel.id)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            View Member Rates
          </button>
        </div>
      </div>
    </div>
  );
}; 
