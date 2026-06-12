import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, isFirebaseEnabled } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Type definitions
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface PlacedImage {
  id: string;
  src: string;
  x: number; // percentage (0-100) or absolute
  y: number; // percentage (0-100) or absolute
  w: number; // px
  h: number; // px
}

export interface PageData {
  id: string;
  date: string; // "YYYY-MM-DD"
  templateType: 'daily' | 'blank';
  todos: TodoItem[];
  notes: string; // HTML content from rich text editor
  p1: string; // Priority 1 text
  p2: string; // Priority 2 text
  p3: string; // Priority 3 text
  mood: string; // Emoji representing mood
  score: number; // 0-10 rating
  drawings: string[]; // Serialized base64 drawing layers or canvas operations
  images: PlacedImage[]; // Placed resizable/draggable images
}

export interface Collaborator {
  email: string;
  role: 'view' | 'edit';
}

export interface BookData {
  id: string;
  title: string;
  coverColor: string; // Hex color or Tailwind class name
  coverEmoji: string; // Single emoji character
  coverImage?: string; // Base64 data url
  sharedWith: Collaborator[];
  pages: PageData[];
  createdAt: string;
}

export interface UserData {
  name: string;
  email: string;
  avatar: string;
}

export interface ReminderItem {
  id: string;
  text: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
}

interface JournalContextType {
  books: BookData[];
  currentBookId: string | null;
  currentPageIndex: number;
  reminders: ReminderItem[];
  searchQuery: string;
  sidebarOpen: boolean;
  
  // Auth state
  user: UserData | null;
  login: (name: string, email: string, avatar: string) => void;
  logout: () => void;

  // Page theme state
  pageTheme: 'dark' | 'beige';
  togglePageTheme: () => void;

  // App theme state
  appTheme: 'dark' | 'light';
  toggleAppTheme: () => void;
  
  // Book actions
  addBook: (title: string, color: string, emoji: string, coverImage?: string) => void;
  deleteBook: (id: string) => void;
  updateBookCover: (id: string, title: string, color: string, emoji: string, coverImage?: string) => void;
  shareBook: (id: string, email: string, role: 'view' | 'edit') => void;
  unshareBook: (id: string, email: string) => void;
  
  // Page navigation & actions
  selectBook: (id: string | null) => void;
  setCurrentPageIndex: (index: number) => void;
  addPage: (bookId: string, templateType?: 'daily' | 'blank') => void;
  deletePage: (bookId: string, pageId: string) => void;
  updatePage: (bookId: string, pageId: string, updates: Partial<PageData>) => void;
  duplicatePage: (bookId: string, pageId: string) => void;
  
  // Reminders actions
  addReminder: (text: string, date: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  
  // Utilities
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

// Helper to get today's date formatted as YYYY-MM-DD
export const getFormattedDate = (dateOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dateOffset);
  return d.toISOString().split('T')[0];
};

// Helper to check if a string matches YYYY-MM-DD
const isIsoDateString = (str: string) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
};

