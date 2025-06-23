import React, { useEffect, useState } from "react";
import UploadClippingsSidebar from "@/components/UploadClippingsSidebar";
import { Menu } from "lucide-react";

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

const mockStats = {
  totalBooks: 5,
  totalHighlights: 42,
  avgHighlights: 8.4,
  medianHighlights: 7,
  maxHighlights: 15,
};

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

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);

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

  const handleUpload = (file: File | null) => {
    if (file) setLastFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30 relative flex flex-col">
      {/* Header placeholder */}
      {/* <div className="h-16 w-full" /> */}

      {/* Sidebar Toggle Button (below header, only when sidebar is closed on mobile) */}
      {!sidebarOpen && !isDesktop && (
        <button
          className="absolute top-20 left-4 z-40 bg-transparent border-none p-2 hover:bg-gray-100 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6 text-royal-700 hover:text-royal-900 transition-colors" />
        </button>
      )}

      <div className={`flex flex-1 w-full ${!isDesktop ? "flex-col" : ""} ${isDesktop ? "min-h-[calc(100vh-4rem)]" : ""}`}>
        {/* Sidebar: 
            - On desktop: always left
            - On mobile: top when open, not rendered when closed */}
        {((sidebarOpen && !isDesktop) || isDesktop) && (
          <aside
            className={`
              ${isDesktop ? "relative md:static h-full w-64 min-w-[16rem] border-r border-royal-100" : "w-full"}
              z-30 bg-white/80 flex flex-col p-6 gap-8
              transition-transform duration-300
            `}
          >
            <UploadClippingsSidebar
              lastFile={lastFile}
              onFileSelect={handleUpload}
              isUploading={false}
              stats={mockStats}
              showCloseButton={!isDesktop && sidebarOpen}
              onCloseSidebar={() => setSidebarOpen(false)}
              isDesktop={isDesktop}
            />
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto py-10 px-4 flex flex-col items-center justify-center transition-all duration-300">
          <h1 className="text-3xl font-bold mb-8 text-center text-royal-700">Dashboard</h1>
          <div className="w-full flex justify-center">
            <div
              className={
                // On mobile: 2 columns if sidebar is closed, 1 column if open. On desktop: always 2/3/4 columns.
                !isDesktop && !sidebarOpen
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              }
            >
              {books.map((book) => (
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
                      onClick={() => alert(`Open ${book.title} online`)}
                    >
                      Open
                    </button>
                    <a
                      download
                      className="px-3 py-1 rounded bg-royal-500 text-white hover:bg-royal-600 transition"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}