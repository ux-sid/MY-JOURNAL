import React, { useRef, useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import type { PageData, TodoItem } from '../../context/JournalContext';
import { Bold, Italic, List, Quote, CheckSquare, Square } from 'lucide-react';

interface DailyTemplateProps {
  page: PageData;
  onUpdate: (updates: Partial<PageData>) => void;
  isReadOnly?: boolean;
}

export const DailyTemplate: React.FC<DailyTemplateProps> = ({
  page,
  onUpdate,
  isReadOnly = false
}) => {
  const { pageTheme } = useJournal();
  const editorRef = useRef<HTMLDivElement>(null);
  
  // --- Checklist (Todos) Handlers ---
  const handleTodoChange = (todoId: string, text: string) => {
    const updated = page.todos.map(t => t.id === todoId ? { ...t, text } : t);
    onUpdate({ todos: updated });
  };

  const handleTodoToggle = (todoId: string) => {
    const updated = page.todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t);
    onUpdate({ todos: updated });
  };

  const handleTodoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, todoId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTodo: TodoItem = {
        id: `todo-${Math.random().toString(36).substring(2, 9)}`,
        text: '',
        completed: false
      };
      const updated = [...page.todos];
      updated.splice(index + 1, 0, newTodo);
      onUpdate({ todos: updated });

      setTimeout(() => {
        const inputs = document.querySelectorAll('.todo-input');
        const nextInput = inputs[index + 1] as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }, 20);
    } else if (e.key === 'Backspace' && page.todos[index].text === '') {
      e.preventDefault();
      if (page.todos.length > 1) {
        const updated = page.todos.filter(t => t.id !== todoId);
        onUpdate({ todos: updated });
        
        setTimeout(() => {
          const inputs = document.querySelectorAll('.todo-input');
          const prevInput = inputs[index - 1] as HTMLInputElement;
          if (prevInput) {
            prevInput.focus();
            const len = prevInput.value.length;
            prevInput.setSelectionRange(len, len);
          }
        }, 20);
      }
    }
  };

  // --- ContentEditable Rich Text Handlers ---
  const handleEditorInput = () => {
    if (editorRef.current) {
      onUpdate({ notes: editorRef.current.innerHTML });
    }
  };

  const execCommand = (command: string, value = '') => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // Synchronize initial content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== page.notes) {
      editorRef.current.innerHTML = page.notes;
    }
  }, [page.id]);

  // --- Theme Classes Definitions ---
  const isBeige = pageTheme === 'beige';
  const textColor = isBeige ? 'text-stone-800' : 'text-neutral-200';
  const subtextColor = isBeige ? 'text-stone-600' : 'text-neutral-400';
  const headerDateColor = isBeige ? 'text-amber-900 font-bold' : 'text-gold-100 font-semibold';
  const labelColor = isBeige ? 'text-amber-900 font-bold' : 'text-gold-300 font-semibold';
  const borderSepiaClass = isBeige ? 'border-amber-900/15' : 'border-gold-950/20';
  const borderCardClass = isBeige ? 'border-amber-950/15' : 'border-oled-700';
  
  const widgetBg = isBeige ? 'bg-amber-950/5 border-amber-900/15' : 'bg-oled-900/50 border-oled-700/60';
  const widgetLabel = isBeige ? 'text-amber-900 font-bold' : 'text-gold-400/80';
  const widgetInput = isBeige ? 'text-stone-800 placeholder-stone-400' : 'text-neutral-200 placeholder-neutral-700';
  
  const editorTextClass = isBeige ? 'text-stone-800' : 'text-neutral-300';
  const formatButtonHover = isBeige ? 'hover:bg-amber-950/10 hover:text-stone-900' : 'hover:bg-oled-700 hover:text-neutral-200';
  const formatButtonColor = isBeige ? 'text-stone-600 hover:text-stone-900' : 'text-neutral-400 hover:text-neutral-200';

  return (
    <div className={`w-full h-[640px] md:h-full flex flex-col justify-between p-6 md:p-10 font-sans ${textColor} select-text`}>
      
      {/* 1. Date Header (Text Editable on Click/Focus) */}
      <div className={`flex flex-col items-start text-left pb-3 border-b ${borderSepiaClass} flex-shrink-0 relative group/date-header`}>
        {!isReadOnly ? (
          <input
            type="text"
            value={page.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className={`bg-transparent font-serif italic text-xl md:text-3xl ${headerDateColor} placeholder-neutral-500 focus:outline-none w-full border-none p-0 focus:ring-0`}
            placeholder="Date / Header..."
          />
        ) : (
          <h2 className={`font-serif italic text-xl md:text-3xl ${headerDateColor} drop-shadow`}>
            {page.date}
          </h2>
        )}
        <div className="w-32 h-[1px] bg-gradient-to-r from-gold-500/40 to-transparent mt-1.5" />
      </div>

      {/* 2. Scrollable Body Content wrapper on mobile, normal layouts on desktop */}
      <div className="flex-1 overflow-y-auto md:overflow-visible style-scrollbar pr-1 flex flex-col justify-between">
        
        {/* Body Split Grid */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 md:flex-1 my-4 md:my-6 items-stretch">
          
          {/* Left Column - Todos (Checklist) */}
          <div className={`md:col-span-5 flex flex-col space-y-4 md:border-r ${borderSepiaClass} md:pr-4`}>
            <div className={`flex items-center justify-between pb-1 border-b ${borderCardClass}`}>
              <span className={`font-serif italic text-sm ${labelColor} tracking-wide`}>
                Today's Agenda (Todos)
              </span>
              <span className={`text-[10px] ${subtextColor} font-mono`}>
                Press Enter for new line
              </span>
            </div>

            <div className="md:flex-1 min-h-[140px] md:overflow-y-auto style-scrollbar space-y-2 pr-1">
              {page.todos.map((todo, idx) => (
                <div 
                  key={todo.id} 
                  className="flex items-center gap-2 group/todo py-0.5"
                >
                  <button
                    disabled={isReadOnly}
                    onClick={() => handleTodoToggle(todo.id)}
                    className={`${isBeige ? 'text-stone-500 hover:text-amber-800' : 'text-neutral-500 hover:text-gold-400'} transition-colors duration-150 flex-shrink-0`}
                  >
                    {todo.completed ? (
                      <CheckSquare size={16} className={isBeige ? 'text-amber-800' : 'text-gold-500'} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={todo.text}
                    onChange={(e) => handleTodoChange(todo.id, e.target.value)}
                    onKeyDown={(e) => handleTodoKeyDown(e, idx, todo.id)}
                    className={`todo-input w-full bg-transparent text-sm focus:outline-none placeholder-stone-500 transition-colors ${
                      todo.completed 
                        ? 'line-through text-stone-500/70' 
                        : `${isBeige ? 'text-stone-800 focus:text-black' : 'text-neutral-300 focus:text-neutral-100'}`
                    }`}
                    placeholder="Add a task..."
                  />
                </div>
              ))}
              
              {page.todos.length === 0 && (
                <button
                  onClick={() => onUpdate({ todos: [{ id: 'todo-init', text: '', completed: false }] })}
                  className={`text-xs italic transition-colors ${
                    isBeige ? 'text-stone-500 hover:text-stone-800' : 'text-neutral-500 hover:text-neutral-400'
                  }`}
                >
                  + Add checklist item
                </button>
              )}
            </div>
          </div>

          {/* Mobile-only Divider */}
          <div className={`w-full h-[1px] bg-gold-950/10 my-2 md:hidden ${borderSepiaClass}`} />

          {/* Right Column - Notes & Rich Text Editor */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            {/* Rich Editor Title & Format Controls */}
            <div className={`flex items-center justify-between pb-1 border-b ${borderCardClass}`}>
              <span className={`font-serif italic text-sm ${labelColor} tracking-wide`}>
                Notes & Learnings
              </span>
              
              {/* Editor formatting toolbar */}
              {!isReadOnly && (
                <div className={`flex items-center gap-1.5 ${isBeige ? 'bg-amber-950/5 border-amber-900/20' : 'bg-oled-800/80 border-oled-600'} px-2 py-0.5 rounded border shadow-sm`}>
                  <button 
                    onClick={() => execCommand('bold')}
                    className={`p-1 rounded transition-colors ${formatButtonColor} ${formatButtonHover}`}
                    title="Bold"
                  >
                    <Bold size={12} />
                  </button>
                  <button 
                    onClick={() => execCommand('italic')}
                    className={`p-1 rounded transition-colors ${formatButtonColor} ${formatButtonHover}`}
                    title="Italic"
                  >
                    <Italic size={12} />
                  </button>
                  <button 
                    onClick={() => execCommand('formatBlock', '<h2>')}
                    className={`p-1 rounded transition-colors font-serif font-bold text-[10px] ${formatButtonColor} ${formatButtonHover}`}
                    title="Header"
                  >
                    H2
                  </button>
                  <button 
                    onClick={() => execCommand('insertUnorderedList')}
                    className={`p-1 rounded transition-colors ${formatButtonColor} ${formatButtonHover}`}
                    title="Bullet List"
                  >
                    <List size={12} />
                  </button>
                  <button 
                    onClick={() => execCommand('formatBlock', '<blockquote>')}
                    className={`p-1 rounded transition-colors ${formatButtonColor} ${formatButtonHover}`}
                    title="Quote"
                  >
                    <Quote size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Notes ContentEditable Div */}
            <div className="md:flex-1 min-h-[160px] md:overflow-y-auto style-scrollbar pr-1">
              <div
                ref={editorRef}
                contentEditable={!isReadOnly}
                onInput={handleEditorInput}
                className={`rich-editor w-full min-h-[160px] bg-transparent text-sm ${editorTextClass} leading-relaxed font-sans focus:outline-none`}
                data-placeholder="Start typing your daily entry here..."
              />
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: Priorities, Mood, and Score rating */}
        <div className={`border-t ${borderSepiaClass} pt-4 mt-6 md:mt-auto space-y-3 flex-shrink-0`}>
          
          {/* Priorities Sub-row (P1 | P2 | P3) */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            
            {/* Priority 1 */}
            <div className={`flex flex-col rounded p-2 text-center shadow-inner border ${widgetBg}`}>
              <span className={`text-[10px] font-mono uppercase font-semibold ${widgetLabel}`}>Priority 1</span>
              <input
                type="text"
                disabled={isReadOnly}
                value={page.p1}
                onChange={(e) => onUpdate({ p1: e.target.value })}
                className={`w-full bg-transparent text-xs text-center focus:outline-none mt-1.5 ${widgetInput}`}
                placeholder="..."
              />
            </div>

            {/* Priority 2 */}
            <div className={`flex flex-col rounded p-2 text-center shadow-inner border ${widgetBg}`}>
              <span className={`text-[10px] font-mono uppercase font-semibold ${widgetLabel}`}>Priority 2</span>
              <input
                type="text"
                disabled={isReadOnly}
                value={page.p2}
                onChange={(e) => onUpdate({ p2: e.target.value })}
                className={`w-full bg-transparent text-xs text-center focus:outline-none mt-1.5 ${widgetInput}`}
                placeholder="..."
              />
            </div>

            {/* Priority 3 */}
            <div className={`flex flex-col rounded p-2 text-center shadow-inner border ${widgetBg}`}>
              <span className={`text-[10px] font-mono uppercase font-semibold ${widgetLabel}`}>Priority 3</span>
              <input
                type="text"
                disabled={isReadOnly}
                value={page.p3}
                onChange={(e) => onUpdate({ p3: e.target.value })}
                className={`w-full bg-transparent text-xs text-center focus:outline-none mt-1.5 ${widgetInput}`}
                placeholder="..."
              />
            </div>

            {/* Desktop Mood */}
            <div className={`hidden md:flex flex-col rounded p-2 text-center justify-center items-center shadow-inner border group/mood-select ${widgetBg}`}>
              <span className={`text-[10px] font-mono uppercase font-semibold select-none ${widgetLabel}`}>Mood</span>
              <select
                disabled={isReadOnly}
                value={page.mood}
                onChange={(e) => onUpdate({ mood: e.target.value })}
                className={`bg-transparent text-sm text-center focus:outline-none mt-1 w-full text-center flex justify-center items-center font-sans cursor-pointer ${widgetInput}`}
              >
                <option value="✨" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>✨ Fine</option>
                <option value="🔥" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>🔥 Excited</option>
                <option value="💡" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>💡 Creative</option>
                <option value="⚡" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>⚡ Energetic</option>
                <option value="🕯️" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>🕯️ Calm</option>
                <option value="☕" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>☕ Productive</option>
                <option value="🌧️" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>🌧️ Tired</option>
                <option value="🌱" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>🌱 Focused</option>
              </select>
            </div>

            {/* Desktop Score */}
            <div className={`hidden md:flex flex-col rounded p-2 text-center shadow-inner border ${widgetBg}`}>
              <span className={`text-[10px] font-mono uppercase font-semibold ${widgetLabel}`}>Score</span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <input
                  type="number"
                  min="0"
                  max="10"
                  disabled={isReadOnly}
                  value={page.score}
                  onChange={(e) => {
                    const val = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                    onUpdate({ score: val });
                  }}
                  className={`w-8 bg-transparent text-xs font-bold text-center focus:outline-none ${isBeige ? 'text-amber-900' : 'text-gold-300'}`}
                />
                <span className={`text-[9px] ${subtextColor} font-mono`}>/10</span>
              </div>
            </div>

          </div>

          {/* Mobile-Only Row: Mood | Score (stacked side-by-side below priorities) */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            
            {/* Mobile Mood */}
            <div className={`relative flex flex-col rounded p-2 text-center justify-center items-center shadow-inner border ${widgetBg}`}>
              <span className={`text-[10px] font-mono uppercase font-semibold select-none ${widgetLabel}`}>Mood</span>
              <select
                disabled={isReadOnly}
                value={page.mood}
                onChange={(e) => onUpdate({ mood: e.target.value })}
                className={`bg-transparent text-xs text-center focus:outline-none mt-1.5 w-full text-center flex justify-center items-center font-sans cursor-pointer ${widgetInput}`}
              >
                <option value="✨" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>✨ Fine</option>
                <option value="🔥" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>🔥 Excited</option>
                <option value="💡" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>💡 Creative</option>
                <option value="⚡" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>⚡ Energetic</option>
                <option value="🕯️" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>🕯️ Calm</option>
                <option value="☕" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>☕ Productive</option>
                <option value="🌧️" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>🌧️ Tired</option>
                <option value="🌱" className={isBeige ? 'bg-white text-stone-800' : 'bg-oled-900 text-neutral-200'}>🌱 Focused</option>
              </select>
            </div>

            {/* Mobile Score */}
            <div className={`flex flex-col rounded p-2 text-center shadow-inner border ${widgetBg}`}>
              <span className={`text-[10px] font-mono uppercase font-semibold ${widgetLabel}`}>Score</span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <input
                  type="number"
                  min="0"
                  max="10"
                  disabled={isReadOnly}
                  value={page.score}
                  onChange={(e) => {
                    const val = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                    onUpdate({ score: val });
                  }}
                  className={`w-8 bg-transparent text-xs font-bold text-center focus:outline-none ${isBeige ? 'text-amber-900' : 'text-gold-300'}`}
                />
                <span className={`text-[9px] ${subtextColor} font-mono`}>/10</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
