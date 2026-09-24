import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { 
  BookOpen, 
  Search, 
  Bell, 
  UserCheck, 
  ShieldAlert, 
  Bookmark, 
  FileText, 
  SlidersHorizontal, 
  X, 
  Sun, 
  Moon, 
  Compass, 
  Layers, 
  User, 
  HelpCircle,
  TrendingUp,
  LogIn
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenSearch, onOpenAuth }) => {
  const { 
    currentUser, 
    activeRole, 
    switchRole, 
    notifications, 
    unreadNotificationsCount,
    markNotificationAsRead,
    clearAllNotifications,
    systemSettings,
    theme,
    toggleTheme
  } = useLibrary();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#fffdfa]/95 dark:bg-[#141416]/95 backdrop-blur-md border-b border-[#eae6df] dark:border-[#27272a] transition-colors">
        {/* Top Banner Notice */}
        <div className="bg-[#1a1a1a] dark:bg-[#0c0c0e] text-[#f5f2eb] dark:text-[#d4d4d8] px-4 py-1.5 text-xs font-medium border-b border-black/10 dark:border-[#27272a]">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-[#ff6719] animate-pulse flex-shrink-0"></span>
              <span className="truncate text-[11px] sm:text-xs">
                <strong>Digital Library Substack Edition</strong> — Maksimal pinjam {systemSettings.maxBorrowPerUser} buku ({systemSettings.borrowDurationDays} hari masa pinjam).
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="text-[#a09e99] hidden md:inline text-[11px]">Peran:</span>
              <button
                onClick={() => switchRole(activeRole === 'reader' ? 'admin' : 'reader')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  activeRole === 'admin' 
                    ? 'bg-[#ff6719] text-white shadow-xs' 
                    : 'bg-[#2e2e2e] text-[#e0ded8] hover:bg-[#3e3e3e]'
                }`}
                title="Beralih peran Pembaca / Administrator"
              >
                {activeRole === 'admin' ? (
                  <>
                    <ShieldAlert className="w-3 h-3" />
                    <span>Mode Admin</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3 h-3" />
                    <span>Mode Reader</span>
                  </>
                )}
                <span className="text-[10px] opacity-70 underline hidden sm:inline ml-0.5">Ganti</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Publication Masthead */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              onClick={() => setActiveTab('feed')}
              className="flex items-center gap-2 sm:gap-2.5 text-left group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#ff6719] flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-[#e85608] transition-colors">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f4f4f5] leading-none">
                    LIBRARIA
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719] border border-[#ffd8c2] dark:border-[#ff6719]/30">
                    STACK
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#6b6760] dark:text-[#a1a1aa] font-sans tracking-tight leading-tight mt-0.5 hidden xs:block">
                  Social Reading & Digital EPUB Library
                </p>
              </div>
            </button>
          </div>

          {/* Middle: Search Trigger (Desktop / Tablet) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs bg-[#f4f1ea] dark:bg-[#1e1e22] hover:bg-[#ece8df] dark:hover:bg-[#27272c] text-[#6b6760] dark:text-[#a1a1aa] rounded-full border border-[#ded9cf] dark:border-[#2e2e33] transition-all"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#8a857c]" />
                <span className="truncate">Cari judul buku, penulis, atau topik...</span>
              </span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-white dark:bg-[#141416] border border-[#ded9cf] dark:border-[#333] rounded text-[#8a857c]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Theme Switch, Search Icon (Mobile), Notifications, & User Info */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden w-8 h-8 flex items-center justify-center text-[#4a4742] dark:text-[#a1a1aa] hover:bg-[#f0ede6] dark:hover:bg-[#202024] rounded-full transition-colors flex-shrink-0 aspect-square"
              title="Cari katalog buku"
              aria-label="Cari buku"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 text-[#4a4742] dark:text-[#f4f4f5] hover:bg-[#f0ede6] dark:hover:bg-[#202024] rounded-full transition-colors flex items-center justify-center flex-shrink-0 aspect-square"
              title={theme === 'dark' ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-8 h-8 sm:w-9 sm:h-9 text-[#4a4742] dark:text-[#d4d4d8] hover:bg-[#f0ede6] dark:hover:bg-[#202024] rounded-full transition-colors flex items-center justify-center flex-shrink-0 aspect-square"
                title="Notifikasi"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff6719]"></span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-white dark:bg-[#1a1a1e] rounded-xl shadow-2xl border border-[#e2ded7] dark:border-[#27272a] py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#eeebe5] dark:border-[#27272a] flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#1a1a1a] dark:text-[#f4f4f5]">Notifikasi Perpustakaan</span>
                    <div className="flex items-center gap-2">
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[11px] text-[#ff6719] hover:underline"
                        >
                          Tandai semua dibaca
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-[#8c8880] hover:text-[#1a1a1a] dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#f4f2ee] dark:divide-[#27272a]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#8c8880] dark:text-[#71717a]">
                        Belum ada notifikasi baru.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 text-xs transition-colors cursor-pointer ${
                            notif.read 
                              ? 'bg-white dark:bg-[#1a1a1e] opacity-75' 
                              : 'bg-[#fff9f5] dark:bg-[#261f1c]'
                          } hover:bg-[#f9f7f3] dark:hover:bg-[#232328]`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-[#1a1a1a] dark:text-[#f4f4f5]">{notif.title}</p>
                            <span className="text-[10px] text-[#9a968f] whitespace-nowrap">{notif.createdAt}</span>
                          </div>
                          <p className="text-[#59554e] dark:text-[#a1a1aa] mt-1 leading-relaxed text-[11px]">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill - perfectly circular on mobile, expands on tablet/desktop */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 sm:w-auto sm:h-auto p-0 sm:pl-1.5 sm:pr-2.5 sm:py-1 bg-[#f5f2eb] dark:bg-[#202024] hover:bg-[#ece8df] dark:hover:bg-[#27272c] rounded-full border border-[#e0dbd1] dark:border-[#2e2e33] transition-all flex items-center justify-center sm:justify-start gap-2 flex-shrink-0 aspect-square sm:aspect-auto"
              title={`Profil ${currentUser.name}`}
              aria-label="Profil Pengguna"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover border border-white dark:border-[#333] flex-shrink-0 aspect-square"
              />
              <span className="text-xs font-medium text-[#1a1a1a] dark:text-[#e4e4e7] hidden sm:inline max-w-[110px] truncate">
                {currentUser.name}
              </span>
            </button>

            {/* Supabase Auth Trigger Button */}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1 text-xs font-semibold bg-[#ff6719]/10 hover:bg-[#ff6719]/20 text-[#ff6719] border border-[#ff6719]/30 rounded-full transition-colors flex items-center gap-1.5 flex-shrink-0"
                title="Kelola Akun Supabase (Masuk / Daftar)"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}
          </div>
        </div>

        {/* Substack Navigation Bar (Desktop & Tablet) */}
        <nav className="border-t border-[#eeebe5] dark:border-[#27272a] px-4 sm:px-6 hidden sm:block">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'text-[#ff6719] border-b-2 border-[#ff6719] rounded-b-none font-semibold'
                  : 'text-[#59554e] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f4f1ea] dark:hover:bg-[#202024]'
              }`}
            >
              Beranda (Feed)
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                activeTab === 'library'
                  ? 'text-[#ff6719] border-b-2 border-[#ff6719] rounded-b-none font-semibold'
                  : 'text-[#59554e] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f4f1ea] dark:hover:bg-[#202024]'
              }`}
            >
              Katalog & Library
            </button>
            <button
              onClick={() => setActiveTab('my-books')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                activeTab === 'my-books'
                  ? 'text-[#ff6719] border-b-2 border-[#ff6719] rounded-b-none font-semibold'
                  : 'text-[#59554e] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f4f1ea] dark:hover:bg-[#202024]'
              }`}
            >
              Buku Saya (Pinjaman)
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'text-[#ff6719] border-b-2 border-[#ff6719] rounded-b-none font-semibold'
                  : 'text-[#59554e] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f4f1ea] dark:hover:bg-[#202024]'
              }`}
            >
              Request Buku Baru
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'text-[#ff6719] border-b-2 border-[#ff6719] rounded-b-none font-semibold'
                  : 'text-[#59554e] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f4f1ea] dark:hover:bg-[#202024]'
              }`}
            >
              Profil Pembaca
            </button>

            {/* Admin Studio Tab Button */}
            <div className="ml-auto pl-2">
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]'
                    : 'bg-[#f4f0e8] dark:bg-[#202024] text-[#3d3a35] dark:text-[#d4d4d8] hover:bg-[#ebe6dc] dark:hover:bg-[#28282e] border border-[#d8d3c8] dark:border-[#333]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff6719]" />
                <span>Studio Admin</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (Ultra-responsive on all smartphones, touch target ≥ 48px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#fffdfa]/95 dark:bg-[#141416]/95 backdrop-blur-md border-t border-[#eae6df] dark:border-[#27272a] sm:hidden shadow-lg safe-area-pb">
        <div className="grid grid-cols-5 h-14 items-center">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'feed' ? 'text-[#ff6719]' : 'text-[#706c64] dark:text-[#a1a1aa]'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'library' ? 'text-[#ff6719]' : 'text-[#706c64] dark:text-[#a1a1aa]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Katalog</span>
          </button>

          <button
            onClick={() => setActiveTab('my-books')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'my-books' ? 'text-[#ff6719]' : 'text-[#706c64] dark:text-[#a1a1aa]'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Buku Saya</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'requests' ? 'text-[#ff6719]' : 'text-[#706c64] dark:text-[#a1a1aa]'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Usulan</span>
          </button>

          <button
            onClick={() => setActiveTab(activeRole === 'admin' ? 'admin' : 'profile')}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'profile' || activeTab === 'admin' ? 'text-[#ff6719]' : 'text-[#706c64] dark:text-[#a1a1aa]'
            }`}
          >
            {activeRole === 'admin' ? <SlidersHorizontal className="w-5 h-5" /> : <User className="w-5 h-5" />}
            <span className="text-[10px] font-medium mt-0.5">
              {activeRole === 'admin' ? 'Admin' : 'Profil'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
