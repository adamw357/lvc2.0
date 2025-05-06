import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface HotelNameSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const HotelNameSearch: React.FC<HotelNameSearchProps> = ({
  onSearch,
  placeholder = 'Search hotels by name...',
  className = ''
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          console.log('Hotel name search input:', e.target.value);
          setQuery(e.target.value);
        }}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}; 