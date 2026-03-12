import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";

// Existing Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RequesterDashboard from "./pages/RequesterDashboard";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import MyRequests from "./pages/MyRequests";
import PaymentSuccess from "./pages/PaymentSuccess";
import LandingPage from "./pages/landingPage";
import Profile from "./pages/Profile";
import DeleteAccount from "./pages/DeleteAccount";
import NotificationSettings from "./pages/NotificationSettings";
import PrivacySecurity from "./pages/PrivacySecurity";
import Support from "./pages/Support";

// New Password Reset Flow Pages
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";


const queryClient = new QueryClient();

// Protected Route Wrapper for Security
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  if (user?.role !== allowedRole) return <Navigate replace to="/" />;
  
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
            {/* Public Routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/notification-settings" element={<NotificationSettings />} />
            <Route path="/privacysettings" element={<PrivacySecurity />} />
            <Route path="/support" element={<Support />} />

            <Route path="/" element={<LandingPage />} />
            
            {/* Password Reset Flow */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Dashboard Routes */}
            <Route 
              path="/requester/*" 
              element={
                <ProtectedRoute allowedRole="requester">
                  <RequesterDashboard />
                </ProtectedRoute>
              } 
            />
            {/* my-requests */}
            <Route path="/my-requests" element={<MyRequests />} />
            {/* payment success */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route 
              path="/dispatcher/*" 
              element={
                <ProtectedRoute allowedRole="dispatcher">
                  <DispatcherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;