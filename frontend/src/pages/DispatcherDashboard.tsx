import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon, ClipboardList, Trophy, User, Wallet,
  Navigation2, Star, TrendingUp, Zap, Package, MapPin,
  MessageSquare, ChevronRight, LogOut, Settings, ShieldCheck,
  CheckCircle2, Send, ImagePlus, ArrowLeft, WifiOff, Wifi,
  Sun, Moon, X, Building2, CreditCard, Lock,
  Clock, DollarSign, Eye, EyeOff, AlertCircle, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Delivery, DispatcherStats } from '@/lib/types';
import api from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  sender: 'dispatcher' | 'requester';
  text?: string;
  image?: string;
  timestamp: string;
}

interface DailyEarning {
  day: string;
  amount: number;
  runs: number;
}

const PAYOUT_DAYS = 7;

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const T = (isDark: boolean) => ({
  pageBg:        isDark ? '#0A1128' : '#F4F6FB',
  cardBg:        isDark ? '#131B31' : '#FFFFFF',
  cardBorder:    isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
  inputBg:       isDark ? '#0A1128' : '#F0F2F8',
  inputBorder:   isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)',
  overlayBg:     isDark ? '#0A1128' : '#F4F6FB',
  navBg:         isDark ? 'rgba(19,27,49,0.92)' : 'rgba(255,255,255,0.94)',
  headerBg:      isDark ? 'rgba(19,27,49,0.82)' : 'rgba(255,255,255,0.88)',
  sheetBg:       isDark ? '#111827' : '#FFFFFF',
  textPrimary:   isDark ? '#FFFFFF' : '#0A1128',
  textSecondary: isDark ? '#94A3B8' : '#4B5563',
  textMuted:     isDark ? '#475569' : '#9CA3AF',
  orange:        '#FF5C00',
  orangeHover:   '#FF7A30',
  green:         '#22C55E',
  red:           '#EF4444',
  divider:       isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
  pinBg:         isDark ? 'rgba(0,0,0,0.20)' : 'rgba(0,0,0,0.04)',
  whiteFaint:    isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  activeJobBorder: isDark ? 'rgba(255,92,0,0.20)' : 'rgba(255,92,0,0.30)',
  dangerBg:      isDark ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.08)',
});

const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ACTIVE_STATUSES = ['ACCEPTED', 'ON_MY_WAY', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED'] as const;

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, accent, delay, isDark }: {
  label: string; value: string | number; icon: any; accent?: boolean; delay: number; isDark: boolean;
}) => {
  const t = T(isDark);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl p-4 border" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color: accent ? t.orange : t.textSecondary }} />
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: t.textSecondary }}>
          {label}
        </span>
      </div>
      <span className="text-xl font-bold" style={{ color: accent ? t.orange : t.textPrimary }}>{value}</span>
    </motion.div>
  );
};

const NavButton = ({ active, icon: Icon, label, onClick, isDark, badge }: any) => {
  const t = T(isDark);
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 relative">
      <div className="p-2 rounded-xl transition-all duration-300" style={{
        background: active ? t.orange : 'transparent',
        color:      active ? '#FFFFFF' : t.textSecondary,
        transform:  active ? 'scale(1.10)' : 'scale(1)',
        boxShadow:  active ? `0 8px 20px ${t.orange}33` : 'none',
      }}>
        <Icon size={22} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold" style={{ color: active ? t.orange : t.textSecondary }}>{label}</span>
    </button>
  );
};

const ThemeToggle = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => {
  const t = T(isDark);
  return (
    <motion.button whileTap={{ scale: 0.92 }} onClick={onToggle}
      className="p-2 rounded-xl border transition-all"
      style={{ background: t.whiteFaint, borderColor: t.cardBorder, color: t.textSecondary }}>
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun size={18} />
          </motion.div>
        ) : (
          <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon size={18} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ─── BOTTOM SHEET WRAPPER ─────────────────────────────────────────────────────
const BottomSheet = ({ open, onClose, title, children, isDark }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; isDark: boolean;
}) => {
  const t = T(isDark);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-[2.5rem] border-t overflow-hidden"
            style={{ background: t.sheetBg, borderColor: t.cardBorder, maxHeight: '90vh' }}>
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: t.divider }} />
            </div>
            <div className="flex items-center justify-between px-6 pb-4 border-b" style={{ borderColor: t.divider }}>
              <h3 className="font-black text-lg" style={{ color: t.textPrimary }}>{title}</h3>
              <button onClick={onClose} className="p-2 rounded-xl" style={{ background: t.whiteFaint, color: t.textSecondary }}>
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── ACCOUNT SETTINGS SHEET ───────────────────────────────────────────────────
// ✅ FIX: removed withdrawing/withdrawResult state from here — it belongs in main component
const AccountSettings = ({ open, onClose, isDark }: { open: boolean; onClose: () => void; isDark: boolean }) => {
  const t = T(isDark);
  const { user } = useAuth();
  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifDelivery, setNotifDelivery] = useState(false);
  const [notifPayout, setNotifPayout] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get('/runner/notification-preferences')
      .then(r => {
        setNotifDelivery(r.data.deliveryRequests ?? false);
        setNotifPayout(r.data.payoutAlerts ?? false);
      })
      .catch(() => {});
  }, [open]);

  const handleSave = async () => {
    try {
      await api.patch('/auth/profile', { fullName: name, phone, email });
      await api.post('/runner/notification-preferences', {
        deliveryRequests: notifDelivery,
        payoutAlerts: notifPayout,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const inputStyle = {
    width: '100%',
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: 14,
    padding: '14px 16px',
    color: t.textPrimary,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: t.textMuted,
    marginBottom: 6,
    display: 'block',
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-12 h-6 rounded-full relative transition-colors duration-300"
      style={{ background: on ? t.orange : t.divider }}>
      <motion.div animate={{ x: on ? 24 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
    </button>
  );

  return (
    <BottomSheet open={open} onClose={onClose} title="Account Settings" isDark={isDark}>
      <div className="px-6 py-6 space-y-6 pb-12">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: t.textSecondary }}>
            Profile Info
          </p>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} type="email" />
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: t.textSecondary }}>
            Notifications
          </p>
          <div className="space-y-3">
            {[
              { label: 'New delivery requests', desc: 'Get notified when orders come in', on: notifDelivery, toggle: () => setNotifDelivery(p => !p) },
              { label: 'Payout alerts', desc: 'When earnings are sent to you', on: notifPayout, toggle: () => setNotifPayout(p => !p) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl border"
                style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: t.textPrimary }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: t.textSecondary }}>{item.desc}</p>
                </div>
                <Toggle on={item.on} onToggle={item.toggle} />
              </div>
            ))}
          </div>
        </div>
        <motion.button onClick={handleSave} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-black text-white text-sm"
          style={{ background: saved ? t.green : t.orange, transition: 'background 0.3s' }}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </motion.button>
      </div>
    </BottomSheet>
  );
};

// ─── PAYMENT METHODS SHEET ────────────────────────────────────────────────────
const PaymentMethods = ({ open, onClose, isDark }: { open: boolean; onClose: () => void; isDark: boolean }) => {
  const t = T(isDark);
  const [banks, setBanks]                 = useState<{ name: string; code: string }[]>([]);
  const [bankName, setBankName]           = useState('');
  const [banksError, setBanksError]       = useState(false);
  const [bankCode, setBankCode]           = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName]     = useState('');
  const [verifying, setVerifying]         = useState(false);
  const [verifyError, setVerifyError]     = useState('');
  const [saved, setSaved]                 = useState(false);
  const [saving, setSaving]               = useState(false);
  const [showNumber, setShowNumber]       = useState(false);
  const [linkedAccount, setLinkedAccount] = useState<{
    bankName: string; accountNumber: string; accountName: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    api.get('/runner/banks')
      .then(r => setBanks(r.data))
      .catch(() => setBanksError(true));
    api.get('/runner/payment-method')
      .then(r => setLinkedAccount(r.data))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) {
      setAccountName('');
      setVerifyError('');
      return;
    }
    setVerifying(true);
    setVerifyError('');
    setAccountName('');
    api.post('/runner/verify-account', { accountNumber, bankCode })
      .then(r => setAccountName(r.data.accountName))
      .catch(() => setVerifyError('Could not verify account. Check number and bank.'))
      .finally(() => setVerifying(false));
  }, [accountNumber, bankCode]);

  const handleSave = async () => {
    if (!bankName || !bankCode || !accountNumber || !accountName) return;
    setSaving(true);
    try {
      await api.post('/runner/bank-details', { bankName, bankCode, accountNumber, accountName });
      setLinkedAccount({ bankName, accountNumber, accountName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Bank save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: 14,
    padding: '14px 16px',
    color: t.textPrimary,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: t.textMuted,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Payment Methods" isDark={isDark}>
      <div className="px-6 py-6 space-y-6 pb-12">
        {linkedAccount ? (
          <div className="p-5 rounded-2xl border relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${t.orange}22, ${t.orange}08)`, borderColor: `${t.orange}30` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ background: `${t.orange}20` }}>
                <Building2 size={18} style={{ color: t.orange }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: t.textSecondary }}>
                  Linked Account
                </p>
                <p className="text-sm font-black" style={{ color: t.textPrimary }}>{linkedAccount.bankName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-black text-lg tracking-widest" style={{ color: t.textPrimary }}>
                {showNumber
                  ? linkedAccount.accountNumber
                  : `•••• •••• ${linkedAccount.accountNumber.slice(-4)}`}
              </p>
              <button onClick={() => setShowNumber(p => !p)} style={{ color: t.textSecondary }}>
                {showNumber ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-xs" style={{ color: t.textSecondary }}>{linkedAccount.accountName}</p>
            <div className="absolute top-4 right-4">
              <span className="text-[9px] font-black px-2 py-1 rounded-full"
                style={{ background: `${t.green}20`, color: t.green }}>ACTIVE</span>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border" style={{ background: t.whiteFaint, borderColor: t.cardBorder }}>
            <p className="text-sm font-bold text-center" style={{ color: t.textMuted }}>No bank account linked yet.</p>
          </div>
        )}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: t.textSecondary }}>
            Update Bank Details
          </p>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Bank</label>
              <select
                value={bankCode}
                onChange={e => {
                  const selected = banks.find(b => b.code === e.target.value);
                  setBankCode(e.target.value);
                  setBankName(selected?.name ?? '');
                  setAccountName('');
                  setVerifyError('');
                }}
                style={{ ...inputStyle, cursor: 'pointer', colorScheme: isDark ? 'dark' : 'light' }}>
                <option value="">
                  {banksError ? 'Failed to load banks — retry' : banks.length === 0 ? 'Loading banks...' : 'Select your bank...'}
                </option>
                {banks.map((b, i) => (
                  <option key={`${b.code}-${i}`} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Account Number</label>
              <input value={accountNumber} onChange={e => setAccountNumber(e.target.value.slice(0, 10))}
                placeholder="10-digit NUBAN" maxLength={10} style={inputStyle} inputMode="numeric" />
            </div>
            <div>
              <label style={labelStyle}>Account Name</label>
              <div className="relative">
                <input
                  value={verifying ? 'Verifying...' : accountName}
                  readOnly
                  placeholder={
                    !bankCode ? 'Select a bank first' :
                    accountNumber.length < 10 ? 'Enter 10-digit account number' :
                    'Auto-filled from your bank'
                  }
                  style={{ ...inputStyle, color: accountName ? t.green : t.textMuted, cursor: 'not-allowed' }}
                />
                {verifying && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {accountName && !verifying && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle2 size={16} style={{ color: t.green }} />
                  </div>
                )}
              </div>
              {verifyError && (
                <p className="text-[11px] mt-1" style={{ color: t.red }}>{verifyError}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-4 rounded-2xl" style={{ background: t.whiteFaint }}>
          <Lock size={14} className="shrink-0 mt-0.5" style={{ color: t.textMuted }} />
          <p className="text-[11px] leading-relaxed" style={{ color: t.textSecondary }}>
            Your bank details are encrypted and stored securely. They are only used for weekly payout disbursements by CampusRun admin.
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.97 }}
          disabled={!bankCode || !accountNumber || !accountName || verifying || saving}
          className="w-full py-4 rounded-2xl font-black text-white text-sm disabled:opacity-40"
          style={{ background: saved ? t.green : t.orange, transition: 'background 0.3s' }}>
          {saving ? 'Saving...' : saved ? '✓ Bank Details Saved!' : 'Save Bank Details'}
        </motion.button>
      </div>
    </BottomSheet>
  );
};

// ─── EARNINGS DETAIL MODAL ────────────────────────────────────────────────────
// ✅ FIX: added onWithdraw prop so the real withdraw action can be triggered from here
const EarningsDetail = ({ open, onClose, isDark, stats, dailyEarnings, daysSincePayout, onWithdraw, withdrawing }: {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  stats: DispatcherStats;
  dailyEarnings: DailyEarning[];
  daysSincePayout: number;
  onWithdraw: () => void;    // ✅ NEW
  withdrawing: boolean;      // ✅ NEW
}) => {
  const t = T(isDark);
  const maxAmount = Math.max(...dailyEarnings.map(d => d.amount), 1);
  const weeklyTotal = (dailyEarnings ?? []).reduce((s, d) => s + d.amount, 0);
  const today = new Date().getDay();
  const daysLeft = PAYOUT_DAYS - daysSincePayout;

  return (
    <BottomSheet open={open} onClose={onClose} title="Earnings Breakdown" isDark={isDark}>
      <div className="px-6 py-6 space-y-6 pb-12">
        <div className="p-5 rounded-2xl border" style={{ background: `${t.orange}10`, borderColor: `${t.orange}25` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={15} style={{ color: t.orange }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: t.orange }}>
                Next Payout
              </span>
            </div>
            <span className="text-[10px] font-black px-2 py-1 rounded-full"
              style={{ background: `${t.orange}20`, color: t.orange }}>
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </span>
          </div>
          <div className="w-full h-2 rounded-full mb-3" style={{ background: t.divider }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(daysSincePayout / PAYOUT_DAYS) * 100}%` }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: t.orange }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide" style={{ color: t.textMuted }}>
            <span>Day {daysSincePayout}</span>
            <span>Day {PAYOUT_DAYS} — Payout</span>
          </div>
          <p className="text-3xl font-black mt-4" style={{ color: t.orange }}>
            ₦{weeklyTotal.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: t.textSecondary }}>This week's accumulated earnings</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: t.textSecondary }}>
            Daily Earnings — This Week
          </p>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {dailyEarnings.map((day, i) => {
              const heightPct = day.amount > 0 ? (day.amount / maxAmount) * 100 : 4;
              const isToday = i === (today === 0 ? 6 : today - 1);
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-black" style={{ color: day.amount > 0 ? t.orange : t.textMuted }}>
                    {day.amount > 0 ? `₦${(day.amount / 1000).toFixed(1)}k` : ''}
                  </span>
                  <div className="w-full rounded-t-lg relative overflow-hidden" style={{
                    height: `${heightPct}%`,
                    background: isToday ? t.orange : day.amount > 0 ? `${t.orange}50` : t.divider,
                    minHeight: 4,
                    transition: 'height 0.5s ease',
                  }}>
                    {isToday && (
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.2)' }} />
                    )}
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: isToday ? t.orange : t.textMuted }}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: t.textSecondary }}>
            Breakdown
          </p>
          <div className="space-y-2">
            {[
              { label: 'Gross deliveries earned', value: `₦${weeklyTotal.toLocaleString()}` },
              { label: 'Your share (75%)', value: `₦${Math.floor(weeklyTotal * 0.75).toLocaleString()}`, accent: true },
              { label: 'Platform fee (25%)', value: `₦${Math.floor(weeklyTotal * 0.25).toLocaleString()}` },
              { label: 'All-time total earned', value: `₦${stats.totalEarnings.toLocaleString()}` },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border"
                style={{ background: row.accent ? `${t.orange}08` : t.cardBg, borderColor: row.accent ? `${t.orange}25` : t.cardBorder }}>
                <span className="text-xs font-medium" style={{ color: t.textSecondary }}>{row.label}</span>
                <span className="text-sm font-black" style={{ color: row.accent ? t.orange : t.textPrimary }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ REAL WITHDRAW BUTTON */}
        <motion.button
          onClick={onWithdraw}
          whileTap={{ scale: 0.97 }}
          disabled={withdrawing || weeklyTotal < 100}
          className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: t.orange }}>
          {withdrawing
            ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
            : weeklyTotal < 100
              ? 'Minimum withdrawal is ₦100'
              : `💸 Withdraw ₦${weeklyTotal.toLocaleString()} to Bank`}
        </motion.button>

        <p className="text-center text-[10px]" style={{ color: t.textMuted }}>
          Funds are sent directly to your linked bank account via Paystack.
        </p>
      </div>
    </BottomSheet>
  );
};

// ─── OFFLINE OVERLAY ──────────────────────────────────────────────────────────
const OfflineOverlay = ({ onGoOnline, isDark, stats }: { onGoOnline: () => void; isDark: boolean; stats: DispatcherStats | null }) => {
  const t = T(isDark);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: t.overlayBg }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#888888_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>
      <div className="relative mb-10">
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `${t.orange}33` }} />
        <div className="relative w-32 h-32 rounded-full border flex items-center justify-center shadow-2xl"
          style={{ background: t.cardBg, borderColor: t.cardBorder }}>
          <WifiOff size={48} style={{ color: t.textMuted }} />
        </div>
      </div>
      <h2 className="text-3xl font-black mb-2 tracking-tight" style={{ color: t.textPrimary }}>You're Offline</h2>
      <p className="text-sm font-medium text-center max-w-xs mb-10 leading-relaxed" 
      style={{ color: t.textSecondary }}>
        Go online to start receiving deliveries.<br/>
        <span className="text-[11px] opacity-60">
        Toggle "Available" to get SMS alerts even when the app is closed.
        </span>
        </p>
      {stats && (
        <div className="flex gap-6 mb-12">
          {[
            { label: 'Total Runs',  value: stats.totalAccepted },
            { label: 'Reliability', value: `${stats.reliability}%` },
            { label: 'Rating',      value: `${stats.averageRating}★` },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-lg font-black" style={{ color: t.orange }}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: t.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <motion.button whileTap={{ scale: 0.96 }} onClick={onGoOnline}
        className="w-64 py-5 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-3"
        style={{ background: t.orange, boxShadow: `0 16px 40px ${t.orange}44` }}>
        <Wifi size={20} /> Go Online
      </motion.button>
    </motion.div>
  );
};

// ─── DELIVERY COMPLETE ────────────────────────────────────────────────────────
const DeliveryCompleteScreen = ({ fee, onDismiss, isDark }: { fee: number; onDismiss: () => void; isDark: boolean }) => {
  const t = T(isDark);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
      style={{ background: t.overlayBg }}>
      <div className="relative mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.6 }}
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.15)' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
            style={{ background: t.green }}>
            <CheckCircle2 size={40} className="text-white" />
          </motion.div>
        </motion.div>
      </div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="text-3xl font-black mb-2 tracking-tight text-center" style={{ color: t.textPrimary }}>
        Run Complete! 🎉
      </motion.h2>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="rounded-2xl px-8 py-4 mb-10 text-center border"
        style={{ background: `${t.orange}15`, borderColor: `${t.orange}33` }}>
        <p className="text-[10px] uppercase font-black tracking-widest mb-1" style={{ color: t.textSecondary }}>You Earned</p>
        <p className="text-4xl font-black" style={{ color: t.orange }}>₦{fee.toLocaleString()}</p>
        <p className="text-[10px] mt-1" style={{ color: t.textMuted }}>Added to your weekly balance</p>
      </motion.div>
      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.96 }} onClick={onDismiss}
        className="w-full max-w-xs py-5 rounded-2xl font-black text-white"
        style={{ background: t.orange, boxShadow: `0 16px 40px ${t.orange}44` }}>
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
    { id: '1', sender: 'dispatcher', text: "Hello! I'm heading to pick up your item now. I'll send a photo of the item so you can confirm.", timestamp: nowTime() },
  ]);
  const [input, setInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const completionSentRef = useRef(false);

  useEffect(() => {
    if (isDeliveryComplete && !completionSentRef.current) {
      completionSentRef.current = true;
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'dispatcher', text: '✅ Item delivered successfully! Thanks for using CampusRun.', timestamp: nowTime() }]);
        setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setTimeout(onClose, 2000); }, 200);
      }, 300);
    }
  }, [isDeliveryComplete, onClose]);

  const send = (text?: string, image?: string) => {
    if (!text?.trim() && !image) return;
    if (isDeliveryComplete) return;
    const msg: ChatMessage = { id: Date.now().toString(), sender: 'dispatcher', text, image, timestamp: nowTime() };
    setMessages(prev => [...prev, msg]);
    setInput('');
    if (image) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'requester', text: 'Thanks! That looks right. See you soon 🙏', timestamp: nowTime() }]);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 1500);
    }
    setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => send(undefined, reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 flex flex-col" style={{ background: t.pageBg }}>
      <div className="flex items-center gap-4 px-5 py-4 border-b" style={{ background: t.headerBg, borderColor: t.divider }}>
        <button onClick={onClose} className="p-2 rounded-xl" style={{ background: t.whiteFaint, color: t.textPrimary }}><ArrowLeft size={20} /></button>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white" style={{ background: t.orange }}>{job.requesterName?.[0] ?? 'R'}</div>
        <div className="flex-1">
          <p className="font-black text-sm" style={{ color: t.textPrimary }}>{job.requesterName ?? 'Requester'}</p>
          <p className="text-[10px] font-bold uppercase" style={{ color: isDeliveryComplete ? t.textMuted : t.green }}>{isDeliveryComplete ? 'Delivery Complete' : 'Active Now'}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.sender === 'dispatcher' ? 'justify-end' : 'justify-start')}>
            <div className="max-w-[75%]" style={{ background: msg.sender === 'dispatcher' ? t.orange : t.cardBg, borderRadius: 16, padding: 10 }}>
              {msg.image && <img src={msg.image} alt='shared' className="w-full max-h-60 object-cover rounded-xl mb-2" />}
              {msg.text && <p style={{ color: msg.sender === 'dispatcher' ? '#fff' : t.textPrimary }}>{msg.text}</p>}
              <p className="text-[10px] mt-1" style={{ color: msg.sender === 'dispatcher' ? '#ffffffaa' : t.textMuted }}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t" style={{ background: t.headerBg, borderColor: t.divider }}>
        {isDeliveryComplete ? (
          <div className="text-center text-xs font-bold" style={{ color: t.textMuted }}>Chat ended — delivery complete</div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg" style={{ background: t.orange }}><ImagePlus size={16} className="text-white" /></button>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type message..." className="flex-1 px-3 py-2 rounded-lg outline-none" style={{ background: t.inputBg }} />
            <button onClick={() => send(input)} className="px-3 rounded-lg text-white" style={{ background: t.orange }}><Send size={16} /></button>
          </div>
        )}
        <input ref={fileRef} type="file" className="hidden" onChange={handleImage} />
      </div>
    </motion.div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
const DispatcherDashboard = () => {
  const [activeTab,        setActiveTab]        = useState('home');
  const [isAvailable,      setIsAvailable]      = useState(false);
  const [isOnline,         setIsOnline]         = useState(false);
  const [deliveryStep,     setDeliveryStep]     = useState<'IDLE' | 'ARRIVING' | 'PICKED_UP'>('IDLE');
  const [chatOpen,         setChatOpen]         = useState(false);
  const [deliveryComplete, setDeliveryComplete] = useState(false);
  const [settingsOpen,     setSettingsOpen]     = useState(false);
  const [paymentOpen,      setPaymentOpen]      = useState(false);
  const [earningsOpen,     setEarningsOpen]     = useState(false);

  // ✅ FIX: withdraw state lives HERE in the main component
  const [withdrawing,     setWithdrawing]     = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError,   setWithdrawError]   = useState<string | null>(null);

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true
  );

  const [deliveries,      setDeliveries]      = useState<Delivery[]>([]);
  const [stats,           setStats]           = useState<DispatcherStats | null>(null);
  const [leaderboard,     setLeaderboard]     = useState<LeaderboardEntry[]>([]);
  const [dailyEarnings,   setDailyEarnings]   = useState<DailyEarning[]>([]);
  const [daysSincePayout, setDaysSincePayout] = useState(0);
  const weeklyTotal = (dailyEarnings ?? []).reduce((s, d) => s + d.amount, 0);




  // ── Load availability on mount ────────────────────────────────────────────────
useEffect(() => {
  api.get('/runner/stats')
    .then(r => {
      setIsAvailable(r.data.isAvailable ?? true);
    })
    .catch(() => {});
}, []);


// Auto-logout after 2 minutes of the page being hidden (app backgrounded/closed)
useEffect(() => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Start 2-minute countdown
      timer = setTimeout(() => {
        logout();
        navigate('/login');
      }, 2 * 60 * 1000); // 2 minutes
    } else {
      // User came back — cancel the timer
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (timer) clearTimeout(timer);
  };
}, [logout, navigate]);

// ── Toggle availability (server persists this) ────────────────────────────────
const handleToggleAvailability = async () => {
  const newState = !isAvailable;
  setIsAvailable(newState);
  try {
    await api.post('/runner/availability', { isAvailable: newState });
  } catch {
    setIsAvailable(!newState); // revert on error
  }
};

  
  const fetchDashboardData = useCallback(async () => {
  try {
    const [deliveriesRes, statsRes, leaderboardRes, earningsRes] = await Promise.all([
      api.get('/runner/deliveries'),
      api.get('/runner/stats'),
      api.get('/runner/leaderboard'),
      api.get('/runner/earnings-breakdown'),
    ]);

    // ← Add Array.isArray guards on everything
    if (Array.isArray(deliveriesRes.data)) setDeliveries(deliveriesRes.data);
    if (statsRes.data && typeof statsRes.data === 'object') setStats(statsRes.data);
    if (Array.isArray(leaderboardRes.data)) setLeaderboard(leaderboardRes.data);

    const earningsData = earningsRes.data;
    if (earningsData) {
      const daily = earningsData.dailyEarnings ?? earningsData;
      if (Array.isArray(daily)) setDailyEarnings(daily);
      if (earningsData.daysSincePayout !== undefined) {
        setDaysSincePayout(earningsData.daysSincePayout);
      }
    }
  } catch (error) {
    console.error('Dashboard fetch error:', error);
  }
}, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // ✅ REAL WITHDRAW HANDLER
  const handleWithdraw = useCallback(async () => {
    setWithdrawing(true);
    setWithdrawError(null);
    setWithdrawSuccess(null);
    try {
      const res = await api.post('/runner/withdraw');
      setWithdrawSuccess(res.data.message ?? 'Transfer initiated! Funds on their way.');
      // Refresh balance immediately so UI shows ₦0
      await fetchDashboardData();
      // Auto-clear success message after 5 seconds
      setTimeout(() => setWithdrawSuccess(null), 5000);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Withdrawal failed. Try again.';
      setWithdrawError(msg);
      setTimeout(() => setWithdrawError(null), 5000);
    } finally {
      setWithdrawing(false);
    }
  }, [fetchDashboardData]);

  const updateLocation = useCallback(async (lat: number, lng: number, online: boolean) => {
    try {
      await api.post('/runner/location', { lat, lng, isOnline: online });
    } catch (err) {
      console.error('Location update failed:', err);
    }
  }, []);

  const locationWatchRef = useRef<number | null>(null);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => { updateLocation(pos.coords.latitude, pos.coords.longitude, true); },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => { updateLocation(pos.coords.latitude, pos.coords.longitude, true); },
      (err) => console.error('GPS watch error:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }, [updateLocation]);

  const stopLocationTracking = useCallback(() => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    updateLocation(0, 0, false);
  }, [updateLocation]);

  useEffect(() => {
    if (isOnline) startLocationTracking();
    else stopLocationTracking();
    return () => {
      if (locationWatchRef.current !== null) navigator.geolocation.clearWatch(locationWatchRef.current);
    };
  }, [isOnline, startLocationTracking, stopLocationTracking]);

  // useEffect(() => {
    // const handleUnload = () => {
      // const token = localStorage.getItem('campusrun_token');
      // navigator.sendBeacon('/api/runner/location-unload', new Blob([JSON.stringify({ lat: 0, lng: 0, isOnline: false, token })], { type: 'application/json' }));
    // };
    // window.addEventListener('beforeunload', handleUnload);
    // return () => window.removeEventListener('beforeunload', handleUnload);
  // }, []);

  const t = T(isDark);

  const currentJob = useMemo(
    () => deliveries.find(d => (ACTIVE_STATUSES as readonly string[]).includes(d.status)),
    [deliveries],
  );

  const handleStepUpdate = () => {
    if      (deliveryStep === 'IDLE')      setDeliveryStep('ARRIVING');
    else if (deliveryStep === 'ARRIVING')  setDeliveryStep('PICKED_UP');
    else if (deliveryStep === 'PICKED_UP') { setDeliveryComplete(true); setDeliveryStep('IDLE'); }
  };

  const handleDismissComplete = () => { setDeliveryComplete(false); setChatOpen(false); };
  const handleSignOut = () => { logout(); navigate('/login'); };
  const stepLabel = { IDLE: 'Heading to Pickup', ARRIVING: 'On My Way', PICKED_UP: 'Item Picked Up' }[deliveryStep];
  const maxBar = Math.max(...(dailyEarnings ?? []).map(d => d.amount), 1);
  const daysLeft    = PAYOUT_DAYS - daysSincePayout;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans" style={{ background: t.pageBg, color: t.textPrimary }}>

      <AccountSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} isDark={isDark} />
      <PaymentMethods  open={paymentOpen}  onClose={() => setPaymentOpen(false)}  isDark={isDark} />
      {stats && (
        // ✅ FIX: pass onWithdraw and withdrawing down into EarningsDetail
        <EarningsDetail
          open={earningsOpen}
          onClose={() => setEarningsOpen(false)}
          isDark={isDark}
          stats={stats}
          dailyEarnings={dailyEarnings}
          daysSincePayout={daysSincePayout}
          onWithdraw={handleWithdraw}
          withdrawing={withdrawing}
        />
      )}

      {/* ✅ Toast notifications for withdraw result */}
      <AnimatePresence>
        {(withdrawSuccess || withdrawError) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-[200] p-4 rounded-2xl flex items-start gap-3 shadow-2xl"
            style={{ background: withdrawSuccess ? t.green : t.red }}>
            {withdrawSuccess
              ? <CheckCircle2 size={18} className="text-white shrink-0 mt-0.5" />
              : <AlertCircle  size={18} className="text-white shrink-0 mt-0.5" />}
            <p className="text-white text-sm font-bold flex-1">
              {withdrawSuccess ?? withdrawError}
            </p>
            <button onClick={() => { setWithdrawSuccess(null); setWithdrawError(null); }} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>     <AnimatePresence>
        {deliveryComplete && !chatOpen && (
          <DeliveryCompleteScreen fee={currentJob?.fee ?? 0} onDismiss={handleDismissComplete} isDark={isDark} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {chatOpen && currentJob && (
          <ChatRoom job={currentJob} onClose={() => setChatOpen(false)} isDeliveryComplete={deliveryComplete} isDark={isDark} />
        )}
      </AnimatePresence>

      {/* Header */}
      {/* Header */}
        <header className="px-6 py-4 flex justify-between items-center border-b backdrop-blur-xl z-20"
        style={{ background: t.headerBg, borderColor: t.divider }}>
        <h1 className="font-black text-xl tracking-tight" style={{ color: t.textPrimary }}>
            CAMPUS<span style={{ color: t.orange }}>RUN</span>
        </h1>
        <div className="flex items-center gap-3">
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />

    {/* ── Available toggle (persists) ── */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ background: 'transparent', borderColor: t.cardBorder }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22C55E' }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#22C55E' }}>
             SMS Alerts On
            </span>
            </div>
            <span className="text-[8px]" style={{ color: t.textMuted }}>Always available</span>
            </div>
            </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative overflow-y-auto pb-32">
        <AnimatePresence mode="wait">

          {/* RUN TAB */}
          {activeTab === 'home' && (
  <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
    <div className="flex-1 relative overflow-hidden min-h-[70vh]" style={{ background: t.pageBg }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#888888_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="absolute inset-0 p-6 flex flex-col justify-center pointer-events-none">

        {/* ── OFFLINE: prominent Go Online card ── */}
        {!isOnline && !currentJob && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="pointer-events-auto mx-4"
          >
            <div className="flex justify-center mb-8 relative">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute w-32 h-32 rounded-full"
                style={{ background: `${t.orange}33`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              />
              <div className="w-24 h-24 rounded-full flex items-center justify-center border shadow-2xl"
                style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                <WifiOff size={36} style={{ color: t.textMuted }} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center mb-2" style={{ color: t.textPrimary }}>You're Offline</h2>
            <p className="text-sm text-center mb-8 leading-relaxed" style={{ color: t.textSecondary }}>
              Tap below to go online and start receiving delivery requests.
            </p>
            {stats && (
              <div className="flex justify-center gap-8 mb-8">
                {[
                  { label: 'Total Runs',  value: stats.totalAccepted },
                  { label: 'Reliability', value: `${stats.reliability}%` },
                  { label: 'Rating',      value: `${stats.averageRating}★` },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg font-black" style={{ color: t.orange }}>{s.value}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: t.textMuted }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsOnline(true)}
              className="w-full py-6 rounded-[2rem] font-black text-xl text-white flex items-center justify-center gap-3 shadow-2xl"
              style={{ background: t.orange, boxShadow: `0 20px 50px ${t.orange}55` }}
            >
              <Wifi size={24} /> Go Online
            </motion.button>
          </motion.div>
        )}

        {/* ── ONLINE, no job: Scanning card ── */}
        {isOnline && !currentJob && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="pointer-events-auto mx-4"
          >
            <div className="flex justify-center mb-6 relative">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-28 h-28 rounded-full"
                style={{ background: `${t.orange}44`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              />
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: t.orange }}>
                <Package size={32} className="text-white" />
              </div>
            </div>
            <div className="p-8 rounded-[2.5rem] text-center border shadow-xl"
              style={{ background: t.cardBg, borderColor: `${t.orange}30` }}>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] font-black uppercase tracking-[0.3em] mb-2"
                style={{ color: t.orange }}
              >
                ● Live
              </motion.div>
              <p className="font-black text-2xl mb-1" style={{ color: t.textPrimary }}>Scanning Campus...</p>
              <p className="text-sm" style={{ color: t.textSecondary }}>
                You'll be notified the moment a delivery comes in near you.
              </p>
              <button
                onClick={() => setIsOnline(false)}
                className="mt-6 px-6 py-2 rounded-full text-xs font-bold border transition-all"
                style={{ borderColor: t.cardBorder, color: t.textMuted, background: t.whiteFaint }}
              >
                Go Offline
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ONLINE, active job ── */}
        {isOnline && currentJob && (
          <motion.div layoutId="active-job" className="p-6 rounded-[2.5rem] border shadow-2xl pointer-events-auto"
            style={{ background: t.cardBg, borderColor: t.activeJobBorder }}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit"
                  style={{ background: `${t.orange}22`, color: t.orange }}>Active Task</span>
                <p className="font-black text-lg mt-1" style={{ color: t.textPrimary }}>{currentJob.itemDescription}</p>
              </div>
              <div className="flex items-center gap-1 font-bold text-xs px-3 py-1 rounded-full"
                style={{ color: t.green, background: `${t.green}18` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.green }} />
                {stepLabel}
              </div>
            </div>
            <div className="space-y-5 mb-6 relative px-2">
              <div className="absolute left-[15px] top-3 bottom-3 w-[2px] opacity-20"
                style={{ background: `linear-gradient(to bottom, ${t.orange}, ${t.green})` }} />
              <div className="flex gap-4 items-center">
                <div className="w-4 h-4 rounded-full z-10 flex items-center justify-center"
                  style={{ background: deliveryStep !== 'IDLE' ? t.green : t.orange }}>
                  {deliveryStep !== 'IDLE' && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-black" style={{ color: t.textSecondary }}>Pick up</p>
                  <p className="font-bold text-sm" style={{ color: t.textPrimary }}>{currentJob.pickupLocation}</p>
                </div>
                <MapPin size={16} style={{ color: t.orange }} />
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-4 h-4 rounded-full border-2 z-10"
                  style={{ borderColor: t.pageBg, background: deliveryStep === 'PICKED_UP' ? t.green : t.divider }} />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-black" style={{ color: t.textSecondary }}>Drop off</p>
                  <p className="font-bold text-sm" style={{ color: t.textPrimary }}>{currentJob.dropoffLocation}</p>
                </div>
                <Navigation2 size={16} style={{ color: t.textSecondary }} />
              </div>
            </div>
            <div className="rounded-3xl p-4 mb-6 border flex flex-col items-center"
              style={{ background: t.pinBg, borderColor: t.cardBorder }}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: t.textMuted }}>
                Security Handshake PIN
              </span>
              <span className="text-4xl font-black tracking-[0.3em]" style={{ color: t.orange }}>
                {currentJob.pin}
              </span>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleStepUpdate}
                className="flex-1 text-white py-7 rounded-2xl font-black"
                style={{ background: t.orange, boxShadow: `0 8px 24px ${t.orange}44` }}>
                {deliveryStep === 'IDLE'      && 'Arrived at Pickup'}
                {deliveryStep === 'ARRIVING'  && 'Confirm Pickup'}
                {deliveryStep === 'PICKED_UP' && 'Complete Delivery'}
              </Button>
              <Button onClick={() => setChatOpen(true)} variant="outline"
                className="w-16 h-16 rounded-2xl transition-all"
                style={{ borderColor: t.cardBorder, background: t.whiteFaint, color: t.orange }}>
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
                  <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-3xl border flex justify-between items-center"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}>
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

          {/* RANK / PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <motion.div key="performance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6">
              {/* Wallet card */}
              <div className="p-8 rounded-[3rem] shadow-xl relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${t.orange}, #E65100)` }}>
                <Wallet className="absolute -right-6 -bottom-6 text-white/10" size={160} />
                <p className="text-white/80 text-xs font-black uppercase tracking-[0.2em] mb-1">Weekly Balance</p>
                <h2 className="text-5xl font-black text-white mb-2">₦{weeklyTotal.toLocaleString()}</h2>
                <p className="text-white/60 text-xs mb-6 font-medium">
                  Payout in <span className="font-black text-white">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                </p>
                <div className="w-full h-1.5 rounded-full bg-white/20 mb-6">
                  <div className="h-full rounded-full bg-white" style={{ width: `${(daysSincePayout / PAYOUT_DAYS) * 100}%` }} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setEarningsOpen(true)}
                    className="bg-white font-black rounded-2xl px-8 py-6 hover:bg-white/90" style={{ color: t.orange }}>
                    View Details
                  </Button>
                  {/* ✅ FIX: Withdraw now calls handleWithdraw directly, not setEarningsOpen */}
                  <Button
                    onClick={handleWithdraw}
                    disabled={withdrawing || weeklyTotal < 100}
                    variant="ghost"
                    className="text-white/80 font-bold hover:text-white disabled:opacity-50 flex items-center gap-2">
                    {withdrawing
                      ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                      : '💸 Withdraw'}
                  </Button>
                </div>
              </div>

              {/* Daily earnings bar chart */}
              <div className="p-5 rounded-3xl border" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: t.textSecondary }}>
                  Earnings — This Week
                </p>
                <div className="flex items-end gap-2" style={{ height: 80 }}>
                  {dailyEarnings.map((day, i) => {
                    const today = new Date().getDay();
                    const isToday = i === (today === 0 ? 6 : today - 1);
                    const h = day.amount > 0 ? (day.amount / maxBar) * 100 : 4;
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                        {day.amount > 0 && (
                          <span className="text-[8px] font-black" style={{ color: isToday ? t.orange : t.textMuted }}>
                            ₦{(day.amount / 1000).toFixed(1)}k
                          </span>
                        )}
                        <div className="w-full rounded-t-lg" style={{
                          height: `${h}%`, minHeight: 4,
                          background: isToday ? t.orange : day.amount > 0 ? `${t.orange}50` : t.divider,
                        }} />
                        <span className="text-[9px] font-bold" style={{ color: isToday ? t.orange : t.textMuted }}>
                          {day.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Reliability" value={`${stats.reliability}%`}   icon={TrendingUp} accent delay={0.1} isDark={isDark} />
                  <StatCard label="Total Tasks" value={stats.completed}            icon={Zap}         delay={0.2} isDark={isDark} />
                  <StatCard label="Avg Rating"  value={`${stats.averageRating}★`} icon={Star}  accent delay={0.3} isDark={isDark} />
                  <StatCard label="Total Runs"  value={stats.totalAccepted}        icon={Package}     delay={0.4} isDark={isDark} />
                </div>
              )}

              <section className="pt-4">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h3 className="font-black text-xl flex items-center gap-2" style={{ color: t.textPrimary }}>
                    <Trophy size={22} style={{ color: t.orange }} /> LEADERBOARD
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full"
                    style={{ color: t.textSecondary, background: t.whiteFaint }}>Weekly</span>
                </div>
                {leaderboard.length > 0 ? (
                  <div className="rounded-[2.5rem] overflow-hidden border divide-y"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                    {leaderboard.slice(0, 5).map((entry, i) => (
                      <div key={`${entry.dispatcherId}-${i}`} className="flex items-center gap-4 p-5"
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
                ) : (
                  <p className="text-center text-sm py-8" style={{ color: t.textMuted }}>No leaderboard data yet.</p>
                )}
              </section>
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
              <div className="flex flex-col items-center py-10">
                <div className="relative">
                  <div className="w-28 h-28 rounded-[2.5rem] p-1.5 mb-6 rotate-3"
                    style={{ background: `linear-gradient(135deg, ${t.orange}, ${t.orangeHover})` }}>
                    <div className="w-full h-full rounded-[2.2rem] flex items-center justify-center overflow-hidden -rotate-3"
                      style={{ background: t.pageBg }}>
                      <User size={54} style={{ color: t.textMuted }} />
                    </div>
                  </div>
                  <div className="absolute -right-2 bottom-4 w-6 h-6 rounded-full border-4"
                    style={{ background: t.green, borderColor: t.pageBg }} />
                </div>
                <h2 className="text-2xl font-black tracking-tight" style={{ color: t.textPrimary }}>
                  {user?.fullName ?? '—'}
                </h2>
                <div className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full border"
                  style={{ background: t.whiteFaint, borderColor: t.cardBorder }}>
                  <ShieldCheck size={14} style={{ color: t.orange }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: t.textSecondary }}>
                    Verified Campus Runner
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Settings,   label: 'Account Settings',   desc: 'Name, phone, notifications',  danger: false, action: () => setSettingsOpen(true) },
                  { icon: CreditCard, label: 'Payment Methods',    desc: 'Bank details for payouts',     danger: false, action: () => setPaymentOpen(true) },
                  { icon: DollarSign, label: 'Earnings & Payouts', desc: 'View your balance breakdown',  danger: false, action: () => setEarningsOpen(true) },
                  { icon: LogOut,     label: 'Sign Out',            desc: 'Securely exit your account',  danger: true,  action: handleSignOut },
                ].map((item, i) => (
                  <motion.button key={i} onClick={item.action} whileTap={{ scale: 0.98 }}
                    className="w-full p-5 rounded-[2rem] border flex items-center justify-between group active:opacity-80"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-3 rounded-2xl" style={{ background: item.danger ? t.dangerBg : `${t.orange}18` }}>
                        <item.icon size={20} style={{ color: item.danger ? t.red : t.orange }} />
                      </div>
                      <div>
                        <span className="font-black text-sm block" style={{ color: item.danger ? t.red : t.textPrimary }}>{item.label}</span>
                        <span className="text-[10px] font-medium uppercase tracking-tight" style={{ color: t.textMuted }}>{item.desc}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: t.textMuted }} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                ))}
              </div>
              <p className="text-center mt-12 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: t.textMuted }}>
                CampusRun v1.0.0
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t px-8 pt-5 pb-10 z-30 backdrop-blur-3xl"
        style={{ background: t.navBg, borderColor: t.divider }}>
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