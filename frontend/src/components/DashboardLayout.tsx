import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import Logo from './Logo';
import { LogOut, User, Shield, Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/lib/types';

const roleNavItems: Record<UserRole, { label: string; path: string; icon: any }[]> = {
  REQUESTER: [
    { label: 'Dashboard', path: '/requester', icon: Package },
  ],
  DISPATCHER: [
    { label: 'Dashboard', path: '/dispatcher', icon: Truck },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin', icon: Shield },
  ],
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = roleNavItems[user.role];

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="sm" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-muted-foreground" />
              <span className="hidden sm:inline text-foreground font-medium">{user.fullName}</span>
            </div>

            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;