import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import Logo from './Logo';
import { LogOut, User, Shield, Truck, Package } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const roleNavItems = {
  requester: [
    { label: 'Dashboard', path: '/requester', icon: Package },
  ],
  dispatcher: [
    { label: 'Dashboard', path: '/dispatcher', icon: Truck },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: Shield },
  ],
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navItems = roleNavItems[user.role];

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="sm" />

          <div className="flex items-center gap-3">
            {/* Role switcher (demo only) */}
            <div className="hidden md:flex items-center gap-1 bg-secondary rounded-lg p-1">
              {(['requester', 'dispatcher', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => { switchRole(role); navigate(`/${role}`); }}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                    user.role === role
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>

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
