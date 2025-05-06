import React, { useState, useCallback } from 'react';
import { hotelService, LocationSuggestion } from '../services/hotelService';

interface LocationAutocompleteProps {
  onLocationSelect: (
    locationId: string, 
    locationName: string, 
    lat: number, 
    lng: number
  ) => void;
  inputClassName?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ onLocationSelect, inputClassName }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const results = await hotelService.getLocationSuggestions(searchQuery);
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setError('Failed to load suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSelect = (suggestion: LocationSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onLocationSelect(
      suggestion.id,
      suggestion.name,
      suggestion.coordinates.lat,
      suggestion.coordinates.long
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder="Where are you going?"
        className={inputClassName || "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
        aria-label="Destination"
      />
      {isLoading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {error && (
        <div className="absolute top-full left-0 mt-1 text-red-500 text-sm">
          {error}
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 border-b border-gray-200 last:border-b-0 ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-sm text-gray-500">{suggestion.type}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 