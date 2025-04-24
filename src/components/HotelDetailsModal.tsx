import React, { useState } from 'react';
import Image from 'next/image'; // Import next/image if needed for details
// Import Slider component and styles
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from 'next/navigation'; // Import useRouter
import { format } from 'date-fns'; // Import format function
// Import necessary icons
// import {
//   WifiIcon,
//   MapPinIcon, // Already used, but maybe relevant?
//   BuildingOffice2Icon, // For Business Center?
//   UserGroupIcon, // For meeting rooms?
//   SparklesIcon, // For spa?
//   ShoppingCartIcon, // For shops?
//   GlobeAltIcon, // Generic?
//   CheckCircleIcon // Good fallback
//   // Add more icons as needed: Parking, Pool, Gym, Restaurant etc. might need specific imports or aliases
// } from '@heroicons/react/24/solid'; 
// Note: Heroicons doesn't have obvious icons for Parking, Pool, Gym, Restaurant.
// We might need a different icon set or use generic ones like CheckCircleIcon.

// Define or import the refined type for hotel details content
interface HotelDetailsContent {
  overview?: { 
    name?: string;
    images?: {
      caption?: string;
      links?: {
        url?: string;
        size?: string;
      }[]; // links is an array of objects with url/size
      roomCodes?: any[]; // Keep other potential fields
    }[]; 
  };
  propertyInformation?: {
    propertyDescription?: string;
  };
  popularAmenities?: string[]; // Amenities are now an array of strings
  // Remove or keep other fields based on API structure (e.g., rooms)
  rooms?: any[]; 
}

interface HotelDetailsModalProps {
  details: HotelDetailsContent | null; // Use the refined type
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
  hotelId: string | null; // Add hotelId prop
  // Add props for search context
  checkInDate: Date | null;
  checkOutDate: Date | null;
  occupancies: any[] | null; // Consider defining a proper type later
  latitude: number | null;
  longitude: number | null;
  currency: string | null;
  // Remove new context props
  // destinationISOCode: string | null;
  // nationalityISOCode: string | null;
  // locationType: string | null; 
}

