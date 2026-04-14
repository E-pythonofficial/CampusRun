import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api'; // 🟢 Corrected: Using your centralized API client

const ResendVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [email, setEmail] = useState<string>(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(60);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading || cooldown > 0) return;

    setLoading(true);
    setError(null);
    setSent(false);

    try {
      // 🟢 Optimized: Using your 'api' instance handles the IP and /api prefix
      await api.post('/auth/resend-verification', { email });
      setSent(true);
      startCooldown();
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 404) {
        setError("No account found with this email address.");
      } else if (status === 400) {
        setError("This email is already verified. You can go ahead and log in.");
      } else {
        setError(msg || "Server connection failed. Check your network.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/login')}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-primary transition-colors group z-50"
      >
        <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
          <ArrowLeft size={20} />
        </div>
        <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">Back to Login</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-6 bg-white/10 p-5 rounded-full w-fit backdrop-blur-xl border border-white/20"
          >
            <Mail className="text-primary w-12 h-12" />
          </motion.div>
          <Logo size="lg" light />
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white mb-2 text-center uppercase italic tracking-tighter">Resend Link</h2>
            <p className="text-white/40 text-[10px] text-center uppercase tracking-[0.2em] mb-8 font-bold">
              Verification links expire for security
            </p>

            <AnimatePresence mode="wait">
              {sent && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3 text-green-400 text-xs">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <p className="font-medium leading-relaxed uppercase tracking-tight">
                      Link sent to <span className="font-black underline break-all">{email}</span>. 
                    </p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3 text-red-400 text-xs">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p className="font-medium uppercase tracking-tight">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleResend} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white/40 ml-1 text-[10px] uppercase tracking-[0.2em] font-black">
                  Target Email
                </Label>
                <Input
                  type="email"
                  placeholder="name@university.edu"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/10 h-14 rounded-2xl focus:border-primary/50 transition-all outline-none italic font-medium"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                    setSent(false);
                  }}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black h-14 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.96] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : cooldown > 0 ? (
                  <span className="flex items-center gap-2 uppercase tracking-widest italic">
                    <RefreshCw size={16} className="animate-spin-slow" /> Wait {cooldown}s
                  </span>
                ) : (
                  <span className="flex items-center gap-2 uppercase tracking-widest italic">
                    Resend Link <Send size={16} />
                  </span>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-white/20 text-[9px] uppercase tracking-[0.3em] font-black italic">
              Status: Outbound Security Check
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResendVerification;