import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DeliveryCard from '@/components/DeliveryCard';
import CountdownTimer from '@/components/CountdownTimer';
import StatusBadge from '@/components/StatusBadge';
import { mockDeliveries, mockDispatcherStats, mockLeaderboard } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trophy, AlertTriangle, Star, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const badgeColors = {
  gold: 'text-yellow-400',
  silver: 'text-gray-300',
  bronze: 'text-orange-400',
};

const DispatcherDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const stats = mockDispatcherStats;
  const currentJob = mockDeliveries.find(d => d.status === 'ACCEPTED');
  const timerTarget = new Date(Date.now() + 8 * 60 * 1000); // 8 min demo

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dispatcher</h1>
          <p className="text-sm text-muted-foreground">Manage deliveries and track your performance</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-sm font-medium', isOnline ? 'text-status-success' : 'text-muted-foreground')}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <Switch checked={isOnline} onCheckedChange={setIsOnline} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Reliability', value: `${stats.reliability}%`, icon: TrendingUp, accent: true },
          { label: 'Completed', value: stats.completed, icon: Zap, accent: false },
          { label: 'Rating', value: stats.averageRating.toFixed(1), icon: Star, accent: false },
          { label: 'Strikes', value: stats.strikes, icon: AlertTriangle, accent: stats.strikes >= 3 },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card-glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.accent ? 'text-primary' : 'text-muted-foreground'} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <span className={cn('font-display text-2xl font-bold', stat.accent ? 'text-primary' : 'text-foreground')}>
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Current Job */}
      {isOnline && currentJob && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="font-display font-semibold text-foreground mb-4">Current Job</h2>
          <div className="bg-card-glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{currentJob.itemDescription}</h3>
                <p className="text-sm text-muted-foreground">{currentJob.pickupLocation} → {currentJob.dropoffLocation}</p>
              </div>
              <StatusBadge status={currentJob.status} />
            </div>
            <div className="flex items-center gap-4">
              <CountdownTimer targetTime={timerTarget} label="Time to respond" />
              <div className="flex-1 flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  On My Way
                </Button>
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {!isOnline && (
        <div className="bg-card-glass rounded-2xl p-8 text-center mb-6">
          <p className="text-muted-foreground">Go online to start accepting deliveries</p>
        </div>
      )}

      {/* Leaderboard */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-primary" />
          <h2 className="font-display font-semibold text-foreground">Leaderboard</h2>
        </div>
        <div className="bg-card-glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {mockLeaderboard.map((entry, i) => (
              <motion.div
                key={entry.dispatcherId}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <span className="font-display font-bold text-lg text-muted-foreground w-6 text-center">
                  {entry.badge ? (
                    <Trophy size={18} className={badgeColors[entry.badge]} />
                  ) : (
                    entry.rank
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.completed} deliveries · {entry.reliability}% reliable</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-primary fill-primary" />
                  <span className="text-sm font-semibold text-foreground">{entry.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default DispatcherDashboard;
