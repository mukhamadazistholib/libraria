import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Book,
  Category,
  User,
  Loan,
  BookRequest,
  Review,
  SystemSettings,
  SocialActivity,
  CustomShelf,
  ReadingHighlight,
  AppNotification
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_CATEGORIES,
  CURRENT_USER,
  ADMIN_USER,
  INITIAL_BOOK_REQUESTS,
  INITIAL_REVIEWS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_SOCIAL_ACTIVITIES,
  INITIAL_CUSTOM_SHELVES
} from '../data/mockData';

interface LibraryContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeRole: 'reader' | 'admin';
  switchRole: (role: 'reader' | 'admin') => void;
  books: Book[];
  categories: Category[];
  loans: Loan[];
  bookRequests: BookRequest[];
  reviews: Review[];
  systemSettings: SystemSettings;
  socialActivities: SocialActivity[];
  customShelves: CustomShelf[];
  wishlistBookIds: string[];
  readingHighlights: ReadingHighlight[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  
  // Book actions
  borrowBook: (bookId: string) => { success: boolean; message: string };
  returnBook: (loanId: string) => { success: boolean; message: string };
  extendLoan: (loanId: string) => { success: boolean; message: string };
  updateReadingProgress: (bookId: string, progress: number, chapterId?: string) => void;
  toggleWishlist: (bookId: string) => void;
  addHighlight: (bookId: string, chapterTitle: string, quote: string, note?: string) => void;
  
  // Review actions
  addReview: (bookId: string, rating: number, comment: string) => void;
  toggleLikeReview: (reviewId: string) => void;
  
  // Social & Requests
  toggleLikeActivity: (activityId: string) => void;
  createBookRequest: (title: string, author: string, reason: string) => void;
  toggleUpvoteRequest: (requestId: string) => void;
  toggleFollowUser: () => void;
  isFollowingActiveUser: boolean;
  createCustomShelf: (name: string, description: string, isPublic: boolean) => void;
  addBookToShelf: (shelfId: string, bookId: string) => void;
  
  // Admin actions
  adminAddBook: (newBook: Omit<Book, 'id' | 'createdAt' | 'availableCopies' | 'borrowCount' | 'rating' | 'ratingCount'>) => void;
  adminUpdateBookStock: (bookId: string, newTotalCopies: number) => void;
  adminDeleteBook: (bookId: string) => void;
  adminUpdateSystemSettings: (settings: Partial<SystemSettings>) => void;
  adminUpdateBookRequestStatus: (requestId: string, status: 'disetujui' | 'ditolak' | 'ditinjau', note?: string) => void;
  
  // Cron / Scheduler simulation
  runOverdueCronCheck: () => { processedCount: number; returnedBooks: string[]; logs: string[] };
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'libraria_v1_';

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`);
    if (saved === 'dark' || saved === 'light') return saved;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [activeRole, setActiveRole] = useState<'reader' | 'admin'>('reader');
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}books`);
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}loans`);
    if (saved) return JSON.parse(saved);
    // Initial active loan for current user
    const borrowedDate = new Date();
    borrowedDate.setDate(borrowedDate.getDate() - 12);
    const dueDate = new Date(borrowedDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    return [
      {
        id: 'loan-init-1',
        userId: CURRENT_USER.id,
        bookId: 'book-1', // Filosofi Teras
        borrowedAt: borrowedDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status: 'active',
        progressPercentage: 45,
        lastChapterId: 'chap-1-2',
        extensionsCount: 0
      }
    ];
  });

  const [bookRequests, setBookRequests] = useState<BookRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}requests`);
    return saved ? JSON.parse(saved) : INITIAL_BOOK_REQUESTS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reviews`);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [socialActivities, setSocialActivities] = useState<SocialActivity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
    return saved ? JSON.parse(saved) : INITIAL_SOCIAL_ACTIVITIES;
  });

  const [customShelves, setCustomShelves] = useState<CustomShelf[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}shelves`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_SHELVES;
  });

  const [wishlistBookIds, setWishlistBookIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}wishlist`);
    return saved ? JSON.parse(saved) : ['book-3', 'book-6'];
  });

  const [readingHighlights, setReadingHighlights] = useState<ReadingHighlight[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}highlights`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'hl-1',
        userId: CURRENT_USER.id,
        bookId: 'book-1',
        bookTitle: 'Filosofi Teras',
        chapterTitle: 'Bab 2: Dikotomi Kendali',
        quote: 'Fokuskan energimu hanya pada hal yang berada dalam kendalimu. Bila kamu sudah berusaha maksimal, terimalah apa pun hasil yang tiba dengan lapang dada (Amor Fati).',
        note: 'Pengingat penting untuk tidak overthinking tentang penilaian orang lain di kantor.',
        createdAt: '2024-02-18'
      }
    ];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      userId: CURRENT_USER.id,
      type: 'loan_due_soon',
      title: 'Peminjaman Jatuh Tempo H-18',
      message: 'Buku "Filosofi Teras" jatuh tempo dalam 18 hari lagi. Anda dapat memperpanjang bila diperlukan.',
      bookId: 'book-1',
      createdAt: 'Kemarin',
      read: false
    },
    {
      id: 'notif-2',
      userId: CURRENT_USER.id,
      type: 'review_liked',
      title: 'Ulasan Anda Disukai',
      message: 'Dewi Lestari K. menyukai ulasan Anda tentang "Filosofi Teras".',
      createdAt: '3 hari yang lalu',
      read: true
    }
  ]);

  const [isFollowingActiveUser, setIsFollowingActiveUser] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}books`, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}loans`, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}requests`, JSON.stringify(bookRequests));
  }, [bookRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reviews`, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}wishlist`, JSON.stringify(wishlistBookIds));
  }, [wishlistBookIds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}shelves`, JSON.stringify(customShelves));
  }, [customShelves]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}highlights`, JSON.stringify(readingHighlights));
  }, [readingHighlights]);

  const switchRole = (role: 'reader' | 'admin') => {
    setActiveRole(role);
    if (role === 'admin') {
      setCurrentUserState(ADMIN_USER);
    } else {
      setCurrentUserState(CURRENT_USER);
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(user));
  };

  // Borrow Book logic with validation & stock decrement
  const borrowBook = (bookId: string): { success: boolean; message: string } => {
    const book = books.find(b => b.id === bookId);
    if (!book) {
      return { success: false, message: 'Buku tidak ditemukan dalam katalog perpustakaan.' };
    }

    // 1. Check if user already has an active loan for this book
    const existingLoan = loans.find(l => l.userId === currentUser.id && l.bookId === bookId && l.status === 'active');
    if (existingLoan) {
      return { success: false, message: 'Anda sudah sedang meminjam buku ini. Buka rak Buku Saya untuk melanjutkan membaca.' };
    }

    // 2. Check user's active loan quota against systemSettings.maxBorrowPerUser
    const activeLoans = loans.filter(l => l.userId === currentUser.id && l.status === 'active');
    if (activeLoans.length >= systemSettings.maxBorrowPerUser) {
      return {
        success: false,
        message: `Batas kuota pinjam tercapai! Maksimal ${systemSettings.maxBorrowPerUser} buku aktif secara bersamaan.`
      };
    }

    // 3. Concurrency / Availability check
    if (book.availableCopies <= 0) {
      return {
        success: false,
        message: 'Seluruh eksemplar digital saat ini sedang dipinjam pembaca lain. Silakan klik tombol "Antre / Notify Me".'
      };
    }

    // Execute borrow transaction:
    // Update book copies
    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          availableCopies: Math.max(0, b.availableCopies - 1),
          borrowCount: b.borrowCount + 1
        };
      }
      return b;
    }));

    // Create new loan
    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + systemSettings.borrowDurationDays);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      userId: currentUser.id,
      bookId: book.id,
      borrowedAt: now.toISOString(),
      dueDate: due.toISOString(),
      status: 'active',
      progressPercentage: 0,
      extensionsCount: 0
    };

    setLoans(prev => [newLoan, ...prev]);

    // Create social activity in feed
    const activity: SocialActivity = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userHandle: currentUser.handle,
      actionType: 'started_reading',
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverUrl,
      timestamp: 'Baru saja',
      likes: 0,
      likedBy: []
    };
    setSocialActivities(prev => [activity, ...prev]);

    // Add notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      type: 'new_book_alert',
      title: 'Peminjaman Berhasil',
      message: `Buku "${book.title}" berhasil dipinjam selama ${systemSettings.borrowDurationDays} hari. Selamat membaca!`,
      bookId: book.id,
      createdAt: 'Baru saja',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: `Buku "${book.title}" berhasil dipinjam. Masa pinjam berlaku selama ${systemSettings.borrowDurationDays} hari.` };
  };

  // Return book manually
  const returnBook = (loanId: string): { success: boolean; message: string } => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return { success: false, message: 'Catatan peminjaman tidak ditemukan.' };

    const book = books.find(b => b.id === loan.bookId);

    // Update loan
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'returned',
          returnedAt: new Date().toISOString()
        };
      }
      return l;
    }));

    // Release copy back to available stock
    if (book) {
      setBooks(prev => prev.map(b => {
        if (b.id === book.id) {
          return {
            ...b,
            availableCopies: Math.min(b.totalCopies, b.availableCopies + 1)
          };
        }
        return b;
      }));
    }

    // Increment books finished if progress was high
    if (loan.progressPercentage >= 80) {
      setCurrentUserState(prev => ({
        ...prev,
        booksFinished: prev.booksFinished + 1
      }));
    }

    return { success: true, message: 'Buku berhasil dikembalikan. Slot peminjaman Anda telah diperbarui.' };
  };

  // Extend loan
  const extendLoan = (loanId: string): { success: boolean; message: string } => {
    if (!systemSettings.allowExtendLoan) {
      return { success: false, message: 'Perpanjangan masa pinjam saat ini dinonaktifkan oleh administrator perpustakaan.' };
    }

    const loan = loans.find(l => l.id === loanId);
    if (!loan) return { success: false, message: 'Data peminjaman tidak ditemukan.' };
    if (loan.extensionsCount >= 1) {
      return { success: false, message: 'Buku ini sudah pernah diperpanjang. Maksimal perpanjangan adalah 1 kali per masa pinjam.' };
    }

    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + systemSettings.maxExtendDays);

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          dueDate: currentDue.toISOString(),
          extensionsCount: l.extensionsCount + 1
        };
      }
      return l;
    }));

    return {
      success: true,
      message: `Masa pinjam berhasil diperpanjang +${systemSettings.maxExtendDays} hari. Tanggal baru: ${currentDue.toLocaleDateString('id-ID')}`
    };
  };

  // Update reading progress
  const updateReadingProgress = (bookId: string, progress: number, chapterId?: string) => {
    setLoans(prev => prev.map(l => {
      if (l.userId === currentUser.id && l.bookId === bookId && l.status === 'active') {
        return {
          ...l,
          progressPercentage: progress,
          lastChapterId: chapterId || l.lastChapterId
        };
      }
      return l;
    }));

    // If finished 100%, trigger social feed update
    if (progress === 100) {
      const book = books.find(b => b.id === bookId);
      if (book) {
        const activity: SocialActivity = {
          id: `act-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          userHandle: currentUser.handle,
          actionType: 'finished_reading',
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          bookCover: book.coverUrl,
          timestamp: 'Baru saja',
          likes: 0,
          likedBy: []
        };
        setSocialActivities(prev => [activity, ...prev]);
      }
    }
  };

  // Wishlist toggle
  const toggleWishlist = (bookId: string) => {
    setWishlistBookIds(prev => {
      const exists = prev.includes(bookId);
      if (exists) {
        return prev.filter(id => id !== bookId);
      } else {
        const book = books.find(b => b.id === bookId);
        if (book) {
          const activity: SocialActivity = {
            id: `act-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            userHandle: currentUser.handle,
            actionType: 'added_wishlist',
            bookId: book.id,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookCover: book.coverUrl,
            timestamp: 'Baru saja',
            likes: 0,
            likedBy: []
          };
          setSocialActivities(acts => [activity, ...acts]);
        }
        return [...prev, bookId];
      }
    });
  };

  // Add highlight/quote
  const addHighlight = (bookId: string, chapterTitle: string, quote: string, note?: string) => {
    const book = books.find(b => b.id === bookId);
    const newHighlight: ReadingHighlight = {
      id: `hl-${Date.now()}`,
      userId: currentUser.id,
      bookId,
      bookTitle: book?.title || 'Buku',
      chapterTitle,
      quote,
      note,
      createdAt: new Date().toISOString()
    };
    setReadingHighlights(prev => [newHighlight, ...prev]);
  };

  // Reviews
  const addReview = (bookId: string, rating: number, comment: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userHandle: currentUser.handle,
      bookId,
      bookTitle: book.title,
      rating,
      comment,
      likes: 0,
      likedBy: [],
      createdAt: 'Baru saja'
    };

    setReviews(prev => [newRev, ...prev]);

    // Recalculate book rating
    const existingBookReviews = reviews.filter(r => r.bookId === bookId);
    const newCount = existingBookReviews.length + 1;
    const newAvg = (existingBookReviews.reduce((acc, r) => acc + r.rating, 0) + rating) / newCount;

    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          rating: Number(newAvg.toFixed(1)),
          ratingCount: newCount
        };
      }
      return b;
    }));

    // Post to social feed
    const activity: SocialActivity = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userHandle: currentUser.handle,
      actionType: 'rated_book',
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverUrl,
      rating,
      reviewComment: comment,
      timestamp: 'Baru saja',
      likes: 0,
      likedBy: []
    };
    setSocialActivities(prev => [activity, ...prev]);
  };

  const toggleLikeReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        const hasLiked = r.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked
          ? r.likedBy.filter(id => id !== currentUser.id)
          : [...r.likedBy, currentUser.id];
        return {
          ...r,
          likes: newLikedBy.length,
          likedBy: newLikedBy
        };
      }
      return r;
    }));
  };

  const toggleLikeActivity = (activityId: string) => {
    setSocialActivities(prev => prev.map(a => {
      if (a.id === activityId) {
        const hasLiked = a.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked
          ? a.likedBy.filter(id => id !== currentUser.id)
          : [...a.likedBy, currentUser.id];
        return {
          ...a,
          likes: newLikedBy.length,
          likedBy: newLikedBy
        };
      }
      return a;
    }));
  };

  // Book Requests
  const createBookRequest = (title: string, author: string, reason: string) => {
    const newReq: BookRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      title,
      author,
      reason,
      status: 'diajukan',
      upvotes: 1,
      upvotedBy: [currentUser.id],
      createdAt: 'Baru saja'
    };
    setBookRequests(prev => [newReq, ...prev]);
  };

  const toggleUpvoteRequest = (requestId: string) => {
    setBookRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const hasUpvoted = req.upvotedBy.includes(currentUser.id);
        const newUpvotedBy = hasUpvoted
          ? req.upvotedBy.filter(id => id !== currentUser.id)
          : [...req.upvotedBy, currentUser.id];
        return {
          ...req,
          upvotes: newUpvotedBy.length,
          upvotedBy: newUpvotedBy
        };
      }
      return req;
    }));
  };

  const toggleFollowUser = () => {
    setIsFollowingActiveUser(prev => !prev);
    setCurrentUserState(u => ({
      ...u,
      followingCount: isFollowingActiveUser ? u.followingCount - 1 : u.followingCount + 1
    }));
  };

  // Custom Shelf
  const createCustomShelf = (name: string, description: string, isPublic: boolean) => {
    const newShelf: CustomShelf = {
      id: `shelf-${Date.now()}`,
      userId: currentUser.id,
      name,
      description,
      isPublic,
      bookIds: [],
      createdAt: new Date().toLocaleDateString('id-ID')
    };
    setCustomShelves(prev => [newShelf, ...prev]);
  };

  const addBookToShelf = (shelfId: string, bookId: string) => {
    setCustomShelves(prev => prev.map(s => {
      if (s.id === shelfId && !s.bookIds.includes(bookId)) {
        return {
          ...s,
          bookIds: [...s.bookIds, bookId]
        };
      }
      return s;
    }));
  };

  // Admin Actions
  const adminAddBook = (newBookData: Omit<Book, 'id' | 'createdAt' | 'availableCopies' | 'borrowCount' | 'rating' | 'ratingCount'>) => {
    const newBook: Book = {
      ...newBookData,
      id: `book-${Date.now()}`,
      availableCopies: newBookData.totalCopies,
      borrowCount: 0,
      rating: 5.0,
      ratingCount: 1,
      createdAt: new Date().toISOString()
    };
    setBooks(prev => [newBook, ...prev]);

    // Add activity to feed
    const activity: SocialActivity = {
      id: `act-${Date.now()}`,
      userId: ADMIN_USER.id,
      userName: ADMIN_USER.name,
      userAvatar: ADMIN_USER.avatar,
      userHandle: ADMIN_USER.handle,
      actionType: 'admin_uploaded',
      bookId: newBook.id,
      bookTitle: newBook.title,
      bookAuthor: newBook.author,
      bookCover: newBook.coverUrl,
      details: `Koleksi baru telah ditambahkan ke katalog digital: ${newBook.totalCopies} slot pinjam tersedia.`,
      timestamp: 'Baru saja',
      likes: 0,
      likedBy: []
    };
    setSocialActivities(prev => [activity, ...prev]);
  };

  const adminUpdateBookStock = (bookId: string, newTotalCopies: number) => {
    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        // active loans count
        const activeBorrowCount = loans.filter(l => l.bookId === bookId && l.status === 'active').length;
        const newAvailable = Math.max(0, newTotalCopies - activeBorrowCount);
        return {
          ...b,
          totalCopies: newTotalCopies,
          availableCopies: newAvailable
        };
      }
      return b;
    }));
  };

  const adminDeleteBook = (bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
  };

  const adminUpdateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const adminUpdateBookRequestStatus = (requestId: string, status: 'disetujui' | 'ditolak' | 'ditinjau', note?: string) => {
    setBookRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          adminNote: note || r.adminNote
        };
      }
      return r;
    }));
  };

  // Cron Job Simulation (Vercel Cron + QStash Auto-Return pipeline)
  const runOverdueCronCheck = (): { processedCount: number; returnedBooks: string[]; logs: string[] } => {
    const logs: string[] = [];
    logs.push(`[${new Date().toLocaleTimeString('id-ID')}] CRON INITIALIZED: Endpoint /api/cron/check-overdue-loans dipicu oleh Vercel Cron.`);
    
    const now = new Date();
    const returnedBookTitles: string[] = [];
    let processed = 0;

    // We check for any loans where dueDate < now and status === 'active'
    // To make it demonstrable, let's also detect if any loan has status 'overdue' or due date has passed
    const updatedLoans = loans.map(loan => {
      const isPastDue = new Date(loan.dueDate) < now;
      if (loan.status === 'active' && isPastDue) {
        processed++;
        const book = books.find(b => b.id === loan.bookId);
        const title = book?.title || loan.bookId;
        returnedBookTitles.push(title);
        logs.push(`[AUTO-RETURN] Peminjaman ${loan.id} untuk "${title}" (User ${loan.userId}) melewati jatuh tempo. Status diubah ke 'returned'.`);
        logs.push(`[QSTASH QUEUE] Mengirim webhook notifikasi pengembalian otomatis ke /api/notify -> Resend email gateway.`);
        
        return {
          ...loan,
          status: 'returned' as const,
          returnedAt: now.toISOString()
        };
      }
      return loan;
    });

    if (processed > 0) {
      setLoans(updatedLoans);

      // Release stock for returned books
      setBooks(prev => prev.map(book => {
        const returnedCount = returnedBookTitles.filter(t => t === book.title).length;
        if (returnedCount > 0) {
          return {
            ...book,
            availableCopies: Math.min(book.totalCopies, book.availableCopies + returnedCount)
          };
        }
        return book;
      }));

      // Create notification
      const notif: AppNotification = {
        id: `notif-cron-${Date.now()}`,
        userId: currentUser.id,
        type: 'loan_auto_returned',
        title: 'Pengembalian Otomatis (Auto-Return)',
        message: `${processed} buku yang melewati batas pinjam telah dikembalikan otomatis oleh sistem perpustakaan.`,
        createdAt: 'Baru saja',
        read: false
      };
      setNotifications(prev => [notif, ...prev]);

      logs.push(`[COMPLETED] Berhasil memproses ${processed} buku jatuh tempo. Slot stok telah dirilis ke publik.`);
    } else {
      logs.push(`[INFO] Semua peminjaman aktif masih dalam periode berlaku. Tidak ada pinjaman overdue yang perlu dikembalikan saat ini.`);
      logs.push(`[HEALTH CHECK] Status distributed locks di Upstash Redis: OK. Integritas data: 100%.`);
    }

    return { processedCount: processed, returnedBooks: returnedBookTitles, logs };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <LibraryContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        activeRole,
        switchRole,
        books,
        categories,
        loans,
        bookRequests,
        reviews,
        systemSettings,
        socialActivities,
        customShelves,
        wishlistBookIds,
        readingHighlights,
        notifications,
        unreadNotificationsCount,
        borrowBook,
        returnBook,
        extendLoan,
        updateReadingProgress,
        toggleWishlist,
        addHighlight,
        addReview,
        toggleLikeReview,
        toggleLikeActivity,
        createBookRequest,
        toggleUpvoteRequest,
        toggleFollowUser,
        isFollowingActiveUser,
        createCustomShelf,
        addBookToShelf,
        adminAddBook,
        adminUpdateBookStock,
        adminDeleteBook,
        adminUpdateSystemSettings,
        adminUpdateBookRequestStatus,
        runOverdueCronCheck,
        markNotificationAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
