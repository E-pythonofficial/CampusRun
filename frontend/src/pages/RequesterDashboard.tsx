// FRONTEND: pages/RequesterDashboard.tsx
// ✅ Typing in pickup/dropoff now searches campus POIs AND Nominatim simultaneously
// ✅ Campus POI results appear at the top of the dropdown (instant, no network)
// ✅ Each POI marker on the map shows its correct category emoji icon
// ✅ Location fix — helpers outside component, proper error handling & fallback
// ✅ Active run banner + runner static pin
// ✅ "📍 Campus Location" button still available as a browse-all shortcut

import { campusPOIs, POI, searchPOIs, categoryIcons } from '@/data/campusPOI';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Plus, History, X, LogOut, Menu, User, ShieldCheck,
  Info, ChevronRight, MapPin, Navigation, CreditCard,
  Sun, Moon, Search, Settings, Loader2, Package, AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

// ─── Map icons ────────────────────────────────────────────────────────────────
const userDotIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const runnerPinIcon = (name: string) => L.divIcon({
  className: '',
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)">
      <div style="background:white;padding:2px 6px;border-radius:6px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;color:#0f172a;border:1px solid rgba(249,115,22,0.3);white-space:nowrap;margin-bottom:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15)">${name}</div>
      <div style="width:36px;height:36px;background:#f97316;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(249,115,22,0.4)">
        <img src="/mascot.png" style="width:26px;height:26px;object-fit:contain" onerror="this.style.display='none'" />
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid white;margin-top:-1px"></div>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 42],
});

