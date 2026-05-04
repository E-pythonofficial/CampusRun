import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PackageCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const ApplicationReceived = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-6">

      {/* Runner gif */}
      <motion.img
        src="/run.gif"
        alt="runner"
        className="w-24 h-20 object-contain mb-4"
        initial={{ x: '-100vw', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 24, stiffness: 260 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2rem] shadow-2xl text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6"
          >
            <PackageCheck size={40} className="text-primary" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-2xl font-bold text-white mb-4 font-major leading-tight"
          >
            Application Received!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-white/70 text-sm font-playful leading-relaxed mb-3"
          >
            Campus Run Logistics has successfully received your dispatcher
            application.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-white/50 text-xs font-playful leading-relaxed mb-8"
          >
            We will review your details and get back to you shortly to let you
            know whether you qualify to be a Campus Run dispatcher. Keep an eye
            on your email!
          </motion.p>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-6" />

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-[11px] font-black uppercase tracking-widest">
              Application Under Review
            </span>
          </motion.div>

          {/* Back to landing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Button
              onClick={() => navigate('/landing')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Back to Home <ArrowRight size={18} />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ApplicationReceived;