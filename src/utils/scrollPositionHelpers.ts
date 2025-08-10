  function getScrollPositionFromCache(bookId: string): number | null {
    const cachedPosition = localStorage.getItem(`scroll_position_${bookId}`);
    if (cachedPosition) {
      const position = parseInt(cachedPosition, 10);
      return isNaN(position) ? null : position;
    }
  return null;
  }

  function setScrollPositionToLocalCache(bookId: string, position: number) {
    localStorage.setItem(`scroll_position_${bookId}`, position.toString());
  }

  export {getScrollPositionFromCache, setScrollPositionToLocalCache};