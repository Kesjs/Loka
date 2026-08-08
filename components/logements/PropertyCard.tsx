'use client';

/**
 * PropertyCard Component - Marketplace Style Grid Card
 * 
 * Features:
 * - Image carousel/gallery
 * - Amenities display
 * - Quick stats (loyer, surface, chambres)
 * - Status badge (Occupé/Vacant + locataire)
 * - Call-to-action buttons
 * - Hover effects and animations
 * - Responsive design
 */

import Link from 'next/link';
import { Logement } from '@/lib/types';
import { formatMontant } from '@/lib/utils';
import { ImageGallery } from './ImageGallery';
import {
  DoorOpen,
  Bathtub,
  House,
  MapPin,
  Heart,
  ArrowRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PropertyCardProps {
  logement: Logement;
  immeubleName?: string;
  locataireName?: string;
  onFavorite?: (logementId: string) => void;
  isFavorited?: boolean;
  className?: string;
}

const amenitiesIcons: Record<string, React.ReactNode> = {
  parking: '🅿️',
  balcon: '🌅',
  cuisine_equipee: '🍳',
  clim: '❄️',
  chauffage: '🔥',
  jardin: '🌿',
  piscine: '🏊',
  gym: '💪',
  ascenseur: '🛗',
  wifi: '📡',
  terrasse: '☀️',
  double_vitrage: '🪟',
  parking_couvert: '🏗️',
  garage: '🚗',
};

export function PropertyCard({
  logement,
  immeubleName,
  locataireName,
  onFavorite,
  isFavorited = false,
  className,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFav, setIsFav] = useState(isFavorited);

  // Gather all photos
  const photos = [
    logement.photo_principale,
    ...(logement.photos_additionnelles || []),
  ].filter(Boolean) as string[];

  const hasPhotos = photos.length > 0;
  const isOccupe = logement.statut === 'occupe';

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFav(!isFav);
    onFavorite?.(logement.id);
  };

  return (
    <Link href={`/logements/${logement.id}`}>
      <div
        className={cn(
          'group h-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-neutral-100 hover:border-primary-200 cursor-pointer',
          className
        )}
      >
        {/* Image Section with Gallery */}
        <div className="relative h-64 bg-neutral-100 overflow-hidden">
          {hasPhotos ? (
            <ImageGallery
              images={photos}
              height="md"
              showThumbnails={false}
              className="!rounded-none !h-64"
              onImageChange={setCurrentImageIndex}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <DoorOpen size={48} className="text-neutral-400" />
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={20}
              weight={isFav ? 'fill' : 'regular'}
              className={isFav ? 'text-accent-500' : 'text-neutral-400'}
            />
          </button>

          {/* Status Badge */}
          <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
            {isOccupe ? (
              <span className="px-3 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold">
                ✓ Occupé
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-success-100 text-success-700 text-xs font-semibold">
                Vacant
              </span>
            )}
            {logement.type && (
              <span className="px-3 py-1 rounded-full bg-white/90 text-neutral-600 text-xs font-medium">
                {logement.type}
              </span>
            )}
          </div>

          {/* Image Counter */}
          {photos.length > 1 && (
            <div className="absolute top-3 left-3 text-xs text-white font-semibold">
              {currentImageIndex + 1}/{photos.length}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col gap-3">
          {/* Title & Location */}
          <div className="space-y-1">
            <h3 className="font-semibold text-neutral-900 text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">
              {logement.nom}
            </h3>
            {immeubleName && (
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin size={14} className="flex-shrink-0" />
                <span className="line-clamp-1">{immeubleName}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {logement.description && (
            <p className="text-sm text-neutral-600 line-clamp-2">
              {logement.description}
            </p>
          )}

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-200">
            {logement.chambres && (
              <div className="flex flex-col items-center">
                <DoorOpen size={18} className="text-neutral-500 mb-1" />
                <span className="text-xs text-neutral-500">Chambres</span>
                <span className="font-semibold text-neutral-900">{logement.chambres}</span>
              </div>
            )}
            {logement.salles_bain && (
              <div className="flex flex-col items-center">
                <Bathtub size={18} className="text-neutral-500 mb-1" />
                <span className="text-xs text-neutral-500">SDB</span>
                <span className="font-semibold text-neutral-900">{logement.salles_bain}</span>
              </div>
            )}
            {logement.surface_m2 && (
              <div className="flex flex-col items-center">
                <House size={18} className="text-neutral-500 mb-1" />
                <span className="text-xs text-neutral-500">Surface</span>
                <span className="font-semibold text-neutral-900">{Math.round(logement.surface_m2)}m²</span>
              </div>
            )}
          </div>

          {/* Amenities Pills */}
          {logement.amenities && logement.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {logement.amenities.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-xs text-neutral-700 font-medium"
                  title={amenity}
                >
                  <span>{amenitiesIcons[amenity] || '✓'}</span>
                  <span className="hidden sm:inline">{amenity.replace('_', ' ')}</span>
                </span>
              ))}
              {logement.amenities.length > 4 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-xs text-neutral-700 font-medium">
                  +{logement.amenities.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Locataire Info (if occupied) */}
          {isOccupe && locataireName && (
            <div className="text-sm text-neutral-600 px-3 py-2 bg-accent-50 rounded-lg">
              👤 <span className="font-medium text-neutral-900">{locataireName}</span>
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2 mt-auto">
            <div>
              <p className="text-xs text-neutral-500 uppercase font-semibold">Loyer/mois</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatMontant(logement.loyer_mensuel)}
              </p>
            </div>
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors group-hover:scale-110 group-hover:translate-x-1"
              aria-label="Voir détails"
            >
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
