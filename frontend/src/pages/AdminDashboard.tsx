// FRONTEND: src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api'; // ← uses your token-attached instance
import {
  Users, Package, CheckCircle, Clock,
  ShieldAlert, Search, TrendingUp, Loader2,
  RefreshCw, Eye, LogOut, Calendar, DollarSign,
  AlertTriangle, Activity, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Stats {
  totalUsers:         number;
  totalOrders:        number;
  completedOrders:    number;
  pendingDispatchers: number;
  totalRevenue:       number;
  weeklyRevenue:      number;
  monthlyRevenue:     number;
  suspendedRunners:   number;
  activeRunners:      number;
}

interface PendingDispatcher {
  id:                   string;
  fullName:             string;
  email:                string;
  matricNumber:         string | null;
  department:           string | null;
  reasonToJoin:         string | null;
  idCardUrl:            string | null;
  selfieUrl:            string | null;
  aiIdCardReal:         boolean | null;
  aiFaceMatchScore:     number | null;
  aiVerificationFlag:   boolean | null;
  applicationSubmittedAt: string | null;
}

interface UserRow {
  id:             string;
  fullName:       string;
  email:          string;
  role:           string;
  isApproved:     boolean;
  isVerified:     boolean;
  isSuspended:    boolean;
  matricNumber:   string | null;
  department:     string | null;
  createdAt:      string;
  _count:         { deliveries: number; runs: number };
}

interface Delivery {
  id:             string;
  item:           string;
  status:         string;
  totalPrice:     number;
  distanceMeters: number;
  pickupAddress:  string;
  dropoffAddress: string;
  createdAt:      string;
  requester:      { fullName: string; email: string };
  runner:         { fullName: string; email: string } | null;
}

// ── Status colors ─────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  PENDING:         'bg-slate-500/10 text-slate-400',
  PENDING_PAYMENT: 'bg-yellow-500/10 text-yellow-400',
  PAID:            'bg-blue-500/10 text-blue-400',
  ACCEPTED:        'bg-purple-500/10 text-purple-400',
  PICKED_UP:       'bg-orange-500/10 text-orange-400',
  DELIVERED:       'bg-teal-500/10 text-teal-400',
  COMPLETED:       'bg-green-500/10 text-green-400',
  CANCELLED:       'bg-red-500/10 text-red-400',
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [stats,      setStats]      = useState<Stats | null>(null);
  const [pending,    setPending]    = useState<PendingDispatcher[]>([]);
  const [users,      setUsers]      = useState<UserRow[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [actionId,   setActionId]   = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState<'overview' | 'users' | 'orders' | 'runners'>('overview');

  // Interview modal state
  const [interviewModal, setInterviewModal] = useState<{ userId: string; name: string } | null>(null);
  const [meetLink,       setMeetLink]       = useState('');
  const [meetTime,       setMeetTime]       = useState('');

  // Reject modal state
  const [rejectModal,  setRejectModal]  = useState<{ userId: string; name: string; postInterview?: boolean } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Nudge modal state
  const [nudgeModal,   setNudgeModal]   = useState<{ userId: string; name: string } | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState('');

  // ── Fetch all data ────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, usersRes, deliveriesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/dispatchers/pending'),
        api.get('/admin/users'),
        api.get('/admin/deliveries'),
      ]);
      setStats(statsRes.data);
      setPending(pendingRes.data);
      setUsers(usersRes.data);
      setDeliveries(deliveriesRes.data);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Approve dispatcher ────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await api.put(`/admin/dispatchers/${id}/approve`);
      setPending(prev => prev.filter(d => d.id !== id));
      setStats(prev => prev ? { ...prev, pendingDispatchers: prev.pendingDispatchers - 1 } : prev);
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setActionId(null);
    }
  };

  // ── Schedule interview ───────────────────────────────────────────────────────

  const handleScheduleInterview = async () => {
  // Use userId as it is the property defined in your type
  const targetId = interviewModal?.userId;

  if (!meetLink || !targetId) {
    console.error('Missing meetLink or Dispatcher ID');
    return;
  }

  setActionId(targetId);

  try {
    // This targetId (which is the userId) is sent to the backend as req.params.id
    await api.put(`/admin/dispatchers/${targetId}/interview`, {
      meetLink,
      scheduledTime: meetTime || undefined,
    });

    // Success logic
    setPending(prev => prev.filter(d => d.id !== targetId)); // Use 'id' if the list items have 'id'
    setInterviewModal(null);
    setMeetLink('');
    setMeetTime('');
    
    // If you have a toast library installed:
    // toast.success("Interview email sent!"); 

  } catch (error) {
    console.error('Interview error:', error.response?.data?.message || error.message);
  } finally {
    setActionId(null);
  }
};

  // ── Reject dispatcher ─────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectModal) return;
    setActionId(rejectModal.userId);
    try {
      await api.put(`/admin/dispatchers/${rejectModal.userId}/reject`, {
        reason:        rejectReason || undefined,
        postInterview: rejectModal.postInterview ?? false,
      });
      setPending(prev => prev.filter(d => d.id !== rejectModal.userId));
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      console.error('Reject error:', error);
    } finally {
      setActionId(null);
    }
  };

  // ── Suspend runner ────────────────────────────────────────────────────────────
  const handleSuspend = async (id: string, name: string) => {
    const reason = prompt(`Reason for suspending ${name}? (optional)`);
    setActionId(id);
    try {
      await api.put(`/admin/runners/${id}/suspend`, { reason, days: 7 });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isSuspended: true } : u));
    } catch (error) {
      console.error('Suspend error:', error);
    } finally {
      setActionId(null);
    }
  };

  // ── Lift suspension ───────────────────────────────────────────────────────────
  const handleLiftSuspension = async (id: string) => {
    setActionId(id);
    try {
      await api.put(`/admin/runners/${id}/lift-suspension`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isSuspended: false } : u));
    } catch (error) {
      console.error('Lift suspension error:', error);
    } finally {
      setActionId(null);
    }
  };

  // ── Send nudge email ──────────────────────────────────────────────────────────
  const handleNudge = async () => {
    if (!nudgeModal) return;
    setActionId(nudgeModal.userId);
    try {
      await api.post(`/admin/runners/${nudgeModal.userId}/nudge`, {
        message: nudgeMessage || undefined,
      });
      setNudgeModal(null);
      setNudgeMessage('');
    } catch (error) {
      console.error('Nudge error:', error);
    } finally {
      setActionId(null);
    }
  };

  // ── Filtered data ─────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.matricNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const runners = users.filter(u => u.role === 'DISPATCHER');

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1113] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#FF6B00] mx-auto mb-4" />
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">
            Loading Control Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1113] text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#0F1113]/95 backdrop-blur border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6B00]/20 p-2 rounded-xl">
              <ShieldAlert size={20} className="text-[#FF6B00]" />
            </div>
            <div>
              <h1 className="font-black text-white uppercase tracking-tight text-lg leading-none">
                Control <span className="text-[#FF6B00]">Center</span>
              </h1>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                CampusRun Admin — Internal Only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Revenue Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Revenue */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#FF6B00]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">
                Total Revenue
              </span>
            </div>
            <p className="text-3xl font-black text-white">
              ₦{Number(stats?.totalRevenue ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-white/30 mt-1">All time company earnings</p>
          </motion.div>

          {/* Monthly Revenue */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                This Month
              </span>
            </div>
            <p className="text-3xl font-black text-white">
              ₦{Number(stats?.monthlyRevenue ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-white/30 mt-1">Revenue this calendar month</p>
          </motion.div>

          {/* Weekly Revenue */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-green-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                This Week
              </span>
            </div>
            <p className="text-3xl font-black text-white">
              ₦{Number(stats?.weeklyRevenue ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-white/30 mt-1">Revenue last 7 days</p>
          </motion.div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Users',    value: stats?.totalUsers ?? 0,          icon: Users,        color: 'text-blue-400' },
            { label: 'Total Orders',   value: stats?.totalOrders ?? 0,         icon: Package,      color: 'text-orange-400' },
            { label: 'Completed',      value: stats?.completedOrders ?? 0,     icon: CheckCircle,  color: 'text-green-400' },
            { label: 'Awaiting',       value: stats?.pendingDispatchers ?? 0,  icon: Clock,        color: 'text-yellow-400' },
            { label: 'Active Runners', value: stats?.activeRunners ?? 0,       icon: Activity,     color: 'text-teal-400' },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <stat.icon size={14} className={stat.color} />
                <span className="text-[9px] uppercase font-black tracking-widest text-white/30">
                  {stat.label}
                </span>
              </div>
              <span className="text-2xl font-black text-white">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* ── Suspended runners warning ── */}
        {(stats?.suspendedRunners ?? 0) > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 mb-6">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400 font-bold">
              {stats?.suspendedRunners} runner(s) currently suspended
            </p>
            <button onClick={() => setActiveTab('runners')}
              className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300">
              View →
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['overview', 'users', 'orders', 'runners'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
              )}>
              {tab}
              {tab === 'overview' && pending.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Pending Approvals */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Clock size={14} className="text-yellow-400" />
                  Dispatcher Applications
                </h2>
                <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {pending.length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {pending.length > 0 ? pending.map((dispatcher, i) => (
                  <motion.div key={dispatcher.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-5 hover:border-[#FF6B00]/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-white text-sm">{dispatcher.fullName}</p>
                          {/* AI verification badges */}
                          {dispatcher.aiVerificationFlag === false && (
                            <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-black">
                              AI ✓
                            </span>
                          )}
                          {dispatcher.aiVerificationFlag === true && (
                            <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-black">
                              AI Flagged
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                          {dispatcher.matricNumber ?? 'No matric'} · {dispatcher.department ?? 'No dept'}
                        </p>
                        {dispatcher.reasonToJoin && (
                          <p className="text-xs text-white/50 mt-2 line-clamp-2 italic">
                            "{dispatcher.reasonToJoin}"
                          </p>
                        )}
                        {dispatcher.aiFaceMatchScore !== null && (
                          <p className="text-[10px] text-white/30 mt-1">
                            Face match: {Math.round((dispatcher.aiFaceMatchScore ?? 0) * 100)}%
                          </p>
                        )}
                        <div className="flex gap-3 mt-3">
                          {dispatcher.idCardUrl && (
                            <a href={dispatcher.idCardUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-blue-400 flex items-center gap-1 hover:underline">
                              <Eye size={10} /> View ID Card
                            </a>
                          )}
                          {dispatcher.selfieUrl && (
                            <a href={dispatcher.selfieUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-purple-400 flex items-center gap-1 hover:underline">
                              <Eye size={10} /> View Selfie
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button size="sm"
                          onClick={() => setInterviewModal({ userId: dispatcher.id, name: dispatcher.fullName })}
                          className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border-0 h-8 px-3 rounded-xl text-[10px] font-black uppercase">
                          Interview
                        </Button>
                        <Button size="sm"
                          onClick={() => handleApprove(dispatcher.id)}
                          disabled={actionId === dispatcher.id}
                          className="bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white border-0 h-8 px-3 rounded-xl text-[10px] font-black uppercase">
                          {actionId === dispatcher.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : 'Approve'
                          }
                        </Button>
                        <Button size="sm"
                          onClick={() => setRejectModal({ userId: dispatcher.id, name: dispatcher.fullName })}
                          className="bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border-0 h-8 px-3 rounded-xl text-[10px] font-black uppercase">
                          Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="bg-[#1A1C1E]/50 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                    <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                    <p className="text-white/30 text-sm font-bold">No pending applications</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent orders sidebar */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2 mb-4">
                <Package size={14} className="text-[#FF6B00]" />
                Recent Orders
              </h2>
              <div className="bg-[#1A1C1E] border border-white/5 rounded-2xl overflow-hidden">
                {deliveries.length === 0 ? (
                  <div className="p-6 text-center text-white/30 text-xs font-bold">No orders yet</div>
                ) : deliveries.slice(0, 8).map((d) => (
                  <div key={d.id}
                    className="p-4 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white truncate">{d.item}</p>
                        <p className="text-[10px] text-white/40 mt-0.5 truncate">{d.requester.fullName}</p>
                      </div>
                      <span className={cn(
                        'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0',
                        statusColor[d.status] ?? 'bg-white/5 text-white/40'
                      )}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#FF6B00] font-black mt-1">
                      ₦{Number(d.totalPrice).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  placeholder="Search by name, email, matric..."
                  className="pl-9 bg-[#1A1C1E] border-white/5 rounded-xl text-white placeholder:text-white/20 text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                {filteredUsers.length} users
              </span>
            </div>

            <div className="bg-[#1A1C1E] border border-white/5 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                {['Name', 'Role', 'Orders', 'Status', 'Joined'].map(h => (
                  <span key={h} className="text-[9px] font-black uppercase tracking-widest text-white/30">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-white/5">
                {filteredUsers.map(user => (
                  <div key={user.id} className="grid grid-cols-5 px-5 py-3 hover:bg-white/[0.02] items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
                      <p className="text-[10px] text-white/30 truncate">{user.email}</p>
                    </div>
                    <span className={cn(
                      'text-[9px] font-black uppercase px-2 py-0.5 rounded-lg w-fit',
                      user.role === 'ADMIN'      ? 'bg-red-500/10 text-red-400' :
                      user.role === 'DISPATCHER' ? 'bg-purple-500/10 text-purple-400' :
                                                   'bg-blue-500/10 text-blue-400'
                    )}>
                      {user.role}
                    </span>
                    <p className="text-xs text-white/40">
                      {user._count?.deliveries ?? 0} req · {user._count?.runs ?? 0} runs
                    </p>
                    <span className={cn(
                      'text-[9px] font-black uppercase px-2 py-0.5 rounded-lg w-fit',
                      user.isVerified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    )}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <p className="text-[10px] text-white/30">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6">
              All Deliveries — {deliveries.length} total
            </h2>
            <div className="bg-[#1A1C1E] border border-white/5 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                {['Item', 'Requester', 'Runner', 'Amount', 'Status'].map(h => (
                  <span key={h} className="text-[9px] font-black uppercase tracking-widest text-white/30">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-white/5">
                {deliveries.map(d => (
                  <div key={d.id} className="grid grid-cols-5 px-5 py-3 hover:bg-white/[0.02] items-center">
                    <p className="text-sm font-bold text-white truncate">{d.item}</p>
                    <p className="text-xs text-white/50 truncate">{d.requester.fullName}</p>
                    <p className="text-xs text-white/50 truncate">
                      {d.runner?.fullName ?? <span className="text-white/20 italic">Unassigned</span>}
                    </p>
                    <p className="text-xs font-black text-[#FF6B00]">
                      ₦{Number(d.totalPrice).toLocaleString()}
                    </p>
                    <span className={cn(
                      'text-[9px] font-black uppercase px-2 py-0.5 rounded-lg w-fit',
                      statusColor[d.status] ?? 'bg-white/5 text-white/40'
                    )}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RUNNERS TAB ── */}
        {activeTab === 'runners' && (
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6">
              Registered Runners — {runners.length} total
            </h2>
            <div className="space-y-3">
              {runners.length === 0 ? (
                <div className="bg-[#1A1C1E]/50 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-white/30 text-sm font-bold">No runners yet</p>
                </div>
              ) : runners.map((runner, i) => (
                <motion.div key={runner.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    'bg-[#1A1C1E] border rounded-2xl p-5 transition-colors',
                    runner.isSuspended ? 'border-red-500/30' : 'border-white/5'
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-white text-sm">{runner.fullName}</p>
                        {runner.isSuspended && (
                          <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-black">
                            Suspended
                          </span>
                        )}
                        {runner.isApproved && !runner.isSuspended && (
                          <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-black">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/40">
                        {runner.email} · {runner.department ?? 'No dept'}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {runner._count?.runs ?? 0} deliveries completed
                      </p>
                    </div>

                    {/* Runner actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setNudgeModal({ userId: runner.id, name: runner.fullName })}
                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        title="Send nudge email">
                        <Mail size={14} />
                      </button>
                      {runner.isSuspended ? (
                        <button
                          onClick={() => handleLiftSuspension(runner.id)}
                          disabled={actionId === runner.id}
                          className="px-3 py-1.5 rounded-xl bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white transition-colors text-[10px] font-black uppercase">
                          Lift Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(runner.id, runner.fullName)}
                          disabled={actionId === runner.id}
                          className="px-3 py-1.5 rounded-xl bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-colors text-[10px] font-black uppercase">
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── INTERVIEW MODAL ── */}
      {interviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[500] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-black text-white uppercase tracking-wide mb-1">Schedule Interview</h3>
            <p className="text-white/40 text-xs mb-6">{interviewModal.name}</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 block">
                  Google Meet Link *
                </label>
                <input type="url" placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={meetLink} onChange={e => setMeetLink(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF6B00]/50" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 block">
                  Scheduled Time (optional)
                </label>
                <input type="datetime-local" value={meetTime} onChange={e => setMeetTime(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF6B00]/50" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setInterviewModal(null); setMeetLink(''); setMeetTime(''); }}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white/40 text-xs font-black uppercase hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handleScheduleInterview} disabled={!meetLink || !!actionId}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase hover:bg-blue-700 disabled:opacity-40">
                Send Interview Email
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[500] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-black text-white uppercase tracking-wide mb-1">Reject Application</h3>
            <p className="text-white/40 text-xs mb-6">{rejectModal.name}</p>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 block">
                Reason (optional — included in email)
              </label>
              <textarea placeholder="e.g. Application did not meet our current requirements..."
                value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 resize-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white/40 text-xs font-black uppercase hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handleReject} disabled={!!actionId}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-black uppercase hover:bg-red-700 disabled:opacity-40">
                Reject & Send Email
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── NUDGE MODAL ── */}
      {nudgeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[500] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-black text-white uppercase tracking-wide mb-1">Send Nudge Email</h3>
            <p className="text-white/40 text-xs mb-6">{nudgeModal.name}</p>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 block">
                Custom Message (optional)
              </label>
              <textarea
                placeholder="Leave blank to send default 'we miss you' message..."
                value={nudgeMessage} onChange={e => setNudgeMessage(e.target.value)} rows={4}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 resize-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setNudgeModal(null); setNudgeMessage(''); }}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white/40 text-xs font-black uppercase hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handleNudge} disabled={!!actionId}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase hover:bg-blue-700 disabled:opacity-40">
                Send Email
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;