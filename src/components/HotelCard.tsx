import React from 'react';
import Image from 'next/image'; // Using next/image for optimization
import { StarIcon } from '@heroicons/react/24/solid'; // Solid star for rating
import { Hotel } from '../types/hotel'; // Import central Hotel type

// Remove local Hotel interface definition
// interface Hotel { ... }

interface HotelCardProps {
  hotel: Hotel;
  isSelected: boolean; // Prop to know if card is selected
  onSelect: () => void; // Callback prop for when card is clicked
}

// Helper to render star ratings
const renderStars = (rating?: string) => {
  const numRating = rating ? parseInt(rating, 10) : 0;
  if (isNaN(numRating) || numRating <= 0) return null;

  return (
    <div className="flex items-center">
      {Array.from({ length: numRating }, (_, i) => (
        <StarIcon key={i} className="h-4 w-4 text-yellow-500" />
      ))}
      {Array.from({ length: 5 - numRating }, (_, i) => (
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
};

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, isSelected, onSelect }) => {
  const { hotelName, image, address, rate, rating, freeCancellation } = hotel;

  const formattedRate = rate?.perNightRate
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: rate.currency || 'USD' }).format(rate.perNightRate)
    : 'N/A';

  const location = [
    address?.city?.name,
    address?.state?.name,
    address?.country?.code
  ].filter(Boolean).join(', ');

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 cursor-pointer
                  ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'}`}
      onClick={onSelect} // Call onSelect when div is clicked
    >
      <div className="relative w-full aspect-video overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={hotelName}
            fill // Use fill layout
            style={{ objectFit: 'cover' }} // Ensure image covers the area
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Provide sizes for optimization
            className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
            // Add error handling if needed
            // onError={(e) => e.currentTarget.src = '/placeholder-image.png'} 
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {rating && renderStars(rating)}
          <h3 className="text-lg font-semibold text-gray-800 mt-1 mb-1 truncate" title={hotelName}>{hotelName}</h3>
          {address?.line1 && <p className="text-sm text-gray-600 truncate mb-1" title={address.line1}>{address.line1}</p>}
          {location && <p className="text-sm text-gray-500 truncate mb-2" title={location}>{location}</p>}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{formattedRate}</p>
            <p className="text-xs text-gray-500">per night</p>
          </div>
          {freeCancellation && (
            <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Free cancellation</span>
          )}
        </div>
      </div>
    </div>
  );
}; 