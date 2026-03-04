import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('requester');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="card-campus p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-card-foreground">Matric Number</Label>
              <Input placeholder="CSC/2021/001" className="bg-secondary/50 border-border" />
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground">Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-secondary/50 border-border" />
            </div>

            {/* Demo role selector */}
            <div className="space-y-2">
              <Label className="text-card-foreground text-xs">Demo: Select Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['requester', 'dispatcher', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      role === r
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-card-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-primary font-medium hover:underline">
              Register
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
