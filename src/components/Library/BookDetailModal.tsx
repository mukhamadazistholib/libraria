import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { 
  X, 
  Star, 
  Bookmark, 
  BookOpen, 
  ShieldCheck, 
  Heart, 
  FolderPlus, 
  Check 
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose, onOpenReader }) => {
  const { 
    currentUser, 
    loans, 
    borrowBook, 
    wishlistBookIds, 
    toggleWishlist,
    reviews,
    addReview,
    toggleLikeReview,
    customShelves,
    addBookToShelf,
    systemSettings 
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'sinopsis' | 'ulasan' | 'spesifikasi'>('sinopsis');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [borrowMsg, setBorrowMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [showShelfPicker, setShowShelfPicker] = useState<boolean>(false);

  const bookReviews = reviews.filter(r => r.bookId === book.id);
  const isWishlisted = wishlistBookIds.includes(book.id);
  const activeLoan = loans.find(l => l.userId === currentUser.id && l.bookId === book.id && l.status === 'active');
  const isAvailable = book.availableCopies > 0;

  const handleBorrow = () => {
    const res = borrowBook(book.id);
    setBorrowMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setTimeout(() => setBorrowMsg(null), 5000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    addReview(book.id, newRating, newComment.trim());
    setNewComment('');
    setIsSubmittingReview(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-[#fffdfa] dark:bg-[#18181c] text-[#1a1a1a] dark:text-[#f4f4f5] w-full max-w-3xl rounded-2xl border border-[#ded8cb] dark:border-[#27272a] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors">
        {/* Top bar with close button */}
        <div className="p-3.5 sm:px-6 border-b border-[#eae6df] dark:border-[#27272a] flex items-center justify-between bg-white dark:bg-[#141416]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#ff6719] px-2 py-0.5 rounded bg-[#fff0e6] dark:bg-[#ff6719]/15">
              {book.categoryName}
            </span>
            <span className="text-xs text-[#8c8880] dark:text-[#71717a]">ISBN: {book.isbn}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8c8880] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-7 space-y-6">
          {/* Hero Row: Cover + Key Meta */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
            <div className="relative w-32 sm:w-44 aspect-[3/4] flex-shrink-0 mx-auto sm:mx-0">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover rounded-xl shadow-md border border-[#e2ddd3] dark:border-[#27272a]"
              />
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div>
                <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] leading-tight">
                  {book.title}
                </h2>
                <p className="text-sm font-medium text-[#59554e] dark:text-[#a1a1aa] mt-1 font-sans">
                  Karya <span className="text-[#1a1a1a] dark:text-white font-semibold">{book.author}</span> ({book.publishedYear})
                </p>
              </div>

              {/* Rating & Availability Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fff8e6] dark:bg-[#261e0e] text-[#b37400] dark:text-amber-400 rounded-md text-xs font-bold border border-[#fae8b8] dark:border-[#4d3810]">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{book.rating}</span>
                  <span className="text-[#8c8880] dark:text-[#a1a1aa] font-normal">({book.ratingCount} ulasan)</span>
                </div>

                <div className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  isAvailable 
                    ? 'bg-emerald-50 dark:bg-[#142616] text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700'
                }`}>
                  {isAvailable 
                    ? `Tersedia: ${book.availableCopies} dari ${book.totalCopies} slot` 
                    : 'Semua eksemplar sedang dipinjam'}
                </div>

                <div className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
                  Dipinjam {book.borrowCount} kali
                </div>
              </div>

              {/* Borrow feedback message */}
              {borrowMsg && (
                <div className={`p-3 rounded-lg text-xs font-medium ${
                  borrowMsg.error 
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900' 
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                }`}>
                  {borrowMsg.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                {activeLoan ? (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReader(book);
                    }}
                    className="px-4 sm:px-5 py-2.5 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Lanjut Baca ({activeLoan.progressPercentage}%)</span>
                  </button>
                ) : isAvailable ? (
                  <button
                    onClick={handleBorrow}
                    className="px-4 sm:px-5 py-2.5 bg-[#1a1a1a] dark:bg-white hover:bg-[#333333] dark:hover:bg-[#e4e4e7] text-white dark:text-[#1a1a1a] text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Pinjam Buku ({systemSettings.borrowDurationDays} Hari)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setBorrowMsg({ text: `Anda telah terdaftar dalam daftar tunggu "${book.title}". Kami akan mengirimkan notifikasi saat ada eksemplar yang dikembalikan.`, error: false })}
                    className="px-4 sm:px-5 py-2.5 bg-[#eae6df] dark:bg-[#27272a] hover:bg-[#ded9cf] text-[#4a4742] dark:text-[#d4d4d8] text-xs font-semibold rounded-lg transition-all"
                  >
                    Antre / Notifikasi
                  </button>
                )}

                {/* Sample Preview button */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenReader(book);
                  }}
                  className="px-3.5 sm:px-4 py-2.5 bg-white dark:bg-[#202024] border border-[#ded8cb] dark:border-[#333] hover:bg-[#f7f4ed] dark:hover:bg-[#28282e] text-xs font-semibold text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg transition-colors"
                >
                  Pratinjau EPUB
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(book.id)}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isWishlisted 
                      ? 'border-[#ff6719] bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719]' 
                      : 'border-[#ded8cb] dark:border-[#333] hover:bg-[#f7f4ed] dark:hover:bg-[#202024] text-[#706c64] dark:text-[#a1a1aa]'
                  }`}
                  title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>

                {/* Add to custom shelf picker toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowShelfPicker(!showShelfPicker)}
                    className="p-2.5 rounded-lg border border-[#ded8cb] dark:border-[#333] hover:bg-[#f7f4ed] dark:hover:bg-[#202024] text-[#706c64] dark:text-[#a1a1aa] transition-colors"
                    title="Tambahkan ke Rak Kustom"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>

                  {showShelfPicker && (
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#202024] rounded-lg shadow-xl border border-[#ded8cb] dark:border-[#333] p-2 z-30">
                      <p className="text-[11px] font-bold text-[#8c8880] dark:text-[#a1a1aa] px-2 py-1 uppercase">Pilih Rak Buku</p>
                      {customShelves.map(shelf => (
                        <button
                          key={shelf.id}
                          onClick={() => {
                            addBookToShelf(shelf.id, book.id);
                            setShowShelfPicker(false);
                            setBorrowMsg({ text: `Buku "${book.title}" berhasil dimasukkan ke rak "${shelf.name}"!`, error: false });
                            setTimeout(() => setBorrowMsg(null), 4000);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-[#f7f4ed] dark:hover:bg-[#28282e] text-[#1a1a1a] dark:text-[#f4f4f5] flex items-center justify-between"
                        >
                          <span className="truncate">{shelf.name}</span>
                          {shelf.bookIds.includes(book.id) && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Substack Tab Navigation (Sinopsis, Ulasan, Spesifikasi) */}
          <div className="border-b border-[#eae6df] dark:border-[#27272a]">
            <div className="flex items-center gap-4 sm:gap-6 text-xs overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('sinopsis')}
                className={`pb-2.5 font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'sinopsis' 
                    ? 'text-[#ff6719] border-b-2 border-[#ff6719]' 
                    : 'text-[#706c64] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white'
                }`}
              >
                Sinopsis
              </button>
              <button
                onClick={() => setActiveTab('ulasan')}
                className={`pb-2.5 font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'ulasan' 
                    ? 'text-[#ff6719] border-b-2 border-[#ff6719]' 
                    : 'text-[#706c64] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white'
                }`}
              >
                Ulasan Pembaca ({bookReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('spesifikasi')}
                className={`pb-2.5 font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'spesifikasi' 
                    ? 'text-[#ff6719] border-b-2 border-[#ff6719]' 
                    : 'text-[#706c64] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white'
                }`}
              >
                Spesifikasi & Lisensi
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === 'sinopsis' && (
            <div className="space-y-4">
              <div className="text-xs sm:text-sm text-[#383531] dark:text-[#d4d4d8] leading-relaxed font-sans">
                <p>{book.description}</p>
              </div>

              {/* Sample Chapters Table of Contents */}
              <div className="mt-4 pt-4 border-t border-[#f4f2ee] dark:border-[#27272a]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c8880] dark:text-[#a1a1aa] mb-2.5">
                  Daftar Isi & Pratinjau Bab
                </h4>
                <div className="divide-y divide-[#f4f2ee] dark:divide-[#27272a] border border-[#ded8cb] dark:border-[#27272a] rounded-lg bg-white dark:bg-[#1f1f23] overflow-hidden">
                  {book.chapters.map((chap, idx) => (
                    <div 
                      key={chap.id}
                      onClick={() => {
                        onClose();
                        onOpenReader(book);
                      }}
                      className="p-3 text-xs flex items-center justify-between hover:bg-[#faf7f2] dark:hover:bg-[#28282e] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-editorial text-sm font-bold text-[#8c8880] dark:text-[#71717a] w-5">
                          {idx + 1}.
                        </span>
                        <span className="font-medium text-[#1a1a1a] dark:text-[#f4f4f5]">{chap.title}</span>
                      </div>
                      <span className="text-[11px] text-[#8c8880] dark:text-[#71717a]">{chap.readTimeMinutes} menit</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ulasan' && (
            <div className="space-y-5 sm:space-y-6">
              {/* Form to submit review */}
              <form onSubmit={handleSubmitReview} className="p-4 bg-white dark:bg-[#1f1f23] rounded-xl border border-[#ded8cb] dark:border-[#27272a] space-y-3">
                <h4 className="text-xs font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Tulis Ulasan Anda</h4>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#706c64] dark:text-[#a1a1aa]">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-0.5 focus:outline-none"
                      >
                        <Star className={`w-4 h-4 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bagikan pandangan Anda tentang buku ini (apa yang Anda pelajari, bab favorit, gaya kepenulisan)..."
                  rows={3}
                  className="w-full p-3 text-xs bg-[#faf8f5] dark:bg-[#141416] border border-[#ded8cb] dark:border-[#27272a] rounded-lg text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="px-4 py-2 bg-[#ff6719] hover:bg-[#e85608] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3 sm:space-y-4">
                {bookReviews.length === 0 ? (
                  <p className="text-xs text-center text-[#8c8880] dark:text-[#71717a] py-6">
                    Belum ada ulasan untuk buku ini. Jadilah yang pertama memberikan ulasan!
                  </p>
                ) : (
                  bookReviews.map(rev => {
                    const hasLiked = rev.likedBy.includes(currentUser.id);
                    return (
                      <div key={rev.id} className="p-4 bg-white dark:bg-[#1f1f23] rounded-xl border border-[#ded8cb] dark:border-[#27272a] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.userAvatar}
                              alt={rev.userName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-xs font-semibold text-[#1a1a1a] dark:text-[#f4f4f5]">{rev.userName}</p>
                              <p className="text-[10px] text-[#8c8880] dark:text-[#71717a]">{rev.userHandle} • {rev.createdAt}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{rev.rating}.0</span>
                          </div>
                        </div>

                        <p className="font-editorial text-sm text-[#2a2927] dark:text-[#d4d4d8] leading-relaxed pt-1">
                          "{rev.comment}"
                        </p>

                        <div className="pt-2 flex items-center justify-between text-xs text-[#706c64] dark:text-[#a1a1aa]">
                          <button
                            onClick={() => toggleLikeReview(rev.id)}
                            className={`flex items-center gap-1.5 hover:text-[#1a1a1a] dark:hover:text-white transition-colors ${
                              hasLiked ? 'text-[#ff6719] font-semibold' : ''
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                            <span>{rev.likes} Suka</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'spesifikasi' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-[#1f1f23] rounded-lg border border-[#ded8cb] dark:border-[#27272a]">
                  <p className="text-[#8c8880] dark:text-[#a1a1aa]">Format Berkas Digital</p>
                  <p className="font-semibold text-[#1a1a1a] dark:text-[#f4f4f5] mt-0.5">EPUB 3.0 Reflowable Text</p>
                </div>
                <div className="p-3 bg-white dark:bg-[#1f1f23] rounded-lg border border-[#ded8cb] dark:border-[#27272a]">
                  <p className="text-[#8c8880] dark:text-[#a1a1aa]">Bahasa Dokumen</p>
                  <p className="font-semibold text-[#1a1a1a] dark:text-[#f4f4f5] mt-0.5">{book.language}</p>
                </div>
                <div className="p-3 bg-white dark:bg-[#1f1f23] rounded-lg border border-[#ded8cb] dark:border-[#27272a]">
                  <p className="text-[#8c8880] dark:text-[#a1a1aa]">Jumlah Halaman Fisik</p>
                  <p className="font-semibold text-[#1a1a1a] dark:text-[#f4f4f5] mt-0.5">{book.pages} halaman</p>
                </div>
                <div className="p-3 bg-white dark:bg-[#1f1f23] rounded-lg border border-[#ded8cb] dark:border-[#27272a]">
                  <p className="text-[#8c8880] dark:text-[#a1a1aa]">Tahun Penerbitan</p>
                  <p className="font-semibold text-[#1a1a1a] dark:text-[#f4f4f5] mt-0.5">{book.publishedYear}</p>
                </div>
              </div>

              {/* Security info box */}
              <div className="p-4 bg-[#f8f6f0] dark:bg-[#1c1c20] border border-[#e4ded0] dark:border-[#27272a] rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Keamanan Aset Digital (Cloudflare R2 Presigned)</h4>
                  <p className="text-[#59554e] dark:text-[#a1a1aa] leading-relaxed text-[11px]">
                    Berkas EPUB tersimpan secara privat di bucket Cloudflare R2 tanpa akses URL publik. Akses baca streaming hanya diizinkan melalui presigned token berdurasi terbatas (10 menit) yang divalidasi oleh endpoint sistem berdasarkan lisensi peminjaman aktif.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:px-6 bg-[#f7f4ed] dark:bg-[#141416] border-t border-[#eae6df] dark:border-[#27272a] flex items-center justify-between text-xs text-[#706c64] dark:text-[#a1a1aa]">
          <span className="text-[11px]">Masa pinjam: {systemSettings.borrowDurationDays} hari (Auto-return).</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-[#202024] border border-[#ded8cb] dark:border-[#333] hover:bg-[#eeebe3] dark:hover:bg-[#28282e] rounded-lg font-medium text-[#1a1a1a] dark:text-[#f4f4f5] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
