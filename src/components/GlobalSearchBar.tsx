import React from "react";
import { Search } from "lucide-react";

interface GlobalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => (
  <div className={`flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2 mb-6 border border-gray-200 ${className}`}>
    <Search className="w-4 h-4 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 outline-none bg-transparent text-gray-700"
    />
  </div>
);

export default GlobalSearchBar;