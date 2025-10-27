import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from "@/context/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="276642379188-8ces7nuu2bkud9ltaa9nm5usdcqhb0v3.apps.googleusercontent.com">
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </GoogleOAuthProvider>
);

// Rename Current Component to SideMenu or DashboardSideBar/DashboardSideMenu
// Rename Index's Dashboard component to IndexSidebar or IndexSideMenu
// Add A search filter option to the Dashboard page to search a specific Book. (In backend add a specific userBooks array to DB to fetch directly the text for user's read books instead of all the data)

// Add a spending history, to track coins spent by user. This can be tracked by storing transactions in the user object.