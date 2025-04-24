'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hotelService } from '@/services/hotelService';
import type { RoomRate } from '@/services/hotelService';
import { LoadingOverlay } from '@/components/LoadingOverlay';

interface HotelBookingFormProps {
  hotelId: string;
  room: RoomRate;
  checkInDate: string;
  checkOutDate: string;
  occupancy: {
    adults: number;
    children: number;
    childAges: number[];
  };
}

export const HotelBookingForm: React.FC<HotelBookingFormProps> = ({
  hotelId,
  room,
  checkInDate,
  checkOutDate,
  occupancy,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    guestInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
    },
    paymentInfo: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardHolderName: '',
    },
  });

  const handleInputChange = (section: 'guestInfo' | 'paymentInfo', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Validate the form data
      // 2. Tokenize the credit card information through a payment processor
      // 3. Get a booking token from a previous API call
      const bookingToken = 'dummy-token'; // This should come from a previous API call

      const bookingResult = await hotelService.bookHotel(
        hotelId,
        bookingToken,
        {
          guestInfo: formData.guestInfo,
          paymentInfo: formData.paymentInfo,
          roomId: room.id,
          checkInDate,
          checkOutDate,
          occupancy,
        }
      );

      // Redirect to booking confirmation page
      router.push(`/booking/confirmation/${bookingResult.bookingId}`);
    } catch (err) {
      console.error('Booking failed:', err);
      setError('Failed to process booking. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <LoadingOverlay isVisible={isLoading} />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-lg shadow-lg p-6">
        {/* Guest Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Guest Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.guestInfo.firstName}
                onChange={(e) => handleInputChange('guestInfo', 'firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.guestInfo.lastName}
                onChange={(e) => handleInputChange('guestInfo', 'lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.guestInfo.email}
                onChange={(e) => handleInputChange('guestInfo', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                required
                value={formData.guestInfo.phone}
                onChange={(e) => handleInputChange('guestInfo', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                value={formData.guestInfo.specialRequests}
                onChange={(e) => handleInputChange('guestInfo', 'specialRequests', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Payment Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                required
                value={formData.paymentInfo.cardNumber}
                onChange={(e) => handleInputChange('paymentInfo', 'cardNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Month
              </label>
              <input
                type="text"
                required
                placeholder="MM"
                value={formData.paymentInfo.expiryMonth}
                onChange={(e) => handleInputChange('paymentInfo', 'expiryMonth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Year
              </label>
              <input
                type="text"
                required
                placeholder="YYYY"
                value={formData.paymentInfo.expiryYear}
                onChange={(e) => handleInputChange('paymentInfo', 'expiryYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                required
                value={formData.paymentInfo.cvv}
                onChange={(e) => handleInputChange('paymentInfo', 'cvv', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                value={formData.paymentInfo.cardHolderName}
                onChange={(e) => handleInputChange('paymentInfo', 'cardHolderName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071bc]"
              />
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Booking Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Room Type</span>
              <span className="font-semibold">{room.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in</span>
              <span className="font-semibold">{checkInDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out</span>
              <span className="font-semibold">{checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests</span>
              <span className="font-semibold">
                {occupancy.adults} Adults, {occupancy.children} Children
              </span>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Price</span>
                <span className="text-[#0071bc]">£{room.rates.totalRate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#0071bc] text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
          >
            Complete Booking
          </button>
        </div>
      </form>
    </div>
  );
}; 