import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Camera, CheckCircle2, Loader2, 
  Phone, ShieldCheck, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'processing' | 'photo' | 'matching' | 'tracking'>('processing');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Scoped key for this specific user
  const storageKey = `activeRun_${user?.id}`;

  // 1. Check if a run is already active for THIS user on mount
  useEffect(() => {
    if (user?.id) {
      const savedRun = localStorage.getItem(storageKey);
      if (savedRun) {
        setStep('tracking');
      }
    }
  }, [user?.id, storageKey]);

  // Step 1: Mock Payment Processing
  useEffect(() => {
    if (step === 'processing') {
      const timer = setTimeout(() => setStep('photo'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Step 2 -> 3 -> 4: Save to User-Specific Persistence
  const handlePhotoUpload = () => {
    setStep('matching');
    
    const activeRunData = {
      id: 'RUN-' + Math.floor(1000 + Math.random() * 9000),
      item: "MTH201 Textbook", 
      status: "IN_TRANSIT",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pickup: "Science Building",
      dropoff: "Hall 3, Room 214",
      fee: "₦500",
      pin: Math.floor(1000 + Math.random() * 8999).toString(),
      dispatcher: {
        name: "Adebayo Oluwaseun",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo"
      }
    };

    // Save only for this user
    localStorage.setItem(storageKey, JSON.stringify(activeRunData));

    setTimeout(() => {
      setStep('tracking');
    }, 3000);
  };

  // HANDSHAKE: End the delivery
  const completeDelivery = () => {
    localStorage.removeItem(storageKey);
    // You could also push to a 'history' array here before removing
    navigate('/requester');
  };

  // TERMINATE: Cancel the run
  const terminateRun = () => {
    if (window.confirm("Terminate this run? The dispatcher will be notified.")) {
      localStorage.removeItem(storageKey);
      navigate('/requester');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: PROCESSING */}
        {step === 'processing' && (
          <motion.div 
            key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Securing Escrow...</h2>
            <p className="text-white/40 text-sm">Verifying your delivery fee.</p>
          </motion.div>
        )}

        {/* STEP 2: PHOTO CAPTURE */}
        {step === 'photo' && (
          <motion.div 
            key="photo" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Camera size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic uppercase">Item Verification</h2>
              <p className="text-white/40 text-xs text-balance">Snap a photo of the item for security and escrow verification.</p>
            </div>

            <div className="aspect-square w-full bg-black/40 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
              {capturedImage ? (
                <img src={capturedImage} alt="Item" className="w-full h-full object-cover" />
              ) : (
                <button 
                  onClick={() => setCapturedImage('https://images.unsplash.com/photo-1544640808-32ca72ac7f37?q=80&w=1000&auto=format&fit=crop')} 
                  className="flex flex-col items-center gap-2 text-white/20 hover:text-primary transition-colors"
                >
                  <Plus size={32} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Simulate Capture</span>
                </button>
              )}
            </div>

            <Button 
              disabled={!capturedImage}
              onClick={handlePhotoUpload}
              className="w-full h-14 bg-primary hover:bg-orange-600 text-white rounded-2xl font-bold gap-2"
            >
              Confirm & Find Dispatcher
            </Button>
          </motion.div>
        )}

        {/* STEP 3: MATCHING */}
        {step === 'matching' && (
          <motion.div 
            key="match" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto relative z-10" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Finding Runner...</h2>
          </motion.div>
        )}

        {/* STEP 4: TRACKING & TERMINATION */}
        {step === 'tracking' && (
          <motion.div 
            key="track" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="max-w-md w-full space-y-4"
          >
            <div className="bg-primary px-6 py-4 rounded-3xl flex items-center justify-between shadow-lg shadow-primary/20">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-sm">Runner is on the way!</span>
               </div>
               <span className="text-xs font-black bg-black/20 px-3 py-1 rounded-full uppercase">4 Mins</span>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo" alt="Runner" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">Adebayo Oluwaseun</h3>
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck size={12} className="text-primary" />
                        <span>Verified Student Runner</span>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full h-12 w-12 border-white/10 bg-white/5 text-white">
                    <Phone size={18} />
                  </Button>
               </div>

               <div className="bg-black/40 rounded-2xl p-4 border border-white/5 text-center">
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Handshake PIN</p>
                  <p className="text-4xl font-mono font-black text-primary tracking-[0.2em]">4829</p>
               </div>

               <div className="space-y-3">
                <Button 
                  onClick={completeDelivery}
                  className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Confirm Item Received
                </Button>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/requester')}
                    variant="ghost" 
                    className="flex-1 h-12 text-white/40 hover:text-white bg-white/5 rounded-xl text-xs font-bold uppercase"
                  >
                    Back to Map
                  </Button>
                  <Button 
                    onClick={terminateRun}
                    variant="ghost" 
                    className="h-12 px-4 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase"
                  >
                    <XCircle size={16} />
                  </Button>
                </div>
               </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default PaymentSuccess;