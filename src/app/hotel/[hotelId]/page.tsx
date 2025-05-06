'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation'; // Assuming shared navigation
import { hotelService } from '@/services/hotelService'; // Import hotelService
import { RoomCardSkeleton } from '@/components/RoomCardSkeleton'; // Import the skeleton component
import { RoomRate } from '@/types/hotel'; // Import RoomRate from shared location
import { RoomCard } from '@/components/RoomCard'; // Import the new RoomCard component
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from 'next/image';

// Define the type for hotel details (can be shared or redefined)
// Using a basic structure based on modal data
interface HotelDetailsContent {
  overview?: {
    name?: string;
    images?: {
      caption?: string;
      links?: {
        url?: string;
        size?: string;
      }[];
      roomCodes?: any[];
    }[];
  };
  propertyInformation?: {
    propertyDescription?: string;
  };
  popularAmenities?: string[];
  rooms?: any[];
}

// --- Combine Interfaces (or keep separate, refine later based on response) ---
interface CombinedHotelData {
  // From original HotelDetailsContent
  overview?: {
    name?: string;
    images?: { links?: { url?: string; size?: string; }[] }[];
  };
  propertyInformation?: {
    propertyDescription?: string;
  };
  popularAmenities?: string[];
  // From original RoomRate (adjust based on new endpoint response)
  roomLists?: {
    groupId?: string;
    name?: string;
    images?: { links?: { url?: string; size?: string; }[] }[];
    roomAmenities?: string[];
    price?: {
      total?: number;
      perNightStay?: number;
    };
    rateId?: string;
  }[];
  // Add any other top-level fields from the new response
}

// Define type for the single API response
interface HotelPageApiResponse {
  status?: boolean;
  message?: string;
  data?: CombinedHotelData; // Expect combined data here
}

