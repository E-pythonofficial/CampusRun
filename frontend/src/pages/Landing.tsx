import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Truck, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col">
      {/* Header */}
      <header className="container flex items-center justify-between py-5">
        <Logo size="md" />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/login')} className="text-muted-foreground hover:text-foreground">
            Log In
          </Button>
          <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Zap size={14} className="text-primary" />
                <span className="text-xs font-medium text-primary">Campus-Powered Delivery</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-4">
                Fast. Secure.{' '}
                <span className="text-gradient-orange">Campus Powered.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
                Send and receive items across campus in minutes. Verified students, PIN-secured deliveries, real-time tracking.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold gap-2 group"
                >
                  Start Delivering
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="border-border text-foreground hover:bg-secondary px-8 py-6 text-base"
                >
                  I Have an Account
                </Button>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16"
            >
              {[
                { icon: Zap, title: 'Lightning Fast', desc: 'Campus deliveries in under 30 minutes' },
                { icon: Shield, title: 'PIN Secured', desc: 'Every delivery verified with a unique PIN' },
                { icon: Clock, title: 'Real-time Tracking', desc: 'Know exactly where your item is' },
              ].map((feature, i) => (
                <div key={i} className="bg-card-glass rounded-2xl p-6 text-left">
                  <feature.icon size={24} className="text-primary mb-3" />
                  <h3 className="font-display font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-6 text-center">
        <p className="text-xs text-muted-foreground">© 2026 CampusRun. Built for students, by students.</p>
      </footer>
    </div>
  );
};

export default Landing;
