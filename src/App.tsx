
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Goals from "./pages/Goals"; // New goals page
import Community from "./pages/Community"; // New community page
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import RouteGuard from "./components/RouteGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth route now wrapped with Layout */}
            <Route path="/auth" element={
              <Layout>
                <RouteGuard requireAuth={false}>
                  <Auth />
                </RouteGuard>
              </Layout>
            } />
            <Route path="/" element={
              <Layout>
                <Index />
              </Layout>
            } />
            <Route path="/expenses" element={
              <Layout>
                <Expenses />
              </Layout>
            } />
            <Route path="/budgets" element={
              <Layout>
                <Budgets />
              </Layout>
            } />
            {/* New Goals and Community routes */}
            <Route path="/goals" element={
              <Layout>
                <Goals />
              </Layout>
            } />
            <Route path="/community" element={
              <Layout>
                <Community />
              </Layout>
            } />
            <Route path="/profile" element={
              <RouteGuard requireAuth={true}>
                <Layout>
                  <Profile />
                </Layout>
              </RouteGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
