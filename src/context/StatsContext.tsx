import React, { createContext, useContext, useState } from "react";

export interface Stats {
  totalBooks: number;
  totalHighlights: number;
  avgHighlights: number;
  medianHighlights: number;
  maxHighlights: number;
}


export const StatsContext = createContext<{
  stats: Stats;
  setStats: React.Dispatch<React.SetStateAction<Stats | null>>;
}>({
  stats: null,
  setStats: () => {},
});

export const useStats = () => useContext(StatsContext);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  return (
    <StatsContext.Provider value={{ stats, setStats }}>
      {children}
    </StatsContext.Provider>
  );
};