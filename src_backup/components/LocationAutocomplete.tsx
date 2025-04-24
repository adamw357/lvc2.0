import React, { useState, useEffect, useCallback, useRef } from 'react';
import { hotelService } from '@/services/hotelService';
import { api, testApiConnection, type LocationSuggestion, type AutosuggestResponse } from '../services/api';
import debounce from 'lodash/debounce';

interface LocationAutocompleteProps {
  onLocationSelect: (
    locationId: string, 
    locationName: string, 
    lat: number, 
    lng: number
  ) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ 
  onLocationSelect,
  value = '',
  onChange
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Update internal state when external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle clicks outside the component to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    console.log('LocationAutocomplete mounted');
    // Test API connection when component mounts
    const checkApiConnection = async () => {
      try {
        console.log('Checking API connection...');
        const connected = await testApiConnection();
        console.log('API connection test response:', connected);
        setApiConnected(connected);
        if (!connected) {
          setError('Unable to connect to the search service. Please try again later.');
        }
      } catch (error) {
        console.error('API connection test error:', error);
        setApiConnected(false);
        setError('Failed to connect to the search service.');
      }
    };
    checkApiConnection();
  }, []);

  // Debounced fetch function
  const debouncedFetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      console.log('LocationAutocomplete: Debounced search triggered for:', searchQuery);
      
      if (searchQuery.length < 2) {
        console.log('LocationAutocomplete: Query too short, clearing suggestions');
        setSuggestions([]);
        setIsDropdownVisible(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('LocationAutocomplete: Fetching suggestions for query:', searchQuery);
        
        const results = await hotelService.getLocationSuggestions(searchQuery);
        console.log('LocationAutocomplete: Raw API response:', results);
        
        if (!Array.isArray(results)) {
          console.error('LocationAutocomplete: Invalid response format:', results);
          setError('Received invalid response from server');
          setSuggestions([]);
          setIsDropdownVisible(false);
          return;
        }

        if (results.length === 0) {
          console.log('LocationAutocomplete: No suggestions found');
          setError('No locations found. Try a different search term.');
          setSuggestions([]);
          setIsDropdownVisible(false);
          return;
        }

        console.log('LocationAutocomplete: Setting suggestions:', results);
        setSuggestions(results);
        setIsDropdownVisible(true);
        setError(null);
        
      } catch (error: any) {
        console.error('LocationAutocomplete: Failed to fetch suggestions:', error);
        console.error('LocationAutocomplete: Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        setError(error.message || 'Failed to load suggestions. Please try again.');
        setSuggestions([]);
        setIsDropdownVisible(false);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    console.log('LocationAutocomplete: Input changed:', newValue);
    setQuery(newValue);
    onChange?.(newValue);

    if (newValue.length >= 2) {
      console.log('LocationAutocomplete: Triggering search for:', newValue);
      debouncedFetchSuggestions(newValue);
    } else {
      console.log('LocationAutocomplete: Clearing suggestions (query too short)');
      setSuggestions([]);
      setIsDropdownVisible(false);
      setError(null);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsDropdownVisible(true);
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    console.log('Selected suggestion:', suggestion);
    const newValue = suggestion.fullName;
    setQuery(newValue);
    onChange?.(newValue);
    onLocationSelect(
      suggestion.id, 
      suggestion.name, 
      suggestion.coordinates.lat, 
      suggestion.coordinates.long
    );
    setSuggestions([]);
    setIsDropdownVisible(false);
  };

  return (
    <div className="relative w-full" ref={componentRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071bc] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400"
        placeholder="Where are you going?"
        disabled={apiConnected === false}
        aria-expanded={isDropdownVisible}
        aria-haspopup="listbox"
        aria-controls="location-suggestions"
        aria-describedby={error ? "location-error" : undefined}
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
        <div 
          id="location-error"
          className="absolute top-full left-0 mt-1 text-red-500 text-sm bg-white p-2 rounded-md shadow-sm border border-red-200 z-50"
          role="alert"
        >
          {error}
        </div>
      )}
      {isDropdownVisible && suggestions.length > 0 && (
        <ul 
          id="location-suggestions"
          role="listbox"
          className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-200"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ease-in-out"
              role="option"
              aria-selected="false"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }
              }}
            >
              <div className="flex flex-col">
                <div className="font-medium text-gray-900">{suggestion.fullName}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>{suggestion.type}</span>
                  {suggestion.type && suggestion.country && <span>•</span>}
                  <span>{suggestion.country}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 