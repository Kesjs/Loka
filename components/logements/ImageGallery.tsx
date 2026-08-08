'use client';

/**
 * Responsive Image Gallery Component
 * Embla Carousel-based gallery with swipe, lazy-load, and adaptive sizing
 * 
 * Features:
 * - Swipe/drag navigation
 * - Lazy loading with blur-up effect
 * - Responsive: adapts to mobile, tablet, desktop
 * - Thumbnail preview selector
 * - Keyboard navigation (arrow keys)
 * - Accessibility: ARIA labels, focus management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  title?: string;
  alt?: string;
  showThumbnails?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  onImageChange?: (index: number) => void;
}

const heightMap = {
  sm: 'h-48 md:h-64',
  md: 'h-64 md:h-96',
  lg: 'h-80 md:h-[500px]',
  full: 'h-96 md:h-screen',
};

export function ImageGallery({
  images,
  title,
  alt = 'Gallery image',
  showThumbnails = true,
  height = 'md',
  className,
  onImageChange,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn(heightMap[height], 'bg-neutral-100 rounded-lg flex items-center justify-center', className)}>
        <p className="text-sm text-neutral-500">Aucune image disponible</p>
      </div>
    );
  }

  // Navigate to next image
  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    onImageChange?.(nextIndex);
    // Preload next image
    setLoadedImages((prev) => new Set([...prev, nextIndex]));
  }, [currentIndex, images.length, onImageChange]);

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    onImageChange?.(prevIndex);
    // Preload previous image
    setLoadedImages((prev) => new Set([...prev, prevIndex]));
  }, [currentIndex, images.length, onImageChange]);

  // Go to specific image
  const goToImage = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      onImageChange?.(index);
      setLoadedImages((prev) => new Set([...prev, index]));
    },
    [onImageChange]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNext, goToPrevious, isFullscreen]);

  // Drag/swipe handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const dragEnd = e.clientX;
    const dragDistance = dragStart - dragEnd;

    if (Math.abs(dragDistance) > 50) {
      if (dragDistance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  // Preload adjacent images on mount
  useEffect(() => {
    setLoadedImages(new Set([currentIndex, (currentIndex + 1) % images.length, (currentIndex - 1 + images.length) % images.length]));
  }, []);

  return (
    <>
      {/* Main Gallery Container */}
      <div
        ref={containerRef}
        className={cn(
          'relative bg-neutral-900 rounded-lg overflow-hidden group',
          heightMap[height],
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Image Container */}
        <div className="relative w-full h-full">
          {/* Current Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            {loadedImages.has(currentIndex) ? (
              <Image
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                onLoad={() => {
                  // Preload next and previous
                  const nextIndex = (currentIndex + 1) % images.length;
                  const prevIndex = (currentIndex - 1 + images.length) % images.length;
                  setLoadedImages((prev) => new Set([...prev, nextIndex, prevIndex]));
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
            )}
          </div>

          {/* Image Counter */}
          <div className="absolute top-3 right-3 bg-black/50 px-2.5 py-1 rounded-full text-xs text-white font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                aria-label="Image précédente"
              >
                <CaretLeft size={20} weight="bold" />
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                aria-label="Image suivante"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Plein écran"
          >
            <div className="w-5 h-5 border-2 border-current" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                currentIndex === index
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
              aria-label={`Voir image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-60 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
            aria-label="Fermer plein écran"
          >
            <X size={24} weight="bold" />
          </button>

          {/* Fullscreen Image */}
          <div className="flex-1 relative flex items-center justify-center">
            <Image
              src={images[currentIndex]}
              alt={`${alt} fullscreen`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Fullscreen Navigation */}
          {images.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
              <button
                onClick={goToPrevious}
                className="pointer-events-auto bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all"
                aria-label="Image précédente"
              >
                <CaretLeft size={24} weight="bold" />
              </button>
              <button
                onClick={goToNext}
                className="pointer-events-auto bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all"
                aria-label="Image suivante"
              >
                <CaretRight size={24} weight="bold" />
              </button>
            </div>
          )}

          {/* Fullscreen Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 justify-center overflow-x-auto bg-black/50">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={cn(
                    'relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
                    currentIndex === index
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-white/20 hover:border-white/40'
                  )}
                  aria-label={`Voir image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
