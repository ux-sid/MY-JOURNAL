import React, { useState } from 'react';
import { Dialog, Button, Input } from '../ui/CustomComponents';
import { useJournal } from '../../context/JournalContext';
import type { BookData } from '../../context/JournalContext';
import { Mail, UserMinus, Plus, Link as LinkIcon } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookData | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, book }) => {
  const { shareBook, unshareBook, appTheme, books } = useJournal();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'view' | 'edit'>('edit');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!book) return null;

  // Retrieve the latest book data from context's books array reactively
  const activeBook = books.find(b => b.id === book.id) || book;

  const isLight = appTheme === 'light';

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}?book=${activeBook.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter an email address.');
      return;
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    shareBook(activeBook.id, email.trim(), role);
    setEmail('');
    setError('');
  };

  const handleRemove = (collabEmail: string) => {
    unshareBook(activeBook.id, collabEmail);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Share "${activeBook.title}"`}>
      <div className="space-y-5">
        {/* Description */}
        <p className={`text-xs transition-colors duration-200 ${isLight ? 'text-stone-600' : 'text-neutral-400'}`}>
          Invite others to view or collaborate on this notebook. Collaborators will see updates in real time.
        </p>

        {/* Share Form */}
        <form onSubmit={handleShare} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className={`absolute left-3 top-2.5 h-4 w-4 ${isLight ? 'text-stone-400' : 'text-neutral-500'}`} />
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'view' | 'edit')}
              className={`border rounded-md px-2 text-sm focus:outline-none focus:ring-1 transition-colors duration-200 ${
                isLight
                  ? 'bg-white border-stone-300 text-stone-800 focus:ring-amber-500'
                  : 'bg-oled-900 border-oled-600 text-neutral-200 focus:ring-gold-950'
              }`}
            >
              <option value="edit" className={isLight ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>Can Edit</option>
              <option value="view" className={isLight ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>Can View</option>
            </select>
            
            <Button variant="primary" type="submit" size="sm" className="px-3">
              <Plus size={16} />
            </Button>
          </div>
          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
        </form>

        {/* Collaborators List */}
        <div className="space-y-2.5">
          <h4 className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
            isLight ? 'text-stone-500' : 'text-neutral-400'
          }`}>
            Who has access ({activeBook.sharedWith?.length || 0})
          </h4>
          
          <div className={`border rounded-md max-h-[160px] overflow-y-auto style-scrollbar transition-colors duration-200 ${
            isLight
              ? 'bg-white border-stone-300 divide-y divide-stone-200 text-stone-800'
              : 'bg-oled-900 border-oled-600 divide-y divide-oled-600 text-neutral-200'
          }`}>
            {/* Owner - static representation */}
            <div className="flex items-center justify-between px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold font-mono transition-colors ${
                  isLight
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-gold-950/20 text-gold-300 border-gold-950/40'
                }`}>
                  ME
                </div>
                <div>
                  <p className={`font-semibold transition-colors ${isLight ? 'text-stone-800' : 'text-neutral-200'}`}>You (Owner)</p>
                  <p className={`text-[10px] transition-colors ${isLight ? 'text-stone-500' : 'text-neutral-500'}`}>primary-account@aetheria.io</p>
                </div>
              </div>
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono transition-colors ${
                isLight
                  ? 'bg-amber-100 border-amber-200 text-amber-800'
                  : 'bg-gold-950/20 border-gold-950/35 text-gold-300'
              }`}>
                OWNER
              </span>
            </div>

            {/* Collaborators */}
            {activeBook.sharedWith && activeBook.sharedWith.length > 0 ? (
              activeBook.sharedWith.map((collab) => {
                const initials = collab.email.substring(0, 2).toUpperCase();
                return (
                  <div key={collab.email} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-semibold font-mono transition-colors ${
                        isLight
                          ? 'bg-stone-100 text-stone-700 border-stone-300'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}>
                        {initials}
                      </div>
                      <div>
                        <p className={`font-medium line-clamp-1 max-w-[150px] transition-colors ${
                          isLight ? 'text-stone-800' : 'text-neutral-200'
                        }`}>{collab.email}</p>
                        <p className={`text-[10px] font-mono transition-colors ${
                          isLight ? 'text-stone-500' : 'text-neutral-500'
                        }`}>
                          {collab.role === 'edit' ? 'Can Edit' : 'Can View'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemove(collab.email)}
                      className={`p-1 rounded transition-colors ${
                        isLight
                          ? 'text-stone-500 hover:text-red-600 hover:bg-stone-100'
                          : 'text-neutral-500 hover:text-red-400 hover:bg-oled-800'
                      }`}
                      title="Revoke access"
                    >
                      <UserMinus size={14} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className={`px-3 py-4 text-center text-xs transition-colors ${
                isLight ? 'text-stone-400' : 'text-neutral-500'
              }`}>
                No external collaborators. Invite some above!
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`flex justify-between items-center pt-2 border-t transition-colors ${
          isLight ? 'border-stone-200' : 'border-oled-600'
        }`}>
          <Button
            variant="ghost"
            onClick={handleCopyLink}
            size="sm"
            className={`font-mono text-xs px-2 gap-1.5 flex items-center transition-colors ${
              isLight ? 'text-amber-800 hover:text-amber-900' : 'text-gold-500 hover:text-gold-300'
            }`}
          >
            <LinkIcon size={12} />
            <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
          </Button>

          <Button variant="secondary" onClick={(e) => {
            e.stopPropagation();
            setTimeout(onClose, 0);
          }} size="sm">
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
