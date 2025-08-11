import { Book, Highlight } from "@/interfaces";

const TIME_TILL_CACHE_EXPIRY = 1000 * 60 * 60 * 24 * 7; // 1 week in milliseconds

async function fetchHighlightsForIndividualBook(bookId: string){
    console.log("Fetching highlights for book:", bookId);
    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/book/${encodeURIComponent(bookId)}`,
        {
          credentials: "include",
          method: "GET",
        }
      );

    if (!response.ok) 
        throw new Error("Failed to fetch book data, please try again. If the error persists, please reachout to me at kindle-clippings@gmail.com");
    const data = await response.json();
    console.log("Data Fetched: ", data);
    if (!data || !data.book)   
        throw new Error("No book data found");
    if (!data.book.highlights || !Array.isArray(data.book.highlights))
        throw new Error("No highlights found for this book");

    data.book.highlights = sortBookHighlights(data.book.highlights);
    data.book.timeTillDataExpiry = new Date(Date.now() + TIME_TILL_CACHE_EXPIRY);

    return data.book as Book;
}

function sortBookHighlights(highlights: Highlight[]): Highlight[] {
    if (!highlights) return [];

    const sortedHighlights = [...highlights];
    // Sort highlights by location.start, then by type (note before highlight), then by timestamp
    sortedHighlights.sort((a, b) => {
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
    return sortedHighlights;
}

export default fetchHighlightsForIndividualBook;
