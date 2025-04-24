'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Hotel } from '@/services/hotelService'
import { FaStar, FaWifi, FaSwimmingPool, FaParking, FaCoffee } from 'react-icons/fa'

interface HotelDetailsProps {
  hotel: Hotel
}

export function HotelDetails({ hotel }: HotelDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  const renderFacilityIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'wifi':
        return <FaWifi className="text-gray-600" />
      case 'pool':
        return <FaSwimmingPool className="text-gray-600" />
      case 'parking':
        return <FaParking className="text-gray-600" />
      case 'restaurant':
        return <FaCoffee className="text-gray-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hotel Header */}
      <div className="relative h-96">
        <Image
          src={hotel.images[selectedImage]?.url || "https://placehold.co/1200x400/0071bc/FFFFFF/png?text=Hotel"}
          alt={hotel.name}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="container mx-auto px-4 py-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {Array.from({ length: parseInt(hotel.rating) }).map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <span>{hotel.address.city}, {hotel.address.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-2 overflow-x-auto pb-4">
          {hotel.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden ${
                selectedImage === index ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <Image
                src={image.url}
                alt={`${hotel.name} - Image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hotel Details */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">About the Hotel</h2>
              <p className="text-gray-600">{hotel.description}</p>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.facilities.map((facility) => (
                  <div key={facility.id} className="flex items-center space-x-2">
                    {renderFacilityIcon(facility.name)}
                    <span>{facility.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="aspect-square bg-gray-200 mb-4 rounded-lg">
                {/* TODO: Add map component */}
                <div className="h-full flex items-center justify-center text-gray-500">
                  Map placeholder
                </div>
              </div>
              <div className="text-gray-600">
                <p>{hotel.address.line1}</p>
                <p>{hotel.address.city}</p>
                <p>{hotel.address.state}</p>
                <p>{hotel.address.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 