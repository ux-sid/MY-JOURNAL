import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Button } from '../ui/CustomComponents';
import { Bell, Check, X, Loader2 } from 'lucide-react';

export const InvitationNotification: React.FC = () => {
  const { invitations, acceptInvitation, rejectInvitation, appTheme } = useJournal();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isLight = appTheme === 'light';

  if (!invitations || invitations.length === 0) return null;

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    await acceptInvitation(id);
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await rejectInvitation(id);
    setProcessingId(null);
  };

  return (
    <div className="w-full space-y-4">
      {invitations.map((invite) => (
        <div
          key={invite.id}
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-slide-down ${
            isLight
              ? 'bg-amber-50/90 border-amber-200/80 text-stone-800'
              : 'bg-oled-900/90 border-gold-500/20 text-neutral-200 backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Book Spine Icon Skeuomorphism */}
            <div
              style={{ backgroundColor: invite.coverColor || '#2d1b10' }}
              className="w-10 h-12 rounded-md shadow-md flex items-center justify-center relative flex-shrink-0"
            >
              {/* Spine edge representation */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-black/35 rounded-l-md" />
              <span className="text-lg select-none">{invite.coverEmoji || '📖'}</span>
            </div>
            
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Bell size={12} className={isLight ? 'text-amber-700' : 'text-gold-400'} />
                <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-neutral-500">
                  New Invitation
                </span>
              </div>
              <p className="text-sm font-semibold leading-snug">
                <span className={isLight ? 'text-amber-950 font-bold' : 'text-gold-100 font-bold'}>
                  {invite.ownerName}
                </span>{' '}
                invited you to join{' '}
                <span className="italic font-serif">"{invite.bookTitle}"</span>
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                Role: {invite.role === 'edit' ? 'Editor (Can edit)' : 'Viewer (Read-only)'} • From: {invite.ownerEmail}
              </p>
            </div>
          </div>

          <div className="flex gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              disabled={processingId !== null}
              onClick={() => handleReject(invite.id)}
              className={`flex items-center gap-1.5 text-xs py-1.5 px-3 h-8 rounded-lg font-medium transition-all ${
                isLight
                  ? 'border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-red-600'
                  : 'border-oled-700 text-neutral-400 hover:bg-oled-800 hover:text-red-400'
              }`}
            >
              {processingId === invite.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <X size={12} />
              )}
              <span>Decline</span>
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              disabled={processingId !== null}
              onClick={() => handleAccept(invite.id)}
              className={`flex items-center gap-1.5 text-xs py-1.5 px-4 h-8 rounded-lg font-semibold shadow-md transition-all active:scale-[0.98] ${
                isLight
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-gold-500 hover:bg-gold-400 text-neutral-950 border border-neutral-900'
              }`}
            >
              {processingId === invite.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              <span>Accept Invite</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
