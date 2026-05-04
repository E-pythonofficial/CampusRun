import { Delivery } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { MapPin, Package, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeliveryCardProps {
  delivery: Delivery;
  showPin?: boolean;
  onClick?: () => void;
}

const DeliveryCard = ({ delivery, showPin, onClick }: DeliveryCardProps) => {
  const timeAgo = getTimeAgo(delivery.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="card-campus p-5 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-primary" />
          <h3 className="font-semibold text-card-foreground text-sm">{delivery.itemDescription}</h3>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin size={12} className="text-status-success shrink-0" />
          <span className="text-card-foreground">{delivery.pickupLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin size={12} className="text-primary shrink-0" />
          <span className="text-card-foreground">{delivery.dropoffLocation}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{timeAgo}</span>
        </div>
        {showPin && (
          <span className="font-mono text-sm font-bold text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded">
            PIN: {delivery.pin}
          </span>
        )}
        <span className="text-xs font-semibold text-card-foreground">
          ₦{delivery.itemValue.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
};

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default DeliveryCard;
