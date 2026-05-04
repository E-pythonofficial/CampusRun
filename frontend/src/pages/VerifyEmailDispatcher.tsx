import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useState } from 'react';
import api from '@/lib/api'; // 🟢 Centralized API client

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Extract state from navigation
  const email = location.state?.email ?? 'your email';
  const isPendingApproval = location.state?.pending ?? false;

  const handleResendEmail = async () => {
    if (!email || email === 'your email') return;
    
    setIsResending(true);
    setResendStatus('idle');

    try {
      // 🟢 Uses your centralized Axios instance
      await api.post('/auth/resend-verification', { email });
      setResendStatus('success');
      
      // Reset success message after 5 seconds
      setTimeout(() => setResendStatus('idle'), 5000);
    } catch (error) {
      console.error("Failed to resend:", error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.img
        src="/run.gif"
        alt="runner"
        className="w-24 h-20 object-contain mb-4 relative z-10"
        initial={{ x: '-100vw', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo size="lg" light />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center"
        >
          {/* Status Icon Section */}
          <div className="relative flex items-center justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className={`absolute w-24 h-24 rounded-full ${isPendingApproval ? 'bg-yellow-500/20' : 'bg-primary/20'}`}
            />
            <div className={`relative w-20 h-20 rounded-full border flex items-center justify-center ${
              isPendingApproval ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-primary/10 border-primary/30'
            }`}>
              {isPendingApproval ? (
                <Clock size={36} className="text-yellow-500" />
              ) : (
                <Mail size={36} className="text-primary" />
              )}
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight italic">
            {isPendingApproval ? 'Application Received!' : 'Check Your Email'}
          </h2>

          <p className="text-white/60 text-sm leading-relaxed mb-2 font-medium">
            {isPendingApproval 
              ? "We've sent a confirmation to:" 
              : "We've sent a verification link to:"}
          </p>
          
          <p className="text-primary font-black text-base mb-6 break-all tracking-wide">
            {email}
          </p>

          <p className="text-white/40 text-xs leading-relaxed mb-8 px-2 font-medium">
            {isPendingApproval 
              ? "Our team is currently reviewing your ID card and selfie. This usually takes 1-2 hours. You'll receive an email once you're cleared to start earning!"
              : "Click the link in the email to verify your address. If you don't see it within a few minutes, check your spam folder."}
          </p>

          {/* Action Button */}
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-7 rounded-2xl shadow-lg shadow-primary/20 mb-6 transition-all active:scale-[0.96] uppercase tracking-[0.15em] italic"
          >
            {isPendingApproval ? "Return to Login" : "I've Verified ✓"}
          </Button>

          {/* Resend Logic */}
          {!isPendingApproval && (
            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="flex items-center justify-center gap-2 w-full text-white/40 hover:text-primary text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} /> 
                {isResending ? 'Sending Link...' : 'Resend verification email'}
              </button>

              <AnimatePresence>
                {resendStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-green-400 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <CheckCircle2 size={12} />
                    Email sent successfully!
                  </motion.div>
                )}
                {resendStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <AlertCircle size={12} />
                    Failed to resend. Try again.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {isPendingApproval && (
             <div className="flex items-center justify-center gap-2">
               <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
               <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] italic">
                 Status: Pending Review
               </p>
             </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;