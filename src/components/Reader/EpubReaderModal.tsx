import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, BookChapter } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Bookmark, 
  Sun, 
  Moon, 
  Coffee, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Columns, 
  Square,
  Lock,
  Sparkles,
  Maximize2,
  Minimize2,
  AlignJustify,
  AlignLeft,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Highlighter,
  X
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
  } = useLibrary();

  // Find active loan
  const activeLoan = loans.find(l => l.userId === currentUser.id && l.bookId === book.id && l.status === 'active');
  const isPreviewOnly = !activeLoan;

  const chapters: BookChapter[] = book.chapters || [];

  // Core reading state
  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);
  const [currentPageInChapter, setCurrentPageInChapter] = useState<number>(0);
  const [totalPagesInChapter, setTotalPagesInChapter] = useState<number>(1);
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null);

  // Google Play Books Typography & Display Settings
  const [fontSizePx, setFontSizePx] = useState<number>(17); // 13px - 26px
  const [fontFamily, setFontFamily] = useState<'newsreader' | 'sans' | 'georgia' | 'dyslexic' | 'mono'>('newsreader');
  const [lineHeight, setLineHeight] = useState<'compact' | 'normal' | 'relaxed'>('normal');
  const [marginSize, setMarginSize] = useState<'compact' | 'normal' | 'wide'>('normal');
  const [textAlign, setTextAlign] = useState<'justify' | 'left'>('justify');
  const [readerTheme, setReaderTheme] = useState<'sepia' | 'light' | 'dark' | 'nightBlue' | 'oled'>('sepia');
  const [viewMode, setViewMode] = useState<'single' | 'double'>('double');
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 850 : false
  );

  // UI state
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<string[]>([]);

  // Highlighting & notes
  const [selectedQuote, setSelectedQuote] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const [showHighlightModal, setShowHighlightModal] = useState<boolean>(false);
  const [highlightToast, setHighlightToast] = useState<string | null>(null);

  // DOM Layout measurements
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const contentFlowRef = useRef<HTMLDivElement | null>(null);
  const [pageAreaDimensions, setPageAreaDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const currentChapter: BookChapter | undefined = chapters[currentChapterIdx];
  const nextChapter: BookChapter | undefined = chapters[currentChapterIdx + 1];

  // Screen resize handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 850;
      setIsMobileScreen(mobile);
      if (mobile && viewMode === 'double') {
        setViewMode('single');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const effectiveViewMode = isMobileScreen ? 'single' : viewMode;

  // Observe page reading area dimensions for dynamic column sizing
  useEffect(() => {
    if (!pageContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setPageAreaDimensions({ width, height });
        }
      }
    });
    ro.observe(pageContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Soft paper rustle audio synthesizer (Web Audio API)
  const playPaperRustle = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.16;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.32));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1450;
      filter.Q.value = 2.4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.19, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Google Play Books theme definitions
  const themeClasses = {
    sepia: {
      wrapper: 'bg-[#ede4d3] text-[#2c241b]',
      bookPage: 'bg-[#fbf7ee] text-[#2c241b] border-[#e2d7c5]',
      header: 'bg-[#ede4d3]/95 text-[#2c241b] border-[#ded3be]',
      accent: 'text-[#ff6719]',
      cardBg: 'bg-[#f4ebd9]',
    },
    light: {
      wrapper: 'bg-[#f0ede6] text-[#18181b]',
      bookPage: 'bg-[#ffffff] text-[#18181b] border-[#e2ded5]',
      header: 'bg-[#f5f3ee]/95 text-[#18181b] border-[#ded8cb]',
      accent: 'text-[#ff6719]',
      cardBg: 'bg-[#f4f2ed]',
    },
    dark: {
      wrapper: 'bg-[#131315] text-[#e4e4e7]',
      bookPage: 'bg-[#1e1f23] text-[#e4e4e7] border-[#2c2d33]',
      header: 'bg-[#131315]/95 text-[#e4e4e7] border-[#27272a]',
      accent: 'text-[#ff6719]',
      cardBg: 'bg-[#27282e]',
    },
    nightBlue: {
      wrapper: 'bg-[#0b1322] text-[#d6e0f0]',
      bookPage: 'bg-[#142036] text-[#d6e0f0] border-[#1f3152]',
      header: 'bg-[#0b1322]/95 text-[#d6e0f0] border-[#1e2e4a]',
      accent: 'text-[#38bdf8]',
      cardBg: 'bg-[#1c2c48]',
    },
    oled: {
      wrapper: 'bg-[#000000] text-[#d1d5db]',
      bookPage: 'bg-[#050507] text-[#d1d5db] border-[#1c1c20]',
      header: 'bg-[#000000]/95 text-[#d1d5db] border-[#1f1f23]',
      accent: 'text-[#ff6719]',
      cardBg: 'bg-[#121214]',
    },
  };

  const currentTheme = themeClasses[readerTheme];

  // Font families
  const fontFamilies = {
    newsreader: "'Newsreader', Georgia, serif",
    sans: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    georgia: "Georgia, 'Times New Roman', serif",
    dyslexic: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
    mono: "'Courier Prime', Courier, monospace",
  };

  // Line height numeric multiplier
  const lineHeightValue = lineHeight === 'compact' ? 1.45 : lineHeight === 'relaxed' ? 2.1 : 1.75;

  // Margin padding
  const marginClasses = {
    compact: 'px-4 sm:px-6 py-4',
    normal: 'px-6 sm:px-10 md:px-14 py-6',
    wide: 'px-8 sm:px-14 md:px-20 py-8',
  };

  // Dynamic Column Layout Calculations
  const centerSpineGap = effectiveViewMode === 'double' ? 48 : 0;
  const pageWidth = effectiveViewMode === 'double' 
    ? Math.max(240, (pageAreaDimensions.width - centerSpineGap) / 2)
    : Math.max(240, pageAreaDimensions.width);

  // AUTOMATIC REFLOW & RE-PAGINATION ENGINE (Zero vertical scrollbar!)
  useLayoutEffect(() => {
    const el = contentFlowRef.current;
    if (!el || pageAreaDimensions.width <= 50 || pageAreaDimensions.height <= 50) return;

    // Wait for the browser to render typography into columns
    const frame = requestAnimationFrame(() => {
      if (!contentFlowRef.current) return;
      const scrollW = contentFlowRef.current.scrollWidth;
      const computedCols = Math.max(1, Math.round((scrollW + centerSpineGap) / (pageWidth + centerSpineGap)));
      
      setTotalPagesInChapter(computedCols);

      // Auto-adjust page index to stay on the equivalent reading point
      setCurrentPageInChapter(prev => {
        const step = effectiveViewMode === 'double' ? 2 : 1;
        const maxPage = Math.max(0, computedCols - 1);
        if (prev > maxPage) {
          return Math.floor(maxPage / step) * step;
        }
        return Math.floor(prev / step) * step;
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    currentChapterIdx,
    pageAreaDimensions.width,
    pageAreaDimensions.height,
    effectiveViewMode,
    pageWidth,
    centerSpineGap,
    fontSizePx,
    fontFamily,
    lineHeight,
    marginSize,
    textAlign
  ]);

  // Overall reading progress calculation
  const totalEstimatedBookPages = chapters.reduce((acc, ch, idx) => {
    if (idx === currentChapterIdx) return acc + totalPagesInChapter;
    const estPages = Math.max(1, Math.round((ch.readTimeMinutes || 3) * 2.5));
    return acc + estPages;
  }, 0);

  const currentBookPageNumber = chapters.slice(0, currentChapterIdx).reduce((acc, ch) => {
    return acc + Math.max(1, Math.round((ch.readTimeMinutes || 3) * 2.5));
  }, 0) + (currentPageInChapter + 1);

  const progressPercentage = Math.min(100, Math.max(1, Math.round((currentBookPageNumber / Math.max(1, totalEstimatedBookPages)) * 100)));

  // Estimated reading time left in current chapter
  const pagesRemainingInChapter = Math.max(0, totalPagesInChapter - (currentPageInChapter + 1));
  const estimatedMinsLeft = Math.max(1, Math.ceil(pagesRemainingInChapter * 0.8));

  // Auto-sync reading progress with library profile
  useEffect(() => {
    if (activeLoan && currentChapter) {
      updateReadingProgress(book.id, progressPercentage, currentChapter.id);
    }
  }, [currentChapterIdx, currentPageInChapter, progressPercentage, book.id, activeLoan]);

  // Page turning actions
  const handleNextPage = () => {
    if (isFlipping) return;
    const step = effectiveViewMode === 'double' ? 2 : 1;
    
    if (currentPageInChapter + step < totalPagesInChapter) {
      setIsFlipping('next');
      playPaperRustle();
      setTimeout(() => {
        setCurrentPageInChapter(prev => prev + step);
        setIsFlipping(null);
      }, 420);
    } else if (currentChapterIdx < chapters.length - 1) {
      // Transition smoothly to next chapter
      setIsFlipping('next');
      playPaperRustle();
      setTimeout(() => {
        setCurrentChapterIdx(prev => prev + 1);
        setCurrentPageInChapter(0);
        setIsFlipping(null);
      }, 420);
    }
  };

  const handlePrevPage = () => {
    if (isFlipping) return;
    const step = effectiveViewMode === 'double' ? 2 : 1;

    if (currentPageInChapter - step >= 0) {
      setIsFlipping('prev');
      playPaperRustle();
      setTimeout(() => {
        setCurrentPageInChapter(prev => Math.max(0, prev - step));
        setIsFlipping(null);
      }, 420);
    } else if (currentChapterIdx > 0) {
      // Transition to previous chapter's end
      setIsFlipping('prev');
      playPaperRustle();
      setTimeout(() => {
        setCurrentChapterIdx(prev => prev - 1);
        // Will be clamped to the last page by the layout effect
        setCurrentPageInChapter(99999);
        setIsFlipping(null);
      }, 420);
    }
  };

  const jumpToChapter = (chapterIdx: number) => {
    if (chapterIdx < 0 || chapterIdx >= chapters.length) return;
    setIsFlipping('next');
    playPaperRustle();
    setTimeout(() => {
      setCurrentChapterIdx(chapterIdx);
      setCurrentPageInChapter(0);
      setIsFlipping(null);
    }, 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else if (showToc) {
          setShowToc(false);
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageInChapter, totalPagesInChapter, currentChapterIdx, chapters.length, isFlipping, effectiveViewMode, showSettings, showToc]);

  // Touch Swipe for Mobile / Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Horizontal swipe must dominate vertical motion
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX > 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Bookmark current page/chapter
  const bookmarkKey = `${currentChapter?.id || 'ch'}-p${currentPageInChapter}`;
  const isBookmarked = bookmarkedPages.includes(bookmarkKey);

  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarkedPages(prev => prev.filter(k => k !== bookmarkKey));
    } else {
      setBookmarkedPages(prev => [...prev, bookmarkKey]);
    }
  };

  // Save highlight note
  const handleSaveHighlight = () => {
    if (!selectedQuote.trim() || !currentChapter) return;
    addHighlight(book.id, currentChapter.title, selectedQuote.trim(), noteText.trim() || undefined);
    setShowHighlightModal(false);
    setSelectedQuote('');
    setNoteText('');
    setHighlightToast('Highlight saved to your library profile!');
    setTimeout(() => setHighlightToast(null), 3500);
  };

  // Active spread page numbers
  const leftPageNum = currentPageInChapter + 1;
  const rightPageNum = currentPageInChapter + 2;
  const isLastSpreadOdd = effectiveViewMode === 'double' && rightPageNum > totalPagesInChapter;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${currentTheme.wrapper} transition-colors duration-200 select-none overflow-hidden font-ui`}>
      {/* Google Play Books Top Floating Header (Auto-hideable for immersive reading) */}
      <header className={`px-3 sm:px-6 py-2 sm:py-2.5 border-b flex items-center justify-between gap-2 sm:gap-4 transition-transform duration-300 z-40 ${
        hudVisible ? 'translate-y-0' : '-translate-y-full opacity-0 pointer-events-none'
      } ${currentTheme.header} backdrop-blur-md shadow-xs`}>
        {/* Left: Close & Book Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Exit Reader"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setShowToc(!showToc);
              setShowSettings(false);
            }}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              showToc ? 'bg-[#ff6719] text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Table of Contents"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden lg:inline">Contents</span>
          </button>

          <div className="h-4 w-px bg-current opacity-20 hidden sm:block"></div>

          <div className="min-w-0">
            <h1 className="font-editorial text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h1>
            <p className="text-[10px] sm:text-[11px] opacity-75 truncate max-w-[120px] sm:max-w-xs">
              {currentChapter ? currentChapter.title : 'Chapter'} • {book.author}
            </p>
          </div>
        </div>

        {/* Center: Google Play Books Page Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] bg-black/5 dark:bg-white/5 border border-current/10 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#ff6719]" />
          <span>Reflowable Digital Edition • No Scroll</span>
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {/* Audio Page Turn Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              soundEnabled ? 'text-[#ff6719]' : 'opacity-40 hover:opacity-100'
            }`}
            title={soundEnabled ? 'Turn Audio: On' : 'Turn Audio: Off'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Single vs Spread Toggle (desktop/tablet only) */}
          {!isMobileScreen && (
            <button
              onClick={() => setViewMode(viewMode === 'single' ? 'double' : 'single')}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden sm:block"
              title={viewMode === 'double' ? 'Switch to Single Page' : 'Switch to Two-Page Spread'}
            >
              {viewMode === 'double' ? <Columns className="w-4 h-4 text-[#ff6719]" /> : <Square className="w-4 h-4" />}
            </button>
          )}

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              isBookmarked ? 'text-[#ff6719]' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this Page'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Highlight Selection */}
          <button
            onClick={() => {
              const selection = window.getSelection()?.toString();
              setSelectedQuote(selection || '');
              setShowHighlightModal(true);
            }}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#ff6719]"
            title="Create Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden sm:block"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Google Play Books "Aa" Display Settings Button */}
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowToc(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
              showSettings 
                ? 'bg-[#ff6719] text-white shadow-xs' 
                : 'hover:bg-black/5 dark:hover:bg-white/10 border border-current/20'
            }`}
            title="Font & Display Settings (Aa)"
          >
            <span className="font-editorial text-sm">Aa</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </header>

      {/* Google Play Books "Aa" Popover Settings Card */}
      {showSettings && (
        <div className={`absolute top-12 sm:top-14 right-3 sm:right-6 z-50 w-[320px] sm:w-[380px] rounded-2xl p-4 sm:p-5 border shadow-2xl backdrop-blur-xl transition-all ${
          currentTheme.cardBg
        } border-black/10 dark:border-white/10 space-y-4`}>
          <div className="flex items-center justify-between border-b border-current/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">Reading Settings</span>
            <button onClick={() => setShowSettings(false)} className="opacity-60 hover:opacity-100 p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Palette Chips */}
          <div>
            <label className="text-[11px] font-semibold opacity-70 block mb-1.5">Theme Palette</label>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`py-2 rounded-xl text-[10px] font-bold border flex flex-col items-center gap-1 transition-all ${
                  readerTheme === 'sepia' 
                    ? 'border-[#ff6719] bg-[#fbf7ee] text-[#2c241b] ring-2 ring-[#ff6719]/40' 
                    : 'bg-[#fbf7ee] text-[#2c241b] border-black/10'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-[#a87440]" />
                <span>Sepia</span>
              </button>

              <button
                onClick={() => setReaderTheme('light')}
                className={`py-2 rounded-xl text-[10px] font-bold border flex flex-col items-center gap-1 transition-all ${
                  readerTheme === 'light' 
                    ? 'border-[#ff6719] bg-white text-[#18181b] ring-2 ring-[#ff6719]/40' 
                    : 'bg-white text-[#18181b] border-black/10'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                onClick={() => setReaderTheme('dark')}
                className={`py-2 rounded-xl text-[10px] font-bold border flex flex-col items-center gap-1 transition-all ${
                  readerTheme === 'dark' 
                    ? 'border-[#ff6719] bg-[#1e1f23] text-white ring-2 ring-[#ff6719]/40' 
                    : 'bg-[#1e1f23] text-zinc-300 border-white/10'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => setReaderTheme('nightBlue')}
                className={`py-2 rounded-xl text-[10px] font-bold border flex flex-col items-center gap-1 transition-all ${
                  readerTheme === 'nightBlue' 
                    ? 'border-[#38bdf8] bg-[#142036] text-blue-100 ring-2 ring-[#38bdf8]/40' 
                    : 'bg-[#142036] text-blue-200 border-white/10'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500/40"></span>
                <span>Navy</span>
              </button>

              <button
                onClick={() => setReaderTheme('oled')}
                className={`py-2 rounded-xl text-[10px] font-bold border flex flex-col items-center gap-1 transition-all ${
                  readerTheme === 'oled' 
                    ? 'border-[#ff6719] bg-black text-white ring-2 ring-[#ff6719]/40' 
                    : 'bg-black text-zinc-400 border-white/15'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-zinc-800"></span>
                <span>OLED</span>
              </button>
            </div>
          </div>

          {/* Font Size Stepper */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold opacity-70 mb-1.5">
              <span>Font Size</span>
              <span>{fontSizePx}px</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSizePx(prev => Math.max(13, prev - 1))}
                className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center font-bold text-xs"
                title="Decrease font size"
              >
                A-
              </button>
              <input
                type="range"
                min="13"
                max="26"
                step="1"
                value={fontSizePx}
                onChange={(e) => setFontSizePx(Number(e.target.value))}
                className="flex-1 h-1.5 bg-current/20 rounded-full appearance-none accent-[#ff6719] cursor-pointer"
              />
              <button
                onClick={() => setFontSizePx(prev => Math.min(26, prev + 1))}
                className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center font-bold text-sm"
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Font Family Selector */}
          <div>
            <label className="text-[11px] font-semibold opacity-70 block mb-1.5">Typeface</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setFontFamily('newsreader')}
                className={`px-3 py-1.5 rounded-lg text-xs font-editorial transition-all text-left truncate ${
                  fontFamily === 'newsreader' 
                    ? 'bg-[#ff6719] text-white font-bold shadow-xs' 
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                }`}
              >
                Literary Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all text-left truncate ${
                  fontFamily === 'sans' 
                    ? 'bg-[#ff6719] text-white font-bold shadow-xs' 
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                }`}
              >
                Clean Sans
              </button>
              <button
                onClick={() => setFontFamily('georgia')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-all text-left truncate ${
                  fontFamily === 'georgia' 
                    ? 'bg-[#ff6719] text-white font-bold shadow-xs' 
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                }`}
              >
                Classic Georgia
              </button>
              <button
                onClick={() => setFontFamily('dyslexic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all text-left truncate ${
                  fontFamily === 'dyslexic' 
                    ? 'bg-[#ff6719] text-white font-bold shadow-xs' 
                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                }`}
              >
                High Legibility
              </button>
            </div>
          </div>

          {/* Line Height & Alignment */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-current/10">
            <div>
              <label className="text-[11px] font-semibold opacity-70 block mb-1">Line Height</label>
              <div className="flex rounded-lg bg-black/5 dark:bg-white/5 p-0.5">
                {(['compact', 'normal', 'relaxed'] as const).map(lh => (
                  <button
                    key={lh}
                    onClick={() => setLineHeight(lh)}
                    className={`flex-1 py-1 rounded text-[10px] font-semibold capitalize transition-all ${
                      lineHeight === lh ? 'bg-[#ff6719] text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {lh === 'compact' ? 'Tight' : lh === 'normal' ? 'Norm' : 'Loose'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold opacity-70 block mb-1">Alignment</label>
              <div className="flex rounded-lg bg-black/5 dark:bg-white/5 p-0.5">
                <button
                  onClick={() => setTextAlign('justify')}
                  className={`flex-1 py-1 rounded flex items-center justify-center transition-all ${
                    textAlign === 'justify' ? 'bg-[#ff6719] text-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  title="Justified alignment"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign('left')}
                  className={`flex-1 py-1 rounded flex items-center justify-center transition-all ${
                    textAlign === 'left' ? 'bg-[#ff6719] text-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  title="Left alignment"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Margins */}
          <div className="pt-1 border-t border-current/10">
            <label className="text-[11px] font-semibold opacity-70 block mb-1">Page Margins</label>
            <div className="flex rounded-lg bg-black/5 dark:bg-white/5 p-0.5">
              {(['compact', 'normal', 'wide'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMarginSize(m)}
                  className={`flex-1 py-1 rounded text-[10px] font-semibold capitalize transition-all ${
                    marginSize === m ? 'bg-[#ff6719] text-white' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas & Book Experience */}
      <div 
        className="flex-1 flex overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Table of Contents Drawer */}
        {showToc && (
          <aside className={`w-72 sm:w-84 border-r flex flex-col z-30 transition-all shadow-2xl ${currentTheme.header}`}>
            <div className="p-4 border-b border-current/10 flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-sm font-bold">Table of Contents</h3>
                <p className="text-[10px] opacity-75">{chapters.length} Chapters Available</p>
              </div>
              <button onClick={() => setShowToc(false)} className="opacity-70 hover:opacity-100 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {chapters.map((chap, idx) => (
                <button
                  key={chap.id}
                  onClick={() => {
                    jumpToChapter(idx);
                    setShowToc(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    currentChapterIdx === idx
                      ? 'bg-[#ff6719] text-white font-semibold shadow-xs'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="truncate pr-2">{idx + 1}. {chap.title}</span>
                  <div className="flex items-center gap-1.5 opacity-80 flex-shrink-0 text-[10px]">
                    <span>{chap.readTimeMinutes}m</span>
                    {bookmarkedPages.some(k => k.startsWith(chap.id)) && (
                      <Bookmark className="w-3 h-3 fill-current text-[#ff6719]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Book Viewport Container */}
        <main className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 relative overflow-hidden">
          {/* Desktop Left Hover Page Turner */}
          <button
            onClick={handlePrevPage}
            disabled={(currentChapterIdx === 0 && currentPageInChapter === 0) || !!isFlipping}
            className="absolute left-2 sm:left-4 z-20 w-10 h-10 rounded-full bg-black/15 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/25 text-current hidden md:flex items-center justify-center backdrop-blur-xs disabled:opacity-0 disabled:pointer-events-none transition-all shadow-md active:scale-95"
            title="Previous Page (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Desktop Right Hover Page Turner */}
          <button
            onClick={handleNextPage}
            disabled={(currentChapterIdx >= chapters.length - 1 && currentPageInChapter + (effectiveViewMode === 'double' ? 2 : 1) >= totalPagesInChapter) || !!isFlipping}
            className="absolute right-2 sm:right-4 z-20 w-10 h-10 rounded-full bg-black/15 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/25 text-current hidden md:flex items-center justify-center backdrop-blur-xs disabled:opacity-0 disabled:pointer-events-none transition-all shadow-md active:scale-95"
            title="Next Page (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* The Physical 3D Book Layout Container */}
          <div 
            onWheel={(e) => {
              if (Math.abs(e.deltaX) > 35) {
                if (e.deltaX > 0) handleNextPage();
                else handlePrevPage();
              }
            }}
            onClick={(e) => {
              // Click handling: Left 20% = Prev, Right 20% = Next, Center 60% = Toggle HUD
              if (window.getSelection()?.toString().trim()) return; // Don't flip when selecting text
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const width = rect.width;
              if (clickX < width * 0.20) {
                handlePrevPage();
              } else if (clickX > width * 0.80) {
                handleNextPage();
              } else {
                setHudVisible(prev => !prev);
              }
            }}
            className={`w-full max-w-6xl h-full max-h-[calc(100dvh-120px)] sm:max-h-[86vh] rounded-xl sm:rounded-2xl border shadow-2xl relative flex flex-col overflow-hidden ${
              currentTheme.bookPage
            } paper-edge-layers`}
          >
            {/* Pratinjau banner if preview only */}
            {isPreviewOnly && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3 h-3" />
                <span>Chapter Preview • Borrow to unlock all reading highlights</span>
              </div>
            )}

            {/* Running Header (Physical Book Header) */}
            <div className="px-6 sm:px-12 pt-3 sm:pt-4 pb-2 border-b border-current/10 flex items-center justify-between text-[11px] opacity-60 flex-shrink-0">
              <span className="truncate max-w-[45%] font-medium">
                {book.title}
              </span>
              <span className="truncate max-w-[45%] text-right font-medium">
                {currentChapter ? currentChapter.title : 'Chapter'}
              </span>
            </div>

            {/* THE CORE READING CANVAS (Multi-column pagination, NO SCROLLBAR!) */}
            <div 
              ref={pageContainerRef}
              className={`flex-1 relative overflow-hidden no-scrollbar ${marginClasses[marginSize]}`}
            >
              {/* Inner Multi-column Flow Element */}
              <div 
                ref={contentFlowRef}
                className="epub-column-flow h-full text-current select-text"
                style={{
                  height: `${pageAreaDimensions.height}px`,
                  columnWidth: `${pageWidth}px`,
                  columnGap: `${centerSpineGap}px`,
                  columnFill: 'auto',
                  width: 'max-content',
                  transform: `translateX(-${(effectiveViewMode === 'double' ? Math.floor(currentPageInChapter / 2) * 2 : currentPageInChapter) * (pageWidth + centerSpineGap)}px)`,
                  transition: isFlipping ? 'none' : 'transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
                  fontSize: `${fontSizePx}px`,
                  lineHeight: lineHeightValue,
                  fontFamily: fontFamilies[fontFamily],
                  textAlign: textAlign,
                }}
              >
                {/* Chapter Title Head on Page 1 */}
                <div className="mb-6 break-inside-avoid">
                  <div className="text-[11px] uppercase tracking-widest font-bold opacity-60 mb-1">
                    Chapter {currentChapterIdx + 1} of {chapters.length}
                  </div>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight pb-3 border-b border-current/15">
                    {currentChapter?.title || 'Chapter'}
                  </h2>
                </div>

                {/* Chapter HTML Content */}
                <div 
                  className="epub-content max-w-none text-current"
                  dangerouslySetInnerHTML={{ __html: currentChapter?.content || '' }}
                />

                {/* Chapter End Decorator */}
                <div className="mt-8 pt-6 border-t border-current/10 text-center opacity-60 break-inside-avoid">
                  <span className="text-sm font-editorial">❦ ❦ ❦</span>
                  <p className="text-[11px] mt-1">End of Chapter {currentChapterIdx + 1}</p>
                </div>
              </div>

              {/* Center Spine Crease & Fold Shadow (visible in Two-Page Spread) */}
              {effectiveViewMode === 'double' && (
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 pointer-events-none flex items-center justify-center z-10">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-black/45"></div>
                  <div className="absolute top-0 bottom-0 w-px bg-black/15 dark:bg-black/50"></div>
                </div>
              )}

              {/* End of Chapter teaser card on right page if last spread is odd */}
              {isLastSpreadOdd && (
                <div 
                  className="absolute top-0 bottom-0 right-0 pointer-events-auto flex items-center justify-center p-8 z-10"
                  style={{ width: `${pageWidth}px` }}
                >
                  <div className="max-w-xs text-center p-6 rounded-2xl border border-current/15 bg-black/5 dark:bg-white/5 space-y-3">
                    <BookOpen className="w-8 h-8 mx-auto text-[#ff6719]" />
                    <h3 className="font-editorial font-bold text-base">You've finished this chapter</h3>
                    {nextChapter ? (
                      <>
                        <p className="text-xs opacity-75">
                          Up next: <strong>{nextChapter.title}</strong> ({nextChapter.readTimeMinutes} min)
                        </p>
                        <button
                          onClick={handleNextPage}
                          className="px-4 py-2 rounded-xl bg-[#ff6719] text-white text-xs font-bold hover:bg-[#e85608] transition-colors shadow-xs"
                        >
                          Continue to Chapter {currentChapterIdx + 2} →
                        </button>
                      </>
                    ) : (
                      <p className="text-xs opacity-75">
                        Congratulations! You have completed the digital edition.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 3D Realistic Page Curl Overlays (Google Play Books animation) */}
              {isFlipping === 'next' && (
                <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#faf6eb] via-[#f0ebe0] to-[#e4ded0] dark:from-[#202024] dark:via-[#1a1a1e] dark:to-[#121214] z-30 animate-page-turn-next origin-left pointer-events-none flex items-center justify-center shadow-2xl border-l border-black/10">
                  <div className="w-full h-full p-8 opacity-25 flex flex-col justify-center items-center">
                    <div className="w-28 h-1 bg-current rounded-full mb-3"></div>
                    <div className="w-40 h-1 bg-current rounded-full mb-2"></div>
                    <div className="w-32 h-1 bg-current rounded-full"></div>
                  </div>
                </div>
              )}

              {isFlipping === 'prev' && (
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#faf6eb] via-[#f0ebe0] to-[#e4ded0] dark:from-[#202024] dark:via-[#1a1a1e] dark:to-[#121214] z-30 animate-page-turn-prev origin-right pointer-events-none flex items-center justify-center shadow-2xl border-r border-black/10">
                  <div className="w-full h-full p-8 opacity-25 flex flex-col justify-center items-center">
                    <div className="w-28 h-1 bg-current rounded-full mb-3"></div>
                    <div className="w-40 h-1 bg-current rounded-full mb-2"></div>
                    <div className="w-32 h-1 bg-current rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Running Footer (Page Numbers & Chapter Time) */}
            <div className="px-6 sm:px-12 py-2 sm:py-3 border-t border-current/10 flex items-center justify-between text-[11px] opacity-60 flex-shrink-0">
              {effectiveViewMode === 'double' ? (
                <>
                  <span>Page {leftPageNum}</span>
                  <span className="hidden sm:inline text-[10px]">
                    {estimatedMinsLeft} min left in chapter
                  </span>
                  <span>
                    {rightPageNum <= totalPagesInChapter ? `Page ${rightPageNum}` : ''} of {totalPagesInChapter}
                  </span>
                </>
              ) : (
                <>
                  <span>Page {leftPageNum} of {totalPagesInChapter}</span>
                  <span>{estimatedMinsLeft} min left in chapter</span>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Google Play Books Bottom HUD Scrubber & Quick Progress Slider */}
      <footer className={`px-3 sm:px-6 py-2 sm:py-3 border-t transition-transform duration-300 z-40 ${
        hudVisible ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'
      } ${currentTheme.header} backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs`}>
        {/* Scrubber & Page Indicator */}
        <div className="flex-1 w-full flex items-center gap-2 sm:gap-3">
          {/* Prev Chapter */}
          <button
            onClick={() => jumpToChapter(currentChapterIdx - 1)}
            disabled={currentChapterIdx === 0 || !!isFlipping}
            className="p-1.5 rounded-lg border border-current/15 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 transition-all flex items-center gap-1 flex-shrink-0"
            title="Previous Chapter"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold hidden md:inline">Prev Ch.</span>
          </button>

          {/* Prev Page Button (Mobile & Desktop) */}
          <button
            onClick={handlePrevPage}
            disabled={(currentChapterIdx === 0 && currentPageInChapter === 0) || !!isFlipping}
            className="p-1.5 rounded-lg border border-current/15 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 transition-all flex items-center gap-1 flex-shrink-0"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">Prev</span>
          </button>

          {/* Progress Percentage */}
          <span className="font-bold text-[#ff6719] min-w-[36px] text-center text-xs">
            {progressPercentage}%
          </span>

          {/* Smooth Book Scrubber Slider */}
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max={chapters.length - 1}
              value={currentChapterIdx}
              onChange={(e) => jumpToChapter(Number(e.target.value))}
              className="w-full h-1.5 bg-current/20 rounded-full appearance-none accent-[#ff6719] cursor-pointer"
            />
          </div>

          {/* Next Page Button */}
          <button
            onClick={handleNextPage}
            disabled={(currentChapterIdx >= chapters.length - 1 && currentPageInChapter + (effectiveViewMode === 'double' ? 2 : 1) >= totalPagesInChapter) || !!isFlipping}
            className="p-1.5 rounded-lg border border-current/15 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 transition-all flex items-center gap-1 flex-shrink-0"
            title="Next Page"
          >
            <span className="text-[10px] font-semibold">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Next Chapter */}
          <button
            onClick={() => jumpToChapter(currentChapterIdx + 1)}
            disabled={currentChapterIdx >= chapters.length - 1 || !!isFlipping}
            className="p-1.5 rounded-lg border border-current/15 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 transition-all flex items-center gap-1 flex-shrink-0"
            title="Next Chapter"
          >
            <span className="text-[10px] font-semibold hidden md:inline">Next Ch.</span>
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reader Feedback / Tips */}
        <div className="flex items-center gap-3 text-[11px] opacity-75 justify-between sm:justify-end w-full sm:w-auto">
          {highlightToast ? (
            <span className="text-emerald-600 font-bold">{highlightToast}</span>
          ) : (
            <span className="hidden lg:inline">Tap sides to turn • Tap center to hide controls</span>
          )}

          <button
            onClick={() => setHudVisible(false)}
            className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/10 text-current hover:opacity-100 transition-opacity font-medium"
            title="Hide controls for pure reading"
          >
            Reading Mode
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
              <label className="text-[11px] font-semibold text-stone-500 uppercase">Selected Quote</label>
              <textarea
                value={selectedQuote}
                onChange={(e) => setSelectedQuote(e.target.value)}
                placeholder="Enter or paste a memorable excerpt from the book..."
                rows={3}
                className="w-full mt-1 p-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-[#ff6719]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-500 uppercase">Personal Reflection (Optional)</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your personal notes or reflections..."
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
