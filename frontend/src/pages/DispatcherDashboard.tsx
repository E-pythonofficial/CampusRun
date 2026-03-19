// DispatcherDashboard.tsx

import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon,
  ClipboardList,
  Trophy,
  User,
  Wallet,
  Navigation2,
  Star,
  TrendingUp,
  Zap,
  Package,
  MapPin,
  MessageSquare,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Send,
  ImagePlus,
  ArrowLeft,
  Phone,
  WifiOff,
  Wifi,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { mockDeliveries, mockDispatcherStats, mockLeaderboard } from '@/lib/mock-data';
import { Delivery, DispatcherStats } from '@/lib/types';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  sender: 'dispatcher' | 'requester';
  text?: string;
  image?: string;
  timestamp: string;
}

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const T = (isDark: boolean) => ({
  pageBg:          isDark ? '#0A1128'                    : '#F4F6FB',
  cardBg:          isDark ? '#131B31'                    : '#FFFFFF',
  cardBorder:      isDark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.08)',
  inputBg:         isDark ? '#0A1128'                    : '#F0F2F8',
  inputBorder:     isDark ? 'rgba(255,255,255,0.10)'     : 'rgba(0,0,0,0.10)',
  overlayBg:       isDark ? '#0A1128'                    : '#F4F6FB',
  navBg:           isDark ? 'rgba(19,27,49,0.90)'        : 'rgba(255,255,255,0.92)',
  headerBg:        isDark ? 'rgba(19,27,49,0.80)'        : 'rgba(255,255,255,0.85)',
  textPrimary:     isDark ? '#FFFFFF'                    : '#0A1128',
  textSecondary:   isDark ? '#94A3B8'                    : '#4B5563',
  textMuted:       isDark ? '#475569'                    : '#9CA3AF',
  textLabel:       isDark ? '#64748B'                    : '#6B7280',
  orange:          '#FF5C00',
  orangeHover:     '#FF7A30',
  green:           '#22C55E',
  divider:         isDark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.06)',
  pinBg:           isDark ? 'rgba(0,0,0,0.20)'           : 'rgba(0,0,0,0.04)',
  toggleBg:        isDark ? 'rgba(0,0,0,0.20)'           : 'rgba(0,0,0,0.06)',
  toggleBorder:    isDark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.08)',
  whiteFaint:      isDark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.04)',
  activeJobBorder: isDark ? 'rgba(255,92,0,0.20)'        : 'rgba(255,92,0,0.30)',
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ACTIVE_STATUSES = [
  'ACCEPTED',
  'ON_MY_WAY',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED',
] as const;

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, accent, delay, isDark,
}: {
  label: string; value: string | number; icon: any;
  accent?: boolean; delay: number; isDark: boolean;
}) => {
  const t = T(isDark);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-4 border"
      style={{ background: t.cardBg, borderColor: t.cardBorder }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color: accent ? t.orange : t.textSecondary }} />
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: t.textSecondary }}>
          {label}
        </span>
      </div>
      <span className="text-xl font-bold" style={{ color: accent ? t.orange : t.textPrimary }}>
        {value}
      </span>
    </motion.div>
  );
};

