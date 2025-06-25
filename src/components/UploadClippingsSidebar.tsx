import React from "react";
import { UploadCloud, X } from "lucide-react";
import { lightFormatters } from "date-fns";
import { toast } from "sonner";

interface UploadClippingsSidebarProps {
  lastFile: File | null;
  onFileSubmit: () => void;
  setFile: (file: File | null) => void;
  isUploading?: boolean;
  stats: {
    totalBooks: number;
    totalHighlights: number;
    avgHighlights: number;
    medianHighlights: number;
    maxHighlights: number;
  };
  onCloseSidebar?: () => void;
  showCloseButton?: boolean;
  isDesktop?: boolean;
}

// rename this component to DashboardSidebar or similar if it will be used in a dashboard context explicitly
const UploadClippingsSidebar: React.FC<UploadClippingsSidebarProps> = ({
  lastFile,
  onFileSubmit,
  setFile,
  isUploading = false,
  stats,
  onCloseSidebar,
  showCloseButton = false,
  isDesktop = false,
}) => {
  // Handler for submit button
  const handleFileSubmit = () => {
    if (!lastFile) return;
    onFileSubmit();
  };

  // Handler for file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      toast.error("Please upload a .txt file.");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error("File size must be less than 16MB.");
      return;
    }
    setFile(file);
  };

  return (
    <div
      className={`flex flex-col gap-8 relative bg-white/0`}
      style={
        isDesktop
          ? {
              minHeight: "calc(100vh - 3rem)",
              height: "100%",
              justifyContent: "flex-start",
            }
          : undefined
      }
    >
      {/* X Close Button for mobile, if requested */}
      {showCloseButton && onCloseSidebar && (
        <button
          className="absolute top-2 right-2 text-2xl font-bold text-royal-700 bg-transparent border-none cursor-pointer z-50 hover:text-royal-900 transition-colors"
          onClick={onCloseSidebar}
          aria-label="Close sidebar"
          style={{ background: "none" }}
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* --- Metadata Section --- */}
      <div className="mb-4 space-y-2">
        <div className="font-bold text-royal-700 text-lg">Your Stats</div>
        <div className="text-sm text-gray-700">
          Total Books:{" "}
          <span className="font-semibold">{stats.totalBooks}</span>
        </div>
        <div className="text-sm text-gray-700">
          Total Highlights:{" "}
          <span className="font-semibold">{stats.totalHighlights}</span>
        </div>
        <div className="text-sm text-gray-700">
          Avg Highlights/Book:{" "}
          <span className="font-semibold">{stats.avgHighlights}</span>
        </div>
        <div className="text-sm text-gray-700">
          Median Highlights/Book:{" "}
          <span className="font-semibold">{stats.medianHighlights}</span>
        </div>
        <div className="text-sm text-gray-700">
          Highest Highlights in a Book:{" "}
          <span className="font-semibold">{stats.maxHighlights}</span>
        </div>
      </div>
      {/* --- Last Uploaded File Section --- */}
      <div className="text-xs text-gray-700 text-center">
        <div className="font-semibold mb-1">Last Uploaded:</div>
        {lastFile ? (
          <div>
            <span className="font-medium">{lastFile.name}</span>
            <br />
            <span className="text-gray-400">
              {(lastFile.size / 1024).toFixed(1)} KB
            </span>
            <br />
            <div className="font-semibold mb-1">Uploaded On:</div>

            <span className="text-gray-500">
              {lastFile.lastModified
                ? (() => {
                    const d = new Date();
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}, ${d.toLocaleTimeString()}`;
                  })()
                : "Unknown"}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">No file uploaded yet.</span>
        )}
      </div>
      {/* --- Upload Button Section --- */}
      <label className="flex flex-col items-center bg-royal-500 text-white px-4 py-3 rounded cursor-pointer hover:bg-royal-600 transition-colors shadow-lg font-semibold text-center">
        <UploadCloud className="mb-1 h-6 w-6" />
        {isUploading ? "Uploading..." : "Upload Kindle Clippings"}
        <input
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />
      </label>

      {/* --- Submit Button Section (only show if file is selected) --- */}
      {lastFile && (
        <>
          <button
            className="w-full bg-royal-700 text-white py-2 rounded-lg font-semibold shadow hover:bg-royal-800 transition mb-1 mt-2"
            onClick={handleFileSubmit}
            disabled={isUploading}
            type="button"
          >
            {isUploading ? "Uploading..." : "Submit File"}
          </button>
          <div className="text-xs text-gray-500 text-center mt-1">
            Uploading a new Clippings file will cost you{" "}
            {import.meta.env.VITE_FILE_UPLOAD_COST} coins
          </div>
        </>
      )}
    </div>
  );
};

export default UploadClippingsSidebar;

// #todo make the button background color lighter shade of purple in default
// #todo Make the price for uploading highlights for user profile dynamic from env Variable.
