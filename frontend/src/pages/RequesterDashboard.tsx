import { useState, useEffect, useCallback, useRef } from 'react';
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
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Autocomplete, MarkerF } from '@react-google-maps/api';

// ─── MAP CONFIGURATION ───────────────────────────────────────────────────────

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 7.636,
  lng: 4.181
};

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] }
];

const RequesterDashboard = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRun, setActiveRun] = useState<any>(null);
  
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [orderData, setOrderData] = useState({
    item: '',
    pickup: '',
    dropoff: '',
    value: ''
  });

  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, 
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const isDark = theme === 'dark';

  const themeClass = {
    bg:      isDark ? 'bg-[#020617]'          : 'bg-[#F8FAFC]',
    card:    isDark ? 'bg-[#0F172A]/95'       : 'bg-white/95',
    input:   isDark ? 'bg-[#161D2F] border-white/5' : 'bg-slate-100 border-slate-200',
    text:    isDark ? 'text-white'            : 'text-slate-900',
    subText: isDark ? 'text-white/40'         : 'text-slate-500',
    border:  isDark ? 'border-white/5'        : 'border-slate-200',
    drawer:  isDark ? 'bg-[#111827]'          : 'bg-[#F1F5F9]',
  };

  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(userPos);
          setUserLocation(userPos);

          if (window.google) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: userPos }, (results, status) => {
              if (status === "OK" && results?.[0]) {
                setOrderData(prev => ({ ...prev, pickup: results[0].formatted_address }));
              }
            });
          }
        },
        (error) => {
          console.error("Error fetching location: ", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    requestLocation();

    const checkStatus = () => {
      const savedRun = localStorage.getItem(`activeRun_${user?.id}`);
      setActiveRun(savedRun ? JSON.parse(savedRun) : null);
    };
    checkStatus();
    window.addEventListener('storage', checkStatus);
    return () => window.removeEventListener('storage', checkStatus);
  }, [user?.id, requestLocation]);

  const onPickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      const location = place.geometry?.location;
      if (location) {
        setMapCenter({ lat: location.lat(), lng: location.lng() });
      }
      setOrderData(prev => ({ ...prev, pickup: place.formatted_address || "" }));
    }
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocompleteRef.current) {
      const place = dropoffAutocompleteRef.current.getPlace();
      setOrderData(prev => ({ ...prev, dropoff: place.formatted_address || "" }));
    }
  };

  const calculateFee = () => {
    const highValueRanges = ['15k-30k', '30k-50k', '50k-100k', '100k-above'];
    return highValueRanges.includes(orderData.value) ? 1300 : 800;
  };

  const handlePayment = () => {
    navigate('/payment-success');
  };

  if (!mounted) return null;

  return (
    <div className={`h-screen w-full ${themeClass.bg} transition-colors duration-500 overflow-hidden flex flex-col relative font-sans`}>
      
      {/* TOP NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 flex justify-between items-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(true)}
            className={`p-4 rounded-2xl ${themeClass.card} backdrop-blur-xl border ${themeClass.border} ${themeClass.text} shadow-2xl`}
          >
            <Menu size={25} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-4 rounded-2xl ${themeClass.card} backdrop-blur-xl border ${themeClass.border} text-orange-500 shadow-2xl`}
          >
            {isDark ? <Sun size={25} /> : <Moon size={25} />}
          </motion.button>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="text-right">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Verified User</p>
            <p className={`text-[13px] font-bold ${isDark ? 'text-white/90' : 'text-slate-900'}`}>
              {user?.fullName || "User"}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-16 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg backdrop-blur-md"
          >
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* MAP BACKGROUND */}
      <div className="flex-1 z-0">
        {isLoaded && mounted ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={16}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: true,
              styles: isDark ? darkMapStyle : [],
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            }}
          >
            {userLocation && (
              <MarkerF
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 8,
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${themeClass.bg}`}>
            <p className={`${themeClass.text} opacity-20 text-xs font-black uppercase tracking-widest animate-pulse`}>
              Loading Maps...
            </p>
          </div>
        )}
      </div>

      {/* DYNAMIC FOOTER ACTIONS */}
      <div className="absolute bottom-12 left-0 right-0 px-8 z-50">
        {activeRun ? (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => navigate('/payment-success')}
            className={`w-full ${themeClass.card} backdrop-blur-2xl border ${isDark ? 'border-orange-500/30' : 'border-orange-500/10'} p-6 rounded-[2.5rem] shadow-2xl cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                  <Package size={24} />
                </div>
                <div>
                  <p className={`text-[9px] font-black ${themeClass.subText} uppercase tracking-widest`}>
                    Ongoing Delivery
                  </p>
                  <p className={`text-sm font-bold ${themeClass.text} italic tracking-tight`}>
                    {activeRun.item}
                  </p>
                </div>
              </div>
              <div className="bg-orange-500/20 text-orange-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter animate-pulse">
                Moving
              </div>
            </div>
            <div className={`flex items-center justify-between pt-5 border-t ${themeClass.border}`}>
              <div className="flex items-center gap-3">
                <img
                  src={activeRun.dispatcher?.avatar}
                  className="w-8 h-8 rounded-full border border-white/10"
                  alt="Runner"
                />
                <span className={`text-[10px] font-bold ${themeClass.subText}`}>
                  {activeRun.dispatcher?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase group-hover:gap-4 transition-all">
                Track Live <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        ) : (
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

      {/* NEW REQUEST MODAL */}
      <AnimatePresence>
        {showOrderPanel && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className={`fixed inset-x-4 bottom-6 z-[120] ${themeClass.card} rounded-[2.5rem] p-8 shadow-2xl border ${themeClass.border}`}
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className={`text-2xl font-black italic tracking-tight ${themeClass.text} uppercase`}>
                New Request
              </h2>
              <button
                onClick={() => setShowOrderPanel(false)}
                className={`${themeClass.subText} hover:text-orange-500 transition-colors`}
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-slate-400'} ml-1`}>
                  Item Name
                </label>
                <div className={`h-16 ${themeClass.input} rounded-2xl flex items-center px-6 border transition-colors`}>
                  <input
                    className={`bg-transparent w-full outline-none ${themeClass.text} font-medium placeholder:${isDark ? 'text-white/20' : 'text-slate-400'} text-sm`}
                    placeholder="e.g. MTH201 Textbook"
                    value={orderData.item}
                    onChange={(e) => setOrderData({ ...orderData, item: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-slate-400'} ml-1`}>
                    Pickup
                  </label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={(autocomplete) => (pickupAutocompleteRef.current = autocomplete)}
                      onPlaceChanged={onPickupPlaceChanged}
                    >
                      <div className={`h-16 ${themeClass.input} rounded-2xl flex items-center px-6 border gap-4 transition-colors`}>
                        <MapPin size={18} className="text-orange-500" />
                        <input
                          className={`bg-transparent w-full outline-none ${themeClass.text} font-medium placeholder:${isDark ? 'text-white/20' : 'text-slate-400'} text-sm`}
                          placeholder="Location..."
                          value={orderData.pickup}
                          onChange={(e) => setOrderData({ ...orderData, pickup: e.target.value })}
                        />
                      </div>
                    </Autocomplete>
                  )}
                </div>

                <div className="space-y-3">
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-slate-400'} ml-1`}>
                    Dropoff
                  </label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={(autocomplete) => (dropoffAutocompleteRef.current = autocomplete)}
                      onPlaceChanged={onDropoffPlaceChanged}
                    >
                      <div className={`h-16 ${themeClass.input} rounded-2xl flex items-center px-6 border gap-4 transition-colors`}>
                        <Navigation size={18} className="text-green-500" />
                        <input
                          className={`bg-transparent w-full outline-none ${themeClass.text} font-medium placeholder:${isDark ? 'text-white/20' : 'text-slate-400'} text-sm`}
                          placeholder="Where to?"
                          value={orderData.dropoff}
                          onChange={(e) => setOrderData({ ...orderData, dropoff: e.target.value })}
                        />
                      </div>
                    </Autocomplete>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-slate-400'} ml-1`}>
                  Item Value
                </label>
                <div className="relative group">
                  <select
                    className={`appearance-none h-16 w-full ${themeClass.input} rounded-2xl px-6 border ${themeClass.text} text-sm font-medium outline-none focus:border-orange-500/50 transition-all cursor-pointer`}
                    value={orderData.value}
                    onChange={(e) => setOrderData({ ...orderData, value: e.target.value })}
                  >
                    <option value="" disabled hidden className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>
                      Select Value Range
                    </option>
                    <option value="below-5k"   className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>Under ₦5,000</option>
                    <option value="5k-15k"      className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>₦5,000 - ₦15,000</option>
                    <option value="15k-30k"    className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>₦15,000 - ₦30,000</option>
                    <option value="30k-50k"    className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>₦30,000 - ₦50,000</option>
                    <option value="50k-100k"   className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>₦50,000 - ₦100,000</option>
                    <option value="100k-above" className={isDark ? 'bg-[#0F172A]' : 'bg-white'}>₦100,000 and Above</option>
                  </select>
                  <div className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none ${themeClass.subText} group-hover:text-orange-500 transition-colors`}>
                    <Plus size={18} />
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between pt-4">
                <div>
                  <p className={`text-[8px] font-black ${themeClass.subText} uppercase tracking-widest mb-1`}>Fee</p>
                  <p className={`text-4xl font-black ${themeClass.text} italic tracking-tighter transition-all`}>
                    ₦{calculateFee().toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-[8px] font-black ${themeClass.subText} uppercase tracking-widest mb-1`}>Est. Time</p>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-[150] backdrop-blur-md"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className={`fixed inset-y-0 left-0 w-80 ${themeClass.drawer} backdrop-blur-xl z-[200] p-10 border-r ${themeClass.border} shadow-2xl transition-colors duration-300`}
            >
              <div className="flex justify-between items-center mb-16">
                
                {/* ── LOGO WRAPPER ── */}
                <div className={`transition-all duration-300 px-4 py-2 rounded-2xl
                  ${isDark 
                    ? 'bg-white/5 ring-1 ring-white/10' 
                    : 'bg-white shadow-sm ring-1 ring-slate-200'
                  }
                  ${!isDark && '[&_span]:!text-slate-900 [&_.text-primary]:!text-orange-500'}
                `}>
                  <Logo />
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className={`p-2 rounded-full hover:bg-white/5 transition-colors ${themeClass.subText}`}
                >
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-3">
                <MenuLink icon={History}     label="My Requests" isDark={isDark} onClick={() => navigate('/my-requests')} />
                <MenuLink icon={User}         label="Profile"     isDark={isDark} onClick={() => navigate('/profile')} />
                <MenuLink icon={ShieldCheck} label="Safety"      isDark={isDark} onClick={() => navigate('/privacysettings')} />
                <MenuLink icon={Info}        label="Support"     isDark={isDark} onClick={() => navigate('/support')} />

                <div className={`my-8 h-px w-full ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />

                <button
                  onClick={() => logout()}
                  className="flex items-center gap-4 text-red-500 hover:text-red-400 font-black text-[13px] uppercase tracking-[0.25em] mt-8 px-5 py-5 border border-red-500/20 hover:border-red-500/40 rounded-2xl w-full bg-red-500/5 transition-all"
                >
                  <LogOut size={24} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuLink = ({ icon: Icon, label, isDark, onClick }: any) => (
  <button
    onClick={onClick}
    className={`group flex items-center gap-4 w-full p-4 rounded-2xl transition-all
      ${isDark 
        ? 'text-slate-100 hover:bg-white/10 hover:text-white' 
        : 'text-slate-700 hover:bg-slate-200/50 hover:text-slate-900'
      }`}
  >
    <div className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-white/5 group-hover:bg-orange-500/20' : 'bg-slate-200 group-hover:bg-orange-500/10'}`}>
      <Icon size={22} className={isDark ? 'text-white' : 'text-slate-800'} />
    </div>
    <span className="font-semibold text-[15px] tracking-tight">
      {label}
    </span>
  </button>
);

export default RequesterDashboard;