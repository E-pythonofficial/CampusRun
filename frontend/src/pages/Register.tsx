import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/lib/types';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User as UserIcon, Truck, Camera, IdCard, Loader2, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('REQUESTER'); 
  const [isStaff, setIsStaff] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // File states for Cloudinary
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: '', 
    username: '',
    email: '',
    matricNumber: '',
    department: '',
    hostel: '',
    college: '',
    password: '',
    confirmPassword: '',
    bio: ''
  });

  const hostels = ["NH(girls)", "NH(boys)", "Block hostel", "Saddler", "UPE(boys)", "UPE(girls)", "John", "Luke", "Mark", "Mattew", "288 Girls", "150 Girls", "Story Building"];
  const colleges = ["COCCS", "COHES", "COAES", "COSMS", "COLIBS", "COLAW", "COEVS"];

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '' };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    const score = [hasLetters, hasNumbers, hasSpecial, isLongEnough].filter(Boolean).length;
    if (score <= 2) return { label: 'Weak Password', color: 'text-red-400' };
    if (score === 3) return { label: 'Medium Strength', color: 'text-yellow-400' };
    return { label: 'Strong Password', color: 'text-green-400' };
  };

  const strength = getPasswordStrength(formData.password);

  const validateInputs = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      alert("Invalid email! You must use a @gmail.com address.");
      return false;
    }
    
    if (!isStaff) {
      const matricRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{4}$/;
      if (!matricRegex.test(formData.matricNumber.toUpperCase())) {
        alert("Invalid Matric Format! Example: BU24SEN2004");
        return false;
      }
    }

    if (role === 'DISPATCHER') {
      if (!idFile || !selfieFile) {
        alert("Please upload both your Student ID and a Selfie for verification.");
        return false;
      }
      if (!formData.bio || formData.bio.length < 10) {
        alert("Please provide a short reason why you want to join.");
        return false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    
    try {
      // CRITICAL UPDATE: Creating FormData for Cloudinary Upload
      const data = new FormData();
      data.append('fullname', formData.fullName);
      data.append('email', formData.email.toLowerCase().trim());
      data.append('password', formData.password);
      data.append('role', role);
      data.append('userType', isStaff ? 'STAFF' : 'STUDENT');
      data.append('department', formData.department);
      
      // Handle Student vs Staff logic
      if (!isStaff) {
        data.append('matricNumber', formData.matricNumber.toUpperCase());
        if (role === 'REQUESTER') {
          data.append('hostel', formData.hostel);
          data.append('college', formData.college);
        }
      } else {
        data.append('staffId', formData.username);
      }

      // DISPATCHER SPECIFIC DATA (BIO & IMAGES)
      if (role === 'DISPATCHER') {
        data.append('bio', formData.bio);
        if (idFile) data.append('idCard', idFile); // Matches backend req.files.idCard
        if (selfieFile) data.append('selfie', selfieFile); // Matches backend req.files.selfie
      }

      const response = await api.post('/auth/register', data, {
        headers: { 
          'Content-Type': 'multipart/form-data' // Required for file streams
        }
      });

      if (role === 'DISPATCHER') {
        navigate('/application-received'); 
      } else {
        navigate('/verification', { 
          state: { email: formData.email, role: role } 
        });
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center p-4 overflow-hidden">
      <motion.img 
        src="/run.gif"
        alt="runner"
        className="w-24 h-20 object-contain mb-2 z-10"
        initial={{ x: "-100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo size="lg" light/>
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
              <h2 className="text-3xl font-bold text-white text-center mb-6 font-major">Join the Run</h2>
              <RoleCard
                title="Make A Request Today !"
                desc="Register Here 🥺"
                icon={UserIcon}
                onClick={() => { setRole('REQUESTER'); setIsStaff(false); setStep(2); }}
              />
              <RoleCard 
                title="I want to Dispatch" 
                desc="Earn money delivering" 
                icon={Truck} 
                onClick={() => { setRole('DISPATCHER'); setIsStaff(false); setStep(2); }} 
              />
              <p className="text-center text-sm text-white/40 mt-6 font-playful">
                Already have an account? {' '}
                <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
                  Login
                </button>
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
                onClick={() => { setStep(1); setIsStaff(false); }} 
                className="flex items-center gap-2 text-sm text-primary font-bold hover:text-primary/80 mb-6 transition-all font-playful"
              >
                <ArrowLeft size={18} strokeWidth={3}/> Back to roles
              </button>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white font-major">
                  {role === 'DISPATCHER' ? 'Dispatcher Verification' : (isStaff ? 'Staff Registration' : 'Student Details')}
                </h2>
                {role === 'REQUESTER' && (
                   <button type="button" onClick={() => setIsStaff(!isStaff)} className="text-xs text-primary hover:underline mt-1 font-playful">
                     {isStaff ? "Are you a student? Click here" : "Not a student? Register here"}
                   </button>
                )}
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <Input placeholder="Full Name" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />

                {isStaff ? (
                  <Input placeholder="Staff ID / Username" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                ) : (
                  <Input placeholder="Matric Number (e.g. BU24SEN2004)" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" required value={formData.matricNumber} onChange={(e) => setFormData({...formData, matricNumber: e.target.value})} />
                )}

                <Input type="email" placeholder="Email Address" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />

                <Input placeholder="Department (e.g. Software Engineering)" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                
                {role === 'REQUESTER' && !isStaff && (
                  <div className="grid grid-cols-2 gap-3">
                    <select className="bg-[#0f172a] border border-white/10 rounded-xl p-2 text-white text-sm outline-none h-12" value={formData.hostel} onChange={(e) => setFormData({...formData, hostel: e.target.value})} required>
                      <option value="" disabled>Hostel</option>
                      {hostels.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select className="bg-[#0f172a] border border-white/10 rounded-xl p-2 text-white text-sm outline-none h-12" value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} required>
                      <option value="" disabled>College</option>
                      {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {role === 'DISPATCHER' && (
                  <div className="space-y-3">
                    <Label className="text-[10px] text-white/60 ml-1 font-playful">Upload Student ID Card for verification</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all bg-white/5 text-center ${idFile ? 'border-primary' : 'border-white/10'}`}>
                        <IdCard className={idFile ? "text-white" : "text-primary"} size={22} />
                        <span className="text-[10px] text-white/60 font-playful leading-tight">{idFile ? idFile.name.substring(0, 10) + '...' : 'Upload ID Card'}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                      </label>
                      <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all bg-white/5 text-center ${selfieFile ? 'border-primary' : 'border-white/10'}`}>
                        <Camera className={selfieFile ? "text-white" : "text-primary"} size={22} />
                        <span className="text-[10px] text-white/60 font-playful leading-tight">{selfieFile ? 'Selfie Captured!' : 'Take A Selfie'}</span>
                        <input type="file" className="hidden" capture="user" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                    <textarea placeholder="Why do you want to join CampusRun?" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-primary/50 min-h-[80px]" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      className="bg-white/5 border-white/10 text-white h-12 rounded-xl pr-12" 
                      required 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors focus:outline-none">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className={`text-[10px] font-bold flex items-center gap-1 ml-2 transition-all ${strength.color}`}>
                       {strength.label === 'Strong Password' ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>}
                       {strength.label}
                    </div>
                  )}

                  <Input 
                    type="password" 
                    placeholder="Confirm Password" 
                    className={`bg-white/5 border-white/10 text-white h-12 rounded-xl ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : ''}`} 
                    required 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
                
                <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl shadow-lg mt-2 transition-all active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" /> : 'Complete Registration'}
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
      <h3 className="font-bold text-white font-major">{title}</h3>
      <p className="text-xs text-muted-foreground font-playful">{desc}</p>
    </div>
  </button>
);

export default Register;