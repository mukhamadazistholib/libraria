import { supabase, isSupabaseConfigured } from './supabase';
import { Book, Category, Loan } from '../types';
import { INITIAL_BOOKS, INITIAL_CATEGORIES } from '../data/mockData';

export interface SeedResult {
  success: boolean;
  message: string;
  categoriesCount?: number;
  booksCount?: number;
  chaptersCount?: number;
}

/**
 * Memeriksa apakah tabel di Supabase sudah memiliki data buku
 */
export async function checkSupabaseHasData(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { count, error } = await supabase
      .from('Book')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('Gagal mengecek data buku di Supabase:', error.message);
      return false;
    }
    return (count ?? 0) > 0;
  } catch (err) {
    console.warn('Supabase check error:', err);
    return false;
  }
}

/**
 * Mengambil seluruh buku langsung dari database PostgreSQL Supabase
 */
export async function fetchBooksFromSupabase(): Promise<Book[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: booksData, error: booksError } = await supabase
      .from('Book')
      .select(`
        *,
        Category (
          id,
          name,
          slug
        ),
        BookChapter (
          id,
          title,
          content,
          readTimeMinutes,
          orderIndex
        )
      `)
      .order('title', { ascending: true });

    if (booksError || !booksData || booksData.length === 0) {
      if (booksError) console.warn('Supabase fetch books error:', booksError.message);
      return null;
    }

    // Format menjadi interface Book yang digunakan frontend
    const formattedBooks: Book[] = booksData.map((b: any) => {
      const chapters = (b.BookChapter || [])
        .sort((x: any, y: any) => (x.orderIndex ?? 0) - (y.orderIndex ?? 0))
        .map((c: any) => ({
          id: c.id,
          title: c.title,
          content: c.content,
          readTimeMinutes: c.readTimeMinutes || 5,
        }));

      return {
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        categoryId: b.categoryId,
        categoryName: b.Category?.name || 'Umum',
        description: b.description || '',
        coverUrl: b.coverUrl,
        language: b.language || 'Bahasa Indonesia',
        publishedYear: b.publishedYear || new Date().getFullYear(),
        pages: b.pages || 100,
        totalCopies: b.totalCopies ?? 3,
        availableCopies: b.availableCopies ?? 3,
        rating: b.rating ?? 5.0,
        ratingCount: b.ratingCount ?? 0,
        borrowCount: b.borrowCount ?? 0,
        epubStorageKey: b.epubStorageKey || undefined,
        featured: Boolean(b.featured),
        createdAt: b.createdAt || new Date().toISOString(),
        chapters: chapters.length > 0 ? chapters : [
          {
            id: `chap-${b.id}-1`,
            title: 'Bab 1: Pendahuluan',
            content: `<p>${b.description || 'Konten belum tersedia untuk buku ini.'}</p>`,
            readTimeMinutes: 5,
          }
        ],
      };
    });

    return formattedBooks;
  } catch (err) {
    console.error('Error saat mengambil buku dari Supabase:', err);
    return null;
  }
}

/**
 * Melakukan Seeding data katalog buku Libraria ke PostgreSQL Supabase
 */
export async function seedSupabaseDatabase(): Promise<SeedResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase Anon Key is not configured. Open the Sign In dialog to configure the Anon Key.',
    };
  }

  try {
    // 1. Insert Categories (except 'cat-all')
    const categoriesToInsert = INITIAL_CATEGORIES
      .filter(c => c.id !== 'cat-all')
      .map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }));

    const { error: catError } = await supabase
      .from('Category')
      .upsert(categoriesToInsert, { onConflict: 'id' });

    if (catError) {
      throw new Error(`Failed to save Categories: ${catError.message}`);
    }

    // 2. Insert Books
    const now = new Date().toISOString();
    const booksToInsert = INITIAL_BOOKS.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      description: b.description,
      coverUrl: b.coverUrl,
      language: b.language,
      publishedYear: b.publishedYear,
      pages: b.pages,
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
      rating: b.rating,
      ratingCount: b.ratingCount,
      borrowCount: b.borrowCount,
      epubStorageKey: b.epubStorageKey || `books/${b.id}/book.epub`,
      featured: Boolean(b.featured),
      categoryId: b.categoryId,
      createdAt: b.createdAt || now,
      updatedAt: now,
    }));

    const { error: bookError } = await supabase
      .from('Book')
      .upsert(booksToInsert, { onConflict: 'id' });

    if (bookError) {
      throw new Error(`Failed to save Books: ${bookError.message}`);
    }

    // 3. Insert Book Chapters (BookChapter)
    const allChapters: any[] = [];
    INITIAL_BOOKS.forEach(b => {
      if (b.chapters && b.chapters.length > 0) {
        b.chapters.forEach((ch, idx) => {
          allChapters.push({
            id: ch.id,
            bookId: b.id,
            title: ch.title,
            content: ch.content,
            readTimeMinutes: ch.readTimeMinutes,
            orderIndex: idx + 1,
          });
        });
      }
    });

    if (allChapters.length > 0) {
      const { error: chapError } = await supabase
        .from('BookChapter')
        .upsert(allChapters, { onConflict: 'id' });

      if (chapError) {
        console.warn('Note: Chapters were not completely saved:', chapError.message);
      }
    }

    return {
      success: true,
      message: 'Successfully seeded book catalog to Supabase database!',
      categoriesCount: categoriesToInsert.length,
      booksCount: booksToInsert.length,
      chaptersCount: allChapters.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'An error occurred while seeding database.',
    };
  }
}

/**
 * Mencatat peminjaman buku ke Supabase PostgreSQL
 */
export async function recordLoanToSupabase(loan: Loan): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('Loan').insert({
      id: loan.id,
      userId: loan.userId,
      bookId: loan.bookId,
      borrowedAt: loan.borrowedAt,
      dueDate: loan.dueDate,
      status: loan.status === 'active' ? 'ACTIVE' : loan.status === 'returned' ? 'RETURNED' : 'OVERDUE',
      progressPercentage: loan.progressPercentage,
      lastChapterId: loan.lastChapterId,
      extensionsCount: loan.extensionsCount,
    });

    if (error) {
      console.warn('Gagal mencatat pinjaman ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Record loan error:', err);
    return false;
  }
}
