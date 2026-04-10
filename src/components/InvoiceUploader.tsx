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
      const file = acceptedFiles[0];
      onFileSelect(file);
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
    maxSize: 10 * 1024 * 1024, // 10MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div className="uploader-container">
      <div className="uploader-card">
        <div className="uploader-header">
          <div className="uploader-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="12" width="32" height="28" rx="4" stroke="url(#upload-gradient)" strokeWidth="2.5" />
              <path d="M24 20v12M18 26l6-6 6 6" stroke="url(#upload-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 12V8h16v4" stroke="url(#upload-gradient)" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="upload-gradient" x1="8" y1="8" x2="40" y2="40">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3 className="uploader-title">Upload Invoice</h3>
          <p className="uploader-subtitle">
            Drag & drop your invoice or use the options below
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive || isDragging ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="dropzone-icon">
              <rect x="12" y="16" width="40" height="36" rx="6" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M32 28v16M24 36l8-8 8 8" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="dropzone-text">
              {isDragActive || isDragging
                ? 'Drop your invoice here'
                : 'Drag & drop invoice here'}
            </p>
            <span className="dropzone-hint">
              Supports: JPG, PNG, WebP, BMP, TIFF (Max 10MB)
            </span>
          </div>
        </div>

        <div className="uploader-divider">
          <span>or</span>
        </div>

        <div className="uploader-actions">
          <label className="btn btn-camera">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              style={{ display: 'none' }}
            />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 7l1.5-2h5L14 7M4 9h12v7H4V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Camera
          </label>

          <label className="btn btn-browse">
            <input
              type="file"
              accept="image/*"
              onChange={handleCameraCapture}
              style={{ display: 'none' }}
            />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Browse Files
          </label>
        </div>

        {isLoading && (
          <div className="uploader-loading">
            <div className="spinner" />
            <p>Processing your invoice...</p>
          </div>
        )}
      </div>
    </div>
  );
}
