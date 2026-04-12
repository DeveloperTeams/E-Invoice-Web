import type { MouseEvent, TouchEvent } from 'react';
import { useCropper } from '../hooks/useCropper';

interface ImageCropperProps {
  image: File | string;
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop: () => void;
  onCancel: () => void;
}

export default function ImageCropper({ image, onCropComplete, onSkipCrop, onCancel }: ImageCropperProps) {
  const {
    imageUrl,
    corners,
    draggingIndex,
    hasAdjusted,
    imageRef,
    handleImageLoad,
    handleMouseDown,
    handleTouchStart,
    handleMouseMove,
    handleTouchMove,
    handleMouseUp,
    handleConfirm,
  } = useCropper({ image, onCropComplete });

  const overlayHandlers = {
    onMouseMove: (e: MouseEvent) => handleMouseMove(e),
    onMouseUp: () => handleMouseUp(),
    onTouchMove: (e: TouchEvent) => handleTouchMove(e),
    onTouchEnd: () => handleMouseUp(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" {...overlayHandlers}>
      <div className="digital-panel flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="border-b border-border px-6 py-5 text-center">
          <h3 className="text-xl font-bold text-text">Crop Invoice</h3>
          <p className="mt-1 text-sm text-text-muted">
            Drag the handles to select the area, or skip cropping to use the full image
          </p>
        </div>

        {/* Image Area */}
        <div className="relative flex min-h-[400px] flex-1 items-start justify-start overflow-auto bg-black">
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Invoice to crop"
              className="h-auto w-auto"
              onLoad={handleImageLoad}
            />
          )}

          {/* Crop Overlay */}
          <div className="crop-overlay">
            <div
              className="crop-region"
              style={{
                left: `${corners[0].x}%`,
                top: `${corners[0].y}%`,
                width: `${corners[1].x - corners[0].x}%`,
                height: `${corners[2].y - corners[0].y}%`,
              }}
            />

            {corners.map((corner, index) => (
              <div
                key={index}
                className={`crop-handle ${draggingIndex === index ? 'dragging' : ''}`}
                style={{
                  left: `${corner.x}%`,
                  top: `${corner.y}%`,
                }}
                onMouseDown={handleMouseDown(index)}
                onTouchStart={handleTouchStart(index)}
              >
                <div className="crop-handle-inner" />
              </div>
            ))}

            <svg
              className="pointer-events-none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <line x1={`${corners[0].x}%`} y1={`${corners[0].y}%`} x2={`${corners[1].x}%`} y2={`${corners[1].y}%`} stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[1].x}%`} y1={`${corners[1].y}%`} x2={`${corners[2].x}%`} y2={`${corners[2].y}%`} stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[2].x}%`} y1={`${corners[2].y}%`} x2={`${corners[3].x}%`} y2={`${corners[3].y}%`} stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[3].x}%`} y1={`${corners[3].y}%`} x2={`${corners[0].x}%`} y2={`${corners[0].y}%`} stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 border-t border-border px-6 py-5">
          <button
            onClick={onCancel}
            className="rounded-lg border-2 border-border bg-surface-alt px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary-400"
          >
            Cancel
          </button>
          {hasAdjusted && (
            <button
              onClick={onSkipCrop}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-amber-500 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-300 transition-all hover:bg-amber-500 hover:text-slate-950"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M3 10h14M10 3l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Skip Crop
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:shadow-md hover:-translate-y-px"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {hasAdjusted ? 'Apply Crop' : 'Use Full Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
