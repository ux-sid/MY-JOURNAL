import React, { useState } from 'react';
import { useJournal, getFormattedDate } from '../../context/JournalContext';
import { Button, Input } from '../ui/CustomComponents';
import { Calendar, Trash2, CheckCircle, Circle, Plus, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const RemindersPanel: React.FC = () => {
  const { 
    reminders, 
    addReminder, 
    toggleReminder, 
    deleteReminder, 
    sidebarOpen, 
    setSidebarOpen,
    appTheme
  } = useJournal();

  const [text, setText] = useState('');
  const [date, setDate] = useState(getFormattedDate(0));

  const isLight = appTheme === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addReminder(text.trim(), date);
    setText('');
    setDate(getFormattedDate(0));
  };

  // Sort reminders: uncompleted first, then by date
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: sidebarOpen ? 0 : 320 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={`fixed top-0 right-0 h-full w-[300px] shadow-2xl z-40 flex flex-col justify-between border-l transition-colors duration-300 ${
        isLight
          ? 'bg-[#faf8f4] border-stone-300 text-stone-800'
          : 'bg-oled-800 border-l border-oled-600 text-neutral-200'
      }`}
    >
      {/* Panel Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isLight ? 'border-stone-200' : 'border-oled-700'
      }`}>
        <div className="flex items-center gap-2">
          <Clock size={16} className={isLight ? 'text-amber-700' : 'text-gold-400'} />
          <h3 className={`font-serif text-base font-bold ${isLight ? 'text-amber-900' : 'text-gold-200'}`}>Deadlines & Reminders</h3>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className={`p-1 rounded-full transition-colors ${
            isLight
              ? 'text-stone-400 hover:text-stone-900 hover:bg-stone-200'
              : 'text-neutral-500 hover:text-neutral-200 hover:bg-oled-700'
          }`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} className={`p-4 border-b space-y-3 transition-colors ${
        isLight ? 'border-stone-200 bg-stone-50/50' : 'border-oled-700 bg-oled-900/40'
      }`}>
        <div className="space-y-1">
          <label className={`text-[10px] uppercase font-mono tracking-wider ${isLight ? 'text-stone-600' : 'text-neutral-500'}`}>Reminder Text</label>
          <Input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="e.g., Code review deadline..."
            required
            className="text-xs"
          />
        </div>
        <div className="space-y-1">
          <label className={`text-[10px] uppercase font-mono tracking-wider ${isLight ? 'text-stone-600' : 'text-neutral-500'}`}>Due Date</label>
          <div className="relative">
            <Calendar className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${isLight ? 'text-stone-500' : 'text-neutral-500'}`} />
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="pl-9 text-xs py-1.5"
              required
            />
          </div>
        </div>
        <Button 
          variant="primary" 
          type="submit" 
          size="sm" 
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold"
        >
          <Plus size={12} />
          <span>Add Reminder</span>
        </Button>
      </form>

      {/* Reminders List */}
      <div className="flex-1 overflow-y-auto style-scrollbar p-4 space-y-3">
        {sortedReminders.length > 0 ? (
          sortedReminders.map((rem) => {
            const isOverdue = new Date(rem.date) < new Date(getFormattedDate(0)) && !rem.completed;
            return (
              <div 
                key={rem.id}
                className={`flex items-start justify-between p-2.5 rounded border transition-all ${
                  rem.completed 
                    ? isLight
                      ? 'bg-stone-100/50 border-stone-200/60 opacity-60'
                      : 'bg-oled-900/20 border-oled-700/50 opacity-55' 
                    : isOverdue
                      ? isLight
                        ? 'bg-red-50/70 border-red-200/80 text-red-800'
                        : 'bg-red-950/10 border-red-900/40'
                      : isLight
                        ? 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
                        : 'bg-oled-900 border-oled-700/80 hover:border-oled-600'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 pr-2">
                  {/* Complete toggle checkbox */}
                  <button
                    onClick={() => toggleReminder(rem.id)}
                    className="text-neutral-500 hover:text-gold-400 transition-colors mt-0.5"
                  >
                    {rem.completed ? (
                      <CheckCircle size={14} className={isLight ? 'text-amber-700' : 'text-gold-500'} />
                    ) : (
                      <Circle size={14} className={isLight ? 'text-stone-400' : 'text-neutral-500'} />
                    )}
                  </button>
                  
                  <div className="space-y-0.5">
                    <p className={`text-xs font-medium ${
                      rem.completed 
                        ? isLight 
                          ? 'line-through text-stone-400' 
                          : 'line-through text-neutral-500' 
                        : isLight 
                          ? 'text-stone-800' 
                          : 'text-neutral-200'
                    }`}>
                      {rem.text}
                    </p>
                    <p className={`text-[9px] font-mono flex items-center gap-1 ${
                      rem.completed 
                        ? isLight
                          ? 'text-stone-400'
                          : 'text-neutral-600' 
                        : isOverdue 
                          ? isLight
                            ? 'text-red-700 font-bold'
                            : 'text-red-400 font-bold' 
                          : isLight
                            ? 'text-stone-600'
                            : 'text-neutral-500'
                    }`}>
                      <Calendar size={8} />
                      <span>{rem.date}</span>
                      {isOverdue && <span className="uppercase text-[8px] font-bold">[Overdue]</span>}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteReminder(rem.id)}
                  className={`p-1 rounded transition-colors self-center ${
                    isLight
                      ? 'text-stone-400 hover:text-red-600 hover:bg-stone-100'
                      : 'text-neutral-500 hover:text-red-400 hover:bg-oled-800'
                  }`}
                  title="Remove reminder"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        ) : (
          <div className={`text-center py-12 text-xs italic space-y-1 ${
            isLight ? 'text-stone-600' : 'text-neutral-500'
          }`}>
            <p>No active reminders.</p>
            <p className={isLight ? 'text-stone-500' : 'text-neutral-600'}>Keep it up! Your schedule is clear.</p>
          </div>
        )}
      </div>

      <div className={`p-3 border-t text-center text-[10px] font-mono transition-colors ${
        isLight
          ? 'bg-stone-100 border-stone-200 text-stone-600'
          : 'bg-oled-900 border-oled-700 text-neutral-500'
      }`}>
        AETHERIA CO-LOG v1.0
      </div>
    </motion.div>
  );
};
