import React from 'react';

export const RoomCardSkeleton = () => {
  return (
    <div className="border p-4 rounded-2xl shadow-sm bg-white overflow-hidden animate-pulse">
      {/* Image Placeholder */}
      <div className="aspect-video mb-3 -mx-4 -mt-4 bg-gray-300 rounded-t-lg"></div> 
      
      {/* Text Placeholders */}
      <div className="space-y-3">
        {/* Title Line */}
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        {/* Amenity Title Line */}
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        {/* Amenity Lines */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-300 rounded w-5/6"></div>
          <div className="h-2 bg-gray-300 rounded w-4/6"></div>
        </div>
        {/* Spacer to push button down (mimics flex-grow) */}
        <div className="flex-grow"></div> 
        {/* Price Line */}
        <div className="h-4 bg-gray-300 rounded w-1/2 mt-3"></div>
        {/* Button Placeholder */}
        <div className="h-8 bg-gray-300 rounded-md mt-3"></div>
      </div>
    </div>
  );
}; 