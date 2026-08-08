'use client';

/**
 * PhotoManager Component
 * Manage existing photos: reorder, delete, set as primary
 * Also allows uploading new photos
 */

import { useState } from 'react';
import Image from 'next/image';
import { X, Check, ArrowUp, ArrowDown, Upload } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ManagedPhoto {
  url: string;
  storePath?: string; // For deletion tracking
  isNew?: boolean; // Newly uploaded
}

interface PhotoManagerProps {
  photos: string[]; // URLs
  primaryPhotoUrl?: string;
  onPhotoOrderChange?: (orderedUrls: string[]) => void;
  onPhotoDelete?: (url: string) => void;
  onPhotoUpload?: (files: File[]) => void;
  onSetPrimary?: (url: string) => void;
  maxPhotos?: number;
  className?: string;
}

export function PhotoManager({
  photos,
  primaryPhotoUrl,
  onPhotoOrderChange,
  onPhotoDelete,
  onPhotoUpload,
  onSetPrimary,
  maxPhotos = 10,
  className,
}: PhotoManagerProps) {
  const [managedPhotos, setManagedPhotos] = useState<ManagedPhoto[]>(
    photos.map((url) => ({ url, isNew: false }))
  );
  const [primaryUrl, setPrimaryUrl] = useState(primaryPhotoUrl);
  const [isUploading, setIsUploading] = useState(false);

  // Move photo up in order
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...managedPhotos];
    [newPhotos[index], newPhotos[index - 1]] = [newPhotos[index - 1], newPhotos[index]];
    setManagedPhotos(newPhotos);
    onPhotoOrderChange?.(newPhotos.map((p) => p.url));
  };

  // Move photo down in order
  const moveDown = (index: number) => {
    if (index === managedPhotos.length - 1) return;
    const newPhotos = [...managedPhotos];
    [newPhotos[index], newPhotos[index + 1]] = [newPhotos[index + 1], newPhotos[index]];
    setManagedPhotos(newPhotos);
    onPhotoOrderChange?.(newPhotos.map((p) => p.url));
  };

  // Delete photo
  const deletePhoto = (index: number) => {
    const url = managedPhotos[index].url;
    const newPhotos = managedPhotos.filter((_, i) => i !== index);
    setManagedPhotos(newPhotos);
    if (primaryUrl === url) {
      // Set new primary to first remaining photo
      const newPrimary = newPhotos[0]?.url;
      setPrimaryUrl(newPrimary);
      onSetPrimary?.(newPrimary || '');
    }
    onPhotoDelete?.(url);
  };

  // Set as primary
  const handleSetPrimary = (url: string) => {
    setPrimaryUrl(url);
    onSetPrimary?.(url);
  };

  // Handle photo upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files ? Array.from(e.currentTarget.files) : [];
    if (files.length === 0) return;

    if (managedPhotos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos autorisées`);
      return;
    }

    setIsUploading(true);
    onPhotoUpload?.(files);
    setIsUploading(false);
  };

  return (
    <div className={className}>
      {/* Upload Section */}
      {managedPhotos.length < maxPhotos && (
        <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-400 transition text-center cursor-pointer">
          <label className="cursor-pointer flex flex-col items-center gap-2">
            <Upload size={24} className="text-neutral-400" />
            <p className="text-sm font-medium text-neutral-700">
              Cliquez ou glissez pour ajouter des photos
            </p>
            <p className="text-xs text-neutral-500">
              {managedPhotos.length}/{maxPhotos} photos
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Photo Grid */}
      {managedPhotos.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-neutral-900">
            Photos ({managedPhotos.length}/{maxPhotos})
          </p>

          <div className="space-y-2">
            {managedPhotos.map((photo, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg bg-neutral-100 overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    Photo {index + 1}
                    {primaryUrl === photo.url && (
                      <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold">
                        Principale
                      </span>
                    )}
                  </p>
                  {photo.isNew && (
                    <p className="text-xs text-primary-600 font-medium">
                      • Nouvelle photo
                    </p>
                  )}
                </div>

                {/* Order Controls */}
                <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Monter"
                    aria-label="Monter cette photo"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === managedPhotos.length - 1}
                    className="p-1.5 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Descendre"
                    aria-label="Descendre cette photo"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                {/* Primary Button */}
                <button
                  onClick={() => handleSetPrimary(photo.url)}
                  className={cn(
                    'p-1.5 rounded transition flex-shrink-0',
                    primaryUrl === photo.url
                      ? 'bg-accent-100 text-accent-600'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200'
                  )}
                  title={primaryUrl === photo.url ? 'Photo principale' : 'Définir comme principale'}
                  aria-label={`${primaryUrl === photo.url ? 'Photo principale' : 'Définir comme principale'}`}
                >
                  <Check size={16} weight="bold" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => deletePhoto(index)}
                  className="p-1.5 rounded text-danger-400 hover:text-danger-600 hover:bg-danger-100 transition flex-shrink-0"
                  title="Supprimer"
                  aria-label="Supprimer cette photo"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
          <p className="text-sm text-neutral-500">
            Aucune photo pour le moment. Ajoutez des photos pour améliorer l'attrait du logement.
          </p>
        </div>
      )}
    </div>
  );
}
