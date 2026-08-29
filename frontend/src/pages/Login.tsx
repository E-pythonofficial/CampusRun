import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogIn, Eye, EyeOff, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api'; // ✅ Replaced axios import with your centralized api
import { registerPushToken } from "@/lib/firebase";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<{ message: string; type?: 'verify' } | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const roleRoutes = {
    REQUESTER: '/requester',
    DISPATCHER: '/dispatcher',
    ADMIN: '/admin'
  };

  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  // ✅ FIX 3: Resend calls the API directly instead of navigating to the wrong route
  const handleResend = async () => {
    if (!formData.email) {
      setError({ message: "Please enter your email address first.", type: 'verify' });
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);

    try {
      // ✅ Replaced axios.post with api.post
      await api.post('/auth/resend-verification', { email: formData.email });
      setResendSuccess(true);
      // Clear success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend. Please try again.";
      setError({ message: msg, type: 'verify' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setError(null);
    setResendSuccess(false);
    
    try {
      const user = await login(formData.email, formData.password);

      // ✅ FIX 1: Removed the redundant frontend isVerified check that was here.
      // The backend 403 handles this correctly — no need to double-check on the frontend
      // with a field that isn't even returned in the success response.

      if (user) {
        try {
          await registerPushToken();
          console.log("Push notification token registered");
        } catch (pushError) {
          console.error("Push registration failed:", pushError);
        }
        
        const userRole = user.role as keyof typeof roleRoutes;
        const targetRoute = roleRoutes[userRole] || '/dashboard';
        
        navigate(targetRoute, {
          replace: true,
          state: { welcome: true, name: user.fullName }
      });
    }

    } catch (err: any) {
      const status = err.response?.status || err.status;
      
      if (status === 401 || status === 403) {
        setError({ message: "The email or password provided is incorrect." });
      } else if (status === 403) {
        // ✅ FIX 2: Distinguish between "unverified email" and "suspended account"
        // by reading isVerified from the backend response body
        const isVerifyIssue = err.response?.data?.isVerified === false;
        setError({ 
          message: isVerifyIssue 
            ? "Please verify your email address before logging in." 
            : "Your account is suspended. Contact support.",
          type: isVerifyIssue ? 'verify' : undefined
        });
      } else {
        setError({ message: "Network connection lost. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4 relative">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/landing')}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-primary transition-colors group z-50"
      >
        <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
          <ArrowLeft size={20} />
        </div>
        <span className="text-sm font-medium tracking-wide uppercase hidden sm:block">Back to Home</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Logo size="lg" light/>
          <p className="text-white/60 mt-2 font-medium tracking-tight uppercase text-xs tracking-[0.2em]">Campus Logistics, Simplified.</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <AnimatePresence mode="wait">
              {/* ✅ Resend success banner */}
              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-green-400 text-sm flex items-center gap-3"
                >
                  <RefreshCw size={16} className="shrink-0" />
                  <p>Verification email resent! Check your inbox (and spam folder).</p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-3 text-red-400 text-sm"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1 leading-relaxed">{error.message}</p>
                  </div>
                  
                  {/* ✅ FIX 3: Resend button now calls handleResend (API call) instead of navigating */}
                  {error.type === 'verify' && (
                    <button 
                      type="button"
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors ml-8 disabled:opacity-50"
                    >
                      {resendLoading 
                        ? <><Loader2 size={12} className="animate-spin" /> Sending...</>
                        : <><RefreshCw size={12} /> Resend Verification Link</>
                      }
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label className="text-white/70 ml-1 text-[10px] uppercase tracking-widest font-bold">Email Address</Label>
              <Input 
                type="email"
                placeholder="yourname@campus.edu" 
                className="bg-white/5 border-white/10 text-white placeholder:text-white/10 h-14 rounded-2xl focus:border-primary/50 transition-all outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Password</Label>
                <Link 
                  to="/forgot-password"
                  className="text-[10px] text-primary hover:underline font-bold uppercase tracking-tighter"
                >
                  Forgot Password?
                </Link>
              </div>
              
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:border-primary/50 transition-all pr-12 outline-none" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl shadow-lg shadow-primary/20 mt-4 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2 uppercase tracking-[0.15em] font-black italic">
                  Sign In <LogIn size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-xs text-white/30 uppercase tracking-widest">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary font-bold hover:text-primary/80 transition-colors"
              >
                Create One
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;