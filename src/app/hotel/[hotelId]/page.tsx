'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation'; // Assuming shared navigation
import { hotelService } from '@/services/hotelService'; // Import hotelService
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

// Update RoomRate interface based on actual API data
interface RoomRate {
  groupId?: string;
  name?: string;
  images?: { links?: { url?: string; size?: string; }[] }[];
  roomAmenities?: string[];
  price?: {
    total?: number;
    perNightStay?: number;
    // Add other price fields if needed
  };
  rateId?: string;
  // Add other potentially useful fields like beds, cancellationPolicies etc.
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
  const params = useParams();
  const searchParams = useSearchParams(); // Use the hook
  const hotelId = params.hotelId as string;

  // Revert to separate states
  const [details, setDetails] = useState<HotelDetailsContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading for initial details
  const [error, setError] = useState<string | null>(null); // Error for initial details
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [roomsAndRates, setRoomsAndRates] = useState<RoomRate[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState<boolean>(false); // Separate loading for rooms
  const [roomsError, setRoomsError] = useState<string | null>(null); // Separate error for rooms

  // Read params needed for rooms/rates call
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const occupanciesStr = searchParams.get('occupancies');
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');
  const currency = searchParams.get('currency');
  const destCode = searchParams.get('destCode');
  const nationCode = searchParams.get('nationCode');
  const locType = searchParams.get('type');

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
  const images = details?.overview?.images
    ?.map(img => img?.links?.[0]?.url)
    .filter(Boolean) as string[] || [];
  const amenities = details?.popularAmenities || [];

  // Slider settings (same as modal)
  const sliderSettings = {
    dots: true,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column (uses details) */}
              <div className="md:col-span-2">
                {/* Image Carousel */}
                {images.length > 0 ? (
                  <div className="mb-6 rounded-lg overflow-hidden bg-gray-200">
                    <Slider {...sliderSettings}>
                      {images.map((imageUrl, index) => (
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

              {/* Right Column (uses details for amenities, separate state for rooms) */}
              <div className="md:col-span-1">
                {/* Amenities (uses amenities extracted from details) */}
                {amenities.length > 0 && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow">
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

                {/* Rooms & Rates Section */}
                <div className="mt-6 pt-4 border-t">
                  <h2 className="text-2xl font-semibold mb-3">Rooms & Rates</h2>
                  {/* Use separate loading/error states for rooms */}
                  {isRoomsLoading && (
                     <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Loading room options...</span>
                     </div>
                  )}
                  {!isRoomsLoading && roomsError && (
                    <div className="text-orange-700 bg-orange-100 p-3 rounded text-sm">
                      {roomsError}
                    </div>
                  )}
                  {/* Use roomsAndRates state directly */}
                  {!isRoomsLoading && !roomsError && roomsAndRates.length === 0 && (
                    <p className="text-gray-600 text-sm">No rooms available for the selected dates and guest count.</p>
                  )}
                  {!isRoomsLoading && !roomsError && roomsAndRates.length > 0 && (
                    <div className="space-y-4">
                      {roomsAndRates.map((room) => {
                        // Extract potential image URL (prefer XXL - often index 1)
                        const roomImageUrl = room.images?.[0]?.links?.[1]?.url || room.images?.[0]?.links?.[0]?.url;
                        // Get price per night, fall back to total price if perNight is missing/invalid
                        const pricePerNight = room.price?.perNightStay;
                        const totalPrice = room.price?.total;
                        const displayPrice = typeof pricePerNight === 'number' ? pricePerNight : (typeof totalPrice === 'number' ? totalPrice : undefined);
                        const priceLabel = typeof pricePerNight === 'number' ? ' / night' : (typeof totalPrice === 'number' ? ' total' : '');
                        
                        return (
                          <div key={room.rateId || room.groupId} className="border p-4 rounded-lg shadow-sm bg-white overflow-hidden">
                            {/* Room Image */}
                            {roomImageUrl && (
                              <div className="relative aspect-video mb-3 -mx-4 -mt-4">
                                <Image
                                  src={roomImageUrl}
                                  alt={room.name || 'Room image'}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="(max-width: 768px) 30vw, 200px"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                            {/* Room Name */}
                            <h4 className="font-semibold text-lg mb-2">{room.name || 'Room Information'}</h4>
                            
                            {/* Room Amenities */}
                            {room.roomAmenities && room.roomAmenities.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Includes:</h5>
                                <div className="flex flex-wrap gap-x-2 gap-y-1">
                                  {room.roomAmenities.slice(0, 6).map((amenity, i) => (
                                    <span key={i} className="text-xs text-gray-600">&#8226; {amenity}</span>
                                  ))}
                                  {room.roomAmenities.length > 6 && <span className="text-xs text-gray-500">& more...</span>}
                                </div>
                              </div>
                            )}
                            
                            {/* Price */}
                            <p className="text-base font-medium text-gray-800 mt-auto">
                              {displayPrice !== undefined ? `$${displayPrice.toFixed(2)} ${currency || 'USD'}` : 'Price not available'}
                              {displayPrice !== undefined && <span className="text-xs text-gray-500 font-normal">{priceLabel}</span>}
                            </p>
                            
                            {/* Select Button */}
                            <button className="mt-3 w-full px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition">Select</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
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