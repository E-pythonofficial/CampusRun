import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context'; // Import useAuth
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
  const { theme } = useAuth(); // Access theme from context
  const isDark = theme === 'dark';

  // Theme-aware classes
  const themeClass = {
    bg: isDark ? 'bg-[#020617]' : 'bg-[#F8FAFC]',
    header: isDark ? 'bg-[#0F172A]/50 border-white/5' : 'bg-white/80 border-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900',
    subText: isDark ? 'text-white/40' : 'text-slate-500',
    card: isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm',
    iconBg: isDark ? 'bg-[#0F172A]' : 'bg-slate-100',
  };

  // Mock data for active sessions
  const [sessions, setSessions] = useState([
    { id: 1, device: 'iPhone 13 Pro', location: 'Iwo, Nigeria', current: true, type: 'mobile' },
    { id: 2, device: 'Chrome on Windows', location: 'Lagos, Nigeria', current: false, type: 'desktop' },
  ]);

  const terminateSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className={`min-h-screen ${themeClass.bg} ${themeClass.text} pb-10 transition-colors duration-500`}>
      {/* HEADER */}
      <div className={`p-6 flex items-center gap-4 border-b ${themeClass.header} backdrop-blur-xl sticky top-0 z-50`}>
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} transition-colors`}
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
          <SecurityLink 
            icon={Fingerprint} 
            label="Two-Factor Authentication" 
            status="Enabled" 
            isDark={isDark}
          />
          <SecurityLink 
            icon={KeyRound} 
            label="Change App PIN" 
            isDark={isDark}
          />
          <SecurityLink 
            icon={EyeOff} 
            label="Incognito Requesting" 
            description="Hide your name from public feeds" 
            isDark={isDark}
          />
        </section>

        {/* DEVICE SESSIONS */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeClass.subText}`}>Active Sessions</h2>
            </div>
            <button className="text-[10px] font-bold text-red-500 uppercase hover:underline">Log out all</button>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className={`p-5 rounded-2xl ${themeClass.card} flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${themeClass.iconBg} ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    {session.type === 'mobile' ? <Smartphone size={20} /> : <Laptop size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold ${themeClass.text}`}>{session.device}</p>
                      {session.current && (
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-black uppercase">This Device</span>
                      )}
                    </div>
                    <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{session.location}</p>
                  </div>
                </div>

                {!session.current && (
                  <button 
                    onClick={() => terminateSession(session.id)}
                    className={`p-2 ${isDark ? 'text-white/20' : 'text-slate-300'} hover:text-red-500 transition-colors`}
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
const SecurityLink = ({ icon: Icon, label, status, description, isDark }: any) => (
  <button className={`w-full p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'} hover:border-primary/30 transition-all flex items-center justify-between group`}>
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 text-primary' : 'bg-slate-100 text-primary'} group-hover:bg-primary group-hover:text-white transition-colors`}>
        <Icon size={18} />
      </div>
      <div className="text-left">
        <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</p>
        {description && <p className={`text-[9px] ${isDark ? 'text-white/30' : 'text-slate-500'} lowercase mt-0.5`}>{description}</p>}
      </div>
    </div>
    {status && <span className="text-[9px] font-black text-primary uppercase tracking-widest">{status}</span>}
  </button>
);

export default PrivacySecurity;