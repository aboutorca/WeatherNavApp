'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Location, SearchResult } from '@/lib/types';
import { debounce } from '@/lib/utils';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location, address: string) => void;
  placeholder?: string;
}

export default function AddressInput({
  value,
  onChange,
  onLocationSelect,
  placeholder
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchAddress = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (value) {
      searchAddress(value);
    } else {
      setSuggestions([]);
    }
  }, [value, searchAddress]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: SearchResult) => {
    const location: Location = {
      lat: suggestion.center[1],
      lng: suggestion.center[0],
      address: suggestion.place_name
    };

    onChange(suggestion.place_name);
    onLocationSelect(location, suggestion.place_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full"
      />

      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <svg
            className="animate-spin h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
              onClick={() => handleSelect(suggestion)}
            >
              <div className="font-medium text-gray-900">
                {suggestion.place_name.split(',')[0]}
              </div>
              <div className="text-gray-500 text-xs">
                {suggestion.place_name.split(',').slice(1).join(',')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}