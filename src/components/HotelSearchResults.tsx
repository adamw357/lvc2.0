import React from 'react';
import { HotelCard } from './HotelCard'; // Import the card component
import { Hotel } from '../types/hotel'; // Import central Hotel type

// Remove local Hotel interface definition
// interface Hotel { ... }

interface HotelSearchResultsProps {
  hotels: Hotel[] | null; // Accept null for initial state
  selectedHotelId: string | null; // Prop for selected ID
  onHotelSelect: (hotelId: string) => void; // Callback prop
}

export const HotelSearchResults: React.FC<HotelSearchResultsProps> = ({ 
  hotels, 
  selectedHotelId, 
  onHotelSelect 
}) => {
  // Handle the case where hotels is null (search not yet run)
  if (hotels === null) {
    return null; // Don't render anything before search
  }

  // Handle the case where search ran but found nothing
  if (hotels.length === 0) {
    return (
      <div className="text-center p-4 text-gray-600">
        No hotels found matching your criteria.
      </div>
    );
  }

  // Render the grid of hotels
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hotels.map((hotel) => (
        <HotelCard 
          key={hotel.id} 
          hotel={hotel} 
          isSelected={hotel.id === selectedHotelId}
          onSelect={() => onHotelSelect(hotel.id)}
        />
      ))}
    </div>
  );
}; 