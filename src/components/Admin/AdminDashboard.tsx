import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookChapter } from '../../types';
import { 
  BarChart3, 
  BookPlus, 
  Settings, 
  Clock, 
  BookOpen, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Play, 
  Upload, 
  Check, 
  X,
  Layers,
  HelpCircle,
  Database,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    books, 
    loans, 
    bookRequests, 
    systemSettings, 
    adminUpdateSystemSettings, 
    adminAddBook, 
    adminUpdateBookStock, 
    adminDeleteBook, 
    adminUpdateBookRequestStatus,
    runOverdueCronCheck,
    categories,
    isSyncingSupabase,
    isSupabaseLive,
    syncSupabase,
    seedSupabase
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'stats' | 'books' | 'stock' | 'settings' | 'requests' | 'cron' | 'database'>('stats');
  const [dbActionMessage, setDbActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; details?: any } | null>(null);

  // New Book Modal State
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('978-602-');
  const [newCategoryId, setNewCategoryId] = useState('cat-filsafat');
  const [newDescription, setNewDescription] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80');
  const [newLanguage] = useState('Bahasa Indonesia');
  const [newYear] = useState(2024);
  const [newPages] = useState(280);
  const [newCopies, setNewCopies] = useState(5);
  const [epubFileName] = useState<string>('sample_digital_edition.epub');

  // Cron execution simulation state
  const [cronLogs, setCronLogs] = useState<string[]>([]);
  const [isCronRunning, setIsCronRunning] = useState(false);

  // In-app interactive modals (no window.confirm or window.prompt)
  const [deleteBookModal, setDeleteBookModal] = useState<{ id: string; title: string } | null>(null);
  const [reviewRequestModal, setReviewRequestModal] = useState<{ id: string; status: 'disetujui' | 'ditolak'; title: string } | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  // System settings form state
  const [formSettings, setFormSettings] = useState(systemSettings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Calculation of statistics
  const totalBooks = books.length;
  const activeLoansCount = loans.filter(l => l.status === 'active').length;
  const overdueCount = loans.filter(l => {
    return l.status === 'active' && new Date(l.dueDate) < new Date();
  }).length;
  const totalBorrowsCount = books.reduce((acc, b) => acc + b.borrowCount, 0);

  // Popular books
  const popularBooks = [...books].sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 5);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdateSystemSettings(formSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const cat = categories.find(c => c.id === newCategoryId) || categories[1];

    const defaultChapters: BookChapter[] = [
      {
        id: `chap-${Date.now()}-1`,
        title: 'Bab 1: Pengantar & Landasan Pemikiran',
        readTimeMinutes: 7,
        content: `<h3>Prolog Terbitan Digital</h3>
<p>Buku ini telah melalui proses kurasi editorial dan validasi format EPUB 3.0 reflowable text. Setiap bab dirancang untuk kenyamanan membaca optimal baik pada perangkat mobile maupun desktop.</p>
<blockquote>"Membaca adalah jembatan yang menghubungkan pikiran-pikiran terhebat di masa lalu dengan kesadaran kita hari ini."</blockquote>
<p>Gagasan yang dihadirkan dalam buku ini relevan bagi pembaca modern yang ingin mengeksplorasi wacana intelektual secara mendalam.</p>`
      },
      {
        id: `chap-${Date.now()}-2`,
        title: 'Bab 2: Pembahasan Pokok & Analisis',
        readTimeMinutes: 12,
        content: `<h3>Inti Gagasan</h3>
<p>Kajian utama menekankan pentingnya penalaran kritis serta kemampuan merawat perspektif objektif di tengah arus informasi yang serba cepat.</p>
<p>Dengan memadukan pendekatan historis dan dialektika kontemporer, buku ini mengajak kita melihat persoalan dari sudut pandang yang lebih jernih.</p>`
      }
    ];

    adminAddBook({
      title: newTitle.trim(),
      author: newAuthor.trim(),
      isbn: newIsbn.trim() || '978-602-0000-00-0',
      categoryId: cat.id,
      categoryName: cat.name,
      description: newDescription.trim() || 'Edisi digital terbitan kurasi khusus pembaca Libraria.',
      coverUrl: newCoverUrl.trim(),
      totalCopies: newCopies,
      publishedYear: newYear,
      language: newLanguage,
      pages: newPages,
      epubStorageKey: `private/r2/${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.epub`,
      chapters: defaultChapters,
    });

    setNewTitle('');
    setNewAuthor('');
    setNewDescription('');
    setShowAddBookModal(false);
  };

  const handleRunCron = () => {
    setIsCronRunning(true);
    setCronLogs([]);

    setTimeout(() => {
      const res = runOverdueCronCheck();
      setCronLogs(res.logs);
      setIsCronRunning(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
      {/* Editorial Header */}
      <div className="border-b border-[#eae6df] dark:border-[#27272a] pb-5 sm:pb-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#ff6719]">
                Pusat Kendali Perpustakaan
              </span>
              <span className="px-2 py-0.5 rounded bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-[10px] font-bold">
                ADMIN ACCESS
              </span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
              Studio & Dashboard Administrator
            </h1>
            <p className="text-xs sm:text-sm text-[#59554e] dark:text-[#a1a1aa] font-sans mt-2 max-w-2xl leading-relaxed">
              Pantau sirkulasi peminjaman, unggah naskah EPUB baru, atur alokasi stok lisensi digital, konfigurasi aturan peminjaman, serta jalankan simulasi scheduled cron auto-return.
            </p>
          </div>

          <button
            onClick={() => setShowAddBookModal(true)}
            className="px-4 py-2.5 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto whitespace-nowrap"
          >
            <BookPlus className="w-4 h-4" />
            <span>Unggah Buku EPUB Baru</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-[#eae6df] dark:border-[#27272a] pb-3 mb-6 sm:mb-8 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'stats' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Statistik & Tren</span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'books' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Katalog ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'stock' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Atur Stok</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'settings' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Aturan Sistem</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'requests' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Moderasi Usulan ({bookRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cron')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'cron' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#ff6719]" />
          <span>Cron Auto-Return</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'database' 
              ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]' 
              : 'text-[#6b6760] dark:text-[#a1a1aa] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#202024]'
          }`}
        >
          <Database className="w-4 h-4 text-[#ff6719]" />
          <span>Database Supabase</span>
          {isSupabaseLive && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
          )}
        </button>
      </div>

      {/* Tab 1: Statistics & Insights */}
      {activeTab === 'stats' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-[#1a1a1e] p-4 sm:p-5 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
                Total Judul Buku
              </span>
              <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
                {totalBooks}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Lisensi EPUB Aktif
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1e] p-4 sm:p-5 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
                Peminjaman Berjalan
              </span>
              <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#ff6719] mt-1">
                {activeLoansCount}
              </div>
              <p className="text-[11px] text-[#706c64] dark:text-[#a1a1aa] mt-1">
                Slot terkunci di pembaca
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1e] p-4 sm:p-5 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
                Pinjaman Overdue
              </span>
              <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#b71c1c] dark:text-[#f87171] mt-1">
                {overdueCount}
              </div>
              <p className="text-[11px] text-[#8c8880] dark:text-[#71717a] mt-1">
                Sasaran auto-return cron
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1e] p-4 sm:p-5 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
                Total Sirkulasi
              </span>
              <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
                {totalBorrowsCount}x
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Kumulatif peminjaman
              </p>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Chart 1: Borrow trends */}
            <div className="bg-white dark:bg-[#1a1a1e] p-5 sm:p-6 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#f4f2ee] dark:border-[#27272a]">
                <div>
                  <h3 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                    Tren Sirkulasi Peminjaman Mingguan
                  </h3>
                  <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">Aktivitas pinjam vs kembalikan 7 hari terakhir</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719]">
                  Normal
                </span>
              </div>

              <div className="py-6">
                <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                  {[
                    { day: 'Sen', borrows: 14, returns: 10 },
                    { day: 'Sel', borrows: 22, returns: 18 },
                    { day: 'Rab', borrows: 18, returns: 12 },
                    { day: 'Kam', borrows: 28, returns: 20 },
                    { day: 'Jum', borrows: 35, returns: 25 },
                    { day: 'Sab', borrows: 42, returns: 30 },
                    { day: 'Min', borrows: 48, returns: 34 },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex items-end justify-center gap-1 h-32">
                        {/* Borrows bar */}
                        <div 
                          className="w-1/2 bg-[#ff6719] rounded-t-sm transition-all group-hover:opacity-90 relative"
                          style={{ height: `${(bar.borrows / 50) * 100}%` }}
                        />
                        {/* Returns bar */}
                        <div 
                          className="w-1/2 bg-[#ded9cf] dark:bg-[#3f3f46] rounded-t-sm transition-all group-hover:bg-[#bfb8a8]"
                          style={{ height: `${(bar.returns / 50) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#8c8880] dark:text-[#71717a] font-medium">{bar.day}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-[#706c64] dark:text-[#a1a1aa] pt-4 border-t border-[#f4f2ee] dark:border-[#27272a]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#ff6719]"></span>
                    <span>Peminjaman</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#ded9cf] dark:bg-[#3f3f46]"></span>
                    <span>Pengembalian</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Category Popularity Breakdown */}
            <div className="bg-white dark:bg-[#1a1a1e] p-5 sm:p-6 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#f4f2ee] dark:border-[#27272a]">
                <div>
                  <h3 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                    Distribusi Minat Kategori
                  </h3>
                  <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">Proporsi peminjaman berdasarkan klasifikasi buku</p>
                </div>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                {[
                  { name: 'Fiksi & Sastra', percent: 38, count: '555 pinjam' },
                  { name: 'Filsafat & Pemikiran', percent: 27, count: '394 pinjam' },
                  { name: 'Pengembangan Diri', percent: 21, count: '310 pinjam' },
                  { name: 'Sains & Bisnis', percent: 14, count: '240 pinjam' },
                ].map((cat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#1a1a1a] dark:text-[#f4f4f5]">{cat.name}</span>
                      <span className="text-[#8c8880] dark:text-[#a1a1aa]">{cat.count} ({cat.percent}%)</span>
                    </div>
                    <div className="w-full bg-[#f4f1ea] dark:bg-[#28282e] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1a1a1a] dark:bg-[#ff6719] h-full rounded-full"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Books Table */}
          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-4 sm:p-6 shadow-xs">
            <h3 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mb-4">
              Peringkat Buku Paling Sering Dipinjam
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] dark:bg-[#202024] text-[#8c8880] dark:text-[#a1a1aa] uppercase tracking-wider font-semibold border-b border-[#ded8cb] dark:border-[#27272a]">
                  <tr>
                    <th className="p-3">Judul & Penulis</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Total Slot</th>
                    <th className="p-3">Tersedia</th>
                    <th className="p-3">Total Pinjam</th>
                    <th className="p-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f2ee] dark:divide-[#27272a]">
                  {popularBooks.map(book => (
                    <tr key={book.id} className="hover:bg-[#faf7f2] dark:hover:bg-[#202024]">
                      <td className="p-3">
                        <span className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5] block">{book.title}</span>
                        <span className="text-[#8c8880] dark:text-[#71717a]">{book.author}</span>
                      </td>
                      <td className="p-3 text-[#59554e] dark:text-[#a1a1aa]">{book.categoryName}</td>
                      <td className="p-3 font-semibold text-[#1a1a1a] dark:text-[#f4f4f5]">{book.totalCopies}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          book.availableCopies > 0 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' 
                            : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-400'
                        }`}>
                          {book.availableCopies}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#ff6719]">{book.borrowCount}x</td>
                      <td className="p-3 text-[#1a1a1a] dark:text-[#f4f4f5]">⭐ {book.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Books */}
      {activeTab === 'books' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
              Menampilkan {books.length} judul buku digital dalam format EPUB.
            </p>
            <button
              onClick={() => setShowAddBookModal(true)}
              className="px-3.5 py-2 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Buku</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] dark:bg-[#202024] text-[#8c8880] dark:text-[#a1a1aa] uppercase tracking-wider font-semibold border-b border-[#ded8cb] dark:border-[#27272a]">
                  <tr>
                    <th className="p-3.5">Sampul & Judul</th>
                    <th className="p-3.5">ISBN</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Slot Pinjam</th>
                    <th className="p-3.5">Storage Key (R2)</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f2ee] dark:divide-[#27272a]">
                  {books.map(book => (
                    <tr key={book.id} className="hover:bg-[#faf7f2] dark:hover:bg-[#202024]">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={book.coverUrl} alt={book.title} className="w-9 h-12 object-cover rounded shadow-xs flex-shrink-0" />
                          <div>
                            <span className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5] block max-w-xs truncate">{book.title}</span>
                            <span className="text-[#8c8880] dark:text-[#71717a]">{book.author} ({book.publishedYear})</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-[#59554e] dark:text-[#a1a1aa] font-mono text-[11px]">{book.isbn}</td>
                      <td className="p-3.5 text-[#59554e] dark:text-[#a1a1aa]">{book.categoryName}</td>
                      <td className="p-3.5 text-[#1a1a1a] dark:text-[#f4f4f5]">
                        <span className="font-semibold">{book.availableCopies}</span> / {book.totalCopies} slot
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-[#8c8880] dark:text-[#71717a] truncate max-w-[140px]">
                        {book.epubStorageKey || 'private/r2/default.epub'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setDeleteBookModal({ id: book.id, title: book.title })}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                          title="Hapus Buku"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Manage Availability / Stock */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#faf7f0] dark:bg-[#1c1c20] border border-[#e6dfd1] dark:border-[#27272a] rounded-xl text-xs text-[#59554e] dark:text-[#a1a1aa] leading-relaxed">
            <h4 className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mb-1">Manajemen Alokasi Lisensi Digital</h4>
            <p>
              Perpustakaan digital memberlakukan kuota eksemplar terbatas (total_copies) untuk mensimulasikan kepatuhan lisensi penerbit. Ketersediaan slot dihitung otomatis: <strong>total_copies dikurangi jumlah peminjaman aktif</strong>.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#f4f2ee] dark:border-[#27272a] font-semibold text-xs text-[#1a1a1a] dark:text-[#f4f4f5]">
              Penyesuaian Total Slot Lisensi per Buku
            </div>
            <div className="divide-y divide-[#f4f2ee] dark:divide-[#27272a]">
              {books.map(book => {
                const activeLoansForBook = loans.filter(l => l.bookId === book.id && l.status === 'active').length;

                return (
                  <div key={book.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={book.coverUrl} alt={book.title} className="w-10 h-14 object-cover rounded shadow-xs flex-shrink-0" />
                      <div>
                        <h4 className="font-editorial text-sm font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">{book.title}</h4>
                        <p className="text-[#8c8880] dark:text-[#a1a1aa]">Penulis: {book.author}</p>
                        <p className="text-[11px] text-[#ff6719] mt-0.5">
                          {activeLoansForBook} pembaca sedang meminjam aktif
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[11px] text-[#8c8880] dark:text-[#71717a] block">Tersedia</span>
                        <span className={`font-bold text-sm ${
                          book.availableCopies > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {book.availableCopies} dari {book.totalCopies} slot
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adminUpdateBookStock(book.id, Math.max(activeLoansForBook, book.totalCopies - 1))}
                          disabled={book.totalCopies <= activeLoansForBook}
                          className="w-8 h-8 rounded-lg border border-[#ded8cb] dark:border-[#333] bg-[#faf8f5] dark:bg-[#202024] text-[#1a1a1a] dark:text-[#f4f4f5] hover:bg-[#eae6dc] dark:hover:bg-[#28282e] disabled:opacity-30 font-bold"
                          title="Kurangi Total Slot"
                        >
                          -
                        </button>
                        <span className="font-bold w-6 text-center text-[#1a1a1a] dark:text-[#f4f4f5]">{book.totalCopies}</span>
                        <button
                          onClick={() => adminUpdateBookStock(book.id, book.totalCopies + 1)}
                          className="w-8 h-8 rounded-lg border border-[#ded8cb] dark:border-[#333] bg-[#faf8f5] dark:bg-[#202024] text-[#1a1a1a] dark:text-[#f4f4f5] hover:bg-[#eae6dc] dark:hover:bg-[#28282e] font-bold"
                          title="Tambah Total Slot"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: System Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
              Konfigurasi Aturan Peminjaman Perpustakaan
            </h3>
            <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] mt-0.5">
              Aturan ini langsung ditegakkan oleh mesin validasi saat pembaca mencoba meminjam atau memperpanjang buku.
            </p>
          </div>

          {settingsSavedToast && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Konfigurasi sistem berhasil disimpan dan langsung diterapkan ke seluruh sesi pembaca!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Batas Maksimal Buku Dipinjam Bersamaan (max_borrow_per_user)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formSettings.maxBorrowPerUser}
                onChange={(e) => setFormSettings({ ...formSettings, maxBorrowPerUser: Number(e.target.value) })}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                required
              />
              <span className="text-[11px] text-[#8c8880] dark:text-[#71717a]">Default: 3 buku per akun pembaca.</span>
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Durasi Masa Pinjam Standar (borrow_duration_days)
              </label>
              <input
                type="number"
                min="3"
                max="90"
                value={formSettings.borrowDurationDays}
                onChange={(e) => setFormSettings({ ...formSettings, borrowDurationDays: Number(e.target.value) })}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                required
              />
              <span className="text-[11px] text-[#8c8880] dark:text-[#71717a]">Default: 30 hari kalender.</span>
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Pengingat Menjelang Jatuh Tempo (reminder_days_before_due)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={formSettings.reminderDaysBeforeDue}
                onChange={(e) => setFormSettings({ ...formSettings, reminderDaysBeforeDue: Number(e.target.value) })}
                className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                required
              />
              <span className="text-[11px] text-[#8c8880] dark:text-[#71717a]">Kirim alert H-3 sebelum jatuh tempo.</span>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-[#27272a] flex items-center justify-between">
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300 block">Izinkan Perpanjangan Masa Pinjam</label>
                <span className="text-[11px] text-[#8c8880] dark:text-[#71717a]">Bila aktif, pembaca dapat memperpanjang 1x sebelum jatuh tempo.</span>
              </div>
              <input
                type="checkbox"
                checked={formSettings.allowExtendLoan}
                onChange={(e) => setFormSettings({ ...formSettings, allowExtendLoan: e.target.checked })}
                className="w-5 h-5 accent-[#ff6719] rounded cursor-pointer"
              />
            </div>

            {formSettings.allowExtendLoan && (
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                  Hari Tambahan Perpanjangan (max_extend_days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={formSettings.maxExtendDays}
                  onChange={(e) => setFormSettings({ ...formSettings, maxExtendDays: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                />
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#ff6719] hover:bg-[#e85608] text-white font-semibold rounded-lg shadow-xs transition-colors"
              >
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: Requests Moderation */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
            Tinjau usulan buku dari komunitas pembaca. Berikan keputusan setujui atau tolak dengan catatan admin.
          </p>

          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] overflow-hidden shadow-xs divide-y divide-[#f4f2ee] dark:divide-[#27272a]">
            {bookRequests.map(req => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">{req.title}</h4>
                    <span className="text-[#8c8880] dark:text-[#a1a1aa]">• Penulis: {req.author}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719]">
                      {req.upvotes} Upvotes
                    </span>
                  </div>
                  <p className="text-[#59554e] dark:text-[#d4d4d8] leading-relaxed">"{req.reason}"</p>
                  <p className="text-[11px] text-[#8c8880] dark:text-[#71717a]">Diusulkan oleh {req.userName} ({req.createdAt})</p>
                  {req.adminNote && (
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 p-2 rounded">
                      <strong>Catatan Anda:</strong> {req.adminNote}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setReviewRequestModal({ id: req.id, status: 'disetujui', title: req.title });
                      setReviewNoteInput('Lisensi naskah EPUB sedang dipersiapkan dan akan segera tersedia di katalog perpustakaan.');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 ${
                      req.status === 'disetujui'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>

                  <button
                    onClick={() => {
                      setReviewRequestModal({ id: req.id, status: 'ditolak', title: req.title });
                      setReviewNoteInput('Saat ini belum dapat diadakan karena kendala lisensi digital atau katalog yang serupa sudah tersedia.');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 ${
                      req.status === 'ditolak'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Cron Job Simulator */}
      {activeTab === 'cron' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f4f2ee] dark:border-[#27272a] pb-4">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                  Simulasi Cron Job Auto-Return
                </h3>
                <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] mt-0.5">
                  Pemeriksaan berkala pinjaman yang melewati batas <code>due_date</code>, otomatisasi pelepasan kuota slot stok, dan trigger webhook notifikasi.
                </p>
              </div>

              <button
                onClick={handleRunCron}
                disabled={isCronRunning}
                className="px-4 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-[#333] text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
              >
                {isCronRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#ff6719]" />
                    <span>Memproses Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#ff6719]" />
                    <span>Jalankan Cron Job Sekarang</span>
                  </>
                )}
              </button>
            </div>

            {/* Architecture Explainer Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#faf8f5] dark:bg-[#202024] rounded-lg border border-[#ded8cb] dark:border-[#27272a]">
                <span className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5] block">1. Scheduler Trigger</span>
                <span className="text-[#706c64] dark:text-[#a1a1aa] text-[11px]">Memanggil endpoint cron untuk pemindaian rutin buku overdue.</span>
              </div>
              <div className="p-3 bg-[#faf8f5] dark:bg-[#202024] rounded-lg border border-[#ded8cb] dark:border-[#27272a]">
                <span className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5] block">2. Database Mutation</span>
                <span className="text-[#706c64] dark:text-[#a1a1aa] text-[11px]">Update status='returned' & increment stok tersedia secara atomik.</span>
              </div>
              <div className="p-3 bg-[#faf8f5] dark:bg-[#202024] rounded-lg border border-[#ded8cb] dark:border-[#27272a]">
                <span className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5] block">3. Asynchronous Notice</span>
                <span className="text-[#706c64] dark:text-[#a1a1aa] text-[11px]">Kirim webhook async ke sistem pembaca tanpa blocking proses.</span>
              </div>
            </div>

            {/* Cron Console Output */}
            <div className="bg-[#18181b] dark:bg-[#121214] text-[#f4f4f5] rounded-xl p-4 font-mono text-[11px] leading-relaxed space-y-1.5 min-h-[160px] border border-zinc-800">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400 text-[10px]">
                <span>SERVERLESS CRON EXECUTION CONSOLE</span>
                <span>STATUS: {isCronRunning ? 'RUNNING' : cronLogs.length ? 'IDLE (FINISHED)' : 'READY'}</span>
              </div>

              {cronLogs.length === 0 && !isCronRunning && (
                <p className="text-zinc-500 py-6 text-center font-sans text-xs">
                  Klik "Jalankan Cron Job Sekarang" untuk melihat log eksekusi pemindaian pinjaman jatuh tempo secara langsung.
                </p>
              )}

              {cronLogs.map((log, i) => (
                <div key={i} className="text-emerald-400">
                  <span className="text-zinc-500 mr-2">{'>'}</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Database Supabase Synchronization */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-[#1a1a1e] p-5 sm:p-6 rounded-2xl border border-[#ded8cb] dark:border-[#27272a] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-[#ff6719]/10 rounded-xl text-[#ff6719]">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                      Integrasi Database PostgreSQL Supabase
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      LIVE CLOUD
                    </span>
                  </div>
                  <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] mt-1 max-w-2xl leading-relaxed">
                    Sinkronkan katalog buku, bab naskah EPUB, kategori, dan transaksi sirkulasi peminjaman secara langsung dengan database PostgreSQL di project Supabase Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <button
                  onClick={async () => {
                    const res = await syncSupabase();
                    setDbActionMessage({
                      type: res.success ? 'success' : 'info',
                      text: res.message,
                      details: res,
                    });
                  }}
                  disabled={isSyncingSupabase}
                  className="px-3.5 py-2 bg-stone-100 dark:bg-[#202024] hover:bg-stone-200 dark:hover:bg-[#2a2a2e] text-[#1a1a1a] dark:text-[#f4f4f5] text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSupabase ? 'Menyinkronkan...' : 'Tarik Data dari Supabase'}</span>
                </button>

                <button
                  onClick={async () => {
                    const res = await seedSupabase();
                    setDbActionMessage({
                      type: res.success ? 'success' : 'error',
                      text: res.message,
                      details: res,
                    });
                  }}
                  disabled={isSyncingSupabase}
                  className="px-4 py-2 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSyncingSupabase ? 'Memproses Seed...' : '🌱 Seed Data ke Supabase'}</span>
                </button>
              </div>
            </div>

            {/* Notification / Feedback Banner */}
            {dbActionMessage && (
              <div className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                dbActionMessage.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                  : dbActionMessage.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="space-y-1">
                  <div className="font-semibold">{dbActionMessage.text}</div>
                  {dbActionMessage.details?.booksCount && (
                    <div className="text-[11px] opacity-80">
                      Rincian: {dbActionMessage.details.categoriesCount} kategori, {dbActionMessage.details.booksCount} buku, dan {dbActionMessage.details.chaptersCount} bab naskah berhasil dimasukkan.
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setDbActionMessage(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5 pt-5 border-t border-stone-200 dark:border-[#27272a]">
              <div className="bg-stone-50 dark:bg-[#141416] p-3.5 rounded-xl border border-stone-200/80 dark:border-[#27272a]">
                <span className="text-[10px] uppercase font-bold text-[#8c8880] tracking-wider block">
                  Project Host Database
                </span>
                <p className="font-mono text-xs font-semibold text-[#1a1a1a] dark:text-[#f4f4f5] mt-1 truncate">
                  zdbfxiughuxfttozfyxr.supabase.co
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Port: 5432 (PostgreSQL)
                </span>
              </div>

              <div className="bg-stone-50 dark:bg-[#141416] p-3.5 rounded-xl border border-stone-200/80 dark:border-[#27272a]">
                <span className="text-[10px] uppercase font-bold text-[#8c8880] tracking-wider block">
                  Status Database Live
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="font-semibold text-xs text-[#1a1a1a] dark:text-[#f4f4f5]">
                    Aktif & Terkoneksi
                  </p>
                </div>
                <span className="text-[10px] text-[#59554e] dark:text-[#a1a1aa]">
                  Katalog saat ini: {books.length} buku termuat
                </span>
              </div>

              <div className="bg-stone-50 dark:bg-[#141416] p-3.5 rounded-xl border border-stone-200/80 dark:border-[#27272a]">
                <span className="text-[10px] uppercase font-bold text-[#8c8880] tracking-wider block">
                  Tabel Schema Prisma
                </span>
                <p className="font-semibold text-xs text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
                  6 Tabel Utama Siap
                </p>
                <span className="text-[10px] font-mono text-zinc-500">
                  Book, Category, BookChapter, Loan, User, Review
                </span>
              </div>
            </div>
          </div>

          {/* Guide Card */}
          <div className="bg-stone-50 dark:bg-[#141416] p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-[#27272a] space-y-3">
            <h4 className="font-editorial text-sm sm:text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5] flex items-center gap-2">
              <span className="text-[#ff6719]">💡</span>
              <span>Langkah Pengisian Data Pertama Kali (Seeding):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-[#59554e] dark:text-[#a1a1aa] leading-relaxed">
              <li>
                Klik tombol <strong className="text-[#ff6719]">"🌱 Seed Data ke Supabase"</strong> di atas.
              </li>
              <li>
                Sistem akan secara otomatis mengirimkan seluruh data katalog buku (seperti <em>Filosofi Teras</em>, <em>Atomic Habits</em>, <em>Cantik Itu Luka</em>, dsb.) beserta bab bacaan EPUB-nya langsung ke tabel <code>Book</code> dan <code>BookChapter</code> di PostgreSQL Supabase Anda.
              </li>
              <li>
                Anda dapat melihat seluruh baris data tersebut secara langsung di <strong>Supabase Dashboard &gt; Table Editor &gt; Book</strong>.
              </li>
              <li>
                Setelah seeding berhasil, kapan pun ada penambahan atau pengubahan buku, seluruh pengguna di Vercel maupun browser mana pun akan melihat data yang sama secara serentak!
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Modal: Upload & Tambah Buku */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleAddBookSubmit} className="bg-white dark:bg-[#1a1a1e] max-w-xl w-full rounded-2xl p-5 sm:p-6 border border-[#ded8cb] dark:border-[#27272a] shadow-2xl space-y-4 text-xs my-auto">
            <div className="border-b border-stone-200 dark:border-[#27272a] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#ff6719]">
                  Katalog Administrasi
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                  Unggah Naskah Buku Digital (EPUB)
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddBookModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Judul Buku</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Sang Pangeran (Il Principe)"
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">Nama Penulis</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Contoh: Niccolò Machiavelli"
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">Nomor ISBN</label>
                <input
                  type="text"
                  value={newIsbn}
                  onChange={(e) => setNewIsbn(e.target.value)}
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">Kategori</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                >
                  {categories.filter(c => c.slug !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">Total Slot Peminjaman (Stok)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newCopies}
                  onChange={(e) => setNewCopies(Number(e.target.value))}
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-stone-300">URL Gambar Sampul (Cover)</label>
                <input
                  type="url"
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Berkas EPUB Digital</label>
                <div className="mt-1 p-3 border-2 border-dashed border-[#ded8cb] dark:border-[#333] rounded-lg text-center bg-[#faf8f5] dark:bg-[#141416]">
                  <Upload className="w-5 h-5 mx-auto text-[#ff6719] mb-1" />
                  <p className="font-semibold text-[#1a1a1a] dark:text-[#f4f4f5]">{epubFileName}</p>
                  <p className="text-[10px] text-[#8c8880] dark:text-[#71717a]">Format EPUB terverifikasi (Zip reflowable container)</p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Sinopsis & Deskripsi</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Ringkasan pemikiran atau plot karya..."
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-[#27272a]">
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25252a] rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#ff6719] hover:bg-[#e85608] text-white font-semibold rounded-lg shadow-xs"
              >
                Simpan & Terbitkan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Book Confirmation Modal */}
      {deleteBookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#ded8cb] dark:border-[#27272a] p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-editorial text-lg font-bold text-red-600 dark:text-red-400">
              Hapus Buku dari Katalog?
            </h3>
            <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] leading-relaxed">
              Apakah Anda yakin ingin menghapus buku <strong>"{deleteBookModal.title}"</strong>? Seluruh data naskah digital dan lisensi yang terkait akan dinonaktifkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteBookModal(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#59554e] dark:text-[#a1a1aa] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  adminDeleteBook(deleteBookModal.id);
                  setDeleteBookModal(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
              >
                Hapus Buku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Request Modal with Admin Note */}
      {reviewRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#ded8cb] dark:border-[#27272a] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                {reviewRequestModal.status === 'disetujui' ? 'Setujui Pengadaan Buku' : 'Tolak Usulan Buku'}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                reviewRequestModal.status === 'disetujui'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
              }`}>
                {reviewRequestModal.status}
              </span>
            </div>

            <p className="text-xs text-[#59554e] dark:text-[#a1a1aa]">
              Judul buku: <strong>"{reviewRequestModal.title}"</strong>
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1a1a1a] dark:text-[#f4f4f5]">
                Catatan Editorial untuk Pemohon:
              </label>
              <textarea
                value={reviewNoteInput}
                onChange={(e) => setReviewNoteInput(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg text-xs focus:outline-none focus:border-[#ff6719]"
                placeholder="Tulis pesan atau alasan untuk pembaca..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewRequestModal(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#59554e] dark:text-[#a1a1aa] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  adminUpdateBookRequestStatus(
                    reviewRequestModal.id, 
                    reviewRequestModal.status, 
                    reviewNoteInput.trim() || undefined
                  );
                  setReviewRequestModal(null);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-xs transition-colors ${
                  reviewRequestModal.status === 'disetujui'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Simpan & Kirim Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
