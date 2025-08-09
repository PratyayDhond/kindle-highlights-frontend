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

interface Book {
  _id: string;
  title: string;
  author: string;
  coverUrl?: string;
  highlights?: {
    highlight: string;
    page: number;
    location: string;
    timeStamp: string;
  }[];
}

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
  const navigate = useNavigate();
  const { toast: toastSonner } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use CoinsContext for coins state
  const { coins, setCoins } = useCoins();
  const { stats, setStats } = useStats();

  // Fetch stats from backend when books change or on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
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
    // console.log(stats);
    if(!stats)
      fetchStats();
  }, [setStats, books]); // Optionally, you can remove books if you want to fetch only on mount

  useEffect(() => {
    const fetchBooks = async () => {
      // Try to get books from localStorage cache first
      const cached = localStorage.getItem("dashboard_books");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setBooks(parsed);
        } catch {
        }
      }
      // This request is not that costly so we should allow it for all users.
      // The following backend request is to fetch only the books and author for users
      // Fetch from backend if not in cache
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/books`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch books");
        const data = await response.json();
        setBooks(data.books || []);
        localStorage.setItem("dashboard_books", JSON.stringify(data.books || []));
      } catch (err) {
        // Optionally handle error (show toast, etc.)
        setBooks([]);
      }
    };

    fetchBooks();
  }, []);

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
        .catch(() => {});
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

      if(!lastFile.name.endsWith(".txt")) {
        toastSonner({
          title: "Invalid File",
          description: "Please upload a .txt file.",
          variant: "destructive",
        });
        setLastFile(null);
        return;
      }
      if( lastFile.size > import.meta.env.VITE_MAX_FILE_SIZE_MB * 1024 * 1024) {
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

      if(response.status === 418){
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
          localStorage.setItem("dashboard_books", JSON.stringify(updatedData.books || []));
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
        if(response.status === 418){
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
      if(data.coins)
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
      navigate(`/book/${bookId}`, { state: { book: data.book } });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30 relative flex flex-col">
      {/* Coins dashboard at the top */}
      <div className="w-full flex justify-end items-center px-8 pt-6">
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
                ? "fixed left-0 top-0 h-full w-64 min-w-[16rem] border-r border-royal-100 z-30 bg-white/80 flex flex-col p-6 gap-8"
                : "w-full z-30 bg-white/80 flex flex-col p-6 gap-8 top-0 left-0"}
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
            ${isDesktop ? "ml-64 mr-16"  : ""}
          `}
        >
          <h1 className="text-3xl font-bold mb-8 text-center text-royal-700">Dashboard</h1>
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
                    className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow min-h-[320px] max-h-[380px] max-w-xs w-full"
                  >
                    <img
                      src={book.coverUrl || getRandomPlaceholder(book._id)}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded mb-3"
                    />
                    <h2 className="text-lg font-semibold text-center line-clamp-2">{book.title}</h2>
                    <p className="text-xs text-gray-500 mb-2">{book.author}</p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        className="px-3 py-1 rounded bg-royal-100 text-royal-700 hover:bg-royal-200 transition"
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
        </main>
      </div>
    </div>
  );
}


// #todo write backend apis for handling upload of kindle clippings file to be uploaded to user profile.