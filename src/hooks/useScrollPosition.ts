// Create src/hooks/useScrollPosition.ts
import { useEffect, useRef } from 'react';

interface UseScrollPositionProps {
  enabled: boolean;
  items: any[];
  itemRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
  onPositionChange: (bookId: string, index: number) => void;
  throttleMs?: number;
  debounceMs?: number;
  bookId: string;
}

export const useScrollPosition = ({
  enabled,
  items,
  itemRefs,
  onPositionChange,
  throttleMs = 100,
  debounceMs = 1000,
  bookId
}: UseScrollPositionProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastScrollTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled || !items || items.length === 0) return;

    const findVisibleItem = (): number => {
      let visibleItem = 0;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;

      for (let i = 0; i < items.length; i++) {
        const element = itemRefs.current[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;
          
          if (elementTop <= scrollTop + windowHeight / 2) {
            visibleItem = i;
          } else {
            break;
          }
        }
      }

      return visibleItem;
    };

    const handleScroll = () => {
      const now = Date.now();
      
      // Throttle scroll events
      if (now - lastScrollTimeRef.current < throttleMs) {
        return;
      }
      lastScrollTimeRef.current = now;

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce position saving
      timeoutRef.current = setTimeout(() => {
        const visibleItem = findVisibleItem();
        onPositionChange(bookId, visibleItem);
      }, debounceMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, items, throttleMs, debounceMs, onPositionChange]);
};