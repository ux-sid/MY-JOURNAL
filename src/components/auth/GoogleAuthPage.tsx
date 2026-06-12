import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Button } from '../ui/CustomComponents';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { auth, googleProvider, isFirebaseEnabled } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';

export const GoogleAuthPage: React.FC = () => {
  const { login } = useJournal();
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const MOCK_ACCOUNTS = [
    { name: 'Alexander Vance', email: 'alexander.vance@aetheria.io', avatar: 'AV' },
    { name: 'Seraphina Locke', email: 'seraphina.locke@aetheria.io', avatar: 'SL' }
  ];

  const handleSelectAccount = (acc: { name: string; email: string; avatar: string }) => {
    setSelectedAccount(acc);
    setIsLoggingIn(true);
    
    // Simulate auth check spinner
    setTimeout(() => {
      login(acc.name, acc.email, acc.avatar);
      setIsLoggingIn(false);
    }, 1500);
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseEnabled || !auth || !googleProvider) {
      setShowAccountSelector(true);
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        const name = user.displayName || 'Google User';
        const email = user.email || '';
        const avatar = user.photoURL || (name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'G');
        login(name, email, avatar);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Google Sign-In failed. Please verify your Firebase configuration and domain settings.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;
    
    const initials = customName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    const acc = { name: customName, email: customEmail, avatar: initials };
    
    setSelectedAccount(acc);
    setIsLoggingIn(true);
    
    setTimeout(() => {
      login(acc.name, acc.email, acc.avatar);
      setIsLoggingIn(false);
    }, 1500);
  };


  return (
    <div className="min-h-screen bg-oled-950 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      
      {/* Premium background glow */}
      <div className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vh] bg-gold-950/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vh] bg-blue-950/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main skeuomorphic card */}
      <div className="w-full max-w-md bg-neutral-900 border border-oled-700/80 rounded-2xl shadow-book relative z-10 p-8 md:p-10 flex flex-col items-center text-center leather-grain">
        
        {/* Spine details on the left edge for journal cover skeuomorphism */}
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-black/80 to-transparent rounded-l-2xl z-20 pointer-events-none" />
        
        {!showAccountSelector ? (
          /* Landing Screen */
          <div className="space-y-8 w-full">
            {/* Logo area */}
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-oled-900/50 border border-gold-500/20 shadow-inner flex items-center justify-center mx-auto text-gold-400 text-3xl font-serif font-bold italic select-none">
                Æ
              </div>
              <h1 className="font-serif italic text-3xl md:text-4xl text-gold-100 drop-shadow tracking-wide">
                Aetheria
              </h1>
              <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">
                Tactile Digital Journal
              </p>
            </div>

            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent mx-auto" />

            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
              A private dark-mode space for tactile journal reflections, freehand annotations, and global collaboration.
            </p>

            {/* Login CTA */}
            <div className="pt-4 space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 text-neutral-900 font-sans font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                {/* Embedded SVG Google Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.17-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>

            {/* Footer lock indicator */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 font-mono tracking-wider pt-2 select-none">
              <ShieldCheck size={12} className="text-gold-500/60" />
              <span>{isFirebaseEnabled ? 'SECURE GOOGLE AUTHENTICATION' : 'SECURE MOCK END-TO-END AUTH'}</span>
            </div>
          </div>
        ) : isLoggingIn ? (
          /* Loading State */
          <div className="py-12 space-y-6 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-gold-400 animate-spin" />
            <div className="space-y-2 text-center">
              <h3 className="font-serif italic text-lg text-gold-100">
                Signing you in...
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Connecting as {selectedAccount?.email}
              </p>
            </div>
          </div>
        ) : (
          /* Account Selector Modal/Panel */
          <div className="space-y-6 w-full text-left">
            <div>
              <h2 className="font-serif italic text-xl text-neutral-200">
                Choose an account
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                to continue to Aetheria Journal
              </p>
            </div>

            <div className="w-full h-[1px] bg-oled-700" />

            {!isCustomMode ? (
              /* Preset Accounts */
              <div className="space-y-3">
                {MOCK_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full flex items-center gap-3 p-3 bg-oled-900/60 hover:bg-oled-800/80 border border-oled-700/60 rounded-xl transition-all duration-150 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold-950/20 text-gold-300 border border-gold-950/40 flex items-center justify-center font-semibold text-sm group-hover:scale-105 transition-transform font-mono">
                      {acc.avatar}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono truncate">
                        {acc.email}
                      </p>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => setIsCustomMode(true)}
                  className="w-full py-2.5 text-center text-xs text-gold-450 hover:text-gold-300 font-mono transition-colors"
                >
                  + Use another account
                </button>
              </div>
            ) : (
              /* Custom Account Entry Form */
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-mono uppercase font-semibold">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Clara Oswald"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-oled-900 border border-oled-700 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-mono uppercase font-semibold">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="clara@example.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full bg-oled-900 border border-oled-700 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCustomMode(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            )}

            {!isCustomMode && (
              <button
                onClick={() => setShowAccountSelector(false)}
                className="w-full py-2.5 text-center text-xs text-neutral-500 hover:text-neutral-350 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
