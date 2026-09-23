import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Flame, 
  TrendingUp, 
  Star,
  BookOpen, 
  Plus, 
  ArrowRight
} from 'lucide-react';

interface SocialFeedProps {
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onNavigateTab: (tab: string) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ onSelectBook, onOpenReader, onNavigateTab }) => {
  const { 
    currentUser, 
    socialActivities, 
    toggleLikeActivity, 
    books, 
    loans, 
    borrowBook 
  } = useLibrary();

  const [filterMode, setFilterMode] = useState<'semua' | 'ulasan'>('semua');
  const [borrowFeedback, setBorrowFeedback] = useState<{ id: string; msg: string; isError?: boolean } | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Trending books sorted by borrowCount
  const trendingBooks = [...books].sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 4);

  // Active loans for current user
  const userActiveLoans = loans.filter(l => l.userId === currentUser.id && l.status === 'active');

  const filteredActivities = socialActivities.filter(act => {
    if (filterMode === 'ulasan') return act.actionType === 'rated_book' || act.actionType === 'finished_reading';
    return true;
  });

  const handleQuickBorrow = (book: Book) => {
    const res = borrowBook(book.id);
    setBorrowFeedback({ id: book.id, msg: res.message, isError: !res.success });
    setTimeout(() => setBorrowFeedback(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
      {/* Editorial Headline / Substack Newsletter Intro */}
      <div className="mb-6 sm:mb-8 border-b border-[#eae6df] dark:border-[#27272a] pb-5 sm:pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#ff6719]">
              The Reader's Dispatch • Volume 24
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
              Catatan & Aktivitas Komunitas Pembaca
            </h1>
            <p className="text-xs sm:text-sm text-[#59554e] dark:text-[#a1a1aa] font-sans mt-2 max-w-2xl leading-relaxed">
              Jelajahi buku yang sedang diselami pembaca lain, ulasan mendalam, serta peredaran lisensi buku digital terkini di perpustakaan.
            </p>
          </div>

          {/* Feed Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-[#f0ede6] dark:bg-[#202024] rounded-lg self-start md:self-auto text-xs">
            <button
              onClick={() => setFilterMode('semua')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterMode === 'semua'
                  ? 'bg-white dark:bg-[#141416] text-[#1a1a1a] dark:text-[#f4f4f5] font-semibold shadow-xs'
                  : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white'
              }`}
            >
              Semua Aktivitas
            </button>
            <button
              onClick={() => setFilterMode('ulasan')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterMode === 'ulasan'
                  ? 'bg-white dark:bg-[#141416] text-[#1a1a1a] dark:text-[#f4f4f5] font-semibold shadow-xs'
                  : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white'
              }`}
            >
              Ulasan & Esai
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Substack Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Feed Articles & Activity Stream */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Active Reading Banner if reader has an active loan */}
          {userActiveLoans.length > 0 && (
            <div className="bg-[#fff9f4] dark:bg-[#201915] border border-[#ffd8c2] dark:border-[#ff6719]/30 rounded-xl p-4 sm:p-5 shadow-xs overflow-hidden w-full max-w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0 w-full overflow-hidden">
                  {(() => {
                    const activeBook = books.find(b => b.id === userActiveLoans[0].bookId);
                    if (!activeBook) return null;
                    return (
                      <>
                        <img 
                          src={activeBook.coverUrl} 
                          alt={activeBook.title}
                          className="w-12 sm:w-14 h-16 sm:h-20 object-cover rounded shadow-xs flex-shrink-0 aspect-[3/4]" 
                        />
                        <div className="min-w-0 flex-1 w-full overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ff6719] text-white flex-shrink-0">
                              Sedang Anda Baca
                            </span>
                            <span className="text-xs text-[#706c64] dark:text-[#a1a1aa] truncate">
                              Progress: {userActiveLoans[0].progressPercentage}%
                            </span>
                          </div>
                          <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-1 leading-snug truncate block max-w-full">
                            {activeBook.title}
                          </h3>
                          <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] truncate block max-w-full">Oleh {activeBook.author}</p>
                          <div className="w-full bg-[#fae3d4] dark:bg-[#3d271c] h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-[#ff6719] h-full rounded-full transition-all duration-500" 
                              style={{ width: `${userActiveLoans[0].progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <button
                  onClick={() => {
                    const activeBook = books.find(b => b.id === userActiveLoans[0].bookId);
                    if (activeBook) onOpenReader(activeBook);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg shadow-xs transition-all whitespace-nowrap flex items-center justify-center gap-1.5 self-stretch sm:self-center flex-shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Buka Google Play Books Reader</span>
                </button>
              </div>
            </div>
          )}

          {/* Activity Cards Stream */}
          <div className="space-y-4 sm:space-y-5">
            {filteredActivities.map(activity => {
              const hasLiked = activity.likedBy.includes(currentUser.id);
              const relatedBook = activity.bookId ? books.find(b => b.id === activity.bookId) : undefined;

              return (
                <article
                  key={activity.id}
                  className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 sm:p-6 transition-all hover:border-[#d6d0c4] dark:hover:border-[#3f3f46] shadow-xs overflow-hidden w-full max-w-full"
                >
                  {/* Author / Byline row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={activity.userAvatar}
                        alt={activity.userName}
                        className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover border border-[#e0dad0] dark:border-[#333] flex-shrink-0 aspect-square"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-xs text-[#1a1a1a] dark:text-[#f4f4f5] truncate">{activity.userName}</span>
                          <span className="text-[11px] text-[#706c64] dark:text-[#a1a1aa] truncate">{activity.userHandle}</span>
                        </div>
                        <p className="text-[11px] text-[#8c8880] dark:text-[#71717a] mt-0.5 truncate">
                          {activity.actionType === 'finished_reading' && 'Selesai menamatkan buku'}
                          {activity.actionType === 'started_reading' && 'Mulai membaca bab pertama'}
                          {activity.actionType === 'rated_book' && 'Memberikan ulasan & rating'}
                          {activity.actionType === 'added_wishlist' && 'Menambahkan ke wishlist'}
                          {activity.actionType === 'created_shelf' && 'Membuat rak kurasi buku baru'}
                          {activity.actionType === 'admin_uploaded' && 'Pustakawan mengunggah buku baru'}
                          {' • '}{activity.timestamp}
                        </p>
                      </div>
                    </div>

                    {activity.rating && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-[#fef8e7] dark:bg-[#2b2210] text-[#b37400] dark:text-[#f59e0b] rounded text-xs font-bold border border-[#fbe4a8] dark:border-[#523e17] flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-[#e8a317] text-[#e8a317]" />
                        <span>{activity.rating}.0</span>
                      </div>
                    )}
                  </div>

                  {/* Activity Body */}
                  {activity.reviewComment && (
                    <blockquote className="font-editorial text-[15px] sm:text-[16px] text-[#2a2927] dark:text-[#d4d4d8] leading-relaxed my-3 pl-3.5 border-l-2 border-[#ff6719]/60 italic break-words">
                      "{activity.reviewComment}"
                    </blockquote>
                  )}

                  {activity.details && (
                    <p className="text-xs text-[#4a4742] dark:text-[#a1a1aa] leading-relaxed my-2 break-words">
                      {activity.details}
                    </p>
                  )}

                  {/* Attached Book Card - clamped with min-w-0 and w-full */}
                  {relatedBook && (
                    <div className="mt-3.5 p-3 sm:p-3.5 bg-[#faf8f5] dark:bg-[#202024] rounded-lg border border-[#eeebe3] dark:border-[#2e2e33] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden w-full max-w-full">
                      <div 
                        onClick={() => onSelectBook(relatedBook)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 w-full max-w-full overflow-hidden group"
                      >
                        <img
                          src={relatedBook.coverUrl}
                          alt={relatedBook.title}
                          className="w-11 sm:w-12 h-15 sm:h-16 object-cover rounded shadow-xs group-hover:scale-102 transition-transform flex-shrink-0 aspect-[3/4]"
                        />
                        <div className="min-w-0 flex-1 w-full overflow-hidden">
                          <span className="text-[10px] uppercase font-semibold text-[#8c8880] dark:text-[#a1a1aa] block truncate">
                            {relatedBook.categoryName}
                          </span>
                          <h4 className="font-editorial text-sm font-bold text-[#1a1a1a] dark:text-[#f4f4f5] group-hover:text-[#ff6719] transition-colors truncate block max-w-full">
                            {relatedBook.title}
                          </h4>
                          <p className="text-[11px] text-[#6b6760] dark:text-[#a1a1aa] truncate block max-w-full">Oleh {relatedBook.author}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap max-w-full overflow-hidden">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate max-w-full ${
                              relatedBook.availableCopies > 0
                                ? 'bg-[#eaf5ea] dark:bg-[#142616] text-[#25682a] dark:text-[#4ade80]'
                                : 'bg-[#faeceb] dark:bg-[#2d1515] text-[#9c2b27] dark:text-[#f87171]'
                            }`}>
                              {relatedBook.availableCopies > 0 
                                ? `Tersedia ${relatedBook.availableCopies} dari ${relatedBook.totalCopies} slot` 
                                : 'Seluruh slot dipinjam'}
                            </span>
                            <span className="text-[10px] text-[#8c8880] dark:text-[#71717a] flex items-center gap-0.5 flex-shrink-0">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {relatedBook.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                        <button
                          onClick={() => handleQuickBorrow(relatedBook)}
                          className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-[#333] dark:hover:bg-[#e4e4e7] rounded-md transition-colors whitespace-nowrap text-center shadow-xs"
                        >
                          Pinjam
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback message for borrow action */}
                  {borrowFeedback && relatedBook && borrowFeedback.id === relatedBook.id && (
                    <div className={`mt-2 p-2 rounded text-xs ${borrowFeedback.isError ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'}`}>
                      {borrowFeedback.msg}
                    </div>
                  )}

                  {/* Engagement Bar */}
                  <div className="mt-4 pt-3 border-t border-[#f4f2ee] dark:border-[#27272a] flex items-center justify-between text-xs text-[#706c64] dark:text-[#a1a1aa]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLikeActivity(activity.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          hasLiked ? 'text-[#ff6719] font-semibold' : 'hover:text-[#1a1a1a] dark:hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-[#ff6719]' : ''}`} />
                        <span>{activity.likes} Sukai</span>
                      </button>

                      <button 
                        onClick={() => {
                          if (relatedBook) onSelectBook(relatedBook);
                        }}
                        className="flex items-center gap-1.5 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Komentar</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                        setCopiedPostId(activity.id);
                        setTimeout(() => setCopiedPostId(null), 2500);
                      }}
                      className="flex items-center gap-1 p-1 hover:text-[#1a1a1a] dark:hover:text-white transition-colors text-xs"
                      title="Bagikan catatan"
                    >
                      <Share2 className="w-4 h-4" />
                      {copiedPostId === activity.id && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
                          Disalin!
                        </span>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right Column: Substack Side Rail */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          {/* Reading Streak & Challenge Card */}
          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#f4f2ee] dark:border-[#27272a]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719]">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-[#1a1a1a] dark:text-[#f4f4f5]">
                  Reading Streak
                </h3>
              </div>
              <span className="text-xs font-bold text-[#ff6719] bg-[#fff0e6] dark:bg-[#ff6719]/15 px-2 py-0.5 rounded-full">
                {currentUser.streakDays} Hari!
              </span>
            </div>

            <div className="py-3 sm:py-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#59554e] dark:text-[#a1a1aa] font-medium">Target 2026: 24 Buku</span>
                <span className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">{currentUser.booksFinished} / 24</span>
              </div>
              <div className="w-full bg-[#f0ede6] dark:bg-[#28282d] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#ff6719] h-full rounded-full" 
                  style={{ width: `${Math.min(100, (currentUser.booksFinished / 24) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#706c64] dark:text-[#a1a1aa] mt-2 italic">
                "Sedikit demi sedikit, lama-lama menjadi perpustakaan pribadi di dalam benak."
              </p>
            </div>

            <div className="pt-3 border-t border-[#f4f2ee] dark:border-[#27272a] flex items-center justify-between text-xs">
              <span className="text-[#706c64] dark:text-[#a1a1aa]">{currentUser.pagesRead.toLocaleString('id-ID')} halaman</span>
              <button 
                onClick={() => onNavigateTab('profile')}
                className="text-[#ff6719] font-medium hover:underline text-xs"
              >
                Lihat Lencana →
              </button>
            </div>
          </div>

          {/* Trending Books Substack Leaderboard */}
          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#f4f2ee] dark:border-[#27272a]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#ff6719]" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-[#1a1a1a] dark:text-[#f4f4f5]">
                  Buku Populer
                </h3>
              </div>
              <span className="text-[11px] text-[#8c8880] dark:text-[#71717a]">Pilihan Komunitas</span>
            </div>

            <div className="divide-y divide-[#f4f2ee] dark:divide-[#27272a] mt-2">
              {trendingBooks.map((book, idx) => (
                <div 
                  key={book.id} 
                  className="py-3 flex items-start gap-3 group cursor-pointer"
                  onClick={() => onSelectBook(book)}
                >
                  <span className="font-editorial text-lg font-bold text-[#c9c5bd] dark:text-[#4b4a54] group-hover:text-[#ff6719] transition-colors w-4">
                    {idx + 1}
                  </span>
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded shadow-xs flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-editorial text-xs font-bold text-[#1a1a1a] dark:text-[#f4f4f5] group-hover:text-[#ff6719] transition-colors truncate">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-[#706c64] dark:text-[#a1a1aa] truncate">{book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#ff6719] font-medium">
                        {book.borrowCount}x dipinjam
                      </span>
                      <span className="text-[10px] text-[#8c8880] dark:text-[#71717a]">
                        ⭐ {book.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigateTab('library')}
              className="w-full mt-2 pt-3 border-t border-[#f4f2ee] dark:border-[#27272a] text-center text-xs font-semibold text-[#ff6719] hover:text-[#e85608] flex items-center justify-center gap-1"
            >
              <span>Jelajahi Seluruh Koleksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Substack Newsletter-Style Quote Widget */}
          <div className="bg-[#faf7f0] dark:bg-[#1f1e1a] border border-[#e6dfd1] dark:border-[#383328] rounded-xl p-4 sm:p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8c8577] dark:text-[#a89f8f]">
              Kutipan Pembaca Hari Ini
            </span>
            <blockquote className="font-editorial text-sm sm:text-base text-[#2e2c28] dark:text-[#e4ded0] italic mt-2 leading-relaxed">
              "Buku adalah pembawa peradaban. Tanpa buku, sejarah diam, sastra bisu, sains lumpuh, dan pikiran terbelenggu."
            </blockquote>
            <p className="text-xs text-[#706a5f] dark:text-[#9e9587] mt-2 font-medium">
              — Barbara Tuchman, Sejarawan
            </p>
          </div>

          {/* Community Book Request Callout */}
          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 sm:p-5 shadow-xs">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[#1a1a1a] dark:text-[#f4f4f5] mb-1.5">
              Buku Impian Belum Ada?
            </h3>
            <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] leading-relaxed">
              Ajukan judul buku yang ingin Anda pinjam dalam format EPUB. Upvote terbanyak diprioritaskan pustakawan.
            </p>
            <button
              onClick={() => onNavigateTab('requests')}
              className="mt-3 w-full py-2 bg-[#f4f1ea] dark:bg-[#202024] hover:bg-[#eae6dc] dark:hover:bg-[#28282e] text-[#1a1a1a] dark:text-[#f4f4f5] text-xs font-semibold rounded-lg transition-colors border border-[#ded8cc] dark:border-[#333] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#ff6719]" />
              <span>Usulkan Judul Buku</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
