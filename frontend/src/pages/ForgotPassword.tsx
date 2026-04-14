import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api'; // ✅ Replaced axios import with your centralized api
import { toast } from 'sonner';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation & Normalization
    if (!email) { 
      toast.error("Please enter your email address.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);
    
    try {
      // ✅ Replaced axios.post with api.post
      const response = await api.post('/auth/forgot-password', { 
        email: cleanEmail 
      });
      
      // 2. Check for success status from updated backend
      if (response.data.status === "success") {
        toast.success(response.data.message || "OTP sent successfully!");
        
        // Pass the cleaned email to the next screen so the user doesn't have to re-type it
        navigate('/verify-otp', { state: { email: cleanEmail } });
      }
    } catch (error: any) {
      // 3. Robust Error Handling
      const statusCode = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (statusCode === 404) {
        // This handles the "Email not registered" logic
        toast.error(serverMessage || "This email is not registered. Please sign up first.");
      } else if (statusCode === 400) {
        toast.error(serverMessage || "Invalid request. Please check your email format.");
      } else if (!error.response) {
        // Handle network errors (e.g., server is down)
        toast.error("Cannot connect to server. Please check your internet.");
      } else {
        // General server errors (500, etc.)
        toast.error(serverMessage || "Failed to send code. Please try again later.");
      }
      
      console.error("Forgot Password Request Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate('/login')} 
            className="flex items-center gap-2 text-xs text-white/50 mb-6 hover:text-orange-500 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>Back to Login</span>
          </button>
          
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-white/40 text-sm mb-6">
            Enter your email to receive a 4-digit reset code.
          </p>
          
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email"
                placeholder="example@campusrun.com"
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <Button 
              type="submit"
              disabled={loading} 
              className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Sending Code...</span>
                </div>
              ) : (
                "Send Code"
              )}
            </Button>
          </form>

          {/* Optional: Footer info */}
          <div className="mt-8 text-center">
            <p className="text-white/30 text-xs">
              Check your spam folder if you don't see the email.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;