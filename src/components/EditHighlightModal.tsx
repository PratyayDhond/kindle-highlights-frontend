import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface EditHighlightModalProps {
  isOpen: boolean;
  highlight: any;
  onSave: (updatedHighlight: any) => void;
  onCancel: () => void;
}

const EditHighlightModal: React.FC<EditHighlightModalProps> = ({
  isOpen,
  highlight,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    highlight: "",
    type: "highlight",
    page: "",
    location: { start: 0, end: -1 },
    timestamp: "",
  });

  // Update form data when highlight prop changes
  useEffect(() => {
    if (highlight) {
      setFormData({
        highlight: highlight.highlight || "",
        type: highlight.type || "highlight",
        page: highlight.page || "",
        location: highlight.location || { start: 0, end: -1 },
        timestamp: highlight.timestamp || "",
      });
    }
  }, [highlight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.highlight.trim()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    onCancel();
    // Reset form data
    setFormData({
      highlight: "",
      type: "highlight",
      page: "",
      location: { start: 0, end: -1 },
      timestamp: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-card rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-foreground">Edit Highlight</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Highlight Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
              Highlight Text *
            </label>
            <textarea
              value={formData.highlight}
              onChange={(e) =>
                setFormData({ ...formData, highlight: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent resize-vertical bg-transparent dark:text-foreground"
              rows={5}
              placeholder="Enter highlight text..."
              required
            />
          </div>

          {/* Type (Read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <input
              type="text"
              value={formData.type === "highlight" ? "Highlight" : "Note"}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md bg-gray-50 dark:bg-muted text-gray-500 dark:text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Type cannot be modified
            </p>
          </div>

          {/* Page */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page
            </label>
            <input
              type="text"
              value={formData.page}
              onChange={(e) =>
                setFormData({ ...formData, page: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
              placeholder="Page number (optional)"
            />
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.location.start}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        start: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  placeholder="Start"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.location.end === -1 ? "" : formData.location.end}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        end: e.target.value === "" ? -1 : parseInt(e.target.value) || -1,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  placeholder="End (optional)"
                  min="0"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave end location empty if not applicable
            </p>
          </div>

          {/* Timestamp (read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Timestamp
            </label>
            <input
              type="text"
              value={
                formData.timestamp
                  ? (() => {
                    const date = new Date(formData.timestamp);
                    if (isNaN(date.getTime())) return "N/A";
                    return date.toLocaleString();
                  })()
                  : "N/A"
              }
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Timestamp cannot be modified
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 dark:text-muted-foreground border border-gray-300 dark:border-border rounded-md hover:bg-gray-50 dark:hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.highlight.trim()}
              className="px-4 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHighlightModal;