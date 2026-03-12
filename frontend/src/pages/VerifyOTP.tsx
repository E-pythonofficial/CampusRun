import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleResend = async () => {
    setIsResending(true);
    // Logic to trigger backend OTP resend 
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    setIsResending(false);
  };

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Check your mail</h2>
        <p className="text-white/40 text-sm mb-8">We sent a 4-digit code to your email.</p>
        
        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              className="w-14 h-16 bg-white/5 border border-white/10 rounded-xl text-center text-2xl text-white focus:border-primary outline-none transition-all"
              onChange={(e) => handleChange(e.target.value, idx)}
            />
          ))}
        </div>
        
        <Button 
          onClick={() => navigate('/reset-password')}
          disabled={otp.some(d => !d)}
          className="w-full bg-primary h-14 rounded-2xl font-bold"
        >
          Verify Code
        </Button>
        
        {/* Interactive Resend Button */}
        <div className="mt-8">
          <button 
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-sm text-white/40 hover:text-white group transition-all flex items-center justify-center gap-2 mx-auto"
          >
            {isResending ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <span>Didn't receive code? <span className="text-primary font-semibold group-hover:underline underline-offset-4">Resend</span></span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP; // CRITICAL: This fixes your white screen error!