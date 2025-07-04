import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import GlobalSearchBar from "@/components/GlobalSearchBar";

export default function BookOnlineView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};
  const [search, setSearch] = useState("");

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

  if (!book) return <div className="text-center mt-10 text-red-500">No book data found.</div>;

  // Filter highlights by search keyword (case-insensitive)
  const filteredHighlights =
    book.highlights && search
      ? book.highlights.filter((hl: any) =>
          hl.highlight.toLowerCase().includes(search.toLowerCase())
        )
      : book.highlights;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
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
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-royal-400"
                >
                  {/* Counter for highlight/note */}
                  <div className="text-xs text-royal-600 font-semibold mb-1">
                    {label}
                  </div>
                  <div className="text-gray-800 text-base mb-2">"{hl.highlight}"</div>
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
          <div className="text-center text-gray-400">No highlights found for this book.</div>
        )}
      </div>
    </div>
  );
}