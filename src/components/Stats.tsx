import React from "react";

interface StatsProps {
  totalBooks: number;
  totalHighlights: number;
  avgHighlights: number;
  maxHighlights: number;
}

const Stats: React.FC<StatsProps> = ({
  totalBooks,
  totalHighlights,
  avgHighlights,
  maxHighlights,
}) => (
  <div className="mb-4 space-y-2">
    <div className="font-bold text-royal-700 dark:text-royal-400 text-lg">Your Stats</div>
    <div className="text-sm text-gray-700 dark:text-muted-foreground">
      Total Books: <span className="font-semibold text-foreground">{totalBooks}</span>
    </div>
    <div className="text-sm text-gray-700 dark:text-muted-foreground">
      Total Highlights: <span className="font-semibold text-foreground">{totalHighlights}</span>
    </div>
    <div className="text-sm text-gray-700 dark:text-muted-foreground">
      Avg Highlights/Book: <span className="font-semibold text-foreground">{avgHighlights}</span>
    </div>
    <div className="text-sm text-gray-700 dark:text-muted-foreground">
      Max Highlights in a Book: <span className="font-semibold text-foreground">{maxHighlights}</span>
    </div>
  </div>
);

export default Stats;