export const HotelDetailsModal: React.FC<HotelDetailsModalProps> = ({
  details,
  isLoading,
  error,
  onClose,
  hotelId, 
  // Destructure context props
  checkInDate,
  checkOutDate,
  occupancies,
  latitude,
  longitude,
  currency,
  // Remove destructuring of new context props
  // destinationISOCode,
  // nationalityISOCode,
  // locationType
}) => {
  // State for description expansion
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const router = useRouter(); // Get router instance

  if (!isLoading && !details && !error) {
    return null;
  }

  // Extract data safely based on the actual API structure
  const hotelName = details?.overview?.name || 'Hotel Details';
  const description = details?.propertyInformation?.propertyDescription; // Get description from propertyInformation
  // Correctly extract image URLs from the nested links array
  const images = details?.overview?.images
    ?.map(img => img?.links?.[0]?.url) // Safely access links[0].url
    .filter(Boolean) as string[] || []; // Filter out any null/undefined URLs
  const amenities = details?.popularAmenities || []; // Get amenities from popularAmenities

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: images.length > 1, // Only loop if more than one image
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true, // Show arrows
  };

  // Truncate description logic
  const TRUNCATE_LENGTH = 350; // Adjust character limit as needed
  const needsTruncation = description && description.length > TRUNCATE_LENGTH;
  const truncatedDescription = needsTruncation 
    ? description.substring(0, TRUNCATE_LENGTH) + '...' 
    : description;

  const displayDescription = isDescriptionExpanded ? description : truncatedDescription;

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Handler for the Select Room button
  const handleSelectRoom = () => {
    // Check if all necessary data is present - remove checks for new props
    if (hotelId && checkInDate && checkOutDate && occupancies && 
        latitude !== null && longitude !== null && currency) { 
      try {
        const checkInStr = format(checkInDate, 'yyyy-MM-dd');
        const checkOutStr = format(checkOutDate, 'yyyy-MM-dd');
        const occupanciesStr = encodeURIComponent(JSON.stringify(occupancies));

        // Construct the query parameters - remove new ones
        const queryParams = new URLSearchParams({
          checkIn: checkInStr,
          checkOut: checkOutStr,
          occupancies: occupanciesStr,
          lat: latitude.toString(),
          lng: longitude.toString(),
          currency: currency,
          // destCode: destinationISOCode,     // Removed
          // nationCode: nationalityISOCode, // Removed
          // type: locationType,             // Removed
        }).toString();

        const targetUrl = `/hotel/${hotelId}?${queryParams}`;
        console.log(`Navigating to hotel page: ${targetUrl}`);
        router.push(targetUrl);
        onClose(); 
      } catch (error) {
        console.error("Error constructing navigation URL:", error);
        onClose(); 
      }
    } else {
      console.error("Missing necessary context to navigate.");
      onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Modal Content Area */}
        <div className="overflow-y-auto flex-grow pr-2 slick-container">
          {isLoading && (
            <div className="flex justify-center items-center p-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-700">Loading details...</span>
            </div>
          )}

          {error && (
            <div className="text-red-600 bg-red-100 p-4 rounded">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {!isLoading && !error && details && (
            // Structured Display
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 pr-8">{hotelName}</h2>
              
              {/* Image Carousel */}
              {images.length > 0 ? (
                <div className="mb-4 rounded-lg overflow-hidden bg-gray-200">
                  <Slider {...sliderSettings}>
                    {images.map((imageUrl, index) => (
                      <div key={index} className="aspect-video relative">
                        <Image 
                          src={imageUrl} 
                          alt={`${hotelName} image ${index + 1}`} 
                          fill 
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 90vw, 800px"
                          // Add error handling for individual images if needed
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
              ) : (
                // Optional: Show placeholder if no images
                <div className="mb-4 rounded-lg overflow-hidden aspect-video relative bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              {description && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Overview</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{displayDescription}</p>
                  {/* Show Read More/Less button if truncation is needed */}
                  {needsTruncation && (
                    <button 
                      onClick={toggleDescription}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-1"
                    >
                      {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}

              {/* Update to use popularAmenities */}
              {amenities.length > 0 && (
                 <div className="mb-4">
                   <h3 className="text-lg font-semibold mb-2">Popular Amenities</h3>
                   <div className="flex flex-wrap gap-2"> 
                     {amenities.slice(0, 15).map((amenity, index) => {
                       return (
                         <span 
                           key={index} 
                           className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                         >
                           {amenity}
                         </span>
                       );
                     })}
                     {amenities.length > 15 && <span className="text-xs text-gray-500">...and more</span>}
                   </div>
                 </div>
              )}

              {/* Updated Rooms/Rates Section */}
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2">Rooms & Rates</h3>
                <p className="text-gray-600 text-sm">Please click 'Select Room' below to view available room types and pricing options.</p>
              </div>

            </div>
          )}
        </div>
        
        {/* Footer/Actions */}
        {!isLoading && !error && details && (
             <div className="mt-6 pt-4 border-t flex justify-end">
                 <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 mr-2">Close</button>
                 <button onClick={handleSelectRoom} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Select Room</button>  
             </div>
         )}
      </div>
      {/* Add some basic styles for slick arrows if needed */} 
      <style jsx global>{`
        .slick-container .slick-prev::before,
        .slick-container .slick-next::before {
          color: black; /* Or your preferred arrow color */
          font-size: 24px; /* Adjust size as needed */
        }
        .slick-prev {
            left: 10px; /* Adjust position */
            z-index: 1;
        }
        .slick-next {
            right: 10px; /* Adjust position */
            z-index: 1;
        }
        .slick-dots li button:before {
            color: #9ca3af; /* Default dot color */
        }
        .slick-dots li.slick-active button:before {
            color: #3b82f6; /* Active dot color */
        }
      `}</style>
    </div>
  );
}; 