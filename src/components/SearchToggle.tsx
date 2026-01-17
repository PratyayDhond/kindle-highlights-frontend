import React from "react";

type SearchMode = "book" | "quote";

interface SearchToggleProps {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  className?: string;
}

const SearchToggle: React.FC<SearchToggleProps> = ({
  mode,
  onModeChange,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onModeChange("book")}
        className={`text-lg font-semibold transition-colors ${
          mode === "book"
            ? "text-royal-700 dark:text-royal-400"
            : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        }`}
      >
        Book Search
      </button>
      <span className="text-gray-300 dark:text-gray-600 text-lg">|</span>
      <button
        onClick={() => onModeChange("quote")}
        className={`text-lg font-semibold transition-colors ${
          mode === "quote"
            ? "text-royal-700 dark:text-royal-400"
            : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        }`}
      >
        Quote Search
      </button>
    </div>
  );
};

export default SearchToggle;
export type { SearchMode };
