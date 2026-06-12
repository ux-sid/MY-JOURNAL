import React from 'react';
import type { BookData } from '../../context/JournalContext';
import { MoreVertical, Share2, Trash2, Edit, Users } from 'lucide-react';
import { Dropdown, DropdownItem } from '../ui/CustomComponents';

interface BookCardProps {
  book: BookData;
  onOpen: () => void;
  onDelete: () => void;
  onShare: () => void;
  onEditCover: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onOpen,
  onDelete,
  onShare,
  onEditCover
}) => {
  // Extract sharing count
  const isShared = book.sharedWith && book.sharedWith.length > 0;

  return (
    <div className="group relative h-[360px] w-[260px] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {/* 3D Book Layout Container */}
      <div 
        onClick={onOpen}
        style={{ backgroundColor: book.coverColor }}
        className="leather-grain relative w-full h-full rounded-r-xl rounded-l-md shadow-book cursor-pointer overflow-hidden border-t border-r border-b border-white/10 flex flex-col justify-between p-6 select-none"
      >
        {/* Book Spine Detail (Skeuomorphic depth) */}
        <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-black/60 via-black/20 to-transparent shadow-book-spine rounded-l-md" />
        {/* Spine lines */}
        <div className="absolute top-0 left-5 w-[1px] h-full bg-white/10" />
        <div className="absolute top-0 left-[22px] w-[2px] h-full bg-black/40" />

        {/* Cover Gold Foil / Border accents */}
        <div className="absolute inset-4 border border-gold-950/20 rounded-r-lg rounded-l-sm pointer-events-none" />

        {/* Top: Collaboration tag / Options */}
        <div className="flex justify-between items-start z-20 pl-4">
          <div>
            {isShared ? (
              <div className="flex items-center gap-1.5 bg-black/55 backdrop-blur-md px-2 py-1 rounded-full border border-gold-950/30 text-gold-300 text-xs">
                <Users size={12} />
                <span>Shared ({book.sharedWith.length})</span>
              </div>
            ) : (
              <div />
            )}
          </div>
          
          {/* Prevent card click when clicking settings dropdown */}
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button className="text-white/60 hover:text-white p-1 hover:bg-black/30 rounded-full transition-all">
                  <MoreVertical size={16} />
                </button>
              }
            >
              <DropdownItem onClick={onEditCover}>
                <Edit size={14} className="text-gold-400" />
                <span>Customize Cover</span>
              </DropdownItem>
              <DropdownItem onClick={onShare}>
                <Share2 size={14} className="text-blue-400" />
                <span>Share & Invite</span>
              </DropdownItem>
              <DropdownItem onClick={onDelete} className="hover:bg-red-950/20">
                <Trash2 size={14} className="text-red-400" />
                <span className="text-red-400">Delete Journal</span>
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Middle: Icon & Title */}
        <div className="flex flex-col items-center gap-6 z-10 pl-4 pr-2 text-center mt-6">
          {/* Cover Emoji */}
          <span className="text-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] animate-pulse-slow">
            {book.coverEmoji}
          </span>
          
          {/* Cover Title */}
          <h3 className="font-serif text-xl font-bold text-gold-100 tracking-wide leading-snug max-h-[110px] overflow-hidden line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {book.title}
          </h3>
        </div>

        {/* Bottom: Pages count / metadata */}
        <div className="flex justify-between items-center z-10 pl-4 text-xs text-white/50 font-medium font-mono">
          <span>{book.pages.length} {book.pages.length === 1 ? 'page' : 'pages'}</span>
          <span>
            {new Date(book.createdAt).toLocaleDateString(undefined, { 
              month: 'short', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>
      
      {/* 3D Book Page Edge thickness showing behind book (visible on hover) */}
      <div className="absolute top-2 right-[-6px] w-[6px] h-[348px] bg-neutral-800 border-y border-r border-neutral-700/60 rounded-r shadow-md z-[-1] transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-y-[1.01]" />
      <div className="absolute top-4 right-[-10px] w-[5px] h-[340px] bg-neutral-600/50 border-y border-r border-neutral-700/60 rounded-r shadow-md z-[-2] transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-y-[0.98]" />
    </div>
  );
};
