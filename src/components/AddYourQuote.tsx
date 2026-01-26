import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Pen } from 'lucide-react';

interface AddYourQuoteProps {
  onQuoteAdded?: (highlight: any) => void;
  triggerClassName?: string;
  iconOnly?: boolean;
  placement?: 'fab' | 'inline';
}

const MAX_LENGTH = 1024;


const AddYourQuote: React.FC<AddYourQuoteProps> = ({ onQuoteAdded, triggerClassName = '', iconOnly = false, placement = 'inline' }) => {
  const { user } = useUser();
  const [quoteText, setQuoteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setQuoteText(e.target.value);
      setError('');
    }
  };

  const sanitizeInput = (input: string) => {
    // Basic sanitization: remove script tags and trim
    return input.replace(/<script.*?>.*?<\/script>/gi, '').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const sanitizedQuote = sanitizeInput(quoteText);
    if (!sanitizedQuote) {
      setError('Quote cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      if (!user || !user.id) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/add-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quote: sanitizedQuote,
        }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to add quote.');
      }
      const data = await response.json();
      setSuccess('Quote added successfully!');
      setQuoteText('');
      if (onQuoteAdded && data.highlight) onQuoteAdded(data.highlight);
      setTimeout(() => setOpen(false), 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Responsive modal width and centering
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="bg-background dark:bg-card rounded-xl shadow-xl p-6 relative"
        style={{
          width: '100%',
          maxWidth: 400,
          margin: isAndroid ? '0 12px 0 12px' : '0 16px',
        }}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-royal-600 dark:hover:text-royal-300"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
        <form onSubmit={handleSubmit}>
          <label htmlFor="add-quote-textarea" className="block mb-2 font-semibold text-royal-700 dark:text-royal-300">
            Add a Quote to Your Book
          </label>
          <textarea
            id="add-quote-textarea"
            className="w-full p-2 border border-royal-200 dark:border-royal-700 rounded mb-2 resize-none bg-background dark:bg-card text-foreground"
            rows={4}
            maxLength={MAX_LENGTH}
            value={quoteText}
            onChange={handleChange}
            placeholder="Enter your quote here..."
            disabled={loading}
            aria-label="Quote textarea"
          />
          <div className="flex justify-between items-center mb-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{quoteText.length}/{MAX_LENGTH} characters</span>
            {loading && <span>Adding...</span>}
          </div>
          <button
            type="submit"
            className="bg-royal-600 hover:bg-royal-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
            disabled={loading || !quoteText.trim() || quoteText.length > MAX_LENGTH}
          >
            Add Quote
          </button>
          {error && <div className="mt-2 text-red-600 text-xs">{error}</div>}
          {success && <div className="mt-2 text-green-600 text-xs">{success}</div>}
        </form>
      </div>
    </div>
  );

  // Trigger button
  const trigger = (
    <button
      className={
        triggerClassName ||
        (placement === 'fab'
          ? 'bg-royal-600 hover:bg-royal-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all'
          : 'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-royal-600 hover:bg-royal-700 text-white font-medium shadow')
      }
      style={placement === 'fab' ? { boxShadow: '0 4px 16px 0 rgba(0,0,0,0.15)' } : {}}
      onClick={() => setOpen(true)}
      aria-label="Add Quote"
      type="button"
    >
      <Pen className="w-5 h-5" />
    </button>
  );

  return (
    <>
      {trigger}
      {open && modal}
    </>
  );
};

export default AddYourQuote;