// ─── NAV BUTTON ───────────────────────────────────────────────────────────────
const NavButton = ({ active, icon: Icon, label, onClick, isDark }: any) => {
  const t = T(isDark);
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div
        className="p-2 rounded-xl transition-all duration-300"
        style={{
          background: active ? t.orange : 'transparent',
          color:      active ? '#FFFFFF' : t.textSecondary,
          transform:  active ? 'scale(1.10)' : 'scale(1)',
          boxShadow:  active ? `0 8px 20px ${t.orange}33` : 'none',
        }}
      >
        <Icon size={22} />
      </div>
      <span className="text-[10px] font-bold" style={{ color: active ? t.orange : t.textSecondary }}>
        {label}
      </span>
    </button>
  );
};

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
const ThemeToggle = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => {
  const t = T(isDark);
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      className="p-2 rounded-xl border transition-all"
      style={{ background: t.whiteFaint, borderColor: t.cardBorder, color: t.textSecondary }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0,   opacity: 1 }}
            exit={{   rotate:  90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={18} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate:  90, opacity: 0 }}
            animate={{ rotate:   0, opacity: 1 }}
            exit={{   rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={18} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ─── OFFLINE OVERLAY ──────────────────────────────────────────────────────────
const OfflineOverlay = ({ onGoOnline, isDark }: { onGoOnline: () => void; isDark: boolean }) => {
  const t = T(isDark);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{   opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: t.overlayBg }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#888888_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative mb-10">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `${t.orange}33` }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: `${t.orange}22` }}
        />
        <div
          className="relative w-32 h-32 rounded-full border flex items-center justify-center shadow-2xl"
          style={{ background: t.cardBg, borderColor: t.cardBorder }}
        >
          <WifiOff size={48} style={{ color: t.textMuted }} />
        </div>
      </div>

      <h2 className="text-3xl font-black mb-2 tracking-tight" style={{ color: t.textPrimary }}>
        You're Offline
      </h2>
      <p className="text-sm font-medium text-center max-w-xs mb-10 leading-relaxed" style={{ color: t.textSecondary }}>
        Go online to start receiving delivery requests from students on campus.
      </p>

      <div className="flex gap-6 mb-12">
        {[
          { label: 'Avg Earnings', value: '₦4,200' },
          { label: 'Active Runs',  value: '12'     },
          { label: 'Your Rating',  value: '4.9★'   },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-lg font-black" style={{ color: t.orange }}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: t.textMuted }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onGoOnline}
        className="relative z-10 w-64 py-5 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-3"
        style={{ background: t.orange, boxShadow: `0 16px 40px ${t.orange}44` }}
      >
        <Wifi size={20} /> Go Online
      </motion.button>

      <p className="text-xs font-bold uppercase tracking-widest mt-6" style={{ color: t.textMuted }}>
        CampusRun Dispatcher v2.4
      </p>
    </motion.div>
  );
};

// ─── DELIVERY COMPLETE SCREEN ─────────────────────────────────────────────────
const DeliveryCompleteScreen = ({
  fee, onDismiss, isDark,
}: {
  fee: number; onDismiss: () => void; isDark: boolean;
}) => {
  const t = T(isDark);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1  }}
      exit={{   opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
      style={{ background: t.overlayBg }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#888888_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-32 h-32 rounded-full flex items-center justify-center pointer-events-none"
          style={{ background: 'rgba(34,197,94,0.15)' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
            style={{ background: t.green, boxShadow: `0 16px 40px ${t.green}55` }}
          >
            <CheckCircle2 size={40} className="text-white" />
          </motion.div>
        </motion.div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="text-3xl font-black mb-2 tracking-tight text-center"
        style={{ color: t.textPrimary }}
      >
        Run Complete! 🎉
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="text-sm font-medium text-center mb-6"
        style={{ color: t.textSecondary }}
      >
        Delivery confirmed. Payment released to your wallet.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="rounded-2xl px-8 py-4 mb-10 text-center border"
        style={{ background: `${t.orange}15`, borderColor: `${t.orange}33` }}
      >
        <p className="text-[10px] uppercase font-black tracking-widest mb-1" style={{ color: t.textSecondary }}>
          You Earned
        </p>
        <p className="text-4xl font-black" style={{ color: t.orange }}>₦{fee.toLocaleString()}</p>
      </motion.div>
      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.96 }}
        onClick={onDismiss}
        className="relative z-10 w-full max-w-xs py-5 rounded-2xl font-black text-white"
        style={{ background: t.orange, boxShadow: `0 16px 40px ${t.orange}44` }}
      >
        Back to Dashboard
      </motion.button>
    </motion.div>
  );
};

// ─── CHAT ROOM ────────────────────────────────────────────────────────────────
const ChatRoom = ({
  job, onClose, isDeliveryComplete, isDark,
}: {
  job: Delivery; onClose: () => void; isDeliveryComplete: boolean; isDark: boolean;
}) => {
  const t = T(isDark);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id:        '1',
      sender:    'dispatcher',
      text:      "Hello! I'm heading to pick up your item now. Please send a photo of the item if you'd like!",
      timestamp: nowTime(),
    },
  ]);
  const [input,  setInput]  = useState('');
  const fileRef             = useRef<HTMLInputElement>(null);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const completionSentRef   = useRef(false);

  if (isDeliveryComplete && !completionSentRef.current) {
    completionSentRef.current = true;
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id:        Date.now().toString(),
          sender:    'dispatcher',
          text:      '✅ Item delivered successfully! Thanks for using CampusRun. Have a great day!',
          timestamp: nowTime(),
        },
      ]);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(onClose, 2000);
      }, 200);
    }, 300);
  }

  const send = (text?: string, image?: string) => {
    if (!text?.trim() && !image) return;
    if (isDeliveryComplete) return;
    const msg: ChatMessage = {
      id: Date.now().toString(), sender: 'dispatcher', text, image, timestamp: nowTime(),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    if (image) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id:        Date.now().toString(),
            sender:    'requester',
            text:      'Thanks! That looks right. See you soon 🙏',
            timestamp: nowTime(),
          },
        ]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }, 1500);
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => send(undefined, reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: t.pageBg }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 border-b backdrop-blur-xl"
        style={{ background: t.headerBg, borderColor: t.divider }}
      >
        <button
          onClick={onClose}
          className="p-2 rounded-xl transition-colors"
          style={{ background: t.whiteFaint, color: t.textPrimary }}
        >
          <ArrowLeft size={20} />
        </button>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm"
          style={{ background: `linear-gradient(135deg, ${t.orange}, ${t.orangeHover})` }}
        >
          {job.requesterName?.[0] ?? 'R'}
        </div>
        <div className="flex-1">
          <p className="font-black text-sm" style={{ color: t.textPrimary }}>
            {job.requesterName ?? 'Requester'}
          </p>
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: isDeliveryComplete ? t.textMuted : t.green }}
          >
            {isDeliveryComplete ? 'Delivery Complete' : 'Active Now'}
          </p>
        </div>
        {!isDeliveryComplete && (
          <button
            className="p-2 rounded-xl transition-colors"
            style={{ background: `${t.orange}18`, color: t.orange }}
          >
            <Phone size={18} />
          </button>
        )}
      </div>

      {/* Context pill */}
      <div
        className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3 border"
        style={{ background: t.cardBg, borderColor: t.cardBorder }}
      >
        <Package
          size={16}
          className="shrink-0"
          style={{ color: isDeliveryComplete ? t.green : t.orange }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: t.textSecondary }}>
            {isDeliveryComplete ? 'Completed Run' : 'Active Run'}
          </p>
          <p className="text-xs font-bold truncate" style={{ color: t.textPrimary }}>
            {job.itemDescription}
          </p>
        </div>
        <div className="text-right shrink-0">
          {isDeliveryComplete ? (
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: t.green }}>
              ✓ Done
            </span>
          ) : (
            <>
              <p className="text-[10px] uppercase font-bold" style={{ color: t.textMuted }}>PIN</p>
              <p className="text-sm font-black tracking-widest" style={{ color: t.orange }}>{job.pin}</p>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn('flex', msg.sender === 'dispatcher' ? 'justify-end' : 'justify-start')}
          >
            <div
              className="max-w-[78%] overflow-hidden"
              style={{
                background:   msg.sender === 'dispatcher' ? t.orange : t.cardBg,
                border:       msg.sender === 'dispatcher' ? 'none' : `1px solid ${t.cardBorder}`,
                borderRadius: msg.sender === 'dispatcher' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
              }}
            >
              {msg.image && (
                <img src={msg.image} alt="shared" className="w-full max-h-52 object-cover" />
              )}
              {msg.text && (
                <p
                  className="text-sm font-medium px-4 py-3 leading-relaxed"
                  style={{ color: msg.sender === 'dispatcher' ? '#FFFFFF' : t.textPrimary }}
                >
                  {msg.text}
                </p>
              )}
              <p
                className="text-[10px] px-4 pb-2 font-bold"
                style={{
                  color:     msg.sender === 'dispatcher' ? 'rgba(255,255,255,0.6)' : t.textMuted,
                  textAlign: msg.sender === 'dispatcher' ? 'right' : 'left',
                }}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {/* Upload prompt */}
        {!messages.some(m => m.image) && !isDeliveryComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-xs rounded-3xl p-5 text-center border border-dashed"
            style={{ background: t.cardBg, borderColor: `${t.orange}55` }}
          >
            <ImagePlus size={28} className="mx-auto mb-2" style={{ color: t.orange }} />
            <p className="text-xs font-bold mb-1" style={{ color: t.textPrimary }}>Share a photo</p>
            <p className="text-[10px] mb-4" style={{ color: t.textSecondary }}>
              Send a photo of the item you picked up so the requester can confirm.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-white text-xs font-black px-6 py-2.5 rounded-xl transition-colors"
              style={{ background: t.orange }}
            >
              Upload Photo
            </button>
          </motion.div>
        )}

        {/* Completion banner */}
        {isDeliveryComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-xs rounded-3xl p-5 text-center border"
            style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.20)' }}
          >
            <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: t.green }} />
            <p className="text-xs font-black mb-1" style={{ color: t.textPrimary }}>Delivery Complete</p>
            <p className="text-[10px]" style={{ color: t.textSecondary }}>
              This chat will close shortly. Payment has been released.
            </p>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="px-4 py-4 border-t backdrop-blur-xl"
        style={{ background: t.headerBg, borderColor: t.divider }}
      >
        {isDeliveryComplete ? (
          <div className="flex items-center justify-center gap-2 py-3" style={{ color: t.textMuted }}>
            <CheckCircle2 size={14} style={{ color: t.green }} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Chat ended — delivery complete
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
            style={{ background: t.inputBg, borderColor: t.inputBorder }}
          >
            <button
              onClick={() => fileRef.current?.click()}
              className="p-1.5 rounded-xl transition-colors shrink-0"
              style={{ background: `${t.orange}18`, color: t.orange }}
            >
              <ImagePlus size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Message requester..."
              className="flex-1 bg-transparent text-sm outline-none font-medium"
              style={{ color: t.textPrimary }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="p-1.5 rounded-xl transition-colors shrink-0 disabled:opacity-30"
              style={{ background: t.orange }}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const DispatcherDashboard = () => {
  const [activeTab,        setActiveTab]        = useState('home');
  const [isOnline,         setIsOnline]         = useState(false);
  const [deliveryStep,     setDeliveryStep]     = useState<'IDLE' | 'ARRIVING' | 'PICKED_UP'>('IDLE');
  const [chatOpen,         setChatOpen]         = useState(false);
  const [deliveryComplete, setDeliveryComplete] = useState(false);

  // ── AUTH & NAVIGATION ─────────────────────────────────────────────────────
  const navigate        = useNavigate();
  const { logout }      = useAuth();

  // ── THEME — defaults to system preference ─────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    const mq      = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const t = T(isDark);

  const deliveries: Delivery[]      = mockDeliveries;
  const stats:      DispatcherStats = mockDispatcherStats;

  const currentJob = useMemo(
    () => deliveries.find(d => (ACTIVE_STATUSES as readonly string[]).includes(d.status)),
    [deliveries],
  );

  const handleStepUpdate = () => {
    if      (deliveryStep === 'IDLE')      setDeliveryStep('ARRIVING');
    else if (deliveryStep === 'ARRIVING')  setDeliveryStep('PICKED_UP');
    else if (deliveryStep === 'PICKED_UP') { setDeliveryComplete(true); setDeliveryStep('IDLE'); }
  };

  const handleDismissComplete = () => {
    setDeliveryComplete(false);
    setChatOpen(false);
  };

  // ── SIGN OUT ──────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const stepLabel = {
    IDLE:      'Heading to Pickup',
    ARRIVING:  'On My Way',
    PICKED_UP: 'Item Picked Up',
  }[deliveryStep];

  // ── PROFILE MENU ITEMS ────────────────────────────────────────────────────
  const profileItems = [
    {
      icon:   Settings,
      label:  'Account Settings',
      desc:   'Manage your runner profile',
      danger: false,
      action: () => {},
    },
    {
      icon:   Wallet,
      label:  'Payment Methods',
      desc:   'Withdrawal and bank details',
      danger: false,
      action: () => {},
    },
    {
      icon:   LogOut,
      label:  'Sign Out',
      desc:   'Securely exit your account',
      danger: true,
      action: handleSignOut, // ✅ wired to logout() + navigate('/')
    },
  ];

  return (
    <div
      className="flex flex-col h-screen overflow-hidden font-sans"
      style={{ background: t.pageBg, color: t.textPrimary }}
    >
      {/* ── OFFLINE OVERLAY ── */}
      <AnimatePresence>
        {!isOnline && <OfflineOverlay onGoOnline={() => setIsOnline(true)} isDark={isDark} />}
      </AnimatePresence>

      {/* ── DELIVERY COMPLETE ── */}
      <AnimatePresence>
        {deliveryComplete && !chatOpen && (
          <DeliveryCompleteScreen
            fee={currentJob?.fee ?? 800}
            onDismiss={handleDismissComplete}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* ── CHAT ROOM ── */}
      <AnimatePresence>
        {chatOpen && currentJob && (
          <ChatRoom
            job={currentJob}
            onClose={() => setChatOpen(false)}
            isDeliveryComplete={deliveryComplete}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <header
        className="px-6 py-4 flex justify-between items-center border-b backdrop-blur-xl z-20"
        style={{ background: t.headerBg, borderColor: t.divider }}
      >
        <h1 className="font-black text-xl tracking-tight" style={{ color: t.textPrimary }}>
          CAMPUS<span style={{ color: t.orange }}>RUN</span>
        </h1>

        <div className="flex items-center gap-3">
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
          <div
            className="flex items-center gap-3 px-3 py-1.5 rounded-full border"
            style={{ background: t.toggleBg, borderColor: t.toggleBorder }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: isOnline ? t.green : t.textSecondary }}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="w-10 h-5 rounded-full relative transition-colors duration-500"
              style={{ background: isOnline ? t.green : t.divider }}
            >
              <motion.div
                animate={{ x: isOnline ? 20 : 2 }}
                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-xl"
              />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 relative overflow-y-auto pb-32">
        <AnimatePresence mode="wait">

          {/* RUN TAB */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 relative overflow-hidden min-h-[70vh]" style={{ background: t.pageBg }}>
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="w-full h-full bg-[radial-gradient(#888888_1px,transparent_1px)] [background-size:32px_32px]" />
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
                  {isOnline && !currentJob && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      className="p-6 rounded-[2.5rem] flex items-center gap-4 text-white pointer-events-auto shadow-2xl"
                      style={{ background: t.orange }}
                    >
                      <div className="bg-white/20 p-4 rounded-2xl animate-bounce">
                        <Package size={28} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">
                          Scanning Campus...
                        </p>
                        <p className="font-black text-xl">Searching for runs</p>
                      </div>
                    </motion.div>
                  )}

                  {isOnline && currentJob && (
                    <motion.div
                      layoutId="active-job"
                      className="p-6 rounded-[2.5rem] border shadow-2xl pointer-events-auto"
                      style={{ background: t.cardBg, borderColor: t.activeJobBorder }}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit"
                            style={{ background: `${t.orange}22`, color: t.orange }}
                          >
                            Active Task
                          </span>
                          <p className="font-black text-lg mt-1" style={{ color: t.textPrimary }}>
                            {currentJob.itemDescription}
                          </p>
                        </div>
                        <div
                          className="flex items-center gap-1 font-bold text-xs px-3 py-1 rounded-full"
                          style={{ color: t.green, background: `${t.green}18` }}
                        >
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.green }} />
                          {stepLabel}
                        </div>
                      </div>

                      <div className="space-y-5 mb-6 relative px-2">
                        <div
                          className="absolute left-[15px] top-3 bottom-3 w-[2px] opacity-20"
                          style={{ background: `linear-gradient(to bottom, ${t.orange}, ${t.green})` }}
                        />
                        <div className="flex gap-4 items-center">
                          <div
                            className="w-4 h-4 rounded-full z-10 transition-colors duration-500 flex items-center justify-center"
                            style={{ background: deliveryStep !== 'IDLE' ? t.green : t.orange }}
                          >
                            {deliveryStep !== 'IDLE' && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase font-black" style={{ color: t.textSecondary }}>
                              Pick up
                            </p>
                            <p className="font-bold text-sm" style={{ color: t.textPrimary }}>
                              {currentJob.pickupLocation}
                            </p>
                          </div>
                          <MapPin size={16} style={{ color: t.orange }} />
                        </div>
                        <div className="flex gap-4 items-center">
                          <div
                            className="w-4 h-4 rounded-full border-2 z-10"
                            style={{
                              borderColor: t.pageBg,
                              background: deliveryStep === 'PICKED_UP' ? t.green : t.divider,
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-[10px] uppercase font-black" style={{ color: t.textSecondary }}>
                              Drop off
                            </p>
                            <p className="font-bold text-sm" style={{ color: t.textPrimary }}>
                              {currentJob.dropoffLocation}
                            </p>
                          </div>
                          <Navigation2 size={16} style={{ color: t.textSecondary }} />
                        </div>
                      </div>

                      <div
                        className="rounded-3xl p-4 mb-6 border flex flex-col items-center"
                        style={{ background: t.pinBg, borderColor: t.cardBorder }}
                      >
                        <span
                          className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                          style={{ color: t.textMuted }}
                        >
                          Security Handshake Pin
                        </span>
                        <span className="text-4xl font-black tracking-[0.3em]" style={{ color: t.orange }}>
                          {currentJob.pin}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleStepUpdate}
                          className="flex-1 text-white py-7 rounded-2xl font-black"
                          style={{ background: t.orange, boxShadow: `0 8px 24px ${t.orange}44` }}
                        >
                          {deliveryStep === 'IDLE'      && 'Arrived at Pickup'}
                          {deliveryStep === 'ARRIVING'  && 'Confirm Pickup'}
                          {deliveryStep === 'PICKED_UP' && 'Complete Delivery'}
                        </Button>
                        <Button
                          onClick={() => setChatOpen(true)}
                          variant="outline"
                          className="w-16 h-16 rounded-2xl transition-all"
                          style={{ borderColor: t.cardBorder, background: t.whiteFaint, color: t.orange }}
                        >
                          <MessageSquare size={24} />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black" style={{ color: t.textPrimary }}>History</h2>
                  <p className="text-sm font-medium" style={{ color: t.textSecondary }}>Your recent campus runs</p>
                </div>
                <div className="px-4 py-2 rounded-2xl border" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                  <span className="text-xs font-bold uppercase" style={{ color: t.textSecondary }}>Total: </span>
                  <span className="text-sm font-black" style={{ color: t.orange }}>
                    {deliveries.filter(d => d.status === 'COMPLETED').length}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {deliveries.filter(d => d.status === 'COMPLETED').map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-3xl border flex justify-between items-center"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: t.whiteFaint, color: t.orange }}>
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: t.textPrimary }}>{job.itemDescription}</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: t.textSecondary }}>
                          <MapPin size={10} /> {job.dropoffLocation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg" style={{ color: t.orange }}>₦{job.fee.toLocaleString()}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: t.green }}>
                        {job.rating ? `${job.rating}★` : 'Success'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <motion.div key="performance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6">
              <div
                className="p-8 rounded-[3rem] shadow-xl relative overflow-hidden group"
                style={{ background: `linear-gradient(135deg, ${t.orange}, #E65100)` }}
              >
                <Wallet className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={160} />
                <p className="text-white/80 text-xs font-black uppercase tracking-[0.2em] mb-1">Total Balance</p>
                <h2 className="text-5xl font-black text-white mb-8">₦{stats.totalEarnings.toLocaleString()}</h2>
                <div className="flex gap-3">
                  <Button className="bg-white font-black rounded-2xl px-8 py-6 hover:bg-white/90" style={{ color: t.orange }}>
                    Withdraw
                  </Button>
                  <Button variant="ghost" className="text-white/80 font-bold hover:text-white">View Details</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Reliability" value={`${stats.reliability}%`}   icon={TrendingUp} accent delay={0.1} isDark={isDark} />
                <StatCard label="Total Tasks" value={stats.completed}            icon={Zap}         delay={0.2} isDark={isDark} />
                <StatCard label="Avg Rating"  value={`${stats.averageRating}★`} icon={Star}  accent delay={0.3} isDark={isDark} />
                <StatCard label="Total Runs"  value={stats.totalAccepted}        icon={Package}     delay={0.4} isDark={isDark} />
              </div>

              <section className="pt-4">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h3 className="font-black text-xl flex items-center gap-2" style={{ color: t.textPrimary }}>
                    <Trophy size={22} style={{ color: t.orange }} /> LEADERBOARD
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full"
                    style={{ color: t.textSecondary, background: t.whiteFaint }}>
                    Weekly
                  </span>
                </div>
                <div className="rounded-[2.5rem] overflow-hidden border divide-y"
                  style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                  {mockLeaderboard.slice(0, 5).map((entry, i) => (
                    <div key={entry.dispatcherId} className="flex items-center gap-4 p-5 transition-colors"
                      style={{ borderColor: t.divider }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                        style={{
                          background: i === 0 ? `${t.orange}22` : i === 1 ? 'rgba(148,163,184,0.15)' : i === 2 ? 'rgba(180,83,9,0.12)' : 'transparent',
                          color: i === 0 ? t.orange : i === 1 ? '#94A3B8' : i === 2 ? '#B45309' : t.textMuted,
                        }}>
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black" style={{ color: t.textPrimary }}>{entry.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: t.textSecondary }}>
                          {entry.completed} runs · {entry.reliability}% reliable
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
                        style={{ background: t.pinBg, borderColor: t.cardBorder }}>
                        <Star size={12} className="fill-[#FF5C00]" style={{ color: t.orange }} />
                        <span className="text-xs font-black" style={{ color: t.textPrimary }}>{entry.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
              <div className="flex flex-col items-center py-10">
                <div className="relative">
                  <div
                    className="w-28 h-28 rounded-[2.5rem] p-1.5 mb-6 rotate-3"
                    style={{ background: `linear-gradient(135deg, ${t.orange}, ${t.orangeHover})` }}
                  >
                    <div
                      className="w-full h-full rounded-[2.2rem] flex items-center justify-center overflow-hidden -rotate-3"
                      style={{ background: t.pageBg }}
                    >
                      <User size={54} style={{ color: t.textMuted }} />
                    </div>
                  </div>
                  <div
                    className="absolute -right-2 bottom-4 w-6 h-6 rounded-full border-4"
                    style={{ background: t.green, borderColor: t.pageBg }}
                  />
                </div>
                <h2 className="text-2xl font-black tracking-tight" style={{ color: t.textPrimary }}>
                  Adebayo Oluwaseun
                </h2>
                <div
                  className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full border"
                  style={{ background: t.whiteFaint, borderColor: t.cardBorder }}
                >
                  <ShieldCheck size={14} style={{ color: t.orange }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: t.textSecondary }}>
                    Verified Campus Runner
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {profileItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}  // ✅ each item now has its own action
                    className="w-full p-5 rounded-[2rem] border flex items-center justify-between group"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div
                        className="p-3 rounded-2xl transition-colors"
                        style={{ background: item.danger ? 'rgba(239,68,68,0.10)' : `${t.orange}18` }}
                      >
                        <item.icon size={20} style={{ color: item.danger ? '#EF4444' : t.orange }} />
                      </div>
                      <div>
                        <span
                          className="font-black text-sm block"
                          style={{ color: item.danger ? '#EF4444' : t.textPrimary }}
                        >
                          {item.label}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-tight" style={{ color: t.textMuted }}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      style={{ color: t.textMuted }}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                ))}
              </div>

              <p className="text-center mt-12 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: t.textMuted }}>
                CampusRun v2.4.0
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t px-8 pt-5 pb-10 z-30 backdrop-blur-3xl"
        style={{ background: t.navBg, borderColor: t.divider }}
      >
        <div className="flex justify-between items-center max-w-md mx-auto">
          <NavButton active={activeTab === 'home'}        onClick={() => setActiveTab('home')}        icon={MapIcon}       label="Run"   isDark={isDark} />
          <NavButton active={activeTab === 'tasks'}       onClick={() => setActiveTab('tasks')}       icon={ClipboardList} label="Tasks" isDark={isDark} />
          <NavButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} icon={Trophy}        label="Rank"  isDark={isDark} />
          <NavButton active={activeTab === 'profile'}     onClick={() => setActiveTab('profile')}     icon={User}          label="Me"    isDark={isDark} />
        </div>
      </nav>
    </div>
  );
};

export default DispatcherDashboard;