// Helper to format raw YYYY-MM-DD to human-readable date
const formatInitialDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to recursively remove undefined values from objects/arrays for Firestore compatibility
const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
        sanitized[key] = sanitizeForFirestore(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

// Create a blank daily template page
const createEmptyPage = (dateString: string, templateType: 'daily' | 'blank' = 'daily'): PageData => {
  return {
    id: `page-${Math.random().toString(36).substring(2, 9)}`,
    date: formatInitialDate(dateString),
    templateType,
    todos: [
      { id: `todo-${Math.random().toString(36).substring(2, 9)}`, text: 'Review today\'s goals', completed: false }
    ],
    notes: '<div>Write your thoughts here...</div>',
    p1: '',
    p2: '',
    p3: '',
    mood: '✨',
    score: 8,
    drawings: [],
    images: []
  };
};

const DEFAULT_BOOKS: BookData[] = [
  {
    id: 'book-1',
    title: 'Personal Reflections',
    coverColor: '#2d1b10', // Rich Leather Brown
    coverEmoji: '🕯️',
    createdAt: new Date().toISOString(),
    sharedWith: [
      { email: 'colleague@aetheria.io', role: 'edit' },
      { email: 'mentor@aetheria.io', role: 'view' }
    ],
    pages: [
      {
        id: 'page-1-1',
        date: getFormattedDate(-1), // Yesterday
        templateType: 'daily',
        todos: [
          { id: 'todo-1', text: 'Draft implementation plan', completed: true },
          { id: 'todo-2', text: 'Refine UI design elements', completed: true },
          { id: 'todo-3', text: 'Take structured breaks', completed: false }
        ],
        notes: '<h2>Reflecting on Progress</h2><p>Today was an extremely productive day. I managed to finalize the architecture of the new dark-mode journal. The <strong>skeuomorphic design</strong> elements are coming together beautifully. Tomorrow, I\'ll focus on the HTML5 Canvas drawing integration.</p><blockquote>Keep pushing the boundaries of aesthetics in design.</blockquote>',
        p1: 'Finish the layout structure',
        p2: 'Implement Tailwind config extensions',
        p3: 'Synthesize paper sound effect',
        mood: '🔥',
        score: 9,
        drawings: [],
        images: []
      },
      {
        id: 'page-1-2',
        date: getFormattedDate(0), // Today
        templateType: 'daily',
        todos: [
          { id: 'todo-4', text: 'Initialize Vite React project', completed: true },
          { id: 'todo-5', text: 'Implement global state context', completed: true },
          { id: 'todo-6', text: 'Build responsive A4 container', completed: false },
          { id: 'todo-7', text: 'Add interactive drawing layer', completed: false }
        ],
        notes: '<h2>Aetheria React Build</h2><p>The core framework is running. Using <i>Tailwind v3</i> as the CSS core, alongside Framer Motion for premium 3D page turn animations. The Canvas layer needs to overlay exactly on top of the text to feel like handwriting on paper.</p><p>Need to explore <b>Fountain Pen</b> stroke math using variable thickness calculations based on pointer move velocities.</p>',
        p1: 'Complete Page 1 & 2 requirements',
        p2: 'Create drawing overlays',
        p3: 'Implement PNG/PDF export mechanism',
        mood: '⚡',
        score: 8,
        drawings: [],
        images: []
      }
    ]
  },
  {
    id: 'book-2',
    title: 'Project Ideas & Sketches',
    coverColor: '#122c1e', // Dark Forest Green Leather
    coverEmoji: '🎨',
    createdAt: new Date().toISOString(),
    sharedWith: [],
    pages: [
      {
        id: 'page-2-1',
        date: getFormattedDate(0),
        templateType: 'blank',
        todos: [],
        notes: '<h2>Sketch Canvas</h2><p>This is a blank A4 sheet for freeform sketches, drawing designs, brainstorming wireframes, and dropping references.</p>',
        p1: '',
        p2: '',
        p3: '',
        mood: '💡',
        score: 10,
        drawings: [],
        images: []
      }
    ]
  }
];

const DEFAULT_REMINDERS: ReminderItem[] = [
  { id: 'rem-1', text: 'Review journal layout code', date: getFormattedDate(1), completed: false },
  { id: 'rem-2', text: 'Test drawing canvas latency', date: getFormattedDate(2), completed: false },
  { id: 'rem-3', text: 'Finalize PDF export library', date: getFormattedDate(3), completed: true }
];

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, _setBooks] = useState<BookData[]>(() => {
    const saved = localStorage.getItem('aetheria_journals');
    const initialBooks: BookData[] = saved ? JSON.parse(saved) : DEFAULT_BOOKS;
    
    // Auto-migrate old ISO date strings to human-readable format on initial load
    return initialBooks.map(book => ({
      ...book,
      pages: book.pages.map(page => {
        if (isIsoDateString(page.date)) {
          return { ...page, date: formatInitialDate(page.date) };
        }
        return page;
      })
    }));
  });

  const [reminders, _setReminders] = useState<ReminderItem[]>(() => {
    const saved = localStorage.getItem('aetheria_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  });

  const setBooks = (newBooks: BookData[] | ((prev: BookData[]) => BookData[])) => {
    _setBooks(prev => {
      const resolved = typeof newBooks === 'function' ? newBooks(prev) : newBooks;
      if (isFirebaseEnabled && db && user && user.email) {
        const userRef = doc(db, 'users', user.email.toLowerCase());
        const sanitized = sanitizeForFirestore(resolved);
        setTimeout(() => {
          setDoc(userRef, { books: sanitized }, { merge: true }).catch(err => {
            console.error('Error syncing books to Firestore:', err);
          });
        }, 0);
      }
      return resolved;
    });
  };

  const setReminders = (newReminders: ReminderItem[] | ((prev: ReminderItem[]) => ReminderItem[])) => {
    _setReminders(prev => {
      const resolved = typeof newReminders === 'function' ? newReminders(prev) : newReminders;
      if (isFirebaseEnabled && db && user && user.email) {
        const userRef = doc(db, 'users', user.email.toLowerCase());
        const sanitized = sanitizeForFirestore(resolved);
        setTimeout(() => {
          setDoc(userRef, { reminders: sanitized }, { merge: true }).catch(err => {
            console.error('Error syncing reminders to Firestore:', err);
          });
        }, 0);
      }
      return resolved;
    });
  };



  const [user, setUser] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('aetheria_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [pageTheme, setPageTheme] = useState<'dark' | 'beige'>(() => {
    const saved = localStorage.getItem('aetheria_page_theme');
    return (saved === 'beige') ? 'beige' : 'dark';
  });

  const [appTheme, setAppTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aetheria_app_theme');
    return (saved === 'light') ? 'light' : 'dark';
  });

  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('aetheria_journals', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('aetheria_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Firestore real-time listener
  useEffect(() => {
    if (!isFirebaseEnabled || !db || !user || !user.email) return;

    const userRef = doc(db, 'users', user.email.toLowerCase());
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.books) {
          _setBooks(data.books);
        }
        if (data.reminders) {
          _setReminders(data.reminders);
        }
      } else {
        // Document doesn't exist, seed it with the current local books and reminders
        try {
          await setDoc(userRef, {
            books: sanitizeForFirestore(books),
            reminders: sanitizeForFirestore(reminders),
            lastUpdated: new Date().toISOString()
          });
        } catch (err) {
          console.error('Error seeding user data to Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const login = (name: string, email: string, avatar: string) => {
    const userData = { name, email, avatar };
    setUser(userData);
    localStorage.setItem('aetheria_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aetheria_user');
    setCurrentBookId(null);
    _setBooks(DEFAULT_BOOKS);
    _setReminders(DEFAULT_REMINDERS);
  };


  const togglePageTheme = () => {
    setPageTheme(prev => {
      const nextTheme = prev === 'dark' ? 'beige' : 'dark';
      localStorage.setItem('aetheria_page_theme', nextTheme);
      return nextTheme;
    });
  };

  const toggleAppTheme = () => {
    setAppTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aetheria_app_theme', nextTheme);
      return nextTheme;
    });
  };

  // Book action implementations
  const addBook = (title: string, color: string, emoji: string, coverImage?: string) => {
    const newBook: BookData = {
      id: `book-${Math.random().toString(36).substring(2, 9)}`,
      title,
      coverColor: color,
      coverEmoji: emoji,
      coverImage,
      sharedWith: [],
      pages: [createEmptyPage(getFormattedDate(0))], // Start with a page for today
      createdAt: new Date().toISOString()
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    if (currentBookId === id) {
      setCurrentBookId(null);
      setCurrentPageIndex(0);
    }
  };

  const updateBookCover = (id: string, title: string, color: string, emoji: string, coverImage?: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        return { ...book, title, coverColor: color, coverEmoji: emoji, coverImage };
      }
      return book;
    }));
  };

  const shareBook = (id: string, email: string, role: 'view' | 'edit') => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        // Prevent duplicate share entries
        const filtered = book.sharedWith.filter(c => c.email !== email);
        return {
          ...book,
          sharedWith: [...filtered, { email, role }]
        };
      }
      return book;
    }));
  };

  const unshareBook = (id: string, email: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        return {
          ...book,
          sharedWith: book.sharedWith.filter(c => c.email !== email)
        };
      }
      return book;
    }));
  };

  // Page action implementations
  const selectBook = (id: string | null) => {
    setCurrentBookId(id);
    setCurrentPageIndex(0);
  };

  const addPage = (bookId: string, templateType: 'daily' | 'blank' = 'daily') => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        // Find next date based on the last page's date or today
        let nextDateStr = getFormattedDate(0);
        if (book.pages.length > 0) {
          const lastPage = book.pages[book.pages.length - 1];
          const lastPageDate = new Date(lastPage.date);
          if (!isNaN(lastPageDate.getTime())) {
            lastPageDate.setDate(lastPageDate.getDate() + 1);
            nextDateStr = lastPageDate.toISOString().split('T')[0];
          }
        }
        
        const newPage = createEmptyPage(nextDateStr, templateType);
        const updatedPages = [...book.pages, newPage];
        
        // Auto navigate to the new page
        setTimeout(() => {
          setCurrentPageIndex(updatedPages.length - 1);
        }, 50);

        return { ...book, pages: updatedPages };
      }
      return book;
    }));
  };

  const deletePage = (bookId: string, pageId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        // Must contain at least one page
        if (book.pages.length <= 1) return book;
        
        const filtered = book.pages.filter(p => p.id !== pageId);
        
        // Adjust page index if out of bounds after deletion
        if (currentPageIndex >= filtered.length) {
          setCurrentPageIndex(filtered.length - 1);
        }
        
        return { ...book, pages: filtered };
      }
      return book;
    }));
  };

  const updatePage = (bookId: string, pageId: string, updates: Partial<PageData>) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const updatedPages = book.pages.map(page => {
          if (page.id === pageId) {
            return { ...page, ...updates };
          }
          return page;
        });
        return { ...book, pages: updatedPages };
      }
      return book;
    }));
  };

  const duplicatePage = (bookId: string, pageId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId) {
        const pageToDuplicate = book.pages.find(p => p.id === pageId);
        if (!pageToDuplicate) return book;

        const duplicatedPage: PageData = {
          ...pageToDuplicate,
          id: `page-${Math.random().toString(36).substring(2, 9)}`,
          todos: pageToDuplicate.todos.map(t => ({ ...t, id: `todo-${Math.random().toString(36).substring(2, 9)}` })),
          drawings: [...pageToDuplicate.drawings],
          images: pageToDuplicate.images.map(img => ({ ...img, id: `img-${Math.random().toString(36).substring(2, 9)}` })),
          date: pageToDuplicate.date
        };

        const pageIndex = book.pages.findIndex(p => p.id === pageId);
        const updatedPages = [...book.pages];
        updatedPages.splice(pageIndex + 1, 0, duplicatedPage);

        setTimeout(() => {
          setCurrentPageIndex(pageIndex + 1);
        }, 50);

        return { ...book, pages: updatedPages };
      }
      return book;
    }));
  };

  // Reminders actions
  const addReminder = (text: string, date: string) => {
    const newReminder: ReminderItem = {
      id: `rem-${Math.random().toString(36).substring(2, 9)}`,
      text,
      date: date || getFormattedDate(0),
      completed: false
    };
    setReminders(prev => [newReminder, ...prev]);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(rem => {
      if (rem.id === id) {
        return { ...rem, completed: !rem.completed };
      }
      return rem;
    }));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(rem => rem.id !== id));
  };

  return (
    <JournalContext.Provider value={{
      books,
      currentBookId,
      currentPageIndex,
      reminders,
      searchQuery,
      sidebarOpen,
      
      user,
      login,
      logout,
      pageTheme,
      togglePageTheme,
      appTheme,
      toggleAppTheme,
      
      addBook,
      deleteBook,
      updateBookCover,
      shareBook,
      unshareBook,
      
      selectBook,
      setCurrentPageIndex,
      addPage,
      deletePage,
      updatePage,
      duplicatePage,
      
      addReminder,
      toggleReminder,
      deleteReminder,
      
      setSearchQuery,
      setSidebarOpen
    }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
