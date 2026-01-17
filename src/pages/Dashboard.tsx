import React, { useEffect, useRef, useState } from "react";
import UploadClippingsSidebar from "@/components/UploadClippingsSidebar";
import { Backpack, Menu } from "lucide-react";
import BookPdf from "../components/BookPdf";
import { pdf } from "@react-pdf/renderer";
import { useNavigate } from "react-router-dom";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import { toast } from "sonner";
import CoinsDashboard from "@/components/CoinsDashboard"; // <-- Import your CoinsDashboard component
import { useCoins } from "@/context/CoinsContext"; // <-- Import your CoinsContext
import { useStats } from "@/context/StatsContext";
import { useToast } from '@/hooks/use-toast';
import RefreshButton from "@/components/RefreshButton";
import { useUser } from "@/context/UserContext";
import { Book, QuoteSearchResult } from "@/interfaces";
import SearchToggle, { SearchMode } from "@/components/SearchToggle";
import QuoteSearch from "@/components/QuoteSearch";

const dashboard_cache_configurations = [
  {
    cacheKey: 'dashboard_books',
    apiUrl: `${import.meta.env.VITE_BACKEND_URL}/user/books`,
    dataPath: 'books'
  },
  {
    cacheKey: 'dashboard_stats',
    apiUrl: `${import.meta.env.VITE_BACKEND_URL}/user/stats`,
    dataPath: 'stats'
  }
]

// Add this helper function at the top (outside the component)
function getRandomPlaceholder(bookId: string, total = 4) {
  // Deterministic: always same placeholder for same book
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash = (hash * 31 + bookId.charCodeAt(i)) % total;
  }
  // Placeholders should be named: book-cover-placeholders/cover1.png, cover2.png, ..., cover20.png
  return `/book-cover-placeholders/${hash + 1}.png`;
}

