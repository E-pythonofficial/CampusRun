import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  ClipboardList, 
  Trophy, 
  User, 
  Wallet,
  Navigation2,
  Star,
  TrendingUp,
  Zap,
  Package,
  MapPin,
  Phone,
  MessageSquare,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { mockDeliveries, mockDispatcherStats, mockLeaderboard } from '@/lib/mock-data';
import { Delivery, DispatcherStats } from '@/lib/types';

// --- Sub-Components ---

const StatCard = ({ label, value, icon: Icon, accent, delay }: { 
  label: string, value: string | number, icon: any, accent?: boolean, delay: number 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-[#131B31] border border-white/5 rounded-2xl p-4"
  >
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={accent ? 'text-[#FF5C00]' : 'text-slate-400'} />
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
    </div>
    <span className={cn('text-xl font-bold', accent ? 'text-[#FF5C00]' : 'text-white')}>
      {value}
    </span>
  </motion.div>
);

const NavButton = ({ active, icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div className={cn(
      "p-2 rounded-xl transition-all duration-300",
      active 
        ? "bg-[#FF5C00] text-white shadow-lg shadow-[#FF5C00]/20 scale-110" 
        : "text-slate-400 group-hover:bg-white/5"
    )}>
      <Icon size={22} />
    </div>
    <span className={cn("text-[10px] font-bold", active ? "text-[#FF5C00]" : "text-slate-400")}>
      {label}
    </span>
  </button>
);

const DispatcherDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(false);
  const [deliveryStep, setDeliveryStep] = useState<'IDLE' | 'ARRIVING' | 'PICKED_UP'>('IDLE');

  const deliveries: Delivery[] = mockDeliveries;
  const stats: DispatcherStats = mockDispatcherStats;
  
  const currentJob = useMemo(() => 
    deliveries.find(d => d.status === 'ACCEPTED' || d.status === 'IN_TRANSIT'),
    [deliveries]
  );

  const handleStepUpdate = () => {
    if (deliveryStep === 'IDLE') setDeliveryStep('ARRIVING');
    else if (deliveryStep === 'ARRIVING') setDeliveryStep('PICKED_UP');
    else setDeliveryStep('IDLE');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A1128] text-white overflow-hidden font-sans">
      
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-[#131B31]/80 backdrop-blur-xl z-20">
        <h1 className="font-display font-black text-xl tracking-tight">
          CAMPUS<span className="text-[#FF5C00]">RUN</span>
        </h1>
        
        <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
          <span className={cn("text-[10px] font-black uppercase tracking-widest", isOnline ? "text-green-400" : "text-slate-400")}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={cn(
              "w-10 h-5 rounded-full relative transition-colors duration-500",
              isOnline ? "bg-green-500" : "bg-white/10"
            )}
          >
            <motion.div 
              animate={{ x: isOnline ? 20 : 2 }}
              className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-xl" 
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          
          {/* RUN TAB */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
              <div className="flex-1 bg-[#0A1128] relative overflow-hidden">
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                   <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
                  {!isOnline ? (
                    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#131B31] p-8 rounded-[2.5rem] text-center border border-white/5 shadow-2xl pointer-events-auto">
                      <div className="w-16 h-16 bg-[#FF5C00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Navigation2 className="text-[#FF5C00] animate-pulse" size={32} />
                      </div>
                      <h2 className="text-xl font-bold mb-2">Ready to earn?</h2>
                      <p className="text-sm text-slate-400 mb-6">Switch to online to see available delivery requests near your location.</p>
                      <Button onClick={() => setIsOnline(true)} className="w-full py-6 rounded-2xl font-bold text-lg bg-[#FF5C00] hover:bg-[#FF7A30] text-white">Go Online</Button>
                    </motion.div>
                  ) : currentJob ? (
                    <motion.div layoutId="active-job" className="bg-[#131B31] p-6 rounded-[2.5rem] border border-[#FF5C00]/20 shadow-2xl pointer-events-auto">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1">
                          <span className="bg-[#FF5C00]/20 text-[#FF5C00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit">Active Task</span>
                          <p className="font-black text-lg mt-1">{currentJob.itemDescription}</p>
                        </div>
                        <div className="flex items-center gap-1 text-green-400 font-bold text-xs bg-green-400/10 px-3 py-1 rounded-full">
                           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                           {deliveryStep === 'IDLE' ? 'Heading to Pickup' : deliveryStep.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="space-y-6 mb-6 relative px-2">
                        <div className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-[#FF5C00] to-green-500 opacity-20" />
                        
                        <div className="flex gap-4 items-center">
                          <div className={cn(
                            "w-4 h-4 rounded-full z-10 transition-colors duration-500 flex items-center justify-center",
                            deliveryStep !== 'IDLE' ? "bg-green-500" : "bg-[#FF5C00]"
                          )}>
                            {deliveryStep !== 'IDLE' && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-400 uppercase font-black">Pick up</p>
                            <p className="font-bold text-sm">{currentJob.pickupLocation}</p>
                          </div>
                          <MapPin size={16} className="text-[#FF5C00]" />
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 border-[#0A1128] z-10",
                            deliveryStep === 'PICKED_UP' ? "bg-green-500" : "bg-white/20"
                          )} />
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-400 uppercase font-black">Drop off</p>
                            <p className="font-bold text-sm">{currentJob.dropoffLocation}</p>
                          </div>
                          <Navigation2 size={16} className="text-slate-400" />
                        </div>
                      </div>

                      <div className="bg-black/20 rounded-3xl p-4 mb-6 border border-white/5 flex flex-col items-center">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Security Handshake Pin</span>
                         <span className="text-4xl font-black text-[#FF5C00] tracking-[0.3em]">{currentJob.pin}</span>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          onClick={handleStepUpdate}
                          className="flex-1 bg-[#FF5C00] hover:bg-[#FF7A30] text-white py-7 rounded-2xl font-black text-md shadow-lg shadow-[#FF5C00]/20"
                        >
                          {deliveryStep === 'IDLE' && "Arrived at Pickup"}
                          {deliveryStep === 'ARRIVING' && "Confirm Pickup"}
                          {deliveryStep === 'PICKED_UP' && "Complete Delivery"}
                        </Button>
                        <Button variant="outline" className="w-16 h-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
                          <MessageSquare size={24} className="text-[#FF5C00]" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-[#FF5C00] p-6 rounded-[2.5rem] flex items-center gap-4 text-white pointer-events-auto shadow-2xl">
                       <div className="bg-white/20 p-4 rounded-2xl animate-bounce">
                        <Package size={28} />
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Scanning Campus...</p>
                         <p className="font-black text-xl">Searching for runs</p>
                       </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black">History</h2>
                  <p className="text-slate-400 text-sm font-medium">Your recent campus runs</p>
                </div>
                <div className="bg-[#131B31] px-4 py-2 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total: </span>
                  <span className="text-sm font-black text-[#FF5C00]">{deliveries.length}</span>
                </div>
              </div>

              <div className="space-y-4">
                {deliveries.filter(d => d.status === 'COMPLETED').map((job, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="bg-[#131B31] p-5 rounded-3xl border border-white/5 flex justify-between items-center"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#FF5C00]">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{job.itemDescription}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin size={10} /> {job.dropoffLocation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#FF5C00] text-lg">₦{job.fee}</p>
                      <p className="text-[10px] text-green-400 font-black uppercase tracking-widest">Success</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <motion.div key="performance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-[#FF5C00] to-[#E65100] p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
                <Wallet className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={160} />
                <p className="text-white/80 text-xs font-black uppercase tracking-[0.2em] mb-1">Total Balance</p>
                <h2 className="text-5xl font-black text-white mb-8">₦{stats.totalEarnings.toLocaleString()}</h2>
                <div className="flex gap-3">
                  <Button className="bg-white text-[#FF5C00] font-black rounded-2xl px-8 py-6 hover:bg-white/90">Withdraw</Button>
                  <Button variant="ghost" className="text-white/80 font-bold hover:text-white">View Details</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Reliability" value={`${stats.reliability}%`} icon={TrendingUp} accent delay={0.1} />
                <StatCard label="Total Tasks" value={stats.completed} icon={Zap} delay={0.2} />
              </div>

              <section className="pt-4">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h3 className="font-black text-xl flex items-center gap-2">
                    <Trophy size={22} className="text-[#FF5C00]" /> 
                    LEADERBOARD
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-3 py-1 rounded-full">Weekly</span>
                </div>
                
                <div className="bg-[#131B31] border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
                  {mockLeaderboard.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm",
                        i === 0 ? "bg-[#FF5C00]/20 text-[#FF5C00]" : "text-slate-500"
                      )}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black">{entry.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{entry.completed} runs completed</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                        <Star size={12} className="text-[#FF5C00] fill-[#FF5C00]" />
                        <span className="text-xs font-black">{entry.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
              <div className="flex flex-col items-center py-10">
                <div className="relative">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-[#FF5C00] to-[#FF7A30] p-1.5 mb-6 rotate-3">
                    <div className="w-full h-full rounded-[2.2rem] bg-[#0A1128] flex items-center justify-center overflow-hidden -rotate-3">
                      <User size={54} className="text-white/20" />
                    </div>
                  </div>
                  <div className="absolute -right-2 bottom-4 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0A1128]" />
                </div>
                
                <h2 className="text-2xl font-black tracking-tight">Adebayo Oluwaseun</h2>
                <div className="flex items-center gap-2 mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                    <ShieldCheck size={14} className="text-[#FF5C00]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80">Verified Campus Runner</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { icon: Settings, label: 'Account Settings', desc: 'Manage your runner profile' },
                  { icon: Wallet, label: 'Payment Methods', desc: 'Withdrawal and bank details' },
                  { icon: LogOut, label: 'Sign Out', danger: true, desc: 'Securely exit your account' },
                ].map((item, i) => (
                  <button key={i} className="w-full bg-[#131B31] p-5 rounded-[2rem] border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-4 text-left">
                      <div className={cn(
                        "p-3 rounded-2xl transition-colors",
                        item.danger ? "bg-red-500/10" : "bg-[#FF5C00]/10"
                      )}>
                        <item.icon size={20} className={item.danger ? 'text-red-500' : 'text-[#FF5C00]'} />
                      </div>
                      <div>
                        <span className={cn("font-black text-sm block", item.danger ? 'text-red-500' : 'text-white')}>{item.label}</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{item.desc}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
              <p className="text-center mt-12 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">CampusRun v2.4.0</p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#131B31]/90 backdrop-blur-3xl border-t border-white/5 px-8 pt-5 pb-10 z-30">
        <div className="flex justify-between items-center max-w-md mx-auto relative">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={MapIcon} label="Run" />
          <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={ClipboardList} label="Tasks" />
          <NavButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} icon={Trophy} label="Rank" />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Me" />
        </div>
      </nav>
    </div>
  );
};

export default DispatcherDashboard;