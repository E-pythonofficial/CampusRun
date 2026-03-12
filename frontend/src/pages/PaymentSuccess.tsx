import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Loader2, Phone, ShieldCheck, XCircle, 
  MessageSquare, Send, Camera, User, X, Image as ImageIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

interface Message {
  id: string;
  sender: 'user' | 'dispatcher';
  text: string;
  timestamp: string;
  type: 'text' | 'image';
}

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'processing' | 'matching' | 'tracking'>('processing');
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const storageKey = `activeRun_${user?.id}`;
  const chatKey = `activeChat_${user?.id}`;

  // Load existing data
  useEffect(() => {
    if (user?.id) {
      const savedRun = localStorage.getItem(storageKey);
      const savedChat = localStorage.getItem(chatKey);
      if (savedRun) setStep('tracking');
      if (savedChat) setChatHistory(JSON.parse(savedChat));
      else {
        // Initial Dispatcher Message
        const welcomeMsg: Message = {
          id: '1',
          sender: 'dispatcher',
          text: "Hello! I'm heading to pick up your item now. Please send a photo of the item if you'd like!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
        setChatHistory([welcomeMsg]);
      }
    }
  }, [user?.id]);

  // Save chat whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(chatKey, JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Flow Logic
  useEffect(() => {
    if (step === 'processing') {
      setTimeout(() => setStep('matching'), 2000);
    } else if (step === 'matching') {
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
        setStep('tracking');
      }, 3000);
    }
  }, [step]);

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
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 font-sans">
      <AnimatePresence mode="wait">
        {step === 'processing' && (
          <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Securing Escrow...</h2>
          </motion.div>
        )}

        {step === 'matching' && (
          <motion.div key="match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Finding Runner...</h2>
          </motion.div>
        )}

        {step === 'tracking' && (
          <motion.div key="track" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full space-y-4">
            <div className="bg-orange-600 px-6 py-5 rounded-[2rem] flex items-center justify-between shadow-xl shadow-orange-900/20">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse"><div className="w-2 h-2 bg-white rounded-full" /></div>
                  <span className="font-black text-xs uppercase tracking-widest">Runner En Route</span>
               </div>
               <span className="text-[10px] font-black bg-black/20 px-3 py-1 rounded-full">4 MINS</span>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 space-y-6 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo" className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10" alt="Avatar" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Adebayo Oluwaseun</h3>
                    <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase">
                        <ShieldCheck size={12} className="text-orange-500" /> Verified Runner
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowChat(true)} className="rounded-2xl h-12 w-12 bg-white/5 border border-white/10 text-white"><MessageSquare size={18} /></Button>
                    <Button className="rounded-2xl h-12 w-12 bg-white/5 border border-white/10 text-white"><Phone size={18} /></Button>
                  </div>
               </div>

               <div className="bg-black/40 rounded-3xl p-5 border border-white/5 text-center">
                  <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em] mb-1">Handshake PIN</p>
                  <p className="text-4xl font-mono font-black text-orange-500 tracking-[0.3em]">4829</p>
               </div>

               <div className="space-y-3">
                <Button onClick={completeDelivery} className="w-full h-16 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase"><CheckCircle2 size={18} className="mr-2"/> Confirm Arrival</Button>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/requester')} className="flex-1 h-12 bg-white/5 text-white/40 rounded-xl text-[10px] font-black uppercase">Back to Map</Button>
                  <Button onClick={terminateRun} className="h-12 px-4 bg-red-500/5 text-red-500/50 rounded-xl"><XCircle size={18} /></Button>
                </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT INTERFACE */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 z-[200] bg-[#020617] flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0F172A]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><User size={20} /></div>
                <div><p className="text-sm font-black uppercase">Adebayo Oluwaseun</p><p className="text-[10px] text-orange-500 font-bold uppercase">Active Now</p></div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-white/20 hover:text-white"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-orange-600 rounded-tr-none' : 'bg-white/5 border border-white/10 rounded-tl-none'}`}>
                    <p className="text-sm font-medium">{msg.text}</p>
                    <p className="text-[8px] font-black uppercase opacity-40 mt-2">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-8 bg-[#0F172A] border-t border-white/5">
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-2 border border-white/10">
                <button className="text-white/20 hover:text-orange-500"><Camera size={20} /></button>
                <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage(message)} placeholder="Message dispatcher..." className="flex-1 bg-transparent py-4 text-sm outline-none" />
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