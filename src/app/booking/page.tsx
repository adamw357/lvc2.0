'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation'; // Assuming shared navigation
import { hotelService } from '@/services/hotelService';

// Helper component to read search params (needed because useSearchParams requires Suspense)
function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract booking details from URL parameters
  const hotelId = searchParams?.get('hotelId');
  const checkIn = searchParams?.get('checkIn');
  const checkOut = searchParams?.get('checkOut');
  const occupanciesStr = searchParams?.get('occupancies');
  const currency = searchParams?.get('currency');
  const roomId = searchParams?.get('roomId');
  const roomName = searchParams?.get('roomName');
  const groupId = searchParams?.get('groupId');
  const rateIdStr = searchParams?.get('rateId');
  const recommendationId = searchParams?.get('recommendationId');
  const totalPriceStr = searchParams?.get('totalPrice');
  const pricePerNightStr = searchParams?.get('pricePerNight');

  // Parse JSON strings and numbers
  let occupancies = null;
  try {
    occupancies = occupanciesStr ? JSON.parse(occupanciesStr) : null;
  } catch (e) { console.error("Failed to parse occupancies", e); }

  let rateId = null;
  try {
    rateId = rateIdStr ? JSON.parse(rateIdStr) : null;
  } catch (e) { console.error("Failed to parse rateId", e); }

  const totalPrice = totalPriceStr ? parseFloat(totalPriceStr) : 0;
  // You might want to display perNight or total based on context
  const displayPrice = totalPrice; 

  // TODO: Fetch full hotel details using hotelId if needed for display
  // const [hotelDetails, setHotelDetails] = useState(null);
  // useEffect(() => { ... fetch ... }, [hotelId]);

  const handleSubmitBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      // Get form data
      const formData = new FormData(event.target as HTMLFormElement);
      const guestDetails = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
      };

      // Validate required fields
      if (!hotelId || !checkIn || !checkOut || !occupancies || !currency || !rateId || !recommendationId) {
        throw new Error('Missing required booking information');
      }

      // Create booking
      const bookingResult = await hotelService.createBooking({
        hotelId,
        token: recommendationId, // Using recommendationId as the token
        guestDetails,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        occupancies,
        currency,
        rateId,
        recommendationId
      });

      // Handle successful booking
      console.log('Booking successful:', bookingResult);
      
      // TODO: Navigate to confirmation page with booking ID
      // For now, just show success message
      alert('Booking successful! Booking ID: ' + bookingResult.data?.bookingId);
      
      // You might want to redirect to a confirmation page
      // router.push(`/confirmation?bookingId=${bookingResult.data?.bookingId}`);

    } catch (error) {
      console.error('Booking failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to complete booking. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Complete Your Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Booking Summary Column */}
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Booking Summary</h2>
          {/* TODO: Display Hotel Name (requires fetching details or passing it) */}
          <p className="mb-2"><span className="font-semibold">Hotel ID:</span> {hotelId || 'N/A'}</p>
          <p className="mb-2"><span className="font-semibold">Room:</span> {roomName || 'N/A'}</p>
          <p className="mb-2"><span className="font-semibold">Check-in:</span> {checkIn || 'N/A'}</p>
          <p className="mb-2"><span className="font-semibold">Check-out:</span> {checkOut || 'N/A'}</p>
          {/* TODO: Display occupancy details more nicely */}
          <p className="mb-2"><span className="font-semibold">Occupancy:</span> {occupanciesStr || 'N/A'}</p>
          <p className="text-lg font-bold mt-4 pt-4 border-t">
            Total Price: {currency || '$'}{displayPrice.toFixed(2)}
          </p>
          {/* Display Rate ID / Rec ID for debugging/reference */}
          <p className="text-xs text-gray-500 mt-2">Rate ID(s): {rateIdStr || 'N/A'}</p>
          <p className="text-xs text-gray-500">Rec ID: {recommendationId || 'N/A'}</p>
        </div>

        {/* Guest Details & Payment Column */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmitBooking}>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Guest Information</h2>
              {/* Basic Guest Form Fields (Add more as needed) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" id="firstName" name="firstName" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" id="lastName" name="lastName" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="email" name="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" id="phone" name="phone" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>

            {/* Placeholder for Payment Section */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <p className="text-gray-600">Payment integration goes here...</p>
              {/* TODO: Add credit card form, Stripe Elements, etc. */}
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main export requires Suspense boundary for useSearchParams
export default function BookingPage() {
  return (
    <>
      <Navigation />
      <Suspense fallback={<div>Loading booking details...</div>}>
        <BookingFormContent />
      </Suspense>
    </>
  );
} 