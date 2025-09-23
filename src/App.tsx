import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import VerifyEmail from "@/pages/VerifyEmail";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CoinsProvider } from "@/context/CoinsContext";
import { StatsProvider } from "@/context/StatsContext";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsNew from "./pages/WhatsNew";
import Dashboard from "./pages/Dashboard";
import BookOnlineView from "./pages/BookOnlineView";
import Newsletter from "@/pages/Newsletter";
import Unsubscribe from "@/pages/Unsubscribe";
import { UserProvider } from "@/context/UserContext";
import KindleSecret from "./pages/KindleSecret";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CoinsProvider>
      <StatsProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Header />
              <Routes>
                {/* <Route path="/" element={<Index />} /> */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route path="/whats-new" element={<WhatsNew />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/book/:bookId"
                  element={
                    <ProtectedRoute>
                      <BookOnlineView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/newsletter"
                  element={
                    <ProtectedRoute>
                      <Newsletter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/newsletter/unsubscribe"
                  element={
                    <ProtectedRoute>
                      <Unsubscribe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kindle-secret"
                  element={
                    <ProtectedRoute>
                      <KindleSecret />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Footer />
          </TooltipProvider>
        </UserProvider>
      </StatsProvider>
    </CoinsProvider>
  </QueryClientProvider>
);

export default App;
