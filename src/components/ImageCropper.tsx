import { useState, useRef, useCallback, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ImageCropperProps {
  image: File | string;
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop: () => void;
  onCancel: () => void;
}

export default function ImageCropper({ image, onCropComplete, onSkipCrop, onCancel }: ImageCropperProps) {
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
    setHasAdjusted(true);
  };

  const handleTouchStart = (index: number) => () => {
    setDraggingIndex(index);
    setHasAdjusted(true);
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
            resolve(new File([blob], 'cropped-invoice.jpg', { type: 'image/jpeg' }));
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
          <h3>Crop Invoice</h3>
          <p>Drag the handles to select the area, or skip cropping to use the full image</p>
        </div>

        <div className="cropper-image-wrapper">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Invoice to crop"
            className="cropper-image"
            onLoad={handleImageLoad}
          />

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

            <svg className="crop-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1={`${corners[0].x}%`} y1={`${corners[0].y}%`} x2={`${corners[1].x}%`} y2={`${corners[1].y}%`} stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[1].x}%`} y1={`${corners[1].y}%`} x2={`${corners[2].x}%`} y2={`${corners[2].y}%`} stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[2].x}%`} y1={`${corners[2].y}%`} x2={`${corners[3].x}%`} y2={`${corners[3].y}%`} stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={`${corners[3].x}%`} y1={`${corners[3].y}%`} x2={`${corners[0].x}%`} y2={`${corners[0].y}%`} stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </div>
        </div>

        <div className="cropper-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          {hasAdjusted && (
            <button className="btn btn-skip-crop" onClick={onSkipCrop}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 10h14M10 3l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Skip Crop
            </button>
          )}
          <button className="btn btn-primary" onClick={handleConfirm}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {hasAdjusted ? 'Apply Crop' : 'Use Full Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
