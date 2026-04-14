import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Loader2, Phone, ShieldCheck, XCircle, 
  MessageSquare, Send, Camera, User, X, Image as ImageIcon, 
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import axios from 'axios';

interface Message {
  id: string;
  sender: 'user' | 'dispatcher';
  text: string;
  timestamp: string;
  type: 'text' | 'image';
  imageUrl?: string;
}

const PaymentSuccess = () => {
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tr_ref = searchParams.get('trxref'); // Paystack reference from URL

  const [step, setStep] = useState<'verifying' | 'matching' | 'tracking'>('verifying');
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const storageKey = `activeRun_${user?.id}`;
  const chatKey = `activeChat_${user?.id}`;

  const themeClass = {
    bg: isDark ? 'bg-[#020617]' : 'bg-[#F8FAFC]',
    card: isDark ? 'bg-[#0F172A]/95' : 'bg-white/95',
    text: isDark ? 'text-white' : 'text-slate-900',
    subText: isDark ? 'text-white/40' : 'text-slate-500',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    chatHeader: isDark ? 'bg-[#0F172A]' : 'bg-white shadow-sm',
    msgUser: 'bg-orange-600 text-white',
    msgOther: isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 text-slate-800'
  };

  // 1. Verify Payment on Load
  useEffect(() => {
    const verify = async () => {
      if (!tr_ref) return setStep('verifying');
      
      try {
        const res = await axios.get(`/api/orders/verify/${tr_ref}`);
        if (res.data.status === 'success') {
          setStep('matching');
        } else {
          alert("Payment failed or was cancelled.");
          navigate('/requester');
        }
      } catch (err) {
        console.error(err);
        setStep('verifying'); // Fallback to loading state
      }
    };
    verify();
  }, [tr_ref]);

  // 2. Load existing data or simulate matching
  useEffect(() => {
    if (step === 'matching') {
      setTimeout(() => {
        const activeRunData = {
          id: 'RUN-' + Math.floor(1000 + Math.random() * 9000),
          item: "MTH201 Textbook", 
          dispatcher: {
            name: "Adebayo Oluwaseun",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo"
          }
        };
        localStorage.setItem(storageKey, JSON.stringify(activeRunData));
        
        // AUTO-MESSAGE: Dispatcher sends picture request
        const welcomeMsg: Message = {
          id: '1',
          sender: 'dispatcher',
          text: "Hello! I've accepted your request. I'm heading to the pickup point now. I will send a photo once I arrive to confirm the item!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
        setChatHistory([welcomeMsg]);
        setStep('tracking');
      }, 3000);
    }
  }, [step]);

  // Auto-Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, showChat]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');
  };

  const completeDelivery = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(chatKey);
    navigate('/requester');
  };

  const terminateRun = () => {
    if (window.confirm("Terminate this run?")) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(chatKey);
      navigate('/requester');
    }
  };

  return (
    <div className={`min-h-screen ${themeClass.bg} ${themeClass.text} flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500`}>
      <AnimatePresence mode="wait">
        {step === 'verifying' && (
          <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Verifying Payment...</h2>
          </motion.div>
        )}

        {step === 'matching' && (
          <motion.div key="match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
                <Search size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Matching with Runner...</h2>
          </motion.div>
        )}

        {step === 'tracking' && (
          <motion.div key="track" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full space-y-4">
            <div className="bg-orange-600 px-6 py-5 rounded-[2rem] flex items-center justify-between shadow-xl shadow-orange-900/20 text-white">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse"><div className="w-2 h-2 bg-white rounded-full" /></div>
                  <span className="font-black text-xs uppercase tracking-widest">Runner En Route</span>
               </div>
               <span className="text-[10px] font-black bg-black/20 px-3 py-1 rounded-full uppercase tracking-tighter">4 MINS AWAY</span>
            </div>

            <div className={`${themeClass.card} border ${themeClass.border} rounded-[2.5rem] p-6 space-y-6 shadow-2xl`}>
               <div className="flex items-center gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo" className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/10" alt="Avatar" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Adebayo Oluwaseun</h3>
                    <div className="flex items-center gap-2 opacity-60 text-[9px] font-black uppercase">
                        <ShieldCheck size={12} className="text-orange-500" /> Verified Runner
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowChat(true)} className={`rounded-2xl h-12 w-12 ${isDark ? 'bg-white/5' : 'bg-slate-100'} border ${themeClass.border} ${themeClass.text}`}><MessageSquare size={18} /></Button>
                    <Button className={`rounded-2xl h-12 w-12 ${isDark ? 'bg-white/5' : 'bg-slate-100'} border ${themeClass.border} ${themeClass.text}`}><Phone size={18} /></Button>
                  </div>
               </div>

               <div className={`${isDark ? 'bg-black/40' : 'bg-slate-100'} rounded-3xl p-5 border ${themeClass.border} text-center`}>
                  <p className={`text-[9px] ${themeClass.subText} uppercase font-black tracking-[0.2em] mb-1`}>Handshake PIN</p>
                  <p className="text-4xl font-mono font-black text-orange-500 tracking-[0.3em]">4829</p>
               </div>

               <div className="space-y-3">
                <Button onClick={completeDelivery} className="w-full h-16 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase shadow-lg shadow-green-900/20"><CheckCircle2 size={18} className="mr-2"/> Confirm Arrival</Button>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/requester')} className={`flex-1 h-12 ${isDark ? 'bg-white/5' : 'bg-slate-100'} ${themeClass.subText} rounded-xl text-[10px] font-black uppercase`}>Back to Map</Button>
                  <Button onClick={terminateRun} className="h-12 px-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/10"><XCircle size={18} /></Button>
                </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT INTERFACE */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className={`fixed inset-0 z-[200] ${themeClass.bg} flex flex-col`}>
            <div className={`p-8 border-b ${themeClass.border} flex justify-between items-center ${themeClass.chatHeader}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><User size={20} /></div>
                <div>
                    <p className={`text-sm font-black uppercase ${themeClass.text}`}>Adebayo Oluwaseun</p>
                    <p className="text-[10px] text-orange-500 font-bold uppercase">Active Now</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className={`${themeClass.subText} hover:text-orange-500`}><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.sender === 'user' ? themeClass.msgUser + ' rounded-tr-none' : themeClass.msgOther + ' rounded-tl-none'}`}>
                    <p className="text-sm font-medium">{msg.text}</p>
                    {msg.imageUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                            <img src={msg.imageUrl} alt="Verification" className="w-full h-auto object-cover max-h-60" />
                        </div>
                    )}
                    <p className="text-[8px] font-black uppercase opacity-40 mt-2">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className={`p-8 ${themeClass.chatHeader} border-t ${themeClass.border}`}>
              <div className={`flex items-center gap-4 ${isDark ? 'bg-white/5' : 'bg-slate-100'} rounded-2xl px-6 py-2 border ${themeClass.border}`}>
                <button className={`${themeClass.subText} hover:text-orange-500 transition-colors`}><Camera size={20} /></button>
                <input 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(message)} 
                    placeholder="Message dispatcher..." 
                    className={`flex-1 bg-transparent py-4 text-sm outline-none ${themeClass.text}`} 
                />
                <button onClick={() => sendMessage(message)} className="text-orange-500"><Send size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSuccess;