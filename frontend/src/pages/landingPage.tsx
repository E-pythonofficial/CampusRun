// LandingPage.tsx
// Dependencies: framer-motion, lucide-react
// Add to your global CSS or index.html:
// <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700;1,900&display=swap" rel="stylesheet">

import Logo from '@/components/Logo';
import { useEffect, useRef, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, Variants, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Clock, Camera,
  CheckCircle2, Phone, MessageCircle,
  Instagram, Twitter, Menu, X, Star,
} from 'lucide-react';

// ─── TOKENS ──────────────────────────────────────────────────────────────────
// Only three colors: off-white, chartreuse, charcoal. Flat fills, no gradients.
const C = {
  bg:         '#EDECDA',                 // off-white
  chartreuse: '#a4c41c',                 // buttons + accents
  charcoal:   '#36454F',                 // nav, dark sections, 5 MIN AWAY card, text
  muted:      'rgba(54, 69, 79, 0.85)',  // body text on off-white (charcoal)
  onDarkSoft: 'rgba(250, 249, 246, 0.75)', // small text on charcoal (off-white)
  line:       'rgba(250, 249, 246, 0.25)', // borders on charcoal (off-white)
  lineDark:   'rgba(54, 69, 79, 0.25)',    // borders on off-white (charcoal)
};

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } }
};
const stagger: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.15 } }
};
const slideIn: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};

