export type Role = 'reader' | 'admin';

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: Role;
  avatar: string;
  bio: string;
  joinedDate: string;
  streakDays: number;
  booksFinished: number;
  pagesRead: number;
  followersCount: number;
  followingCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface BookChapter {
  id: string;
  title: string;
  content: string; // HTML or Markdown format for reader
  readTimeMinutes: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  categoryName: string;
  description: string;
  coverUrl: string;
  language: string;
  publishedYear: number;
  pages: number;
  totalCopies: number;
  availableCopies: number;
  rating: number;
  ratingCount: number;
  borrowCount: number;
  chapters: BookChapter[];
  epubStorageKey?: string;
  createdAt: string;
  featured?: boolean;
}

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'active' | 'returned' | 'overdue';
  progressPercentage: number;
  lastChapterId?: string;
  lastLocationCfi?: string;
  extensionsCount: number;
}

export interface BookRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  author: string;
  reason: string;
  status: 'diajukan' | 'ditinjau' | 'disetujui' | 'ditolak';
  upvotes: number;
  upvotedBy: string[]; // userIds
  createdAt: string;
  adminNote?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  bookId: string;
  bookTitle: string;
  rating: number; // 1-5
  comment: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  flagged?: boolean;
}

export interface CustomShelf {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  bookIds: string[];
  createdAt: string;
}

export interface SystemSettings {
  maxBorrowPerUser: number;
  borrowDurationDays: number;
  reminderDaysBeforeDue: number;
  allowExtendLoan: boolean;
  maxExtendDays: number;
}

export interface SocialActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  actionType: 'started_reading' | 'finished_reading' | 'rated_book' | 'added_wishlist' | 'created_shelf' | 'admin_uploaded';
  bookId?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: string;
  rating?: number;
  reviewComment?: string;
  shelfName?: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  details?: string;
}

export interface ReadingHighlight {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  chapterTitle: string;
  quote: string;
  note?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'loan_due_soon' | 'loan_auto_returned' | 'request_approved' | 'new_book_alert' | 'social_follow' | 'review_liked';
  title: string;
  message: string;
  bookId?: string;
  createdAt: string;
  read: boolean;
}
