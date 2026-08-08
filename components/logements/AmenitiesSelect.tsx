'use client';

import { Check, Car, Wind, Flame, Tree, WifiX, House, DoorOpen } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export const AMENITIES = [
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'balcon', label: 'Balcon', icon: Wind },
  { value: 'cuisine_equipee', label: 'Cuisine équipée', icon: House },
  { value: 'clim', label: 'Climatisation', icon: Wind },
  { value: 'chauffage', label: 'Chauffage', icon: Flame },
  { value: 'jardin', label: 'Jardin', icon: Tree },
  { value: 'wifi', label: 'WiFi', icon: WifiX },
  { value: 'ascenseur', label: 'Ascenseur', icon: DoorOpen },
  { value: 'terrasse', label: 'Terrasse', icon: Wind },
  { value: 'garage', label: 'Garage', icon: Car },
];

interface AmenitiesSelectProps {
  selected: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
}

export function AmenitiesSelect({
  selected,
  onChange,
  className,
}: AmenitiesSelectProps) {
  const toggleAmenity = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((a) => a !== value)
        : [...selected, value]
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 gap-2">
        {AMENITIES.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selected.includes(amenity.value);
          
          return (
            <button
              key={amenity.value}
              type="button"
              onClick={() => toggleAmenity(amenity.value)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all font-medium text-sm',
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
              )}
            >
              <div className="relative flex-shrink-0">
                <Icon size={18} weight="bold" />
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                    <Check size={12} weight="bold" className="text-white" />
                  </div>
                )}
              </div>
              <span className="flex-1 text-left truncate">{amenity.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
