'use client'

import React, { useState, useMemo, useEffect } from 'react';
import Navigation from '@/components/Navigation'
import { BookingWidget } from '@/components/BookingWidget'
import Image from 'next/image'
import Link from 'next/link'
import { FilterSidebar } from '@/components/FilterSidebar';
import { HotelResultCard } from '@/components/HotelResultCard';
import { HotelDetailsModal } from '@/components/HotelDetailsModal';
import { hotelService } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ClipLoader } from 'react-spinners';
import { format, addDays } from 'date-fns'; // Import date functions

// Define a type for the filters
interface Filters {
  minPrice?: number;
  maxPrice?: number;
  starRating?: number[]; // Array of selected star ratings (e.g., [4, 5])
  amenities?: string[]; // Array of selected amenity IDs/names
}

// Define possible sort options
type SortByType = 'price_asc' | 'price_desc'; // Add more later like 'rating_desc'

// TODO: Define a proper type for hotel details used by the modal
// Use the refined type from HotelDetailsModal if available and suitable
interface HotelDetailsContent { 
  overview?: { name?: string; images?: { url?: string }[]; };
  propertyInformation?: { propertyDescription?: string; };
  popularAmenities?: string[]; 
}

// Define a type for the featured hotel data structure
interface FeaturedHotelData extends Hotel { // Extend the existing Hotel type
  displayName: string; // Add the display name (e.g., "Cancun")
}

