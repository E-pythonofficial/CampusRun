import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetTime: Date;
  label: string;
  onExpire?: () => void;
}

const CountdownTimer = ({ targetTime, label, onExpire }: CountdownTimerProps) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, targetTime.getTime() - Date.now());
      setRemaining(diff);
      if (diff === 0 && onExpire) onExpire();
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime, onExpire]);

  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = totalSeconds < 120 && totalSeconds > 0;

  return (
    <div className={cn(
      'flex flex-col items-center gap-1 rounded-xl px-4 py-3 transition-all',
      isUrgent ? 'timer-pulse bg-primary/10' : 'timer-glow bg-primary/5'
    )}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className={cn(
        'font-display text-2xl font-bold tabular-nums',
        isUrgent ? 'text-primary' : 'text-primary'
      )}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default CountdownTimer;
