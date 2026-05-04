import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';

const EmailVerified = () => {
  const navigate = useNavigate();

  // Auto-redirect to application received after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/application-received');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-[2rem] shadow-2xl text-center"
        >
          {/* Animated checkmark */}
          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-28 h-28 rounded-full bg-green-500/15 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/40"
              >
                <CheckCircle2 size={40} className="text-white" />
              </motion.div>
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-white mb-3 font-major"
          >
            Email Verified! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 text-sm font-playful leading-relaxed mb-8"
          >
            Your email has been successfully verified.
            Taking you to the next step...
          </motion.p>

          {/* Progress dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerified;