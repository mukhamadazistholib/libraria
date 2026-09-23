import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

interface LoansViewProps {
  onOpenReader: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  onNavigateTab: (tab: string) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({ onOpenReader, onSelectBook, onNavigateTab }) => {
  const { 
    currentUser, 
    loans, 
    books, 
    returnBook, 
    extendLoan, 
    systemSettings 
  } = useLibrary();

  const [activeSubTab, setActiveSubTab] = useState<'aktif' | 'riwayat'>('aktif');
  const [actionNotice, setActionNotice] = useState<{ msg: string; isError?: boolean } | null>(null);
  const [confirmReturnLoan, setConfirmReturnLoan] = useState<{ id: string; title: string } | null>(null);

  const activeLoans = loans.filter(l => l.userId === currentUser.id && l.status === 'active');
  const returnedLoans = loans.filter(l => l.userId === currentUser.id && (l.status === 'returned' || l.status === 'overdue'));

  const handleReturn = (loanId: string) => {
    const res = returnBook(loanId);
    setActionNotice({ msg: res.message, isError: !res.success });
    setConfirmReturnLoan(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExtend = (loanId: string) => {
    const res = extendLoan(loanId);
    setActionNotice({ msg: res.message, isError: !res.success });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getRemainingDays = (dueDateStr: string): number => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
      {/* Editorial Headline */}
      <div className="border-b border-[#eae6df] dark:border-[#27272a] pb-5 sm:pb-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#ff6719]">
              Sirkulasi & Rak Bacaan Anda
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
              Buku Saya & Status Peminjaman
            </h1>
            <p className="text-xs sm:text-sm text-[#59554e] dark:text-[#a1a1aa] font-sans mt-2 max-w-2xl leading-relaxed">
              Pantau batas waktu pengembalian, lanjutkan sesi membaca bab terakhir, perpanjang masa pinjam, atau kembalikan buku untuk membuka slot kuota.
            </p>
          </div>

          {/* Quota Indicator Badge */}
          <div className="bg-white dark:bg-[#1a1a1e] p-3 sm:p-3.5 rounded-xl border border-[#ded8cb] dark:border-[#27272a] shadow-xs flex items-center gap-3 self-start md:self-auto">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
                Batas Kuota Pinjam
              </span>
              <span className="font-editorial text-base sm:text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                {activeLoans.length} dari {systemSettings.maxBorrowPerUser} Buku Aktif
              </span>
            </div>
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719] flex items-center justify-center font-bold text-xs border border-[#ffd8c2] dark:border-[#ff6719]/30 flex-shrink-0">
              {systemSettings.maxBorrowPerUser - activeLoans.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#eae6df] dark:border-[#27272a] pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('aktif')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeSubTab === 'aktif'
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]'
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          Sedang Dipinjam ({activeLoans.length})
        </button>
        <button
          onClick={() => setActiveSubTab('riwayat')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeSubTab === 'riwayat'
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]'
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          Riwayat Pengembalian ({returnedLoans.length})
        </button>
      </div>

      {/* Action feedback toast */}
      {actionNotice && (
        <div className={`mb-6 p-4 rounded-xl text-xs font-medium border flex items-center justify-between shadow-xs ${
          actionNotice.isError 
            ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900' 
            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
        }`}>
          <span>{actionNotice.msg}</span>
          <button onClick={() => setActionNotice(null)} className="opacity-70 hover:opacity-100 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Active Loans Tab */}
      {activeSubTab === 'aktif' && (
        <div className="space-y-6">
          {activeLoans.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#eae6df] dark:border-[#27272a] p-8">
              <BookOpen className="w-12 h-12 text-[#bfb9ae] dark:text-[#52525b] mx-auto mb-3" />
              <h3 className="font-editorial text-xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Tidak Ada Buku yang Sedang Dipinjam</h3>
              <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] max-w-md mx-auto mt-1 leading-relaxed">
                Anda memiliki {systemSettings.maxBorrowPerUser} kuota peminjaman yang siap digunakan. Jelajahi katalog buku untuk memilih bacaan baru.
              </p>
              <button
                onClick={() => onNavigateTab('library')}
                className="mt-4 px-5 py-2.5 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                Jelajahi Katalog Buku →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {activeLoans.map(loan => {
                const book = books.find(b => b.id === loan.bookId);
                if (!book) return null;

                const remainingDays = getRemainingDays(loan.dueDate);
                const isDueSoon = remainingDays <= systemSettings.reminderDaysBeforeDue;

                return (
                  <div
                    key={loan.id}
                    className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 sm:p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top status line */}
                      <div className="flex items-center justify-between text-xs mb-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isDueSoon 
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse' 
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {remainingDays > 0 ? `Sisa ${remainingDays} Hari Lagi` : 'Jatuh Tempo Hari Ini'}
                          </span>
                          {loan.extensionsCount > 0 && (
                            <span className="text-[10px] text-[#8c8880] dark:text-[#a1a1aa] bg-[#f5f2eb] dark:bg-[#25252a] px-2 py-0.5 rounded">
                              Diperpanjang +{systemSettings.maxExtendDays}h
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-[#8c8880] dark:text-[#71717a]">
                          Jatuh tempo: {new Date(loan.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Book detail row */}
                      <div className="flex items-start gap-3.5 sm:gap-4">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          onClick={() => onSelectBook(book)}
                          className="w-16 sm:w-20 h-22 sm:h-28 object-cover rounded-lg shadow-xs flex-shrink-0 cursor-pointer hover:scale-102 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#ff6719] tracking-wider">
                            {book.categoryName}
                          </span>
                          <h3 
                            onClick={() => onSelectBook(book)}
                            className="font-editorial text-base sm:text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5] hover:text-[#ff6719] transition-colors leading-snug cursor-pointer line-clamp-2"
                          >
                            {book.title}
                          </h3>
                          <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] mt-0.5">Oleh {book.author}</p>

                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[11px] text-[#706c64] dark:text-[#a1a1aa] mb-1">
                              <span>Progres Membaca</span>
                              <span className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">{loan.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-[#f0ede6] dark:bg-[#28282d] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#ff6719] h-full rounded-full transition-all duration-300"
                                style={{ width: `${loan.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="mt-5 sm:mt-6 pt-4 border-t border-[#f4f2ee] dark:border-[#27272a] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => onOpenReader(book)}
                        className="px-3.5 sm:px-4 py-2 bg-[#ff6719] hover:bg-[#e85608] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Buka & Lanjut Baca</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {systemSettings.allowExtendLoan && loan.extensionsCount === 0 && (
                          <button
                            onClick={() => handleExtend(loan.id)}
                            className="px-3 py-2 bg-[#f4f1ea] dark:bg-[#202024] hover:bg-[#eae6dc] dark:hover:bg-[#28282e] text-[#333] dark:text-[#f4f4f5] font-medium rounded-lg transition-colors border border-[#ded8cc] dark:border-[#333]"
                            title="Perpanjang batas waktu peminjaman"
                          >
                            +{systemSettings.maxExtendDays}h
                          </button>
                        )}

                        <button
                          onClick={() => setConfirmReturnLoan({ id: loan.id, title: book.title })}
                          className="px-3 py-2 bg-white dark:bg-[#1a1a1e] hover:bg-stone-50 dark:hover:bg-[#25252b] text-stone-700 dark:text-stone-300 font-medium rounded-lg transition-colors border border-[#ded8cb] dark:border-[#333]"
                          title="Kembalikan buku sekarang"
                        >
                          Kembalikan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Business Rules Explanation Card */}
          <div className="p-4 sm:p-5 bg-[#faf7f0] dark:bg-[#1c1c20] border border-[#e6dfd1] dark:border-[#27272a] rounded-xl flex items-start gap-3 sm:gap-4 text-xs text-[#59554e] dark:text-[#a1a1aa]">
            <ShieldCheck className="w-5 h-5 text-[#ff6719] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Ketentuan Peminjaman Digital Libraria</h4>
              <p className="leading-relaxed">
                • Kuota maksimal: {systemSettings.maxBorrowPerUser} buku aktif secara bersamaan per akun pembaca.
                <br />
                • Durasi masa pinjam: {systemSettings.borrowDurationDays} hari sejak tanggal peminjaman.
                <br />
                • Pengembalian Otomatis (Auto-Return): Sistem otomatis melepaskan slot peminjaman begitu tanggal jatuh tempo terlewati melalui cron scheduler harian.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Returned Loans History Tab */}
      {activeSubTab === 'riwayat' && (
        <div className="space-y-3 sm:space-y-4">
          {returnedLoans.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#eae6df] dark:border-[#27272a] p-6 text-xs text-[#8c8880] dark:text-[#71717a]">
              Belum ada riwayat buku yang selesai dipinjam atau dikembalikan.
            </div>
          ) : (
            returnedLoans.map(loan => {
              const book = books.find(b => b.id === loan.bookId);
              if (!book) return null;

              return (
                <div
                  key={loan.id}
                  className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded shadow-xs flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-editorial text-sm font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">{book.title}</h4>
                      <p className="text-xs text-[#59554e] dark:text-[#a1a1aa]">Karya {book.author}</p>
                      <p className="text-[11px] text-[#8c8880] dark:text-[#71717a] mt-0.5">
                        Dipinjam: {new Date(loan.borrowedAt).toLocaleDateString('id-ID')} • Dikembalikan: {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString('id-ID') : 'Selesai'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f4f2ee] dark:border-[#27272a]">
                    <span className="text-xs px-2.5 py-1 rounded bg-[#eef8ee] dark:bg-[#142616] text-[#1b5e20] dark:text-[#4ade80] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Telah Dikembalikan</span>
                    </span>

                    <button
                      onClick={() => onSelectBook(book)}
                      className="px-3 py-1.5 bg-[#f4f1ea] dark:bg-[#202024] hover:bg-[#eae6dc] dark:hover:bg-[#28282e] text-xs font-semibold rounded-md border border-[#ded8cc] dark:border-[#333] text-[#1a1a1a] dark:text-[#f4f4f5] transition-colors"
                    >
                      Pinjam Ulang
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* In-app Return Confirmation Modal (iframe-safe, no native alert/confirm) */}
      {confirmReturnLoan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#ded8cb] dark:border-[#27272a] p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
              Kembalikan Buku Lebih Awal?
            </h3>
            <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] leading-relaxed">
              Apakah Anda yakin ingin mengembalikan buku <strong>"{confirmReturnLoan.title}"</strong>? Slot kuota peminjaman Anda akan langsung terbebas.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmReturnLoan(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#59554e] dark:text-[#a1a1aa] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleReturn(confirmReturnLoan.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff6719] hover:bg-[#e85608] text-white shadow-xs transition-colors"
              >
                Ya, Kembalikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
