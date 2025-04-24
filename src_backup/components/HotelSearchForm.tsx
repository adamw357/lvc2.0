import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { LocationAutocomplete } from './LocationAutocomplete';
import { Button } from '@/components/ui/button';
import { DatePickerComponent } from '@/components/ui/date-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- Validation Schema --- 
// Define minimum future date (90 days)
const minDate = new Date();
minDate.setDate(minDate.getDate() + 90);

const searchSchema = z.object({
  locationId: z.string().min(1, { message: 'Destination is required' }),
  locationName: z.string(), // Store name for display/debugging
  lat: z.number().optional(), // Add lat, make optional initially
  lng: z.number().optional(), // Add lng, make optional initially
  checkInDate: z.date().min(minDate, { message: 'Check-in date must be at least 90 days in the future' }),
  checkOutDate: z.date(),
  adults: z.number().min(1, { message: 'At least 1 adult required' }).max(10), // Example limits
  children: z.number().min(0).max(10),
  rooms: z.number().min(1, { message: 'At least 1 room required' }).max(5)
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"], // Error applies to checkOutDate field
}).refine((data) => !!data.lat && !!data.lng, { // Add refinement to ensure lat/lng are set after selection
  message: "Please select a valid destination from the suggestions.",
  path: ["locationId"], // Associate error with the location input
});

type SearchFormData = z.infer<typeof searchSchema>;

interface HotelSearchFormProps {
  onSearch: (searchParams: any) => void; // Define more specific type later based on hotelService.searchHotels
}

export const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch }) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      locationId: '',
      locationName: '',
      lat: undefined,
      lng: undefined,
      checkInDate: undefined,
      checkOutDate: undefined,
      adults: 2,
      children: 0,
      rooms: 1,
    },
  });

  // Watch date changes to validate checkout > checkin dynamically
  const checkInDate = watch('checkInDate');

  const handleLocationSelect = (id: string, name: string, lat: number, lng: number) => {
    console.log('Location selected:', { id, name, lat, lng });
    setValue('locationId', id, { shouldValidate: true });
    setValue('locationName', name);
    setValue('lat', lat, { shouldValidate: true });
    setValue('lng', lng, { shouldValidate: true });
  };

  const onSubmit = (data: SearchFormData) => {
    // Ensure lat/lng are present before submitting (though zod refine should catch this)
    if (data.lat === undefined || data.lng === undefined) {
      console.error("Latitude and Longitude are missing, cannot submit search.");
      return; 
    }

    // --- DEBUG LOGS --- 
    console.log('Data object passed to onSubmit:', data);
    console.log('Value of data.lat in onSubmit:', data.lat);
    console.log('Value of data.lng in onSubmit:', data.lng);
    // --- END DEBUG LOGS --- 
    
    // Format data for the API call
    const apiParams = {
      locationId: data.locationId,
      lat: data.lat,
      lng: data.lng,
      checkInDate: format(data.checkInDate, 'yyyy-MM-dd'),
      checkOutDate: format(data.checkOutDate, 'yyyy-MM-dd'),
      occupancies: [
        {
          numOfRoom: data.rooms,
          numOfAdults: data.adults,
          numOfChildren: data.children,
          childAges: [],
        },
      ],
      currency: 'GBP',
      countryOfResidence: 'GB',
    };
    console.log('Submitting search with params:', apiParams);
    onSearch(apiParams); 
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="location">Destination</Label>
          <Controller
            name="locationId"
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <LocationAutocomplete
                value={value}
                onChange={onChange}
                onLocationSelect={handleLocationSelect}
              />
            )}
          />
          {errors.locationId && (
            <p className="text-red-500 text-sm mt-1">{errors.locationId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="checkInDate">Check-in Date</Label>
          <input
            type="date"
            id="checkInDate"
            {...control.register('checkInDate')}
            min={format(minDate, 'yyyy-MM-dd')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.checkInDate && (
            <p className="text-red-500 text-sm mt-1">{errors.checkInDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="checkOutDate">Check-out Date</Label>
          <input
            type="date"
            id="checkOutDate"
            {...control.register('checkOutDate')}
            min={checkInDate ? format(checkInDate, 'yyyy-MM-dd') : format(minDate, 'yyyy-MM-dd')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.checkOutDate && (
            <p className="text-red-500 text-sm mt-1">{errors.checkOutDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="adults">Adults</Label>
          <input
            type="number"
            id="adults"
            {...control.register('adults', { valueAsNumber: true })}
            min={1}
            max={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.adults && (
            <p className="text-red-500 text-sm mt-1">{errors.adults.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="children">Children</Label>
          <Input
            type="number"
            id="children"
            {...control.register('children', { valueAsNumber: true })}
            min={0}
            max={10}
          />
          {errors.children && (
            <p className="text-red-500 text-sm mt-1">{errors.children.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="rooms">Rooms</Label>
          <Input
            type="number"
            id="rooms"
            {...control.register('rooms', { valueAsNumber: true })}
            min={1}
            max={5}
          />
          {errors.rooms && (
            <p className="text-red-500 text-sm mt-1">{errors.rooms.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Search Hotels
        </Button>
      </div>
    </form>
  );
}; 