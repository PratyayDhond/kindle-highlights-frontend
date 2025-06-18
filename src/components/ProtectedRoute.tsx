import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AUTH_MESSAGES = [
  "Checking authentication...",
  "Waking up the backend server...",
  "Almost there, please wait...",
  "Still working, thanks for your patience!",
  "If this takes too long, try refreshing the page.",
];

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setChecking(false))
      .catch(() => {
        navigate("/auth", { replace: true });
      });
  }, [navigate]);

  // Cycle through messages every 5 seconds
  useEffect(() => {
    if (!checking) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % AUTH_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [checking]);

  if (checking) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        {/* Circular spinner */}
        <svg className="animate-spin h-12 w-12 text-royal-500" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        {/* Rotating message */}
        <div className="text-lg text-gray-700 text-center max-w-xs">
          {AUTH_MESSAGES[messageIndex]}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;