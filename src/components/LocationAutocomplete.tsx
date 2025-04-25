import React, { useState, useEffect, useCallback } from 'react';
import { hotelService } from '../services/hotelService';

interface LocationSuggestion {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  coordinates: {
    lat: number;
    long: number;
  };
}

interface LocationAutocompleteProps {
  onLocationSelect: (locationId: string, locationName: string, lat: number, long: number, type: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ onLocationSelect, placeholder = "Where are you going?", className = "", inputClassName = "" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await hotelService.getLocationSuggestions(searchQuery);
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, fetchSuggestions]);

  const handleSelect = (suggestion: LocationSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onLocationSelect(suggestion.id, suggestion.name, suggestion.coordinates.lat, suggestion.coordinates.long, suggestion.type);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName || `w-full px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
      />
      {showSuggestions && (query.length >= 2) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  onClick={() => handleSelect(suggestion)}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-baseline">
                    <span className="font-medium text-gray-900 mr-2">{suggestion.name}</span>
                    <span className="text-sm text-gray-500">{suggestion.type}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-gray-500">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
}; 