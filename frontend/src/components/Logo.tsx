import { MapPin } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { icon: 20, text: 'text-lg' },
  md: { icon: 28, text: 'text-2xl' },
  lg: { icon: 40, text: 'text-4xl' },
};

const Logo = ({ size = 'md' }: LogoProps) => {
  const s = sizeMap[size];
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <MapPin size={s.icon} className="text-primary" strokeWidth={2.5} />
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]"
          width={s.icon * 0.4}
          height={s.icon * 0.4}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M3 8H13M9 4L13 8L9 12" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className={`font-display font-bold ${s.text} text-foreground`}>
        Campus<span className="text-primary">Run</span>
      </span>
    </div>
  );
};

export default Logo;
