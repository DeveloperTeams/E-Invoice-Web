import { useState, useRef, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ImageCropperProps {
  image: File | string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [corners, setCorners] = useState<Point[]>([
    { x: 20, y: 20 },
    { x: 80, y: 20 },
    { x: 80, y: 80 },
    { x: 20, y: 80 },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const loadImage = useCallback(() => {
    if (image instanceof File) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageUrl(image);
      return () => {};
    }
  }, [image]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    setImageDimensions({ width: naturalWidth, height: naturalHeight });

    // Auto-detect corners (simple heuristic: 10% margin)
    const margin = 10;
    setCorners([
      { x: margin, y: margin },
      { x: 100 - margin, y: margin },
      { x: 100 - margin, y: 100 - margin },
      { x: margin, y: 100 - margin },
    ]);
  }, []);

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIndex(index);
  };

  const handleTouchStart = (index: number) => () => {
    setDraggingIndex(index);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingIndex === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCorners(prev => {
      const newCorners = [...prev];
      newCorners[draggingIndex] = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
      return newCorners;
    });
  }, [draggingIndex]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (draggingIndex === null || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setCorners(prev => {
      const newCorners = [...prev];
      newCorners[draggingIndex] = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
      return newCorners;
    });
  }, [draggingIndex]);

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const [tl, tr, br, bl] = corners;

    // Calculate actual pixel coordinates
    const pts = [tl, tr, br, bl].map(p => ({
      x: (p.x / 100) * imageDimensions.width,
      y: (p.y / 100) * imageDimensions.height,
    }));

    // Calculate output dimensions
    const width = Math.max(
      Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y),
      Math.hypot(pts[2].x - pts[3].x, pts[2].y - pts[3].y)
    );
    const height = Math.max(
      Math.hypot(pts[3].x - pts[0].x, pts[3].y - pts[0].y),
      Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y)
    );

    canvas.width = width;
    canvas.height = height;

    // Use simple approach: draw with transform
    ctx.save();
    
    // Calculate the bounding box
    const minX = Math.min(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    
    ctx.translate(-minX, -minY);
    
    // Draw the cropped region
    ctx.beginPath();
    ctx.moveTo(pts[0].x - minX, pts[0].y - minY);
    ctx.lineTo(pts[1].x - minX, pts[1].y - minY);
    ctx.lineTo(pts[2].x - minX, pts[2].y - minY);
    ctx.lineTo(pts[3].x - minX, pts[3].y - minY);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-invoice.jpg', { type: 'image/jpeg' });
          resolve(file);
        }
      }, 'image/jpeg', 0.95);
    });
  }, [corners, imageDimensions]);

  const handleConfirm = useCallback(async () => {
    const croppedFile = await getCroppedImage();
    if (croppedFile) {
      onCropComplete(croppedFile);
    }
  }, [getCroppedImage, onCropComplete]);

  // Setup event listeners
  useState(() => {
    loadImage();
  });

  return (
    <div className="cropper-modal" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
      <div className="cropper-container">
        <div className="cropper-header">
          <h3>Crop Invoice</h3>
          <p>Drag the corner handles to adjust the crop area</p>
        </div>

        <div className="cropper-image-wrapper" ref={containerRef}>
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Invoice to crop"
            className="cropper-image"
            onLoad={handleImageLoad}
          />
          
          {/* Crop overlay */}
          <div className="crop-overlay">
            {/* Crop region */}
            <div
              className="crop-region"
              style={{
                left: `${corners[0].x}%`,
                top: `${corners[0].y}%`,
                width: `${corners[1].x - corners[0].x}%`,
                height: `${corners[2].y - corners[0].y}%`,
              }}
            />

            {/* Corner handles */}
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

            {/* Edge lines */}
            <svg className="crop-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line
                x1={`${corners[0].x}%`}
                y1={`${corners[0].y}%`}
                x2={`${corners[1].x}%`}
                y2={`${corners[1].y}%`}
                stroke="#6366F1"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1={`${corners[1].x}%`}
                y1={`${corners[1].y}%`}
                x2={`${corners[2].x}%`}
                y2={`${corners[2].y}%`}
                stroke="#6366F1"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1={`${corners[2].x}%`}
                y1={`${corners[2].y}%`}
                x2={`${corners[3].x}%`}
                y2={`${corners[3].y}%`}
                stroke="#6366F1"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1={`${corners[3].x}%`}
                y1={`${corners[3].y}%`}
                x2={`${corners[0].x}%`}
                y2={`${corners[0].y}%`}
                stroke="#6366F1"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
        </div>

        <div className="cropper-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Confirm Crop
          </button>
        </div>
      </div>
    </div>
  );
}
