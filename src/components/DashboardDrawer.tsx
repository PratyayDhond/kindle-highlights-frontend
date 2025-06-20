import React from "react";
import { useNavigate } from "react-router-dom";

interface DashboardDrawerProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const DashboardDrawer: React.FC<DashboardDrawerProps> = ({ open, onClose, onLogout }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex">
      <div className="bg-white w-64 h-full shadow-xl p-6 flex flex-col">
        <button
          onClick={onClose}
          className="self-end mb-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <button
          onClick={onLogout}
          className="w-full bg-royal-500 text-white rounded px-4 py-2 hover:bg-royal-600 mb-4"
        >
          Logout
        </button>
        <button
          onClick={() => {
            navigate("/whats-new");
            onClose();
          }}
          className="w-full text-left px-4 py-2 rounded hover:bg-royal-50 text-royal-600"
        >
          What's New
        </button>
        {/* Add more dashboard items here */}
      </div>
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};

export default DashboardDrawer;