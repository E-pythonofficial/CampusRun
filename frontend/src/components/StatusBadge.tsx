import { DeliveryStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<DeliveryStatus, { label: string; className: string }> = {
  CREATED: { label: 'Created', className: 'bg-status-info/15 text-status-info border-status-info/30' },
  ACCEPTED: { label: 'Accepted', className: 'bg-status-info/15 text-status-info border-status-info/30' },
  ON_MY_WAY: { label: 'On My Way', className: 'bg-primary/15 text-primary border-primary/30' },
  PICKED_UP: { label: 'Picked Up', className: 'bg-status-warning/15 text-status-warning border-status-warning/30' },
  IN_TRANSIT: { label: 'In Transit', className: 'bg-primary/15 text-primary border-primary/30' },
  ARRIVED: { label: 'Arrived', className: 'bg-status-success/15 text-status-success border-status-success/30' },
  PIN_VERIFIED: { label: 'Verified', className: 'bg-status-success/15 text-status-success border-status-success/30' },
  COMPLETED: { label: 'Completed', className: 'bg-status-success/15 text-status-success border-status-success/30' },
  CANCELLED: { label: 'Cancelled', className: 'bg-status-error/15 text-status-error border-status-error/30' },
  EXPIRED: { label: 'Expired', className: 'bg-muted text-muted-foreground border-border' },
  DISPUTED: { label: 'Disputed', className: 'bg-status-error/15 text-status-error border-status-error/30' },
};

const StatusBadge = ({ status }: { status: DeliveryStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
