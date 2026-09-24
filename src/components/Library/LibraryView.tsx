import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { 
  Search, 
  Grid, 
  List, 
  Star, 
  Bookmark, 
  BookOpen
} from 'lucide-react';

interface LibraryViewProps {
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  initialSearchQuery?: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onSelectBook, onOpenReader, initialSearchQuery = '' }) => {
  const { 
    books, 
    categories, 
    loans, 
    currentUser, 
    borrowBook, 
    wishlistBookIds, 
    toggleWishlist,
    systemSettings 
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'borrowed'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'newest'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [borrowStatus, setBorrowStatus] = useState<{ id: string; message: string; success: boolean } | null>(null);

  // Filter & Search Logic
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = book.title.toLowerCase().includes(q);
          const matchAuthor = book.author.toLowerCase().includes(q);
          const matchIsbn = book.isbn.toLowerCase().includes(q);
          const matchCategory = book.categoryName.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchIsbn && !matchCategory) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const cat = categories.find(c => c.slug === selectedCategory);
          if (cat && book.categoryId !== cat.id) return false;
        }

        // Availability filter
        if (availabilityFilter === 'available' && book.availableCopies <= 0) return false;
        if (availabilityFilter === 'borrowed' && book.availableCopies > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'popular') return b.borrowCount - a.borrowCount;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [books, searchQuery, selectedCategory, availabilityFilter, sortBy, categories]);

  const handleBorrow = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = borrowBook(book.id);
    setBorrowStatus({ id: book.id, message: res.message, success: res.success });
    setTimeout(() => setBorrowStatus(null), 4000);
  };

  const handleNotifyWaitlist = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    setBorrowStatus({
      id: book.id,
      message: `You have been added to the notification waitlist for "${book.title}". You will be alerted when a copy becomes available.`,
      success: true
    });
    setTimeout(() => setBorrowStatus(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
      {/* Header Editorial section */}
      <div className="border-b border-[#eae6df] dark:border-[#27272a] pb-5 sm:pb-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#ff6719]">
              Open Digital Catalog
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f4f4f5] mt-1">
              Explore the EPUB Collection
            </h1>
            <p className="text-xs sm:text-sm text-[#59554e] dark:text-[#a1a1aa] font-sans mt-2 max-w-2xl leading-relaxed">
              Curated literature, philosophy, and non-fiction available under digital lending licenses with reflowable EPUB reading.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-[#706c64] dark:text-[#a1a1aa] font-medium hidden sm:inline">
              Showing {filteredBooks.length} books
            </span>
            <div className="flex items-center p-1 bg-[#f0ede6] dark:bg-[#202024] rounded-lg border border-[#e2ddd3] dark:border-[#2e2e33]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'grid' ? 'bg-white dark:bg-[#141416] shadow-xs text-[#1a1a1a] dark:text-[#f4f4f5]' : 'text-[#706c64] dark:text-[#a1a1aa]'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'list' ? 'bg-white dark:bg-[#141416] shadow-xs text-[#1a1a1a] dark:text-[#f4f4f5]' : 'text-[#706c64] dark:text-[#a1a1aa]'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="space-y-4 mb-6 sm:mb-8">
        {/* Search input & Sort selectors */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a857c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, ISBN, or genre..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a1a1e] border border-[#ded9cf] dark:border-[#27272a] rounded-lg text-xs text-[#1a1a1a] dark:text-[#f4f4f5] placeholder-[#9c978f] focus:outline-none focus:border-[#ff6719] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a857c] hover:text-[#1a1a1a] dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Availability dropdown */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-white dark:bg-[#1a1a1e] border border-[#ded9cf] dark:border-[#27272a] rounded-lg text-xs text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
            >
              <option value="all">All Availability</option>
              <option value="available">Available to Borrow</option>
              <option value="borrowed">Currently Loaned Out</option>
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-white dark:bg-[#1a1a1e] border border-[#ded9cf] dark:border-[#27272a] rounded-lg text-xs text-[#1a1a1a] dark:text-[#f4f4f5] focus:outline-none focus:border-[#ff6719]"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === category.slug
                  ? 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-white'
                  : 'bg-white dark:bg-[#1a1a1e] text-[#59554e] dark:text-[#a1a1aa] border-[#e2ddd3] dark:border-[#27272a] hover:border-[#b8b3a7] hover:bg-[#faf7f2] dark:hover:bg-[#202024]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Borrow feedback toast */}
      {borrowStatus && (
        <div className={`mb-6 p-4 rounded-xl border text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in ${
          borrowStatus.success 
            ? 'bg-[#eef8ee] dark:bg-[#142917] border-[#bfe6bf] dark:border-[#25572b] text-[#1b5e20] dark:text-[#4ade80]' 
            : 'bg-[#fdf0f0] dark:bg-[#2e1515] border-[#fad2d2] dark:border-[#522020] text-[#b71c1c] dark:text-[#f87171]'
        }`}>
          <span>{borrowStatus.message}</span>
          <button 
            onClick={() => setBorrowStatus(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#eae6df] dark:border-[#27272a] p-8">
          <BookOpen className="w-12 h-12 text-[#bfb9ae] dark:text-[#52525b] mx-auto mb-3" />
          <h3 className="font-editorial text-xl font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">No Books Found</h3>
          <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] max-w-md mx-auto mt-1 leading-relaxed">
            No titles match your current search criteria or category filter. Try different keywords or request a new title.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setAvailabilityFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-[#f4f1ea] dark:bg-[#202024] hover:bg-[#eae6dc] dark:hover:bg-[#28282e] text-xs font-semibold text-[#1a1a1a] dark:text-[#f4f4f5] rounded-lg transition-colors border border-[#ded8cc] dark:border-[#333]"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredBooks.map(book => {
            const isWishlisted = wishlistBookIds.includes(book.id);
            const isUserBorrowing = loans.some(l => l.userId === currentUser.id && l.bookId === book.id && l.status === 'active');
            const isAvailable = book.availableCopies > 0;

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] hover:border-[#cfc9bc] dark:hover:border-[#3f3f46] transition-all hover:shadow-md flex flex-col overflow-hidden cursor-pointer group"
              >
                {/* Book Cover Container */}
                <div className="relative aspect-[3/4] bg-[#f5f2eb] dark:bg-[#202024] overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  {/* Availability Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs ${
                      isAvailable
                        ? 'bg-emerald-600/90 text-white'
                        : 'bg-stone-800/90 text-stone-200'
                    }`}>
                      {isAvailable ? `${book.availableCopies} of ${book.totalCopies} copies` : 'Unavailable'}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(book.id);
                    }}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all ${
                      isWishlisted 
                        ? 'bg-[#ff6719] text-white' 
                        : 'bg-black/30 hover:bg-black/50 text-white'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Book Meta Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[#8c8880] dark:text-[#a1a1aa] mb-1">
                      <span className="uppercase font-semibold tracking-wider">{book.categoryName}</span>
                      <span className="flex items-center gap-0.5 font-bold text-[#b37400] dark:text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {book.rating}
                      </span>
                    </div>

                    <h3 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5] group-hover:text-[#ff6719] transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] mt-1 font-sans">
                      {book.author} ({book.publishedYear})
                    </p>

                    <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] line-clamp-2 mt-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="mt-4 pt-3 border-t border-[#f4f2ee] dark:border-[#27272a] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8c8880] dark:text-[#71717a]">
                      {book.borrowCount} loans
                    </span>

                    {isUserBorrowing ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReader(book);
                        }}
                        className="px-3 py-1.5 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>
                    ) : isAvailable ? (
                      <button
                        onClick={(e) => handleBorrow(book, e)}
                        className="px-3 py-1.5 bg-[#1a1a1a] dark:bg-white hover:bg-[#333] dark:hover:bg-[#e4e4e7] text-white dark:text-[#1a1a1a] text-xs font-semibold rounded-md transition-colors shadow-xs"
                      >
                        Borrow ({systemSettings.borrowDurationDays}d)
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleNotifyWaitlist(book, e)}
                        className="px-2.5 py-1.5 bg-[#f0ede6] dark:bg-[#202024] hover:bg-[#e2ded5] dark:hover:bg-[#28282e] text-[#59554e] dark:text-[#a1a1aa] text-xs font-medium rounded-md transition-colors"
                      >
                        Waitlist
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredBooks.map(book => {
            const isWishlisted = wishlistBookIds.includes(book.id);
            const isUserBorrowing = loans.some(l => l.userId === currentUser.id && l.bookId === book.id && l.status === 'active');
            const isAvailable = book.availableCopies > 0;

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="bg-white dark:bg-[#1a1a1e] rounded-xl border border-[#e8e4dc] dark:border-[#27272a] hover:border-[#cfc9bc] dark:hover:border-[#3f3f46] p-4 transition-all hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group overflow-hidden w-full max-w-full"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-14 sm:w-16 h-20 sm:h-22 object-cover rounded shadow-xs flex-shrink-0 aspect-[3/4]"
                  />
                  <div className="min-w-0 flex-1 w-full overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#202024] text-[#59554e] dark:text-[#a1a1aa] flex-shrink-0">
                        {book.categoryName}
                      </span>
                      <span className="text-xs text-[#8c8880] dark:text-[#71717a] hidden sm:inline truncate">ISBN: {book.isbn}</span>
                    </div>

                    <h3 className="font-editorial text-base font-bold text-[#1a1a1a] dark:text-[#f4f4f5] group-hover:text-[#ff6719] transition-colors truncate block max-w-full">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#59554e] dark:text-[#a1a1aa] truncate block max-w-full">
                      By {book.author} • {book.pages} pages • {book.publishedYear}
                    </p>

                    <p className="text-xs text-[#706c64] dark:text-[#a1a1aa] line-clamp-1 mt-1 leading-relaxed hidden sm:block">
                      {book.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f4f2ee] dark:border-[#27272a]">
                  <div className="text-left sm:text-right">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isAvailable ? 'bg-emerald-50 dark:bg-[#142616] text-emerald-700 dark:text-emerald-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      {isAvailable ? `${book.availableCopies} of ${book.totalCopies} copies` : 'Unavailable'}
                    </span>
                    <div className="text-[10px] text-[#8c8880] dark:text-[#71717a] mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{book.rating} ({book.ratingCount})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(book.id);
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        isWishlisted 
                          ? 'border-[#ff6719] bg-[#fff0e6] dark:bg-[#ff6719]/15 text-[#ff6719]' 
                          : 'border-[#ded9cf] dark:border-[#333] hover:bg-[#f5f2eb] dark:hover:bg-[#202024] text-[#706c64] dark:text-[#a1a1aa]'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {isUserBorrowing ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReader(book);
                        }}
                        className="px-3.5 py-2 bg-[#ff6719] hover:bg-[#e85608] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>
                    ) : isAvailable ? (
                      <button
                        onClick={(e) => handleBorrow(book, e)}
                        className="px-3.5 py-2 bg-[#1a1a1a] dark:bg-white hover:bg-[#333] dark:hover:bg-[#e4e4e7] text-white dark:text-[#1a1a1a] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs"
                      >
                        Borrow
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleNotifyWaitlist(book, e)}
                        className="px-3.5 py-2 bg-[#f0ede6] dark:bg-[#202024] hover:bg-[#e2ded5] dark:hover:bg-[#28282e] text-[#59554e] dark:text-[#a1a1aa] text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        Waitlist
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
