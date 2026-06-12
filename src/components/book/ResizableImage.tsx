import React, { useRef, useState, useEffect } from 'react';
import type { PlacedImage } from '../../context/JournalContext';
import { Move, Trash2, Maximize2 } from 'lucide-react';

interface ResizableImageProps {
  image: PlacedImage;
  onUpdate: (updates: Partial<PlacedImage>) => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}

export const ResizableImage: React.FC<ResizableImageProps> = ({
  image,
  onUpdate,
  onDelete,
  isReadOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // Drag start offsets
  const dragStart = useRef({ x: 0, y: 0, imgX: 0, imgY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, imgW: 0, imgH: 0 });

  // Handle Drag Start
  const handleDragStart = (e: React.MouseEvent) => {
    if (isReadOnly || isResizing) return;
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    
    // Get parent bounds to compute percentage position later
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    // Current position in pixels from percentage
    const parentRect = parent.getBoundingClientRect();
    const currentX = (image.x / 100) * parentRect.width;
    const currentY = (image.y / 100) * parentRect.height;

    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      imgX: currentX,
      imgY: currentY
    };

    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragging = (e: MouseEvent) => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const newPixelX = dragStart.current.imgX + dx;
    const newPixelY = dragStart.current.imgY + dy;

    // Convert back to percentage
    let newXPercent = (newPixelX / parentRect.width) * 100;
    let newYPercent = (newPixelY / parentRect.height) * 100;

    // Bounds checking
    newXPercent = Math.max(0, Math.min(100 - image.w, newXPercent));
    newYPercent = Math.max(0, Math.min(100 - image.h, newYPercent));

    onUpdate({
      x: newXPercent,
      y: newYPercent
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  // Handle Resize Start (Bottom-Right Corner)
  const handleResizeStart = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);

    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    // Convert current percentage width/height to pixels
    const currentW = (image.w / 100) * parentRect.width;
    const currentH = (image.h / 100) * parentRect.height;

    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      imgW: currentW,
      imgH: currentH
    };

    document.addEventListener('mousemove', handleResizing);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizing = (e: MouseEvent) => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;

    const newPixelW = resizeStart.current.imgW + dx;
    const newPixelH = resizeStart.current.imgH + dy;

    // Convert to percentage
    let newWPercent = (newPixelW / parentRect.width) * 100;
    let newHPercent = (newPixelH / parentRect.height) * 100;

    // Minimum size (10%) and maximum size constraint
    newWPercent = Math.max(10, Math.min(100 - image.x, newWPercent));
    newHPercent = Math.max(10, Math.min(100 - image.y, newHPercent));

    onUpdate({
      w: newWPercent,
      h: newHPercent
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizing);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragging);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('mousemove', handleResizing);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        left: `${image.x}%`,
        top: `${image.y}%`,
        width: `${image.w}%`,
        height: `${image.h}%`,
        position: 'absolute'
      }}
      className={`group/img border border-transparent hover:border-gold-500/50 rounded overflow-visible z-18 select-none transition-shadow ${
        isDragging ? 'shadow-lg border-gold-500/70 z-20 cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleDragStart}
    >
      {/* Image Render */}
      <img
        src={image.src}
        alt="User Journal Insert"
        className="w-full h-full object-cover rounded pointer-events-none"
      />

      {/* Editing Overlays (visible on hover) */}
      {!isReadOnly && (
        <>
          {/* Top Actions Bar */}
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity z-20">
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded bg-black/70 hover:bg-red-900 border border-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Delete Image"
            >
              <Trash2 size={11} />
            </button>
          </div>

          {/* Move icon indicator on top left */}
          <div className="absolute top-1 left-1 p-0.5 rounded bg-black/60 border border-white/5 text-gold-400 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
            <Move size={10} />
          </div>

          {/* Bottom-Right Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-[-4px] right-[-4px] w-4 h-4 bg-gold-500 hover:bg-gold-400 border border-neutral-900 rounded-full flex items-center justify-center cursor-se-resize z-20 opacity-0 group-hover/img:opacity-100 hover:scale-110 active:scale-95 transition-all shadow"
            title="Drag to resize"
          >
            <Maximize2 size={8} className="text-neutral-950 font-bold rotate-90" />
          </div>
        </>
      )}
    </div>
  );
};
