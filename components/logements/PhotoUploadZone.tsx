'use client';

/**
 * PhotoUploadZone Component
 * Drag-and-drop photo upload zone with preview, file validation, and upload progress
 * 
 * Features:
 * - Drag and drop files
 * - Click to select files
 * - File validation (type, size)
 * - Preview thumbnails
 * - Remove individual files
 * - Progress indication
 * - Multiple file support
 */

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Check, Warning } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface PhotoFile {
  file: File;
  preview: string;
  error?: string;
  uploading?: boolean;
}

interface PhotoUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // bytes
  allowedTypes?: string[];
  className?: string;
  onSetAsPrimary?: (index: number) => void;
  primaryIndex?: number;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function PhotoUploadZone({
  onFilesSelected,
  maxFiles = 10,
  maxSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  className,
  onSetAsPrimary,
  primaryIndex = -1,
}: PhotoUploadZoneProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | undefined => {
    if (!allowedTypes.includes(file.type)) {
      return `Type de fichier non autorisé. Acceptés: ${allowedTypes.join(', ')}`;
    }
    if (file.size > maxSize) {
      return `Fichier trop volumineux. Max: ${maxSize / 1024 / 1024}MB`;
    }
    return undefined;
  };

  // Handle files drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));

      if (photos.length + files.length > maxFiles) {
        alert(`Maximum ${maxFiles} photos autorisées`);
        return;
      }

      processFiles(files);
    },
    [photos.length, maxFiles]
  );

  // Handle file selection from input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files ? Array.from(e.currentTarget.files) : [];

    if (photos.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} photos autorisées`);
      return;
    }

    processFiles(files);
  };

  // Process and add files
  const processFiles = (files: File[]) => {
    const newPhotos = files.map((file) => {
      const error = validateFile(file);
      return {
        file,
        preview: URL.createObjectURL(file),
        error,
      };
    });

    const validFiles = newPhotos.filter((p) => !p.error);
    const updatedPhotos = [...photos, ...newPhotos];

    setPhotos(updatedPhotos);

    // Notify parent of valid files only
    if (validFiles.length > 0) {
      onFilesSelected(validFiles.map((p) => p.file));
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Notify parent of remaining valid files
      onFilesSelected(updated.filter((p) => !p.error).map((p) => p.file));
      return updated;
    });
  };

  // Set as primary
  const handleSetAsPrimary = (index: number) => {
    onSetAsPrimary?.(index);
  };

  return (
    <div className={className}>
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          aria-label="Sélectionner des photos"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary-100 p-3 text-primary-600">
            <Upload size={24} weight="bold" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900">
              Glissez vos photos ici ou cliquez pour en sélectionner
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              Max {maxFiles} photos • {maxSize / 1024 / 1024}MB par fichier
            </p>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-neutral-900 mb-3">
            Photos sélectionnées ({photos.length}/{maxFiles})
          </p>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-lg overflow-hidden bg-neutral-100"
              >
                {/* Error State */}
                {photo.error ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-danger-50 p-2">
                    <Warning size={24} className="text-danger-600" />
                    <p className="text-xs text-danger-600 font-medium text-center line-clamp-2">
                      {photo.error}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Image */}
                    <Image
                      src={photo.preview}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="150px"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removePhoto(index);
                        }}
                        className="p-2 rounded-full bg-danger-600 text-white hover:bg-danger-700 transition-colors"
                        title="Supprimer"
                        aria-label={`Supprimer la photo ${index + 1}`}
                      >
                        <X size={18} weight="bold" />
                      </button>

                      {/* Set as Primary Button */}
                      {!photo.error && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSetAsPrimary(index);
                          }}
                          className={cn(
                            'p-2 rounded-full transition-colors',
                            primaryIndex === index
                              ? 'bg-accent-600 text-white'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          )}
                          title={primaryIndex === index ? 'Photo principale' : 'Définir comme principale'}
                          aria-label={`Photo ${primaryIndex === index ? 'principale' : 'principale'}`}
                        >
                          <Check size={18} weight="bold" />
                        </button>
                      )}
                    </div>

                    {/* Primary Badge */}
                    {primaryIndex === index && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-accent-600 text-white text-xs font-semibold">
                        Principale
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Error Summary */}
          {photos.some((p) => p.error) && (
            <div className="mt-3 p-3 rounded-lg bg-danger-50 border border-danger-200">
              <p className="text-sm text-danger-700 font-medium">
                {photos.filter((p) => p.error).length} photo(s) rejetée(s). Vérifiez les fichiers marqués en rouge.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