// ─── EYEBROW LABEL ───────────────────────────────────────────────────────────
// Dark sections: chartreuse text. Light sections: charcoal text on a chartreuse pill.
const Eyebrow = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) =>
  dark ? (
    <span style={{ color: C.chartreuse }}>{children}</span>
  ) : (
    <span className="inline-block px-3 py-1.5 rounded-md" style={{ background: C.chartreuse, color: C.charcoal }}>
      {children}
    </span>
  );

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
const MarqueeStrip = ({
  items, speed = 30, reverse = false, dark = false
}: { items: string[]; speed?: number; reverse?: boolean; dark?: boolean }) => {
  const repeated = [...items, ...items, ...items];
  return (
    <div
      className="overflow-hidden whitespace-nowrap py-4 border-y-2"
      style={{
        borderColor: dark ? C.line : C.charcoal,
        background:  dark ? C.charcoal : C.bg,
      }}
    >
      <motion.div
        className="inline-flex gap-12"
        animate={{ x: reverse ? ['0%', '33.33%'] : ['0%', '-33.33%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="text-[11px] font-extrabold uppercase tracking-[0.28em] inline-flex items-center gap-4"
            style={{ color: dark ? C.bg : C.charcoal }}
          >
            {item}
            <span style={{ color: dark ? C.chartreuse : C.charcoal }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ─── STAT COUNTER ────────────────────────────────────────────────────────────
const StatCounter = ({ end, suffix, label, dark = false }: { end: number; suffix: string; label: string; dark?: boolean }) => {
  const [count, setCount] = useState(0);
  const ref  = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const total = 60;
    const t = setInterval(() => {
      frame++;
      setCount(Math.round(end * (frame / total)));
      if (frame === total) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [started, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-display leading-none" style={{ color: dark ? C.chartreuse : C.charcoal }}>
        {count}{suffix}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] mt-2" style={{ color: dark ? C.onDarkSoft : C.muted }}>
        {label}
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home',  href: '#home'},
    { label: 'How It Works', href: '#how' },
    { label: 'Pricing',      href: '#pricing' },
    { label: 'Support',      href: '#support' },
    { label: 'Safety',       href: '#safety' },
  ];

  const steps = [
    { num: '01', title: 'Place Your Order',  desc: 'Tell us what you need and where. Takes 30 minutes flat.' },
    { num: '02', title: 'Runner Accepts',    desc: 'A verified student runner nearby picks up your package.' },
    { num: '03', title: 'Live Tracking',     desc: 'Watch your item move in real time with GPS precision.' },
    { num: '04', title: 'PIN Handover',      desc: 'Enter your 4-digit Handshake PIN. Package Released. Done.' },
  ];

  const features = [
    { icon: <Clock size={26} />,      title: '30 MINS MAX',    desc: 'Speed is our DNA. Your runner is already on the route before you finish blinking.' },
    { icon: <Camera size={26} />,     title: 'ITEM CAPTURE',   desc: 'Photo proof at every stage. Your items are safe and accounted for at all times.' },
    { icon: <ShieldCheck size={26} />, title: 'ESCROW SECURE', desc: 'We hold the funds until you confirm with your Handshake PIN. Zero risk to you.' },
  ];

  const team = [
    { name: 'David', role: 'Support Lead',        phone: '2349067859388' },
    { name: 'Subomi', role: 'Support Lead',        phone: '2347068314286' }
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: C.bg, color: C.charcoal, fontFamily: "'Barlow', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700;1,900&display=swap');
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${C.chartreuse}; color: ${C.charcoal}; }
      `}</style>

      {/* ── NAV — solid charcoal ── */}
      <nav
        className="fixed top-0 w-full z-[150] border-b-2"
        style={{ background: C.charcoal, borderColor: C.chartreuse }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between relative">
          <a href="#" className="font-display text-3xl tracking-wide relative z-[160]" style={{ color: C.chartreuse }}>
            <Logo size="md" light/>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex gap-10 text-[14px] uppercase tracking-wide">
            {navLinks.map(l => (
              <a key={l.href} href={l.href}
                className="font-display transition-colors hover:opacity-60"
                style={{ color: C.bg }}
              >{l.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-3 relative z-[160]">
            <button
              className="hidden lg:block px-8 py-3 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: C.chartreuse, color: C.charcoal }}
              onClick={() => navigate('/register')}>
              Sign Up Free
            </button>

            {/* Toggle Button - Increased padding for easier clicking */}
            <button
              className="lg:hidden p-4 -mr-4 outline-none"
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(!mobileOpen);
              }}
              style={{ color: C.bg }}
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile menu - The "Floating Layer" Fix */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              /* CRITICAL FIXES:
                 1. absolute top-[78px]: Sits exactly below the border.
                 2. pointer-events-auto: Forces the browser to allow clicks here.
                 3. z-[200]: Higher than everything else on the page.
              */
              className="lg:hidden absolute top-[78px] left-0 w-full z-[200] border-b-4 shadow-2xl pointer-events-auto"
              style={{ background: C.charcoal, borderColor: C.chartreuse }}
            >
              <div className="flex flex-col p-8 gap-2">
                {navLinks.map(l => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => {
                      // Small delay ensures the click registers before the menu vanishes
                      setTimeout(() => setMobileOpen(false), 100);
                    }}
                    className="font-display uppercase text-xl tracking-wide py-4 px-2 block transition-all active:opacity-60 relative z-[210] pointer-events-auto"
                    style={{ color: C.bg }}
                  >
                    {l.label}
                  </a>
                ))}

                <button
                  className="w-full py-5 rounded-2xl text-base font-bold tracking-widest mt-4 shadow-xl active:scale-[0.98] transition-transform relative z-[210] pointer-events-auto"
                  style={{ background: C.chartreuse, color: C.charcoal }}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/register');
                  }}
                >
                  Sign Up Free
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO — flat off-white, no glow ── */}
      <section id="home" ref={heroRef} className="relative pt-28 pb-16 px-6 md:px-10 min-h-screen flex items-center overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-10 items-center">

          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.h1 variants={fadeUp}
              className="font-display leading-[0.88] tracking-wide mb-6"
              style={{ fontSize: 'clamp(3rem,6.5vw,5.5rem)', color: C.charcoal }}>
              LESS PAY.<br />DO LESS.<br />
              <span style={{ color: C.chartreuse }}>NO STRESS.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base font-medium mb-8 max-w-md leading-relaxed" style={{ color: C.muted }}>
              The student-powered delivery network. Moving your essentials across campus in record time for less than the price of a shawarma.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <button className="px-9 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 text-sm transition-all active:scale-95 hover:opacity-90"
                style={{ background: C.chartreuse, color: C.charcoal }}
                onClick={() => navigate('/register')}
              >
                Get Started <ArrowRight size={18} />
              </button>
              <button className="px-9 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all hover:opacity-80"
                style={{ background: C.charcoal, color: C.bg }}
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
                How It Works
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['🟠','🟡','🟢','🔵'].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs"
                    style={{ background: C.bg, borderColor: C.lineDark }}>{c}</div>
                ))}
              </div>
              <div className="text-sm font-medium" style={{ color: C.muted }}>
                <span className="font-bold" style={{ color: C.charcoal }}>Students</span> active
              </div>
            </motion.div>
          </motion.div>

          {/* Hero mock app — solid charcoal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="rounded-[2.5rem] p-1 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700"
              style={{ background: C.charcoal }}>
              <div className="rounded-[2.3rem] overflow-hidden" style={{ background: C.charcoal }}>
                {/* App top bar */}
                <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: C.line }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.chartreuse }}>Active Run</div>
                  <div className="font-display text-3xl tracking-wide" style={{ color: C.bg }}>5 MIN AWAY</div>
                  <div className="mt-3 rounded-full h-2 overflow-hidden" style={{ background: C.line }}>
                    <motion.div className="h-full rounded-full" style={{ background: C.chartreuse }}
                      initial={{ width: '0%' }} animate={{ width: '65%' }}
                      transition={{ duration: 2, delay: 1 }} />
                  </div>
                </div>
                {/* App body */}
                <div className="p-5 space-y-3">
                  {['Item captured ✓', 'Route confirmed ✓', 'ETA: 12 minutes...'].map((t, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.3 }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                      style={{ borderColor: C.line }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: C.chartreuse }} />
                      <span className="text-sm font-medium" style={{ color: C.bg }}>{t}</span>
                    </motion.div>
                  ))}
                  <div className="mt-4 rounded-2xl p-4 text-center border-2" style={{ borderColor: C.chartreuse }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.chartreuse }}>Handshake PIN</div>
                    <div className="font-display text-3xl tracking-[0.3em]" style={{ color: C.bg }}>••••</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
              className="absolute -bottom-5 -left-5 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 border-2"
              style={{ background: C.bg, borderColor: C.charcoal }}>
              <Star size={16} stroke={C.charcoal} fill={C.chartreuse} />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.charcoal }}>4.9 Rating</div>
                <div className="text-[10px] font-medium" style={{ color: C.muted }}>from 200+ reviews</div>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </section>

      {/* ── MARQUEE (light) ── */}
      <MarqueeStrip items={['30 Minute Delivery','Verified Runners','Escrow Protection','Live GPS Tracking','₦800 Flat Fee','Campus-Wide Coverage','4.9★ Rated']} />

      {/* ── STATS — CHARCOAL ── */}
      <section className="py-24 px-6 md:px-10" style={{ background: C.charcoal }}>
        <div className="max-w-[1400px] mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { end: 100, suffix: '+',   label: 'Completed Runs' },
              { end: 30,  suffix: 'min', label: 'Avg Delivery Time' },
              { end: 98,  suffix: '%',   label: 'Satisfaction Rate' },
              { end: 4.9, suffix: '★',   label: 'Average Rating' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <StatCounter {...s} dark />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE (dark) ── */}
      <MarqueeStrip
        items={['BOWEN','BOWEN','BOWEN','BOWEN','BOWEN','BOWEN','BOWEN','BOWEN']}
        dark reverse speed={20}
      />

      {/* ── HOW IT WORKS — OFF-WHITE ── */}
      <section id="how" className="py-32 px-6 md:px-10" style={{ background: C.bg }}>
        <div className="max-w-[1400px] mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} className="mb-20">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4"><Eyebrow>The Process</Eyebrow></p>
              <h2 className="font-display leading-none tracking-wide" style={{ fontSize: 'clamp(3rem,8vw,7rem)', color: C.charcoal }}>
                HOW IT WORKS
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6 relative">
              {steps.map((step, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="relative rounded-[2rem] p-8 border-2 transition-all group"
                  style={{ background: C.bg, borderColor: C.lineDark }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.charcoal)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.lineDark)}
                >
                  <div className="font-display text-[5rem] leading-none mb-4 select-none"
                    style={{ color: C.lineDark }}>
                    {step.num}
                  </div>
                  <h3 className="font-bold uppercase tracking-wider text-[16px] mb-3" style={{ color: C.charcoal }}>{step.title}</h3>
                  <p className="text-[16px] leading-relaxed font-medium" style={{ color: C.muted }}>{step.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 -right-4 z-10 rounded-full p-1" style={{ background: C.chartreuse, color: C.charcoal }}>
                      <ArrowRight size={16} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES — CHARCOAL ── */}
      <section className="py-32 px-6 md:px-10" style={{ background: C.charcoal }}>
        <div className="max-w-[1400px] mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} className="mb-20">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4"><Eyebrow dark>Built Different</Eyebrow></p>
              <h2 className="font-display leading-none tracking-wide" style={{ fontSize: 'clamp(3rem,8vw,7rem)', color: C.bg }}>
                WHY CAMPUS RUN ?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="group relative rounded-[2.5rem] p-10 overflow-hidden cursor-pointer border-2 transition-all duration-500"
                  style={{ background: C.charcoal, borderColor: C.line }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = C.chartreuse;
                    e.currentTarget.style.borderColor = C.chartreuse;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = C.charcoal;
                    e.currentTarget.style.borderColor = C.line;
                  }}
                >
                  <div className="absolute top-0 right-0 font-display text-[9rem] leading-none select-none opacity-[0.08] text-[#FAF9F6] group-hover:text-[#36454F]">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="relative z-10">
                    {/* On hover the card turns chartreuse, so text flips to charcoal */}
                    <div className="mb-6 transition-colors text-[#7FFF00] group-hover:text-[#36454F]">{f.icon}</div>
                    <h3 className="font-bold uppercase tracking-wider text-[16px] mb-3 text-[#FAF9F6] transition-colors group-hover:text-[#36454F]">{f.title}</h3>
                    <p className="text-[16px] leading-relaxed font-medium transition-colors text-[#FAF9F6] group-hover:text-[#36454F]">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING — OFF-WHITE ── */}
      <section id="pricing" className="py-32 px-6 md:px-10" style={{ background: C.bg }}>
        <div className="max-w-[1400px] mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.3em] mb-6">
                <Eyebrow>Simple Pricing</Eyebrow>
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-display leading-none tracking-wide"
                style={{ fontSize: 'clamp(5rem,15vw,11rem)', color: C.charcoal }}>
                ₦500
              </motion.h2>
              <motion.div variants={fadeUp} className="font-display text-4xl tracking-wide mb-8" style={{ color: C.chartreuse }}>
                AT LEAST.
              </motion.div>
              <motion.p variants={fadeUp} className="text-lg font-medium leading-relaxed max-w-md mb-10" style={{ color: C.muted }}>
                 Why pay a flat rate for a short trip? Our pricing now scales with your journey, starting as low as ₦500. No surge pricing,
                no hidden fees, and no extra charges for high-value items
                <span className="font-bold" style={{ color: C.charcoal }}> Just Simple, Honest Delivery</span>, still the cheapest protection on campus.
              </motion.p>
              <motion.button variants={fadeUp}
                className="px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center gap-3 transition-all hover:opacity-90 active:scale-95"
                style={{ background: C.charcoal, color: C.bg }}
                onClick={() => navigate('/register')}>
                Make YOUR FIRST REQUEST TODAY <ArrowRight size={18} />
              </motion.button>
            </div>

            {/* Checklist card — charcoal */}
            <motion.div variants={fadeUp}
              className="rounded-[3rem] p-10"
              style={{ background: C.charcoal }}>
              <h4 className="font-bold uppercase tracking-widest text-3xl mb-8" style={{ color: C.onDarkSoft }}>
                What's Included
              </h4>
              <ul className="space-y-5">
                {[
                  'Live GPS Tracking',
                  'Photo Proof of Pickup & Drop',
                  '4-Digit PIN Handover',
                  'Escrow Fund Protection',
                  'Verified Student Runner',
                  'In-App Chat with Runner',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-xl font-medium" style={{ color: C.bg }}>
                    <CheckCircle2 size={18} style={{ color: C.chartreuse }} className="shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-8 border-t" style={{ borderColor: C.line }}>
                <div className="text-xl font-medium" style={{ color: C.bg }}>
                We do it for at least ₦500.
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SAFETY — CHARTREUSE ── */}
      <section id="safety" className="py-20 px-6" style={{ background: C.chartreuse, color: C.charcoal }}>
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-14 items-center">

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-70">
              Non-Negotiable
            </motion.p>
            <motion.h2 variants={fadeUp}
              className="font-display leading-none tracking-wide mb-6"
              style={{ fontSize: 'clamp(3rem,10vw,7rem)' }}>
              SAFETY<br />FIRST.
            </motion.h2>
            <motion.p variants={fadeUp}
              className="text-base text-xl font-medium mb-10 leading-relaxed"
              style={{ maxWidth: '100%' }}>
              Every W!Gotcha Runner is a verified student. We track every run in real-time with GPS.
              Your stuff is never anonymous.
            </motion.p>

            <motion.ul variants={stagger} className="space-y-4">
              {[
                'Student ID Verification before activation',
                '4-Digit PIN Handover — only you confirm delivery',
                'Community Rating system after every run',
                'Escrow holds payment until delivery confirmed',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  variants={slideIn}
                  className="flex items-start gap-3 font-bold text-sm md:text-sm uppercase tracking-wider"
                >
                  <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Charcoal card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 mt-8 lg:mt-0"
            style={{ background: C.charcoal }}
          >
            <div
              className="font-display leading-none select-none mb-0"
              style={{ fontSize: 'clamp(3.5rem,15vw,8rem)', color: C.line }}>
              100%
            </div>
            <div className="font-display tracking-wide -mt-2 mb-4"
              style={{ fontSize: 'clamp(1.4rem,5vw,2.2rem)', color: C.bg }}>
              VERIFIED RUNNERS
            </div>
            <p className="text-sm leading-relaxed font-medium mb-6" style={{ color: C.bg }}>
              Every runner goes through ID verification, a profile review, and a community
              onboarding process before their first accepted run.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {['ID Check', 'GPS Live', 'PIN Lock'].map((t, i) => (
                <div key={i} className="rounded-xl p-3 text-center border"
                  style={{ borderColor: C.line }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: C.onDarkSoft }}>{t}</div>
                  <CheckCircle2 size={18} className="mx-auto" style={{ color: C.chartreuse }} />
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── SUPPORT — OFF-WHITE ── */}
      <section id="support" className="py-32 px-6 md:px-10" style={{ background: C.bg }}>
        <div className="max-w-[1400px] mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} className="mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4">
                <Eyebrow>Real People, Real Fast, Talk to Us, Lay Your Complaints</Eyebrow>
              </p>
              <h2 className="font-display leading-none tracking-wide" style={{ fontSize: 'clamp(3rem,8vw,7rem)', color: C.charcoal }}>
                SUPPORT LEADS
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((rep, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="rounded-[3rem] p-10 border-2 text-center transition-all"
                  style={{ background: C.bg, borderColor: C.lineDark }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.charcoal)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.lineDark)}
                >
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center transition-all"
                    style={{ background: C.chartreuse, color: C.charcoal }}>
                    <Phone size={30} />
                  </div>
                  <h4 className="font-display text-3xl tracking-wide mb-1" style={{ color: C.charcoal }}>{rep.name.toUpperCase()}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8" style={{ color: C.muted }}>{rep.role}</p>
                  <a href={`https://wa.me/${rep.phone}`}
                    target="_blank"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all hover:opacity-90"
                    style={{ background: C.charcoal, color: C.bg }}>
                    WhatsApp <MessageCircle size={15} />
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA — CHARCOAL ── */}
      <section className="py-24 px-6 md:px-10 border-y-2" style={{ background: C.charcoal, borderColor: C.line }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <h2 className="font-display leading-none tracking-wide mb-8"
            style={{ fontSize: 'clamp(3rem,9vw,7rem)', color: C.bg }}>
            JOIN US TODAY
          </h2>
          <p className="font-medium text-lg mb-10 max-w-md mx-auto" style={{ color: C.bg }}>
            Join hundreds of students already using W!Gotcha. Your first delivery is waiting.
          </p>
          <button className="px-16 py-6 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center gap-3 mx-auto transition-all active:scale-95 hover:opacity-90"
            style={{ background: C.chartreuse, color: C.charcoal }}
            onClick={() => navigate('/register')}>
            Sign Up : It's Free <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ── FOOTER — CHARCOAL ── */}
      <footer className="py-24 px-6 md:px-10" style={{ background: C.charcoal }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div>
              <div className="mb-4">
                <Logo size="md" light />
              </div>
              <p className="text-sm font-medium leading-relaxed mb-8" style={{ color: C.bg }}>
                The student-powered delivery network built for campus life.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/cam.pus_run/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border rounded-full flex items-center justify-center transition-all hover:opacity-80"
                  style={{ borderColor: C.line, color: C.bg }}>
                  <Instagram size={16} />
                </a>

                <a href="https://x.com/campus6551"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border rounded-full flex items-center justify-center transition-all hover:opacity-80"
                  style={{ borderColor: C.line, color: C.bg }}>
                  <Twitter size={16} />
                </a>
              </div>
            </div>

            {[
              { title: 'Company', links: ['About Us', 'Our Offerings', 'Updates'] },
              { title: 'Product',  links: ['Requester App', 'Runner App', 'Pricing', 'Safety'] },
              { title: 'Legal',    links: [] as string[] },
            ].map((col, i) => (
              <div key={i}>
                <h5 className="font-bold uppercase tracking-[0.2em] text-xs mb-8 underline" style={{ color: C.bg }}>{col.title}</h5>
                <ul className="space-y-4">
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm font-medium transition-colors hover:opacity-40" style={{ color: C.onDarkSoft }}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderColor: C.line }}>
            <p className="text-sm font-medium" style={{ color: C.bg }}>© 2026 W!Gotcha Inc. All rights reserved.</p>
            <p className="text-xs font-medium" style={{ color: C.bg }}>Built for the campus. Powered by students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}