'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/datepicker.css'
import { LocationAutocomplete } from './LocationAutocomplete'

export default function BookingWidget() {
  const [destination, setDestination] = useState('')
  const [locationId, setLocationId] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false)
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    rooms: 1
  })

  const handleSearch = () => {
    console.log({
      destination,
      locationId,
      lat,
      lng,
      checkIn,
      checkOut,
      guests
    })
  }

  const handleLocationSelect = (id: string, name: string, latitude: number, longitude: number) => {
    setLocationId(id);
    setDestination(name);
    setLat(latitude);
    setLng(longitude);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Find Your Perfect Hotel</h2>
      
      {/* Search Form */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Destination */}
        <div className="relative md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <LocationAutocomplete
            value={destination}
            onChange={setDestination}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Check-in */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
          <DatePicker
            selected={checkIn}
            onChange={(date) => setCheckIn(date)}
            selectsStart
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date()}
            placeholderText="Check-in"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071bc] focus:border-transparent bg-white"
            dateFormat="MM/dd/yyyy"
          />
        </div>

        {/* Check-out */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
          <DatePicker
            selected={checkOut}
            onChange={(date) => setCheckOut(date)}
            selectsEnd
            startDate={checkIn}
            endDate={checkOut}
            minDate={checkIn || new Date()}
            placeholderText="Check-out"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071bc] focus:border-transparent bg-white"
            dateFormat="MM/dd/yyyy"
          />
        </div>

        {/* Guests */}
        <div className="relative md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rooms & Guests</label>
          <button
            onClick={() => setIsGuestSelectorOpen(!isGuestSelectorOpen)}
            className="w-full h-[46px] px-4 py-3 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-[#0071bc] focus:border-transparent bg-white"
          >
            {guests.rooms} Room{guests.rooms !== 1 ? 's' : ''}, {guests.adults} Adult{guests.adults !== 1 ? 's' : ''}{guests.children > 0 ? `, ${guests.children} Child${guests.children !== 1 ? 'ren' : ''}` : ''}
          </button>
          {isGuestSelectorOpen && (
            <div className="absolute top-full right-0 mt-2 w-[320px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-4">
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">Room 1</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Adults</span>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setGuests(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#0071bc] hover:text-[#0071bc] disabled:opacity-50"
                          disabled={guests.adults <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{guests.adults}</span>
                        <button
                          onClick={() => setGuests(prev => ({ ...prev, adults: prev.adults + 1 }))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#0071bc] hover:text-[#0071bc]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Children</span>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setGuests(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#0071bc] hover:text-[#0071bc] disabled:opacity-50"
                          disabled={guests.children <= 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{guests.children}</span>
                        <button
                          onClick={() => setGuests(prev => ({ ...prev, children: prev.children + 1 }))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#0071bc] hover:text-[#0071bc]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setGuests(prev => ({ ...prev, rooms: prev.rooms + 1 }))}
                    className="w-full text-[#0071bc] py-2 hover:underline text-center"
                  >
                    + Add Room
                  </button>
                </div>
                <button
                  onClick={() => setIsGuestSelectorOpen(false)}
                  className="w-full bg-[#0071bc] text-white py-2 rounded-lg hover:bg-[#002855] transition mt-4"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-8">
        <button
          onClick={handleSearch}
          className="w-full bg-[#0071bc] text-white py-4 rounded-lg hover:bg-[#002855] transition font-semibold text-lg shadow-md"
        >
          Search Hotels
        </button>
      </div>
    </div>
  )
} 