import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  mockDeliveries, 
  mockUsers 
} from '@/lib/mock-data';
import { User, Delivery } from '@/lib/types';
import DeliveryCard from '@/components/DeliveryCard';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter for pending dispatchers based on updated types
  const pendingDispatchers = users.filter(
    u => u.role === 'dispatcher' && u.dispatcherStatus === 'pending'
  );

  const allDeliveries: Delivery[] = mockDeliveries;

  const approveDispatcher = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, dispatcherStatus: 'approved' as const } : u
    ));
  };

  const rejectDispatcher = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, dispatcherStatus: 'rejected' as const } : u
    ));
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.matricNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F1113] text-foreground p-6 pb-20">
      {/* Admin Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#FF6B00]/20 p-1.5 rounded-lg">
              <ShieldAlert size={18} className="text-[#FF6B00]" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-white uppercase">
              Control <span className="text-[#FF6B00]">Center</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Internal System Management — CampusRun v1.0</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search users..." 
            className="pl-10 bg-[#1A1C1E] border-white/5 rounded-xl focus:border-[#FF6B00]/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
          { label: 'Active Runs', value: allDeliveries.filter(d => !['COMPLETED', 'CANCELLED'].includes(d.status)).length, icon: Package, color: 'text-[#FF6B00]' },
          { label: 'Awaiting', value: pendingDispatchers.length, icon: Clock, color: 'text-yellow-500' },
          { label: 'Successful', value: allDeliveries.filter(d => d.status === 'COMPLETED').length, icon: CheckCircle, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <stat.icon size={16} className={stat.color} />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{stat.label}</span>
            </div>
            <span className="font-display text-3xl font-black text-white">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Pending Approvals Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-white flex items-center gap-2 tracking-wide uppercase text-sm">
                <Clock size={16} className="text-yellow-500" />
                Dispatcher Approvals
              </h2>
              <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingDispatchers.length} Pending
              </span>
            </div>
            
            <div className="space-y-3">
              {pendingDispatchers.length > 0 ? (
                pendingDispatchers.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-[#FF6B00]/30 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-white leading-none mb-1">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {user.matricNumber} <span className="mx-1 opacity-20">|</span> {user.department}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveDispatcher(user.id)}
                        className="bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white border-0 h-9 px-4 rounded-xl transition-all"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => rejectDispatcher(user.id)}
                        className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border-0 h-9 px-4 rounded-xl transition-all"
                      >
                        Reject
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-[#1A1C1E]/50 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground text-sm font-medium">No pending dispatchers to review.</p>
                </div>
              )}
            </div>
          </section>

          {/* Delivery Oversight */}
          <section>
            <h2 className="font-display font-black text-white flex items-center gap-2 tracking-wide uppercase text-sm mb-4">
              <Package size={16} className="text-[#FF6B00]" />
              Live Delivery Log
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {allDeliveries.map((d) => (
                <DeliveryCard key={d.id} delivery={d} showPin />
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-white flex items-center gap-2 tracking-wide uppercase text-sm">
                <Users size={16} className="text-muted-foreground" />
                User Registry
              </h2>
            </div>
            <div className="bg-[#1A1C1E] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
              <div className="divide-y divide-white/5">
                {filteredUsers.slice(0, 8).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{user.fullName}</p>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">{user.role}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {user.dispatcherStatus && (
                        <span className={cn(
                          'text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md',
                          user.dispatcherStatus === 'approved' ? 'bg-green-500/10 text-green-500' :
                          user.dispatcherStatus === 'rejected' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        )}>
                          {user.dispatcherStatus}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {filteredUsers.length > 8 && (
                <button className="w-full py-3 bg-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors">
                  View Full Registry
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;