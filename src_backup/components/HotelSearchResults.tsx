import React, { useState, useMemo } from 'react';
import { Hotel } from '@/services/hotelService';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface HotelSearchResultsProps {
  hotels: Hotel[];
  isLoading: boolean;
  error: string | null;
  onHotelSelect: (hotel: Hotel) => void;
}

const MAX_PRICE = 1000; // Example max price for slider

export const HotelSearchResults: React.FC<HotelSearchResultsProps> = ({
  hotels,
  isLoading,
  error,
  onHotelSelect,
}) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // Get unique ratings from hotels
  const uniqueRatings = Array.from(new Set(hotels.map(hotel => parseFloat(hotel.rating)))).sort();

  // Get unique facilities from hotels
  const uniqueFacilities = Array.from(
    new Set(hotels.flatMap(hotel => hotel.facilities.map(f => f.name)))
  ).sort();

  // Extract all unique facilities for filter options
  const allFacilities = useMemo(() => {
    const facilitiesSet = new Set<string>();
    hotels.forEach(hotel => {
      hotel.facilities?.forEach(facility => facilitiesSet.add(facility.name));
    });
    return Array.from(facilitiesSet).sort();
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      // Price filter
      const price = hotel.rate?.perNightRate ?? 0;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // Rating filter
      const rating = parseInt(hotel.rating, 10);
      if (selectedRatings.length > 0 && !selectedRatings.includes(rating)) {
        return false;
      }

      // Facility filter
      if (selectedFacilities.length > 0) {
        const hotelFacilityNames = hotel.facilities?.map(f => f.name) ?? [];
        if (!selectedFacilities.every(sf => hotelFacilityNames.includes(sf))) {
          return false;
        }
      }

      return true;
    });
  }, [hotels, priceRange, selectedRatings, selectedFacilities]);

  // Event Handlers
  const handleRatingChange = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const handleFacilityChange = (facilityName: string) => {
    setSelectedFacilities(prev =>
      prev.includes(facilityName)
        ? prev.filter(f => f !== facilityName)
        : [...prev, facilityName]
    );
  };

  // Helper to render stars
  const renderStars = (ratingStr: string) => {
    const rating = parseInt(ratingStr, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) return null; // Handle invalid ratings
    return (
      <div className="flex items-center">
        {[...Array(rating)].map((_, i) => (
          <Star key={`filled-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ))}
        {[...Array(5 - rating)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hotels found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Column */}
        <div className="md:col-span-1 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Filter By</h3>

          {/* Price Range Filter */}
          <div>
            <Label className="text-base font-medium">Price Range (/night)</Label>
            <Slider
              min={0}
              max={MAX_PRICE} // Adjust max based on typical prices if needed
              step={10}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>£{priceRange[0]}</span>
              <span>£{priceRange[1]}{priceRange[1] === MAX_PRICE ? '+' : ''}</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <Label className="text-base font-medium">Star Rating</Label>
            <div className="space-y-2 mt-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={selectedRatings.includes(rating)}
                    onCheckedChange={() => handleRatingChange(rating)}
                  />
                  <Label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                    {renderStars(rating.toString())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Facility Filter */}
          {allFacilities.length > 0 && (
            <div>
              <Label className="text-base font-medium">Facilities</Label>
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                {allFacilities.map(facility => (
                  <div key={facility} className="flex items-center space-x-2">
                    <Checkbox
                      id={`facility-${facility}`}
                      checked={selectedFacilities.includes(facility)}
                      onCheckedChange={() => handleFacilityChange(facility)}
                    />
                    <Label htmlFor={`facility-${facility}`} className="text-sm font-normal cursor-pointer">
                      {facility}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="md:col-span-3">
          {!isLoading && !error && filteredHotels.length === 0 && (
            <div className="text-center py-8">
              <p>No hotels found matching your criteria.</p>
            </div>
          )}

          {!isLoading && !error && filteredHotels.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <div key={hotel.id} className="border rounded-lg shadow-md overflow-hidden flex flex-col bg-white">
                  <div className="relative h-48 w-full overflow-hidden">
                    {hotel.image ? (
                      <Image
                        src={hotel.image}
                        alt={hotel.hotelName}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold mb-1 text-gray-800 truncate" title={hotel.hotelName}>{hotel.hotelName}</h3>
                    {/* Address Info */}
                    <p className="text-xs text-gray-500 mb-2">
                      {hotel.address?.city?.name}, {hotel.address?.country?.name}
                    </p>
                    {/* Star Rating */}
                    <div className="mb-2">
                       {renderStars(hotel.rating)}
                    </div>
                    {/* Facilities */}
                    {hotel.facilities && hotel.facilities.length > 0 && (
                      <div className="text-xs text-gray-600 mb-3 space-x-2">
                         <span>Facilities:</span> 
                         {hotel.facilities.slice(0, 3).map(f => (
                           <span key={f.id} className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{f.name}</span>
                         ))}
                         {hotel.facilities.length > 3 && <span className="text-gray-400">...</span>}
                      </div>
                    )}
                    {/* Price - aligned to bottom */}
                    <div className="mt-auto pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">From</p>
                      <p className="text-lg font-bold text-[#002855]">
                        £{hotel.rate?.perNightRate?.toFixed(2) ?? 'N/A'} <span className="text-xs font-normal text-gray-500">/ night</span>
                      </p>
                      <button
                        onClick={() => onHotelSelect(hotel)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                      >
                        Select Hotel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 