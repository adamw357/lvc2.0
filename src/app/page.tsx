'use client'

import React, { useState, useMemo, useEffect } from 'react';
import Navigation from '@/components/Navigation'
import { BookingWidget } from '@/components/BookingWidget'
import Image from 'next/image'
import Link from 'next/link'
import { FilterSidebar } from '@/components/FilterSidebar';
import { HotelResultCard } from '@/components/HotelResultCard';
import { HotelDetailsModal, HotelDetailsContent } from '@/components/HotelDetailsModal';
import { hotelService } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ClipLoader } from 'react-spinners';
import { format, addDays } from 'date-fns'; // Import date functions
import { Waves, Sparkles, Dumbbell, Wifi, Utensils, Martini } from 'lucide-react'; // Import selected icons
import { HotelMap } from '@/components/HotelMap';
import { HotelNameSearch } from '@/components/HotelNameSearch';

// Define a type for the filters
export interface Filters {
  minPrice?: number;
  maxPrice?: number;
  starRating?: number[]; // Array of selected star ratings (e.g., [4, 5])
  amenities?: string[]; // Array of selected amenity IDs/names
}

// Define possible sort options
type SortByType = 'price_asc' | 'price_desc'; // Add more later like 'rating_desc'

// Define a type for the featured hotel data structure
interface FeaturedHotelData extends Hotel { // Extend the existing Hotel type
  displayName: string; // Add the display name (e.g., "Cancun")
}

