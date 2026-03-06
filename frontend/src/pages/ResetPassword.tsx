import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Added Eye and EyeOff icons
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  
  // State for toggling visibility of both fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return alert("Passwords don't match");
    
    setLoading(true);
    // Simulate API call to update password in MongoDB
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center">
          <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">New Password</h2>
          <p className="text-white/40 text-sm mb-8">Set a strong password to protect your account.</p>
          
          <form onSubmit={handleReset} className="space-y-4 text-left">
            {/* New Password Field */}
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="New Password" 
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl pr-12"
                required 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <Input 
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm New Password" 
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl pr-12"
                required 
                onChange={(e) => setFormData({...formData, confirm: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors focus:outline-none"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button className="w-full bg-primary h-14 rounded-2xl font-bold mt-4 transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;