import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Clock, CreditCard, Key, CheckCircle, Truck} from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { RunningGuy } from '@/assets/img_run.pmg';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col">
      {/* Header */}
      <header className="container flex items-center justify-between py-5">
        <Logo size="md" />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/login')} className="text-muted-foreground hover:text-foreground">
            Login
          </Button>
          <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Join the Run
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Zap size={14} className="text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Campus-Powered Delivery</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
                Fast. Secure.{' '}
                <span className="text-gradient-orange text-primary">Campus Powered.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Bowen's fastest student-to-student network. 
                <span className="text-foreground font-medium"> Instant matching, zero-delay deliveries, </span> 
                  and total escrow security via PIN verification. 
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-7 text-base font-bold gap-3 group relative overflow-hidden"
                >
                  {/* Your running guy image logic */}
                  <img src="/img_run.png" alt="" className="w-15 h-10 object-contain group-hover:animate-bounce" />
                  Join the Run
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="border-border text-foreground hover:bg-secondary px-8 py-7 text-base font-semibold"
                >
                  Login
                </Button>
              </div>
            </motion.div>

            {/* Quick Stats/Rules Strip */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground border-y border-white/5 py-4">
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-primary"/> Max ₦20,000</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-primary"/> 7:00 AM - 7:30 PM</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-primary"/> Verified Students Only</span>
            </div>

            {/* How It Works Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-24"
            >
              <h2 className="text-3xl font-bold mb-12">How it Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: CreditCard, title: '1. Instant Request & Pay', desc: 'Create a request and pay into our secure escrow.' },
                  { icon: Truck, title: '2. Zero-Delay Pickup', desc: 'A verified student nearby accepts and moves your item without the campus wait-times.' },
                  { icon: Key, title: '3. Secure PIN Release', desc: 'The dispatcher arrives, you provide the pin, then release of item/parcel. No stress.' },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 border border-primary/20">
                      <step.icon size={28} className="text-primary" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Features (Updated to match your screenshot style) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-24"
            >
              {[
                { icon: Zap, title: 'Lightning Fast', desc: 'Campus deliveries in under 30 minutes' },
                { icon: Shield, title: 'PIN Secured', desc: 'Every delivery verified with a unique PIN' },
                { icon: Clock, title: 'Real-time Tracking', desc: 'Know exactly where your item is' },
              ].map((feature, i) => (
                <div key={i} className="bg-card-glass rounded-2xl p-6 text-left border border-white/5 hover:border-primary/30 transition-colors">
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
      <footer className="container py-8 text-center border-t border-white/5">
        <p className="text-xs text-muted-foreground">© 2026 CampusRun. Built for Bowen students, by students.</p>
      </footer>
    </div>
  );
};

export default Landing;