import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

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

  if (checking) {
    return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;