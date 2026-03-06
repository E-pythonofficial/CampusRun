import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
// Added Eye and EyeOff icons
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    matricNumber: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userRole = await login(formData.matricNumber, formData.password);
      navigate(`/${userRole}`);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Logo size="lg" />
          <p className="text-white/60 mt-2 font-medium">Campus Logistics, Simplified.</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label className="text-white/70 ml-1 text-xs">Matric Number</Label>
              <Input 
                placeholder="CSC/2021/001" 
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-14 rounded-2xl focus:border-primary/50 transition-all outline-none"
                value={formData.matricNumber}
                onChange={(e) => setFormData({...formData, matricNumber: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-white/70 text-xs">Password</Label>
                <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] text-primary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              
              {/* Password field with Visibility Toggle */}
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:border-primary/50 transition-all outline-none pr-12" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                <span className="flex items-center gap-2">
                  Sign In <LogIn size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-sm text-white/40">
              New to the platform?{' '}
              <button 
                onClick={() => navigate('/register')} 
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;