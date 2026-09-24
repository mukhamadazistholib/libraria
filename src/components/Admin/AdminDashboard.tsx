import React, { useState, useRef } from 'react';
import { useLibrary, SUPER_ADMIN_EMAIL } from '../../context/LibraryContext';
import { BookChapter } from '../../types';
import { parseEpubFile } from '../../lib/epubParser';
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
  UploadCloud, 
  Check, 
  X,
  Layers,
  HelpCircle,
  Database,
  Sparkles,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck
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
    seedSupabase,
    isSuperAdmin
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'stats' | 'books' | 'stock' | 'settings' | 'requests' | 'cron' | 'database'>('stats');
  const [dbActionMessage, setDbActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; details?: any } | null>(null);

  // New Book Modal & Real EPUB Upload State
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [isParsingEpub, setIsParsingEpub] = useState(false);
  const [epubParseError, setEpubParseError] = useState<string | null>(null);
  const [epubParsedInfo, setEpubParsedInfo] = useState<{
    fileName: string;
    fileSize: string;
    chapterCount: number;
    pages: number;
  } | null>(null);
  const [extractedChapters, setExtractedChapters] = useState<BookChapter[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('978-0-123456-78-9');
  const [newCategoryId, setNewCategoryId] = useState('cat-filsafat');
  const [newDescription, setNewDescription] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80');
  const [newLanguage, setNewLanguage] = useState('English');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newPages, setNewPages] = useState(240);
  const [newCopies, setNewCopies] = useState(5);

  // Cron execution simulation state
  const [cronLogs, setCronLogs] = useState<string[]>([]);
  const [isCronRunning, setIsCronRunning] = useState(false);

  // In-app interactive modals
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

  const handleEpubFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processEpubFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processEpubFile(file);
  };

  const processEpubFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.epub') && file.type !== 'application/epub+zip') {
      setEpubParseError('Please upload a valid .epub publication file.');
      return;
    }

    setIsParsingEpub(true);
    setEpubParseError(null);

    try {
      const parsed = await parseEpubFile(file);
      setNewTitle(parsed.title);
      setNewAuthor(parsed.author);
      setNewDescription(parsed.description);
      setNewIsbn(parsed.isbn);
      setNewLanguage(parsed.language === 'en' ? 'English' : parsed.language);
      setNewYear(parsed.publishedYear);
      setNewPages(parsed.pages);
      if (parsed.coverUrl) {
        setNewCoverUrl(parsed.coverUrl);
      }
      setExtractedChapters(parsed.chapters);
      setEpubParsedInfo({
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        chapterCount: parsed.chapters.length,
        pages: parsed.pages,
      });
    } catch (err: any) {
      console.error('EPUB Parsing error:', err);
      setEpubParseError(err.message || 'Failed to parse EPUB contents. You can still fill in the details manually.');
    } finally {
      setIsParsingEpub(false);
    }
  };

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setEpubParseError(`Access Denied: Only ${SUPER_ADMIN_EMAIL} is authorized to add books to the catalog.`);
      return;
    }
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const cat = categories.find(c => c.id === newCategoryId) || categories[1];

    const fallbackChapters: BookChapter[] = [
      {
        id: `chap-${Date.now()}-1`,
        title: 'Chapter 1: Introduction & Foundation',
        readTimeMinutes: 7,
        content: `<h3>Prologue & Editorial Note</h3>
<p>This digital edition has been curated and verified under reflowable EPUB standards. Typography and layout adapt seamlessly across desktop and mobile screens.</p>
<blockquote>"Reading is that fruitful miracle of a communication in the midst of solitude."</blockquote>
<p>The concepts explored in this book offer essential perspective for contemporary readers.</p>`
      },
      {
        id: `chap-${Date.now()}-2`,
        title: 'Chapter 2: Core Discussion & Principles',
        readTimeMinutes: 12,
        content: `<h3>Key Insights</h3>
<p>The central discourse emphasizes critical inquiry and intellectual rigor amid an accelerating informational landscape.</p>
<p>By harmonizing classic wisdom with contemporary dialectics, this work fosters nuanced understanding and actionable depth.</p>`
      }
    ];

    const finalChapters = extractedChapters.length > 0 ? extractedChapters : fallbackChapters;

    adminAddBook({
      title: newTitle.trim(),
      author: newAuthor.trim(),
      isbn: newIsbn.trim() || '978-0-123456-78-9',
      categoryId: cat.id,
      categoryName: cat.name,
      description: newDescription.trim() || 'Digital edition published in the Libraria collection.',
      coverUrl: newCoverUrl.trim(),
      totalCopies: newCopies,
      publishedYear: newYear,
      language: newLanguage,
      pages: newPages,
      epubStorageKey: `private/epubs/${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.epub`,
      chapters: finalChapters,
    });

    // Reset state
    setNewTitle('');
    setNewAuthor('');
    setNewDescription('');
    setExtractedChapters([]);
    setEpubParsedInfo(null);
    setEpubParseError(null);
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#ff6719]">
                Library Control Center
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFIED ADMIN:</span>
                <span className="font-mono lowercase">{SUPER_ADMIN_EMAIL}</span>
              </span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
              Administrator Studio & Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#59554e] dark:text-[#a1a1aa] font-sans mt-2 max-w-2xl leading-relaxed">
              Monitor loan circulation, upload real EPUB manuscripts, configure concurrent digital license allocations, adjust lending rules, and run automated cron simulations.
            </p>
          </div>

          <button
            onClick={() => setShowAddBookModal(true)}
            className="px-4 py-2.5 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto whitespace-nowrap"
          >
            <BookPlus className="w-4 h-4" />
            <span>Upload New EPUB Book</span>
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
          <span>Statistics & Trends</span>
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
          <span>Catalog ({books.length})</span>
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
          <span>Stock & Copies</span>
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
          <span>System Policies</span>
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
          <span>Book Requests ({bookRequests.length})</span>
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
          <span>Auto-Return Cron</span>
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
          <span>Supabase Database</span>
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
                Total Catalog Books
              </span>
              <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
                {totalBooks}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Active Digital Licenses
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1e] p-4 sm:p-5 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
                Active Loans
              </span>
              <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#ff6719] mt-1">
                {activeLoansCount}
              </div>
              <p className="text-[11px] text-[#706c64] dark:text-[#a1a1aa] mt-1">
                Currently with readers
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1e] p-4 sm:p-5 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
                Overdue Loans
              </span>
              <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#b71c1c] dark:text-[#f87171] mt-1">
                {overdueCount}
              </div>
              <p className="text-[11px] text-[#8c8880] dark:text-[#71717a] mt-1">
                Targeted by auto-return cron
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1e] p-4 sm:p-5 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8c8880] dark:text-[#a1a1aa] tracking-wider block">
                Total Circulation
              </span>
              <div className="font-editorial text-2xl sm:text-3xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
                {totalBorrowsCount}x
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Cumulative borrowings
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
                    Weekly Circulation Activity
                  </h3>
                  <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">Borrowing vs return volume over the last 7 days</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719]">
                  Normal
                </span>
              </div>

              <div className="py-6">
                <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                  {[
                    { day: 'Mon', borrows: 14, returns: 10 },
                    { day: 'Tue', borrows: 22, returns: 18 },
                    { day: 'Wed', borrows: 18, returns: 12 },
                    { day: 'Thu', borrows: 28, returns: 20 },
                    { day: 'Fri', borrows: 35, returns: 25 },
                    { day: 'Sat', borrows: 42, returns: 30 },
                    { day: 'Sun', borrows: 48, returns: 34 },
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
                    <span>Loans</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#ded9cf] dark:bg-[#3f3f46]"></span>
                    <span>Returns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Category Popularity Breakdown */}
            <div className="bg-white dark:bg-[#1a1a1e] p-5 sm:p-6 rounded-xl border border-[#e8e4dc] dark:border-[#27272a] shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#f4f2ee] dark:border-[#27272a]">
                <div>
                  <h3 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                    Category Popularity Distribution
                  </h3>
                  <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">Proportion of reader checkouts by genre</p>
                </div>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                {[
                  { name: 'Philosophy & Thought', percent: 38, count: '555 loans' },
                  { name: 'Self-Development & Mindset', percent: 27, count: '394 loans' },
                  { name: 'Literature & Fiction', percent: 21, count: '310 loans' },
                  { name: 'Science & Society', percent: 14, count: '240 loans' },
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
              Most Circulated Titles
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] dark:bg-[#202024] text-[#8c8880] dark:text-[#a1a1aa] uppercase tracking-wider font-semibold border-b border-[#ded8cb] dark:border-[#27272a]">
                  <tr>
                    <th className="p-3">Title & Author</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Total Copies</th>
                    <th className="p-3">Available</th>
                    <th className="p-3">Total Borrows</th>
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
                        <span className={`font-semibold ${book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          {book.availableCopies} available
                        </span>
                      </td>
                      <td className="p-3 text-[#706c64] dark:text-[#a1a1aa]">{book.borrowCount}x</td>
                      <td className="p-3 font-medium text-[#1a1a1a] dark:text-[#f4f4f5]">★ {book.rating.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Catalog Management */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eeebe5] dark:border-[#27272a]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                Catalog Management & Digital Editions
              </h3>
              <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
                Manage library titles, metadata, and EPUB files.
              </p>
            </div>
            <button
              onClick={() => setShowAddBookModal(true)}
              className="px-3.5 py-1.5 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => (
              <div 
                key={book.id}
                className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#ded8cb] dark:border-[#27272a] p-4 flex gap-3.5 shadow-xs relative group"
              >
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-16 h-24 object-cover rounded shadow-xs flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#ff6719] tracking-wider block">
                    {book.categoryName}
                  </span>
                  <h4 className="font-editorial text-sm font-bold text-[#1a1a1a] dark:text-[#f4f4f5] truncate mt-0.5">
                    {book.title}
                  </h4>
                  <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] truncate">{book.author}</p>
                  
                  <div className="flex items-center gap-2 text-[11px] text-[#8c8880] dark:text-[#71717a] mt-2">
                    <span>Copies: <strong>{book.totalCopies}</strong></span>
                    <span>•</span>
                    <span>Available: <strong className={book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>{book.availableCopies}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setDeleteBookModal({ id: book.id, title: book.title })}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Stock & Inventory Management */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="border-b border-[#eeebe5] dark:border-[#27272a] pb-3">
            <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
              Concurrent License & Stock Allocation
            </h3>
            <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
              Adjust concurrent digital copies allocated to each book title.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#ded8cb] dark:border-[#27272a] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] dark:bg-[#202024] text-[#8c8880] dark:text-[#a1a1aa] uppercase tracking-wider font-semibold border-b border-[#ded8cb] dark:border-[#27272a]">
                  <tr>
                    <th className="p-3.5">Book Title</th>
                    <th className="p-3.5">Currently Loaned</th>
                    <th className="p-3.5">Available Slots</th>
                    <th className="p-3.5">Total Licensed Copies</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f2ee] dark:divide-[#27272a]">
                  {books.map(book => {
                    const activeLoansForBook = loans.filter(l => l.bookId === book.id && l.status === 'active').length;
                    return (
                      <tr key={book.id} className="hover:bg-[#faf7f2] dark:hover:bg-[#202024]">
                        <td className="p-3.5">
                          <span className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5] block">{book.title}</span>
                          <span className="text-[#8c8880] dark:text-[#71717a]">{book.author}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-[#ff6719]">
                          {activeLoansForBook} readers
                        </td>
                        <td className="p-3.5">
                          <span className={`font-semibold ${book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {book.availableCopies} available
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={activeLoansForBook}
                              max="50"
                              defaultValue={book.totalCopies}
                              id={`stock-input-${book.id}`}
                              className="w-16 p-1.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded text-center text-xs font-bold"
                            />
                            <span className="text-[10px] text-stone-400">min: {activeLoansForBook}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => {
                              const input = document.getElementById(`stock-input-${book.id}`) as HTMLInputElement;
                              if (input) {
                                adminUpdateBookStock(book.id, Number(input.value));
                              }
                            }}
                            className="px-3 py-1.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded text-xs font-semibold hover:opacity-90 transition-opacity"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: System Policies & Rules */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          <div className="border-b border-[#eeebe5] dark:border-[#27272a] pb-3">
            <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
              Library Lending Policies & Loan Limits
            </h3>
            <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
              Configure global constraints applied to all reader accounts.
            </p>
          </div>

          {settingsSavedToast && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Library system settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 bg-white dark:bg-[#1a1a1e] p-5 sm:p-6 rounded-xl border border-[#ded8cb] dark:border-[#27272a] shadow-xs text-xs">
            <div>
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Maximum Active Loans per Reader
              </label>
              <p className="text-[11px] text-stone-500 mb-1.5">The maximum number of simultaneous books a reader may borrow.</p>
              <input
                type="number"
                min="1"
                max="10"
                value={formSettings.maxBorrowPerUser}
                onChange={(e) => setFormSettings({ ...formSettings, maxBorrowPerUser: Number(e.target.value) })}
                className="w-32 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg text-xs"
                required
              />
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-[#27272a]">
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Standard Loan Duration (Days)
              </label>
              <p className="text-[11px] text-stone-500 mb-1.5">How many days a reader has access before auto-return triggers.</p>
              <input
                type="number"
                min="1"
                max="30"
                value={formSettings.borrowDurationDays}
                onChange={(e) => setFormSettings({ ...formSettings, borrowDurationDays: Number(e.target.value) })}
                className="w-32 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg text-xs"
                required
              />
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-[#27272a]">
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Loan Extension Allowance (Days)
              </label>
              <p className="text-[11px] text-stone-500 mb-1.5">Additional days granted when an active reader requests an extension.</p>
              <input
                type="number"
                min="1"
                max="14"
                value={formSettings.maxExtendDays}
                onChange={(e) => setFormSettings({ ...formSettings, maxExtendDays: Number(e.target.value) })}
                className="w-32 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg text-xs"
                required
              />
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-[#27272a] flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-700 dark:text-stone-300 block">Allow Readers to Extend Loans</span>
                <span className="text-[11px] text-stone-500">Allow readers to request a 1-time extension on active books.</span>
              </div>
              <input
                type="checkbox"
                checked={formSettings.allowExtendLoan}
                onChange={(e) => setFormSettings({ ...formSettings, allowExtendLoan: e.target.checked })}
                className="w-4 h-4 accent-[#ff6719] rounded cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-[#27272a]">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#ff6719] hover:bg-[#e85608] text-white font-semibold rounded-lg shadow-xs"
              >
                Save System Policies
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: Moderation of Book Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="border-b border-[#eeebe5] dark:border-[#27272a] pb-3">
            <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
              Community Book Acquisition Requests
            </h3>
            <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
              Review titles proposed by members and manage their approval status.
            </p>
          </div>

          {bookRequests.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#1a1a1e] rounded-xl border border-stone-200 dark:border-[#27272a]">
              <HelpCircle className="w-8 h-8 mx-auto text-stone-400 mb-2" />
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">No book requests submitted yet.</p>
              <p className="text-[11px] text-stone-500 mt-1">Reader requests will appear here for editorial review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookRequests.map(req => (
                <div 
                  key={req.id}
                  className="bg-white dark:bg-[#1a1a1e] p-5 rounded-xl border border-[#ded8cb] dark:border-[#27272a] space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                        {req.title}
                      </h4>
                      <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">{req.author}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'disetujui'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : req.status === 'ditolak'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {req.status === 'disetujui' ? 'Approved' : req.status === 'ditolak' ? 'Declined' : 'Pending Review'}
                    </span>
                  </div>

                  <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] bg-[#faf8f5] dark:bg-[#141416] p-3 rounded-lg border border-stone-100 dark:border-[#27272a] leading-relaxed">
                    "{req.reason}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100 dark:border-[#27272a]">
                    <span>Requested by: <strong>{req.userName}</strong></span>
                    <span>{req.upvotes} upvotes</span>
                  </div>

                  {(req.status === 'diajukan' || req.status === 'ditinjau') && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setReviewRequestModal({ id: req.id, status: 'disetujui', title: req.title })}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setReviewRequestModal({ id: req.id, status: 'ditolak', title: req.title })}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Overdue Cron Simulation */}
      {activeTab === 'cron' && (
        <div className="space-y-6">
          <div className="border-b border-[#eeebe5] dark:border-[#27272a] pb-3">
            <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
              Automated Loan Return Cron Job
            </h3>
            <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
              Simulate scheduled hourly/daily background cron worker that sweeps overdue loans, releases digital licenses back to the catalog, and updates member quotas.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1a1e] p-5 sm:p-6 rounded-xl border border-[#ded8cb] dark:border-[#27272a] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[#1a1a1a] dark:text-[#f4f4f5]">Trigger Background Auto-Return Sweep</h4>
                <p className="text-xs text-[#706c64] dark:text-[#a1a1aa]">
                  Current Overdue Loans: <strong className="text-red-500 font-bold">{overdueCount} loans</strong>
                </p>
              </div>

              <button
                onClick={handleRunCron}
                disabled={isCronRunning}
                className="px-4 py-2 bg-[#ff6719] hover:bg-[#e85608] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 self-start"
              >
                {isCronRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Sweep...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Auto-Return Cron</span>
                  </>
                )}
              </button>
            </div>

            {cronLogs.length > 0 && (
              <div className="mt-4 p-4 bg-[#141416] text-emerald-400 font-mono text-[11px] rounded-lg max-h-64 overflow-y-auto space-y-1">
                {cronLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 7: Supabase Database Synchronization */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="border-b border-[#eeebe5] dark:border-[#27272a] pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                Supabase PostgreSQL Database Management
              </h3>
              {isSupabaseLive && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] mt-1">
              Synchronize digital catalog, chapters, loans, and reviews with persistent PostgreSQL tables in Supabase.
            </p>
          </div>

          {dbActionMessage && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
              dbActionMessage.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}>
              {dbActionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{dbActionMessage.text}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1a1a1e] p-5 rounded-xl border border-[#ded8cb] dark:border-[#27272a] space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ff6719]" />
                <h4 className="font-bold text-sm text-[#1a1a1a] dark:text-[#f4f4f5]">Seed Sample Data to Supabase</h4>
              </div>
              <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] leading-relaxed">
                Populates your Supabase PostgreSQL database tables (<code>Book</code> and <code>BookChapter</code>) with complete initial books and chapters.
              </p>
              <button
                onClick={async () => {
                  const res = await seedSupabase();
                  setDbActionMessage({
                    type: res.success ? 'success' : 'error',
                    text: res.message
                  });
                }}
                disabled={isSyncingSupabase}
                className="w-full py-2.5 bg-[#ff6719] hover:bg-[#e85608] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
              >
                {isSyncingSupabase ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Seed Catalog to Supabase</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#1a1a1e] p-5 rounded-xl border border-[#ded8cb] dark:border-[#27272a] space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-sm text-[#1a1a1a] dark:text-[#f4f4f5]">Sync State with Database</h4>
              </div>
              <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] leading-relaxed">
                Fetch and refresh the latest real-time catalog records directly from the remote PostgreSQL database.
              </p>
              <button
                onClick={async () => {
                  const res = await syncSupabase();
                  setDbActionMessage({
                    type: res.success ? 'success' : 'error',
                    text: res.message
                  });
                }}
                disabled={isSyncingSupabase}
                className="w-full py-2.5 bg-[#1a1a1a] dark:bg-white hover:opacity-90 disabled:opacity-50 text-white dark:text-[#1a1a1a] rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
              >
                {isSyncingSupabase ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Fetch from Supabase</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Real EPUB File Upload & Manual Metadata */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleAddBookSubmit} className="bg-white dark:bg-[#1a1a1e] max-w-xl w-full rounded-2xl p-5 sm:p-6 border border-[#ded8cb] dark:border-[#27272a] shadow-2xl space-y-4 text-xs my-auto">
            <div className="border-b border-stone-200 dark:border-[#27272a] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#ff6719]">
                  Editorial Catalog
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                  Upload Digital EPUB Book
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

            {/* Real EPUB Drag & Drop Zone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Digital EPUB Manuscript File (.epub)
              </label>

              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".epub,application/epub+zip" 
                className="hidden" 
                onChange={handleEpubFileChange} 
              />

              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-[#ff6719]/40 hover:border-[#ff6719] dark:border-[#333] dark:hover:border-[#ff6719] rounded-xl text-center bg-[#fffbf7] dark:bg-[#17171a] cursor-pointer transition-colors"
              >
                {isParsingEpub ? (
                  <div className="py-2 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-7 h-7 text-[#ff6719] animate-spin" />
                    <p className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Extracting EPUB chapters & metadata...</p>
                    <p className="text-[11px] text-stone-500">Unpacking reflowable chapters, reading times, and cover art.</p>
                  </div>
                ) : epubParsedInfo ? (
                  <div className="py-1 flex flex-col items-center justify-center gap-1.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5] text-sm">{epubParsedInfo.fileName}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Successfully extracted {epubParsedInfo.chapterCount} chapters ({epubParsedInfo.fileSize}, ~{epubParsedInfo.pages} pages)
                    </p>
                    <span className="text-[10px] text-stone-400 underline mt-1">Click to replace with another .epub file</span>
                  </div>
                ) : (
                  <div className="py-2 flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className="w-8 h-8 text-[#ff6719]" />
                    <p className="font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">Click to choose .epub file or drag & drop here</p>
                    <p className="text-[11px] text-stone-500">Supports standard reflowable EPUB 2.0 and 3.0 archives</p>
                  </div>
                )}
              </div>

              {epubParseError && (
                <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{epubParseError}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Book Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The Prince (Il Principe)"
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">Author</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Niccolò Machiavelli"
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">ISBN / Identifier</label>
                <input
                  type="text"
                  value={newIsbn}
                  onChange={(e) => setNewIsbn(e.target.value)}
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300">Category</label>
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
                <label className="font-semibold text-stone-700 dark:text-stone-300">Total Concurrent Copies (Stock)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newCopies}
                  onChange={(e) => setNewCopies(Number(e.target.value))}
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Cover Image URL</label>
                <input
                  type="url"
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Synopsis & Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Overview of the author's work or thesis..."
                  className="w-full mt-1 p-2 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg focus:outline-none focus:border-[#ff6719]"
                  required
                />
              </div>
            </div>

            {/* Extracted Chapters Preview */}
            {extractedChapters.length > 0 && (
              <div className="p-3 bg-stone-50 dark:bg-[#141416] rounded-lg border border-stone-200 dark:border-[#27272a] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#ff6719]" />
                    <span>Extracted Chapters ({extractedChapters.length})</span>
                  </span>
                  <span className="text-[10px] text-stone-400">Ready for reader</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-stone-600 dark:text-stone-400 divide-y divide-stone-100 dark:divide-[#27272a]">
                  {extractedChapters.slice(0, 8).map((ch, idx) => (
                    <div key={ch.id} className="pt-1 flex items-center justify-between">
                      <span className="truncate max-w-[280px]">{idx + 1}. {ch.title}</span>
                      <span className="text-[10px] text-stone-400">{ch.readTimeMinutes} min read</span>
                    </div>
                  ))}
                  {extractedChapters.length > 8 && (
                    <div className="pt-1 text-[10px] text-stone-400 italic">
                      + {extractedChapters.length - 8} additional chapters
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-[#27272a]">
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#25252a] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isParsingEpub}
                className="px-5 py-2 bg-[#ff6719] hover:bg-[#e85608] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs"
              >
                Publish Book to Catalog
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
              Remove Book from Catalog?
            </h3>
            <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] leading-relaxed">
              Are you sure you want to remove <strong>"{deleteBookModal.title}"</strong>? Digital licenses and associated chapter files will be deleted.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteBookModal(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#59554e] dark:text-[#a1a1aa] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  adminDeleteBook(deleteBookModal.id);
                  setDeleteBookModal(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
              >
                Remove Book
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
                {reviewRequestModal.status === 'disetujui' ? 'Approve Book Acquisition' : 'Decline Book Request'}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                reviewRequestModal.status === 'disetujui'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
              }`}>
                {reviewRequestModal.status === 'disetujui' ? 'Approve' : 'Decline'}
              </span>
            </div>

            <p className="text-xs text-[#59554e] dark:text-[#a1a1aa]">
              Book Title: <strong>"{reviewRequestModal.title}"</strong>
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1a1a1a] dark:text-[#f4f4f5]">
                Editorial Note to Reader:
              </label>
              <textarea
                value={reviewNoteInput}
                onChange={(e) => setReviewNoteInput(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-stone-50 dark:bg-[#141416] border border-stone-200 dark:border-[#27272a] text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg text-xs focus:outline-none focus:border-[#ff6719]"
                placeholder="Optional explanation or update for the reader..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewRequestModal(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#59554e] dark:text-[#a1a1aa] transition-colors"
              >
                Cancel
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
                Save & Notify Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
