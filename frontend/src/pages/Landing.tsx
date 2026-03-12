import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Zap, Clock, CreditCard, Key, CheckCircle, Truck, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleJoinRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      navigate('/register');
    }, 800);
  };

  const navLinks = [
    { label: 'How It Works', href: '#how' },
    { label: 'Safety', href: '#safety' },
  ];

  const steps = [
    { 
      icon: CreditCard, 
      title: '1. Instant Request & Pay', 
      desc: 'Create a request and pay into our secure escrow.' 
    },
    { 
      icon: Truck, 
      title: '2. Zero-Delay Pickup', 
      desc: 'A verified student nearby accepts and moves your item.' 
    },
    { 
      icon: Key, 
      title: '3. Secure PIN Release', 
      desc: 'Provide the pin to the dispatcher to release the item.' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#050914] flex flex-col overflow-x-hidden text-white">
      <style>{`
        .bg-navy-gradient {
          background: radial-gradient(circle at top right, #1e3a8a 0%, #050914 50%);
        }
        .font-major { font-family: 'Bebas Neue', sans-serif; }
        .font-playful { font-family: 'Barlow', sans-serif; }
      `}</style>

      {/* --- NAV --- */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#050914]/80 backdrop-blur-lg">
        <div className="container h-20 flex items-center justify-between relative z-[110]">
          <Logo size="md" />
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-4">
               <Button variant="ghost" onClick={() => navigate('/login')} className="text-white">Login</Button>
               <Button onClick={() => navigate('/register')} className="bg-primary text-white">Join the Run</Button>
            </div>
            
            {/* Mobile Toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 w-full bg-[#050914] border-b border-primary/20 z-[105] overflow-hidden"
            >
              <div className="flex flex-col p-8 gap-6 pointer-events-auto">
                <button onClick={() => { setMobileOpen(false); navigate('/login'); }} className="text-2xl font-major text-left italic tracking-widest">LOGIN</button>
                <button onClick={() => { setMobileOpen(false); navigate('/register'); }} className="text-2xl font-major text-left italic tracking-widest text-primary">JOIN THE RUN</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-24 bg-navy-gradient">
        <div className="container py-12">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Zap size={14} className="text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Campus-Powered Delivery</span>
              </div>

              <h1 className="font-major text-6xl md:text-8xl leading-tight mb-6">
                Fast. Secure.{' '}
                <span className="text-primary">Campus Powered.</span>
              </h1>

              <p className="text-sm md:text-base text-muted-foreground/80 max-w-xl mx-auto mb-10 leading-relaxed italic font-light">
                Bowen's fastest student-to-student network. 
                <span className="text-white/90"> Instant matching, zero-delay deliveries, </span> 
                and total escrow security.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                <Button size="lg" onClick={handleJoinRun} className="bg-primary hover:bg-primary/90 text-white px-8 py-7 text-base font-bold gap-3 group relative overflow-visible shadow-lg">
                  <motion.img
                    src="/run.gif"
                    alt="runner"
                    className="w-12 h-10 object-contain z-10"
                    initial={{ x: 0 }}
                    animate={isRunning ? { x: [0, 100, 500, 1500], opacity: [1, 1, 1, 0] } : {}}
                    transition={{ duration: 0.8, ease: "easeIn" }}
                  />
                  <motion.span animate={isRunning ? { x: 20, opacity: 0.5 } : { x: 0 }} className="flex items-center gap-2">
                    Join the Run <ArrowRight size={18} />
                  </motion.span>
                </Button>
                
                <Button variant="outline" size="lg" onClick={() => navigate('/login')} className="border-white/10 text-white hover:bg-white/5 px-8 py-7 text-base font-semibold">
                  Login
                </Button>
              </div>
            </motion.div>

            {/* --- FIXED CENTERED HOW IT WORKS SECTION --- */}
            <div id="how" className="mt-24 mb-32 w-full flex flex-col items-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-playful text-4xl font-bold mb-16 text-center"
              >
                How it Works
              </motion.h2>
              
              <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 px-4">
                
                {/* Center Container for Phone */}
                <div className="flex justify-center items-center w-full lg:w-auto">
                    <motion.div 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1 }}
                      className="relative border-gray-900 bg-gray-900 border-[10px] rounded-[3rem] h-[600px] w-[290px] md:w-[310px] shadow-2xl overflow-hidden ring-4 ring-primary/5"
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20 flex items-center justify-center">
                        <div className="w-10 h-1 bg-white/10 rounded-full"></div>
                      </div>

                      {/* Screen Content */}
                      <div className="h-full w-full bg-[#050914] p-6 pt-16 flex flex-col gap-10 relative">
                        {/* Animated Line */}
                        <motion.div 
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          style={{ originY: 0 }}
                          className="absolute left-[31px] top-20 bottom-32 w-[2px] bg-primary/30 rounded-full"
                        />

                        {steps.map((step, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 + (i * 0.3) }}
                            className="relative z-10 flex gap-4 text-left items-start"
                          >
                            <div className="flex-shrink-0 w-3 h-3 mt-2 rounded-full bg-primary ring-4 ring-[#050914] shadow-[0_0_10px_rgba(255,102,0,0.5)]" />
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                 <step.icon size={16} className="text-primary" />
                                 <h4 className="font-major text-white text-base italic leading-tight">{step.title}</h4>
                              </div>
                              <p className="font-playful text-[10px] text-white/50 leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        <div className="mt-auto pb-4">
                          <div className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                            <span className="text-primary font-major italic text-[10px] animate-pulse tracking-widest">TRACKING ACTIVE RUN...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                </div>

                {/* Feature Cards - Only visible on Large Screens */}
                <div className="hidden lg:flex flex-col gap-4 w-[280px]">
                  {[
                    { icon: Zap, title: 'Lightning Fast', desc: 'Deliveries in under 30 mins' },
                    { icon: Shield, title: 'PIN Secured', desc: 'Verified security protocol' },
                    { icon: Clock, title: 'Real-time', desc: 'Live student tracking' },
                  ].map((feat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + (i * 0.2) }}
                      className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm hover:border-primary/50 transition-all"
                    >
                      <feat.icon className="text-primary mb-2" size={18} />
                      <h3 className="font-playful text-white text-base">{feat.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{feat.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground border-y border-white/5 py-6 font-playful"
            >
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-primary"/> Max ₦20,000</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-primary"/> 7:00 AM - 7:30 PM</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-primary"/> Verified Students Only</span>
            </motion.div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-8 text-center border-t border-white/5">
        <p className="text-xs text-muted-foreground/60 font-major tracking-widest">
          © 2026 CAMPUSRUN. BUILT FOR BOWEN STUDENTS, BY STUDENTS.
        </p>
      </footer>
    </div>
  );
};

export default Landing;