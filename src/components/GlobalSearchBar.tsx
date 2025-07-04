import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface GlobalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement> | null; // Allow passing a custom ref if needed
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  inputRef = null, // Allow passing a custom ref if needed
}) => {
  inputRef = inputRef || useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+F or Cmd+F
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2 mb-6 border border-gray-200 ${className}`}>
      <Search className="w-4 h-4 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 outline-none bg-transparent text-gray-700"
      />
    </div>
  );
};

export default GlobalSearchBar;