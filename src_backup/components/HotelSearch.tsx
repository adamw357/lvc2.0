import React, { useState } from 'react'
import { hotelService } from '@/services/hotelService'
import { SearchParams } from '@/services/hotelService'

interface HotelSearchProps {
  onSearch: (params: SearchParams) => void
  isLoading: boolean
}

export function HotelSearch({ onSearch, isLoading }: HotelSearchProps) {
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleLocationChange = async (value: string) => {
    setLocation(value)
    if (value.length >= 2) {
      const locationSuggestions = await hotelService.getLocationSuggestions(value)
      setSuggestions(locationSuggestions)
    } else {
      setSuggestions([])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({
      location,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder:text-gray-400"
            placeholder="Enter city or hotel name"
            required
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setLocation(suggestion)
                    setSuggestions([])
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">
            Check-in Date
          </label>
          <input
            type="date"
            id="checkIn"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">
            Check-out Date
          </label>
          <input
            type="date"
            id="checkOut"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="adults" className="block text-sm font-medium text-gray-700">
            Adults
          </label>
          <input
            type="number"
            id="adults"
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="children" className="block text-sm font-medium text-gray-700">
            Children
          </label>
          <input
            type="number"
            id="children"
            value={children}
            onChange={(e) => setChildren(parseInt(e.target.value))}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="rooms" className="block text-sm font-medium text-gray-700">
            Rooms
          </label>
          <input
            type="number"
            id="rooms"
            value={rooms}
            onChange={(e) => setRooms(parseInt(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            required
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search Hotels'}
        </button>
      </div>
    </form>
  )
} 