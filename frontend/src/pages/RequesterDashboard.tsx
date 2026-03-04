import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DeliveryCard from '@/components/DeliveryCard';
import { mockDeliveries } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Package, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delivery } from '@/lib/types';

const RequesterDashboard = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [deliveries, setDeliveries] = useState(mockDeliveries);

  const activeDeliveries = deliveries.filter(d => !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => d.status === 'COMPLETED');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const newDelivery: Delivery = {
      id: `d${Date.now()}`,
      requesterId: '1',
      requesterName: 'Adebayo Oluwaseun',
      itemDescription: 'New Item',
      itemValue: 2000,
      pickupLocation: 'Main Gate',
      dropoffLocation: 'Hall 1',
      pin,
      status: 'CREATED',
      createdAt: new Date(),
    };
    setDeliveries([newDelivery, ...deliveries]);
    setShowCreate(false);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Deliveries</h1>
          <p className="text-sm text-muted-foreground">Track and manage your campus deliveries</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold"
        >
          <Plus size={18} />
          New Delivery
        </Button>
      </div>

      {/* Create Delivery Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-campus w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold text-card-foreground">Create Delivery</h2>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-card-foreground">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Item Description</Label>
                  <Input placeholder="e.g. Course textbook" className="bg-secondary/50 border-border" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Item Value (₦)</Label>
                  <Input type="number" placeholder="5000" className="bg-secondary/50 border-border" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Pickup Location</Label>
                    <Input placeholder="Faculty Building" className="bg-secondary/50 border-border" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Drop-off Location</Label>
                    <Input placeholder="Hall 3, Room 214" className="bg-secondary/50 border-border" required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5">
                  Create Delivery
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-primary" />
          <h2 className="font-display font-semibold text-foreground">Active ({activeDeliveries.length})</h2>
        </div>
        {activeDeliveries.length === 0 ? (
          <div className="bg-card-glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">No active deliveries</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeDeliveries.map((d) => (
              <DeliveryCard key={d.id} delivery={d} showPin />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-muted-foreground" />
          <h2 className="font-display font-semibold text-foreground">History ({completedDeliveries.length})</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {completedDeliveries.map((d) => (
            <DeliveryCard key={d.id} delivery={d} />
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default RequesterDashboard;
