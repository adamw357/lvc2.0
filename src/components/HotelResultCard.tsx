import React from 'react';
import Image from 'next/image';
import { Hotel } from '@/types/hotel'; // Import the shared Hotel type
import { MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/solid'; // Import an icon for location and CheckCircleIcon

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

export const HotelResultCard: React.FC<HotelResultCardProps> = ({ hotel, onViewDetails }) => {
  // Convert rating string to number for star calculation, default to 0 if invalid
  const ratingNumber = parseInt(hotel.rating || '0', 10) || 0;
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
            {/* Render stars based on ratingNumber */}
            <span className="text-yellow-500 mr-2">{'★'.repeat(ratingNumber)}{'☆'.repeat(5 - ratingNumber)}</span>
            {/* TODO: Add review count if available in API response */}
            {/* {hotel.reviewCount && <span className="text-sm text-gray-500">({hotel.reviewCount} reviews)</span>} */}
          </div>
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
            {/* Display price if available */}
            {pricePerNight !== undefined ? (
              <>
                <span className="text-lg font-bold text-gray-900">${pricePerNight.toFixed(2)}</span>
                <span className="text-sm text-gray-500"> / night</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Price not available</span>
            )}
          </div>
          <button 
            onClick={() => onViewDetails(hotel.id)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}; 