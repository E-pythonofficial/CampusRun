import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
// Added Eye and EyeOff icons
import { ArrowLeft, User, Truck, Camera, IdCard, Loader2, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('requester');
  
  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    matricNumber: '',
    department: '',
    hostel: '',
    college: '',
    password: '',
    bio: ''
  });

  const hostels = ["NH(girls)", "NH(boys)", "Block hostel", "Saddler", "UPE(boys)", "UPE(girls)", "John", "Luke", "Mark", "288 Girls", "150 Girls", "Story Building"];
  const colleges = ["COCCS", "COHES", "COAES", "COSMS", "COLIBS", "COLAW", "COEVS"];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData.matricNumber, formData.password);
      navigate(`/${role}`);
    } catch (error) {
      console.error("Registration failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md py-8">
        <div className="text-center mb-6">
          <Logo size="lg" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="selection" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="space-y-4"
            >
               <h2 className="text-2xl font-bold text-white text-center mb-6">Join the Run</h2>
               <RoleCard 
                title="I need a Delivery" 
                desc="Register as a Student" 
                icon={User} 
                onClick={() => { setRole('requester'); setStep(2); }} 
               />
               <RoleCard 
                title="I want to Dispatch" 
                desc="Earn money delivering" 
                icon={Truck} 
                onClick={() => { setRole('dispatcher'); setStep(2); }} 
               />
               <p className="text-center text-sm text-white/40 mt-6">
                 Already have an account? {' '}
                 <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">Login</button>
               </p>
            </motion.div>
          ) : (
            <motion.div 
              key="form" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2rem] shadow-2xl"
            >
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft size={14}/> Back to roles
              </button>
              
              <h2 className="text-xl font-bold text-white mb-6">
                {role === 'dispatcher' ? 'Dispatcher Verification' : 'Student Details'}
              </h2>

              <form onSubmit={handleRegister} className="space-y-4">
                <Input 
                  placeholder="Full Name" 
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl" 
                  required 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
                <Input 
                  placeholder="Matric Number" 
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl" 
                  required 
                  value={formData.matricNumber}
                  onChange={(e) => setFormData({...formData, matricNumber: e.target.value})}
                />
                <Input 
                  placeholder="Department (e.g. Computer Science)" 
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl" 
                  required 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
                
                {role === 'requester' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      className="bg-white/5 border border-white/10 rounded-xl p-2 text-white text-sm outline-none h-12"
                      value={formData.hostel}
                      onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                      required
                    >
                      <option value="" disabled className="text-gray-500">Hostel</option>
                      {hostels.map(h => <option key={h} value={h} className="bg-slate-900">{h}</option>)}
                    </select>
                    <select 
                      className="bg-white/5 border border-white/10 rounded-xl p-2 text-white text-sm outline-none h-12"
                      value={formData.college}
                      onChange={(e) => setFormData({...formData, college: e.target.value})}
                      required
                    >
                      <option value="" disabled className="text-gray-500">College</option>
                      {colleges.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-primary/50 cursor-pointer transition-all bg-white/5">
                        <IdCard className="text-primary mb-2" />
                        <span className="text-[10px] text-white/60">Upload ID Card</span>
                        <input type="file" className="hidden" accept="image/*" />
                      </label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-primary/50 cursor-pointer transition-all bg-white/5">
                        <Camera className="text-primary mb-2" />
                        <span className="text-[10px] text-white/60">Take Selfie</span>
                        <input type="file" className="hidden" capture="user" accept="image/*" />
                      </label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-white/60 ml-1">Why do you want to join CampusRun?</Label>
                      <textarea 
                        placeholder="I want to help students..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-primary/50 min-h-[100px]"
                        required
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {/* Password field with Visibility Toggle */}
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl pr-12" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl shadow-lg mt-2 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (role === 'dispatcher' ? 'Submit Verification' : 'Complete Registration')}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RoleCard = ({ title, desc, icon: Icon, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-primary/10 w-full transition-all group">
    <div className="bg-primary/20 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
      <Icon size={24} />
    </div>
    <div className="text-left">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  </button>
);

export default Register;