'use client';

/**
 * PropertyRow Component - Compact List View
 * 
 * Features:
 * - Image thumbnail
 * - Key details inline (loyer, surface, chambres, locataire)
 * - Status badge
 * - Quick action buttons
 * - Hover effects
 * - Mobile responsive
 */

import Link from 'next/link';
import Image from 'next/image';
import { Logement } from '@/lib/types';
import { formatMontant } from '@/lib/utils';
import {
  DoorOpen,
  Bathtub,
  House,
  MapPin,
  PencilSimple,
  ArrowRight,
  Eye,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface PropertyRowProps {
  logement: Logement;
  immeubleName?: string;
  locataireName?: string;
  onEdit?: (logementId: string) => void;
  className?: string;
}

export function PropertyRow({
  logement,
  immeubleName,
  locataireName,
  onEdit,
  className,
}: PropertyRowProps) {
  const photos = [
    logement.photo_principale,
    ...(logement.photos_additionnelles || []),
  ].filter(Boolean) as string[];

  const thumbnail = photos[0];
  const isOccupe = logement.statut === 'occupe';

  return (
    <Link href={`/logements/${logement.id}`}>
      <div
        className={cn(
          'flex items-center gap-4 p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group cursor-pointer',
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg bg-neutral-100 overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={logement.nom || 'Property'}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <DoorOpen size={32} className="text-neutral-400" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title and Type */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 text-base group-hover:text-primary-600 transition-colors line-clamp-1">
                {logement.nom}
              </h3>
              {immeubleName && (
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                  <MapPin size={12} />
                  <span className="line-clamp-1">{immeubleName}</span>
                </div>
              )}
            </div>
            {/* Status Badge */}
            <div className="flex-shrink-0">
              {isOccupe ? (
                <span className="inline-block px-2.5 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold whitespace-nowrap">
                  Occupé
                </span>
              ) : (
                <span className="inline-block px-2.5 py-1 rounded-full bg-success-100 text-success-700 text-xs font-semibold whitespace-nowrap">
                  Vacant
                </span>
              )}
            </div>
          </div>

          {/* Details Row */}
          <div className="flex items-center gap-3 text-sm text-neutral-600 flex-wrap">
            {/* Loyer */}
            <div className="font-semibold text-neutral-900">
              {formatMontant(logement.loyer_mensuel)}
            </div>

            {/* Separator */}
            <div className="hidden sm:block text-neutral-300">•</div>

            {/* Chambres */}
            {logement.chambres && (
              <>
                <div className="hidden sm:flex items-center gap-1">
                  <DoorOpen size={14} />
                  <span>{logement.chambres} ch.</span>
                </div>
                <div className="hidden sm:block text-neutral-300">•</div>
              </>
            )}

            {/* Salles de bain */}
            {logement.salles_bain && (
              <>
                <div className="hidden sm:flex items-center gap-1">
                  <Bathtub size={14} />
                  <span>{logement.salles_bain} SDB</span>
                </div>
                <div className="hidden sm:block text-neutral-300">•</div>
              </>
            )}

            {/* Surface */}
            {logement.surface_m2 && (
              <div className="flex items-center gap-1">
                <House size={14} />
                <span>{Math.round(logement.surface_m2)}m²</span>
              </div>
            )}

            {/* Locataire (if occupied) */}
            {isOccupe && locataireName && (
              <>
                <div className="text-neutral-300">•</div>
                <div className="text-neutral-700 font-medium">{locataireName}</div>
              </>
            )}
          </div>

          {/* Amenities Preview */}
          {logement.amenities && logement.amenities.length > 0 && (
            <div className="flex gap-1 flex-wrap pt-1">
              {logement.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-block px-1.5 py-0.5 rounded text-xs bg-neutral-100 text-neutral-600 font-medium"
                >
                  {amenity.split('_')[0]}
                </span>
              ))}
              {logement.amenities.length > 3 && (
                <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-neutral-100 text-neutral-600 font-medium">
                  +{logement.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit(logement.id);
              }}
              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
              title="Modifier"
              aria-label="Modifier le logement"
            >
              <PencilSimple size={18} />
            </button>
          )}
          <div className="p-2 rounded-lg text-neutral-400 group-hover:text-primary-600 transition-colors">
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Mobile Action Button */}
        <div className="md:hidden p-2 rounded-lg text-neutral-400 group-hover:text-primary-600 transition-colors">
          <Eye size={18} />
        </div>
      </div>
    </Link>
  );
}
