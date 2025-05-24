
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
import Reports from "./pages/Reports"; // Changed from Goals to Reports
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
            {/* Default route - Dashboard/Home always loads first */}
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
            {/* Reports page replaces Goals */}
            <Route path="/reports" element={
              <Layout>
                <Reports />
              </Layout>
            } />
            {/* Auth route - users go here only when they want to create account */}
            <Route path="/auth" element={
              <Layout>
                <RouteGuard requireAuth={false}>
                  <Auth />
                </RouteGuard>
              </Layout>
            } />
            <Route path="/profile" element={
              <RouteGuard requireAuth={true}>
                <Layout>
                  <Profile />
                </Layout>
              </RouteGuard>
            } />
            {/* Community route removed */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
