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

// PALETTE (same on every page): off-white #EDECDA · green #A4C41C (`primary`) · charcoal #36454F
const fieldClass =
  'bg-transparent border-[#36454F]/30 text-[#36454F] placeholder:text-[#36454F]/40 h-14 rounded-2xl focus-visible:ring-[#36454F] transition-all outline-none';

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

      // BUG FIX: this used to be `status === 401 || status === 403`, which caught every 403
      // first, so the unverified / suspended branch below could never run (and the
      // "Resend Verification Link" button never showed). Wrong password is 401 only.
      if (status === 401) {
        setError({ message: "The email or password provided is incorrect." });
      } else if (status === 403) {
        // ✅ FIX 2: Distinguish between "unverified email" and "suspended account"
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
    <div className="min-h-screen bg-[#EDECDA] text-[#36454F] flex flex-col items-center justify-center p-4 relative">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-[#36454F] hover:opacity-70 transition-colors group z-50"
      >
        <div className="p-2 rounded-full border-2 border-[#36454F]/30 group-hover:bg-primary group-hover:border-[#36454F] transition-all">
          <ArrowLeft size={20} />
        </div>
        <span className="text-sm font-medium tracking-wide uppercase hidden sm:block">Back to Home</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center text-center mb-10">
          {/* `light` removed: that prop makes the logo text white, which disappears on off-white */}
          <Logo size="md" />
          <p className="text-[#36454F]/70 mt-2 font-medium uppercase text-sm tracking-[0.2em]">Need It ? We Run It !</p>
        </div>

        <div className="bg-[#EDECDA] border-2 border-[#36454F]/25 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <AnimatePresence mode="wait">
              {/* ✅ Resend success banner */}
              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-2 border-green-700/40 rounded-2xl p-4 text-green-800 text-sm flex items-center gap-3"
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
                  className="border-2 border-red-600/40 rounded-2xl p-4 flex flex-col gap-3 text-red-700 text-sm"
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
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#36454F] underline underline-offset-4 decoration-primary decoration-2 hover:opacity-70 transition-colors ml-8 disabled:opacity-50"
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
              <Label className="text-[#36454F] ml-1 text-[10px] uppercase tracking-widest font-bold">Email Address</Label>
              <Input
                type="email"
                placeholder="yourname@campus.edu"
                className={fieldClass}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[#36454F] text-[10px] uppercase tracking-widest font-bold">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] text-[#36454F] underline underline-offset-4 decoration-primary decoration-2 hover:opacity-70 font-bold uppercase tracking-tighter"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${fieldClass} pr-12`}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#36454F]/60 hover:text-[#36454F] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Charcoal text on chartreuse: white is unreadable on it */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-[#36454F] font-bold h-14 rounded-2xl shadow-lg mt-4 transition-all active:scale-[0.98]"
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
            <p className="text-xs text-[#36454F]/70 uppercase tracking-widest">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#36454F] font-bold underline underline-offset-4 decoration-primary decoration-2 hover:opacity-70 transition-colors"
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