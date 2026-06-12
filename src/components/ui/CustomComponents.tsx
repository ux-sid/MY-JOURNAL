import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';

// --- Custom Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const { appTheme } = useJournal();
  const isLight = appTheme === 'light';

  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold shadow-lg shadow-gold-950/20",
    secondary: isLight
      ? "bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-800 hover:text-stone-900"
      : "bg-oled-700 hover:bg-oled-600 border border-oled-600 text-neutral-200 hover:text-white",
    outline: isLight
      ? "bg-transparent border border-stone-300 hover:border-amber-600 text-stone-700 hover:text-amber-800"
      : "bg-transparent border border-neutral-700 hover:border-gold-950 text-neutral-300 hover:text-gold-200",
    danger: isLight
      ? "bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800"
      : "bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 text-red-200 hover:text-red-100",
    ghost: isLight
      ? "bg-transparent hover:bg-stone-200 text-stone-600 hover:text-stone-900"
      : "bg-transparent hover:bg-oled-700/60 text-neutral-400 hover:text-neutral-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Custom Input Component ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  const { appTheme } = useJournal();
  const isLight = appTheme === 'light';

  return (
    <input
      className={`w-full rounded-md px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 ${
        isLight
          ? "bg-white border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-amber-500 focus:border-amber-500"
          : "bg-oled-900 border border-oled-600 text-neutral-200 placeholder-neutral-500 focus:ring-gold-950 focus:border-gold-950"
      } ${className}`}
      {...props}
    />
  );
};

// --- Custom Dialog (Modal) ---
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  const { appTheme } = useJournal();
  const isLight = appTheme === 'light';

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); setTimeout(onClose, 0); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-lg shadow-2xl p-6 z-10 border transition-colors ${
              isLight
                ? "bg-[#faf8f4] border-stone-300 text-stone-800"
                : "bg-oled-800 border-oled-600 text-neutral-200"
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
              isLight ? "border-stone-200" : "border-oled-600"
            }`}>
              <h3 className={`font-serif text-lg font-semibold ${
                isLight ? "text-amber-800" : "text-gold-200"
              }`}>{title}</h3>
              <button 
                onClick={(e) => { e.stopPropagation(); setTimeout(onClose, 0); }} 
                className={`p-1 rounded-full transition-colors ${
                  isLight
                    ? "text-stone-500 hover:text-stone-800 hover:bg-stone-200"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-oled-700"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="text-sm">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Custom Dropdown Menu ---
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right' }) => {
  const { appTheme } = useJournal();
  const isLight = appTheme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-30 mt-1 w-48 rounded-md shadow-xl py-1 text-sm border transition-colors ${
              isLight
                ? "bg-white border-stone-200 text-stone-800"
                : "bg-oled-800 border-oled-600 text-neutral-200"
            } ${
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
            }`}
          >
            {/* Context close wrapper */}
            <div onClick={(e) => {
              e.stopPropagation();
              setTimeout(() => setIsOpen(false), 0);
            }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DropdownItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, children, className = '' }) => {
  const { appTheme } = useJournal();
  const isLight = appTheme === 'light';

  return (
    <button
      onClick={() => {
        if (onClick) onClick();
      }}
      className={`w-full text-left px-4 py-2 transition-colors flex items-center gap-2 ${
        isLight
          ? "hover:bg-stone-50 text-stone-700 hover:text-stone-900"
          : "hover:bg-oled-700/60 text-neutral-300 hover:text-white"
      } ${className}`}
    >
      {children}
    </button>
  );
};

// --- Custom Tooltip ---
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-40 pointer-events-none"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
