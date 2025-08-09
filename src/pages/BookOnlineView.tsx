import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, X, Package, CheckCircle } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import EditHighlightModal from "@/components/EditHighlightModal";

interface Highlight {
  _id: string;
  highlight: string;
  type: "highlight" | "note";
  page?: number;
  location: { start: number; end: number };
  timestamp?: string;
  containsUrl?: boolean;
  knowledge_begin_date: string;
  knowledge_end_date?: string;
}

// Staging area types
interface StagedOperation {
  id: string;
  type: 'edit' | 'delete';
  highlightId: string;
  originalHighlight: Highlight;
  updatedHighlight?: Partial<Highlight>;
  timestamp: string;
}

export default function BookOnlineView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};
  const [search, setSearch] = useState("");
  const [showHighlights, setShowHighlights] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [showUrlsOnly, setShowUrlsOnly] = useState(true);
  const [showQuotes, setShowQuotes] = useState(true);
  const [isViewFilterOpen, setIsViewFilterOpen] = useState(false);
  const [strictPunctuation, setStrictPunctuation] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);

  // Staging area state
  const [stagingArea, setStagingArea] = useState<StagedOperation[]>([]);
  const [showStagingArea, setShowStagingArea] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  // Add a flag to track if initial scroll has happened
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  // Refs for scroll management
  const highlightRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Load staging area from localStorage on component mount
  useEffect(() => {
    if (book?._id) {
      const saved = localStorage.getItem(`staging_${book._id}`);
      if (saved) {
        try {
          setStagingArea(JSON.parse(saved));
        } catch {
          // Corrupted data, ignore
        }
      }
    }
  }, [book?._id]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save staging area to localStorage whenever it changes
  useEffect(() => {
    if (book?._id) {
      localStorage.setItem(`staging_${book._id}`, JSON.stringify(stagingArea));
    }
  }, [stagingArea, book?._id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+Backspace or Cmd+Shift+Backspace
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Backspace") {
        e.preventDefault();
        navigate("/dashboard");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Add URL detection useEffect
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

  if (!book) return <div className="text-center mt-10 text-red-500">No book data found.</div>;

  // Function to make URLs clickable
  const makeUrlsClickable = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g;
    const parts = text.split(urlRegex);
    console.log(parts)
    return parts.map((part, index) => {
      const testRegex = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g;
      if (testRegex.test(part)) {
        // Add https:// prefix if the URL starts with www.

        if(showQuotes && part.endsWith('"'))
          part = part.slice(0, -1); // Remove trailing quote for URL processing
        if(strictPunctuation && part.endsWith('.'))
          part = part.slice(0, -1); // Remove trailing period for URL processing

        console.log(part)
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
      if(index === 0 && showQuotes && !part.startsWith('"')) {
        part = `"${part}`; // Add opening quote if not present
      }
      if(index === parts.length - 1 ){
        if(strictPunctuation && !part.endsWith('.')) {
          part += '.'; // Add period if strict punctuation is enabled and not present
        }
        if(showQuotes && !part.endsWith('"'))
          part += '"'; // Add closing quote if not present
      }
      return part;
    });
  };

  // Filter highlights by search keyword (case-insensitive) and checkbox state
  var filteredHighlights =
    book.highlights
      ? book.highlights.filter((hl: any) => {
          // This checks and filters through the current active highlight
          const isActive = hl.knowledge_end_date === null
          const matchesSearch = search
            ? hl.highlight.toLowerCase().includes(search.toLowerCase())
            : true;
          const matchesType =
            (showHighlights && hl.type === "highlight") ||
            (showNotes && hl.type === "note") ||
            (showUrlsOnly && hl.containsUrl);
          return isActive && matchesSearch && matchesType;
        })
      : [];

  // Add operation to staging area
  const addToStagingArea = (operation: Omit<StagedOperation, 'id' | 'timestamp'>) => {
    const stagedOp: StagedOperation = {
      ...operation,
      id: `${operation.type}_${operation.highlightId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    setStagingArea(prev => {
      // Remove any existing operations for the same highlight
      const filtered = prev.filter(op => op.highlightId !== operation.highlightId);
      return [...filtered, stagedOp];
    });
  };

  // Remove operation from staging area
  const removeFromStagingArea = (operationId: string) => {
    setStagingArea(prev => prev.filter(op => op.id !== operationId));
  };

  // Clear staging area
  const clearStagingArea = () => {
    setStagingArea([]);
    if (book?._id) {
      localStorage.removeItem(`staging_${book._id}`);
    }
  };

  // Handle delete highlight - add to staging
  const handleDelete = (index: number, highlight: Highlight) => {
      addToStagingArea({
        type: 'delete',
        highlightId: highlight._id,
        originalHighlight: highlight,
      });
      console.log("Highlight staged for deletion:", highlight);
  };

  // Handle edit highlight
  const handleEdit = (index: number, highlight: Highlight) => {
    setEditingHighlight({ ...highlight, index });
    setIsEditModalOpen(true);
  };

  // Handle save edit - add to staging
  const handleSaveEdit = (updatedHighlight: any) => {
    if (editingHighlight) {
      addToStagingArea({
        type: 'edit',
        highlightId: editingHighlight._id,
        originalHighlight: editingHighlight,
        updatedHighlight: updatedHighlight,
      });
      
      setIsEditModalOpen(false);
      setEditingHighlight(null);
      console.log("Highlight staged for edit:", updatedHighlight);
    }
  };

  // Commit all staged operations
  const commitStagedOperations = async () => {
    if (stagingArea.length === 0) return;
    
    setIsCommitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/book/${book._id}/batch-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          operations: stagingArea,
        }),
      });

      if (!response.ok) throw new Error('Failed to commit changes');

      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      // Update local cached data based on successful operations
      if (responseData.results && responseData.results.successful && responseData.results.successful.length > 0) {
        console.log('Going inside updateLocalBookData')
        updateLocalBookData(responseData.results.successful);
      }
      
      // Handle failed operations
      if (responseData.results && responseData.results.failed && responseData.results.failed.length > 0) {
        handleFailedOperations(responseData.results.failed);
      }
      
      // Clear staging area on success (or partial success)
      clearStagingArea();
      
      // Show success/partial success message
      if (responseData.results.successCount === responseData.totalOperations) {
        console.log(`Successfully committed all ${responseData.results.successCount} operations`);
        // toast.success(`Successfully updated ${responseData.results.successCount} highlights`);
      } else {
        console.log(`Committed ${responseData.results.successCount}/${responseData.results.totalOperations} operations`);
        // toast.warning(`Updated ${responseData.results.successCount} of ${responseData.totalOperations} highlights`);
      }
      
    } catch (error) {
      console.error('Failed to commit staged operations:', error);
      // toast.error('Failed to commit changes. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  };

  // Function to update local book data based on successful operations
  const updateLocalBookData = (successfulOperations: any[]) => {
    if (!book || !book.highlights) return;
    console.log("successfulOperations:", successfulOperations);
    successfulOperations.forEach((successOp) => {
      const { operationId, highlightId, type } = successOp;
      
      // Find the corresponding staged operation
      const stagedOp = stagingArea.find(op => op.id === operationId);
      if (!stagedOp) return;
      
      // Find the highlight in the local book data
      const highlightIndex = book.highlights.findIndex(hl => hl._id === highlightId);
      if (highlightIndex === -1) return;
      
      if (type === 'edit' && stagedOp.updatedHighlight) {
        // Update the highlight with the new data
        book.highlights[highlightIndex] = {
          ...book.highlights[highlightIndex],
          ...stagedOp.updatedHighlight,
        };
        
        console.log(`Updated highlight ${highlightId} locally`);
        
      } else if (type === 'delete') {
        // For soft delete, update the knowledge_end_date
        book.highlights[highlightIndex] = {
          ...book.highlights[highlightIndex],
          knowledge_end_date: new Date().toISOString(),
        };
        
        console.log(`Soft deleted highlight ${highlightId} locally`);
      }
    });
    console.log("Calling updateBookCache")
    // Update the book cache in localStorage if you're using it
    updateBookCache(book);
    
    // Force re-render by updating a state that triggers filteredHighlights recalculation
    // You might need to add a refresh trigger state
    // setHasInitialScrolled(false); // This will trigger useEffect to re-calculate filtered highlights
  };

  // Function to handle failed operations
  const handleFailedOperations = (failedOperations: any[]) => {
    failedOperations.forEach((failedOp) => {
      console.error(`Operation ${failedOp.operationId} failed:`, failedOp.message);
    });
    

    // #todo
    // Add a toast error message for each failed operation giving the reason why it failed
    // Optionally, you could keep failed operations in staging area
    // or show detailed error messages to the user
  };

  // Function to update book cache in localStorage
  const updateBookCache = (updatedBook: any) => {
    try {
      // Update individual book cache
      const bookCacheKey = `book_${updatedBook._id}`;
      localStorage.setItem(bookCacheKey, JSON.stringify(updatedBook));
    } catch (error) {
      console.error('Failed to update book cache:', error);
    }
  };

  // Check if a highlight is staged for deletion
  const isHighlightStaged = (highlightId: string): StagedOperation | null => {
    return stagingArea.find(op => op.highlightId === highlightId) || null;
  };

  // Get the effective highlight data (with staged edits applied)
  const getEffectiveHighlight = (highlight: Highlight): Highlight => {
    const stagedOp = stagingArea.find(op => 
      op.highlightId === highlight._id && op.type === 'edit'
    );
    
    if (stagedOp?.updatedHighlight) {
      return { ...highlight, ...stagedOp.updatedHighlight };
    }
    
    return highlight;
  };

  // Filter highlights (exclude staged deletions)
  var filteredHighlights = book.highlights
    ? book.highlights
        .filter((hl: any) => {
          // Exclude highlights staged for deletion
          const stagedOp = isHighlightStaged(hl._id);
          if (stagedOp?.type === 'delete') return false;
          
          // Apply existing filters
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
        .map((hl: any) => getEffectiveHighlight(hl)) // Apply staged edits
    : [];

  // Cache management functions
  const getScrollCacheKey = (bookTitle: string) => {
    return `book_scroll_position_${bookTitle.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  const saveScrollPosition = (highlightIndex: number) => {
    if (book?.title) {
      const cacheKey = getScrollCacheKey(book.title); 
      localStorage.setItem(cacheKey, highlightIndex.toString());
    }
  };

  const getScrollPosition = (): number | null => {
    if (book?.title) {
      const cacheKey = getScrollCacheKey(book.title);
      const saved = localStorage.getItem(cacheKey);
      return saved ? parseInt(saved) : null;
    }
    return null;
  };

  // Scroll to saved position when component mounts and data is ready
  useEffect(() => {
    if (book && filteredHighlights && filteredHighlights.length > 0 && !hasInitialScrolled) {
      const savedPosition = getScrollPosition();
      
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
  }, [book, filteredHighlights, hasInitialScrolled]);

  // Track scroll position and save to cache
  useEffect(() => {
    const handleScroll = () => {
      if (!filteredHighlights || filteredHighlights.length === 0) return;

      // Find the highlight that's currently most visible
      let visibleHighlight = 0;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;

      for (let i = 0; i < filteredHighlights.length; i++) {
        const element = highlightRefs.current[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;
          
          // If element is in viewport or passed it
          if (elementTop <= scrollTop + windowHeight / 2) {
            visibleHighlight = i;
          } else {
            break;
          }
        }
      }

      // Debounce saving to avoid excessive localStorage writes
      const timeoutId = setTimeout(() => {
        saveScrollPosition(visibleHighlight);
      }, 1000);

      return () => clearTimeout(timeoutId);
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [filteredHighlights]);

  // Set ref for each highlight
  const setHighlightRef = (index: number) => (el: HTMLDivElement | null) => {
    highlightRefs.current[index] = el;
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4" ref={containerRef}>
      {/* Header with Back button and Staging area toggle */}
      <div className="flex justify-between items-center mb-6">
        <button
          className="flex items-center text-royal-600 hover:text-royal-800 transition-colors"
          onClick={() => navigate("/dashboard")}
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        
        {/* Staging area button */}
        <button
          onClick={() => setShowStagingArea(!showStagingArea)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            stagingArea.length > 0 
              ? 'border-orange-300 bg-orange-50 text-orange-700' 
              : 'border-gray-300 text-gray-600'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Staging ({stagingArea.length})</span>
        </button>
      </div>

      {/* Staging Area Panel */}
      {showStagingArea && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Staging Area</h3>
            <div className="flex gap-2">
              <button
                onClick={clearStagingArea}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                disabled={stagingArea.length === 0}
              >
                Clear All
              </button>
              <button
                onClick={commitStagedOperations}
                disabled={stagingArea.length === 0 || isCommitting}
                className="px-3 py-1 text-sm bg-royal-600 text-white rounded hover:bg-royal-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isCommitting ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Committing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Commit All Changes ({stagingArea.length})
                  </>
                )}
              </button>
            </div>
          </div>
          
          {stagingArea.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending changes</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {stagingArea.map((op) => (
                <div
                  key={op.id}
                  className={`p-3 rounded border-l-4 ${
                    op.type === 'delete' 
                      ? 'border-red-400 bg-red-50' 
                      : 'border-blue-400 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          op.type === 'delete' 
                            ? 'bg-red-200 text-red-800' 
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {op.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(op.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {op.type === 'edit' 
                          ? op.updatedHighlight?.highlight || op.originalHighlight.highlight
                          : op.originalHighlight.highlight
                        }
                      </p>
                      {op.type === 'edit' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Original: {isDesktop ? op.originalHighlight.highlight.substring(0,255) + (op.originalHighlight.highlight.length > 255 ? '...' : '') : op.originalHighlight.highlight.substring(0, 50) + '...'}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromStagingArea(op.id)}
                      className="text-gray-400 hover:text-red-600 ml-2"
                      title="Remove from staging"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rest of existing JSX with book title, search, filters, etc. */}
      <h1 className="text-3xl font-bold text-royal-700 mb-2 text-center">{book.title}</h1>
      <h2 className="text-lg text-gray-600 mb-8 text-center">by {book.author}</h2>
      <GlobalSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search highlights..."
      />
      {/* Checkboxes for filtering */}
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
      {/* View filter checkboxes */}
      <div className="mb-6 justify-center">
        <button
          onClick={() => setIsViewFilterOpen(!isViewFilterOpen)}
          className="flex items-center gap-2 text-royal-600 hover:text-royal-800 transition-colors mx-auto"
        >
          <span className="text-gray-600">View filter</span>
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
          <div className="flex gap-6 items-center mt-3 justify-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showQuotes}
                onChange={() => setShowQuotes((v) => !v)}
                className="accent-royal-600"
              />
              <span>Enable double-quotes ("") in output</span>
            </label>
            <br />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={strictPunctuation}
                onChange={() => setStrictPunctuation((v) => !v)}
                className="accent-royal-600"
              />
              <span>Add punctuation (.) to all quotes without one. </span>
            </label>
          </div>
        )}
      </div>
      {/* Highlights list with staging indicators */}
      <div className="space-y-6 min-h-[60vh]">
        {filteredHighlights && filteredHighlights.length > 0 ? (
          (() => {
            let highlightCount = 0;
            let noteCount = 0;
            return filteredHighlights.map((hl: any, idx: number) => {
              const stagedOp = isHighlightStaged(hl._id);
              
              // Counter logic
              let label = "Highlight";
              if (hl.type === "note") {
                noteCount += 1;
                label = `Note ${noteCount}`;
              } else {
                highlightCount += 1;
                label = `Highlight ${highlightCount}`;
              }
              
              return (
                <div
                  key={hl._id || idx}
                  ref={setHighlightRef(idx)}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 relative ${
                    stagedOp 
                      ? stagedOp.type === 'edit' 
                        ? 'border-blue-400 bg-blue-50/30' 
                        : 'border-orange-400'
                      : 'border-royal-400'
                  }`}
                >
                  {/* Staging indicator */}
                  {stagedOp && (
                    <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                      stagedOp.type === 'edit' 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-orange-200 text-orange-800'
                    }`}>
                      {stagedOp.type === 'edit' ? 'EDITED' : 'DELETED'}
                    </div>
                  )}
                  
                  {/* Header with counter and action buttons */}
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs text-royal-600 font-semibold">
                      {label}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(idx, hl)}
                        className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                        title="Edit highlight"
                        aria-label="Edit highlight"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(idx, hl)}
                        className="text-gray-500 hover:text-red-600 transition-colors p-1"
                        title="Delete highlight"
                        aria-label="Delete highlight"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-800 text-base mb-2">
                    { 
                      (() => {
                        const punctuationMarks = ['.', '!', '?', ';', ':', '…'];
                        const endsWithPunctuation = punctuationMarks.some(mark => hl.highlight.endsWith(mark));
                        
                        let text = hl.highlight;
                        if (strictPunctuation && !endsWithPunctuation) {
                          text = `${hl.highlight}.`;
                        }
                        
                        const finalText = text;
                        
                        // If contains URL, make links clickable
                        if (hl.containsUrl) {
                          return <span>{makeUrlsClickable(finalText)}</span>;
                        }
                        
                        return finalText;
                      })()
                    }
                  </div>
                  <div className="text-xs text-gray-500 flex gap-4">
                    {hl.page && (
                      <span>Page: {hl.page} </span>
                    )}
                    <span>
                      Location: {hl.location.start} {hl.location.end !== -1 ? `-${hl.location.end}` : ''}
                    </span>
                    <span>
                      Highlighted On: {hl.timestamp
                        ? (() => {
                            const date = new Date(hl.timestamp);
                            if (isNaN(date.getTime())) return "N/A";
                            const pad = (n: number) => n.toString().padStart(2, "0");
                            const hours = pad(date.getHours());
                            const minutes = pad(date.getMinutes());
                            const seconds = pad(date.getSeconds());
                            const day = pad(date.getDate());
                            const month = pad(date.getMonth() + 1);
                            const year = date.getFullYear();
                            return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
                          })()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              );
            });
          })()
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No highlights found.</p>
            <p className="text-gray-400 text-sm mt-2">
              {search ? "Try adjusting your search or filters." : "This book has no highlights yet."}
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditHighlightModal
        isOpen={isEditModalOpen}
        highlight={editingHighlight}
        onSave={handleSaveEdit}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingHighlight(null);
        }}
      />
    </div>
  );
}