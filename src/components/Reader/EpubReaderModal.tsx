import React, { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, BookChapter } from '../../types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Bookmark, 
  Type, 
  Sun, 
  Moon, 
  Coffee, 
  ShieldCheck, 
  Highlighter, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Sliders, 
  Columns, 
  Square,
  Lock,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface EpubReaderModalProps {
  book: Book;
  onClose: () => void;
}

export const EpubReaderModal: React.FC<EpubReaderModalProps> = ({ book, onClose }) => {
  const { 
    currentUser, 
    loans, 
    updateReadingProgress, 
    addHighlight, 
    theme: globalTheme 
  } = useLibrary();

  // Find active loan
  const activeLoan = loans.find(l => l.userId === currentUser.id && l.bookId === book.id && l.status === 'active');
  const isPreviewOnly = !activeLoan;

  // Reading state
  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readerTheme, setReaderTheme] = useState<'sepia' | 'light' | 'dark' | 'nightBlue'>('sepia');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [showToc, setShowToc] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'single' | 'double'>('double'); // Google Play Books 2-page or 1-page
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 850 : false
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hudVisible, setHudVisible] = useState<boolean>(true); // Google Play Books tap-to-toggle UI
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null);

  // Highlighting state
  const [selectedQuote, setSelectedQuote] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const [showHighlightModal, setShowHighlightModal] = useState<boolean>(false);
  const [highlightToast, setHighlightToast] = useState<string | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const chapters = book.chapters || [];
  const currentChapter: BookChapter | undefined = chapters[currentChapterIdx];
  const nextChapter: BookChapter | undefined = chapters[currentChapterIdx + 1];

  const totalChapters = Math.max(1, chapters.length);
  const progressPercentage = Math.round(((currentChapterIdx + 1) / totalChapters) * 100);

  // Auto-sync reading progress
  useEffect(() => {
    if (activeLoan && currentChapter) {
      updateReadingProgress(book.id, progressPercentage, currentChapter.id);
    }
  }, [currentChapterIdx, progressPercentage, book.id, activeLoan]);

  // Responsive default: automatically use single page on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 850;
      setIsMobileScreen(mobile);
      if (mobile) {
        setViewMode('single');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveViewMode = isMobileScreen ? 'single' : viewMode;

  // Soft paper turn audio synthesizer
  const playPaperRustle = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.15; // 150ms gentle rustle
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 2.2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {
      // Audio context policy safe fallback
    }
  };

  const handleNextPage = () => {
    if (isFlipping) return;
    const step = viewMode === 'double' && currentChapterIdx + 2 < chapters.length ? 2 : 1;
    if (currentChapterIdx < chapters.length - 1) {
      setIsFlipping('next');
      playPaperRustle();
      setTimeout(() => {
        setCurrentChapterIdx(prev => Math.min(chapters.length - 1, prev + step));
        setIsFlipping(null);
      }, 500);
    }
  };

  const handlePrevPage = () => {
    if (isFlipping) return;
    const step = viewMode === 'double' && currentChapterIdx - 2 >= 0 ? 2 : 1;
    if (currentChapterIdx > 0) {
      setIsFlipping('prev');
      playPaperRustle();
      setTimeout(() => {
        setCurrentChapterIdx(prev => Math.max(0, prev - step));
        setIsFlipping(null);
      }, 500);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIdx, chapters.length, isFlipping, viewMode]);

  // Touch Swipe for Mobile / Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
    touchStartXRef.current = null;
  };

  const toggleBookmark = () => {
    if (!currentChapter) return;
    if (bookmarkedChapters.includes(currentChapter.id)) {
      setBookmarkedChapters(prev => prev.filter(id => id !== currentChapter.id));
    } else {
      setBookmarkedChapters(prev => [...prev, currentChapter.id]);
    }
  };

  const handleSaveHighlight = () => {
    if (!selectedQuote.trim() || !currentChapter) return;
    addHighlight(book.id, currentChapter.title, selectedQuote.trim(), noteText.trim() || undefined);
    setShowHighlightModal(false);
    setSelectedQuote('');
    setNoteText('');
    setHighlightToast('Highlight saved to your profile!');
    setTimeout(() => setHighlightToast(null), 3000);
  };

  // Font size typography
  const fontSizeClasses = {
    sm: 'text-[14px] sm:text-[15px] leading-relaxed',
    md: 'text-[16px] sm:text-[17px] leading-relaxed',
    lg: 'text-[18px] sm:text-[19px] leading-loose',
    xl: 'text-[20px] sm:text-[22px] leading-loose',
  };

  // Google Play Books theme palettes
  const themeClasses = {
    sepia: {
      wrapper: 'bg-[#f4ebd9] text-[#2c241b]',
      bookPage: 'bg-[#fdfaf2] text-[#2d261e] border-[#e8dfcf]',
      header: 'bg-[#f4ebd9]/95 text-[#2c241b] border-[#e2d5be]',
      spineShadow: 'shadow-[inset_0_0_30px_rgba(110,80,40,0.12)]',
    },
    light: {
      wrapper: 'bg-[#eeece8] text-[#1a1a1a]',
      bookPage: 'bg-[#ffffff] text-[#1a1a1a] border-[#e5e1d8]',
      header: 'bg-[#f7f5f0]/95 text-[#1a1a1a] border-[#ded8cb]',
      spineShadow: 'shadow-[inset_0_0_30px_rgba(0,0,0,0.08)]',
    },
    dark: {
      wrapper: 'bg-[#121214] text-[#d4d4d8]',
      bookPage: 'bg-[#1a1a1e] text-[#d4d4d8] border-[#27272a]',
      header: 'bg-[#121214]/95 text-[#f4f4f5] border-[#27272a]',
      spineShadow: 'shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]',
    },
    nightBlue: {
      wrapper: 'bg-[#0f172a] text-[#cbd5e1]',
      bookPage: 'bg-[#1e293b] text-[#cbd5e1] border-[#334155]',
      header: 'bg-[#0f172a]/95 text-[#e2e8f0] border-[#334155]',
      spineShadow: 'shadow-[inset_0_0_30px_rgba(0,0,0,0.7)]',
    },
  };

  const currentTheme = themeClasses[readerTheme];
  const isCurrentBookmarked = currentChapter ? bookmarkedChapters.includes(currentChapter.id) : false;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${currentTheme.wrapper} transition-colors duration-200 select-none overflow-hidden`}>
      {/* Google Play Books Top Floating Header (auto-hideable for immersive reading) */}
      <header className={`px-3 sm:px-6 py-2.5 sm:py-3 border-b flex items-center justify-between gap-3 transition-transform duration-300 z-40 ${
        hudVisible ? 'translate-y-0' : '-translate-y-full opacity-0 pointer-events-none'
      } ${currentTheme.header} backdrop-blur-md shadow-xs`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Exit Reader"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowToc(!showToc)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Table of Contents"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden md:inline">Table of Contents</span>
          </button>

          <div className="h-4 w-px bg-current opacity-20 hidden sm:block"></div>

          <div className="min-w-0">
            <h1 className="font-editorial text-sm sm:text-base font-bold truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h1>
            <p className="text-[11px] opacity-75 truncate max-w-[140px] sm:max-w-xs">
              {currentChapter ? currentChapter.title : 'Chapter'} • {book.author}
            </p>
          </div>
        </div>

        {/* Center Google Play Books badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] bg-[#ff6719]/10 text-[#ff6719] border border-[#ff6719]/25 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>3D Interactive Page Turn</span>
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled ? 'text-[#ff6719]' : 'opacity-50 hover:opacity-100'
            }`}
            title={soundEnabled ? 'Page Turn Audio: Enabled' : 'Page Turn Audio: Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* View Mode Toggle: 1 Page vs 2 Pages (Desktop/Tablet) */}
          {!isMobileScreen && (
            <button
              onClick={() => setViewMode(viewMode === 'single' ? 'double' : 'single')}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden sm:block"
              title={viewMode === 'double' ? 'Switch to Single Page View' : 'Switch to Two-Page Spread'}
            >
              {viewMode === 'double' ? <Columns className="w-4 h-4 text-[#ff6719]" /> : <Square className="w-4 h-4" />}
            </button>
          )}

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isCurrentBookmarked ? 'text-[#ff6719]' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Bookmark Chapter"
          >
            <Bookmark className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Highlight */}
          <button
            onClick={() => {
              const selection = window.getSelection()?.toString();
              setSelectedQuote(selection || '');
              setShowHighlightModal(true);
            }}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#ff6719]"
            title="Add Highlight & Note"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {/* Display Settings Dropdown Trigger */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-[#ff6719] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Reader Display Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Settings Panel */}
      {showSettings && (
        <div className={`p-3 sm:p-4 border-b shadow-xl text-xs flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 z-40 max-h-[50vh] overflow-y-auto transition-all ${
          currentTheme.header
        }`}>
          {/* Font Size Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold opacity-75">Font Size:</span>
            <div className="flex items-center p-0.5 bg-black/5 dark:bg-white/5 rounded-lg">
              {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2.5 sm:px-3 py-1 rounded font-bold uppercase text-[10px] sm:text-[11px] transition-all ${
                    fontSize === size ? 'bg-[#ff6719] text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold opacity-75">Typography:</span>
            <div className="flex items-center p-0.5 bg-black/5 dark:bg-white/5 rounded-lg">
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-2.5 sm:px-3 py-1 rounded font-editorial text-xs transition-all ${
                  fontFamily === 'serif' ? 'bg-[#ff6719] text-white font-bold shadow-xs' : 'opacity-70'
                }`}
              >
                Literary Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-2.5 sm:px-3 py-1 rounded font-sans text-xs transition-all ${
                  fontFamily === 'sans' ? 'bg-[#ff6719] text-white font-bold shadow-xs' : 'opacity-70'
                }`}
              >
                Clean Sans
              </button>
            </div>
          </div>

          {/* Theme Palette */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold opacity-75">Theme:</span>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                  readerTheme === 'sepia' ? 'border-[#ff6719] bg-[#faf6eb] text-[#2c2925] ring-2 ring-[#ff6719]/40' : 'bg-[#faf6eb] text-[#2c2925] border-black/10'
                }`}
              >
                <Coffee className="w-3 h-3 text-[#b07d4b]" />
                <span>Sepia</span>
              </button>
              <button
                onClick={() => setReaderTheme('light')}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                  readerTheme === 'light' ? 'border-[#ff6719] bg-white text-[#1a1a1a] ring-2 ring-[#ff6719]/40' : 'bg-white text-[#1a1a1a] border-black/10'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setReaderTheme('dark')}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                  readerTheme === 'dark' ? 'border-[#ff6719] bg-[#1a1a1e] text-white ring-2 ring-[#ff6719]/40' : 'bg-[#1a1a1e] text-zinc-300 border-white/10'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setReaderTheme('nightBlue')}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                  readerTheme === 'nightBlue' ? 'border-[#ff6719] bg-[#1e293b] text-blue-100 ring-2 ring-[#ff6719]/40' : 'bg-[#1e293b] text-blue-200 border-white/10'
                }`}
              >
                <span>Night</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Canvas with 3D Book Experience */}
      <div 
        className="flex-1 flex overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Table of Contents Drawer */}
        {showToc && (
          <aside className={`w-72 sm:w-80 border-r flex flex-col z-30 transition-all shadow-xl ${currentTheme.header}`}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-editorial text-sm font-bold">Table of Contents</h3>
              <button onClick={() => setShowToc(false)} className="opacity-70 hover:opacity-100 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {chapters.map((chap, idx) => (
                <button
                  key={chap.id}
                  onClick={() => {
                    setCurrentChapterIdx(idx);
                    setShowToc(false);
                    playPaperRustle();
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                    currentChapterIdx === idx
                      ? 'bg-[#ff6719] text-white font-semibold shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="truncate">{idx + 1}. {chap.title}</span>
                  {bookmarkedChapters.includes(chap.id) && (
                    <Bookmark className="w-3.5 h-3.5 fill-current flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 border-t text-[11px] opacity-75 flex items-center justify-between">
              <span>{chapters.length} Chapters</span>
              <span className="font-bold text-[#ff6719]">{progressPercentage}% Completed</span>
            </div>
          </aside>
        )}

        {/* 3D Google Play Books Stage */}
        <main className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden relative book-perspective w-full max-w-full">
          {/* Left Arrow Click Zone */}
          <button
            onClick={handlePrevPage}
            disabled={currentChapterIdx === 0 || !!isFlipping}
            className="absolute left-1 sm:left-4 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/15 hover:bg-black/25 dark:bg-white/10 dark:hover:bg-white/20 text-current flex items-center justify-center backdrop-blur-xs disabled:opacity-0 disabled:pointer-events-none transition-all shadow-md active:scale-95"
            title="Previous Chapter"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right Arrow Click Zone */}
          <button
            onClick={handleNextPage}
            disabled={currentChapterIdx >= chapters.length - 1 || !!isFlipping}
            className="absolute right-1 sm:right-4 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/15 hover:bg-black/25 dark:bg-white/10 dark:hover:bg-white/20 text-current flex items-center justify-center backdrop-blur-xs disabled:opacity-0 disabled:pointer-events-none transition-all shadow-md active:scale-95"
            title="Next Chapter"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* The Physical 3D Book Layout Container */}
          <div 
            onClick={(e) => {
              // Click in the center toggles HUD
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const width = rect.width;
              if (clickX > width * 0.25 && clickX < width * 0.75) {
                setHudVisible(prev => !prev);
              }
            }}
            className={`w-full max-w-5xl h-full max-h-[calc(100dvh-130px)] sm:max-h-[84vh] rounded-xl sm:rounded-2xl border shadow-2xl relative flex overflow-hidden ${
              currentTheme.bookPage
            } paper-edge-layers`}
          >
            {/* Pratinjau banner if preview only */}
            {isPreviewOnly && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3 h-3" />
                <span>Chapter Preview • Borrow to save annotations</span>
              </div>
            )}

            {/* Left Page (When in Double view) */}
            {effectiveViewMode === 'double' && (
              <div className="flex-1 h-full p-4 sm:p-8 md:p-12 overflow-y-auto border-r border-black/10 dark:border-white/10 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] opacity-60 pb-3 border-b border-current/10 mb-5">
                    <span className="truncate">{book.title}</span>
                    <span>p. {currentChapterIdx + 1}</span>
                  </div>

                  {currentChapter && (
                    <>
                      <h2 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight mb-4">
                        {currentChapter.title}
                      </h2>
                      <div 
                        className={`${fontFamily === 'serif' ? 'font-editorial' : 'font-sans'} ${fontSizeClasses[fontSize]} prose max-w-none space-y-4`}
                        dangerouslySetInnerHTML={{ __html: currentChapter.content }}
                      />
                    </>
                  )}
                </div>

                <div className="pt-4 mt-6 border-t border-current/10 text-center text-[10px] opacity-50">
                  {currentChapter?.readTimeMinutes} min read
                </div>

                {/* Right edge shadow for left page (book spine crease) */}
                <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none page-fold-left-shadow opacity-70"></div>
              </div>
            )}

            {/* Book Spine Center Crease (Visible in Double View) */}
            {effectiveViewMode === 'double' && (
              <div className="w-1.5 bg-gradient-to-r from-black/15 via-black/5 to-black/15 dark:from-black/50 dark:via-black/20 dark:to-black/50 h-full relative z-10">
                <div className="absolute inset-0 book-spine-crease"></div>
              </div>
            )}

            {/* Right Page (or Single Full Page) */}
            <div className="flex-1 h-full p-4 sm:p-8 md:p-14 overflow-y-auto relative flex flex-col justify-between">
              {/* Left edge shadow for right page (spine fold) */}
              {effectiveViewMode === 'double' && (
                <div className="absolute top-0 left-0 bottom-0 w-8 pointer-events-none page-fold-right-shadow opacity-70"></div>
              )}

              <div>
                <div className="flex items-center justify-between text-[11px] opacity-60 pb-3 border-b border-current/10 mb-5">
                  <span className="truncate">
                    {effectiveViewMode === 'double' && nextChapter ? nextChapter.title : (currentChapter?.title || 'Read')}
                  </span>
                  <span>
                    p. {effectiveViewMode === 'double' ? currentChapterIdx + 2 : currentChapterIdx + 1}
                  </span>
                </div>

                {effectiveViewMode === 'double' ? (
                  nextChapter ? (
                    <>
                      <h2 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight mb-4">
                        {nextChapter.title}
                      </h2>
                      <div 
                        className={`${fontFamily === 'serif' ? 'font-editorial' : 'font-sans'} ${fontSizeClasses[fontSize]} prose max-w-none space-y-4`}
                        dangerouslySetInnerHTML={{ __html: nextChapter.content }}
                      />
                    </>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-60 space-y-2">
                      <BookOpen className="w-10 h-10 stroke-1" />
                      <p className="font-editorial text-lg font-semibold">End of Digital Edition</p>
                      <p className="text-xs">You have reached the end of the available chapters for this title.</p>
                    </div>
                  )
                ) : (
                  currentChapter ? (
                    <>
                      <h2 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight mb-4">
                        {currentChapter.title}
                      </h2>
                      <div 
                        className={`${fontFamily === 'serif' ? 'font-editorial' : 'font-sans'} ${fontSizeClasses[fontSize]} prose max-w-none space-y-4`}
                        dangerouslySetInnerHTML={{ __html: currentChapter.content }}
                      />
                    </>
                  ) : (
                    <p className="text-center opacity-60 py-12">Chapter not found.</p>
                  )
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-current/10 flex items-center justify-between text-[10px] opacity-50">
                <span>Tap center to toggle controls</span>
                <span>Chapter {currentChapterIdx + 1} of {chapters.length}</span>
              </div>
            </div>

            {/* 3D Page Curl Overlay when turning page (Google Play Books animation) */}
            {isFlipping === 'next' && (
              <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#faf6eb] via-[#f0ebe0] to-[#e4ded0] dark:from-[#202024] dark:via-[#1a1a1e] dark:to-[#121214] z-30 animate-page-turn-next origin-left pointer-events-none flex items-center justify-center shadow-2xl border-l border-black/10">
                <div className="w-full h-full p-8 opacity-20 flex flex-col justify-center items-center">
                  <div className="w-24 h-1 bg-current rounded-full mb-4"></div>
                  <div className="w-36 h-1 bg-current rounded-full mb-2"></div>
                  <div className="w-28 h-1 bg-current rounded-full"></div>
                </div>
              </div>
            )}

            {isFlipping === 'prev' && (
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#faf6eb] via-[#f0ebe0] to-[#e4ded0] dark:from-[#202024] dark:via-[#1a1a1e] dark:to-[#121214] z-30 animate-page-turn-prev origin-right pointer-events-none flex items-center justify-center shadow-2xl border-r border-black/10">
                <div className="w-full h-full p-8 opacity-20 flex flex-col justify-center items-center">
                  <div className="w-24 h-1 bg-current rounded-full mb-4"></div>
                  <div className="w-36 h-1 bg-current rounded-full mb-2"></div>
                  <div className="w-28 h-1 bg-current rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Google Play Books Bottom HUD Scrubber & Quick Progress Slider */}
      <footer className={`px-3 sm:px-6 py-2.5 sm:py-3 border-t transition-transform duration-300 z-40 ${
        hudVisible ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'
      } ${currentTheme.header} backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs`}>
        {/* Progress bar with page indicator & mobile page turners */}
        <div className="flex-1 w-full flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrevPage}
            disabled={currentChapterIdx === 0 || !!isFlipping}
            className="p-1 sm:p-1.5 rounded-md border border-current/15 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-all flex items-center gap-0.5 sm:hidden flex-shrink-0"
            title="Previous Chapter"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">Prev</span>
          </button>

          <span className="font-bold text-[#ff6719] min-w-[34px] sm:min-w-[40px] text-[11px] sm:text-xs">
            {progressPercentage}%
          </span>
          
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max={chapters.length - 1}
              value={currentChapterIdx}
              onChange={(e) => {
                setCurrentChapterIdx(Number(e.target.value));
                playPaperRustle();
              }}
              className="w-full h-1.5 bg-current/20 rounded-full appearance-none accent-[#ff6719] cursor-pointer"
            />
          </div>

          <span className="text-[10px] sm:text-[11px] opacity-75 min-w-[55px] sm:min-w-[70px] text-right">
            Chapter {currentChapterIdx + 1}/{chapters.length}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentChapterIdx >= chapters.length - 1 || !!isFlipping}
            className="p-1 sm:p-1.5 rounded-md border border-current/15 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-all flex items-center gap-0.5 sm:hidden flex-shrink-0"
            title="Next Chapter"
          >
            <span className="text-[10px] font-semibold">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action feedback / Info */}
        <div className="flex items-center gap-3 text-[11px] opacity-75 justify-between sm:justify-end w-full sm:w-auto">
          {highlightToast ? (
            <span className="text-emerald-600 font-bold">{highlightToast}</span>
          ) : (
            <span className="hidden md:inline">Use Arrow keys ← / → or click sides to turn pages</span>
          )}
          
          <button
            onClick={() => setHudVisible(false)}
            className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/10 text-current hover:opacity-100 transition-opacity"
            title="Enter Immersive Full Screen"
          >
            Full Screen
          </button>
        </div>
      </footer>

      {/* Highlight & Note Dialog */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1e] text-[#1a1a1a] dark:text-[#f4f4f5] max-w-md w-full rounded-2xl p-5 border border-[#ded8cb] dark:border-[#333] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-stone-200 dark:border-stone-700">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[#ff6719]">
                Save Highlight & Reflection
              </h3>
              <button onClick={() => setShowHighlightModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-500 uppercase">Highlighted Quote</label>
              <textarea
                value={selectedQuote}
                onChange={(e) => setSelectedQuote(e.target.value)}
                placeholder="Enter or paste a memorable excerpt..."
                rows={3}
                className="w-full mt-1 p-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-[#ff6719]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-500 uppercase">Personal Reflection (Optional)</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="What does this passage mean to you?"
                rows={2}
                className="w-full mt-1 p-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-[#ff6719]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowHighlightModal(false)}
                className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHighlight}
                disabled={!selectedQuote.trim()}
                className="px-4 py-1.5 bg-[#ff6719] hover:bg-[#e85608] disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
              >
                Save to Highlights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
