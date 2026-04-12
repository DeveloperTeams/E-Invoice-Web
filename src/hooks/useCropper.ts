import { useState, useRef, useCallback, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface UseCropperOptions {
  image: File | string;
  onCropComplete: (croppedFile: File) => void;
}

export interface UseCropperReturn {
  imageUrl: string;
  originalFile: File | null;
  corners: Point[];
  draggingIndex: number | null;
  hasAdjusted: boolean;
  imageNaturalSize: { width: number; height: number };
  imageRef: React.RefObject<HTMLImageElement | null>;
  handleImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  handleMouseDown: (index: number) => (e: React.MouseEvent) => void;
  handleTouchStart: (index: number) => () => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleMouseUp: () => void;
  handleConfirm: () => Promise<void>;
}

const DEFAULT_CORNERS: Point[] = [
  { x: 5, y: 5 },
  { x: 95, y: 5 },
  { x: 95, y: 95 },
  { x: 5, y: 95 },
];

function clampCorner(x: number, y: number): Point {
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}

export function useCropper({ image, onCropComplete }: UseCropperOptions): UseCropperReturn {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [corners, setCorners] = useState<Point[]>(DEFAULT_CORNERS);
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

  const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIndex(index);
    setHasAdjusted(true);
  }, []);

  const handleTouchStart = useCallback((index: number) => () => {
    setDraggingIndex(index);
    setHasAdjusted(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const imageElement = imageRef.current;
    if (draggingIndex === null || !imageElement) return;
    const rect = imageElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCorners((prev) => {
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

    setCorners((prev) => {
      const next = [...prev];
      next[draggingIndex] = clampCorner(x, y);
      return next;
    });
    setHasAdjusted(true);
  }, [draggingIndex]);

  const handleMouseUp = useCallback(() => setDraggingIndex(null), []);

  const percentToImagePixels = useCallback(
    (pct: Point): Point => {
      const { width: natW, height: natH } = imageNaturalSize;
      return { x: (pct.x / 100) * natW, y: (pct.y / 100) * natH };
    },
    [imageNaturalSize],
  );

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

  return {
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
  };
}
