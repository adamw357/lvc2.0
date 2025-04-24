import React from 'react';

// Import the Filters type (adjust path if needed)
import { Filters } from '../app/page'; // Assuming page.tsx is one level up
import { MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

// TODO: Define props for filter state and handlers
interface FilterSidebarProps {
  // Example props:
  // onFilterChange: (filters: any) => void;
  // initialFilters: any;
  filters: Filters; 
  onFilterChange: (newFilters: Partial<Filters>) => void;
  // Add props for sorting
  sortBy: string; 
  onSortChange: (newSortValue: string) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  filters, 
  onFilterChange, 
  sortBy, 
  onSortChange 
}) => {

  // Handler for star rating checkbox changes
  const handleStarChange = (rating: number) => {
    const currentRatings = filters.starRating || [];
    let newRatings;
    if (currentRatings.includes(rating)) {
      // Remove rating if already selected
      newRatings = currentRatings.filter(r => r !== rating);
    } else {
      // Add rating if not selected
      newRatings = [...currentRatings, rating];
    }
    onFilterChange({ starRating: newRatings });
  };

  // Handler for amenity checkbox changes (Example)
  const handleAmenityChange = (amenityId: string) => {
    const currentAmenities = filters.amenities || [];
    let newAmenities;
    if (currentAmenities.includes(amenityId)) {
      newAmenities = currentAmenities.filter(a => a !== amenityId);
    } else {
      newAmenities = [...currentAmenities, amenityId];
    }
    onFilterChange({ amenities: newAmenities });
  };

  // Handler to clear all filters
  const handleClearFilters = () => {
    onFilterChange({
      starRating: [],
      amenities: [],
      // Reset other filters like price here too
      // minPrice: undefined,
      // maxPrice: undefined,
    });
  };

  // Helper to check if a star rating is selected
  const isStarSelected = (rating: number) => (filters.starRating || []).includes(rating);

  // Helper to check if an amenity is selected (Example)
  const isAmenitySelected = (amenityId: string) => (filters.amenities || []).includes(amenityId);

  // Example Amenities (replace with actual data/constants later)
  const exampleAmenities = [
    { id: 'wifi', label: 'Free WiFi' },
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'parking', label: 'Parking' },
    { id: 'gym', label: 'Fitness Center' },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white p-6 rounded-lg shadow-lg h-fit sticky top-24">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Filter & Sort</h2>
      
      {/* Sort By Section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-gray-700">Sort By</h3>
        <select 
          id="sort-by"
          value={sortBy} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSortChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          {/* Add a default/relevance option if needed */}
          {/* <option value="relevance">Recommended</option> */}
          <option value="price_desc">Price: High to Low</option>
          <option value="price_asc">Price: Low to High</option>
          {/* Add other sort options like rating if needed */}
        </select>
      </div>

      {/* Star Rating Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-gray-700">Star Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center">
              <input 
                type="checkbox" 
                id={`${rating}star`} 
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={isStarSelected(rating)}
                onChange={() => handleStarChange(rating)} 
              />
              <label htmlFor={`${rating}star`} className="text-gray-600 flex items-center cursor-pointer">
                <span className="text-yellow-500">{'★'.repeat(rating)}</span>
                <span className="text-gray-400">{'☆'.repeat(5 - rating)}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-gray-700">Amenities</h3>
        <div className="space-y-2">
          {exampleAmenities.map(amenity => (
            <div key={amenity.id} className="flex items-center">
              <input 
                type="checkbox" 
                id={amenity.id} 
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={isAmenitySelected(amenity.id)}
                onChange={() => handleAmenityChange(amenity.id)}
              />
              <label htmlFor={amenity.id} className="text-gray-600 cursor-pointer">{amenity.label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 border-t pt-4 flex flex-col gap-2">
        <button 
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>
    </aside>
  );
}; 