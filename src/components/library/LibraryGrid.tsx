import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import type { BookData } from '../../context/JournalContext';
import { BookCard } from './BookCard';
import { CoverEditor } from './CoverEditor';
import { ShareModal } from './ShareModal';
import { Dialog, Button, Input } from '../ui/CustomComponents';
import { Plus, Search, FolderOpen, Sun, Moon } from 'lucide-react';

export const LibraryGrid: React.FC = () => {
  const { 
    books, 
    addBook, 
    deleteBook, 
    updateBookCover, 
    selectBook, 
    searchQuery, 
    setSearchQuery,
    user,
    logout,
    appTheme,
    toggleAppTheme
  } = useJournal();

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  
  const [editTarget, setEditTarget] = useState<BookData | null>(null);
  const [shareTarget, setShareTarget] = useState<BookData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookData | null>(null);

  const isLight = appTheme === 'light';

  // Filter books based on search query
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBook = (title: string, color: string, emoji: string) => {
    addBook(title, color, emoji);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteBook(deleteTarget.id);
      setTimeout(() => setDeleteTarget(null), 0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Library Top Bar: Title & Search */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6 transition-colors duration-300 ${
        isLight ? 'border-stone-300' : 'border-oled-600'
      }`}>
        <div>
          <h1 className={`font-serif text-3xl md:text-4xl font-bold tracking-tight transition-colors duration-300 ${
            isLight ? 'text-amber-900' : 'text-gold-200'
          }`}>
            Aetheria Library
          </h1>
          <p className={`text-sm mt-1 font-sans transition-colors duration-300 ${
            isLight ? 'text-stone-500' : 'text-neutral-400'
          }`}>
            Your collection of tactile daily journals and freeform sketches.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* User profile dropdown/badge */}
          {user && (
            <div className={`flex items-center gap-2 border px-3 py-1 rounded-xl text-left shadow-inner flex-shrink-0 transition-colors ${
              isLight 
                ? 'bg-white border-stone-300 text-stone-800' 
                : 'bg-oled-900 border-oled-700/85 text-neutral-200'
            }`}>
              <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold font-mono text-xs transition-colors border ${
                isLight 
                  ? 'bg-amber-100 text-amber-800 border-amber-200' 
                  : 'bg-gold-950/20 text-gold-300 border-gold-950/40'
              }`}>
                {user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.avatar
                )}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-semibold line-clamp-1 ${isLight ? 'text-stone-800' : 'text-neutral-200'}`}>{user.name}</p>
                <p className={`text-[9px] font-mono truncate ${isLight ? 'text-stone-500' : 'text-neutral-500'}`}>{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className={`text-[9px] h-7 px-1.5 ml-1.5 font-mono uppercase ${
                  isLight ? 'text-stone-500 hover:text-red-600 hover:bg-stone-100' : 'text-neutral-500 hover:text-red-400'
                }`}
              >
                Sign Out
              </Button>
            </div>
          )}
          
          {user && <div className={`h-6 w-[1px] hidden sm:block ${isLight ? 'bg-stone-300' : 'bg-oled-700'}`} />}

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className={`absolute left-3 top-2.5 h-4 w-4 ${isLight ? 'text-stone-400' : 'text-neutral-500'}`} />
            <Input
              type="text"
              placeholder="Search journals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Light/Dark App Theme Toggle Button */}
          <Button
            variant="outline"
            onClick={toggleAppTheme}
            className="flex items-center justify-center p-2 h-9 w-9 rounded-md shadow-sm"
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon size={16} className="text-blue-600" /> : <Sun size={16} className="text-gold-400" />}
          </Button>

          {/* Create New Book Button */}
          <Button 
            variant="primary" 
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 whitespace-nowrap shadow-lg"
          >
            <Plus size={16} />
            <span>New Notebook</span>
          </Button>
        </div>
      </div>

      {/* Library Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onOpen={() => selectBook(book.id)}
              onDelete={() => setDeleteTarget(book)}
              onShare={() => setShareTarget(book)}
              onEditCover={() => setEditTarget(book)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={`flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed rounded-xl max-w-lg mx-auto space-y-6 transition-colors duration-300 ${
          isLight 
            ? 'border-stone-300 bg-white/60 shadow-sm' 
            : 'border-oled-600 bg-oled-900/20'
        }`}>
          <div className={`w-16 h-16 rounded-full border flex items-center justify-center transition-colors ${
            isLight 
              ? 'bg-stone-100 border-stone-200 text-amber-800' 
              : 'bg-oled-700 border-oled-650 text-gold-400'
          }`}>
            <FolderOpen size={28} />
          </div>
          <div className="space-y-2">
            <h3 className={`font-serif text-lg font-bold transition-colors ${isLight ? 'text-stone-800' : 'text-neutral-200'}`}>No Journals Found</h3>
            <p className={`text-sm max-w-xs transition-colors ${isLight ? 'text-stone-500' : 'text-neutral-500'}`}>
              {searchQuery 
                ? `We couldn't find any journals matching "${searchQuery}". Try a different keyword.` 
                : "You don't have any journals in your bookshelf yet. Create your first notebook to get started."}
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create Notebook</span>
          </Button>
        </div>
      )}

      {/* --- Modals --- */}
      
      {/* Create Notebook Cover Editor */}
      <CoverEditor
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateBook}
        title="Create New Notebook"
        submitLabel="Create"
      />

      {/* Edit Cover Editor */}
      {editTarget && (
        <CoverEditor
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(title, color, emoji) => {
            updateBookCover(editTarget.id, title, color, emoji);
          }}
          title="Customize Cover"
          initialTitle={editTarget.title}
          initialColor={editTarget.coverColor}
          initialEmoji={editTarget.coverEmoji}
          submitLabel="Save Changes"
        />
      )}

      {/* Share / Collaboration Modal */}
      {shareTarget && (
        <ShareModal
          isOpen={!!shareTarget}
          onClose={() => setShareTarget(null)}
          book={shareTarget}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Notebook"
      >
        <div className="space-y-4">
          <p className={`text-xs leading-relaxed transition-colors ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
            Are you sure you want to delete <strong className={isLight ? 'text-stone-800' : 'text-neutral-200'}>"{deleteTarget?.title}"</strong>? 
            This action is permanent and will delete all contents, daily templates, checklists, and drawing canvases inside this notebook.
          </p>
          <div className={`flex gap-3 justify-end pt-2 border-t ${isLight ? 'border-stone-200' : 'border-oled-600'}`}>
            <Button variant="ghost" onClick={(e) => {
              e.stopPropagation();
              setTimeout(() => setDeleteTarget(null), 0);
            }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={(e) => {
              e.stopPropagation();
              setTimeout(handleDeleteConfirm, 0);
            }}>
              Delete Notebook
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
