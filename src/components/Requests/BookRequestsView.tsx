import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookRequest } from '../../types';
import { 
  Plus, 
  ThumbsUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Search 
} from 'lucide-react';

export const BookRequestsView: React.FC = () => {
  const { 
    currentUser, 
    bookRequests, 
    createBookRequest, 
    toggleUpvoteRequest 
  } = useLibrary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'diajukan' | 'ditinjau' | 'disetujui' | 'ditolak'>('all');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !reason.trim()) return;
    createBookRequest(title.trim(), author.trim(), reason.trim());
    setTitle('');
    setAuthor('');
    setReason('');
    setShowModal(false);
  };

  const filteredRequests = bookRequests
    .filter(req => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return req.title.toLowerCase().includes(q) || req.author.toLowerCase().includes(q) || req.userName.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => b.upvotes - a.upvotes);

  const getStatusBadge = (status: BookRequest['status']) => {
    switch (status) {
      case 'disetujui':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#eef8ee] dark:bg-[#142616] text-[#1b5e20] dark:text-[#4ade80] border border-[#c4e8c4] dark:border-[#25572b] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Disetujui</span>
          </span>
        );
      case 'ditinjau':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#fff8e6] dark:bg-[#261e0e] text-[#b37400] dark:text-amber-400 border border-[#fbe4a8] dark:border-[#4d3810] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Ditinjau</span>
          </span>
        );
      case 'ditolak':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#fdf0f0] dark:bg-[#2e1515] text-[#b71c1c] dark:text-[#f87171] border border-[#f8c8c8] dark:border-[#522020] flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Ditolak</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#f4f1ea] dark:bg-[#202024] text-[#6b6760] dark:text-[#a1a1aa] border border-[#ded8cb] dark:border-[#333] flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Diajukan</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
      {/* Header section */}
      <div className="border-b border-[#eae6df] dark:border-[#27272a] pb-5 sm:pb-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#ff6719]">
              Suara Komunitas Pembaca
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
              Usulan & Permintaan Buku Baru
            </h1>
            <p className="text-xs sm:text-sm text-[#59554e] dark:text-[#a1a1aa] font-sans mt-2 max-w-2xl leading-relaxed">
              Dukung usulan buku dari sesama pembaca melalui upvote. Judul dengan dukungan terbanyak akan diprioritaskan untuk pengadaan lisensi digital EPUB oleh pustakawan admin.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Usulkan Buku Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8880] dark:text-[#71717a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, penulis, pengusul..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1a1a1e] border border-[#ded8cb] dark:border-[#27272a] rounded-lg text-xs text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0 scrollbar-none">
          {(['all', 'diajukan', 'ditinjau', 'disetujui', 'ditolak'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full capitalize font-medium border transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-white'
                  : 'bg-white dark:bg-[#1a1a1e] text-[#59554e] dark:text-[#a1a1aa] border-[#ded8cb] dark:border-[#27272a] hover:bg-[#faf7f2] dark:hover:bg-[#202024]'
              }`}
            >
              {status === 'all' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredRequests.map(req => {
          const hasUpvoted = req.upvotedBy.includes(currentUser.id);

          return (
            <div
              key={req.id}
              className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#d6d0c4] dark:hover:border-[#3f3f46] transition-all overflow-hidden w-full max-w-full"
            >
              <div className="space-y-3 min-w-0 w-full overflow-hidden">
                <div className="flex items-start justify-between gap-2 min-w-0 w-full overflow-hidden">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5] leading-tight truncate block max-w-full">
                      {req.title}
                    </h3>
                    <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] mt-0.5 truncate block max-w-full">Penulis: <strong>{req.author}</strong></p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(req.status)}
                  </div>
                </div>

                <p className="text-xs text-[#59554e] dark:text-[#d4d4d8] font-sans leading-relaxed bg-[#faf8f5] dark:bg-[#202024] p-3 rounded-lg border border-[#eeebe3] dark:border-[#2e2e33] break-words">
                  "{req.reason}"
                </p>

                {req.adminNote && (
                  <div className="p-3 bg-[#f0f7ff] dark:bg-[#111f33] rounded-lg border border-[#d0e5ff] dark:border-[#1d3d66] text-[11px] text-[#004085] dark:text-[#93c5fd] break-words">
                    <strong>Catatan Pustakawan:</strong> {req.adminNote}
                  </div>
                )}
              </div>

              {/* Bottom Byline + Upvote Bar */}
              <div className="pt-3 border-t border-[#f4f2ee] dark:border-[#27272a] flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                  <img
                    src={req.userAvatar}
                    alt={req.userName}
                    className="w-5 h-5 rounded-full object-cover aspect-square flex-shrink-0"
                  />
                  <span className="text-[#8c8880] dark:text-[#a1a1aa] text-[11px] truncate">Oleh <strong>{req.userName}</strong></span>
                </div>

                <button
                  onClick={() => toggleUpvoteRequest(req.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 whitespace-nowrap ${
                    hasUpvoted
                      ? 'bg-[#ff6719] text-white border-[#ff6719] shadow-xs'
                      : 'bg-white dark:bg-[#202024] hover:bg-[#faf8f5] dark:hover:bg-[#28282e] text-[#59554e] dark:text-[#a1a1aa] border-[#ded8cb] dark:border-[#333]'
                  }`}
                  title="Dukung buku ini"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
                  <span>{req.upvotes} Dukungan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Usulkan Buku */}
      {showModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1e] max-w-lg w-full rounded-2xl p-6 border border-[#ded8cb] dark:border-[#27272a] shadow-2xl space-y-4 text-xs">
            <div className="border-b border-stone-200 dark:border-[#27272a] pb-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#ff6719]">
                Formulir Usulan Koleksi
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-0.5">
                Usulkan Buku EPUB Baru
              </h3>
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-stone-300">Judul Buku</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Man's Search for Meaning"
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] rounded-lg text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-stone-300">Nama Penulis</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Contoh: Viktor E. Frankl"
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] rounded-lg text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-stone-300">Alasan & Signifikansi</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan signifikansi isi buku atau manfaatnya bagi pembaca lain di Libraria..."
                rows={3}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] rounded-lg text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-[#27272a]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3.5 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25252a] rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !author.trim() || !reason.trim()}
                className="px-4 py-2 bg-[#ff6719] hover:bg-[#e85608] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs"
              >
                Kirim Usulan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
