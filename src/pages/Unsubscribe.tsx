import React, { useState } from "react";
import { toast } from "sonner";

const Unsubscribe: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(false);

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/newsletter/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setUnsubscribed(true);
        setConsent(false); // Reset consent after successful unsubscription
        toast.success(data.message || "You have been unsubscribed from the daily highlights newsletter.");
      } else {
        setUnsubscribed(false);
        console.log(response);
        if(response.status === 400 && data.message === "User already unsubscribed from newsletter"){
            console.log("Here")
            setConsent(false);
            setUnsubscribed(true);
        }
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setUnsubscribed(false);
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-4 text-royal-700">Unsubscribe from Newsletter</h1>
      <p className="mb-6 text-gray-600 text-center max-w-md">
        We're sorry to see you go! Click below to opt out of the daily highlights newsletter.
      </p>
      <form
        className="flex flex-col gap-4 w-full max-w-sm"
        onSubmit={e => {
          e.preventDefault();
          if (!consent) return;
          handleUnsubscribe();
        }}
      >
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-1 accent-red-600"
            required
          />
          <span>
            Unsubscribe me from 'Your Daily Highlights Newsletter'. I understand I can rejoin later if I wish.
          </span>
        </label>
        <button
          type="submit"
          className="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || unsubscribed || !consent}
        >
          {loading ? "Unsubscribing..." : unsubscribed ? "Unsubscribed" : "Unsubscribe"}
        </button>
      </form>
      {unsubscribed && (
        <p className="mt-6 text-green-600 text-center text-sm">
          You have been unsubscribed. You can re-subscribe anytime from the <a href="/newsletter" className="text-blue-600 underline">newsletter</a> page.
        </p>
      )}
    </div>
  );
};

export default Unsubscribe;