import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Header } from './components/Header';
import { SocialFeed } from './components/Feed/SocialFeed';
import { LibraryView } from './components/Library/LibraryView';
import { BookDetailModal } from './components/Library/BookDetailModal';
import { EpubReaderModal } from './components/Reader/EpubReaderModal';
import { LoansView } from './components/Loans/LoansView';
import { ProfileView } from './components/Profile/ProfileView';
import { BookRequestsView } from './components/Requests/BookRequestsView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Book } from './types';

const MainLayout: React.FC = () => {
  const { activeRole } = useLibrary();
  const [activeTab, setActiveTab] = useState<'feed' | 'library' | 'my-books' | 'requests' | 'profile' | 'admin'>('feed');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReader = (book: Book) => {
    setSelectedBook(null);
    setReadingBook(book);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#faf8f5] dark:bg-[#121214] text-[#1a1a1a] dark:text-[#ededed] flex flex-col font-sans selection:bg-[#ffd8c2] dark:selection:bg-[#ff6719]/30 selection:text-[#ff6719] transition-colors duration-200">
      {/* Substack Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSearch={() => handleTabChange('library')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-24 sm:pb-12">
        {activeTab === 'feed' && (
          <SocialFeed
            onOpenReader={handleOpenReader}
            onSelectBook={(book) => setSelectedBook(book)}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            onSelectBook={(book) => setSelectedBook(book)}
            onOpenReader={handleOpenReader}
          />
        )}

        {activeTab === 'my-books' && (
          <LoansView
            onOpenReader={handleOpenReader}
            onSelectBook={(book) => setSelectedBook(book)}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'requests' && (
          <BookRequestsView />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            onSelectBook={(book) => setSelectedBook(book)}
            onOpenReader={handleOpenReader}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onOpenReader={handleOpenReader}
        />
      )}

      {/* EPUB Reader Modal */}
      {readingBook && (
        <EpubReaderModal
          book={readingBook}
          onClose={() => setReadingBook(null)}
        />
      )}

      {/* Substack-style Footer */}
      <footer className="border-t border-[#eae6df] dark:border-[#27272a] bg-[#fffdfa] dark:bg-[#141416] py-8 px-4 sm:px-6 text-xs text-[#706c64] dark:text-[#a1a1aa] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Libraria</span>
            <span>— Platform Peminjaman Buku Digital & Media Sosial Literasi</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Arsitektur Full-stack EPUB 3.0</span>
            <span>•</span>
            <span>Prisma ORM & PostgreSQL</span>
            <span>•</span>
            <span>Cloudflare R2 Bucket</span>
            <span>•</span>
            <span>Vercel Cron & QStash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LibraryProvider>
      <MainLayout />
    </LibraryProvider>
  );
}
