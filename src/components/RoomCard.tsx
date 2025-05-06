import React, { useState } from 'react';
import Image from 'next/image';
import { RoomRate } from '@/types/hotel'; // Import the shared type
import { UserGroupIcon, NoSymbolIcon } from '@heroicons/react/24/outline'; // Keep UserGroupIcon and NoSymbolIcon
import { Bed, Cigarette } from 'lucide-react'; // Import Bed icon from Lucide and Cigarette icon

interface RoomCardProps {
  room: RoomRate;
  currency?: string | null; // Pass currency from parent
  onSelectRoom: (room: RoomRate) => void; // Pass handler function
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, currency, onSelectRoom }) => {
  const [isAmenitiesExpanded, setIsAmenitiesExpanded] = useState(false);

  // Extract data from room prop
  const roomImageUrl = room.images?.[0]?.links?.[1]?.url || room.images?.[0]?.links?.[0]?.url;
  const roomPriceInfo = room.extra?.[0]?.price;
  const pricePerNight = roomPriceInfo?.perNightStay;
  const totalPrice = roomPriceInfo?.total;
  const displayPrice = typeof pricePerNight === 'number' ? pricePerNight : (typeof totalPrice === 'number' ? totalPrice : undefined);
  const priceLabel = typeof pricePerNight === 'number' ? ' / night' : (typeof totalPrice === 'number' ? ' total' : '');
  const amenities = room.roomAmenities || [];
  const amenitiesToShow = isAmenitiesExpanded ? amenities : amenities.slice(0, 6);

  // --- Smoking Preference Logic ---
  let smokingPref: 'non-smoking' | 'smoking' | null = null;
  const lowerCaseAmenities = amenities.map(a => a.toLowerCase());
  if (lowerCaseAmenities.includes('non-smoking')) {
    smokingPref = 'non-smoking';
  } else if (lowerCaseAmenities.includes('smoking')) { // Check for explicit smoking allowed
    smokingPref = 'smoking';
  }
  // --- End Smoking Logic ---

  // Skip rendering if no image (as decided before)
  if (!roomImageUrl) {
    return null;
  }

  const toggleAmenities = () => {
    setIsAmenitiesExpanded(!isAmenitiesExpanded);
  };

  return (
    <div 
      key={room.rateId || room.groupId || room.roomId} 
      className="border p-4 rounded-2xl shadow-sm bg-white flex flex-col transition-transform duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden"
    > 
      {/* Room Image Area */}
      <div className="relative aspect-video mb-3 -mx-4 -mt-4"> 
        <Image
          src={roomImageUrl}
          alt={room.name || 'Room image'}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
        />
      </div>
      
      {/* Room Name */}
      <h4 className="font-semibold text-lg mb-1">{room.name || 'Room Information'}</h4>
      
      {/* --- Icons Section --- */} 
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mb-3">
        {/* Occupancy Icon */} 
        {typeof room.totalSleep === 'number' && (
          <span className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4 text-gray-500" />
            {room.totalSleep} guest{room.totalSleep !== 1 ? 's' : ''}
          </span>
        )}
        {/* Bed Type Icon - Updated */} 
        {room.beds?.[0]?.type && (
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-gray-500" strokeWidth={1.5} /> {/* Use Bed icon */} 
            {room.beds[0].type} {room.beds[0].count ? `(${room.beds[0].count})` : ''}
          </span>
        )}

        {/* Smoking Preference Icon */} 
        {smokingPref === 'non-smoking' && (
          <span className="flex items-center gap-1">
            <NoSymbolIcon className="h-4 w-4 text-red-500" />
            Non-Smoking
          </span>
        )}
        {smokingPref === 'smoking' && (
          <span className="flex items-center gap-1">
            <Cigarette className="h-4 w-4 text-green-600" strokeWidth={1.5} />
            Smoking
          </span>
        )}
      </div>
      {/* --- End Icons Section --- */}
      
      {/* Room Amenities */}
      {amenities.length > 0 && (
        <div className="mb-3 flex-grow"> 
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Includes:</h5>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {amenitiesToShow.map((amenity, i) => (
              <span key={i} className="text-xs text-gray-600">&#8226; {amenity}</span>
            ))}
          </div>
          {/* Expand/Collapse Button */} 
          {amenities.length > 6 && (
            <button 
              onClick={toggleAmenities} 
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold mt-1 block"
            >
              {isAmenitiesExpanded ? 'Show less' : 'Show more...'}
            </button>
          )}
        </div>
      )}
      
      {/* Price and Button Container */} 
      <div className="mt-auto pt-3 border-t border-gray-100"> 
        {/* Price */}
        <p className="text-base font-medium text-gray-800 mb-2"> 
          {displayPrice !== undefined ? `$${displayPrice.toFixed(2)} ${currency || 'USD'}` : 'Price not available'}
          {displayPrice !== undefined && <span className="text-xs text-gray-500 font-normal">{priceLabel}</span>}
        </p>
        
        {/* Select Button */}
        <button 
          onClick={() => onSelectRoom(room)} // Use passed handler
          className="w-full px-3 py-1.5 bg-[#0071bc] text-white text-sm font-medium rounded-md hover:bg-[#002855] transition"
        >
          Select
        </button>
      </div>
    </div>
  );
}; 