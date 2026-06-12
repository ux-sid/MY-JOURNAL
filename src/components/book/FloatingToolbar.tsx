import React, { useRef } from 'react';
import { 
  MousePointer, 
  Pencil, 
  PenTool, 
  Highlighter, 
  Undo2, 
  Redo2, 
  Image as ImageIcon, 
  Eraser 
} from 'lucide-react';
import { Tooltip } from '../ui/CustomComponents';

interface FloatingToolbarProps {
  tool: 'pencil' | 'pen' | 'highlighter' | 'none';
  setTool: (tool: 'pencil' | 'pen' | 'highlighter' | 'none') => void;
  color: string;
  setColor: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onInsertImage: (src: string) => void;
  isReadOnly?: boolean;
}

const DRAW_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Muted Gray', hex: '#a3a3a3' },
  { name: 'Warm Gold', hex: '#ebd99d' },
  { name: 'Sunlight Yellow', hex: '#eab308' },
  { name: 'Mint Green', hex: '#4ade80' },
  { name: 'Aqua Blue', hex: '#38bdf8' },
  { name: 'Soft Rose', hex: '#f472b6' }
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  onUndo,
  onRedo,
  onClear,
  onInsertImage,
  isReadOnly = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image file uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onInsertImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input value so same file can be uploaded again
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isReadOnly) return null;

  return (
    <div className="flex items-center gap-4 bg-oled-800/90 backdrop-blur-md px-4 py-2 rounded-full border border-oled-600 shadow-2xl relative">
      
      {/* Hidden File Input for Image Insertion */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Mode / Selectors */}
      <div className="flex items-center gap-1 border-r border-oled-700 pr-3">
        {/* Pointer Mode (Text editing & Checklist mode) */}
        <Tooltip content="Edit Text & Agenda (Pointer)">
          <button
            onClick={() => setTool('none')}
            className={`p-2 rounded-full transition-all hover:bg-oled-700 ${
              tool === 'none' ? 'bg-gold-950/20 text-gold-300 border border-gold-950/45' : 'text-neutral-400'
            }`}
          >
            <MousePointer size={16} />
          </button>
        </Tooltip>

        {/* Pencil Tool */}
        <Tooltip content="Pencil (Thin Sketch)">
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded-full transition-all hover:bg-oled-700 ${
              tool === 'pencil' ? 'bg-gold-950/20 text-gold-300 border border-gold-950/45' : 'text-neutral-400'
            }`}
          >
            <Pencil size={16} />
          </button>
        </Tooltip>

        {/* Fountain Pen Tool */}
        <Tooltip content="Fountain Pen (Calligraphy)">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-full transition-all hover:bg-oled-700 ${
              tool === 'pen' ? 'bg-gold-950/20 text-gold-300 border border-gold-950/45' : 'text-neutral-400'
            }`}
          >
            <PenTool size={16} />
          </button>
        </Tooltip>

        {/* Highlighter Tool */}
        <Tooltip content="Highlighter (Markup)">
          <button
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-full transition-all hover:bg-oled-700 ${
              tool === 'highlighter' ? 'bg-gold-950/20 text-gold-300 border border-gold-950/45' : 'text-neutral-400'
            }`}
          >
            <Highlighter size={16} />
          </button>
        </Tooltip>
      </div>

      {/* Drawing Colors (hidden if tool is pointer) */}
      {tool !== 'none' && (
        <div className="flex items-center gap-1.5 border-r border-oled-700 pr-3 transition-all">
          {DRAW_COLORS.map((col) => (
            <button
              key={col.hex}
              onClick={() => setColor(col.hex)}
              className={`w-4 h-4 rounded-full border border-neutral-900 transition-all hover:scale-110 active:scale-95 relative ${
                color === col.hex ? 'ring-1 ring-gold-400 scale-105' : ''
              }`}
              style={{ backgroundColor: col.hex }}
              title={col.name}
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Undo */}
        <Tooltip content="Undo Drawing">
          <button
            onClick={onUndo}
            disabled={tool === 'none'}
            className="p-2 rounded-full hover:bg-oled-700 text-neutral-400 hover:text-neutral-200 disabled:opacity-20 disabled:pointer-events-none transition-all"
          >
            <Undo2 size={16} />
          </button>
        </Tooltip>

        {/* Redo */}
        <Tooltip content="Redo Drawing">
          <button
            onClick={onRedo}
            disabled={tool === 'none'}
            className="p-2 rounded-full hover:bg-oled-700 text-neutral-400 hover:text-neutral-200 disabled:opacity-20 disabled:pointer-events-none transition-all"
          >
            <Redo2 size={16} />
          </button>
        </Tooltip>

        {/* Eraser / Clear */}
        <Tooltip content="Clear Drawing Layer">
          <button
            onClick={onClear}
            disabled={tool === 'none'}
            className="p-2 rounded-full hover:bg-oled-700 text-neutral-400 hover:text-red-400 disabled:opacity-20 disabled:pointer-events-none transition-all"
          >
            <Eraser size={16} />
          </button>
        </Tooltip>

        {/* Insert Image */}
        <Tooltip content="Insert Resizable Image">
          <button
            onClick={triggerFileInput}
            className="p-2 rounded-full hover:bg-oled-700 text-neutral-400 hover:text-neutral-200 transition-all"
          >
            <ImageIcon size={16} />
          </button>
        </Tooltip>
      </div>

    </div>
  );
};
