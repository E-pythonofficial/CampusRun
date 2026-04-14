import { useEffect } from "react"; 
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
import Safety from "./pages/Safety";
import Preferences from "./pages/Preferences";

// Application/Verification of Dispatcher Processes
import VerifyEmailDispatcher from './pages/VerifyEmailDispatcher';
import EmailVerified from "./pages/EmailVerified";
import ApplicationReceived from "./pages/ApplicationReceived";
import Verification from "./pages/Verification";
import VerifyEmailToken from "./pages/VerifyEmailToken";
import ResendEmailToken from './pages/ResendEmailToken'
// import ResendVerifyOTP from "./pages/ResendVerifyOTP";

// New Password Reset Flow Pages
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

/**
 * PROTECTED ROUTE COMPONENT
 * Fixed: Added normalization to lowercase to ensure 'REQUESTER' matches 'requester'
 */
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate replace to="/login" />;
  
  // Case-insensitive role check
  if (user?.role?.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate replace to="/" />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // --- THE THEME BRAIN ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* --- AUTH STATE ROUTES --- */}
              <Route path="/verify-email-runner" element={<VerifyEmailDispatcher />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/application-received" element={<ApplicationReceived />} />

              {/* Shows the "Go check your Gmail" message */}
              <Route path="/verification" element={<Verification />} />

              {/* NEW: Verification Route */}
              {/* Handles the actual clicking of the link from the email */}
            <Route path="/verify-email/:token" element={<VerifyEmailToken/>} />

            {/* NEW: Resend Verification Route */}
            <Route path="/resend-verification" element={<ResendEmailToken />} />

            {/* NEW: Resend Verify OTP Route */}
            {/* <Route path="/resend-verify-otp" element={<ResendVerifyOTP />} /> */}

              {/* --- PASSWORD RECOVERY --- */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />



              {/* --- PROTECTED REQUESTER ROUTES --- */}
              <Route 
                path="/requester/*"
                element={
                  <ProtectedRoute allowedRole="requester">
                    <RequesterDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* --- PROTECTED DISPATCHER ROUTES --- */}
              <Route 
                path="/dispatcher/*"
                element={
                  <ProtectedRoute allowedRole="dispatcher">
                    <DispatcherDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* --- PROTECTED ADMIN ROUTES --- */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* --- SHARED PROTECTED ROUTES (Requires Login) --- */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
              <Route path="/privacysettings" element={<PrivacySecurity />} />
              <Route path="/support" element={<Support />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/preferences" element={<Preferences />} />

              {/* --- 404 CATCH ALL --- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;