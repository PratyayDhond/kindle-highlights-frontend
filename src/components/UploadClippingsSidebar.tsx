import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";
import Stats from "@/components/Stats"; // Add this import

interface UploadClippingsSidebarProps {
  lastFile: File | null;
  onFileSubmit: () => void;
  setFile: (file: File | null) => void;
  isUploading?: boolean;
  stats?: {
    totalBooks: number;
    totalHighlights: number;
    avgHighlights: number;
    maxHighlights: number;
    updatedAt: Date;
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

  return (
    <div
      className={`flex flex-col gap-8 relative bg-background/0`}
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
          className="absolute top-2 right-2 text-2xl font-bold text-royal-700 dark:text-royal-400 bg-transparent border-none cursor-pointer z-50 hover:text-royal-900 dark:hover:text-royal-300 transition-colors"
          onClick={onCloseSidebar}
          aria-label="Close sidebar"
          style={{ background: "none" }}
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* --- Metadata Section --- */}
      <div className="mb-4 space-y-2">
        {stats && (
          <Stats
            totalBooks={stats.totalBooks}
            totalHighlights={stats.totalHighlights}
            avgHighlights={stats.avgHighlights}
            maxHighlights={stats.maxHighlights}
          />
        )}
      </div>
      {/* --- Last Uploaded File Section --- */}
      <div className="text-xs text-gray-700 dark:text-muted-foreground text-center">
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
      {/* --- Upload Component Section --- */}
      <FileUpload
        onFileSelect={setFile}
        selectedFile={lastFile}
      />

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
            Uploading a new Clippings file will use 1 coin for each unique book highlighted.
          </div>
        </>
      )}
    </div>
  );
};

export default UploadClippingsSidebar;

// #todo make the button background color lighter shade of purple in default
// #todo Make the price for uploading highlights for user profile dynamic from env Variable.
