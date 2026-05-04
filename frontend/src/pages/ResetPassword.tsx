import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api'; // 🟢 Centralized API client

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Grab data passed from the OTP verification step
  const resetToken = location.state?.resetToken;
  const email = location.state?.email || 'your account';

  useEffect(() => {
    if (!resetToken) {
      toast.error("Unauthorized. Please verify your OTP first.");
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    if (formData.password !== formData.confirm) {
      return toast.error("Passwords do not match.");
    }
    
    setLoading(true);
    try {
      // 🟢 Uses your custom API instance for automatic IP routing
      const response = await api.post('/auth/reset-password', {
        resetToken,
        password: formData.password
      });

      // Axios puts the backend response inside .data
      if (response.data.status === "success" || response.status === 200) {
        setShowSuccess(true); 
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update password.";
      toast.error(message);
      
      // If token expired, send them back to start over
      if (error.response?.status === 400 || error.response?.status === 401) {
        navigate('/forgot-password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0f172a] border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-green-500" size={44} />
              </div>
              <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Success!</h3>
              <p className="text-white/40 mb-8 text-sm font-medium">Your password is updated. You can now login to CampusRun.</p>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-2xl font-black uppercase tracking-widest italic"
              >
                Back to Login
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: showSuccess ? 0.3 : 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-orange-500" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">New Password</h2>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-8 font-bold">
            Secure your account for <span className="text-primary underline">{email}</span>
          </p>
          
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative group">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="New Password" 
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl pr-12 focus:border-orange-500/50 transition-all font-medium"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative group">
              <Input 
                type={showConfirm ? "text" : "password"} 
                placeholder="Confirm Password" 
                className={`bg-white/5 border-white/10 text-white h-14 rounded-2xl pr-12 focus:border-orange-500/50 transition-all font-medium ${
                  formData.confirm && formData.password !== formData.confirm ? 'border-red-500/50 ring-1 ring-red-500/20' : ''
                }`}
                value={formData.confirm}
                onChange={(e) => setFormData({...formData, confirm: e.target.value})}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button 
              type="submit" 
              disabled={loading || showSuccess} 
              className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl font-black text-white uppercase tracking-widest italic shadow-lg shadow-orange-900/20 active:scale-[0.96] transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
            </Button>
          </form>
          
          <p className="mt-8 text-[10px] text-white/20 uppercase tracking-[0.3em] font-black italic">
            Encryption: AES-256 Bit
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;