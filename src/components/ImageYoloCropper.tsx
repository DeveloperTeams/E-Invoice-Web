import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageYoloCropperProps {
  image: File | string;
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop: () => void;
  onCancel: () => void;
}

export default function ImageYoloCropper({ image, onCropComplete, onSkipCrop, onCancel }: ImageYoloCropperProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (image instanceof File) {
      setOriginalFile(image);
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setOriginalFile(null);
    setImageUrl(image);
    return () => {};
  }, [image]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  }, []);

  return (
    <div className="cropper-modal">
      <div className="cropper-container">
        <div className="cropper-header">
          <div className="yolo-crop-badge">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3" fill="#F59E0B" />
            </svg>
            <span>YOLO Auto-Detection</span>
          </div>
          <h3>Review Invoice</h3>
          <p>YOLO will auto-detect the invoice region. You can crop manually or skip to let YOLO handle it.</p>
        </div>

        <div className="cropper-image-wrapper yolo-preview">
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Invoice to process"
              className="cropper-image"
              onLoad={handleImageLoad}
            />
          )}

          {/* YOLO overlay hint */}
          <div className="yolo-detection-hint">
            <div className="yolo-hint-box">
              <span>YOLO will detect this region</span>
            </div>
          </div>
        </div>

        <div className="cropper-info-bar">
          {imageNaturalSize.width > 0 && (
            <span className="image-size-info">
              Image: {imageNaturalSize.width} × {imageNaturalSize.height}px
            </span>
          )}
          {originalFile && (
            <span className="file-size-info">
              File: {(originalFile.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>

        <div className="cropper-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-skip-crop" onClick={onSkipCrop}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10h14M10 3l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Skip Crop — Let YOLO Detect
          </button>
          <button
            className="btn btn-primary"
            onClick={() => originalFile && onCropComplete(originalFile)}
            disabled={!originalFile}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Send to YOLO
          </button>
        </div>
      </div>
    </div>
  );
}
