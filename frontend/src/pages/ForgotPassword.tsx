import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [matric, setMatric] = useState('');

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // API Call to backend to send OTP via Email/SMS
    navigate('/verify-otp', { state: { matric } });
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-xs text-white/50 mb-6 hover:text-white">
            <ArrowLeft size={14} /> Back to Login
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-white/40 text-sm mb-6">Enter your Matric Number to receive a reset code.</p>
          
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <Input 
              placeholder="CSC/2021/001" 
              className="bg-white/5 border-white/10 text-white h-14 rounded-2xl"
              onChange={(e) => setMatric(e.target.value)}
              required 
            />
            <Button className="w-full bg-primary h-14 rounded-2xl font-bold">Send Code</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;