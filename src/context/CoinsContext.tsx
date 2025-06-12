import React, { createContext, useContext, useState } from "react";

type CoinsContextType = {
  coins: number | undefined;
  setCoins: (coins: number) => void;
};

const CoinsContext = createContext<CoinsContextType | undefined>(undefined);

export const CoinsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState<number | undefined>(undefined);

  return (
    <CoinsContext.Provider value={{ coins, setCoins }}>
      {children}
    </CoinsContext.Provider>
  );
};

export const useCoins = () => {
  const ctx = useContext(CoinsContext);
  if (!ctx) throw new Error("useCoins must be used within a CoinsProvider");
  return ctx;
};