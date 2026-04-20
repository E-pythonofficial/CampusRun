import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
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
  Sun,
  Moon,
  Search,
  Settings,
  Loader2
} from 'lucide-react';

// --- LEAFLET & MAPTILER IMPORTS ---
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- CUSTOM MASCOT MARKER LOGIC ---
const createMascotIcon = (name: string) => L.divIcon({
  className: 'custom-mascot-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
      <div style="background: white; padding: 2px 8px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #f97316; white-space: nowrap; margin-bottom: 4px;">
        <p style="font-size: 9px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase;">${name}</p>
      </div>
      <div style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid white; background: #f97316; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 15px rgba(249, 115, 22, 0.3);">
        <img src="/mascot.png" style="width: 30px; height: 30px; object-fit: contain;" />
      </div>
    </div>
  `,
  iconSize: [0, 0],
});

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 17);
  }, [center, map]);
  return null;
};

const defaultCenter: [number, number] = [7.636, 4.181];

const RequesterDashboard = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRun, setActiveRun] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nearbyDispatchers, setNearbyDispatchers] = useState<any[]>([]);

  // Suggestion States
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff' | null>(null);

  const [orderData, setOrderData] = useState({ 
    item: '', 
    pickup: '', 
    pickupCoords: null as { lat: number, lng: number } | null,
    dropoff: '', 
    dropoffCoords: null as { lat: number, lng: number } | null
  });

  const isDark = theme === 'dark';

  const themeClass = {
    bg: isDark ? 'bg-[#020617]' : 'bg-[#F8FAFC]',
    card: isDark ? 'bg-[#0F172A]/95' : 'bg-white/95',
    input: isDark ? 'bg-[#161D2F] border-white/5' : 'bg-slate-100 border-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900',
    subText: isDark ? 'text-white/40' : 'text-slate-500',
    border: isDark ? 'border-white/5' : 'border-slate-200',
    drawer: isDark ? 'bg-[#020617]' : 'bg-white',
  };

  // --- LOCATIONIQ AUTOCOMPLETE ---
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`https://us1.locationiq.com/v1/autocomplete.php`, {
        params: {
          key: import.meta.env.VITE_LOCATIONIQ_API_KEY,
          q: query,
          format: 'json',
        }
      });
      setSuggestions(res.data);
    } catch (err) {
      console.error("Autocomplete error", err);
    }
  };

  const findNearbyDispatchers = (lat: number, lng: number) => {
    setIsSearching(true);
    setNearbyDispatchers([]); 
    setTimeout(() => {
      setNearbyDispatchers([
        { id: 1, name: "Oluwaseun", lat: lat + 0.0012, lng: lng + 0.0008 },
        { id: 2, name: "David", lat: lat - 0.0009, lng: lng + 0.0015 },
        { id: 3, name: "Aisha", lat: lat + 0.0015, lng: lng - 0.0010 },
      ]);
      setIsSearching(false);
    }, 1500);
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(userPos);
        setUserLocation(userPos);
        findNearbyDispatchers(userPos[0], userPos[1]);
        
        try {
          const res = await axios.get(`https://us1.locationiq.com/v1/reverse`, {
            params: {
              key: import.meta.env.VITE_LOCATIONIQ_API_KEY,
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              format: 'json'
            }
          });
          setOrderData(prev => ({ 
            ...prev, 
            pickup: res.data.display_name,
            pickupCoords: { lat: pos.coords.latitude, lng: pos.coords.longitude } 
          }));
        } catch (err) { console.error("Reverse geocoding error", err); }
      },
      (err) => console.error('Location error:', err),
      { enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => {
    setMounted(true);
    requestLocation();
  }, [requestLocation]);

  const handlePayNow = async () => {
    if (!orderData.item || !orderData.pickupCoords || !orderData.dropoffCoords) {
      alert("Please select a valid location from the suggestions.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post('/api/orders/create', {
        item: orderData.item,
        pickup: { address: orderData.pickup, ...orderData.pickupCoords },
        dropoff: { address: orderData.dropoff, ...orderData.dropoffCoords },
        userId: user?.id
      });
      if (response.data.url) window.location.href = response.data.url;
    } catch (error) {
      alert("Failed to start payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`h-screen w-full ${themeClass.bg} overflow-hidden flex flex-col relative font-sans`}>

      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] px-6 py-8 flex justify-between items-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMenuOpen(true)}
            className={`p-4 rounded-2xl ${themeClass.card} backdrop-blur-xl border ${themeClass.border} ${themeClass.text} shadow-2xl`}>
            <Menu size={25} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme}
            className={`p-4 rounded-2xl ${themeClass.card} backdrop-blur-xl border ${themeClass.border} text-orange-500 shadow-2xl`}>
            {isDark ? <Sun size={25} /> : <Moon size={25} />}
          </motion.button>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="text-right">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Verified User</p>
            <p className={`text-[13px] font-bold ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{user?.fullName || 'User'}</p>
          </div>
          <button onClick={() => navigate('/profile')} className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg backdrop-blur-md">
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* ── MAP AREA ── */}
      <div className="flex-1 z-0 relative">
        <MapContainer center={mapCenter} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url={`https://api.maptiler.com/maps/${isDark ? 'streets-v2-dark' : 'streets-v2'}/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
            attribution='&copy; MapTiler'
          />
          <MapController center={mapCenter} />
          {userLocation && <Marker position={userLocation} />}
          {nearbyDispatchers.map(d => (
            <Marker key={d.id} position={[d.lat, d.lng]} icon={createMascotIcon(d.name)} />
          ))}
        </MapContainer>
        <AnimatePresence>
          {isSearching && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-32 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 z-[1001]">
              <Search size={14} className="animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest">Scanning...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 left-0 right-0 px-8 z-[500]">
        {!activeRun && !showOrderPanel && (
          <Button onClick={() => setShowOrderPanel(true)} className="w-full h-16 rounded-2xl text-[11px] font-black tracking-[0.3em] bg-orange-600 hover:bg-orange-700 shadow-2xl uppercase">
            <Plus size={18} className="mr-2" /> New Request
          </Button>
        )}
      </div>

      {/* ── NEW REQUEST PANEL ── */}
      <AnimatePresence>
        {showOrderPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderPanel(false)} className="fixed inset-0 bg-black/40 z-[1100] backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className={`fixed inset-x-4 bottom-4 z-[1200] ${themeClass.card} rounded-[2.5rem] shadow-2xl border ${themeClass.border} max-h-[72vh] flex flex-col`}>
              <div className="flex justify-center pt-4 pb-1"><div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} /></div>
              
              <div className="overflow-y-auto px-8 pb-8 pt-4 space-y-5 flex-1">
                <h2 className={`text-xl font-black italic tracking-tight ${themeClass.text} uppercase mb-4`}>New Request</h2>
                
                {/* Item Input */}
                <div className="space-y-2">
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Item Name</label>
                  <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border`}>
                    <input className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`} placeholder="What are we picking up?" value={orderData.item} onChange={e => setOrderData({ ...orderData, item: e.target.value })} />
                  </div>
                </div>

                {/* Pickup with Suggestions */}
                <div className="space-y-2 relative">
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Pickup</label>
                  <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border gap-3`}>
                    <MapPin size={16} className="text-orange-500" />
                    <input 
                      className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`} 
                      placeholder="Start typing location..." 
                      value={orderData.pickup} 
                      onChange={e => {
                        setOrderData({ ...orderData, pickup: e.target.value });
                        setActiveInput('pickup');
                        fetchSuggestions(e.target.value);
                      }} 
                    />
                  </div>
                  {activeInput === 'pickup' && suggestions.length > 0 && (
                    <div className={`absolute left-0 right-0 top-full mt-2 z-[1300] rounded-2xl border ${themeClass.border} ${themeClass.card} shadow-2xl overflow-hidden`}>
                      {suggestions.map((s, i) => (
                        <button key={i} className={`w-full text-left px-5 py-3 text-xs ${themeClass.text} hover:bg-orange-500/10 border-b ${themeClass.border} last:border-0`}
                          onClick={() => {
                            const coords = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) };
                            setOrderData({ ...orderData, pickup: s.display_name, pickupCoords: coords });
                            setMapCenter([coords.lat, coords.lng]);
                            setSuggestions([]);
                            setActiveInput(null);
                            findNearbyDispatchers(coords.lat, coords.lng);
                          }}>
                          {s.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropoff with Suggestions */}
                <div className="space-y-2 relative">
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Dropoff</label>
                  <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border gap-3`}>
                    <Navigation size={16} className="text-green-500" />
                    <input 
                      className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`} 
                      placeholder="Where to?" 
                      value={orderData.dropoff} 
                      onChange={e => {
                        setOrderData({ ...orderData, dropoff: e.target.value });
                        setActiveInput('dropoff');
                        fetchSuggestions(e.target.value);
                      }} 
                    />
                  </div>
                  {activeInput === 'dropoff' && suggestions.length > 0 && (
                    <div className={`absolute left-0 right-0 top-full mt-2 z-[1300] rounded-2xl border ${themeClass.border} ${themeClass.card} shadow-2xl overflow-hidden`}>
                      {suggestions.map((s, i) => (
                        <button key={i} className={`w-full text-left px-5 py-3 text-xs ${themeClass.text} hover:bg-orange-500/10 border-b ${themeClass.border} last:border-0`}
                          onClick={() => {
                            const coords = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) };
                            setOrderData({ ...orderData, dropoff: s.display_name, dropoffCoords: coords });
                            setSuggestions([]);
                            setActiveInput(null);
                          }}>
                          {s.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button disabled={isProcessing} onClick={handlePayNow} className="w-full h-14 bg-orange-600 hover:bg-orange-700 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase shadow-xl mt-4">
                  {isProcessing ? <Loader2 size={17} className="animate-spin" /> : <><CreditCard size={17} className="mr-3" /> Pay Now</>}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuLink = ({ icon: Icon, label, onClick, isDark }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-orange-500/5 group">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'} text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors`}>
        <Icon size={18} />
      </div>
      <span className={`font-bold text-[11px] uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-slate-500'} group-hover:text-orange-500`}>{label}</span>
    </div>
    <ChevronRight size={16} className="text-slate-500" />
  </button>
);

export default RequesterDashboard;