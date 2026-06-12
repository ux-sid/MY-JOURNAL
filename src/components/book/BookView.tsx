import React, { useState, useRef } from 'react';
import { useJournal, type PageData, type PlacedImage } from '../../context/JournalContext';
import { PageCanvas } from './PageCanvas';
import { DailyTemplate } from './DailyTemplate';
import { DrawingLayer } from './DrawingLayer';
import { ResizableImage } from './ResizableImage';
import { FloatingToolbar } from './FloatingToolbar';
import { ShareModal } from '../library/ShareModal';
import { Button, Dropdown, DropdownItem } from '../ui/CustomComponents';
import { 
  ArrowLeft, 
  Download, 
  Layout, 
  FileText, 
  File, 
  Grid3X3, 
  AlignJustify,
  Sun,
  Moon,
  Share2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const BookView: React.FC = () => {
  const { 
    books, 
    currentBookId, 
    currentPageIndex, 
    setCurrentPageIndex, 
    selectBook, 
    updatePage,
    pageTheme,
    togglePageTheme,
    user,
    appTheme,
    toggleAppTheme
  } = useJournal();

  // Active book
  const book = books.find(b => b.id === currentBookId);
  
  // Modals and tool drawing state
  const [shareOpen, setShareOpen] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'pen' | 'highlighter' | 'none'>('none');
  const [color, setColor] = useState('#ebd99d'); // Default drawing color: gold
  
  // Custom paper background styles
  const [paperStyle, setPaperStyle] = useState<'ruled' | 'dotted' | 'blank'>('ruled');

  // Trigger states for drawing canvas actions
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [redoTrigger, setRedoTrigger] = useState(0);
  const [clearTrigger, setClearTrigger] = useState(0);

  const a4PageRef = useRef<HTMLDivElement>(null);

  if (!book) return null;
  const currentPage = book.pages[currentPageIndex] || book.pages[0];

  // Update page wrapper
  const handleUpdatePage = (updates: Partial<PageData>) => {
    updatePage(book.id, currentPage.id, updates);
  };

  // --- HTML5 Canvas drawing layer triggers ---
  const handleUndo = () => setUndoTrigger(prev => prev + 1);
  const handleRedo = () => setRedoTrigger(prev => prev + 1);
  const handleClear = () => setClearTrigger(prev => prev + 1);

  // --- Image insertion handler ---
  const handleInsertImage = (src: string) => {
    const newImage: PlacedImage = {
      id: `img-${Math.random().toString(36).substring(2, 9)}`,
      src,
      x: 30,
      y: 35,
      w: 30,
      h: 20
    };
    const updatedImages = [...(currentPage.images || []), newImage];
    handleUpdatePage({ images: updatedImages });
    setTool('none');
  };

  const handleUpdateImage = (imgId: string, updates: Partial<PlacedImage>) => {
    const updated = currentPage.images.map(img => 
      img.id === imgId ? { ...img, ...updates } : img
    );
    handleUpdatePage({ images: updated });
  };

  const handleDeleteImage = (imgId: string) => {
    const updated = currentPage.images.filter(img => img.id !== imgId);
    handleUpdatePage({ images: updated });
  };

  // --- Export PDF / PNG engine ---
  const handleExport = async (_scope: 'page' | 'book', format: 'png' | 'pdf') => {
    try {
      const element = document.getElementById('a4-page-capture');
      if (!element) return;
      
      const isBeige = pageTheme === 'beige';
      const bgColor = isBeige ? '#f6f2e8' : '#171715';

      if (format === 'png') {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: bgColor,
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${book.title}_Page_${currentPageIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
      } 
      else if (format === 'pdf') {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: bgColor,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${book.title}_Page_${currentPageIndex + 1}.pdf`);
      }
    } catch (error) {
      console.error('Failed to export page content:', error);
      alert('Failed to generate export file. Please check drawing and image sizes.');
    }
  };

  // Dynamic paper texture selector class based on style and theme
  const isBeige = pageTheme === 'beige';
  const getPaperTextureClass = () => {
    if (isBeige) {
      return paperStyle === 'ruled' 
        ? 'paper-texture-ruled-beige' 
        : paperStyle === 'dotted' 
          ? 'paper-texture-dotted-beige' 
          : 'paper-texture-blank-beige';
    } else {
      return paperStyle === 'ruled' 
        ? 'paper-texture-ruled' 
        : paperStyle === 'dotted' 
          ? 'paper-texture-dotted' 
          : 'paper-texture-blank';
    }
  };

  const isLightApp = appTheme === 'light';

  return (
    <div className={`min-h-screen flex flex-col relative w-full select-none transition-colors duration-300 ${
      isLightApp ? 'bg-[#f5f2eb]' : 'bg-oled-950'
    }`}>
      
      {/* Top Header Navigation Bar */}
      <div className={`h-16 border-b backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 gap-2 overflow-x-auto md:overflow-x-visible style-scrollbar transition-colors duration-300 ${
        isLightApp ? 'border-stone-250 bg-white/60' : 'border-oled-700 bg-oled-900/60'
      }`}>
        
        {/* Left: Back button & Title & Profile */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => selectBook(null)}
            className={`px-2 h-9 rounded-full transition-colors ${
              isLightApp 
                ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100' 
                : 'text-neutral-400 hover:text-white hover:bg-oled-800'
            }`}
          >
            <ArrowLeft size={16} className="mr-1" />
            <span className="hidden sm:inline">Library</span>
          </Button>
          
          <div className={`h-4 w-[1px] ${isLightApp ? 'bg-stone-300' : 'bg-oled-700'}`} />
          
          <div>
            <h2 className={`font-serif text-sm font-semibold line-clamp-1 max-w-[120px] sm:max-w-[200px] transition-colors ${
              isLightApp ? 'text-stone-800' : 'text-neutral-200'
            }`}>
              {book.title}
            </h2>
            {user && (
              <p className={`text-[9px] font-mono tracking-wide uppercase mt-0.5 transition-colors ${
                isLightApp ? 'text-stone-500' : 'text-neutral-500'
              }`}>
                {user.name}
              </p>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle, Share, Page Settings, Paper background toggles & Export */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          
          {/* Light/Dark App Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAppTheme}
            className={`h-8 text-xs px-2 ${
              isLightApp ? 'border-stone-300 hover:text-amber-800' : 'border-neutral-700 hover:text-gold-200'
            }`}
            title={isLightApp ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLightApp ? <Moon size={14} className="text-blue-600" /> : <Sun size={14} className="text-gold-400" />}
            <span className="hidden lg:inline ml-1.5">{isLightApp ? 'Dark App' : 'Light App'}</span>
          </Button>

          {/* Light/Dark Beige Page Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={togglePageTheme}
            className={`h-8 text-xs px-2 ${
              isLightApp ? 'border-stone-300 hover:text-amber-800' : 'border-neutral-700 hover:text-gold-200'
            }`}
            title={isBeige ? 'Switch to Dark Ink' : 'Switch to Beige Parchment'}
          >
            {isBeige ? <Moon size={14} className="text-blue-400" /> : <Sun size={14} className="text-gold-400" />}
            <span className="hidden lg:inline ml-1.5">{isBeige ? 'Dark Page' : 'Beige Page'}</span>
          </Button>

          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareOpen(true)}
            className={`h-8 text-xs px-2 ${
              isLightApp ? 'border-stone-300 hover:text-amber-800' : 'border-neutral-700 hover:text-gold-200'
            }`}
            title="Share notebook"
          >
            <Share2 size={14} className="text-gold-500" />
            <span className="hidden lg:inline ml-1.5">Share</span>
          </Button>
          
          {/* Template Selection Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm" className={`h-8 text-xs gap-1.5 px-2 ${
                isLightApp ? 'border-stone-300 hover:text-amber-800' : 'border-neutral-700 hover:text-gold-200'
              }`}>
                <Layout size={12} className={isLightApp ? 'text-amber-800' : 'text-gold-400'} />
                <span className="hidden sm:inline">Page Layout</span>
              </Button>
            }
          >
            <DropdownItem onClick={() => handleUpdatePage({ templateType: 'daily' })}>
              <FileText size={12} className="text-blue-400" />
              <span>Daily Template</span>
            </DropdownItem>
            <DropdownItem onClick={() => handleUpdatePage({ templateType: 'blank' })}>
              <File size={12} className="text-green-400" />
              <span>Empty Canvas</span>
            </DropdownItem>
          </Dropdown>

          {/* Paper Background Style Selector */}
          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm" className={`h-8 text-xs gap-1.5 px-2 ${
                isLightApp ? 'border-stone-300 hover:text-amber-800' : 'border-neutral-700 hover:text-gold-200'
              }`}>
                <AlignJustify size={12} className={isLightApp ? 'text-amber-800' : 'text-gold-400'} />
                <span className="hidden sm:inline">Paper style</span>
              </Button>
            }
          >
            <DropdownItem onClick={() => setPaperStyle('ruled')}>
              <AlignJustify size={12} className="text-neutral-400" />
              <span>Ruled / Lined</span>
            </DropdownItem>
            <DropdownItem onClick={() => setPaperStyle('dotted')}>
              <Grid3X3 size={12} className="text-neutral-400" />
              <span>Dotted Grid</span>
            </DropdownItem>
            <DropdownItem onClick={() => setPaperStyle('blank')}>
              <File size={12} className="text-neutral-400" />
              <span>Blank / Solid</span>
            </DropdownItem>
          </Dropdown>

          {/* Export Actions Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <Button variant="primary" size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow px-2.5">
                <Download size={12} />
                <span className="hidden sm:inline">Export</span>
              </Button>
            }
          >
            <DropdownItem onClick={() => handleExport('page', 'pdf')}>
              <span>Download Page as PDF</span>
            </DropdownItem>
            <DropdownItem onClick={() => handleExport('page', 'png')}>
              <span>Download Page as PNG</span>
            </DropdownItem>
          </Dropdown>

        </div>
      </div>

      {/* Center 3D Book view container */}
      <div className="flex-1 flex flex-col justify-start md:justify-center items-center relative overflow-y-auto md:overflow-hidden style-scrollbar select-none">
        
        {/* Render PageCanvas to wrap A4 proportions and page flip effects */}
        <PageCanvas
          bookId={book.id}
          pages={book.pages}
          currentPageIndex={currentPageIndex}
          setCurrentPageIndex={setCurrentPageIndex}
        >
          {(page) => (
            <div 
              id="a4-page-capture"
              ref={a4PageRef}
              className={`w-full h-[640px] md:h-full relative overflow-hidden flex flex-col transition-all duration-300 ${getPaperTextureClass()}`}
            >
              {/* Layer 1: Text templates / Content Editable areas */}
              {page.templateType === 'daily' ? (
                <DailyTemplate
                  page={page}
                  onUpdate={handleUpdatePage}
                  isReadOnly={tool !== 'none'} // block text editing while drawing is active
                />
              ) : (
                /* Blank A4 freeform canvas layout */
                <div className={`w-full h-[640px] md:h-full p-8 md:p-10 flex flex-col select-text ${isBeige ? 'text-stone-800' : 'text-neutral-300'}`}>
                  <div className={`pb-3 border-b ${isBeige ? 'border-amber-900/15' : 'border-gold-950/20'} mb-4 flex justify-between items-end flex-shrink-0 gap-2`}>
                    <input
                      type="text"
                      value={page.p1 || ''}
                      onChange={(e) => handleUpdatePage({ p1: e.target.value })}
                      placeholder="Blank Sheet Title..."
                      className={`bg-transparent font-serif italic text-xl md:text-2xl ${isBeige ? 'text-amber-900 font-bold' : 'text-gold-100 font-semibold'} placeholder-neutral-500 focus:outline-none w-2/3 border-none p-0 focus:ring-0`}
                    />
                    
                    {/* Editable Date for Blank Page */}
                    <div className="relative group/blank-date cursor-pointer flex-shrink-0">
                      <input
                        type="text"
                        value={page.date}
                        onChange={(e) => handleUpdatePage({ date: e.target.value })}
                        className={`bg-transparent text-right font-mono text-[10px] md:text-xs ${isBeige ? 'text-stone-500 focus:text-stone-900' : 'text-neutral-500 focus:text-neutral-200'} placeholder-neutral-600 focus:outline-none border-none p-0 focus:ring-0 w-28 sm:w-40`}
                        placeholder="Click to add date..."
                      />
                    </div>
                  </div>
                  
                  {/* Scrollable text editor container */}
                  <div className="flex-1 overflow-y-auto style-scrollbar pr-1">
                    <div
                      contentEditable={tool === 'none'}
                      onInput={(e) => handleUpdatePage({ notes: e.currentTarget.innerHTML })}
                      dangerouslySetInnerHTML={{ __html: page.notes || '' }}
                      className={`rich-editor w-full min-h-[350px] bg-transparent text-sm leading-relaxed focus:outline-none ${isBeige ? 'text-stone-800' : 'text-neutral-300'}`}
                      data-placeholder="Start typing notes freely..."
                    />
                  </div>
                </div>
              )}

              {/* Layer 2: Placed Resizable Images */}
              {page.images && page.images.map((img) => (
                <ResizableImage
                  key={img.id}
                  image={img}
                  onUpdate={(updates) => handleUpdateImage(img.id, updates)}
                  onDelete={() => handleDeleteImage(img.id)}
                  isReadOnly={tool !== 'none'}
                />
              ))}

              {/* Layer 3: Drawing Canvas Overlay */}
              <DrawingLayer
                page={page}
                onUpdate={handleUpdatePage}
                tool={tool}
                color={color}
                undoTrigger={undoTrigger}
                redoTrigger={redoTrigger}
                clearTrigger={clearTrigger}
              />
            </div>
          )}
        </PageCanvas>
      </div>

      {/* Floating Toolbar controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-35">
        <FloatingToolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onInsertImage={handleInsertImage}
        />
      </div>

      {/* Sharing Dialog */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        book={book}
      />

    </div>
  );
};
