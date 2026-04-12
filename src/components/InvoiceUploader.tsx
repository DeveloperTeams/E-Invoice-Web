import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface InvoiceUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function InvoiceUploader({ onFileSelect, isLoading }: InvoiceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const handleCameraCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tif', '.tiff'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const isActive = isDragActive || isDragging;

  return (
    <div className="w-full">
      <div className="digital-panel rounded-2xl p-6 shadow-lg sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-300/10">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="12" width="32" height="28" rx="4" stroke="url(#upload-gradient)" strokeWidth="2.5" />
              <path d="M24 20v12M18 26l6-6 6 6" stroke="url(#upload-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 12V8h16v4" stroke="url(#upload-gradient)" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="upload-gradient" x1="8" y1="8" x2="40" y2="40">
                  <stop stopColor="#22D3EE" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text">Upload Invoice</h3>
          <p className="mt-1 text-sm text-text-muted">
            Drag & drop your invoice or use the options below
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`group cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-10 ${
            isActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-border bg-surface-alt hover:border-primary-300 hover:bg-primary-500/10'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <svg
              width="48"
              height="48"
              viewBox="0 0 64 64"
              fill="none"
              className={`transition-colors duration-200 ${isActive ? 'text-primary-500' : 'text-border-dark'}`}
            >
              <rect x="12" y="16" width="40" height="36" rx="6" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M32 28v16M24 36l8-8 8 8" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-base font-semibold text-text">
              {isActive ? 'Drop your invoice here' : 'Drag & drop invoice here'}
            </p>
            <span className="text-xs text-text-muted">
              Supports: JPG, PNG, WebP, BMP, TIFF (Max 10MB)
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4 text-sm text-text-muted">
          <div className="h-px flex-1 bg-border" />
          <span>or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-primary-500 bg-primary-500/10 px-4 py-3 text-sm font-semibold text-primary-300 transition-all hover:bg-primary-500 hover:text-slate-950">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M6 7l1.5-2h5L14 7M4 9h12v7H4V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Camera
          </label>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-border bg-surface-alt px-4 py-3 text-sm font-semibold text-text transition-all hover:border-primary-400">
            <input
              type="file"
              accept="image/*"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Browse Files
          </label>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 text-center">
            <div className="mx-auto h-10 w-10 animate-spin-slow rounded-full border-4 border-border border-t-primary-500" />
            <p className="mt-3 text-sm text-text-muted">Processing your invoice...</p>
          </div>
        )}
      </div>
    </div>
  );
}
