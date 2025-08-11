import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
    name: string | null;
    email: string | null;
    id: string | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch user info from backend
  const refreshUser = async () => {
    try {
      let res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const userId = data.userId;
        if (!userId) {
          setUser(null);
          return;
        }


        res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userId }),
        });
        if (res.ok) {
          const userData = await res.json();
          setUser({ email: userData.email, name: userData.firstName || null, id: userId });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};