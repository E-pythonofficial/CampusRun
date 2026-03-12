import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return;
    
    setIsDeleting(true);
    // Simulating API call
    setTimeout(() => {
      logout();
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <button 
        onClick={() => navigate(-1)}
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-red-500/10 text-red-500 mb-2">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Delete Account ?</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            This action is permanent. All your request history, active orders, and profile data will be wiped from CampusRun servers.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 ml-1">
              Type "DELETE" to confirm
            </label>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              className="bg-[#0F172A] border-white/10 h-14 rounded-2xl text-center font-black tracking-[0.3em] focus:border-red-500 transition-all"
            />
          </div>

          <Button
            onClick={handleDelete}
            disabled={confirmation !== 'DELETE' || isDeleting}
            className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all ${
              confirmation === 'DELETE' 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-white/5 text-white/20'
            }`}
          >
            {isDeleting ? 'Processing...' : 'Permanently Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;