import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import EditHighlightModal from "@/components/EditHighlightModal";
import StagingArea from "@/components/StagingArea";
import HighlightDisplay from "@/components/HighlightDisplay";
import { useStagingArea } from "@/hooks/useStagingArea";
import { toast } from "sonner";
import { Book, Highlight } from "@/interfaces";
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { getScrollPositionFromLocalCache, setScrollPositionToLocalCache } from "@/utils/scrollPositionHelpers";

export default function BookOnlineView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(location.state?.book || null);

  // Early return if no book
  if (!book) return <div className="text-center mt-10 text-red-500">No book data found.</div>;

  // State
  const [search, setSearch] = useState("");
  const [showHighlights, setShowHighlights] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [showUrlsOnly, setShowUrlsOnly] = useState(true);
  const [showQuotes, setShowQuotes] = useState(true);
  const [isViewFilterOpen, setIsViewFilterOpen] = useState(false);
  const [strictPunctuation, setStrictPunctuation] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "page" | "location">("default");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
  const [showStagingArea, setShowStagingArea] = useState(false);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  // Refs
  const highlightRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Use staging area hook
  const {
    stagingArea,
    isCommitting,
    addToStagingArea,
    removeFromStagingArea,
    clearStagingArea,
    isHighlightStaged,
    getEffectiveHighlight,
    commitStagedOperations,
  } = useStagingArea({
    bookId: book._id,
    onUpdateLocalBookData: updateLocalBookData,
    onHandleFailedOperations: handleFailedOperations,
  });


  // Filter and sort highlights
  const filteredHighlights = book.highlights
    ? book.highlights
      .filter((hl: any) => {
        const stagedOp = isHighlightStaged(hl._id);
        if (stagedOp?.type === 'delete' || stagedOp?.type === 'edit') return false;

        const isActive = hl.knowledge_end_date === null;
        const matchesSearch = search
          ? hl.highlight.toLowerCase().includes(search.toLowerCase())
          : true;
        const matchesType =
          (showHighlights && hl.type === "highlight") ||
          (showNotes && hl.type === "note") ||
          (showUrlsOnly && hl.containsUrl);
        return isActive && matchesSearch && matchesType;
      })
      .map((hl: any) => getEffectiveHighlight(hl))
      .sort((a: any, b: any) => {
        if (sortBy === "page") {
          const pageA = a.page ?? Infinity;
          const pageB = b.page ?? Infinity;
          return pageA - pageB;
        }
        if (sortBy === "location") {
          const locA = a.location?.start ?? Infinity;
          const locB = b.location?.start ?? Infinity;
          return locA - locB;
        }
        return 0; // default: keep original order
      })
    : [];

  // Effects
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Backspace") {
        e.preventDefault();
        navigate("/dashboard");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // URL detection
  useEffect(() => {
    if (book && book.highlights) {
      book.highlights.forEach((hl: any) => {
        // when you make const urlRegex outside of the loop, it will return incorrect results for highlights that contain URLs.
        // This is because the regex is not re-evaluated for each highlight.
        // Instead, we define it inside the loop to ensure it checks each highlight individually.
        /**
         * The issue is that urlRegex.test() has a stateful behavior with the global flag (g).
         * When you call test() multiple times on the same regex object, it maintains an internal lastIndex 
            position and continues searching from where it left off.
         */
        const urlRegex = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g;
        hl.containsUrl = urlRegex.test(hl.highlight);
      });
    }
  }, [book]);

  useEffect(() => {
    if (filteredHighlights && filteredHighlights.length > 0 && !hasInitialScrolled) {
      const savedPosition = getScrollPositionFromLocalCache(book._id);
      if (savedPosition !== null && savedPosition < filteredHighlights.length) {
        // Scroll to saved position
        setTimeout(() => {
          const element = highlightRefs.current[savedPosition];
          if (element) {
            element.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
          setHasInitialScrolled(true); // Mark as scrolled
        }, 100);
      } else {
        // Scroll to top if no saved position
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
          setHasInitialScrolled(true); // Mark as scrolled
        }, 100);
      }
    }

  }, [hasInitialScrolled]);

  // Use the scroll position hook
  useScrollPosition({
    enabled: hasInitialScrolled && filteredHighlights?.length > 0,
    items: filteredHighlights,
    itemRefs: highlightRefs,
    onPositionChange: setScrollPositionToLocalCache,
    throttleMs: 100,    // Process scroll events every 100ms
    debounceMs: 1000,    // Save position 1000ms after scrolling stops
    bookId: book._id
  });

  // Helper functions
  const makeUrlsClickable = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      const testRegex = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g;
      if (testRegex.test(part)) {
        if (showQuotes && part.endsWith('"'))
          part = part.slice(0, -1);
        if (strictPunctuation && part.endsWith('.'))
          part = part.slice(0, -1);

        const href = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {part}
          </a>
        );
      }

      if (index === 0 && showQuotes && !part.startsWith('"')) {
        part = `"${part}`;
      }
      if (index === parts.length - 1) {
        if (strictPunctuation && !part.endsWith('.')) {
          part += '.';
        }
        if (showQuotes && !part.endsWith('"'))
          part += '"';
      }
      return part;
    });
  };

  // Handlers
  const handleDeleteIconClick = (index: number, highlight: Highlight) => {
    addToStagingArea({
      type: 'delete',
      highlightId: highlight._id,
      originalHighlight: highlight,
    });
  };

  const handleEditIconClick = (index: number, highlight: Highlight) => {
    setEditingHighlight({ ...highlight });
    setIsEditModalOpen(true);
  };

  const handleSaveOnEditComplete = (updatedHighlight: any) => {
    if (editingHighlight) {
      addToStagingArea({
        type: 'edit',
        highlightId: editingHighlight._id,
        originalHighlight: editingHighlight,
        updatedHighlight: updatedHighlight,
      });

      setIsEditModalOpen(false);
      setEditingHighlight(null);
    }
  };

  // Business logic functions
  function updateLocalBookData(successfulOperations: any[]) {
    if (!book || !book.highlights) return;

    successfulOperations.forEach((successOp) => {
      const { operationId, highlightId, type } = successOp;
      const stagedOp = stagingArea.find(op => op.id === operationId);
      if (!stagedOp) return;

      const highlightIndex = book.highlights.findIndex(hl => hl._id === highlightId);
      if (highlightIndex === -1) return;

      if (type === 'edit' && stagedOp.updatedHighlight) {
        book.highlights[highlightIndex] = {
          ...book.highlights[highlightIndex],
          ...stagedOp.updatedHighlight,
        };
        // console.log(`Updated highlight ${highlightId} locally`);
      } else if (type === 'delete') {
        book.highlights[highlightIndex] = {
          ...book.highlights[highlightIndex],
          knowledge_end_date: new Date().toISOString(),
        };
        // console.log(`Soft deleted highlight ${highlightId} locally`);
      }
    });

    updateBookCache(book);
  }

  function handleFailedOperations(failedOperations: any[]) {
    if (failedOperations.length === 0) return;

    failedOperations.forEach((failedOp) => {
      const stagedOp = stagingArea.find(op => op.id === failedOp.operationId);
      const operationType = failedOp.type || stagedOp?.type || 'operate on highlight';
      const highlightPreview = stagedOp?.originalHighlight?.highlight?.substring(0, 50) || 'Unknown highlight';

      toast.error(
        `Failed to ${operationType} highlight: "${highlightPreview}${highlightPreview.length >= 50 ? '...' : ''}"`,
        {
          description: failedOp.message || 'Committing Staging Data failed.',
          duration: 5000,
        }
      );
      console.error(`Operation ${failedOp.operationId} failed:`, failedOp.message);
    });
  }

  function updateBookCache(updatedBook: any) {
    try {
      const bookCacheKey = `book_${updatedBook._id}`;
      localStorage.setItem(bookCacheKey, JSON.stringify(updatedBook));
    } catch (error) {
      console.error('Failed to update book cache:', error);
    }
  }

  const setHighlightRef = (index: number) => (el: HTMLDivElement | null) => {
    highlightRefs.current[index] = el;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-royal-100/30 to-royal-200/30 dark:from-background dark:via-royal-900/10 dark:to-royal-900/10">
      <div className="max-w-3xl mx-auto py-10 px-4" ref={containerRef}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="flex items-center text-royal-600 hover:text-royal-800 dark:text-royal-400 dark:hover:text-royal-300 transition-colors"
            onClick={() => navigate("/dashboard")}
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <button
            onClick={() => setShowStagingArea(!showStagingArea)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${stagingArea.length > 0
                ? 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300'
                : 'border-gray-300 text-gray-600 dark:border-border dark:text-muted-foreground'
              }`}
          >
            <Package className="w-4 h-4" />
            <span>Staging ({stagingArea.length})</span>
          </button>
        </div>

        {/* Staging Section */}
        {showStagingArea && (
          <StagingArea
            stagingArea={stagingArea}
            isCommitting={isCommitting}
            isDesktop={isDesktop}
            onRemoveOperation={removeFromStagingArea}
            onClearAll={clearStagingArea}
            onCommitAll={commitStagedOperations}
          />
        )}

        {/* Book Title and Search */}
        <h1 className="text-3xl font-bold text-royal-700 dark:text-royal-400 mb-2 text-center">{book.title}</h1>
        <h2 className="text-lg text-gray-600 dark:text-muted-foreground mb-8 text-center">by {book.author}</h2>

        <GlobalSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search highlights..."
        />

        {/* Filters */}
        <div className="flex gap-6 items-center mb-6 mt-2 justify-center">
          <label className="flex items-center gap-2">
            Show results for:
            <input
              type="checkbox"
              checked={showHighlights}
              onChange={() => setShowHighlights((v) => !v)}
              className="accent-royal-600"
            />
            <span>Highlights</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showNotes}
              onChange={() => setShowNotes((v) => !v)}
              className="accent-royal-600"
            />
            <span>Notes</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showUrlsOnly}
              onChange={() => setShowUrlsOnly((v) => !v)}
              className="accent-royal-600"
            />
            <span>Urls</span>
          </label>
        </div>

        {/* View Filter */}
        <div className="mb-6 justify-center">
          <button
            onClick={() => setIsViewFilterOpen(!isViewFilterOpen)}
            className="flex items-center gap-2 text-royal-600 hover:text-royal-800 dark:text-royal-400 dark:hover:text-royal-300 transition-colors mx-auto"
          >
            <span className="text-gray-600 dark:text-muted-foreground">View filter</span>
            <svg
              className={`w-4 h-4 transition-transform ${isViewFilterOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isViewFilterOpen && (
            <div className="flex flex-col gap-4 mt-3 items-center">
              <div className="flex gap-6 items-center justify-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showQuotes}
                    onChange={() => setShowQuotes((v) => !v)}
                    className="accent-royal-600"
                  />
                  <span>Enable double-quotes ("") in output</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={strictPunctuation}
                    onChange={() => setStrictPunctuation((v) => !v)}
                    className="accent-royal-600"
                  />
                  <span>Add punctuation (.) to all quotes without one.</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "default" | "page" | "location")}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-border bg-background dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-royal-500"
                >
                  <option value="default">Default</option>
                  <option value="page">Page Number</option>
                  <option value="location">Location</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Highlights List */}
        <div className="space-y-6 min-h-[60vh]">
          {filteredHighlights && filteredHighlights.length > 0 ? (
            (() => {
              let highlightCount = 0;
              let noteCount = 0;

              return filteredHighlights.map((hl: any, idx: number) => {
                const stagedOp = isHighlightStaged(hl._id);

                let label = "Highlight";
                if (hl.type === "note") {
                  noteCount += 1;
                  label = `Note ${noteCount}`;
                } else {
                  highlightCount += 1;
                  label = `Highlight ${highlightCount}`;
                }

                return (
                  <HighlightDisplay
                    key={hl._id || idx}
                    highlight={hl}
                    index={idx}
                    label={label}
                    stagedOp={stagedOp}
                    isDesktop={isDesktop}
                    showQuotes={showQuotes}
                    strictPunctuation={strictPunctuation}
                    makeUrlsClickable={makeUrlsClickable}
                    onEdit={handleEditIconClick}
                    onDelete={handleDeleteIconClick}
                    setHighlightRef={setHighlightRef}
                  />
                );
              });
            })()
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-muted-foreground text-lg">No highlights found.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                {search ? "Try adjusting your search or filters." : "This book has no highlights yet."}
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <EditHighlightModal
          isOpen={isEditModalOpen}
          highlight={editingHighlight}
          onSave={handleSaveOnEditComplete}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingHighlight(null);
          }}
        />
      </div>
    </div>
  );
}

// #todo
//  Modularise this code -  Move staging area and EditModalViewForm to separate components
//  Add RefreshManually button
//  Add Cache usage for highlights and books. First we fetch from cache, then only from API if needed