// ✅ Each POI gets its own emoji based on category
const makePOIIcon = (emoji: string) => L.divIcon({
  className: '',
  html: `<div style="font-size:20px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));cursor:pointer">${emoji}</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// ─── Constants ────────────────────────────────────────────────────────────────
const MAPTILER_KEY   = import.meta.env.VITE_MAPTILER_KEY;
const TILE_URL_LIGHT = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
const TILE_URL_DARK  = `https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const defaultCenter: [number, number] = [7.6212, 4.1906]; // Bowen Main Gate

// ─── Pure helpers outside component (no stale closures) ──────────────────────
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res  = await fetch(`${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    return data.display_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=4&countrycodes=ng&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface NominatimResult {
  place_id:     number;
  display_name: string;
  lat:          string;
  lon:          string;
}

// Combined suggestion — either a campus POI or a Nominatim result
type Suggestion =
  | { kind: 'poi';       poi: POI }
  | { kind: 'nominatim'; result: NominatimResult };

// ─── Map helpers ──────────────────────────────────────────────────────────────
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ─── Fare ─────────────────────────────────────────────────────────────────────
function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371000, rad = (d: number) => d * Math.PI / 180;
  const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
  const x = Math.sin(dLat/2)**2 + Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
const BASE_AMOUNT = 400, RATE_PER_METER = 0.2, COMPANY_CUT = 0.25;
function calculateFare(pickup: [number,number], dropoff: [number,number]) {
  const d = haversineDistance(pickup, dropoff);
  const u = Math.round(BASE_AMOUNT + d * RATE_PER_METER);
  const c = Math.round(u * COMPANY_CUT);
  return { distanceMeters: Math.round(d), userPays: u, companyRevenue: c, runnerGets: u - c };
}
type Fare = ReturnType<typeof calculateFare>;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const RequesterDashboard = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [mounted, setMounted]               = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [menuOpen, setMenuOpen]             = useState(false);
  const [mapCenter, setMapCenter]           = useState<[number,number]>(defaultCenter);
  const [userLocation, setUserLocation]     = useState<[number,number] | null>(null);
  const [locationError, setLocationError]   = useState<string | null>(null);
  const [isSearching, setIsSearching]       = useState(false);
  const [isProcessing, setIsProcessing]     = useState(false);
  const [nearbyDispatchers, setNearbyDispatchers] = useState<any[]>([]);
  const [activeRun, setActiveRun]           = useState<any>(null);

  const [orderData, setOrderData] = useState({
    item: '', pickup: '', pickupCoords: null as [number,number]|null,
    dropoff: '', dropoffCoords: null as [number,number]|null,
  });
  const [fare, setFare] = useState<Fare|null>(null);

  // ── Unified suggestion state for pickup & dropoff ──────────────────────────
  const [pickupQuery, setPickupQuery]           = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([]);
  const [dropoffQuery, setDropoffQuery]         = useState('');
  const [dropoffSuggestions, setDropoffSuggestions] = useState<Suggestion[]>([]);
  const [focusedField, setFocusedField]         = useState<'pickup'|'dropoff'|null>(null);

  // POI browse panel (tap "📍 Campus Location" to see all)
  const [poiQuery, setPoiQuery]     = useState('');
  const [poiResults, setPoiResults] = useState<POI[]>([]);
  const [poiTarget, setPoiTarget]   = useState<'pickup'|'dropoff'|null>(null);

  const debouncedPickup  = useDebounce(pickupQuery, 350);
  const debouncedDropoff = useDebounce(dropoffQuery, 350);
  const debouncedPOI     = useDebounce(poiQuery, 200);

  const isDark = theme === 'dark';
  const themeClass = {
    bg:       isDark ? 'bg-[#020617]'                : 'bg-[#F8FAFC]',
    card:     isDark ? 'bg-[#0F172A]/95'             : 'bg-white/95',
    input:    isDark ? 'bg-[#161D2F] border-white/5' : 'bg-slate-100 border-slate-200',
    text:     isDark ? 'text-white'                  : 'text-slate-900',
    subText:  isDark ? 'text-white/40'               : 'text-slate-500',
    border:   isDark ? 'border-white/5'              : 'border-slate-200',
    drawer:   isDark ? 'bg-[#020617]'                : 'bg-white',
    dropdown: isDark ? 'bg-[#0F172A] border-white/10': 'bg-white border-slate-200',
  };

  // ── Active run ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem(`activeRun_${user?.id}`);
    if (s) { try { setActiveRun(JSON.parse(s)); } catch {} }
  }, [user?.id]);

  // ── Fare ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (orderData.pickupCoords && orderData.dropoffCoords)
      setFare(calculateFare(orderData.pickupCoords, orderData.dropoffCoords));
    else setFare(null);
  }, [orderData.pickupCoords, orderData.dropoffCoords]);

  // ── POI browse panel search ────────────────────────────────────────────────
  useEffect(() => {
    setPoiResults(debouncedPOI.length >= 2 ? searchPOIs(debouncedPOI) : campusPOIs.slice(0, 8));
  }, [debouncedPOI, poiTarget]);

  // ── UNIFIED suggestions for PICKUP field ──────────────────────────────────
  // Campus POIs shown instantly; Nominatim fetched async; merged together
  useEffect(() => {
    if (focusedField !== 'pickup') { setPickupSuggestions([]); return; }
    if (debouncedPickup.length < 2) { setPickupSuggestions([]); return; }

    // Instant campus POI matches
    const poiMatches: Suggestion[] = searchPOIs(debouncedPickup)
      .slice(0, 4)
      .map(poi => ({ kind: 'poi', poi }));

    setPickupSuggestions(poiMatches); // show POIs immediately

    // Then fetch Nominatim and append
    if (debouncedPickup.length >= 3) {
      searchNominatim(debouncedPickup).then(results => {
        const nominatimSuggestions: Suggestion[] = results.map(r => ({ kind: 'nominatim', result: r }));
        setPickupSuggestions([...poiMatches, ...nominatimSuggestions]);
      });
    }
  }, [debouncedPickup, focusedField]);

  // ── UNIFIED suggestions for DROPOFF field ─────────────────────────────────
  useEffect(() => {
    if (focusedField !== 'dropoff') { setDropoffSuggestions([]); return; }
    if (debouncedDropoff.length < 2) { setDropoffSuggestions([]); return; }

    const poiMatches: Suggestion[] = searchPOIs(debouncedDropoff)
      .slice(0, 4)
      .map(poi => ({ kind: 'poi', poi }));

    setDropoffSuggestions(poiMatches);

    if (debouncedDropoff.length >= 3) {
      searchNominatim(debouncedDropoff).then(results => {
        const nominatimSuggestions: Suggestion[] = results.map(r => ({ kind: 'nominatim', result: r }));
        setDropoffSuggestions([...poiMatches, ...nominatimSuggestions]);
      });
    }
  }, [debouncedDropoff, focusedField]);

  // ── Mock dispatchers ───────────────────────────────────────────────────────
  const findNearbyDispatchers = (lat: number, lng: number) => {
    setIsSearching(true);
    setNearbyDispatchers([]);
    setTimeout(() => {
      setNearbyDispatchers([
        { id: 1, name: 'Oluwaseun', lat: lat + 0.0012, lng: lng + 0.0008 },
        { id: 2, name: 'David',     lat: lat - 0.0009, lng: lng + 0.0015 },
        { id: 3, name: 'Aisha',     lat: lat + 0.0015, lng: lng - 0.0010 },
      ]);
      setIsSearching(false);
    }, 1500);
  };

  // ── GPS location ───────────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationError(null);
        const loc: [number,number] = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(loc);
        setUserLocation(loc);
        findNearbyDispatchers(loc[0], loc[1]);
        const address = await reverseGeocode(loc[0], loc[1]);
        setPickupQuery(address);
        setOrderData(prev => ({ ...prev, pickup: address, pickupCoords: loc }));
      },
      (err) => {
        console.error('Location error:', err);
        if (err.code === 1) setLocationError('Location access denied. Showing Bowen University. Search manually.');
        else if (err.code === 2) setLocationError('Could not detect position. Check GPS or search manually.');
        else setLocationError('Location timed out. Showing default location.');
        findNearbyDispatchers(defaultCenter[0], defaultCenter[1]);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => { setMounted(true); requestLocation(); }, [requestLocation]);

  // ── Select a suggestion from the unified dropdown ─────────────────────────
  const applySuggestion = (s: Suggestion, field: 'pickup' | 'dropoff') => {
    let coords: [number,number];
    let label: string;

    if (s.kind === 'poi') {
      coords = [s.poi.lat, s.poi.lng];
      label  = s.poi.name;
    } else {
      coords = [parseFloat(s.result.lat), parseFloat(s.result.lon)];
      label  = s.result.display_name;
    }

    if (field === 'pickup') {
      setPickupQuery(label);
      setOrderData(prev => ({ ...prev, pickup: label, pickupCoords: coords }));
      setPickupSuggestions([]);
      findNearbyDispatchers(coords[0], coords[1]);
    } else {
      setDropoffQuery(label);
      setOrderData(prev => ({ ...prev, dropoff: label, dropoffCoords: coords }));
      setDropoffSuggestions([]);
    }
    setMapCenter(coords);
    setFocusedField(null);
  };

  // ── Select from POI browse panel ───────────────────────────────────────────
  const selectPOI = (poi: POI, field: 'pickup' | 'dropoff') => {
    applySuggestion({ kind: 'poi', poi }, field);
    setPoiQuery('');
    setPoiTarget(null);
  };

  // ── Pay now ────────────────────────────────────────────────────────────────
  const handlePayNow = async () => {
    if (!orderData.item || !orderData.pickupCoords || !orderData.dropoffCoords || !fare) {
      alert('Please fill in all details and select locations.');
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('campusrun_token');
      const res   = await axios.post('/api/orders/create', {
        item:    orderData.item,
        pickup:  { address: orderData.pickup,  lat: orderData.pickupCoords[0],  lng: orderData.pickupCoords[1] },
        dropoff: { address: orderData.dropoff, lat: orderData.dropoffCoords[0], lng: orderData.dropoffCoords[1] },
        userId:  user?.id,
        fare:    { distanceMeters: fare.distanceMeters, userPays: fare.userPays, runnerGets: fare.runnerGets, companyRevenue: fare.companyRevenue },
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.url) window.location.href = res.data.url;
    } catch {
      alert('Failed to start payment. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const distanceLabel = fare
    ? fare.distanceMeters >= 1000 ? `${(fare.distanceMeters/1000).toFixed(1)} km` : `${fare.distanceMeters} m`
    : '—';
  const fareLabel = fare ? `₦${fare.userPays.toLocaleString()}` : 'Select locations';

  // ── Render suggestion row ─────────────────────────────────────────────────
  const SuggestionRow = ({ s, onSelect, accent }: { s: Suggestion; onSelect: () => void; accent: string }) => {
    const isPOI = s.kind === 'poi';
    const icon  = isPOI ? categoryIcons[s.poi.category] : '🌍';
    const label = isPOI ? s.poi.name : s.result.display_name;
    const sub   = isPOI ? s.poi.description : 'External location';
    return (
      <li
        onMouseDown={onSelect}
        className={`px-4 py-3 text-xs ${themeClass.text} cursor-pointer hover:bg-${accent}-500/10 border-b last:border-b-0 ${themeClass.border} flex items-start gap-3`}
      >
        <span className="text-base shrink-0 mt-0.5">{icon}</span>
        <div className="min-w-0">
          <p className="font-bold line-clamp-1">{label}</p>
          <p className={`text-[9px] ${themeClass.subText} line-clamp-1 mt-0.5`}>{sub}</p>
        </div>
        {isPOI && (
          <span className="ml-auto shrink-0 text-[8px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
            Campus
          </span>
        )}
      </li>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
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
            <p className={`text-[13px] font-bold ${isDark ? 'text-white/90' : 'text-slate-900'}`}>{user?.fullName || 'User'}</p>
          </div>
          <button onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg backdrop-blur-md">
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* ── LOCATION ERROR BANNER ── */}
      <AnimatePresence>
        {locationError && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-28 left-4 right-4 z-[150] bg-amber-500/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-black uppercase tracking-wider mb-0.5">Location Notice</p>
              <p className="text-[10px] leading-relaxed opacity-90">{locationError}</p>
            </div>
            <button onClick={() => setLocationError(null)} className="opacity-70 hover:opacity-100"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAP ── */}
      <div className="flex-1 z-0 relative">
        {mounted ? (
          <>
            <MapContainer center={mapCenter} zoom={17} style={{ width: '100%', height: '100%' }} zoomControl={false} attributionControl={false}>
              <TileLayer url={isDark ? TILE_URL_DARK : TILE_URL_LIGHT} tileSize={512} zoomOffset={-1} maxZoom={22} />
              <MapController center={mapCenter} />

              {userLocation && (
                <Marker position={userLocation} icon={userDotIcon}><Popup>You are here</Popup></Marker>
              )}

              {!activeRun && nearbyDispatchers.map(d => (
                <Marker key={d.id} position={[d.lat, d.lng]} icon={runnerPinIcon(d.name)}>
                  <Popup>{d.name} — Runner</Popup>
                </Marker>
              ))}

              {activeRun && (
                <Marker
                  position={[(userLocation ?? defaultCenter)[0] + 0.001, (userLocation ?? defaultCenter)[1] + 0.001]}
                  icon={runnerPinIcon(activeRun.dispatcher?.name ?? 'Runner')}
                >
                  <Popup>{activeRun.dispatcher?.name} — Your Runner</Popup>
                </Marker>
              )}

              {/* ✅ Each POI uses its category emoji icon */}
              {campusPOIs.map((poi, i) => (
                <Marker
                  key={`${poi.id}-${i}`}
                  position={[poi.lat, poi.lng]}
                  icon={makePOIIcon(categoryIcons[poi.category])}
                >
                  <Popup>
                    <div style={{ minWidth: '140px' }}>
                      <p style={{ fontWeight: 900, fontSize: '12px', marginBottom: '2px' }}>
                        {categoryIcons[poi.category]} {poi.name}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{poi.description}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            <AnimatePresence>
              {isSearching && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-32 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 z-50 pointer-events-none">
                  <Search size={14} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Scanning Region...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {locationError && !userLocation && (
              <button onClick={requestLocation}
                className="absolute bottom-32 right-4 z-50 bg-white shadow-xl rounded-2xl px-4 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-700">
                <MapPin size={14} className="text-orange-500" /> Retry Location
              </button>
            )}
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${themeClass.bg}`}>
            <p className={`${themeClass.text} opacity-20 text-xs font-black uppercase tracking-widest animate-pulse`}>Loading Map...</p>
          </div>
        )}
      </div>

      {/* ── ACTIVE RUN BANNER ── */}
      <AnimatePresence>
        {activeRun && !showOrderPanel && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-12 left-4 right-4 z-50">
            <button onClick={() => navigate('/payment-success')}
              className="w-full bg-orange-600 rounded-[1.5rem] px-6 py-4 flex items-center justify-between shadow-2xl shadow-orange-900/40 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">Active Run</p>
                  <p className="text-sm font-black">{activeRun.dispatcher?.name} · En Route</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package size={16} className="opacity-70" />
                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Track</span>
                <ChevronRight size={16} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW REQUEST BUTTON ── */}
      {!activeRun && !showOrderPanel && (
        <div className="absolute bottom-12 left-0 right-0 px-8 z-50">
          <Button onClick={() => setShowOrderPanel(true)}
            className="w-full h-16 rounded-2xl text-[11px] font-black tracking-[0.3em] gap-3 bg-orange-600 hover:bg-orange-700 shadow-2xl shadow-orange-900/40 uppercase">
            <Plus size={18} /> New Request
          </Button>
        </div>
      )}

      {/* ── SIDE DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm ${themeClass.drawer} z-[210] p-8 shadow-2xl flex flex-col`}>
              <div className="flex justify-between items-center mb-12">
                <Logo />
                <button onClick={() => setMenuOpen(false)} className={`${themeClass.text} opacity-50 hover:opacity-100`}><X size={24} /></button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto">
                <MenuLink icon={User}        label="My Profile"     onClick={() => navigate('/profile')}     isDark={isDark} />
                <MenuLink icon={History}     label="Order History"  onClick={() => navigate('/my-requests')} isDark={isDark} />
                <MenuLink icon={ShieldCheck} label="Safety Center"  onClick={() => navigate('/safety')}      isDark={isDark} />
                <MenuLink icon={Settings}    label="Preferences"    onClick={() => navigate('/preferences')} isDark={isDark} />
                <MenuLink icon={Info}        label="Help & Support" onClick={() => navigate('/support')}     isDark={isDark} />
              </div>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="mt-auto flex items-center gap-4 p-5 rounded-2xl bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-[10px] border border-red-500/5">
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
              className={`fixed inset-x-4 bottom-4 z-[120] ${themeClass.card} rounded-[2.5rem] shadow-2xl border ${themeClass.border} max-h-[82vh] flex flex-col`}>

              <div className="flex justify-center pt-4 pb-1 shrink-0">
                <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
              </div>
              <div className="flex justify-between items-center px-8 pt-4 pb-2 shrink-0">
                <h2 className={`text-xl font-black italic tracking-tight ${themeClass.text} uppercase`}>New Request</h2>
                <button onClick={() => setShowOrderPanel(false)} className={`${themeClass.subText} hover:text-orange-500`}><X size={22} /></button>
              </div>

              <div className="overflow-y-auto px-8 pb-8 pt-2 space-y-5 flex-1">

                {/* Item */}
                <div className="space-y-2">
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Item Name</label>
                  <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border`}>
                    <input className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`}
                      placeholder="e.g. MTH201 Textbook" value={orderData.item}
                      onChange={e => setOrderData({ ...orderData, item: e.target.value })} />
                  </div>
                </div>

                {/* ── PICKUP ── */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Pickup</label>
                    <button onClick={() => setPoiTarget(poiTarget === 'pickup' ? null : 'pickup')}
                      className="text-[9px] font-black uppercase tracking-widest text-orange-500 hover:opacity-70">
                      Browse Campus 📍
                    </button>
                  </div>
                  <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border gap-3`}>
                    <MapPin size={16} className="text-orange-500 shrink-0" />
                    <input className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`}
                      placeholder="Type any location or campus building..."
                      value={pickupQuery}
                      onChange={e => { setPickupQuery(e.target.value); setFocusedField('pickup'); }}
                      onFocus={() => setFocusedField('pickup')}
                      onBlur={() => setTimeout(() => setFocusedField(null), 150)}
                    />
                  </div>

                  {/* Unified dropdown */}
                  <AnimatePresence>
                    {focusedField === 'pickup' && pickupSuggestions.length > 0 && (
                      <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`absolute top-full left-0 right-0 mt-1 rounded-2xl border ${themeClass.dropdown} shadow-2xl z-[300] overflow-hidden max-h-64 overflow-y-auto`}>
                        {pickupSuggestions.map((s, i) => (
                          <SuggestionRow key={i} s={s} accent="orange"
                            onSelect={() => applySuggestion(s, 'pickup')} />
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  {/* Browse campus panel */}
                  {poiTarget === 'pickup' && (
                    <div className={`rounded-2xl border ${themeClass.dropdown} p-3 space-y-1 max-h-48 overflow-y-auto`}>
                      <input className={`w-full bg-transparent text-xs outline-none ${themeClass.text} px-3 py-2 rounded-xl border ${themeClass.border} mb-1`}
                        placeholder="Search campus..." value={poiQuery} onChange={e => setPoiQuery(e.target.value)} autoFocus />
                      {poiResults.map((p, i) => (
                        <button key={i} onMouseDown={() => selectPOI(p, 'pickup')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs ${themeClass.text} hover:bg-orange-500/10 flex items-center gap-2`}>
                          <span>{categoryIcons[p.category]}</span>
                          <div><p className="font-bold">{p.name}</p><p className={`text-[9px] ${themeClass.subText}`}>{p.description}</p></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── DROPOFF ── */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-400'}`}>Dropoff</label>
                    <button onClick={() => setPoiTarget(poiTarget === 'dropoff' ? null : 'dropoff')}
                      className="text-[9px] font-black uppercase tracking-widest text-green-500 hover:opacity-70">
                      Browse Campus 📍
                    </button>
                  </div>
                  <div className={`h-14 ${themeClass.input} rounded-2xl flex items-center px-5 border gap-3`}>
                    <Navigation size={16} className="text-green-500 shrink-0" />
                    <input className={`bg-transparent w-full outline-none ${themeClass.text} text-sm`}
                      placeholder="Type any location or campus building..."
                      value={dropoffQuery}
                      onChange={e => { setDropoffQuery(e.target.value); setFocusedField('dropoff'); }}
                      onFocus={() => setFocusedField('dropoff')}
                      onBlur={() => setTimeout(() => setFocusedField(null), 150)}
                    />
                  </div>

                  <AnimatePresence>
                    {focusedField === 'dropoff' && dropoffSuggestions.length > 0 && (
                      <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`absolute top-full left-0 right-0 mt-1 rounded-2xl border ${themeClass.dropdown} shadow-2xl z-[300] overflow-hidden max-h-64 overflow-y-auto`}>
                        {dropoffSuggestions.map((s, i) => (
                          <SuggestionRow key={i} s={s} accent="green"
                            onSelect={() => applySuggestion(s, 'dropoff')} />
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  {poiTarget === 'dropoff' && (
                    <div className={`rounded-2xl border ${themeClass.dropdown} p-3 space-y-1 max-h-48 overflow-y-auto`}>
                      <input className={`w-full bg-transparent text-xs outline-none ${themeClass.text} px-3 py-2 rounded-xl border ${themeClass.border} mb-1`}
                        placeholder="Search campus..." value={poiQuery} onChange={e => setPoiQuery(e.target.value)} autoFocus />
                      {poiResults.map((p, i) => (
                        <button key={i} onMouseDown={() => selectPOI(p, 'dropoff')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs ${themeClass.text} hover:bg-green-500/10 flex items-center gap-2`}>
                          <span>{categoryIcons[p.category]}</span>
                          <div><p className="font-bold">{p.name}</p><p className={`text-[9px] ${themeClass.subText}`}>{p.description}</p></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fare */}
                <div className={`rounded-2xl p-4 border ${themeClass.border} ${isDark ? 'bg-white/3' : 'bg-slate-50'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${themeClass.subText}`}>Fare Breakdown</p>
                    {fare && <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-white/50' : 'bg-slate-200 text-slate-500'}`}>{distanceLabel}</span>}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`text-[9px] ${themeClass.subText} mb-0.5`}>Base + Distance</p>
                      <p className={`text-2xl font-black ${fare ? 'text-orange-500' : themeClass.subText} italic`}>{fareLabel}</p>
                      {fare && <p className={`text-[8px] ${themeClass.subText} mt-0.5`}>₦400 base + ₦{(fare.userPays-400).toLocaleString()} distance</p>}
                    </div>
                    <div className="text-right">
                      <p className={`text-[9px] ${themeClass.subText} mb-0.5`}>Nearby Runners</p>
                      <p className="text-lg font-black text-orange-500 italic">{nearbyDispatchers.length} Active</p>
                      {fare && <p className={`text-[8px] ${themeClass.subText} mt-0.5`}>+ small processing fee</p>}
                    </div>
                  </div>
                </div>

                <Button disabled={isProcessing || !fare || !orderData.item} onClick={handlePayNow}
                  className="w-full h-14 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase shadow-xl transition-all">
                  {isProcessing ? <Loader2 size={17} className="animate-spin" /> : (
                    <><CreditCard size={17} className="mr-3" />{fare ? `Pay ${fareLabel} via Paystack` : 'Select locations to see fare'}</>
                  )}
                </Button>

                <p className={`text-center text-[9px] ${themeClass.subText} leading-relaxed`}>
                  Campus buildings appear instantly as you type. External locations load from the internet.
                </p>
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
      <span className={`font-bold text-[11px] uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-slate-500'} group-hover:text-orange-500 transition-colors`}>
        {label}
      </span>
    </div>
    <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default RequesterDashboard;