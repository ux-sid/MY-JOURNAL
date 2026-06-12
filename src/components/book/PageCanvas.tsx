import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJournal } from '../../context/JournalContext';
import type { PageData } from '../../context/JournalContext';
import { ChevronLeft, ChevronRight, BookOpen, Trash2, Copy } from 'lucide-react';
import { playPaperRustle } from './AudioSynth';
import { Button } from '../ui/CustomComponents';

interface PageCanvasProps {
  bookId: string;
  pages: PageData[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  children: (page: PageData) => React.ReactNode;
}

export const PageCanvas: React.FC<PageCanvasProps> = ({
  bookId,
  pages,
  currentPageIndex,
  setCurrentPageIndex,
  children
}) => {
  const { deletePage, addPage, duplicatePage, appTheme } = useJournal();
  
  // Track direction: 1 for forward (next), -1 for backward (prev)
  const [direction, setDirection] = useState<number>(1);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPage = pages[currentPageIndex] || pages[0];

  // Dynamic scaling observer effect
  useEffect(() => {
    const parentElement = containerRef.current;
    if (!parentElement) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth;
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Compute margins: thin padding on mobile, larger padding on desktop
      const margin = mobile ? 16 : 48;
      const targetWidth = parentWidth - margin;
      
      // Base logical width is 800px. Scale down if parent size is smaller.
      const newScale = Math.min(1, targetWidth / 800);
      setScale(newScale);
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });
    
    observer.observe(parentElement);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const handlePrevPage = () => {
    if (currentPageIndex > 0 && !isFlipping) {
      setDirection(-1);
      setIsFlipping(true);
      playPaperRustle();
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1 && !isFlipping) {
      setDirection(1);
      setIsFlipping(true);
      playPaperRustle();
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  // 3D Flip Animation Variants
  const variants = {
    initial: (dir: number) => ({
      rotateY: dir > 0 ? 85 : -85,
      opacity: 0,
      scale: 0.96,
      z: -100
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      z: 0,
      transition: {
        rotateY: { type: 'spring' as const, stiffness: 70, damping: 14 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 }
      }
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -85 : 85,
      opacity: 0,
      scale: 0.96,
      z: -100,
      transition: {
        rotateY: { type: 'spring' as const, stiffness: 70, damping: 14 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 }
      }
    })
  };

  // Safety trigger to unlock flipping flag
  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(() => setIsFlipping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentPageIndex, isFlipping]);

  return (
    <div className="relative flex-1 flex flex-col items-center justify-start py-4 px-4 w-full select-none overflow-y-auto style-scrollbar">
      
      {/* Book Nav / Info Header */}
      <div className={`flex justify-between items-center w-full max-w-[800px] mb-4 text-xs font-mono border-b pb-3 transition-colors duration-200 ${
        appTheme === 'light' ? 'text-stone-600 border-stone-300' : 'text-neutral-400 border-oled-700'
      }`}>
        <div className="flex items-center gap-2">
          <BookOpen size={14} className={appTheme === 'light' ? 'text-amber-800' : 'text-gold-400'} />
          <span className={`font-semibold transition-colors ${appTheme === 'light' ? 'text-stone-800' : 'text-neutral-300'}`}>
            Page {currentPageIndex + 1} of {pages.length}
          </span>
          <span className={appTheme === 'light' ? 'text-stone-300' : 'text-neutral-600'}>|</span>
          <span>{currentPage.templateType === 'daily' ? 'Daily Journal' : 'Blank Canvas'}</span>
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Duplicate Page Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => duplicatePage(bookId, currentPage.id)}
            className={`h-7 px-2 transition-colors ${
              appTheme === 'light' 
                ? 'text-stone-500 hover:text-amber-800 hover:bg-stone-100' 
                : 'text-neutral-500 hover:text-gold-200'
            }`}
          >
            <Copy size={12} className="mr-1" />
            <span className="hidden sm:inline">Duplicate</span>
          </Button>

          {/* Delete Page Option (disabled if only 1 page) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (pages.length > 1) {
                if (confirm('Delete this page? This will clear all writings and drawings on it.')) {
                  deletePage(bookId, currentPage.id);
                }
              } else {
                alert('A notebook must contain at least one page.');
              }
            }}
            disabled={pages.length <= 1}
            className={`h-7 px-2 transition-colors ${
              appTheme === 'light'
                ? 'text-stone-500 hover:text-red-600 hover:bg-stone-100'
                : 'text-neutral-500 hover:text-red-400'
            }`}
          >
            <Trash2 size={12} className="mr-1" />
            <span className="hidden sm:inline">Delete Page</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPage(bookId, 'daily')}
            className={`h-7 text-[10px] px-2 transition-colors ${
              appTheme === 'light'
                ? 'border-stone-300 text-stone-600 hover:text-amber-800 hover:border-amber-600'
                : 'border-neutral-700 text-neutral-300 hover:text-gold-200'
            }`}
          >
            + Daily
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPage(bookId, 'blank')}
            className={`h-7 text-[10px] px-2 transition-colors ${
              appTheme === 'light'
                ? 'border-stone-300 text-stone-600 hover:text-amber-800 hover:border-amber-600'
                : 'border-neutral-700 text-neutral-355 hover:text-gold-200'
            }`}
          >
            + Blank
          </Button>
        </div>
      </div>

      {/* Sizer Container - measures parent width and centers */}
      <div 
        ref={containerRef}
        className={`w-full flex-1 flex justify-center ${isMobile ? 'items-start' : 'items-center'} relative py-2 min-h-[350px]`}
      >
        {/* Centered sizer wrapper with proportional width/height */}
        <div 
          style={isMobile ? {
            width: '100%',
            height: '640px',
            position: 'relative'
          } : { 
            width: `${800 * scale}px`, 
            height: `${1130 * scale}px`,
            position: 'relative'
          }}
          className={`w-full ${
            isMobile 
              ? 'bg-neutral-900 border border-oled-700 rounded-lg shadow-book overflow-hidden' 
              : 'perspective-container bg-neutral-900 border border-oled-700 rounded-lg shadow-book overflow-hidden'
          }`}
        >
          {/* Spine shadow detail - hidden on mobile since we stack layout */}
          {!isMobile && (
            <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-r from-black/80 via-black/30 to-transparent z-25 pointer-events-none shadow-page-left" />
          )}
          
          {/* Gold ribbon marker on first page - hidden on mobile */}
          {currentPageIndex === 0 && !isMobile && (
            <div className="absolute top-0 right-10 w-4 h-24 bg-gradient-to-b from-gold-600 via-gold-500 to-gold-700 shadow-md z-20 pointer-events-none rounded-b" />
          )}

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPage.id}
              custom={direction}
              variants={variants}
              initial={isMobile ? { opacity: 0 } : "initial"}
              animate={isMobile ? { opacity: 1 } : "animate"}
              exit={isMobile ? { opacity: 0 } : "exit"}
              style={isMobile ? {
                width: '100%',
                height: '640px',
                position: 'relative'
              } : { 
                originX: 0,
                width: '800px',
                height: '1130px',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
              }}
              className={`${isMobile ? 'w-full h-[640px]' : 'page-3d-left w-full h-full'} select-text`}
            >
              {/* Render A4 content children */}
              {children(currentPage)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating turn buttons fixed to viewport on left and right edges */}
      {currentPageIndex > 0 && (
        <button
          onClick={handlePrevPage}
          disabled={isFlipping}
          className={`fixed left-3 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full backdrop-blur border shadow-2xl transition-all duration-200 active:scale-90 hover:scale-105 flex items-center justify-center ${
            appTheme === 'light'
              ? 'bg-white/90 border-stone-300 text-amber-800 hover:text-amber-900 shadow-md'
              : 'bg-oled-800/80 border-oled-600 text-gold-300 hover:text-white'
          }`}
          title="Previous Page"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {currentPageIndex < pages.length - 1 && (
        <button
          onClick={handleNextPage}
          disabled={isFlipping}
          className={`fixed right-3 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full backdrop-blur border shadow-2xl transition-all duration-200 active:scale-90 hover:scale-105 flex items-center justify-center ${
            appTheme === 'light'
              ? 'bg-white/90 border-stone-300 text-amber-800 hover:text-amber-900 shadow-md'
              : 'bg-oled-800/80 border-oled-600 text-gold-300 hover:text-white'
          }`}
          title="Next Page"
        >
          <ChevronRight size={20} />
        </button>
      )}

    </div>
  );
};