export default function Home() {
  // State for search results
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState<Filters>({
    starRating: [],
    amenities: [],
  });

  // State for sorting
  const [sortBy, setSortBy] = useState<SortByType>('price_desc'); // Default sort

  // State for the details modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedHotelDetails, setSelectedHotelDetails] = useState<HotelDetailsContent | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // State to store the context of the last successful search
  const [searchCheckIn, setSearchCheckIn] = useState<Date | null>(null);
  const [searchCheckOut, setSearchCheckOut] = useState<Date | null>(null);
  const [searchOccupancies, setSearchOccupancies] = useState<any[] | null>(null);
  const [searchLat, setSearchLat] = useState<number | null>(null);
  const [searchLng, setSearchLng] = useState<number | null>(null);
  const [searchCurrency, setSearchCurrency] = useState<string | null>(null);

  // --- State for Featured Hotels ---
  const [featuredHotels, setFeaturedHotels] = useState<FeaturedHotelData[]>([]); // Holds up to 4 hotels
  const [isFeaturedLoading, setIsFeaturedLoading] = useState<boolean>(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  // --- Fetch Featured Hotels on Mount ---
  useEffect(() => {
    const fetchFeatured = async () => {
      setIsFeaturedLoading(true);
      setFeaturedError(null);

      // Calculate dynamic dates: Today + 95 days, 1 night stay
      const today = new Date();
      const checkInDateObj = addDays(today, 95);
      const checkOutDateObj = addDays(checkInDateObj, 1);
      const checkInDateStr = format(checkInDateObj, 'yyyy-MM-dd');
      const checkOutDateStr = format(checkOutDateObj, 'yyyy-MM-dd');
      const defaultOccupancy = [{ numOfAdults: 2, numOfChildren: 0, childAges: [], numOfRoom: 1 }];

      // Define target destinations with display names and coordinates
      // Using approximate coordinates
      const destinations = [
        { lat: 21.16, lng: -86.85, displayName: 'Cancun' },
        { lat: 28.54, lng: -81.38, displayName: 'Orlando' },
        { lat: 36.17, lng: -115.14, displayName: 'Las Vegas' },
        { lat: 18.56, lng: -68.37, displayName: 'Caribbean' } // Using Punta Cana coords
      ];
      const fetched: FeaturedHotelData[] = [];
      let encounteredError = false;

      try {
        // Fetch all concurrently using Promise.allSettled
        const results = await Promise.allSettled(
          destinations.map(dest =>
            hotelService.searchHotels({
              locationId: `coords:${dest.lat},${dest.lng}`, // Use coords as a makeshift ID
              type: 'COORDINATES', // Indicate search by coords
              nationality: 'US', // Add default nationality
              lat: dest.lat,
              lng: dest.lng,
              checkInDate: checkInDateStr,
              checkOutDate: checkOutDateStr,
              occupancies: defaultOccupancy,
              // No destinationId or limit based on previous errors
            })
          )
        );

        // Process results
        results.forEach((result, index) => {
          const destInfo = destinations[index];
          if (result.status === 'fulfilled') {
            const hotelData = result.value?.data?.hotels?.[0]; // Take the first hotel returned
            if (hotelData) {
              fetched.push({ ...hotelData, displayName: destInfo.displayName });
            } else {
              console.warn(`No hotel found for destination: ${destInfo.displayName} (Coords: ${destInfo.lat},${destInfo.lng})`);
            }
          } else {
            console.error(`Failed to fetch hotel for ${destInfo.displayName}:`, result.reason);
            encounteredError = true;
          }
        });

        setFeaturedHotels(fetched);
        if (encounteredError && fetched.length < destinations.length) { // Set error only if needed and not all loaded
             setFeaturedError('Could not load all featured destinations.');
        }
      } catch (err) {
        console.error("Error fetching featured hotels:", err);
        setFeaturedError('An error occurred while fetching featured hotels.');
        setFeaturedHotels([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Function to handle the search submission from BookingWidget
  const handleSearch = async (searchParams: any) => {
    console.log("page.tsx: handleSearch received params:", searchParams);
    setIsLoading(true);
    setError(null);
    setHotels([]);
    
    // Clear previous search context
    setSearchCheckIn(null); 
    setSearchCheckOut(null);
    setSearchOccupancies(null);
    setSearchLat(null);
    setSearchLng(null);
    setSearchCurrency(null);

    try {
      const responseData = await hotelService.searchHotels(searchParams);
      console.log('page.tsx: Search API Response Raw Data:', responseData);

      // Use the exact path confirmed from logs
      // Ensure the Hotel type matches the structure in responseData.data.hotels
      const fetchedHotels: Hotel[] = responseData?.data?.hotels || []; 
      
      console.log('page.tsx: Processed Hotel Results:', fetchedHotels);
      setHotels(fetchedHotels); 

      // Store search context on successful search
      setSearchCheckIn(searchParams.checkInDate ? new Date(searchParams.checkInDate + 'T00:00:00') : null);
      setSearchCheckOut(searchParams.checkOutDate ? new Date(searchParams.checkOutDate + 'T00:00:00') : null);
      setSearchOccupancies(searchParams.occupancies);
      setSearchLat(searchParams.lat);
      setSearchLng(searchParams.lng);
      setSearchCurrency(searchParams.currency);
      
      console.log('page.tsx: Stored search context:', { 
        checkIn: searchParams.checkInDate, 
        checkOut: searchParams.checkOutDate, 
        occupancies: searchParams.occupancies, 
        lat: searchParams.lat, 
        lng: searchParams.lng, 
        currency: searchParams.currency, 
      });

      if (fetchedHotels.length === 0) {
        // Optional: Set a specific message if no hotels found, 
        // or rely on the rendering logic below.
        console.log('page.tsx: No hotels found for the given criteria.');
      }

    } catch (err) {
      console.error("page.tsx: Search failed:", err);
      setError('Failed to fetch hotel results. Please try again.');
      setHotels([]);
      // Also clear context on error (already done above)
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle opening the details modal
  const handleViewDetails = async (hotelId: string) => {
    console.log("page.tsx: Fetching details for hotel ID:", hotelId);
    setIsModalOpen(true);
    setIsModalLoading(true);
    setModalError(null);
    setSelectedHotelDetails(null);
    setSelectedHotelId(hotelId);

    try {
       // Actual API call to fetch details by ID
       const detailsData = await hotelService.getHotelDetails(hotelId);
       console.log("page.tsx: Received Hotel Details API Response:", detailsData);

       // Extract the actual hotel details object based on confirmed structure
       const hotelDetailsContent = detailsData?.data?.hotel;

       if (hotelDetailsContent) {
         console.log("page.tsx: Extracted Hotel Details Content:", hotelDetailsContent);
         // Make sure the fetched data structure matches HotelDetailsContent type
         setSelectedHotelDetails(hotelDetailsContent as HotelDetailsContent);
       } else {
         console.error("page.tsx: Hotel details content not found in API response structure.", detailsData);
         setModalError(`Could not process details.`);
         setSelectedHotelDetails(null); 
       }

    } catch (err) {
       console.error("page.tsx: Failed to fetch hotel details:", err);
       setModalError('Could not load hotel details.');
       setSelectedHotelDetails(null); // Clear details on error
       setSelectedHotelId(null);
    } finally {
       setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHotelDetails(null);
    setSelectedHotelId(null);
    setModalError(null);
  };

  // Handler for filter changes from FilterSidebar
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    console.log("page.tsx: Updating filters:", newFilters);
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  // Handler for sort changes from FilterSidebar
  const handleSortChange = (newSortValue: string) => {
    console.log("page.tsx: Updating sort:", newSortValue);
    // Type assertion to ensure the value matches SortByType
    setSortBy(newSortValue as SortByType);
  };

  // Apply filters and sorting to the hotel list
  const processedHotels = useMemo(() => {
    // 1. Filtering
    let hotelsToProcess = hotels.filter(hotel => {
      // Star Rating Filter
      if (filters.starRating && filters.starRating.length > 0) {
        const hotelRating = parseFloat(hotel.rating ?? '') ?? 0;
        if (!filters.starRating.includes(Math.floor(hotelRating))) {
          return false;
        }
      }
      // Add other filters here (amenities when available)
      return true; 
    });

    // 2. Sorting
    hotelsToProcess.sort((a, b) => {
      const priceA = a.rate?.perNightRate ?? 0; // Default to 0 if price missing
      const priceB = b.rate?.perNightRate ?? 0; // Default to 0 if price missing

      switch (sortBy) {
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        // Add cases for other sort options (e.g., rating) here
        default:
          return 0; // Default: no specific sort order (or handle relevance)
      }
    });

    return hotelsToProcess;
  }, [hotels, filters, sortBy]); // Add sortBy to dependency array

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      
      <Navigation />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-[#0071bc] to-[#002855] text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Save Up to 30% on Your Dream Vacations
              </h1>
              <p className="text-xl mb-12">
                Access exclusive wholesale travel rates and unlock incredible savings compared to traditional booking sites.
              </p>
              <BookingWidget onSearch={handleSearch} />
            </div>
          </div>
        </section>

        {/* Search Results Section - Conditionally Rendered */}
        {/* Show section if loading, or if there's an error, or if search completed (even if no results) */}
        {!isLoading && (error || hotels.length >= 0) && !(!error && hotels.length === 0) && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
              {/* Filter Sidebar - Pass sorting props */}
              <FilterSidebar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                sortBy={sortBy}                       // Pass state
                onSortChange={handleSortChange}         // Pass handler
              />

              {/* Results List - Use processedHotels */}
              <div className="flex-1">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                {/* Display results only when not loading and no error */}
                {!error && (
                  <div>
                    {/* Check processedHotels length */}
                    {processedHotels.length > 0 ? (
                      <>
                        <h2 className="text-2xl font-semibold mb-4">Search Results ({processedHotels.length})</h2>
                        {processedHotels.map((hotel) => (
                          <HotelResultCard 
                            key={hotel.id} 
                            hotel={hotel} 
                            onViewDetails={handleViewDetails} 
                          />
                        ))}
                      </>
                    ) : (
                      // Message when search is done but no results match (or match filters)
                      <div className="text-center p-10 text-gray-600">
                        <p>No hotels found matching your criteria. Try adjusting your search or filters.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Keep existing sections only if no search has been performed yet */}
        {!isLoading && !error && hotels.length === 0 && (
          <>
            {/* Value Propositions */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Wholesale Rates</h3>
                    <p className="text-gray-600">Save up to 30% compared to Expedia and Booking.com</p>
                  </div>
                  <div className="text-center p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-[#002855]">RCI Inventory</h3>
                    <p className="text-gray-600">Access to 67,000 week combinations with up to 60% savings</p>
                  </div>
                  <div className="text-center p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Cancun Special</h3>
                    <p className="text-gray-600">$498 all-inclusive package with property tour</p>
                  </div>
                </div>
              </div>
            </section>
            {/* Featured Destinations Section (Multiple Cards) */}
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 text-[#002855]">Featured Destinations</h2>
                {/* Loading State */}
                {isFeaturedLoading && (
                  <div className="flex justify-center items-center p-10">
                    <ClipLoader size={50} color={"#0071bc"} loading={isFeaturedLoading} />
                    <span className="ml-4 text-gray-600">Loading featured hotels...</span>
                  </div>
                )}
                {/* Error State */}
                {featuredError && !isFeaturedLoading && (
                  <div className="text-center p-10 text-red-600 bg-red-50 rounded border border-red-300 max-w-2xl mx-auto">
                    <p><strong>Oops!</strong> {featuredError}</p>
                  </div>
                )}
                {/* Success State - Render Cards */}
                {!isFeaturedLoading && !featuredError && featuredHotels.length > 0 && (
                  // Grid for multiple cards
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredHotels.map((hotel) => ( // Map over the array
                      <div key={`${hotel.displayName}-${hotel.id}`} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                        <div className="relative h-48 w-full">
                          <Image
                            src={hotel.image || '/placeholder-image.jpg'} // Use hotel.image
                            alt={hotel.displayName || 'Hotel image'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw" // Adjusted sizes
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-grow text-center">
                          {/* Display Destination Name */}
                          <h3 className="text-xl font-bold mb-1 text-[#002855]">{hotel.displayName}</h3>
                          {/* Display Hotel Name */}
                          <p className="text-sm text-gray-600 mb-3 truncate h-10 leading-5">{hotel.hotelName || 'Hotel Name'}</p> { /* Use hotelName */ }

                          {hotel.rate?.totalRate ? ( // Use totalRate from API response
                            <p className="text-lg font-semibold text-gray-800 mt-auto">
                              From ${hotel.rate.totalRate.toFixed(2)} {/* Display totalRate */}
                              <span className="text-xs text-gray-500 font-normal"> / night</span> { /* Label might need adjustment */ }
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-auto">Rates unavailable</p>
                          )}
                          <button
                            onClick={() => handleViewDetails(hotel.id)}
                            className="mt-4 w-full px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
                          >
                            View Hotel Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* No Featured Hotels Found State */}
                {!isFeaturedLoading && !featuredError && featuredHotels.length === 0 && (
                   <div className="text-center p-10 text-gray-600">
                     <p>Could not load featured destinations at this time.</p>
                   </div>
                )}
              </div>
            </section>
            {/* Insiders Club CTA */}
            <section className="py-16 bg-[#0071bc] text-white">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-6">Join the Insiders Club</h2>
                <p className="text-xl mb-8">Get enhanced savings and exclusive benefits for just $19/month</p>
                <Link 
                  href="/insiders-club" 
                  className="bg-[#ffc20e] text-[#002855] px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition inline-block"
                >
                  Learn More
                </Link>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Hotel Details Modal - Pass full search context */}
      {isModalOpen && (
        <HotelDetailsModal 
          details={selectedHotelDetails} 
          isLoading={isModalLoading}
          error={modalError}
          onClose={handleCloseModal} 
          hotelId={selectedHotelId}
          checkInDate={searchCheckIn} 
          checkOutDate={searchCheckOut}
          occupancies={searchOccupancies}
          latitude={searchLat}       
          longitude={searchLng}      
          currency={searchCurrency}
        />
      )}
    </>
  )
} 