import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Clock, CreditCard, Key, CheckCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);

  const handleJoinRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      navigate('/register');
    }, 800);
  };

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
    <div className="min-h-screen bg-navy-gradient flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="container flex items-center justify-between py-5 z-20">
        <Logo size="md" />
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')} 
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all px-6 relative group"
            >
              Login
              <span className="absolute bottom-2 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-1/2 group-hover:left-1/4"></span>
            </Button>
          </motion.div>
          <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Join the Run
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Zap size={14} className="text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Campus-Powered Delivery</span>
              </div>

              <h1 className="font-major text-6xl md:text-8xl text-white leading-tight mb-6">
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

            {/* --- 📱 MOBILE DESIGN "HOW IT WORKS" SECTION --- */}
            <div className="mt-24 mb-32">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-playful text-4xl font-bold text-white mb-16"
              >
                How it Works
              </motion.h2>
              
              <div className="relative flex flex-col lg:flex-row items-center justify-center gap-16 px-4">
                
                {/* The Phone Mockup - Slides in slowly from the Left */}
                <motion.div 
                  initial={{ opacity: 0, x: -60, rotateY: -10 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[3rem] h-[640px] w-[310px] shadow-2xl overflow-hidden ring-4 ring-primary/5"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="w-10 h-1 bg-white/10 rounded-full"></div>
                  </div>

                  {/* Screen Content */}
                  <div className="h-full w-full bg-[#050914] p-6 pt-16 flex flex-col gap-12 relative">
                    
                    {/* Animated Vertical Line: Draws down after phone appears */}
                    <motion.div 
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1, duration: 0.8 }}
                      style={{ originY: 0 }}
                      className="absolute left-[31px] top-20 bottom-32 w-[3px] bg-primary/30 rounded-full shadow-[0_0_10px_rgba(255,102,0,0.2)]"
                    />

                    {steps.map((step, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.2 + (i * 0.4), duration: 0.6 }}
                        className="relative z-10 flex gap-6 text-left items-start"
                      >
                        <div className="flex-shrink-0 w-3 h-3 mt-2 rounded-full bg-primary ring-[6px] ring-[#050914] flex items-center justify-center shadow-[0_0_12px_rgba(255,102,0,0.6)]">
                           <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <step.icon size={18} className="text-primary" />
                             <h4 className="font-major text-white text-lg italic leading-tight">{step.title}</h4>
                          </div>
                          <p className="font-playful text-[11px] text-white/50 leading-relaxed max-w-[190px]">
                            {step.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 2.5 }}
                      className="mt-auto pb-6 px-2"
                    >
                      <div className="w-full h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-primary font-major italic text-sm animate-pulse">Tracking active run...</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Feature Cards - Slide in from the Right */}
                <div className="hidden lg:flex flex-col gap-6 w-full max-w-xs">
                  {[
                    { icon: Zap, title: 'Lightning Fast', desc: 'Deliveries in under 30 mins' },
                    { icon: Shield, title: 'PIN Secured', desc: 'Verified security protocol' },
                    { icon: Clock, title: 'Real-time', desc: 'Live student tracking' },
                  ].map((feat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (i * 0.2), duration: 0.7 }}
                      className="group bg-white/5 border border-white/10 p-5 rounded-2xl text-left backdrop-blur-sm hover:border-primary/50 transition-all cursor-default"
                    >
                      <feat.icon className="text-primary mb-2 group-hover:scale-110 transition-transform" size={20} />
                      <h3 className="font-playful text-white text-lg">{feat.title}</h3>
                      <p className="text-xs text-muted-foreground">{feat.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
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
        <p className="text-sm md:text-base text-muted-foreground/60 font-major tracking-wide">
          © 2026 CampusRun. Built for Bowen students, by students.
        </p>
      </footer>
    </div>
  );
};

export default Landing;