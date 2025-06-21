import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage("Verification failed: " + err.message);
      });
  }, [searchParams]);

  // Countdown and redirect after success
  useEffect(() => {
    if (status === "success") {
      if (countdown === 0) {
        navigate("/auth");
        return;
      }
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-[89vh] flex flex-col items-center justify-center bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 glass-effect text-center">
        {status === "pending" && <div>Verifying your email...</div>}
        {status === "success" && (
          <>
            <div className="text-green-600 font-semibold mb-4">{message}</div>
            <div className="text-gray-700 mb-4">    
              Redirecting you to login in {countdown}...
            </div>
            <Button className="w-full bg-royal-500 text-white hover:bg-royal-600" onClick={() => navigate("/auth")}>
              Go to Login Now
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-600 font-semibold mb-4">{message}</div>
            <Button className="w-full" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;