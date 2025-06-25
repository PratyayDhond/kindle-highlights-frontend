import React, { useEffect, useState } from "react";
import UploadClippingsSidebar from "@/components/UploadClippingsSidebar";
import { Menu } from "lucide-react";
import BookPdf from "../components/BookPdf";
import { pdf } from "@react-pdf/renderer";
import { useNavigate } from "react-router-dom";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import { toast } from "sonner";
import { profile } from "console";

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
  const [search, setSearch] = useState(""); // Add this line for search state
  const navigate = useNavigate();

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

  const handleUpload = async () => {
    console.log("Selected file:", lastFile);
    // if (file) setLastFile(file);
    const formData = new FormData();
    formData.append('file', lastFile);

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/upload-highlights-file`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    console.log("Upload response status:", response.status);
    if (!response.ok) {
      console.error("Upload failed:", response.statusText);
      const data = await response.json();
      toast.error(data.message || "Upload failed. Please try again.");
      return;
    }
    const data = await response.json();
    console.log("Upload response:", data);
    if (data.success) {
      // Optionally show success message
      toast.success("File uploaded successfully!");
      // Fetch updated books after upload
      const updatedResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/books`, {
        credentials: "include",
      });
      if (!updatedResponse.ok) throw new Error("Failed to fetch updated books");
      const updatedData = await updatedResponse.json();
      setBooks(updatedData.books || []);
      localStorage.setItem("dashboard_books", JSON.stringify(updatedData.books || []));
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
      console.log("Book PDF data:", data.book);
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
      // Optionally show a toast or alert
      alert("Failed to download PDF.");
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
      // Navigate to /book/:bookId and pass book data as state
      navigate(`/book/${bookId}`, { state: { book: data.book } });
    } catch (err) {
      alert("Failed to open book.");
    }
  };

  // Filter books by title or author (case-insensitive)
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

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
              onFileSubmit={handleUpload}
              setFile={setLastFile}
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
          {/* Add GlobalSearchBar here */}
          <GlobalSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search books by title or author..."
            className="max-w-md w-full mb-8"
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
                    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
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