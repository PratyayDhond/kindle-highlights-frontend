// Create src/components/HighlightDisplay.tsx
import React from 'react';
import { Pencil, X } from 'lucide-react';

interface HighlightDisplayProps {
  highlight: any;
  index: number;
  label: string;
  stagedOp: any;
  isDesktop: boolean;
  showQuotes: boolean;
  strictPunctuation: boolean;
  makeUrlsClickable: (text: string) => any;
  onEdit: (index: number, highlight: any) => void;
  onDelete: (index: number, highlight: any) => void;
  setHighlightRef: (index: number) => (el: HTMLDivElement | null) => void;
}

const HighlightDisplay: React.FC<HighlightDisplayProps> = ({
  highlight,
  index,
  label,
  stagedOp,
  isDesktop,
  showQuotes,
  strictPunctuation,
  makeUrlsClickable,
  onEdit,
  onDelete,
  setHighlightRef,
}) => {
  const formatHighlightText = () => {
    const punctuationMarks = ['.', '!', '?', ';', ':', '…'];
    const endsWithPunctuation = punctuationMarks.some(mark => highlight.highlight.endsWith(mark));
    
    let text = highlight.highlight;
    if (strictPunctuation && !endsWithPunctuation) {
      text = `${highlight.highlight}.`;
    }
    
    const finalText = text;
    
    // If contains URL, make links clickable
    if (highlight.containsUrl) {
      return <span>{makeUrlsClickable(finalText)}</span>;
    }
    
    return finalText;
  };

  const formatTimestamp = () => {
    if (!highlight.timestamp) return "N/A";
    
    const date = new Date(highlight.timestamp);
    if (isNaN(date.getTime())) return "N/A";
    
    const pad = (n: number) => n.toString().padStart(2, "0");
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  };

  return (
    <div
      key={highlight._id || index}
      ref={setHighlightRef(index)}
      className={`bg-white rounded-lg shadow p-4 border-l-4 relative ${
        stagedOp 
          ? stagedOp.type === 'edit' 
            ? 'border-blue-400 bg-blue-50/30' 
            : 'border-orange-400'
          : 'border-royal-400'
      }`}
    >
      {/* Staging indicator */}
      {stagedOp && (
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
          stagedOp.type === 'edit' 
            ? 'bg-blue-200 text-blue-800' 
            : 'bg-orange-200 text-orange-800'
        }`}>
          {stagedOp.type === 'edit' ? 'EDITED' : 'DELETED'}
        </div>
      )}
      
      {/* Header with counter and action buttons */}
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs text-royal-600 font-semibold">
          {label}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(index, highlight)}
            className="text-gray-500 hover:text-blue-600 transition-colors p-1"
            title="Edit highlight"
            aria-label="Edit highlight"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(index, highlight)}
            className="text-gray-500 hover:text-red-600 transition-colors p-1"
            title="Delete highlight"
            aria-label="Delete highlight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="text-gray-800 text-base mb-2">
        {formatHighlightText()}
      </div>
      
      <div className="text-xs text-gray-500 flex gap-4">
        {highlight.page && (
          <span>Page: {highlight.page}</span>
        )}
        <span>
          Location: {highlight.location.start} {highlight.location.end !== -1 ? `-${highlight.location.end}` : ''}
        </span>
        <span>
          Highlighted On: {formatTimestamp()}
        </span>
      </div>
    </div>
  );
};

export default HighlightDisplay;