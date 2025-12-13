import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import Stats from "@/components/Stats";

interface DashboardDrawerProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  stats: {
    totalBooks: number;
    totalHighlights: number;
    avgHighlights: number;
    maxHighlights: number;
    updatedAt: Date;
  };
}


const DashboardDrawer: React.FC<DashboardDrawerProps> = ({ open, onClose, onLogout, stats }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex">
      <div className="bg-white dark:bg-card w-64 h-full shadow-xl p-6 flex flex-col border-r border-border">
        <button
          onClick={onClose}
          className="self-end mb-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
        {/* User Info */}
        {user && (
          <div className="mb-6">
            <div className="text-lg font-semibold text-royal-700 dark:text-base">Hello {user.name ? user.name : "Book Lover"}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground break-all">{user.email}</div>
          </div>
        )}
        {stats && (
          <Stats {...stats} />
        )}
        <button
          onClick={() => {
            navigate("/whats-new");
            onClose();
          }}
          className="w-full text-left px-4 py-2 rounded transition-colors hover:text-fuchsia-800 text-royal-600 group"
        >
          <span className="relative inline-block">
            What's New
            <span
              className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-royal-600 transition-all duration-300 group-hover:w-full"
            />
          </span>
        </button>
        {/* Add more dashboard items here */}
        <div className="flex-1" />
        <button
          onClick={onLogout}
          className="w-full bg-royal-500 text-white rounded px-4 py-2 hover:bg-royal-600 mt-4"
          style={{ marginTop: "auto" }}
        >
          Logout
        </button>
      </div>
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};

export default DashboardDrawer;