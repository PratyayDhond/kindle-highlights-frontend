import React from "react";
import { useAnimatedNumber } from "./useAnimatedNumber";

interface CoinsDashboardProps {
  coins: number;
}

const CoinsDashboard: React.FC<CoinsDashboardProps> = ({ coins }) => {
  const animatedCoins = useAnimatedNumber(coins, 600); // 600ms animation

  return (
    <div className="flex items-center gap-2 bg-white/80 dark:bg-card/80 px-4 py-2 rounded shadow text-royal-700 dark:text-royal-400 font-semibold">
      <span role="img" aria-label="coins">🪙</span>
      <span>{animatedCoins}</span>
    </div>
  );
};

export default CoinsDashboard;