// --- Helper Function to Render Amenity Icons ---
const renderAmenityIcons = (facilities: Hotel['facilities']) => {
  if (!facilities || facilities.length === 0) {
    return null;
  }

  const keyAmenities: { [key: string]: React.ReactNode } = {
    pool: <Waves key="pool" size={24} className="text-blue-600" />, // Removed title
    spa: <Sparkles key="spa" size={24} className="text-pink-600" />, // Removed title
    fitness: <Dumbbell key="fitness" size={24} className="text-gray-800" />, // Removed title
    wifi: <Wifi key="wifi" size={24} className="text-cyan-600" />, // Removed title
    restaurant: <Utensils key="restaurant" size={24} className="text-orange-600" />, // Removed title
    bar: <Martini key="bar" size={24} className="text-purple-700" />, // Removed title
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
    return null;
  }

  return (
    // Adjusted spacing for larger icons
    <div className="flex justify-center space-x-3 mt-2 mb-3"> 
      {foundIcons}
    </div>
  );
};

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

  // --- Hotel Name Query State (Moved Up) ---
  const [hotelNameQuery, setHotelNameQuery] = useState<string>('');

  // --- Processed Hotels Logic (Moved Up) ---
  const processedHotels = useMemo(() => {
    let hotelsToProcess = hotels;
    // Optional: console.log('PROCESSED_HOTELS: Start. Query:', hotelNameQuery, 'Initial Hotels:', hotels.length);

    // 1. Apply Hotel Name Filter FIRST
    if (hotelNameQuery.trim()) {
      const searchQuery = hotelNameQuery.toLowerCase();
      hotelsToProcess = hotelsToProcess.filter(hotel =>
        hotel.hotelName?.toLowerCase().includes(searchQuery)
      );
    }

    // 2. Filtering (Star Rating, Amenities)
    hotelsToProcess = hotelsToProcess.filter(hotel => {
      if (filters.starRating && filters.starRating.length > 0) {
        const hotelRating = parseFloat(hotel.rating ?? '') ?? 0;
        if (!filters.starRating.includes(Math.floor(hotelRating))) {
          return false;
        }
      }
      if (filters.amenities && filters.amenities.length > 0) {
        const hotelFacilityNames = hotel.facilities?.map(f => f.name?.toLowerCase() ?? '') || [];
        const hasAllSelectedAmenities = filters.amenities.every(selectedAmenity =>
          hotelFacilityNames.some(facilityName => facilityName.includes(selectedAmenity))
        );
        if (!hasAllSelectedAmenities) {
          return false;
        }
      }
      return true;
    });

    // 3. Sorting
    hotelsToProcess.sort((a, b) => {
      const priceA = a.rate?.perNightRate ?? 0;
      const priceB = b.rate?.perNightRate ?? 0;
      switch (sortBy) {
        case 'price_asc': return priceA - priceB;
        case 'price_desc': return priceB - priceA;
        default: return 0;
      }
    });
    return hotelsToProcess;
  }, [hotels, filters, sortBy, hotelNameQuery]);

  // --- State related to UI, can stay here or be grouped if preferred ---
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // --- Map Modal State & View State ---
  const [showMapModal, setShowMapModal] = useState(false); // For the existing full modal, might be phased out
  const [isMapView, setIsMapView] = useState(false); // New state for toggling map-centric layout

  // Compute map center for preview (average of hotel coordinates or default to Las Vegas)
  const mapCenter = useMemo(() => {
    const hotelsToShow = processedHotels;
    if (!hotelsToShow.length) return { lat: 36.1147, lng: -115.1728 };
    const validHotels = hotelsToShow.filter(h => h.lat && h.lng && !isNaN(Number(h.lat)) && !isNaN(Number(h.lng)));
    if (!validHotels.length) return { lat: 36.1147, lng: -115.1728 }; // Fallback if no valid coords in processed
    const avgLat = validHotels.reduce((sum, h) => sum + Number(h.lat), 0) / validHotels.length;
    const avgLng = validHotels.reduce((sum, h) => sum + Number(h.lng), 0) / validHotels.length;
    return { lat: avgLat, lng: avgLng };
  }, [processedHotels]);

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
      const defaultCurrency = 'USD'; // Assuming USD, adjust if needed

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
            console.log(`Featured hotel data for ${destInfo.displayName}:`, result.value?.data);
            
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

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
    setCurrentPage(1);

    try {
      const responseData = await hotelService.searchHotels(searchParams, 1, 50);
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
      setTotalResults(responseData?.data?.totalCount || fetchedHotels.length);
      
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

  // Show More Results handler
  const handleShowMoreResults = async () => {
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      // Use the last search params (assume stored in state or re-use last)
      // For simplicity, re-use the last search context (you may want to store lastSearchParams in state)
      const responseData = await hotelService.searchHotels({
        locationId: searchLat && searchLng ? `coords:${searchLat},${searchLng}` : '',
        checkInDate: searchCheckIn ? format(searchCheckIn, 'yyyy-MM-dd') : '',
        checkOutDate: searchCheckOut ? format(searchCheckOut, 'yyyy-MM-dd') : '',
        occupancies: searchOccupancies || [{ numOfAdults: 2, numOfChildren: 0, childAges: [], numOfRoom: 1 }],
        lat: searchLat || 0,
        lng: searchLng || 0,
        nationality: 'US',
        type: 'COORDINATES',
        currency: searchCurrency || 'USD',
      }, nextPage, 50);
      const newHotels: Hotel[] = responseData?.data?.hotels || [];
      setHotels(prev => [...prev, ...newHotels]);
      setCurrentPage(nextPage);
      setTotalResults(responseData?.data?.totalCount || (hotels.length + newHotels.length));
    } catch (err) {
      // Optionally show error
    } finally {
      setIsLoadingMore(false);
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

  // This definition is now AFTER processedHotels, which is fine.
  const handleHotelNameSearch = (query: string) => {
    setHotelNameQuery(query);
  };

  const handleMarkerClick = (hotelWithId: Hotel) => {
    setSelectedHotel(hotelWithId);
    const element = document.getElementById(`hotel-${hotelWithId.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // --- Render the map at the very top for debugging ---
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
            <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-start gap-8">
              {/* Filter Sidebar - Pass sorting props */}
              <div className="lg:col-span-1">
                {/* Map Preview Box */}
                <div className="mb-6 relative rounded-lg overflow-hidden shadow border bg-gray-100" style={{ height: 140 }}>
                  {/* Static map image using Google Static Maps API (or fallback placeholder) */}
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${mapCenter.lat},${mapCenter.lng}&zoom=12&size=400x140&maptype=roadmap&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Map preview"
                    className="w-full h-full object-cover"
                    style={{ minHeight: 140, minWidth: 200 }}
                    onError={e => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('map-placeholder.png')) {
                        img.src = '/map-placeholder.png';
                      }
                    }}
                  />
                  <button
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-black bg-opacity-70 hover:bg-opacity-80 text-white font-bold text-lg rounded-lg shadow-lg border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                    style={{ pointerEvents: 'auto' }}
                    onClick={() => {
                      setIsMapView(true); // Activate map view
                      setShowMapModal(false); // Ensure old modal doesn't also show
                      console.log('Go to map clicked, isMapView set to true');
                    }}
                  >
                    Go to map
                  </button>
                </div>
                <FilterSidebar 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                  sortBy={sortBy}                       // Pass state
                  onSortChange={handleSortChange}         // Pass handler
                />
                {/* Hotel Name Search Box - Move between star rating and amenities */}
                <div className="mb-6">
                  <label htmlFor="hotel-name-search" className="block text-sm font-semibold text-gray-700 mb-1">Hotel Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input
                      id="hotel-name-search"
                      type="text"
                      className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      onChange={e => handleHotelNameSearch(e.target.value)}
                      style={{ textIndent: '2.75rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Results List - Use processedHotels */}
              <div className="lg:col-span-2 md:self-start">
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
                        <h2 className="text-2xl font-semibold mb-4">
                          Search Results (
                            {typeof totalResults === 'number' && totalResults > processedHotels.length
                              ? `${processedHotels.length} of ${totalResults}`
                              : `${processedHotels.length} shown`}
                          )
                        </h2>
                        {processedHotels.map((hotel) => (
                          <HotelResultCard 
                            key={hotel.id} 
                            hotel={hotel} 
                            onViewDetails={handleViewDetails} 
                          />
                        ))}
                        {/* Show More Results Button */}
                        {typeof totalResults === 'number' && hotels.length < totalResults && (
                          <div className="mt-8">
                            <button
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow transition disabled:opacity-60"
                              onClick={handleShowMoreResults}
                              disabled={isLoadingMore}
                            >
                              {isLoadingMore ? 'Loading...' : 'Show More Results'}
                            </button>
                          </div>
                        )}
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
                {/* Success State - Render Cards with Link */}
                {!isFeaturedLoading && !featuredError && featuredHotels.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredHotels.map((hotel) => {
                      // --- Construct Query Params for Link ---
                      const today = new Date(); // Recalculate or store these if fetchFeatured changes
                      const checkInDateObj = addDays(today, 95);
                      const checkOutDateObj = addDays(checkInDateObj, 1);
                      const checkInDateStr = format(checkInDateObj, 'yyyy-MM-dd');
                      const checkOutDateStr = format(checkOutDateObj, 'yyyy-MM-dd');
                      const defaultOccupancy = [{ numOfAdults: 2, numOfChildren: 0, childAges: [], numOfRoom: 1 }];
                      const defaultCurrency = 'USD'; // Ensure consistency
                      const lat = hotel.lat; // Use lat/lng from the specific hotel data
                      const lng = hotel.lng;

                      const queryParams = new URLSearchParams({
                        checkIn: checkInDateStr,
                        checkOut: checkOutDateStr,
                        occupancies: encodeURIComponent(JSON.stringify(defaultOccupancy)), // Encode occupancy JSON
                        lat: lat || '', // Include lat/lng if available
                        lng: lng || '',
                        currency: defaultCurrency,
                      }).toString();
                      // --- End Construct Query Params ---

                      return (
                        <Link 
                          key={`${hotel.displayName}-${hotel.id}`} 
                          href={`/hotel/${hotel.id}?${queryParams}`} // Append query params
                          className="block group bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-200"
                        >
                          <div className="relative h-48 w-full">
                            <Image
                              src={hotel.image || '/placeholder-image.jpg'}
                              alt={hotel.displayName || 'Hotel image'}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
                            />
                          </div>
                          <div className="p-4 flex flex-col flex-grow text-center">
                            <h3 className="text-xl font-bold mb-1 text-[#002855]">{hotel.displayName}</h3>
                            <p className="text-sm text-gray-600 mb-3 truncate h-10 leading-5">{hotel.hotelName || 'Hotel Name'}</p>
                            {renderAmenityIcons(hotel.facilities)}
                            {hotel.rate?.totalRate ? (
                              <div className="mt-auto">
                                <span className="text-xs text-blue-700 font-semibold block mb-0.5">Member Price</span>
                                <p className="text-lg font-semibold text-gray-800">
                                  From {(" ")}
                                  {/* Format price with toLocaleString */}
                                  {hotel.rate.totalRate.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                  <span className="text-xs text-gray-500 font-normal"> / night</span>
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 mt-auto">Rates unavailable</p>
                            )}
                            <div className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md group-hover:bg-blue-700 transition duration-150 ease-in-out">
                              See Details
                            </div>
                          </div>
                        </Link>
                      );
                    })}
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

        {hotels.length > 0 && (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Search and Results */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {(filteredHotels.length > 0 ? filteredHotels : hotels).map((hotel) => (
                    <div 
                      key={hotel.id}
                      id={`hotel-${hotel.id}`}
                      className={`transition-all duration-200 ${
                        selectedHotel?.id === hotel.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <HotelResultCard 
                        hotel={hotel}
                        onViewDetails={() => setSelectedHotel(hotel)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column - (no map here now) */}
              <div className="lg:col-span-1"></div>
            </div>
          </div>
        )}
      </div>

      {/* Map Modal Overlay */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <button
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-gray-700 font-bold text-lg z-10"
              onClick={() => setShowMapModal(false)}
              aria-label="Close Map"
            >
              ×
            </button>
            <div className="flex-1 p-2">
              <HotelMap
                hotels={processedHotels.map(hotel => ({
                  hotelName: hotel.hotelName,
                  lat: parseFloat(hotel.lat || '0'),
                  lng: parseFloat(hotel.lng || '0'),
                  address: {
                    line1: hotel.address?.line1 || '',
                  },
                  id: hotel.id,
                }))}
                onMarkerClick={(mapHotel) => {
                  const originalHotel = processedHotels.find(
                    h => h.hotelName === mapHotel.hotelName &&
                         parseFloat(h.lat || '0') === mapHotel.lat &&
                         parseFloat(h.lng || '0') === mapHotel.lng
                  );
                  if (originalHotel) {
                    handleMarkerClick(originalHotel); 
                  } else {
                    console.warn('Original hotel not found for map marker click based on name/lat/lng', mapHotel);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

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