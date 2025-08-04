import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import EditHighlightModal from "@/components/EditHighlightModal";

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

  // Refs for scroll management
  const highlightRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

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
  const filteredHighlights =
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

  // Handle delete highlight
  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this highlight?")) {
      // TODO: Implement delete API call
      console.log("Deleting highlight at index:", index);
    }
  };

  // Handle edit highlight
  const handleEdit = (index: number, highlight: any) => {
    setEditingHighlight({ ...highlight, index });
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = (updatedHighlight: any) => {
    if (editingHighlight && book.highlights) {
      // TODO: Implement API call to update highlight
      console.log("Saving edit:", updatedHighlight);
      
      // For now, update locally (replace with API call)
      book.highlights[editingHighlight.index] = {
        ...book.highlights[editingHighlight.index],
        ...updatedHighlight,
      };
      
      setIsEditModalOpen(false);
      setEditingHighlight(null);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingHighlight(null);
  };

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
    if (book && filteredHighlights && filteredHighlights.length > 0) {
      const savedPosition = getScrollPosition();
      
      if (savedPosition !== null && savedPosition < filteredHighlights.length) {
        // Scroll to saved position
        setTimeout(() => {
          const element = highlightRefs.current[savedPosition];
          if (element) {
            element.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
        }, 100); // Small delay to ensure DOM is ready
      } else {
        // Scroll to top if no saved position
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }, 100);
      }
    }
  }, [book, filteredHighlights]);

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
      }, 1000); // Save after 1 second of no scrolling

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
      {/* Go Back Icon */}
      <button
        className="mb-6 flex items-center text-royal-600 hover:text-royal-800 transition-colors"
        onClick={() => navigate("/dashboard")}
        aria-label="Go back to dashboard"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="font-medium">Back to Dashboard</span>
      </button>
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
      <div className="space-y-6 min-h-[60vh]">
        {filteredHighlights && filteredHighlights.length > 0 ? (
          (() => {
            let highlightCount = 0;
            let noteCount = 0;
            return filteredHighlights.map((hl: any, idx: number) => {
              // Assume hl.type is either "highlight" or "note"
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
                  key={idx}
                  ref={setHighlightRef(idx)}
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-royal-400"
                >
                  {/* Header with counter and action buttons */}
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs text-royal-600 font-semibold">
                      {label}
                    </div>
                    {/* TODO: Uncomment when backend functionality is implemented
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
                        onClick={() => handleDelete(idx)}
                        className="text-gray-500 hover:text-red-600 transition-colors p-1"
                        title="Delete highlight"
                        aria-label="Delete highlight"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    */}
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
        onCancel={handleCancelEdit}
      />
    </div>
  );
}