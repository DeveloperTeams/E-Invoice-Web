import { useState, useRef, useCallback, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ImageYoloCropperProps {
  image: File | string;
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop: () => void;
  onCancel: () => void;
}

export default function ImageYoloCropper({ image, onCropComplete, onSkipCrop, onCancel }: ImageYoloCropperProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [corners, setCorners] = useState<Point[]>([
    { x: 5, y: 5 },
    { x: 95, y: 5 },
    { x: 95, y: 95 },
    { x: 5, y: 95 },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hasAdjusted, setHasAdjusted] = useState(false);
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

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIndex(index);
  };

  const handleTouchStart = (index: number) => () => {
    setDraggingIndex(index);
  };

  const clampCorner = (x: number, y: number) => ({
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const imageElement = imageRef.current;
    if (draggingIndex === null || !imageElement) return;
    const rect = imageElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCorners(prev => {
      const next = [...prev];
      next[draggingIndex] = clampCorner(x, y);
      return next;
    });
    setHasAdjusted(true);
  }, [draggingIndex]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const imageElement = imageRef.current;
    if (draggingIndex === null || !imageElement) return;
    const touch = e.touches[0];
    const rect = imageElement.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setCorners(prev => {
      const next = [...prev];
      next[draggingIndex] = clampCorner(x, y);
      return next;
    });
    setHasAdjusted(true);
  }, [draggingIndex]);

  const handleMouseUp = useCallback(() => setDraggingIndex(null), []);

  const percentToImagePixels = useCallback((pct: Point): Point => {
    const { width: natW, height: natH } = imageNaturalSize;
    return { x: (pct.x / 100) * natW, y: (pct.y / 100) * natH };
  }, [imageNaturalSize]);

  const getCroppedImage = useCallback(async (): Promise<File | null> => {
    const img = imageRef.current;
    if (!img || imageNaturalSize.width === 0) return null;

    const pts = corners.map(percentToImagePixels);
    const [tl, tr, br, bl] = pts;

    const minX = Math.max(0, Math.floor(Math.min(tl.x, tr.x, bl.x, br.x)));
    const minY = Math.max(0, Math.floor(Math.min(tl.y, tr.y, tl.y, bl.y)));
    const maxX = Math.min(imageNaturalSize.width, Math.ceil(Math.max(tl.x, tr.x, bl.x, br.x)));
    const maxY = Math.min(imageNaturalSize.height, Math.ceil(Math.max(tl.y, tr.y, bl.y, br.y)));

    const cropW = maxX - minX;
    const cropH = maxY - minY;

    if (cropW <= 0 || cropH <= 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cropW, cropH);
    ctx.drawImage(img, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], 'cropped-yolo-invoice.jpg', { type: 'image/jpeg' }));
          } else {
            resolve(null);
          }
        },
        'image/jpeg',
        0.95,
      );
    });
  }, [corners, imageNaturalSize, percentToImagePixels]);

  const handleConfirm = useCallback(async () => {
    if (!hasAdjusted && originalFile) {
      onCropComplete(originalFile);
      return;
    }

    const croppedFile = await getCroppedImage();
    if (croppedFile) {
      onCropComplete(croppedFile);
    }
  }, [hasAdjusted, originalFile, getCroppedImage, onCropComplete]);

  return (
    <div className="cropper-modal" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
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

            <svg className="crop-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1={`${corners[0].x}%`} y1={`${corners[0].y}%`} x2={`${corners[1].x}%`} y2={`${corners[1].y}%`} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[1].x}%`} y1={`${corners[1].y}%`} x2={`${corners[2].x}%`} y2={`${corners[2].y}%`} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[2].x}%`} y1={`${corners[2].y}%`} x2={`${corners[3].x}%`} y2={`${corners[3].y}%`} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[3].x}%`} y1={`${corners[3].y}%`} x2={`${corners[0].x}%`} y2={`${corners[0].y}%`} stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />
            </svg>

            {!hasAdjusted && (
              <div className="yolo-detection-hint">
                <div className="yolo-hint-box">
                  <span>Drag corner points to adjust manually</span>
                </div>
              </div>
            )}
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
          <button className="btn btn-primary" onClick={handleConfirm} disabled={!originalFile}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
