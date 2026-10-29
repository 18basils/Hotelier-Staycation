import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function ImageLightbox({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onNavigate,
  hotelName = 'Property Gallery'
}) {
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + images.length) % images.length);
    if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % images.length);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 z-10 text-white bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-sm sm:text-base font-semibold">{hotelName}</h4>
            <p className="text-xs text-slate-400">
              Photo {currentIndex + 1} of {images.length}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
          aria-label="Close Lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Display */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
        {images.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-4 sm:left-8 z-10 p-3 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition focus:outline-none shadow-xl"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={currentImage}
          alt={`${hotelName} - Photo ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
        />

        {images.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            className="absolute right-4 sm:right-8 z-10 p-3 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition focus:outline-none shadow-xl"
            aria-label="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="px-6 py-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-2 overflow-x-auto max-w-4xl mx-auto w-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(idx)}
              className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                idx === currentIndex
                  ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/20'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
