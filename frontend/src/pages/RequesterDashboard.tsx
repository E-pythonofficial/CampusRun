import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, History, X, LogOut, 
  MapPin, Navigation, Clock, CreditCard, ChevronRight
} from 'lucide-react';

// Map components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RequesterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [mounted, setMounted] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeRun, setActiveRun] = useState<any>(null);

  const [orderData, setOrderData] = useState({
    item: '',
    pickup: '',
    dropoff: '',
    value: ''
  });

  useEffect(() => { 
    setMounted(true); 
    if (user?.id) {
      const storageKey = `activeRun_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setActiveRun(JSON.parse(saved));
      } else {
        setActiveRun(null);
      }
    }
  }, [user?.id]);

  const bowenLocation: [number, number] = [7.636, 4.181];

  const mockDispatchers = [
    { id: 1, pos: [7.637, 4.182], name: "John (3 mins away)" },
    { id: 2, pos: [7.635, 4.180], name: "Sarah (5 mins away)" },
  ];

  const handlePayment = () => {
    if (!user?.id) return;
    
    const newRun = {
      ...orderData,
      id: `RUN-${Math.floor(Math.random() * 9000) + 1000}`,
      status: 'IN_TRANSIT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dispatcher: "Adebayo O.",
      pin: Math.floor(Math.random() * 9000) + 1000
    };

    localStorage.setItem(`activeRun_${user.id}`, JSON.stringify(newRun));
    navigate('/payment-success');
  };

  return (
    <div className="h-screen w-full bg-[#020617] overflow-hidden flex flex-col relative">
      <style>{`
        .leaflet-container { height: 100%; width: 100%; z-index: 1; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* --- UPDATED NAVBAR: Fixed for Mobile --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex justify-between items-center bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2 shrink-0">
        <Logo size="sm" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            onClick={() => navigate('/my-requests')}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl h-10 px-3 flex items-center gap-2"
          >
            <History size={18} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">My Requests</span>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={logout}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-full h-10 w-10 p-0 flex items-center justify-center"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </nav>

      {/* --- FULL SCREEN MAP --- */}
      <div className="flex-1 z-0 mt-[64px]"> {/* Added margin to prevent map from being under nav */}
        {mounted && (
          <MapContainer center={bowenLocation} zoom={16} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {mockDispatchers.map(d => (
              <Marker key={d.id} position={d.pos as [number, number]}>
                <Popup>{d.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* --- PERSISTENT ACTIVITY CARD --- */}
      {activeRun && !showOrderPanel && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => navigate('/payment-success')}
          className="fixed bottom-32 left-6 right-6 z-[50] max-w-md mx-auto bg-[#0F172A]/95 backdrop-blur-2xl border border-primary/30 p-4 rounded-[2.5rem] flex items-center justify-between cursor-pointer shadow-2xl shadow-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Clock size={20} className="text-primary animate-pulse" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Live Run</h4>
              <p className="text-sm font-bold text-white line-clamp-1">{activeRun.item}</p>
            </div>
          </div>
          <div className="bg-primary px-4 py-2 rounded-2xl flex items-center gap-2">
            <span className="text-[10px] font-black text-white">TRACK</span>
            <ChevronRight size={14} className="text-white" />
          </div>
        </motion.div>
      )}

      {/* --- ACTION BUTTONS --- */}
      <AnimatePresence>
        {!showOrderPanel ? (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="absolute bottom-8 left-0 right-0 z-[40] px-6 flex justify-center"
          >
            <Button 
              onClick={() => setShowOrderPanel(true)}
              disabled={!!activeRun} 
              className={`w-full max-w-md h-16 rounded-[2rem] text-xl font-black italic shadow-2xl gap-3 transition-all ${
                activeRun ? 'bg-white/5 text-white/20 border border-white/5' : 'bg-primary hover:bg-orange-600 text-white shadow-primary/40'
              }`}
            >
              {activeRun ? "DELIVERY IN PROGRESS" : <><Plus size={24} strokeWidth={3} /> START A RUN</>}
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-[110] bg-[#0B0F1A] border-t border-white/10 rounded-t-[3rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto hide-scrollbar"
          >
            <div className="max-w-xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic tracking-tighter text-white">NEW REQUEST</h2>
                <Button variant="ghost" onClick={() => setShowOrderPanel(false)} className="rounded-full text-white/40"><X /></Button>
              </div>

              <div className="space-y-6 pb-12">
                <div className="space-y-2">
                  <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest">Item Name</Label>
                  <Input 
                    placeholder="e.g. MTH201 Textbook" 
                    className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-primary text-white"
                    onChange={(e) => setOrderData({...orderData, item: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest">Pickup</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-primary" size={18} />
                      <Input placeholder="Location..." className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest">Dropoff</Label>
                    <div className="relative">
                      <Navigation className="absolute left-4 top-4 text-green-500" size={18} />
                      <Input placeholder="Where to?" className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <Label className="text-white/40 uppercase text-[10px] font-black tracking-widest">Item Value (Max ₦20k)</Label>
                  <div 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-4 flex items-center justify-between cursor-pointer hover:border-primary/50"
                  >
                    <span className="text-white">{orderData.value || "Select Value Range"}</span>
                    <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }}><Plus size={16} className="text-white/40" /></motion.div>
                  </div>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute z-[120] w-full mt-2 bg-[#161B26] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                      >
                        {['₦0 - ₦2k', '₦2k - ₦5k', '₦5k - ₦8k', '₦8k - ₦12k', '₦12k - ₦15k', '₦15k - ₦20k'].map((range) => (
                          <div key={range} onClick={() => { setOrderData({...orderData, value: range}); setDropdownOpen(false); }}
                            className="px-4 py-3 text-sm text-white/80 hover:bg-primary hover:text-white cursor-pointer transition-colors border-b border-white/5 last:border-0"
                          >
                            {range}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-white/40 text-[10px] font-black uppercase">Fee</p>
                      <p className="text-3xl font-black text-white">₦500</p>
                    </div>
                    <div className="text-right">
                       <p className="text-white/40 text-[10px] font-black uppercase">Est. Time</p>
                       <p className="text-lg font-bold text-primary">8-12 Mins</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayment}
                    className="w-full h-16 bg-primary hover:bg-orange-600 text-white rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-primary/20"
                  >
                    <CreditCard size={20} /> PAY NOW
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

export default RequesterDashboard;