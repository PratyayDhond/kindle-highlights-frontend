import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Key } from "lucide-react";

const navLinks = [
  { label: "Tool", path: "/" },
  // { label: "Tool", path: "/tool" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Newsletter", path: "/newsletter" },
  { label: "What's New", path: "/whats-new" },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const currentIdx = navLinks.findIndex(link => link.path === location.pathname);
    if (navRef.current && btnRefs.current[currentIdx]) {
      const nav = navRef.current;
      const btn = btnRefs.current[currentIdx];

      if (location.pathname === "/whats-new") {
        // Scroll to end to show last 3 options
        nav.scrollLeft = nav.scrollWidth;
        btn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "end",
        });
      } else {
        // Scroll to start to show first 3 options
        nav.scrollLeft = 0;
        // Optionally, scroll the current button into view if it's not visible
        btn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
    }
  }, [location.pathname]);

  return (
    <header className="w-full bg-white border-b border-gray-200 px-2 py-3 flex items-center justify-center shadow-sm">
      <nav
        ref={navRef}
        className="
          flex gap-4 mx-auto
          max-w-[18rem] overflow-x-auto
          scrollbar-thin scrollbar-thumb-royal-300 scrollbar-track-transparent
          sm:max-w-none sm:overflow-x-visible sm:scrollbar-none
        "
      >
        {navLinks.map((link, idx) => (
          <button
            key={link.path}
            ref={el => (btnRefs.current[idx] = el)}
            onClick={() => navigate(link.path)}
            className={`text-base font-medium px-2 py-1 rounded transition-colors whitespace-nowrap
              ${location.pathname === link.path
                ? "text-royal-700 underline underline-offset-4"
                : "text-gray-700 hover:text-royal-800"}
            `}
          >
            {link.label}
          </button>
        ))}
        <Link
          to="/kindle-secret"
          className="flex items-center gap-2 text-royal-600 hover:text-royal-800"
        >
          <Key className="w-4 h-4" />
          Kindle Integration
        </Link>
      </nav>
    </header>
  );
};

export default Header;