import React, { useState, useRef, useCallback } from "react";
import { Search, BookOpen, Quote } from "lucide-react";
import { QuoteSearchResult, QuoteSearchResponse } from "@/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface QuoteSearchProps {
  className?: string;
  onQuoteClick?: (quote: QuoteSearchResult) => void;
}

const LIMIT_OPTIONS = [5, 10, 20, 50] as const;

const QuoteSearch: React.FC<QuoteSearchProps> = ({ className = "", onQuoteClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState(""); // Track the query that was actually searched
  const [quotes, setQuotes] = useState<QuoteSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(total / limit);

  const fetchQuotes = useCallback(async (query: string, page: number, pageLimit: number) => {
    if (!query.trim()) {
      setQuotes([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setSubmittedQuery(query);

    try {
      const offset = (page - 1) * pageLimit;
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/highlights/search?q=${encodeURIComponent(query)}&limit=${pageLimit}&offset=${offset}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to search quotes");

      const data = await response.json();
      console.log("Backend response:", data);
      console.log("Pagination object:", data.pagination);
      
      // Handle different possible response structures from backend
      const quotesData = data.highlights || [];
      const totalCount = data.pagination?.total ?? data.total ?? data.totalCount ?? data.count ?? quotesData.length;
      
      console.log("Parsed values - quotesData length:", quotesData.length, "totalCount:", totalCount, "totalPages:", Math.ceil(totalCount / pageLimit));
      
      setQuotes(quotesData);
      setTotal(totalCount);
    } catch (err) {
      console.error("Quote search error:", err);
      setQuotes([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search submission (on Enter key or button click)
  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuotes(searchQuery, 1, limit);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Reset to page 1 when limit changes and re-fetch with current submitted query
  const handleLimitChange = (newLimit: string) => {
    const parsedLimit = parseInt(newLimit, 10);
    setLimit(parsedLimit);
    setCurrentPage(1);
    if (submittedQuery.trim()) {
      fetchQuotes(submittedQuery, 1, parsedLimit);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Fetch with the submitted query when page changes
      if (submittedQuery.trim()) {
        fetchQuotes(submittedQuery, page, limit);
      }
    }
  };

  // Generate pagination numbers with ellipsis logic
  const getPaginationNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first two pages
      pages.push(1, 2);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show current page and neighbors if they're not already included
      const middlePages = [currentPage - 1, currentPage, currentPage + 1].filter(
        (p) => p > 2 && p < totalPages - 1
      );
      middlePages.forEach((p) => {
        if (!pages.includes(p)) {
          pages.push(p);
        }
      });

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last two pages
      if (!pages.includes(totalPages - 1)) {
        pages.push(totalPages - 1);
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Highlight matching text in quote
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white dark:bg-card rounded-lg shadow px-3 py-2 mb-4 border border-gray-200 dark:border-border">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search quotes across all your books..."
          className="flex-1 outline-none bg-transparent text-gray-700 dark:text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Search quotes"
        >
          <Search className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''} text-gray-500 dark:text-muted-foreground hover:text-royal-600 dark:hover:text-royal-400`} />
        </button>
      </div>

      {/* Limit selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt.toString()}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
        {hasSearched && (
          <span className="text-sm text-muted-foreground">
            {total} {total === 1 ? "quote" : "quotes"} found
          </span>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-500"></div>
          </div>
        ) : !quotes || quotes.length === 0 ? (
          <div className="text-gray-400 text-lg text-center py-12">
            {hasSearched
              ? "No quotes found matching your search."
              : "Type a search query and press Enter or click the search icon to search your highlights..."}
          </div>
        ) : (
          <>
            {quotes.map((quote) => (
              <div
                key={quote._id}
                className="bg-card rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-100 dark:border-border"
                onClick={() => onQuoteClick?.(quote)}
              >
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-royal-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 dark:text-foreground mb-2 leading-relaxed">
                      {highlightMatch(quote.highlight, submittedQuery)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-medium truncate">{quote.bookTitle}</span>
                      <span className="text-gray-400">•</span>
                      <span className="truncate">{quote.bookAuthor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {getPaginationNumbers().map((page, index) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuoteSearch;
