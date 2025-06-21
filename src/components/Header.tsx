import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navLinks = [
    { label: "Home", path: "/" },
//   { label: "Tool", path: "/tool" },
    { label: "Dashboard", path: "/dashboard" }, 
    { label: "What's New", path: "/whats-new" },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-center shadow-sm">
      <nav className="flex gap-6">
        {navLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`text-base font-medium px-2 py-1 rounded transition-colors
              ${location.pathname === link.path
                ? "text-royal-700 underline underline-offset-4"
                : "text-gray-700 hover:text-royal-800"}
            `}
          >
            {link.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;