// Add this helper function at the top of your file
async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false); // <-- Add this state
  const [searchMode, setSearchMode] = useState<SearchMode>("book");
  const navigate = useNavigate();
  const { toast: toastSonner } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser(); // <-- get user from context

  // Use CoinsContext for coins state
  const { coins, setCoins } = useCoins();
  const { stats, setStats } = useStats();

  // Fetch stats from backend when books change or on mount
  useEffect(() => {
    const fetchStats = async () => {

      if (!user || !user.id) {
        return;
      }

      // Read from local storage first
      const cachedStats = localStorage.getItem(user.id + "_stats");
      if (cachedStats) {
        console.log("Fetched `stats` from cache");
        setStats(JSON.parse(cachedStats));
        return;
      }

      try {
        // This API call is to be made if user is new or the cache is empty.
        console.log("Making API Call to stats api")
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/stats`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data.stats || {
          totalBooks: 0,
          totalHighlights: 0,
          avgHighlights: 0,
          maxHighlights: 0,
          updatedAt: new Date(),
        });

        const userStatsCacheKey = user.id + "_stats";
        localStorage.setItem(userStatsCacheKey, JSON.stringify(data.stats));
      } catch (err) {
        setStats({
          totalBooks: 0,
          totalHighlights: 0,
          avgHighlights: 0,
          maxHighlights: 0,
          updatedAt: new Date(),
        });
      }
    };

    fetchStats();
  }, [user]); // Initially the user seems to be null as it is being set through authentication flow at UserContext.

  useEffect(() => {
    const fetchBooks = async () => {

      if (!user || !user.id) {
        return;
      }
      // Try to get books from localStorage cache first
      const dashboardBooksCacheKey = user.id + "_dashboard_books";
      const cached = localStorage.getItem(dashboardBooksCacheKey);
      let booksLength = 0
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setBooks(parsed);
          booksLength = parsed.length;
          console.log("Fetched `books` from cache");
        } catch (e) {
          console.log("Failed to parse cached books", e);
          setBooks([]);
        }
      }

      if (booksLength > 0) return; // Avoid fetching if we already have books

      // Fetch from backend if not in cache
      try {
        console.log("Fetching books from API endpoint - Failed to fetch from cache");
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/books`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch books");
        const data = await response.json();
        setBooks(data.books || []);
        if (data.books && Array.isArray(data.books)) {
          localStorage.setItem(dashboardBooksCacheKey, JSON.stringify(data.books));
        }
      } catch (err) {
        // Optionally handle error (show toast, etc.)
        setBooks([]);
      }
    };

    fetchBooks();
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (coins === undefined) {
      // Only fetch if coins is undefined
      fetch(`${import.meta.env.VITE_BACKEND_URL}/coins`, {
        credentials: "include",
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (typeof data.coins === "number") setCoins(data.coins);
        })
        .catch(() => { });
    }
  }, [coins, setCoins]);

  const handleUpload = async () => {
    if (!lastFile) return;
    setIsUploading(true);

    try {
      // Calculate hash of the file
      const fileHash = await calculateFileHash(lastFile);

      // Get all previously submitted hashes from localStorage (as an array)
      const hashesRaw = localStorage.getItem("submitted_file_hashes");
      let submittedHashes: string[] = [];
      if (hashesRaw) {
        try {
          submittedHashes = JSON.parse(hashesRaw);
        } catch {
          submittedHashes = [];
        }
      }

      // Check if the hash matches any previously submitted hash
      if (submittedHashes.includes(fileHash)) {
        toastSonner({
          title: "Duplicate File",
          description: "You submitted this file recently.",
          variant: "destructive",
        });
        setIsUploading(false);
        setLastFile(null);
        return;
      }

      if (!lastFile.name.endsWith(".txt")) {
        toastSonner({
          title: "Invalid File",
          description: "Please upload a .txt file.",
          variant: "destructive",
        });
        setLastFile(null);
        return;
      }
      if (lastFile.size > import.meta.env.VITE_MAX_FILE_SIZE_MB * 1024 * 1024) {
        toastSonner({
          title: "File Too Large",
          description: `Please upload a file smaller than ${import.meta.env.VITE_MAX_FILE_SIZE_MB} MB.`,
          variant: "destructive",
        });
        setLastFile(null);
        return;
      }

      const formData = new FormData();
      formData.append('file', lastFile);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/upload-highlights-file`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      // console.log("Upload response status:", response.status);

      const updatedHashes = [...submittedHashes, fileHash];
      localStorage.setItem("submitted_file_hashes", JSON.stringify(updatedHashes));

      if (response.status === 402) {
        const data = await response.json();
        toastSonner({
          title: "Not enough coins",
          description: data.message || "You do not have enough coins to process these books.",
          variant: "destructive",
        });
        return;
      }

      if (response.status === 418) {
        const data = await response.json();
        toastSonner({
          title: "Processing Error",
          description: data.message || "There was an error processing your file. Please try again.",
          variant: "destructive",
        });
        setLastFile(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Add the new hash to the array and update localStorage
          setCoins(data.coins)
          setStats(data.stats)
          toast.success("File uploaded successfully!");
          setLastFile(null);
          const updatedResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/books`, {
            credentials: "include",
          });
          if (!updatedResponse.ok) throw new Error("Failed to fetch updated books");
          const updatedData = await updatedResponse.json();
          setBooks(updatedData.books || []);
          localStorage.setItem(user.id + "_dashboard_books", JSON.stringify(updatedData.books || []));
        }
      } else {
        // ...existing error handling...
        if (response.status === 402) {
          const data = await response.json();
          toastSonner({
            title: "Not enough coins",
            description: data.message || "You do not have enough coins to process these books.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 418) {
          const data = await response.json();
          toastSonner({
            title: "Processing Error",
            description: data.message || "There was an error processing your file. Please try again.",
            variant: "destructive",
          });
          setLastFile(null);
          return;
        }
        console.error("Upload failed:", response.statusText);
        const data = await response.json();
        toast.error(data.message || "Upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
    } finally {
      setIsUploading(false); // Re-enable the button
    }
  };

  // Add this function inside your Dashboard component
  const downloadPdf = async (bookId: string, title: string) => {
    try {
      // Make a GET request with bookId as a URL param
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/book/${encodeURIComponent(bookId)}`,
        {
          credentials: "include",
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch book PDF");
      const data = await response.json();
      // console.log(data)
      // console.log("Book PDF data:", data.book);
      if (data.coins)
        setCoins(data.coins);
      const blob = await pdf(
        <BookPdf
          title={data.book.title}
          author={data.book.author}
          content={data.book.highlights}
        />
      ).toBlob();
      // If you want to trigger a download  in the browser:
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `book-${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Or, if your backend returns a redirect or a direct PDF URL, you can use:
      // window.open(`${import.meta.env.VITE_BACKEND_URL}/user/book/${encodeURIComponent(bookId)}`, "_blank");
    } catch (err) {
      toast.error("Failed to download PDF.");
      console.error("Download error:", err);
    }
  };

  const handleOpenBook = async (bookId: string) => {
    try {
      // Option 1: Fetch book data and pass via state (recommended for sensitive/private data)
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/book/${encodeURIComponent(bookId)}`,
        {
          credentials: "include",
          method: "GET",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch book data");
      const data = await response.json();

      data.book.highlights.sort((a, b) => {

        if (a.location.start !== b.location.start) {
          return a.location.start - b.location.start;
        }
        // Keep notes before highlights if at the same location
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        // If still equal, sort by timestamp
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });


      // Navigate to /book/:bookId and pass book data as state
      navigate(`/book/${bookId}`, { state: { book: data.book as Book } });
    } catch (err) {
      toast.error("Failed to open book.");
    }
  };

  // Handle clicking a quote in QuoteSearch - navigate to the book
  const handleQuoteClick = async (quote: QuoteSearchResult) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/book/${encodeURIComponent(quote.bookId)}`,
        {
          credentials: "include",
          method: "GET",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch book data");
      const data = await response.json();

      data.book.highlights.sort((a: any, b: any) => {
        if (a.location.start !== b.location.start) {
          return a.location.start - b.location.start;
        }
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

      // Navigate to /book/:bookId and pass book data as state
      navigate(`/book/${quote.bookId}`, { state: { book: data.book as Book } });
    } catch (err) {
      toast.error("Failed to open book.");
    }
  };

  // Filter books by title or author (case-insensitive)
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if search is focused or not empty
      if (filteredBooks.length === 1) {
        // Enter key: open book
        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          handleOpenBook(filteredBooks[0]._id);
        }
        // Shift+D: download PDF
        if ((e.key === "d" || e.key === "D") && e.shiftKey) {
          e.preventDefault();
          downloadPdf(filteredBooks[0]._id, filteredBooks[0].title);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredBooks]); // Re-run if filteredBooks changes

  useEffect(() => {
    // Focus the search bar on desktop only (not Android)
    const isAndroid = /Android/i.test(navigator.userAgent);
    console.log(isAndroid)
    if (isDesktop && !isAndroid && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDesktop]);

  // Refresh completion handler for Dashboard
  const handleDashboardRefreshComplete = async (results: any[]) => {
    // Re-fetch books and stats to update UI
    // console.log("Results from refresh:", results);
    const booksResult = results.find((r, i) => user.id + "_dashboard_books" === 'dashboard_books');
    const statsResult = results.find((r, i) => user.id + "_stats" === 'dashboard_stats');

    if (booksResult?.success && booksResult.data) {
      setBooks(booksResult.data);
    }


  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-royal-100/30 to-royal-200/30 dark:from-background dark:via-royal-900/10 dark:to-royal-900/10 relative flex flex-col">
      {/* Header with Refresh button and Coins dashboard */}
      <div className="w-full flex justify-end items-center px-8 pt-6">
        <div className="flex items-center gap-4">
          <RefreshButton
            configs={dashboard_cache_configurations}
            parentComponentName="Dashboard"
            onRefreshComplete={handleDashboardRefreshComplete}
            size="md"
            position="left"
            showLabel={true}
            className="mr-4"
          />
        </div>

        <CoinsDashboard coins={typeof coins === "number" && !isNaN(coins) ? coins : 0} />
      </div>

      {/* Sidebar Toggle Button (mobile only) */}
      {!sidebarOpen && !isDesktop && (
        <button
          className="absolute top-20 left-4 z-40 bg-transparent border-none p-2 hover:bg-gray-100 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6 text-royal-700 hover:text-royal-900 transition-colors" />
        </button>
      )}

      <div className="flex flex-1 w-full flex-col md:flex-row">
        {/* Sidebar: fixed on desktop, full width on mobile */}
        {((sidebarOpen && !isDesktop) || isDesktop) && (
          <aside
            className={`
              ${isDesktop
                ? "fixed left-0 top-0 h-full w-64 min-w-[16rem] border-r border-royal-100 dark:border-royal-800 z-30 bg-background/80 dark:bg-card/80 flex flex-col p-6 gap-8"
                : "w-full z-30 bg-background/80 dark:bg-card/80 flex flex-col p-6 gap-8 top-0 left-0"}
              transition-transform duration-300
            `}
            style={
              isDesktop
                ? { boxShadow: "2px 0 8px 0 rgba(0,0,0,0.03)", marginTop: "4.5rem" }
                : { position: "relative", width: "100%", border: "1px solid #e5e7eb" }
            }
          >
            <UploadClippingsSidebar
              lastFile={lastFile}
              onFileSubmit={handleUpload}
              setFile={setLastFile}
              isUploading={isUploading}
              stats={stats}
              showCloseButton={!isDesktop && sidebarOpen}
              onCloseSidebar={() => setSidebarOpen(false)}
              isDesktop={isDesktop}
            />
          </aside>
        )}

        {/* Main content: add left margin on desktop to make space for fixed sidebar */}
        <main
          className={`flex-1 mx-auto py-10 px-4 flex flex-col items-center justify-center transition-all duration-300
            ${isDesktop ? "ml-64 mr-16" : ""}
          `}
        >
          <h1 className="text-3xl font-bold mb-4 text-center text-royal-700 dark:text-royal-400">Dashboard</h1>
          <SearchToggle
            mode={searchMode}
            onModeChange={setSearchMode}
            className="mb-6"
          />
          
          {searchMode === "book" ? (
            <>
              <GlobalSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search books by title or author..."
                className="max-w-md w-full mb-8"
                inputRef={searchInputRef} // Pass the ref to the search bar
              />
              <div className="w-full flex justify-center">
            {filteredBooks.length === 0 ? (
              <div className="text-gray-400 text-lg text-center py-20">
                Your kindle highlights will appear here after uploading 'My Clippings.txt' file.
              </div>
            ) : (
              <div
                className={
                  !isDesktop && !sidebarOpen
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl justify-items-center"
                }
              >
                {filteredBooks.map((book) => (
                  <div
                    key={book._id}
                    className="bg-card rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow min-h-[320px] max-h-[380px] max-w-xs w-full"
                  >
                    <img
                      src={book.coverUrl || getRandomPlaceholder(book._id)}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded mb-3"
                    />
                    <h2 className="text-lg font-semibold text-center line-clamp-2">{book.title}</h2>
                    <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        className="px-3 py-1 rounded bg-royal-100 text-royal-700 hover:bg-royal-200 dark:bg-royal-900/50 dark:text-royal-300 dark:hover:bg-royal-900 transition"
                        onClick={() => handleOpenBook(book._id)}
                      >
                        Open
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-royal-500 text-white hover:bg-royal-600 transition"
                        onClick={() => downloadPdf(book._id, book.title)}
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </div>
            </>
          ) : (
            <QuoteSearch
              className="max-w-4xl w-full"
              onQuoteClick={handleQuoteClick}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// #todo Use cache
//  - only with bookId works fine as books are unique to user (for Dashboard)
//  - userId_stats -> since stats might be different for users ( or we just let users do it manually.)
