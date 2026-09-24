import React, { useState } from 'react';
import { LibraryProvider, useLibrary, SUPER_ADMIN_EMAIL } from './context/LibraryContext';
import { Header } from './components/Header';
import { SocialFeed } from './components/Feed/SocialFeed';
import { LibraryView } from './components/Library/LibraryView';
import { BookDetailModal } from './components/Library/BookDetailModal';
import { EpubReaderModal } from './components/Reader/EpubReaderModal';
import { LoansView } from './components/Loans/LoansView';
import { ProfileView } from './components/Profile/ProfileView';
import { BookRequestsView } from './components/Requests/BookRequestsView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AuthModal } from './components/Auth/AuthModal';
import { Book } from './types';
import { ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeRole, isSuperAdmin } = useLibrary();
  const [activeTab, setActiveTab] = useState<'feed' | 'library' | 'my-books' | 'requests' | 'profile' | 'admin'>('feed');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
        onOpenAuth={() => setIsAuthOpen(true)}
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
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          isSuperAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                Administrator Access Restricted
              </h2>
              <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] leading-relaxed max-w-md mx-auto">
                System administration, digital EPUB uploading, and catalog creation are strictly reserved for the verified library administrator:
              </p>
              <div className="inline-block px-3.5 py-1.5 bg-[#ff6719]/10 border border-[#ff6719]/30 rounded-lg text-[#ff6719] font-mono text-xs font-semibold">
                {SUPER_ADMIN_EMAIL}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleTabChange('library')}
                  className="px-5 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Return to Library Catalog
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

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
            <span>— Digital Library & Literary Social Network</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Reflowable EPUB 3.0</span>
            <span>•</span>
            <span>Supabase PostgreSQL Database</span>
            <span>•</span>
            <span>Cloudflare Storage</span>
            <span>•</span>
            <span>Automated Cron Sweep</span>
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
