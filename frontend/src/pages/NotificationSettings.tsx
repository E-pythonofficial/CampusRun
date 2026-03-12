import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Smartphone, Mail, MessageSquare, Zap } from 'lucide-react';

const NotificationSettings = () => {
  const navigate = useNavigate();

  // State for different notification types
  const [settings, setSettings] = useState({
    pushOrderUpdates: true,
    pushPromotions: false,
    emailReceipts: true,
    emailNewsletter: false,
    smsAlerts: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
          Notifications
        </h1>
      </div>

      <div className="max-w-md mx-auto px-6 mt-8 space-y-8">
        {/* PUSH SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={16} className="text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Push Notifications</h2>
          </div>
          
          <NotificationToggle 
            label="Order Status Updates" 
            description="Get notified when a runner accepts or arrives"
            isEnabled={settings.pushOrderUpdates}
            onToggle={() => toggleSetting('pushOrderUpdates')}
          />
          <NotificationToggle 
            label="Promos & Offers" 
            description="Discounts and campus special events"
            isEnabled={settings.pushPromotions}
            onToggle={() => toggleSetting('pushPromotions')}
          />
        </section>

        {/* EMAIL SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Email Notifications</h2>
          </div>
          
          <NotificationToggle 
            label="Order Receipts" 
            description="Digital invoices for every completed run"
            isEnabled={settings.emailReceipts}
            onToggle={() => toggleSetting('emailReceipts')}
          />
          <NotificationToggle 
            label="CampusRun Weekly" 
            description="News about new features and top runners"
            isEnabled={settings.emailNewsletter}
            onToggle={() => toggleSetting('emailNewsletter')}
          />
        </section>

        {/* SMS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">SMS Alerts</h2>
          </div>
          
          <NotificationToggle 
            label="Critical Alerts" 
            description="Security alerts and account recovery"
            isEnabled={settings.smsAlerts}
            onToggle={() => toggleSetting('smsAlerts')}
          />
        </section>

        <div className="pt-6">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <Zap size={18} className="text-primary mt-0.5" />
                <p className="text-[11px] text-white/60 leading-relaxed">
                    Note: High-priority system alerts (like password resets) cannot be turned off to ensure account security.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

/* REUSABLE TOGGLE COMPONENT */
const NotificationToggle = ({ 
  label, 
  description, 
  isEnabled, 
  onToggle 
}: { 
  label: string; 
  description: string; 
  isEnabled: boolean; 
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
    <div className="space-y-1 pr-4">
      <p className="text-xs font-bold uppercase tracking-wider text-white">{label}</p>
      <p className="text-[10px] text-white/40 leading-tight">{description}</p>
    </div>
    
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        isEnabled ? 'bg-primary' : 'bg-white/10'
      }`}
    >
      <motion.div
        animate={{ x: isEnabled ? 26 : 4 }}
        className="w-4 h-4 bg-white rounded-full shadow-lg"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
);

export default NotificationSettings;