import DashboardLayout from '@/components/DashboardLayout';
import DeliveryCard from '@/components/DeliveryCard';
import StatusBadge from '@/components/StatusBadge';
import { mockDeliveries, mockUsers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Users, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { User } from '@/lib/types';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const pendingDispatchers = users.filter(u => u.role === 'dispatcher' && u.dispatcherStatus === 'pending');
  const allDeliveries = mockDeliveries;

  const approveDispatcher = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, dispatcherStatus: 'approved' as const } : u));
  };

  const rejectDispatcher = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, dispatcherStatus: 'rejected' as const } : u));
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage users, dispatchers, and deliveries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: Users },
          { label: 'Active Deliveries', value: allDeliveries.filter(d => !['COMPLETED', 'CANCELLED'].includes(d.status)).length, icon: Package },
          { label: 'Pending Approval', value: pendingDispatchers.length, icon: Clock },
          { label: 'Completed', value: allDeliveries.filter(d => d.status === 'COMPLETED').length, icon: CheckCircle },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card-glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Pending Dispatchers */}
      {pendingDispatchers.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock size={18} className="text-status-warning" />
            Pending Dispatcher Approvals
          </h2>
          <div className="space-y-3">
            {pendingDispatchers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card-glass rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.matricNumber} · {user.department}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approveDispatcher(user.id)}
                    className="bg-status-success/20 text-status-success hover:bg-status-success/30 border-0 gap-1"
                  >
                    <CheckCircle size={14} /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectDispatcher(user.id)}
                    className="border-status-error/30 text-status-error hover:bg-status-error/10 gap-1"
                  >
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All Users */}
      <section className="mb-8">
        <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users size={18} className="text-muted-foreground" />
          All Users ({users.length})
        </h2>
        <div className="bg-card-glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-medium text-foreground text-sm">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.matricNumber} · {user.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                    user.role === 'admin' ? 'bg-primary/15 text-primary border border-primary/30' :
                    user.role === 'dispatcher' ? 'bg-status-info/15 text-status-info border border-status-info/30' :
                    'bg-secondary text-foreground border border-border'
                  )}>
                    {user.role}
                  </span>
                  {user.dispatcherStatus && (
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      user.dispatcherStatus === 'approved' ? 'text-status-success' :
                      user.dispatcherStatus === 'rejected' ? 'text-status-error' :
                      'text-status-warning'
                    )}>
                      {user.dispatcherStatus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Deliveries */}
      <section>
        <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package size={18} className="text-muted-foreground" />
          All Deliveries ({allDeliveries.length})
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {allDeliveries.map((d) => (
            <DeliveryCard key={d.id} delivery={d} showPin />
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
