'use client'

import React, { useState } from 'react'
import { HotelSearch } from '@/components/HotelSearch'
import { hotelService } from '@/services/hotelService'
import Image from 'next/image'
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa'

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (searchParams: any) => {
    setLoading(true)
    setError(null)
    try {
      const results = await hotelService.searchHotels(searchParams)
      setHotels(results)
    } catch (err) {
      setError('Failed to fetch hotels. Please try again later.')
      console.error('Error searching hotels:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl mb-8">Search through thousands of hotels worldwide</p>
          <HotelSearch onSearch={handleSearch} />
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && hotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Enter your search criteria above to find hotels</p>
          </div>
        )}

        {!loading && !error && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{hotel.location}</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">{hotel.rating}</span>
                    <span className="text-gray-600 ml-1">({hotel.reviewCount} reviews)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">${hotel.pricePerNight}</span>
                      <span className="text-gray-600">/night</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 