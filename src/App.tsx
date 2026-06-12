import React from 'react';
import { JournalProvider, useJournal } from './context/JournalContext';
import { LibraryGrid } from './components/library/LibraryGrid';
import { BookView } from './components/book/BookView';
import { RemindersPanel } from './components/sidebar/RemindersPanel';
import { GoogleAuthPage } from './components/auth/GoogleAuthPage';
import { Bell, BellOff } from 'lucide-react';

// Inner app shell that has access to JournalContext
const AppContent: React.FC = () => {
  const { user, currentBookId, sidebarOpen, setSidebarOpen, reminders, appTheme } = useJournal();

  // Count uncompleted reminders
  const activeRemindersCount = reminders.filter(r => !r.completed).length;

  if (user === null) {
    return <GoogleAuthPage />;
  }

  const isLight = appTheme === 'light';

  return (
    <div className={`min-h-screen relative overflow-x-hidden font-sans transition-colors duration-300 ${
      isLight ? 'bg-[#f5f2eb] text-stone-800' : 'bg-oled-950 text-neutral-200'
    }`}>
      
      {/* Dynamic View Router */}
      {currentBookId === null ? (
        <LibraryGrid />
      ) : (
        <BookView />
      )}

      {/* Slide-out Reminders Sidebar Panel */}
      <RemindersPanel />

      {/* Global Floating Reminders Toggle Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-2xl relative transition-all duration-300 active:scale-95 ${
            sidebarOpen
              ? isLight
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-700 text-white scale-105'
                : 'bg-gold-500 hover:bg-gold-400 border-neutral-900 text-neutral-950 scale-105'
              : isLight
                ? 'bg-white hover:bg-stone-50 border-stone-300 text-amber-700 hover:text-amber-800 hover:scale-105 shadow-md'
                : 'bg-oled-800 hover:bg-oled-700 border-oled-600 text-gold-300 hover:text-gold-200 hover:scale-105'
          }`}
          title="Open Deadlines & Reminders"
        >
          {sidebarOpen ? <BellOff size={18} /> : <Bell size={18} className="animate-wiggle" />}
          
          {/* Uncompleted Reminders Count Badge */}
          {activeRemindersCount > 0 && !sidebarOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border border-oled-950 text-[10px] text-white rounded-full flex items-center justify-center font-bold font-mono shadow">
              {activeRemindersCount}
            </span>
          )}
        </button>
      </div>

      {/* Global Background ambient glow for premium look */}
      <div className={`fixed top-[-20%] left-[-10%] w-[50vw] h-[50vh] rounded-full blur-[120px] pointer-events-none z-[-1] transition-colors duration-300 ${
        isLight ? 'bg-gold-600/5' : 'bg-gold-950/5'
      }`} />
      <div className={`fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vh] rounded-full blur-[120px] pointer-events-none z-[-1] transition-colors duration-300 ${
        isLight ? 'bg-blue-600/5' : 'bg-blue-950/5'
      }`} />
    </div>
  );
};

function App() {
  return (
    <JournalProvider>
      <AppContent />
    </JournalProvider>
  );
}

export default App;
