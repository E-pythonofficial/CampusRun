import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; // Ensure axios is installed
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
import { GoogleMap, useJsApiLoader, Autocomplete, MarkerF, OverlayView } from '@react-google-maps/api';

// --- STYLING CONSTANTS ---
const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 7.636, lng: 4.181 };
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];

// --- CUSTOM MASCOT MARKER COMPONENT ---
const MascotMarker = ({ position, name }: { position: google.maps.LatLngLiteral, name: string }) => (
  <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
    <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} className="relative -translate-x-1/2 -translate-y-1/2">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-lg border border-orange-500/20 whitespace-nowrap">
        <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{name}</p>
      </div>
      <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-500 shadow-xl overflow-hidden flex items-center justify-center">
        <img src="/mascot.png" alt="Dispatcher" className="w-8 h-8 object-contain" />
      </div>
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white mx-auto" />
    </motion.div>
  </OverlayView>
);

const RequesterDashboard = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRun, setActiveRun] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New: Loading state for payment
  const [nearbyDispatchers, setNearbyDispatchers] = useState<any[]>([]);

  // UPDATED: Added Coordinate storage
  const [orderData, setOrderData] = useState({ 
    item: '', 
    pickup: '', 
    pickupCoords: null as google.maps.LatLngLiteral | null,
    dropoff: '', 
    dropoffCoords: null as google.maps.LatLngLiteral | null
  });

  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Replace with your key
    libraries,
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

  const findNearbyDispatchers = (lat: number, lng: number) => {
    setIsSearching(true);
    setNearbyDispatchers([]); 
    setTimeout(() => {
      const mocks = [
        { id: 1, name: "Oluwaseun", lat: lat + 0.0012, lng: lng + 0.0008 },
        { id: 2, name: "David", lat: lat - 0.0009, lng: lng + 0.0015 },
        { id: 3, name: "Aisha", lat: lat + 0.0015, lng: lng - 0.0010 },
      ];
      setNearbyDispatchers(mocks);
      setIsSearching(false);
    }, 1500);
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter(userPos);
        setUserLocation(userPos);
        findNearbyDispatchers(userPos.lat, userPos.lng);
        
        if (window.google) {
          new google.maps.Geocoder().geocode({ location: userPos }, (results, status) => {
            if (status === 'OK' && results?.[0])
              setOrderData(prev => ({ 
                ...prev, 
                pickup: results[0].formatted_address,
                pickupCoords: userPos 
              }));
          });
        }
      },
      (err) => console.error('Location error:', err),
      { enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => {
    setMounted(true);
    requestLocation();
  }, [requestLocation]);

  // UPDATED: Extract Coords for Pickup
  const onPickupPlaceChanged = () => {
    if (!pickupAutocompleteRef.current) return;
    const place = pickupAutocompleteRef.current.getPlace();
    const loc = place.geometry?.location;
    if (loc) {
      const newPos = { lat: loc.lat(), lng: loc.lng() };
      setMapCenter(newPos);
      findNearbyDispatchers(newPos.lat, newPos.lng);
      setOrderData(prev => ({ 
        ...prev, 
        pickup: place.formatted_address ?? '',
        pickupCoords: newPos 
      }));
    }
  };

  // UPDATED: Extract Coords for Dropoff
  const onDropoffPlaceChanged = () => {
    if (!dropoffAutocompleteRef.current) return;
    const place = dropoffAutocompleteRef.current.getPlace();
    const loc = place.geometry?.location;
    if (loc) {
      const newPos = { lat: loc.lat(), lng: loc.lng() };
      setOrderData(prev => ({ 
        ...prev, 
        dropoff: place.formatted_address ?? '',
        dropoffCoords: newPos
      }));
    }
  };

  // NEW: The Paystack Handler
  const handlePayNow = async () => {
    if (!orderData.item || !orderData.pickupCoords || !orderData.dropoffCoords) {
      alert("Please fill in all details and select locations from the dropdown.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post('/api/orders/create', {
        item: orderData.item,
        pickup: {
            address: orderData.pickup,
            lat: orderData.pickupCoords.lat,
            lng: orderData.pickupCoords.lng
        },
        dropoff: {
            address: orderData.dropoff,
            lat: orderData.dropoffCoords.lat,
            lng: orderData.dropoffCoords.lng
        },
        userId: user?.id
      });

      if (response.data.url) {
        window.location.href = response.data.url; // Redirect to Paystack
      }
    } catch (error) {
      console.error("Payment Init Error:", error);
      alert("Failed to start payment. Check your internet or backend.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`h-screen w-full ${themeClass.bg} transition-colors duration-500 overflow-hidden flex flex-col relative font-sans`}>

      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 flex justify-between items-center pointer-events-none">
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
            <p className={`text-[13px] font-bold ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
              {user?.fullName || 'User'}
            </p>
          </div>
          <button onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg backdrop-blur-md">
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* ── MAP AREA ── */}
      <div className="flex-1 z-0 relative">
        {isLoaded && mounted ? (
          <>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={17}
              options={{
                disableDefaultUI: true,
                styles: isDark ? darkMapStyle : [],
              }}
            >
              {userLocation && (
                <MarkerF position={userLocation} icon={{ path: google.maps.SymbolPath.CIRCLE, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2, scale: 8 }} />
              )}

              {isSearching && (
                <OverlayView position={mapCenter} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-500/20 rounded-full animate-ping" />
                  </div>
                </OverlayView>
              )}

              {nearbyDispatchers.map(d => (
                <MascotMarker key={d.id} position={{ lat: d.lat, lng: d.lng }} name={d.name} />
              ))}
            </GoogleMap>

            <AnimatePresence>
              {isSearching && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-32 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 z-50">
                  <Search size={14} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Scanning Region...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${themeClass.bg}`}>
            <p className={`${themeClass.text} opacity-20 text-xs font-black uppercase tracking-widest animate-pulse`}>Loading Maps...</p>
          </div>
        )}
      </div>

      {/* ── FOOTER ACTIONS ── */}
      <div className="absolute bottom-12 left-0 right-0 px-8 z-50">
        {!activeRun && !showOrderPanel && (
          <Button onClick={() => setShowOrderPanel(true)} className="w-full h-16 rounded-2xl text-[11px] font-black tracking-[0.3em] gap-3 bg-orange-600 hover:bg-orange-700 shadow-2xl shadow-orange-900/40 uppercase">
            <Plus size={18} /> New Request
          </Button>
        )}
      </div>

      {/* ── SIDE DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setMenuOpen(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]" 
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm ${themeClass.drawer} z-[210] p-8 shadow-2xl flex flex-col`}
            >
              <div className="flex justify-between items-center mb-12">
                <Logo />
                <button onClick={() => setMenuOpen(false)} className={`${themeClass.text} opacity-50 hover:opacity-100 transition-opacity`}><X size={24} /></button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                <MenuLink icon={User} label="My Profile" onClick={() => navigate('/profile')} isDark={isDark} />
                <MenuLink icon={History} label="Order History" onClick={() => navigate('/my-requests')} isDark={isDark} />
                <MenuLink icon={ShieldCheck} label="Safety Center" onClick={() => navigate('/safety')} isDark={isDark} />
                <MenuLink icon={Settings} label="Preferences" onClick={() => navigate('/preferences')} isDark={isDark} />
                <MenuLink icon={Info} label="Help & Support" onClick={() => navigate('/support')} isDark={isDark} />
              </div>

              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="mt-auto flex items-center gap-4 p-5 rounded-2xl bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-[10px] border border-red-500/5"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── NEW REQUEST PANEL ── */}
      <AnimatePresence>
        {showOrderPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowOrderPanel(false)} className="fixed inset-0 bg-black/40 z-[110] backdrop-blur-sm" />

            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`fixed inset-x-4 bottom-4 z-[120] ${themeClass.card} rounded-[2.5rem] shadow-2xl border ${themeClass.border} max-h-[72vh] flex flex-col`}
            >
              <div className="flex justify-center pt-4 pb-1 shrink-0">
                <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
              </div>

              <div className="flex justify-between items-center px-8 pt-4 pb-2 shrink-0">
                <h2 className={`text-xl font-black italic tracking-tight ${themeClass.text} uppercase`}>New Request</h2>
                <button onClick={() => setShowOrderPanel(false)} className={`${themeClass.subText} hover:text-orange-500`}><X size={22} /></button>
              </div>

              <div className="overflow-y-auto px-8 pb-8 pt-2 space-y-5 flex-1">
                <div className="space-y-2">
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Item Name</label>
                  <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border`}>
                    <input className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`} placeholder="e.g. MTH201 Textbook" value={orderData.item} onChange={e => setOrderData({ ...orderData, item: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Pickup</label>
                  {isLoaded && (
                    <Autocomplete onLoad={ac => (pickupAutocompleteRef.current = ac)} onPlaceChanged={onPickupPlaceChanged}>
                      <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border gap-3`}>
                        <MapPin size={16} className="text-orange-500" />
                        <input className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`} placeholder="Location..." value={orderData.pickup} onChange={e => setOrderData({ ...orderData, pickup: e.target.value })} />
                      </div>
                    </Autocomplete>
                  )}
                </div>

                <div className="space-y-2">
                   <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Dropoff</label>
                   {isLoaded && (
                    <Autocomplete onLoad={ac => (dropoffAutocompleteRef.current = ac)} onPlaceChanged={onDropoffPlaceChanged}>
                      <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border gap-3`}>
                        <Navigation size={16} className="text-green-500" />
                        <input className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`} placeholder="Where to?" value={orderData.dropoff} onChange={e => setOrderData({ ...orderData, dropoff: e.target.value })} />
                      </div>
                    </Autocomplete>
                  )}
                </div>

                <div className="flex items-end justify-between pt-2">
                  <div>
                    <p className={`text-[8px] font-black ${themeClass.subText} uppercase mb-1`}>Status</p>
                    <p className={`text-sm font-black ${themeClass.text} italic uppercase`}>Calculating Fee...</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[8px] font-black ${themeClass.subText} uppercase mb-1`}>Nearby Runners</p>
                    <p className="text-sm font-black text-orange-500 italic uppercase">{nearbyDispatchers.length} Active</p>
                  </div>
                </div>

                <Button 
                    disabled={isProcessing}
                    onClick={handlePayNow} 
                    className="w-full h-14 bg-orange-600 hover:bg-orange-700 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase shadow-xl"
                >
                  {isProcessing ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <>
                        <CreditCard size={17} className="mr-3" /> Pay Now
                    </>
                  )}
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
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-orange-500/5 transition-all group">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'} text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors`}>
        <Icon size={18} />
      </div>
      <span className={`font-bold text-[11px] uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-slate-500'} group-hover:text-orange-500 transition-colors`}>{label}</span>
    </div>
    <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default RequesterDashboard;