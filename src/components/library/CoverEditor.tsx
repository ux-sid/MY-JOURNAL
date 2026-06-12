import React, { useState, useEffect } from 'react';
import { Dialog, Button, Input } from '../ui/CustomComponents';
import { useJournal } from '../../context/JournalContext';

interface CoverEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, color: string, emoji: string) => void;
  title?: string;
  initialTitle?: string;
  initialColor?: string;
  initialEmoji?: string;
  submitLabel?: string;
}

const PRESET_LEATHERS = [
  { name: 'Classic Brown', hex: '#2d1b10' },
  { name: 'Obsidian Black', hex: '#141414' },
  { name: 'Crimson Red', hex: '#3d1212' },
  { name: 'Navy Blue', hex: '#132237' },
  { name: 'Forest Green', hex: '#122c1e' },
  { name: 'Deep Teal', hex: '#0a2e2b' },
  { name: 'Royal Purple', hex: '#271536' },
  { name: 'Antique Gold', hex: '#443515' }
];

const PRESET_EMOJIS = [
  '🕯️', '📖', '🎨', '✒️', '📜', '🧠', '✨', '🪐', 
  '🌙', '🌲', '🌿', '🌊', '☕', '🎻', '⚓', '🔑', 
  '🎒', '🦅', '🐺', '🦁', '🧭', '🧬', '🏺', '🕯️'
];

export const CoverEditor: React.FC<CoverEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  title = 'Notebook Cover Editor',
  initialTitle = '',
  initialColor = '#2d1b10',
  initialEmoji = '📖',
  submitLabel = 'Save'
}) => {
  const { appTheme } = useJournal();
  const [notebookTitle, setNotebookTitle] = useState(initialTitle);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji);
  const [customColor, setCustomColor] = useState(initialColor);

  // Sync state with props when opening
  useEffect(() => {
    if (isOpen) {
      setNotebookTitle(initialTitle);
      setSelectedColor(initialColor);
      setSelectedEmoji(initialEmoji);
      setCustomColor(initialColor);
    }
  }, [isOpen, initialTitle, initialColor, initialEmoji]);

  const handleSave = () => {
    if (!notebookTitle.trim()) return;
    onSave(notebookTitle, selectedColor, selectedEmoji);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        {/* Live Preview of the Book Cover */}
        <div className="flex justify-center py-2">
          <div 
            style={{ backgroundColor: selectedColor }}
            className="leather-grain relative w-[130px] h-[180px] rounded-r-lg rounded-l-sm border border-white/10 shadow-lg flex flex-col justify-between p-3 select-none"
          >
            {/* Spine shadow */}
            <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-black/50 via-black/10 to-transparent rounded-l-sm" />
            <div className="absolute top-0 left-[10px] w-[1px] h-full bg-white/10" />
            
            {/* Cover items */}
            <div className="flex justify-end pr-1 pt-1 z-10 text-[10px] text-white/40">PREVIEW</div>
            
            <div className="flex flex-col items-center text-center gap-2 z-10">
              <span className="text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">{selectedEmoji}</span>
              <span className="font-serif text-[10px] font-bold text-gold-100 tracking-wide line-clamp-3 leading-tight px-1">
                {notebookTitle || 'Untitled Journal'}
              </span>
            </div>
            
            <div className="w-full text-center z-10 text-[8px] text-white/35 font-mono">
              AETHERIA
            </div>
          </div>
        </div>

        {/* Notebook Name Input */}
        <div className="space-y-1.5">
          <label className={`text-xs font-semibold ${appTheme === 'light' ? 'text-stone-600' : 'text-neutral-400'}`}>Notebook Title</label>
          <Input 
            value={notebookTitle} 
            onChange={(e) => setNotebookTitle(e.target.value)} 
            placeholder="e.g., Creative Musings"
            maxLength={40}
          />
        </div>

        {/* Color Picker presets */}
        <div className="space-y-1.5">
          <label className={`text-xs font-semibold ${appTheme === 'light' ? 'text-stone-600' : 'text-neutral-400'}`}>Leather Color</label>
          <div className="grid grid-cols-8 gap-2">
            {PRESET_LEATHERS.map((color) => (
              <button
                key={color.hex}
                onClick={() => {
                  setSelectedColor(color.hex);
                  setCustomColor(color.hex);
                }}
                className={`w-8 h-8 rounded-md border transition-transform hover:scale-105 active:scale-95 relative ${
                  selectedColor === color.hex 
                    ? appTheme === 'light'
                      ? 'border-amber-600 ring-1 ring-amber-600'
                      : 'border-gold-400 ring-1 ring-gold-400' 
                    : appTheme === 'light'
                      ? 'border-stone-300'
                      : 'border-neutral-700'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs ${appTheme === 'light' ? 'text-stone-700' : 'text-neutral-400'}`}>Custom Color:</span>
            <input 
              type="color" 
              value={customColor} 
              onChange={(e) => {
                setCustomColor(e.target.value);
                setSelectedColor(e.target.value);
              }}
              className={`bg-transparent border rounded cursor-pointer w-7 h-7 ${appTheme === 'light' ? 'border-stone-300' : 'border-neutral-700'}`}
            />
            <span className={`text-xs font-mono ${appTheme === 'light' ? 'text-stone-700' : 'text-neutral-500'}`}>{selectedColor.toUpperCase()}</span>
          </div>
        </div>

        {/* Emoji selector */}
        <div className="space-y-1.5">
          <label className={`text-xs font-semibold ${appTheme === 'light' ? 'text-stone-600' : 'text-neutral-400'}`}>Cover Icon</label>
          <div className="grid grid-cols-8 gap-2 max-h-[100px] overflow-y-auto style-scrollbar pr-1">
            {PRESET_EMOJIS.map((emoji) => (
              <button
                key={emoji + Math.random()} // Avoid key clashes
                onClick={() => setSelectedEmoji(emoji)}
                className={`w-8 h-8 flex items-center justify-center text-lg rounded-md transition-colors ${
                  appTheme === 'light'
                    ? `hover:bg-stone-100 ${selectedEmoji === emoji ? 'bg-amber-50 border border-amber-600' : 'border border-transparent'}`
                    : `hover:bg-oled-700 ${selectedEmoji === emoji ? 'bg-oled-750 border border-gold-400' : 'border border-transparent'}`
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 justify-end pt-2 border-t ${appTheme === 'light' ? 'border-stone-200' : 'border-oled-600'}`}>
          <Button variant="ghost" onClick={(e) => {
            e.stopPropagation();
            setTimeout(onClose, 0);
          }}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={(e) => {
              e.stopPropagation();
              setTimeout(handleSave, 0);
            }}
            disabled={!notebookTitle.trim()}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
