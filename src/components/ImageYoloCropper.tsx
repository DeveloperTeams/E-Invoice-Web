import type { MouseEvent, TouchEvent } from 'react';
import { useCropper } from '../hooks/useCropper';

interface ImageYoloCropperProps {
  image: File | string;
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop: () => void;
  onCancel: () => void;
}

export default function ImageYoloCropper({ image, onCropComplete, onSkipCrop, onCancel }: ImageYoloCropperProps) {
  const {
    imageUrl,
    originalFile,
    corners,
    draggingIndex,
    hasAdjusted,
    imageNaturalSize,
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
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3" fill="#F59E0B" />
            </svg>
            YOLO Auto-Detection
          </div>
          <h3 className="text-xl font-bold text-text">Review Invoice</h3>
          <p className="mt-1 text-sm text-text-muted">
            YOLO will auto-detect the invoice region. You can crop manually or skip to let YOLO handle it.
          </p>
        </div>

        {/* Image Area */}
        <div className="relative flex min-h-[400px] flex-1 items-start justify-start overflow-auto bg-black">
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Invoice to process"
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
                borderColor: '#F59E0B',
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
                <div className="crop-handle-inner" style={{ background: '#F59E0B' }} />
              </div>
            ))}

            <svg
              className="pointer-events-none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <line x1={`${corners[0].x}%`} y1={`${corners[0].y}%`} x2={`${corners[1].x}%`} y2={`${corners[1].y}%`} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[1].x}%`} y1={`${corners[1].y}%`} x2={`${corners[2].x}%`} y2={`${corners[2].y}%`} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[2].x}%`} y1={`${corners[2].y}%`} x2={`${corners[3].x}%`} y2={`${corners[3].y}%`} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[3].x}%`} y1={`${corners[3].y}%`} x2={`${corners[0].x}%`} y2={`${corners[0].y}%`} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
            </svg>

            {/* Hint overlay when no adjustments made */}
            {!hasAdjusted && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg border-2 border-dashed border-amber-500 bg-amber-500/15 px-5 py-3 text-sm font-semibold text-amber-500">
                  Drag corner points to adjust manually
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Bar */}
        <div className="flex items-center justify-center gap-6 border-t border-border bg-surface-alt px-6 py-3">
          {imageNaturalSize.width > 0 && (
            <span className="text-sm font-medium text-text-muted">
              Image: {imageNaturalSize.width} &times; {imageNaturalSize.height}px
            </span>
          )}
          {originalFile && (
            <span className="text-sm font-medium text-text-muted">
              File: {(originalFile.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 border-t border-border px-6 py-5">
          <button
            onClick={onCancel}
            className="rounded-lg border-2 border-border bg-surface-alt px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary-400"
          >
            Cancel
          </button>
          <button
            onClick={onSkipCrop}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-amber-500 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-300 transition-all hover:bg-amber-500 hover:text-slate-950"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 10h14M10 3l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Skip Crop &mdash; Let YOLO Detect
          </button>
          <button
            onClick={handleConfirm}
            disabled={!originalFile}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:shadow-md hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {hasAdjusted ? 'Apply Crop & Send to YOLO' : 'Use Full Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
