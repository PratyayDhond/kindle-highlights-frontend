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

interface StagedOperation {
    id: string;
    type: 'edit' | 'delete';
    highlightId: string;
    originalHighlight: Highlight;
    updatedHighlight?: Partial<Highlight>;
    timestamp: string;
}

interface Book {
    _id: string;
    title: string;
    author: string;
    coverUrl?: string;
    highlights: Highlight[];
}

interface BooksCached {
    books: Book[];
    expiry: Date;
}

export type { Highlight, StagedOperation, Book, BooksCached };