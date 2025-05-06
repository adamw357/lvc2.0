'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { LocationAutocomplete } from './LocationAutocomplete'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import "../styles/datepicker.css"
import { GuestSelector } from './GuestSelector'
// Remove unused imports if hotelService is no longer called directly here
// import { hotelService } from '../services/hotelService' 
import { format } from 'date-fns'
import { MapPinIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/outline'
// Remove imports for components no longer rendered here
// import { HotelSearchResults } from './HotelSearchResults'
// import { Hotel } from '../types/hotel'
// import { HotelDetailsModal } from './HotelDetailsModal'

// Define type for a single room's occupancy
interface Occupancy {
  adults: number;
  children: number;
  childAges: number[]; // Keep childAges even if not used in UI yet
}

// Refined type for the *content* of the details modal
interface HotelDetailsContent {
  overview?: { description?: string; name?: string; /* other fields */ };
  images?: { url?: string; size?: string; /* other fields */ }[];
  facilities?: { name?: string; /* other fields */ }[];
  // Add rooms/rates structure once known
  rooms?: any[]; 
  // ... add other expected fields from the hotel object ...
  hotelName?: string; // Fallback if overview.name is missing
}

// Type for the raw API response
interface HotelDetailsApiResponse {
  status?: boolean;
  message?: string;
  data?: {
    hotel?: HotelDetailsContent;
  };
}

// Define the loading messages
const loadingMessages = [
  'Scanning Global Inventory...',
  'Finding exclusive deals...',
  'Accessing LVC member rates!'
];

// Define props for the component
interface BookingWidgetProps {
  onSearch: (searchParams: any) => void; // Callback function for search
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ onSearch }) => {
  const [locationId, setLocationId] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locationType, setLocationType] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [occupancies, setOccupancies] = useState<Occupancy[]>([
    { adults: 2, children: 0, childAges: [] } // Initial state: 1 room, 2 adults
  ])
  const [error, setError] = useState('')
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleLocationSelect = (locationId: string, locationName: string, lat: number, lng: number) => {
    console.log('handleLocationSelect received:', { locationId, locationName, lat, lng });
    setLocationId(locationId);
    setLat(lat);
    setLng(lng);
    setLocationType(''); // Set a default value or remove if not needed
    setError(''); // Clear error on new selection
  }

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setCheckIn(start);
    setCheckOut(end);
    if (start && end) {
        setIsDatePickerOpen(false);
        setError(''); // Clear error
    }
  };

  const dateRangeText = useMemo(() => {
    if (!checkIn || !checkOut) return 'Dates';
    return `${format(checkIn, 'MMM d')} - ${format(checkOut, 'MMM d')}`;
  }, [checkIn, checkOut]);

  // Update guestText calculation to use the occupancies array
  const guestText = useMemo(() => {
    const totalAdults = occupancies.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = occupancies.reduce((sum, room) => sum + room.children, 0);
    const totalTravelers = totalAdults + totalChildren;
    const roomCount = occupancies.length;
    return `${totalTravelers} traveler${totalTravelers !== 1 ? 's' : ''}, ${roomCount} room${roomCount !== 1 ? 's' : ''}`;
  }, [occupancies]);

  // Modify handleSearch to call the onSearch prop
  const handleSearch = () => { // No longer async needed here
    console.log('BookingWidget: handleSearch called. State:', { locationId, lat, lng, locationType, checkIn, checkOut });
    setError(''); // Clear previous validation errors

    // Input Validation
    if (!locationId || !checkIn || !checkOut) {
      setError('Please fill in location, check-in, and check-out dates')
      return
    }
    if (lat == null || lng == null || locationType == null) {
        setError('Location data is incomplete. Please re-select your destination.');
        console.error('Missing required location data:', { lat, lng, locationType });
        return;
    }

    // Construct occupancies for the API format
    const apiOccupancies = occupancies.map(room => ({
      numOfRoom: 1, // Assuming 1 for now, adjust if needed
      numOfAdults: room.adults,
      numOfChildren: room.children,
      childAges: room.childAges
    }));

    // Construct search parameters object
    const searchParams = {
      locationId,
      checkInDate: checkIn.toISOString().split('T')[0],
      checkOutDate: checkOut.toISOString().split('T')[0],
      occupancies: apiOccupancies,
      lat: lat,
      lng: lng,
      type: locationType,
      // Keep other default params or make them configurable later
      nationality: 'US',
      destinationCountryCode: 'US',
      radius: 20,
      countryOfResidence: 'US',
      currency: 'USD',
    }
    
    console.log("BookingWidget: Calling onSearch prop with params:", searchParams);
    
    // Call the onSearch function passed from the parent (page.tsx)
    onSearch(searchParams); 
  }

  const inputBaseClasses = "w-full h-[52px] pl-10 pr-4 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center bg-white rounded-lg";
  const iconWrapperClasses = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5";

  return (
    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-[2250px] mx-auto mt-[-40px] relative z-10">
      {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
      
      <div className="flex flex-nowrap items-center gap-6"> 
        
        {/* Location Input Wrapper - Remove fixed width, add flex-1 */}
        <div className="relative w-full md:w-auto flex-1">
            <MapPinIcon className={iconWrapperClasses} />
            <LocationAutocomplete 
                onLocationSelect={handleLocationSelect} 
                inputClassName={inputBaseClasses}
            />
        </div>

        {/* Check-in/Check-out Date Picker Wrapper - Remove fixed width, add flex-1 */}
        <div className="relative w-full md:w-auto flex-1">
            <CalendarDaysIcon className={iconWrapperClasses} />
            <DatePicker
                selected={checkIn}
                onChange={handleDateChange}
                selectsRange
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                monthsShown={2}
                onFocus={() => setIsDatePickerOpen(true)}
                onBlur={() => setTimeout(() => setIsDatePickerOpen(false), 150)}
                open={isDatePickerOpen}
                placeholderText="Check-in - Check-out"
                className={inputBaseClasses}
                dateFormat="MMM d, yyyy"
                wrapperClassName="w-full"
            />
        </div>

        {/* Guest Selector Wrapper - Remove fixed width, add flex-1 */}
        <div className="relative w-full md:w-auto flex-1">
            <UserGroupIcon className={iconWrapperClasses} />
            <button
                type="button"
                onClick={() => setIsGuestSelectorOpen(!isGuestSelectorOpen)}
                className="w-full h-[52px] pl-10 pr-4 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white rounded-lg text-left truncate text-gray-800"
            >
                <span>{guestText}</span>
            </button>
            {isGuestSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
                  <GuestSelector
                    occupancies={occupancies}
                    onOccupanciesChange={setOccupancies}
                    onClose={() => setIsGuestSelectorOpen(false)}
                  />
                </div>
           )}
        </div>

        {/* Search Button - Remains fixed width (implicitly by padding/content) */}
        <button
          type="button" 
          onClick={handleSearch}
          className="flex-shrink-0 w-full md:w-auto h-[52px] bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap flex items-center justify-center"
        >
          Search
        </button>
      </div>

      {/* Comments indicating removed sections */}
      {/* Rendering of results and modal are handled by the parent component */}
    </div>
  )
} 