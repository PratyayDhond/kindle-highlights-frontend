import React, { useState } from "react";
import { toast } from "sonner";

const Newsletter: React.FC = () => {
  const [consent, setConsent] = useState(false);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setSubscribed(true);
        setConsent(false); // Reset consent after successful subscription
        toast.success(data.message || "You have successfully subscribed to the daily highlights newsletter!");
      } else {
        setSubscribed(false);
        console.log(response);
        if(response.status === 400 && data.message === "User already subscribed to newsletter") {
          setConsent(false);
          setSubscribed(true);
          toast.info("You are already subscribed to the newsletter.");
          return;
        }
        toast.error(data.message || "Something went wrong.");
      }
    } catch {
      setSubscribed(false);
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-4 text-royal-700">Your Daily Highlights Newsletter</h1>
      <p className="mb-6 text-gray-600 text-center max-w-md">
        Start receiving your daily dose of Kindle highlights - straight to your inbox.
      </p>
      <form
        className="flex flex-col gap-4 w-full max-w-sm"
        onSubmit={e => {
          e.preventDefault();
          if (!consent) return; // Prevent API call if not consented
          handleSubscribe();
        }}
      >
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-1 accent-royal-700"
            required
          />
          <span>
            I consent to receiving the newsletter daily for now, until future updates offer more customization.
          </span>
        </label>
        <button
          type="submit"
          className="bg-royal-700 text-white py-2 rounded hover:bg-royal-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !consent}
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      <blockquote className="mt-8 mb-6 italic text-gray-500 max-w-md border-l-4 border-royal-300 pl-4 text-sm">
        “The next best thing to the enjoyment of a good time is the recollection of it.”
        <br />
        <span className="block mt-2 text-xs text-gray-400 not-italic mr-6 text-right">
          — James Lendall Basford
        </span>
      </blockquote>
    </div>
  );
};

export default Newsletter;