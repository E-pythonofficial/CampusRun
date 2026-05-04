import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  ExternalLink, 
  LifeBuoy,
  ChevronRight,
  Clock
} from 'lucide-react';

const Support = () => {
  const navigate = useNavigate();

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
          Help & Support
        </h1>
      </div>

      <div className="max-w-md mx-auto px-6 mt-8 space-y-8">
        
        {/* EMERGENCY/ACTIVE ORDER SUPPORT */}
        <section className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/20 to-orange-600/5 border border-primary/20 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Clock size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Order Help</span>
            </div>
            <h2 className="text-lg font-bold leading-tight">Issues with an ongoing delivery?</h2>
            <button className="w-full py-4 bg-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
              Chat with Dispatcher
            </button>
          </div>
          <LifeBuoy size={120} className="absolute -right-8 -bottom-8 text-white/5 -rotate-12" />
        </section>

        {/* CONTACT CHANNELS */}
        <div className="grid grid-cols-2 gap-4">
          <ContactCard icon={MessageCircle} label="Live Chat" sub="2min wait" color="text-green-500" />
          <ContactCard icon={Phone} label="Call Us" sub="Available 8am-8pm" color="text-blue-500" />
        </div>

        {/* HELP CATEGORIES */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Knowledge Base</h3>
          <SupportLink icon={FileText} label="How CampusRun Works" />
          <SupportLink icon={FileText} label="Payment & Refunds" />
          <SupportLink icon={FileText} label="Runner Safety Guidelines" />
        </section>

        {/* SOCIAL/EXTERNAL */}
        <section className="space-y-3 pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Community</h3>
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white/5 text-primary">
                <ExternalLink size={18} />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-widest text-white/70">Join WhatsApp Group</span>
            </div>
            <ChevronRight size={16} className="text-white/10" />
          </div>
        </section>

        <p className="text-center text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold">
          CampusRun v1.0.4 • Bowen University Edition
        </p>
      </div>
    </div>
  );
};

const ContactCard = ({ icon: Icon, label, sub, color }: any) => (
  <button className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left flex flex-col gap-3">
    <div className={`p-3 rounded-2xl bg-white/5 w-fit ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="font-bold text-xs uppercase tracking-wide">{label}</p>
      <p className="text-[9px] text-white/30 font-medium">{sub}</p>
    </div>
  </button>
);

const SupportLink = ({ icon: Icon, label }: any) => (
  <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
    <div className="flex items-center gap-4">
      <Icon size={18} className="text-white/40 group-hover:text-primary transition-colors" />
      <span className="font-bold text-[11px] uppercase tracking-widest text-white/70 group-hover:text-white">
        {label}
      </span>
    </div>
    <ChevronRight size={16} className="text-white/10" />
  </button>
);

export default Support;