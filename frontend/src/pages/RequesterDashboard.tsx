import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  History,
  X,
  LogOut,
  Menu,
  User,
  ShieldCheck,
  Info,
  ChevronRight,
  MapPin,
  Navigation,
  CreditCard,
  Package,
  ArrowRight
} from 'lucide-react';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RequesterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRun, setActiveRun] = useState<any>(null);

  const [orderData, setOrderData] = useState({
    item: '',
    pickup: '',
    dropoff: '',
    value: ''
  });

  // Check for active delivery status on mount and sync
  useEffect(() => {
    setMounted(true);
    const checkStatus = () => {
      const savedRun = localStorage.getItem(`activeRun_${user?.id}`);
      setActiveRun(savedRun ? JSON.parse(savedRun) : null);
    };
    checkStatus();
    window.addEventListener('storage', checkStatus);
    return () => window.removeEventListener('storage', checkStatus);
  }, [user?.id]);

  // Dynamic fee calculation logic
  const calculateFee = () => {
    const highValueRanges = ['15k-30k', '30k-50k', '50k-100k', '100k-above'];
    return highValueRanges.includes(orderData.value) ? 1300 : 800;
  };

  const handlePayment = () => {
    navigate('/payment-success');
  };

  return (
    <div className="h-screen w-full bg-[#020617] overflow-hidden flex flex-col relative font-sans">
      <style>{`
        .leaflet-container { height: 100%; width: 100%; z-index: 1; }
      `}</style>

      {/* TOP NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 flex justify-between items-center pointer-events-none">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(true)}
          className="p-4 rounded-2xl bg-[#161D2F]/90 backdrop-blur-xl border border-white/5 text-white shadow-2xl pointer-events-auto"
        >
          <Menu size={20} />
        </motion.button>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="text-right">
            <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.2em]">Verified User</p>
            <p className="text-[11px] font-bold text-white/90">{user?.fullName || "Adebayo Oluwaseun"}</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg backdrop-blur-md"
          >
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* MAP BACKGROUND */}
      <div className="flex-1 z-0">
        {mounted && (
          <MapContainer center={[7.636, 4.181]} zoom={16} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          </MapContainer>
        )}
      </div>

      {/* DYNAMIC FOOTER ACTIONS */}
      <div className="absolute bottom-12 left-0 right-0 px-8 z-50">
        {activeRun ? (
          /* LIVE TRACKER CARD (Shows when delivery is active) */
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            onClick={() => navigate('/payment-success')}
            className="w-full bg-[#0F172A]/95 backdrop-blur-2xl border border-orange-500/30 p-6 rounded-[2.5rem] shadow-2xl cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Ongoing Delivery</p>
                  <p className="text-sm font-bold text-white italic tracking-tight">{activeRun.item}</p>
                </div>
              </div>
              <div className="bg-orange-500/20 text-orange-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter animate-pulse">
                Moving
              </div>
            </div>
            <div className="flex items-center justify-between pt-5 border-t border-white/5">
              <div className="flex items-center gap-3">
                <img src={activeRun.dispatcher?.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="Runner" />
                <span className="text-[10px] font-bold text-white/60">{activeRun.dispatcher?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase group-hover:gap-4 transition-all">
                Track Live <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        ) : (
          /* NEW REQUEST BUTTON (Shows when idle) */
          !showOrderPanel && (
            <Button
              onClick={() => setShowOrderPanel(true)}
              className="w-full h-16 rounded-2xl text-[11px] font-black tracking-[0.3em] gap-3 bg-orange-600 hover:bg-orange-700 shadow-2xl shadow-orange-900/40 uppercase"
            >
              <Plus size={18} /> New Request
            </Button>
          )
        )}
      </div>

      {/* NEW REQUEST MODAL (All Fields Preserved) */}
      <AnimatePresence>
        {showOrderPanel && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="fixed inset-x-4 bottom-6 z-[120] bg-[#0F172A] rounded-[2.5rem] p-8 shadow-2xl border border-white/5"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black italic tracking-tight text-white uppercase">New Request</h2>
              <button onClick={() => setShowOrderPanel(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-6">
              {/* ITEM NAME */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Item Name</label>
                <div className="h-16 bg-[#161D2F] rounded-2xl flex items-center px-6 border border-white/5">
                  <input 
                    className="bg-transparent w-full outline-none text-white font-medium placeholder:text-white/20 text-sm"
                    placeholder="e.g. MTH201 Textbook"
                    value={orderData.item}
                    onChange={(e) => setOrderData({...orderData, item: e.target.value})}
                  />
                </div>
              </div>

              {/* PICKUP & DROPOFF */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Pickup</label>
                  <div className="h-16 bg-[#161D2F] rounded-2xl flex items-center px-6 border border-white/5 gap-4">
                    <MapPin size={18} className="text-orange-500" />
                    <input 
                      className="bg-transparent w-full outline-none text-white font-medium placeholder:text-white/20 text-sm" 
                      placeholder="Location..." 
                      value={orderData.pickup}
                      onChange={(e) => setOrderData({...orderData, pickup: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Dropoff</label>
                  <div className="h-16 bg-[#161D2F] rounded-2xl flex items-center px-6 border border-white/5 gap-4">
                    <Navigation size={18} className="text-green-500" />
                    <input 
                      className="bg-transparent w-full outline-none text-white font-medium placeholder:text-white/20 text-sm" 
                      placeholder="Where to?" 
                      value={orderData.dropoff}
                      onChange={(e) => setOrderData({...orderData, dropoff: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* ITEM VALUE */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                  Item Value (₦100k+)
                </label>
                <div className="relative group">
                  <select 
                    className="appearance-none h-16 w-full bg-[#161D2F] rounded-2xl px-6 border border-white/5 text-sm font-medium text-white/90 outline-none focus:border-orange-500/50 transition-all cursor-pointer"
                    value={orderData.value}
                    onChange={(e) => setOrderData({ ...orderData, value: e.target.value })}
                  >
                    <option value="" disabled hidden>Select Value Range</option>
                    <option value="below-5k">Under ₦5,000</option>
                    <option value="5k-15k">₦5,000 - ₦15,000</option>
                    <option value="15k-30k">₦15,000 - ₦30,000</option>
                    <option value="30k-50k">₦30,000 - ₦50,000</option>
                    <option value="50k-100k">₦50,000 - ₦100,000</option>
                    <option value="100k-above">₦100,000 and Above</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-orange-500 transition-colors">
                    <Plus size={18} />
                  </div>
                </div>
              </div>

              {/* PRICE FOOTER */}
              <div className="flex items-end justify-between pt-4">
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Fee</p>
                  <p className="text-4xl font-black text-white italic tracking-tighter transition-all">
                    ₦{calculateFee().toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Est. Time</p>
                  <p className="text-sm font-black text-orange-500 italic uppercase">8-12 Mins</p>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full h-16 bg-orange-600 hover:bg-orange-700 rounded-2xl font-black text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-orange-900/20 uppercase mt-4 transition-all"
              >
                <CreditCard size={18} /> Pay Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDE DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/80 z-[150] backdrop-blur-sm" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-80 bg-[#0F172A] z-[200] p-10 border-r border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-16">
                <Logo />
                <button onClick={() => setMenuOpen(false)} className="text-white/20"><X size={24}/></button>
              </div>
              <div className="space-y-2">
                <MenuLink icon={History} label="My Requests" onClick={() => navigate('/my-requests')} />
                <MenuLink icon={User} label="Profile" onClick={() => navigate('/profile')} />
                <MenuLink icon={ShieldCheck} label="Safety" onClick={() => navigate('/privacysettings')} />
                <MenuLink icon={Info} label="Support" onClick={() => navigate('/support')} />
                <button onClick={() => logout()} className="flex items-center gap-4 text-red-500/50 font-black text-[9px] uppercase tracking-[0.2em] mt-12 px-4 py-4 border border-red-500/10 rounded-2xl w-full">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuLink = ({ icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center justify-between py-6 w-full border-b border-white/5 group transition-all text-left">
    <div className="flex items-center gap-5">
      <div className="text-white/10 group-hover:text-orange-500 transition-colors"><Icon size={20} /></div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white">{label}</span>
    </div>
    <ChevronRight size={14} className="text-white/5 group-hover:text-white/20" />
  </button>
);

export default RequesterDashboard;