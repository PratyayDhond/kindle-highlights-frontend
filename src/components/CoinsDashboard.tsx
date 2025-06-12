import React from "react";

const CoinsDashboard = ({ coins = 0 }: { coins?: number }) => (
  <div className=" text-yellow-900 px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
    <span role="img" aria-label="coins">🪙</span>
    <span className="font-bold">{coins}</span>
    <span className="text-xs font-semibold">Coins</span>
  </div>
);

export default CoinsDashboard;