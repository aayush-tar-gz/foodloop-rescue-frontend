
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RetailerDashboard from "./pages/retailer/Dashboard";
import RetailerRequests from "./pages/retailer/Requests";
import NGODashboard from "./pages/ngo/Dashboard";
import NGOMyRequests from "./pages/ngo/MyRequests";
import NotFound from "./pages/NotFound";
import FarmerDashboard from "./pages/farmer/Dashboard";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectPath = "/login" 
}: { 
  children: React.ReactNode, 
  requiredRole?: string,
  redirectPath?: string 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  
  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Retailer Routes */}
            <Route 
              path="/retailer/dashboard" 
              element={
                <ProtectedRoute requiredRole="Retailer">
                  <RetailerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/retailer/requests" 
              element={
                <ProtectedRoute requiredRole="Retailer">
                  <RetailerRequests />
                </ProtectedRoute>
              } 
            />
            
            {/* NGO Routes */}
            <Route 
              path="/ngo/dashboard" 
              element={
                <ProtectedRoute requiredRole="Ngo">
                  <NGODashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ngo/requests" 
              element={
                <ProtectedRoute requiredRole="Ngo">
                  <NGOMyRequests />
                </ProtectedRoute>
              } 
            />
            
            {/* Farmer Routes */}
            <Route 
              path="/farmer/dashboard" 
              element={
                <ProtectedRoute requiredRole="Farmer">
                  <FarmerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
