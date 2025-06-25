import React from "react";

interface StatsProps {
  totalBooks: number;
  totalHighlights: number;
  avgHighlights: number;
  medianHighlights: number;
  maxHighlights: number;
}

const Stats: React.FC<StatsProps> = ({
  totalBooks,
  totalHighlights,
  avgHighlights,
  medianHighlights,
  maxHighlights,
}) => (
  <div className="mb-4 space-y-2">
    <div className="font-bold text-royal-700 text-lg">Your Stats</div>
    <div className="text-sm text-gray-700">
      Total Books: <span className="font-semibold">{totalBooks}</span>
    </div>
    <div className="text-sm text-gray-700">
      Total Highlights: <span className="font-semibold">{totalHighlights}</span>
    </div>
    <div className="text-sm text-gray-700">
      Avg Highlights/Book: <span className="font-semibold">{avgHighlights}</span>
    </div>
    <div className="text-sm text-gray-700">
      Median Highlights/Book: <span className="font-semibold">{medianHighlights}</span>
    </div>
    <div className="text-sm text-gray-700">
      Highest Highlights in a Book: <span className="font-semibold">{maxHighlights}</span>
    </div>
  </div>
);

export default Stats;