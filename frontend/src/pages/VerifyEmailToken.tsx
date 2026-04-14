import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api'; // 🟢 Use your centralized API client

const VerifyEmailToken = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    const verify = async () => {
      try {
        // 🟢 Using the api client handles the Base URL (IP address) automatically
        // No need for await response.json() with Axios
        const response = await api.get(`/auth/verify/${token}`);
        
        setStatus('success');
        setMessage("Your email has been verified successfully! You can now access CampusRun.");
      } catch (error: any) {
        setStatus('error');
        
        // Extract the error message from the backend if it exists
        const errorMsg = error.response?.data?.message || 'This verification link is invalid or has expired.';
        setMessage(errorMsg);
        
        console.error("Verification failed:", error);
      }
    };

    if (token) {
      verify();
    } else {
      setStatus('error');
      setMessage('No verification token found.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-navy-gradient flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl text-center relative z-10"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center py-10">
            <div className="relative mb-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
              />
            </div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Verifying...</h2>
            <p className="text-white/40 text-xs mt-2 uppercase tracking-tight">Syncing with CampusRun servers</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <CheckCircle2 className="w-20 h-20 text-green-400 mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
            </motion.div>
            
            <h2 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter">Verified!</h2>
            <p className="text-white/60 mb-10 text-sm leading-relaxed font-medium">{message}</p>
            
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black py-7 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20 uppercase italic tracking-widest"
            >
              Go to Login <ArrowRight size={20} />
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
            >
              <XCircle className="w-20 h-20 text-red-400 mb-6 drop-shadow-[0_0_15px_rgba(248,113,113,0.4)]" />
            </motion.div>
            
            <h2 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter">Failed</h2>
            <p className="text-white/60 mb-10 text-sm leading-relaxed font-medium">{message}</p>
            
            <div className="flex flex-col gap-4 w-full">
              <Button 
                onClick={() => navigate('/register')}
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5 py-7 rounded-2xl font-bold uppercase tracking-widest"
              >
                Register Again
              </Button>
              <Link to="/login" className="text-white/30 hover:text-primary text-xs font-black uppercase tracking-widest transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Small wrapper for the Button if you're using a custom one, 
// otherwise keep using your shadcn Button component.
const Button = ({ children, className, ...props }: any) => (
  <button className={`inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props}>
    {children}
  </button>
);

export default VerifyEmailToken;