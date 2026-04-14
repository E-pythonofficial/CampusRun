import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import api from '@/lib/api'; // 🟢 Corrected: Using centralized API client

const Verification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email || "";
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleResend = async () => {
    if (!email) {
      setResendError("No email found. Please register again.");
      return;
    }

    if (cooldown > 0) return;

    setResendLoading(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      // 🟢 Using 'api' handles the base URL and /api prefix automatically
      await api.post('/auth/resend-verification', { email });
      
      setResendSuccess(true);
      setCooldown(60);

      // Start precise cooldown timer
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend. Please try again.";
      
      if (err.response?.status === 400) {
        setResendError("This email is already verified. You can log in now.");
      } else {
        setResendError(msg);
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Animated Icon Section */}
      <motion.div 
        initial={{ scale: 0, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="mb-8 bg-white/10 p-6 rounded-full backdrop-blur-xl border border-white/20 relative z-10"
      >
        <Mail className="text-primary w-16 h-16 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
      </motion.div>

      <div className="w-full max-w-md text-center relative z-10">
        <div className="mb-10">
            <Logo size="lg" light />
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="backdrop-blur-2xl bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-2xl"
        >
          <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter">
            Verify Email
          </h2>
          
          <p className="text-white/50 text-sm leading-relaxed mb-2 font-medium">
            Almost there! We've sent a link to:
          </p>
          <p className="text-primary font-black break-all mb-8 text-lg underline decoration-primary/30 underline-offset-4">
            {email || "your address"}
          </p>

          <AnimatePresence mode="wait">
            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3 text-green-400 text-xs font-bold uppercase tracking-tight"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                <p>Resent! Check your inbox & spam.</p>
              </motion.div>
            )}

            {resendError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex flex-col gap-2 text-red-400 text-xs font-bold uppercase tracking-tight"
              >
                <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{resendError}</p>
                </div>
                {resendError.includes("already verified") && (
                  <button
                    onClick={() => navigate('/login', { state: { email } })}
                    className="text-primary font-black hover:text-primary/80 transition-colors ml-7 text-left underline"
                  >
                    Go to Login →
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black py-7 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.96] shadow-lg shadow-primary/20 uppercase tracking-widest italic"
            >
              Back to Login <ArrowRight size={20} />
            </Button>

            <button 
              type="button"
              onClick={handleResend}
              disabled={resendLoading || cooldown > 0}
              className="text-[11px] text-white/40 hover:text-primary flex items-center justify-center gap-2 mx-auto transition-all disabled:opacity-50 uppercase font-black tracking-[0.2em]"
            >
              {resendLoading ? (
                <><Loader2 size={14} className="animate-spin" /> Transmitting...</>
              ) : cooldown > 0 ? (
                <><RefreshCw size={14} className="animate-spin-slow" /> Retry in {cooldown}s</>
              ) : (
                <><RefreshCw size={14} /> Resend Link</>
              )}
            </button>
          </div>
        </motion.div>

        <p className="mt-10 text-white/20 text-[10px] uppercase font-black tracking-[0.3em] italic">
          Verification: Pending User Action
        </p>
      </div>
    </div>
  );
};

export default Verification;