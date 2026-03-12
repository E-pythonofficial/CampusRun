import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  LogOut, 
  Fingerprint, 
  KeyRound,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacySecurity = () => {
  const navigate = useNavigate();

  // Mock data for active sessions
  const [sessions, setSessions] = useState([
    { id: 1, device: 'iPhone 13 Pro', location: 'Iwo, Nigeria', current: true, type: 'mobile' },
    { id: 2, device: 'Chrome on Windows', location: 'Lagos, Nigeria', current: false, type: 'desktop' },
  ]);

  const terminateSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-10">
      {/* HEADER */}
      <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-[#0F172A]/50 backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-black italic tracking-[0.2em] uppercase text-primary">
          Privacy & Security
        </h1>
      </div>

      <div className="max-w-md mx-auto px-6 mt-8 space-y-8">
        
        {/* SECURITY ACTIONS */}
        <section className="space-y-3">
          <SecurityLink icon={Fingerprint} label="Two-Factor Authentication" status="Enabled" />
          <SecurityLink icon={KeyRound} label="Change App PIN" />
          <SecurityLink icon={EyeOff} label="Incognito Requesting" description="Hide your name from public feeds" />
        </section>

        {/* DEVICE SESSIONS */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Active Sessions</h2>
            </div>
            <button className="text-[10px] font-bold text-red-500 uppercase hover:underline">Log out all</button>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#0F172A] text-white/40">
                    {session.type === 'mobile' ? <Smartphone size={20} /> : <Laptop size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">{session.device}</p>
                      {session.current && (
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-black uppercase">This Device</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30">{session.location}</p>
                  </div>
                </div>

                {!session.current && (
                  <button 
                    onClick={() => terminateSession(session.id)}
                    className="p-2 text-white/20 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="pt-4">
          <Button className="w-full h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all">
            Download My Data
          </Button>
        </div>
      </div>
    </div>
  );
};

/* MINI COMPONENT FOR SECURITY LINKS */
const SecurityLink = ({ icon: Icon, label, status, description }: any) => (
  <button className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon size={18} />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-white">{label}</p>
        {description && <p className="text-[9px] text-white/30 lowercase mt-0.5">{description}</p>}
      </div>
    </div>
    {status && <span className="text-[9px] font-black text-primary uppercase tracking-widest">{status}</span>}
  </button>
);

export default PrivacySecurity;