function HotelDetailContent() {
  const params = useParams(); // Can be null
  const searchParams = useSearchParams(); // Can be null
  const router = useRouter(); // Initialize router
  
  // Safely access hotelId, provide default or handle error
  const hotelId = params?.hotelId as string | undefined;

  // Revert to separate states
  const [details, setDetails] = useState<HotelDetailsContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading for initial details
  const [error, setError] = useState<string | null>(null); // Error for initial details
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [roomsAndRates, setRoomsAndRates] = useState<RoomRate[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState<boolean>(false); // Separate loading for rooms
  const [roomsError, setRoomsError] = useState<string | null>(null); // Separate error for rooms

  // Read params needed for rooms/rates call with null checks
  const checkIn = searchParams?.get('checkIn');
  const checkOut = searchParams?.get('checkOut');
  const occupanciesStr = searchParams?.get('occupancies');
  const latStr = searchParams?.get('lat');
  const lngStr = searchParams?.get('lng');
  const currency = searchParams?.get('currency');
  // const destCode = searchParams?.get('destCode'); // Example if needed later
  // const nationCode = searchParams?.get('nationCode');
  // const locType = searchParams?.get('type');

  // Parse required numeric and array params
  const lat = latStr ? parseFloat(latStr) : null;
  const lng = lngStr ? parseFloat(lngStr) : null;
  let occupancies: any[] | null = null;
  if (occupanciesStr) {
    try {
      occupancies = JSON.parse(decodeURIComponent(occupanciesStr));
    } catch (e) {
      console.error("Failed to parse occupancies from URL", e);
    }
  }

  // --- Handler for Selecting a Room --- 
  const handleSelectRoom = (selectedRoom: RoomRate) => {
    console.log("Selected Room:", selectedRoom);
    
    // Gather necessary data
    const roomPriceInfo = selectedRoom.extra?.[0]?.price;
    const rateInfo = selectedRoom.extra?.[0]; // Contains rateId, recommendationId etc.

    // Ensure essential data is available before navigating
    if (!hotelId || !checkIn || !checkOut || !occupancies || !currency || !roomPriceInfo || !rateInfo) {
      console.error("Missing essential data for booking navigation");
      // Optionally show an error message to the user
      return; 
    }

    // Construct query parameters
    const queryParams = new URLSearchParams({
      hotelId: hotelId,
      checkIn: checkIn,
      checkOut: checkOut,
      occupancies: JSON.stringify(occupancies), // Stringify occupancy array
      currency: currency,
      // --- Room Specific Data ---
      roomId: selectedRoom.roomId || '', // From root room object
      roomName: selectedRoom.name || 'Selected Room',
      groupId: selectedRoom.groupId || '',
      // --- Rate Specific Data (from extra[0]) ---
      rateId: JSON.stringify(rateInfo.rateId || []), // Pass rateId(s) as string array
      recommendationId: rateInfo.recommendationId || '',
      totalPrice: roomPriceInfo.total?.toString() || '0',
      pricePerNight: roomPriceInfo.perNightStay?.toString() || '0',
      // Add other useful fields like baseRate, tax amount if needed later
    });

    // Navigate to the booking page
    const bookingUrl = `/booking?${queryParams.toString()}`;
    console.log("Navigating to:", bookingUrl);
    router.push(bookingUrl);
  };
  // --- End Handler ---

  // useEffect for initial details fetch
  useEffect(() => {
    if (hotelId) {
      const fetchInitialDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const detailsData = await hotelService.getHotelDetails(hotelId);
          // Assume response structure is { data: { hotel: { ... } } } based on prior logs
          const hotelDetailsContent = detailsData?.data?.hotel;
          if (hotelDetailsContent) {
            setDetails(hotelDetailsContent as HotelDetailsContent);
          } else {
            setError('Could not parse hotel details.');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load hotel details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialDetails();
    } else {
      setError("Hotel ID not found.");
      setIsLoading(false);
    }
  }, [hotelId]);

  // useEffect for rooms and rates fetch (depends on initial details and params)
  useEffect(() => {
    console.log('Checking conditions for fetchRoomsAndRates:', {
      isLoading,
      error,
      details: !!details, // Check if details object exists
      hotelId,
      checkIn,
      checkOut,
      occupancies: !!occupancies, // Check if occupancies array exists
      lat,
      lng,
      currency,
      // Also check the result of the full condition
      shouldFetch: !isLoading && !error && details && hotelId && checkIn && checkOut && occupancies && lat !== null && lng !== null && currency
    });

    // Check if initial load is done, no error, and necessary params exist
    if (!isLoading && !error && details && hotelId && checkIn && checkOut && occupancies && lat !== null && lng !== null && currency) {
      const fetchRoomsAndRates = async () => {
        setIsRoomsLoading(true);
        setRoomsError(null);
        try {
          const requestBody = {
            hotelId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            occupancies: occupancies,
            lat: lat,
            lng: lng,
            currency: currency,
          };
          const roomsData = await hotelService.getRoomsAndRates(requestBody);
          
          const fetchedRooms = roomsData?.data?.roomLists || [];
          
          setRoomsAndRates(fetchedRooms);

          if (fetchedRooms.length === 0) {
             console.log("No rooms found for the criteria (API returned empty roomLists).");
          }
        } catch (err) {
          setRoomsError(err instanceof Error ? err.message : 'Could not load room options.');
        } finally {
          setIsRoomsLoading(false);
        }
      };
      fetchRoomsAndRates();
    } else if (!isLoading && !error) {
       // If initial load done but params missing, clear rooms loading/error
       setIsRoomsLoading(false);
       setRoomsError(null); 
    }
    // Add dependencies for rooms/rates call
  }, [isLoading, error, details, hotelId, checkIn, checkOut, occupanciesStr, lat, lng, currency]); 

  // Extract data using original state variables
  const hotelName = details?.overview?.name;
  const description = details?.propertyInformation?.propertyDescription;
  
  // --- Refined Image Extraction for Carousel ---
  const hotelImages = details?.overview?.images?.map(imgObj => {
    // Prioritize larger image sizes (e.g., 'XXL' or 'Z', common in travel APIs)
    // Handle potential variations in size identifiers (case-insensitive)
    const largeLink = imgObj?.links?.find(link => 
        link.size?.toUpperCase() === 'XXL' || 
        link.size?.toUpperCase() === 'Z' || 
        link.size?.toUpperCase() === 'LARGE' // Add other common large identifiers if needed
    );
    const firstLink = imgObj?.links?.[0]; // Fallback to the first link
    return largeLink?.url || firstLink?.url; // Return the best URL found
  }).filter(Boolean) as string[] || []; // Filter out any null/undefined URLs
  // --- End Refined Image Extraction ---

  const amenities = details?.popularAmenities || [];

  // Slider settings (use the refined hotelImages array length)
  const sliderSettings = {
    dots: true,
    infinite: hotelImages.length > 1, // Make infinite only if multiple images
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enable autoplay 
    autoplaySpeed: 4000, // Change slide every 4 seconds
    pauseOnHover: true, // Pause autoplay on hover
    arrows: true,
  };

  // Truncate description logic (same as modal)
  const TRUNCATE_LENGTH = 400; // Can adjust length for the page vs modal
  const needsTruncation = description && description.length > TRUNCATE_LENGTH;
  const truncatedDescription = needsTruncation
    ? description.substring(0, TRUNCATE_LENGTH) + '...'
    : description;

  const displayDescription = isDescriptionExpanded ? description : truncatedDescription;

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-16 slick-container">
        {/* Loading State for initial details */}
        {isLoading && (
          <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <span className="ml-4 text-xl text-gray-700">Loading Hotel Details...</span>
          </div>
        )}

        {/* Error State for initial details */}
        {!isLoading && error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Success State - Display Details (use !isLoading && !error && details) */}
        {!isLoading && !error && details && (
          <div>
            <h1 className="text-4xl font-bold mb-6">{hotelName || 'Hotel Details'}</h1>
            {/* Main content: Image Carousel and Overview - Spanning full width */}
            <div className="mb-12"> {/* Increased margin-bottom */} 
              {/* Image Carousel - Now using hotelImages */}
              {hotelImages.length > 0 ? (
                <div className="mb-6 rounded-lg overflow-hidden bg-gray-200 shadow-lg">
                  <Slider {...sliderSettings}>
                    {hotelImages.map((imageUrl, index) => (
                      <div key={index} className="aspect-video relative">
                        <Image
                          src={imageUrl}
                          alt={`${hotelName || 'Hotel'} image ${index + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 800px"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
              ) : (
                <div className="mb-6 rounded-lg overflow-hidden aspect-video relative bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              {/* Overview/Description with Read More/Less */}
              {description && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-3">Overview</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{displayDescription}</p>
                  {/* Show Read More/Less button if needed */}
                  {needsTruncation && (
                    <button
                      onClick={toggleDescription}
                      className="text-blue-600 hover:text-blue-800 font-semibold mt-2 text-sm"
                    >
                      {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Amenities Section - Below overview, full width */}
            {amenities.length > 0 && (
              <div className="mb-12 bg-gray-50 p-4 rounded-lg shadow"> {/* Increased margin-bottom */} 
                <h2 className="text-2xl font-semibold mb-3">Popular Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms & Rates Section - Below amenities, full width */}
            <div className="mt-6 pt-4 border-t">
              <h2 className="text-2xl font-semibold mb-4">Rooms & Rates</h2> 
              
              {/* --- Updated Loading State --- */}
              {isRoomsLoading && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
                   {/* Render multiple skeletons */} 
                   {[...Array(3)].map((_, index) => (
                      <RoomCardSkeleton key={index} />
                   ))}
                 </div>
              )}
              {/* --- End Updated Loading State --- */}
              
              {/* Error state */} 
              {!isRoomsLoading && roomsError && (
                  <div className="text-orange-700 bg-orange-100 p-3 rounded text-sm">
                    {roomsError}
                  </div>
              )}
              {/* No rooms state */}
              {!isRoomsLoading && !roomsError && roomsAndRates.length === 0 && (
                  <p className="text-gray-600 text-sm">No rooms available for the selected dates and guest count.</p>
              )}
              
              {/* Grid for Actual Room Cards */}
              {!isRoomsLoading && !roomsError && roomsAndRates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
                  {roomsAndRates.map((room) => (
                    // Use the RoomCard component, passing necessary props
                    <RoomCard 
                      key={room.rateId || room.groupId || room.roomId} 
                      room={room} 
                      currency={currency} // Pass currency for price display
                      onSelectRoom={handleSelectRoom} // Pass the navigation handler
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Include slick styles globally if not already done elsewhere */}
      <style jsx global>{`
        .slick-container .slick-prev::before,
        .slick-container .slick-next::before {
          color: black;
          font-size: 24px;
        }
        .slick-prev { left: 10px; z-index: 1; }
        .slick-next { right: 10px; z-index: 1; }
        .slick-dots li button:before { color: #9ca3af; }
        .slick-dots li.slick-active button:before { color: #3b82f6; }
      `}</style>
    </>
  );
}

// Export wrapped in Suspense
export default function HotelDetailPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}> {/* Basic fallback UI */}
      <HotelDetailContent />
    </Suspense>
  )
} 