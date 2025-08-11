import { Book, BooksCached } from "@/interfaces";

const FUNCTION_FAILURE = false;
const FUNCTION_SUCCESS = true;

function fetchBooksFromLocalCache(userId: string, setBooks: (books: Book[]) => void) : boolean | string {
    if(!userId) 
        return FUNCTION_FAILURE;
    const DASHBOARD_BOOKS_CACHE_KEY = userId + "_dashboard_books";
    console.log("Fetching books from local cache with key:", DASHBOARD_BOOKS_CACHE_KEY);
    console.log(DASHBOARD_BOOKS_CACHE_KEY);
    const cached = localStorage.getItem(DASHBOARD_BOOKS_CACHE_KEY);
    let booksLength = 0
    if (cached) {
        try {
            const parsed = JSON.parse(cached) as BooksCached; 
            console.log("Cached books data:", parsed);
            if(!Array.isArray(parsed.books) || parsed.books.length === 0)
                return "Not a valid Books array in cache";
            if (parsed.expiry && new Date(parsed.expiry) < new Date()) 
                return "Cache Expired"; // Cache expired
            setBooks(parsed.books);
            booksLength = parsed.books.length;
        } catch (e) {
            setBooks([]);
        }
      }

    if (booksLength === 0)
        return FUNCTION_FAILURE;
    return FUNCTION_SUCCESS;
}


async function fetchBooksFromApi(userId: string, setBooks: (books: Book[]) => void): Promise<boolean> {
    if(!userId) 
        return FUNCTION_FAILURE;
    const DASHBOARD_BOOKS_CACHE_KEY = userId + "_dashboard_books";
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/books`, {
        credentials: "include",
    });
    
    if (!response.ok) throw new Error("Failed to fetch books");

    const data = await response.json();
    setBooks(data.books || []);
    if(data.books && Array.isArray(data.books)) {
        data.expiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // Set expiry to 1 week
        console.log(DASHBOARD_BOOKS_CACHE_KEY)
        localStorage.setItem(DASHBOARD_BOOKS_CACHE_KEY, JSON.stringify(data.books));
        return FUNCTION_SUCCESS;
    }
    return FUNCTION_FAILURE;
}

export { fetchBooksFromLocalCache, fetchBooksFromApi,FUNCTION_FAILURE, FUNCTION_SUCCESS };