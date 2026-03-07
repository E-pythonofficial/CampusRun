import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context'; // Import useAuth
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, 
  Clock, ShieldCheck, ChevronRight, Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const MyRequests = () => {
  const { user } = useAuth(); // Access user to scope history/active runs
  const navigate = useNavigate();
  const [activeRun, setActiveRun] = useState<any>(null);

  // 1. Persistent State Logic: Pull user-specific run
  useEffect(() => {
    if (user?.id) {
      const storageKey = `activeRun_${user.id}`;
      const savedRun = localStorage.getItem(storageKey);
      if (savedRun) {
        setActiveRun(JSON.parse(savedRun));
      } else {
        setActiveRun(null);
      }
    }
  }, [user?.id]);

  // 2. Mock History (Static data for previous runs)
  const history = [
    {
      id: 'RUN-3910',
      item: "Scientific Calculator",
      status: "COMPLETED",
      date: "Yesterday",
      from: "Post Office",
      to: "New Library",
      fee: "500",
      pin: "---",
      dispatcher: "Emeka J."
    }
  ];

  // 3. Termination Logic: Clear storage and refresh state
  const terminateRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to terminate this run? This cannot be undone.")) {
      localStorage.removeItem(`activeRun_${user?.id}`);
      setActiveRun(null);
    }
  };

  // Combine active run with history
  const allRequests = activeRun ? [activeRun, ...history] : history;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': return 'text-primary bg-primary/10 border-primary/20';
      case 'COMPLETED': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* --- NAVBAR --- */}
      <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/requester')} 
            className="rounded-full h-10 w-10 p-0 text-white/40 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft size={20} />
          </Button>
          <Logo size="sm" />
        </div>
        <h1 className="font-major italic text-lg tracking-tighter uppercase">Request History</h1>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">My Runs</h2>
            <p className="text-white/40 text-sm">Review your campus logistics and secure PINs.</p>
          </div>
          {activeRun && (
             <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">1 Active Delivery</p>
             </div>
          )}
        </header>

        <div className="space-y-4">
          <AnimatePresence mode='popLayout'>
            {allRequests.map((run, i) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative border rounded-[2rem] p-6 transition-all cursor-default ${
                    run.status === 'IN_TRANSIT' 
                    ? 'bg-primary/[0.03] border-primary/20 shadow-lg shadow-primary/5' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                {/* Header: ID & Status */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/20 tracking-[0.2em] uppercase">Request ID: {run.id}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{run.item}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {run.status === 'IN_TRANSIT' && (
                        <Button 
                            variant="ghost"
                            onClick={terminateRun}
                            className="h-8 w-8 p-0 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(run.status)}`}>
                        {run.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <MapPin size={14} className="text-primary" />
                      </div>
                      <span className="truncate max-w-[100px] md:max-w-none">{run.pickup || run.from}</span>
                      <ChevronRight size={12} className="text-white/20 shrink-0" />
                      <span className="truncate max-w-[100px] md:max-w-none">{run.dropoff || run.to}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/40">
                      <Clock size={14} />
                      <span>{run.timestamp || run.date}</span>
                    </div>
                  </div>

                  {/* Operational Security: PIN Area */}
                  <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                      run.status === 'IN_TRANSIT' ? 'bg-black/60 border-primary/20' : 'bg-black/40 border-white/5'
                  }`}>
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className={run.status === 'IN_TRANSIT' ? "text-primary" : "text-white/10"} />
                      <div>
                        <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">Handshake PIN</p>
                        <p className="text-xs text-white/60">Dispatcher: {typeof run.dispatcher === 'object' ? run.dispatcher.name : run.dispatcher}</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-mono font-black tracking-widest ${
                        run.status === 'IN_TRANSIT' ? 'text-primary' : 'text-white/20'
                    }`}>
                      {run.pin}
                    </span>
                  </div>
                </div>

                {/* Status Footer - Live Track Trigger */}
                {run.status === 'IN_TRANSIT' && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-[10px] font-bold text-primary uppercase">Escrow Protection Active • Item is moving</p>
                    </div>
                    <Button 
                        size="sm"
                        onClick={() => navigate('/payment-success')}
                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-black rounded-xl h-8 px-4"
                    >
                        TRACK LIVE
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <footer className="p-8 text-center mt-auto">
        <p className="text-[10px] text-white/20 font-major uppercase tracking-widest">@2026 CampusRun Logistics</p>
      </footer>
    </div>
  );
};

export default MyRequests;