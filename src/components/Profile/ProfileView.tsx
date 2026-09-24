import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { 
  UserCheck, 
  Flame, 
  BookOpen, 
  Award, 
  FolderPlus, 
  Heart, 
  Star, 
  Sparkles,
  Edit3,
  ShieldCheck
} from 'lucide-react';

interface ProfileViewProps {
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onOpenAuth?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onSelectBook, onOpenReader, onOpenAuth }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    loans, 
    books, 
    wishlistBookIds, 
    toggleWishlist,
    customShelves, 
    createCustomShelf,
    reviews, 
    readingHighlights,
    isFollowingActiveUser,
    toggleFollowUser 
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'rak' | 'ulasan' | 'kutipan' | 'lencana'>('rak');
  const [activeShelfId, setActiveShelfId] = useState<'loans' | 'wishlist' | string>('loans');
  const [showNewShelfModal, setShowNewShelfModal] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const [newShelfDesc, setNewShelfDesc] = useState('');

  // Editing bio modal
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);

  const userReviews = reviews.filter(r => r.userId === currentUser.id);
  const userHighlights = readingHighlights.filter(h => h.userId === currentUser.id);
  const activeLoans = loans.filter(l => l.userId === currentUser.id && l.status === 'active');
  const wishlistBooks = books.filter(b => wishlistBookIds.includes(b.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      name: editName.trim() || currentUser.name,
      bio: editBio.trim() || currentUser.bio,
    });
    setIsEditingBio(false);
  };

  const handleCreateShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShelfName.trim()) return;
    createCustomShelf(newShelfName.trim(), newShelfDesc.trim(), true);
    setNewShelfName('');
    setNewShelfDesc('');
    setShowNewShelfModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
      {/* Substack Author Header Card */}
      <div className="bg-white dark:bg-[#1a1a1e] rounded-2xl border border-[#e8e4dc] dark:border-[#27272a] p-5 sm:p-8 shadow-xs mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#ff6719]/40 shadow-xs flex-shrink-0 aspect-square"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                  {currentUser.name}
                </h1>
                <span className="text-xs text-[#8c8880] dark:text-[#71717a]">{currentUser.handle}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719] border border-[#ffd8c2] dark:border-[#ff6719]/30">
                  Pembaca Terverifikasi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#59554e] dark:text-[#a1a1aa] max-w-xl font-sans leading-relaxed">
                {currentUser.bio}
              </p>
              <p className="text-[11px] text-[#8c8880] dark:text-[#71717a] pt-0.5">
                Bergabung sejak {currentUser.joinedDate}
              </p>
            </div>
          </div>

          {/* Follow & Edit & Auth buttons */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end flex-wrap">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-lg bg-[#ff6719]/10 hover:bg-[#ff6719]/20 text-xs font-semibold text-[#ff6719] border border-[#ff6719]/30 transition-colors flex items-center gap-1.5"
                title="Kelola Akun Supabase Auth"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Akun Supabase</span>
              </button>
            )}

            <button
              onClick={() => setIsEditingBio(true)}
              className="px-3.5 py-2 rounded-lg border border-[#ded8cb] dark:border-[#333] hover:bg-[#f7f4ed] dark:hover:bg-[#202024] text-xs font-semibold text-[#1a1a1a] dark:text-[#f4f4f5] transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#8c8880] dark:text-[#a1a1aa]" />
              <span>Edit Profil</span>
            </button>

            <button
              onClick={toggleFollowUser}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 ${
                isFollowingActiveUser
                  ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]'
                  : 'bg-[#ff6719] hover:bg-[#e85608] text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isFollowingActiveUser ? 'Mengikuti' : 'Ikuti'}</span>
            </button>
          </div>
        </div>

        {/* Reading Statistics Bar */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#f4f2ee] dark:border-[#27272a] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-3 bg-[#faf8f5] dark:bg-[#202024] rounded-xl border border-[#eeebe3] dark:border-[#2e2e33]">
            <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
              Streak Membaca
            </span>
            <div className="font-editorial text-xl sm:text-2xl font-bold text-[#ff6719] mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-[#ff6719]" />
              <span>{currentUser.streakDays} Hari</span>
            </div>
          </div>

          <div className="p-3 bg-[#faf8f5] dark:bg-[#202024] rounded-xl border border-[#eeebe3] dark:border-[#2e2e33]">
            <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
              Buku Ditamatkan
            </span>
            <span className="font-editorial text-xl sm:text-2xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-0.5 block">
              {currentUser.booksFinished} Judul
            </span>
          </div>

          <div className="p-3 bg-[#faf8f5] dark:bg-[#202024] rounded-xl border border-[#eeebe3] dark:border-[#2e2e33]">
            <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
              Halaman Dibaca
            </span>
            <span className="font-editorial text-xl sm:text-2xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-0.5 block">
              {currentUser.pagesRead.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="p-3 bg-[#faf8f5] dark:bg-[#202024] rounded-xl border border-[#eeebe3] dark:border-[#2e2e33]">
            <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
              Komunitas
            </span>
            <span className="font-editorial text-xl sm:text-2xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-0.5 block">
              {currentUser.followersCount} Pengikut
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-[#eae6df] dark:border-[#27272a] pb-3 mb-6 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('rak')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'rak' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          Rak & Koleksi Buku
        </button>
        <button
          onClick={() => setActiveTab('ulasan')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'ulasan' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          Ulasan Saya ({userReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('kutipan')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'kutipan' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          Kutipan ({userHighlights.length})
        </button>
        <button
          onClick={() => setActiveTab('lencana')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'lencana' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          Lencana & Capaian
        </button>
      </div>

      {/* Tab 1: Shelves */}
      {activeTab === 'rak' && (
        <div className="space-y-6">
          {/* Sub-shelf selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setActiveShelfId('loans')}
                className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  activeShelfId === 'loans'
                    ? 'bg-[#ff6719] text-white border-[#ff6719] font-semibold'
                    : 'bg-white dark:bg-[#1a1a1e] text-[#59554e] dark:text-[#a1a1aa] border-[#ded8cb] dark:border-[#27272a] hover:bg-[#faf7f2] dark:hover:bg-[#202024]'
                }`}
              >
                Sedang Dipinjam ({activeLoans.length})
              </button>

              <button
                onClick={() => setActiveShelfId('wishlist')}
                className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  activeShelfId === 'wishlist'
                    ? 'bg-[#ff6719] text-white border-[#ff6719] font-semibold'
                    : 'bg-white dark:bg-[#1a1a1e] text-[#59554e] dark:text-[#a1a1aa] border-[#ded8cb] dark:border-[#27272a] hover:bg-[#faf7f2] dark:hover:bg-[#202024]'
                }`}
              >
                Wishlist ({wishlistBooks.length})
              </button>

              {customShelves.map(shelf => (
                <button
                  key={shelf.id}
                  onClick={() => setActiveShelfId(shelf.id)}
                  className={`px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                    activeShelfId === shelf.id
                      ? 'bg-[#ff6719] text-white border-[#ff6719] font-semibold'
                      : 'bg-white dark:bg-[#1a1a1e] text-[#59554e] dark:text-[#a1a1aa] border-[#ded8cb] dark:border-[#27272a] hover:bg-[#faf7f2] dark:hover:bg-[#202024]'
                  }`}
                >
                  {shelf.name} ({shelf.bookIds.length})
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNewShelfModal(true)}
              className="self-start sm:self-auto px-3 py-1.5 bg-[#f4f1ea] dark:bg-[#202024] hover:bg-[#eae6dc] dark:hover:bg-[#28282e] text-[#1a1a1a] dark:text-[#f4f4f5] text-xs font-semibold rounded-lg border border-[#ded8cc] dark:border-[#333] flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#ff6719]" />
              <span>Buat Rak Kustom</span>
            </button>
          </div>

          {/* Shelves Content Grid */}
          <div>
            {activeShelfId === 'loans' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {activeLoans.map(loan => {
                  const book = books.find(b => b.id === loan.bookId);
                  if (!book) return null;
                  return (
                    <div 
                      key={loan.id} 
                      onClick={() => onSelectBook(book)}
                      className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 cursor-pointer hover:shadow-md transition-all group"
                    >
                      <img src={book.coverUrl} alt={book.title} className="w-full aspect-[3/4] object-cover rounded-lg mb-3 shadow-xs" />
                      <h4 className="font-editorial text-sm font-bold text-[#1a1a1a] dark:text-[#f4f4f5] group-hover:text-[#ff6719] line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] truncate">{book.author}</p>
                      <div className="mt-2 text-xs flex items-center justify-between text-[#ff6719] font-semibold">
                        <span>Progress: {loan.progressPercentage}%</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReader(book);
                          }}
                          className="px-2.5 py-1 bg-[#ff6719] text-white rounded text-[11px]"
                        >
                          Baca
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeShelfId === 'wishlist' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {wishlistBooks.length === 0 ? (
                  <p className="col-span-full text-center text-xs text-[#8c8880] dark:text-[#71717a] py-12">Belum ada buku di wishlist.</p>
                ) : (
                  wishlistBooks.map(book => (
                    <div 
                      key={book.id} 
                      onClick={() => onSelectBook(book)}
                      className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 cursor-pointer hover:shadow-md transition-all group"
                    >
                      <img src={book.coverUrl} alt={book.title} className="w-full aspect-[3/4] object-cover rounded-lg mb-3 shadow-xs" />
                      <h4 className="font-editorial text-sm font-bold text-[#1a1a1a] dark:text-[#f4f4f5] group-hover:text-[#ff6719] line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] truncate">{book.author}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-[#8c8880] dark:text-[#a1a1aa]">⭐ {book.rating}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(book.id);
                          }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Custom shelf view */}
            {activeShelfId !== 'loans' && activeShelfId !== 'wishlist' && (
              <div>
                {(() => {
                  const shelf = customShelves.find(s => s.id === activeShelfId);
                  if (!shelf) return null;
                  const shelfBooks = books.filter(b => shelf.bookIds.includes(b.id));

                  return (
                    <div className="space-y-4">
                      <div className="p-4 bg-[#faf8f5] dark:bg-[#202024] rounded-xl border border-[#eeebe3] dark:border-[#27272a]">
                        <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">{shelf.name}</h3>
                        <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] mt-1">{shelf.description || 'Rak kurasi buku pribadi pembaca.'}</p>
                      </div>

                      {shelfBooks.length === 0 ? (
                        <p className="text-center text-xs text-[#8c8880] dark:text-[#71717a] py-8">
                          Rak ini masih kosong. Buka detail buku di katalog dan klik ikon folder untuk menambahkan.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                          {shelfBooks.map(book => (
                            <div 
                              key={book.id}
                              onClick={() => onSelectBook(book)}
                              className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 cursor-pointer hover:shadow-md transition-all group"
                            >
                              <img src={book.coverUrl} alt={book.title} className="w-full aspect-[3/4] object-cover rounded-lg mb-3 shadow-xs" />
                              <h4 className="font-editorial text-sm font-bold text-[#1a1a1a] dark:text-[#f4f4f5] group-hover:text-[#ff6719] line-clamp-1">{book.title}</h4>
                              <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] truncate">{book.author}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Reviews */}
      {activeTab === 'ulasan' && (
        <div className="space-y-4">
          {userReviews.length === 0 ? (
            <p className="text-center text-xs text-[#8c8880] dark:text-[#71717a] py-12">Belum ada ulasan yang Anda tulis.</p>
          ) : (
            userReviews.map(rev => (
              <div key={rev.id} className="p-4 sm:p-5 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">{rev.bookTitle}</h4>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>
                <blockquote className="font-editorial text-sm text-[#2a2927] dark:text-[#d4d4d8] italic pl-3 border-l-2 border-[#ff6719]">
                  "{rev.comment}"
                </blockquote>
                <div className="flex items-center justify-between text-[11px] text-[#8c8880] dark:text-[#71717a] pt-2">
                  <span>Ditulis {rev.createdAt}</span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-[#ff6719] fill-current" />
                    {rev.likes} Suka dari pembaca lain
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Highlights */}
      {activeTab === 'kutipan' && (
        <div className="space-y-4">
          {userHighlights.length === 0 ? (
            <p className="text-center text-xs text-[#8c8880] dark:text-[#71717a] py-12">
              Belum ada kutipan tersimpan. Buka EPUB Reader dan klik ikon stabilo untuk mencatat kutipan berharga.
            </p>
          ) : (
            userHighlights.map(hl => (
              <div key={hl.id} className="p-4 sm:p-5 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8c8880] dark:text-[#71717a]">
                  <span className="font-bold text-[#ff6719]">{hl.bookTitle}</span>
                  <span>{hl.chapterTitle}</span>
                </div>
                <blockquote className="font-editorial text-base text-[#1a1a1a] dark:text-[#f4f4f5] italic leading-relaxed py-1">
                  "{hl.quote}"
                </blockquote>
                {hl.note && (
                  <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] bg-[#faf8f5] dark:bg-[#202024] p-2.5 rounded-lg border border-[#eeebe3] dark:border-[#27272a]">
                    <strong>Catatan:</strong> {hl.note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Badges */}
      {activeTab === 'lencana' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-[#1a1a1a] dark:text-[#f4f4f5]">Kutu Buku 2026</h4>
            <p className="text-[11px] text-[#706c64] dark:text-[#a1a1aa]">Telah membaca lebih dari 15 judul buku digital.</p>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-block">
              Tercapai ✓
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#ff6719] flex items-center justify-center border border-orange-200 dark:border-orange-900">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-[#1a1a1a] dark:text-[#f4f4f5]">Streak 14 Hari</h4>
            <p className="text-[11px] text-[#706c64] dark:text-[#a1a1aa]">Membaca berturut-turut tanpa jeda selama dua minggu.</p>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-block">
              Tercapai ✓
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-[#1a1a1a] dark:text-[#f4f4f5]">Kritikus Ulung</h4>
            <p className="text-[11px] text-[#706c64] dark:text-[#a1a1aa]">Menulis ulasan berbobot yang disukai komunitas pembaca.</p>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-block">
              Tercapai ✓
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] text-center space-y-2 opacity-60">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center border border-stone-200 dark:border-stone-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-[#1a1a1a] dark:text-[#f4f4f5]">Maraton 50 Buku</h4>
            <p className="text-[11px] text-[#706c64] dark:text-[#a1a1aa]">Target besar menyelesaikan 50 buku di Libraria.</p>
            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full inline-block">
              18/50 Buku
            </span>
          </div>
        </div>
      )}

      {/* Edit Bio Modal */}
      {isEditingBio && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#1a1a1e] max-w-md w-full rounded-2xl p-6 border border-[#ded8cb] dark:border-[#27272a] shadow-2xl space-y-4 text-xs">
            <h3 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Edit Profil Pembaca</h3>
            <div>
              <label className="font-semibold text-stone-600 dark:text-stone-300">Nama Tampilan</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] rounded-lg text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-stone-600 dark:text-stone-300">Bio Singkat</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] rounded-lg text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingBio(false)}
                className="px-3 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25252a] rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#ff6719] hover:bg-[#e85608] text-white font-semibold rounded-md shadow-xs"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Shelf Modal */}
      {showNewShelfModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateShelf} className="bg-white dark:bg-[#1a1a1e] max-w-md w-full rounded-2xl p-6 border border-[#ded8cb] dark:border-[#27272a] shadow-2xl space-y-4 text-xs">
            <h3 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Buat Rak Kustom Baru</h3>
            <div>
              <label className="font-semibold text-stone-600 dark:text-stone-300">Nama Rak</label>
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                placeholder="Contoh: Bacaan Filsafat 2026, Fiksi Akhir Pekan..."
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] rounded-lg text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-stone-600 dark:text-stone-300">Deskripsi Rak (Opsional)</label>
              <textarea
                value={newShelfDesc}
                onChange={(e) => setNewShelfDesc(e.target.value)}
                placeholder="Tujuan kurasi koleksi ini..."
                rows={2}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] rounded-lg text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewShelfModal(false)}
                className="px-3 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25252a] rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!newShelfName.trim()}
                className="px-4 py-1.5 bg-[#ff6719] hover:bg-[#e85608] disabled:opacity-50 text-white font-semibold rounded-md shadow-xs"
              >
                Buat Rak
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
