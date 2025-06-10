import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="276642379188-8ces7nuu2bkud9ltaa9nm5usdcqhb0v3.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
