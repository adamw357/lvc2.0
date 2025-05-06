import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Hotel {
  hotelName: string;
  lat: number;
  lng: number;
  address: {
    line1: string;
  };
}

interface HotelMapProps {
  hotels: Hotel[];
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  onMarkerClick?: (hotel: Hotel) => void;
}

export const HotelMap: React.FC<HotelMapProps> = ({
  hotels,
  center = { lat: 36.1147, lng: -115.1728 }, // Default to Las Vegas Strip
  zoom = 13,
  onMarkerClick
}) => {
  console.log('[HotelMap] Rendering with hotels:', hotels);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.');
        return;
      }
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      try {
        const google = await loader.load();
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });
          setMap(mapInstance);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Add new markers
    hotels.forEach(hotel => {
      // Validate coordinates
      if (typeof hotel.lat !== 'number' || typeof hotel.lng !== 'number' ||
          isNaN(hotel.lat) || isNaN(hotel.lng)) {
        console.warn(`Invalid coordinates for hotel ${hotel.hotelName}:`, hotel);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat: hotel.lat, lng: hotel.lng },
        map,
        title: hotel.hotelName,
        animation: google.maps.Animation.DROP
      });

      // Add click listener
      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(hotel);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });

      // Only fit bounds if we have valid positions
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      } else {
        // If no valid bounds, center on the first hotel
        const firstHotel = hotels[0];
        if (firstHotel && typeof firstHotel.lat === 'number' && typeof firstHotel.lng === 'number') {
          map.setCenter({ lat: firstHotel.lat, lng: firstHotel.lng });
          map.setZoom(zoom);
        }
      }
    }
  }, [map, hotels, onMarkerClick, zoom]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-lg shadow-md"
      style={{ minHeight: '400px' }}
    />
  );
}; 