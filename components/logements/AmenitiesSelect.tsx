'use client';

/**
 * AmenitiesSelect Component
 * Multi-select dropdown for logement amenities
 * 
 * Features:
 * - Checkbox multi-select
 * - Search/filter
 * - Icons for each amenity
 * - Toggle all/none
 */

import { useState, useRef, useEffect } from 'react';
import { X, Check, CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export const AMENITIES = [
  { value: 'parking', label: 'Parking', icon: '🅿️' },
  { value: 'balcon', label: 'Balcon', icon: '🌅' },
  { value: 'cuisine_equipee', label: 'Cuisine équipée', icon: '🍳' },
  { value: 'clim', label: 'Climatisation', icon: '❄️' },
  { value: 'chauffage', label: 'Chauffage', icon: '🔥' },
  { value: 'jardin', label: 'Jardin', icon: '🌿' },
  { value: 'piscine', label: 'Piscine', icon: '🏊' },
  { value: 'gym', label: 'Salle de gym', icon: '💪' },
  { value: 'ascenseur', label: 'Ascenseur', icon: '🛗' },
  { value: 'wifi', label: 'WiFi', icon: '📡' },
  { value: 'terrasse', label: 'Terrasse', icon: '☀️' },
  { value: 'double_vitrage', label: 'Double vitrage', icon: '🪟' },
  { value: 'parking_couvert', label: 'Parking couvert', icon: '🏗️' },
  { value: 'garage', label: 'Garage', icon: '🚗' },
];

interface AmenitiesSelectProps {
  selected: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function AmenitiesSelect({
  selected,
  onChange,
  className,
  placeholder = 'Sélectionner des équipements...',
}: AmenitiesSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle amenity selection
  const toggleAmenity = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((a) => a !== value)
        : [...selected, value]
    );
  };

  // Toggle all amenities
  const toggleAll = () => {
    if (selected.length === AMENITIES.length) {
      onChange([]);
    } else {
      onChange(AMENITIES.map((a) => a.value));
    }
  };

  // Filter amenities by search term
  const filteredAmenities = AMENITIES.filter((a) =>
    a.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabels = selected
    .map((v) => AMENITIES.find((a) => a.value === v)?.label)
    .filter(Boolean);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 rounded-2xl border border-neutral-300 bg-white text-neutral-900 text-sm flex items-center justify-between hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition"
      >
        <span className="flex-1 text-left truncate">
          {selected.length === 0
            ? placeholder
            : `${selected.length} sélectionné${selected.length > 1 ? '(s)' : ''}`}
        </span>
        <CaretDown size={16} className="text-neutral-400" weight="bold" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-neutral-200 bg-white shadow-lg">
          {/* Search Input */}
          <div className="p-3 border-b border-neutral-200">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
              autoFocus
            />
          </div>

          {/* Toggle All */}
          <div className="p-3 border-b border-neutral-200">
            <button
              type="button"
              onClick={toggleAll}
              className="w-full text-left px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              {selected.length === AMENITIES.length
                ? '✓ Désélectionner tout'
                : 'Sélectionner tout'}
            </button>
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto py-2">
            {filteredAmenities.length === 0 ? (
              <p className="px-4 py-3 text-sm text-neutral-500 text-center">
                Aucun équipement trouvé
              </p>
            ) : (
              filteredAmenities.map((amenity) => (
                <button
                  key={amenity.value}
                  type="button"
                  onClick={() => toggleAmenity(amenity.value)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition hover:bg-neutral-50',
                    selected.includes(amenity.value) && 'bg-primary-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded-md border-2 border-neutral-300 flex items-center justify-center transition',
                      selected.includes(amenity.value) &&
                        'bg-primary-600 border-primary-600'
                    )}
                  >
                    {selected.includes(amenity.value) && (
                      <Check size={14} weight="bold" className="text-white" />
                    )}
                  </div>
                  <span className="text-lg">{amenity.icon}</span>
                  <span className="flex-1">{amenity.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Badges */}
      {selected.length > 0 && !isOpen && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedLabels.map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium"
            >
              {label}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleAmenity(selected[index]);
                }}
                className="hover:text-primary-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
