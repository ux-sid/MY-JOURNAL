import React, { useRef, useEffect, useState } from 'react';
import type { PageData } from '../../context/JournalContext';

interface DrawingLayerProps {
  page: PageData;
  onUpdate: (updates: Partial<PageData>) => void;
  tool: 'pencil' | 'pen' | 'highlighter' | 'none';
  color: string; // Hex color for drawing
  undoTrigger: number; // Increment to trigger undo
  redoTrigger: number; // Increment to trigger redo
  clearTrigger: number; // Increment to trigger clear
  isReadOnly?: boolean;
}

export const DrawingLayer: React.FC<DrawingLayerProps> = ({
  page,
  onUpdate,
  tool,
  color,
  undoTrigger,
  redoTrigger,
  clearTrigger,
  isReadOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Undo/Redo stack for current canvas session
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Ref to track last draw properties
  const lastPoint = useRef<{ x: number; y: number; time: number; width: number } | null>(null);

  // Set internal canvas size to match A4 aspect ratio at high resolution
  const INTERNAL_WIDTH = 1200;
  const INTERNAL_HEIGHT = 1700;

  // --- Initial loading & redrawing when page changes ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // Load saved drawings if they exist
    if (page.drawings && page.drawings.length > 0 && page.drawings[0]) {
      const img = new Image();
      img.src = page.drawings[0];
      img.onload = () => {
        ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        ctx.drawImage(img, 0, 0);
      };
      
      // Initialize history stack with saved drawing
      setHistory([page.drawings[0]]);
      setHistoryIndex(0);
    } else {
      // Initialize with blank history
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [page.id]); // Reload on page switch

  // --- Undo/Redo Trigger listeners ---
  useEffect(() => {
    if (undoTrigger > 0) handleUndo();
  }, [undoTrigger]);

  useEffect(() => {
    if (redoTrigger > 0) handleRedo();
  }, [redoTrigger]);

  useEffect(() => {
    if (clearTrigger > 0) handleClear();
  }, [clearTrigger]);

  // --- Save Canvas State to History and Context ---
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();

    // Truncate forward history if we were in the middle of undo stack
    const newHistory = history.slice(0, historyIndex + 1);
    const updatedHistory = [...newHistory, dataUrl];
    
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    
    // Save to global context
    onUpdate({ drawings: [dataUrl] });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      loadHistoryState(prevIndex);
    } else if (historyIndex === 0) {
      // Clear canvas on last undo
      setHistoryIndex(-1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        onUpdate({ drawings: [] });
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      loadHistoryState(nextIndex);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
    saveState();
  };

  const loadHistoryState = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
    const stateUrl = history[idx];
    if (stateUrl) {
      const img = new Image();
      img.src = stateUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        ctx.drawImage(img, 0, 0);
        onUpdate({ drawings: [stateUrl] });
      };
    } else {
      onUpdate({ drawings: [] });
    }
  };

  // --- Drawing event handlers ---
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate relative coordinates (0 to bounding width/height)
    const xRel = clientX - rect.left;
    const yRel = clientY - rect.top;
    
    // Scale up to high-resolution internal coordinates
    const x = xRel * (INTERNAL_WIDTH / rect.width);
    const y = yRel * (INTERNAL_HEIGHT / rect.height);
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly || tool === 'none') return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    
    lastPoint.current = {
      x: coords.x,
      y: coords.y,
      time: Date.now(),
      width: tool === 'pen' ? 4 : tool === 'highlighter' ? 24 : 2.5
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint.current || tool === 'none') return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const now = Date.now();
    const dt = now - lastPoint.current.time;
    const dx = coords.x - lastPoint.current.x;
    const dy = coords.y - lastPoint.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = 0.8;
      ctx.globalCompositeOperation = 'source-over';
      
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      
      lastPoint.current = { x: coords.x, y: coords.y, time: now, width: 2.2 };
    } 
    else if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      
      // Calculate velocity (pixels/ms)
      const velocity = dt > 0 ? dist / dt : 0;
      
      // Variable width: faster = thinner, slower = thicker
      const targetWidth = Math.max(1.8, Math.min(8.0, 12.0 / (1.0 + 0.45 * velocity)));
      
      // Smooth out the width transitions
      const smoothedWidth = lastPoint.current.width + (targetWidth - lastPoint.current.width) * 0.25;
      ctx.lineWidth = smoothedWidth;
      
      // Draw curve
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      
      lastPoint.current = { x: coords.x, y: coords.y, time: now, width: smoothedWidth };
    } 
    else if (tool === 'highlighter') {
      // Highlighter properties
      ctx.strokeStyle = color === '#000000' || color === '#ffffff' ? '#ebd99d' : color; // default to gold if white/black
      ctx.lineWidth = 32;
      ctx.globalAlpha = 0.32;
      // 'multiply' works beautifully to overlay color transparently over typed text
      ctx.globalCompositeOperation = 'source-over';
      
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      
      lastPoint.current = { x: coords.x, y: coords.y, time: now, width: 32 };
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPoint.current = null;
      saveState();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={INTERNAL_WIDTH}
      height={INTERNAL_HEIGHT}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className={`absolute inset-0 w-full h-full z-15 ${
        tool !== 'none' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        mixBlendMode: tool === 'highlighter' ? 'multiply' : 'normal',
      }}
    />
  );
};
