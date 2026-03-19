import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  ChevronRight,
  History,
  Trash2,
  Camera,
  Shield,
  Bell,
  Fingerprint,
  CreditCard,
  Sun,
  Moon,
  CheckCircle2
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile, theme, toggleTheme } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Theme Configuration
  const isDark = theme === 'dark';

  const themeClass = {
    bg: isDark ? 'bg-[#020617]' : 'bg-[#F8FAFC]',
    header: isDark ? 'bg-[#0F172A]/50 border-white/5' : 'bg-white/70 border-slate-200',
    card: isDark ? 'bg-[#0F172A]' : 'bg-white',
    input: isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900',
    text: isDark ? 'text-white' : 'text-slate-900',
    subText: isDark ? 'text-white/40' : 'text-slate-500',
    border: isDark ? 'border-white/5' : 'border-slate-200',
    linkBg: isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
  };

  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Eniola Oluwaseyifunmi',
    username: user?.username || 'enny_sax',
    email: user?.email || 'eniola@bowen.edu.ng',
    matricNumber: user?.matricNumber || 'CSC/2021/001'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateUserProfile({
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email
    });
    setIsEditing(false);
    
    // Trigger Success Toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${themeClass.bg} ${themeClass.text} pb-10 transition-colors duration-500 relative`}>
      
      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs"
          >
            <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md">
              <CheckCircle2 size={20} />
              <span className="text-[11px] font-black uppercase tracking-widest">Changes Saved</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className={`p-6 flex items-center justify-between border-b ${themeClass.header} backdrop-blur-xl sticky top-0 z-50 transition-colors`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-xl ${isDark ? 'bg-white/5 text-white/70' : 'bg-slate-200 text-slate-600'} hover:opacity-80 transition-all`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-black italic tracking-[0.2em] uppercase text-primary">
            Profile Settings
          </h1>
        </div>

        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl border ${themeClass.border} ${themeClass.card} text-orange-500 shadow-sm transition-all active:scale-90`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 mt-8 space-y-8">
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-primary to-orange-600 p-[2px] shadow-2xl shadow-primary/20">
              <div className={`w-full h-full rounded-[1.9rem] ${themeClass.card} flex items-center justify-center overflow-hidden`}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-primary/40 italic">
                    {formData.fullName.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            <button 
              onClick={handleImageClick}
              className={`absolute bottom-0 right-0 p-2 bg-primary rounded-xl border-4 ${isDark ? 'border-[#020617]' : 'border-[#F8FAFC]'} text-white hover:scale-110 active:scale-95 transition-all shadow-lg`}
            >
              <Camera size={16} />
            </button>
          </div>

          <h2 className={`mt-4 text-xl font-bold ${themeClass.text}`}>{formData.fullName}</h2>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full mt-1">
            Verified Requester
          </p>
        </div>

        {/* USER FORM */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label className={`${themeClass.subText} text-[10px] font-black uppercase ml-1`}>Full Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`${themeClass.input} h-14 pl-12 rounded-2xl focus:border-primary transition-all`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={`${themeClass.subText} text-[10px] font-black uppercase ml-1`}>Username</Label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`${themeClass.input} h-14 pl-12 rounded-2xl focus:border-primary transition-all`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={`${themeClass.subText} text-[10px] font-black uppercase ml-1`}>Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`${themeClass.input} h-14 pl-12 rounded-2xl focus:border-primary transition-all`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={`${themeClass.subText} text-[10px] font-black uppercase ml-1`}>Matric Number</Label>
            <div className="relative">
              <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-slate-300'}`} size={18} />
              <Input
                value={formData.matricNumber}
                disabled
                className={`${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-400'} h-14 pl-12 rounded-2xl cursor-not-allowed`}
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`w-full h-14 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all shadow-sm ${
              isEditing
                ? 'bg-primary text-white border-none hover:bg-orange-600'
                : `${isDark ? 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile Info'}
          </Button>
        </motion.div>

        {/* LINKS */}
        <div className="space-y-3 pt-4">
          <p className={`${themeClass.subText} text-[10px] font-black uppercase tracking-widest ml-1`}>Management</p>
          <ProfileLink 
            icon={History} 
            label="My Requests History" 
            onClick={() => navigate('/my-requests')} 
            themeClass={themeClass}
          />
          <ProfileLink 
            icon={Lock} 
            label="Change Password" 
            onClick={() => navigate('/forgot-password')} 
            themeClass={themeClass}
          />
          <ProfileLink 
            icon={Bell} 
            label="Notification Settings" 
            onClick={() => navigate('/notification-settings')} 
            themeClass={themeClass}
          />
          <ProfileLink 
            icon={Shield} 
            label="Privacy & Security" 
            onClick={() => navigate('/privacy')} 
            themeClass={themeClass}
          />
        </div>

        {/* DANGER ZONE */}
        <div className={`pt-8 border-t ${themeClass.border} space-y-4`}>
          <button
            onClick={() => navigate('/delete-account')}
            className={`w-full flex items-center justify-between p-5 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group`}
          >
            <div className="flex items-center gap-3 text-red-500">
              <Trash2 size={20} />
              <span className="font-bold text-xs uppercase tracking-widest">Delete Account</span>
            </div>
            <ChevronRight size={18} className="text-red-500/40 group-hover:translate-x-1 transition-transform" />
          </button>

          <Button
            onClick={logout}
            className={`w-full h-14 rounded-2xl font-black tracking-widest uppercase transition-all ${
              isDark 
                ? 'bg-white/5 hover:bg-red-500 text-white/40 hover:text-white' 
                : 'bg-slate-200 hover:bg-red-500 text-slate-500 hover:text-white'
            }`}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProfileLink = ({ icon: Icon, label, onClick, themeClass }: { icon: any; label: string; onClick: () => void; themeClass: any }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-5 rounded-2xl ${themeClass.linkBg} border shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all group`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl ${themeClass.bg} text-primary group-hover:bg-primary group-hover:text-white transition-colors`}>
        <Icon size={18} />
      </div>
      <span className={`font-bold text-[11px] uppercase tracking-widest ${themeClass.subText} group-hover:text-primary transition-colors`}>
        {label}
      </span>
    </div>
    <ChevronRight size={16} className={`${themeClass.subText} group-hover:text-primary transition-colors`} />
  </button>
);

export default Profile;