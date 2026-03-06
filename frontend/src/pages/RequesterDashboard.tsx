import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Package, History, X, LogOut, 
  MapPin, Navigation, ShieldCheck, Clock 
} from 'lucide-react';

// Map components
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RequesterDashboard = () => {
  // 1. DYNAMIC NAME FIX: Accessing the registered user (Omobolaji)
  const { user, logout } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure map only renders on client-side to prevent "render2" errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bowen University Coordinates
  const bowenLocation: [number, number] = [7.636, 4.181];

  const activeDeliveries = [
    {
      id: '1',
      item: "Course textbook - MTH201",
      status: "IN_TRANSIT", // Operational Flow Step 5 [cite: 27]
      from: "Science Building",
      to: "Hall 3, Room 214",
      fee: "500",
      pin: "4829" // Security Handshake PIN 
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Required style to fix Leaflet height issues */}
      <style>{`
        .leaflet-container { height: 100%; width: 100%; z-index: 1; rounded-2xl; }
        .glass-card { backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>

      {/* Navigation: Removed role switcher and fixed the name */}
      <nav className="border-b border-white/5 px-6 py-4 flex justify-between items-center glass-card sticky top-0 z-[100]">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Student Requester</p>
            <p className="text-sm font-bold text-primary">{user?.fullName || "Omobolaji"}</p>
          </div>
          <Button variant="ghost" onClick={logout} className="text-white/20 hover:text-red-500 rounded-full">
            <LogOut size={18} />
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic">MY RUNS</h1>
            <p className="text-white/40 text-sm">Secure campus-wide logistics[cite: 5, 10].</p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)}
            className="bg-primary hover:bg-orange-600 text-white rounded-2xl px-8 h-14 gap-2 shadow-xl shadow-primary/20 font-bold"
          >
            <Plus size={20} /> New Request
          </Button>
        </header>

        {/* ACTIVE RUNS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white/30 px-2">
            <Clock size={16} />
            <h2 className="text-xs font-black uppercase tracking-widest">Active Deliveries</h2>
          </div>

          {activeDeliveries.map((run) => (
            <motion.div 
              key={run.id}
              className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row min-h-[350px] shadow-2xl"
            >
              {/* LIVE MINI MAP: Integration with Safety Check */}
              <div className="w-full lg:w-1/3 h-[250px] lg:h-auto relative border-r border-white/5 bg-black/20">
                {mounted ? (
                  <MapContainer center={bowenLocation} zoom={16} zoomControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Marker position={bowenLocation} />
                  </MapContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white/10">Loading Map...</div>
                )}
                <div className="absolute top-6 left-6 z-[10] bg-primary/90 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  Live: In Transit [cite: 27]
                </div>
              </div>

              {/* DETAILS AREA */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black text-white">{run.item}</h3>
                    <div className="flex items-center gap-4 mt-3 text-white/40 text-sm">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-primary"/> {run.from}</span>
                      <span className="text-primary/40">→</span>
                      <span className="flex items-center gap-1"><Navigation size={14} className="text-primary"/> {run.to}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">₦{run.fee}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Escrow Active [cite: 11, 22]</p>
                  </div>
                </div>

                {/* SECURITY PIN FOOTER */}
                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-black">Security PIN [cite: 22]</p>
                      <p className="text-sm text-white/60">Provide this to dispatcher upon arrival [cite: 27]</p>
                    </div>
                  </div>
                  <div className="bg-white/5 px-8 py-3 rounded-2xl border border-white/10">
                    <span className="text-4xl font-mono font-black tracking-[0.2em] text-primary">{run.pin}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default RequesterDashboard;