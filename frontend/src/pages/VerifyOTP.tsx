import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api'; // ✅ Replaced axios with centralized api
import { toast } from 'sonner';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please enter your email again.");
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData('text').trim();
    if (!/^\d{4}$/.test(data)) return; 
    const digits = data.split('').slice(0, 4);
    setOtp(digits);
    inputRefs.current[3]?.focus(); 
  };

  const handleChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    
    setIsResending(true);
    setOtp(['', '', '', '']); 

    try {
      // ✅ Using api.post instead of axios
      const response = await api.post('/auth/forgot-password', { 
        email: email.toLowerCase().trim() 
      });

      if (response.data.status === "success") {
        toast.success("A new 4-digit code has been sent!");
        setTimer(60);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('').trim();
    
    if (fullOtp.length !== 4) {
      toast.error("Please enter the full 4-digit code.");
      return;
    }

    setIsVerifying(true);
    try {
      // ✅ Using api.post instead of axios
      const response = await api.post('/auth/verify-otp', {
        email: email.toLowerCase().trim(),
        code: fullOtp
      });

      if (response.data.status === "success") {
        toast.success("OTP Verified Successfully!");
        navigate('/reset-password', { 
          state: { 
            email, 
            resetToken: response.data.resetToken 
          } 
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid or expired code");
      setOtp(['', '', '', '']); 
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl relative"
      >
        <button 
          onClick={() => navigate('/forgot-password')}
          className="absolute top-8 left-8 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 mt-4">Check your mail</h2>
        <p className="text-white/40 text-sm mb-8">
          We sent a 4-digit code to <br />
          <span className="text-white font-medium">{email}</span>
        </p>
        
        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-3 sm:gap-4 mb-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { if (el) inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="w-14 h-16 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-bold text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all shadow-inner"
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                required
              />
            ))}
          </div>
          
          <Button 
            type="submit"
            disabled={otp.some(d => !d) || isVerifying}
            className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-[0.98]"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Verifying...</span>
              </div>
            ) : "Verify Code"}
          </Button>
        </form>
        
        <div className="mt-8">
          <button 
            type="button"
            onClick={handleResend}
            disabled={isResending || timer > 0}
            className={`text-sm flex items-center justify-center gap-2 mx-auto transition-all ${
              timer > 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/40 hover:text-white group'
            }`}
          >
            {isResending ? <Loader2 className="animate-spin" size={14} /> : (
              <span>
                Didn't receive code? {timer > 0 ? (
                  <span className="text-white/20 font-mono ml-1">({timer}s)</span>
                ) : (
                  <span className="text-orange-500 font-semibold group-hover:underline underline-offset-4 ml-1">Resend</span>
                )}
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;


