import { useState, useRef } from 'react'; // Added useRef
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
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
  CreditCard
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile } = useAuth();
  
  // 1. Create a reference for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Eniola Oluwaseyifunmi',
    username: user?.username || 'enny_sax',
    email: user?.email || 'eniola@bowen.edu.ng',
    matricNumber: user?.matricNumber || 'CSC/2021/001'
  });

  // 2. Function to trigger the file dialog
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Function to handle the file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        // You can also call updateUserProfile here if you want to save it immediately
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
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-10">
      {/* HEADER */}
      <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-[#0F172A]/50 backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-black italic tracking-[0.2em] uppercase text-primary">
          Profile Settings
        </h1>
      </div>

      <div className="max-w-md mx-auto px-6 mt-8 space-y-8">
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-primary to-orange-600 p-[2px] shadow-2xl shadow-primary/20">
              <div className="w-full h-full rounded-[1.9rem] bg-[#0F172A] flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-primary/40 italic">
                    {formData.fullName.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Functional Camera Button */}
            <button 
              onClick={handleImageClick}
              className="absolute bottom-0 right-0 p-2 bg-primary rounded-xl border-4 border-[#020617] text-white hover:scale-110 active:scale-95 transition-all shadow-lg"
            >
              <Camera size={16} />
            </button>
          </div>

          <h2 className="mt-4 text-xl font-bold">{formData.fullName}</h2>
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
            <Label className="text-white/40 text-[10px] font-black uppercase ml-1">Full Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/40 text-[10px] font-black uppercase ml-1">Username</Label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/40 text-[10px] font-black uppercase ml-1">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/40 text-[10px] font-black uppercase ml-1">Matric Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <Input
                value={formData.matricNumber}
                disabled
                className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white/40 cursor-not-allowed"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`w-full h-14 rounded-2xl border-white/10 font-bold text-xs tracking-widest uppercase transition-all ${
              isEditing
                ? 'bg-primary text-white border-none'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile Info'}
          </Button>
        </motion.div>

        {/* LINKS */}
        <div className="space-y-3 pt-4">
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest ml-1">Management</p>
          <ProfileLink icon={History} label="My Requests History" onClick={() => navigate('/my-requests')} />
          <ProfileLink icon={Lock} label="Change Password" onClick={() => navigate('/forgot-password')} />
          <ProfileLink icon={Bell} label="Notification Settings" onClick={() => navigate('/notification-settings')} />
          <ProfileLink icon={Shield} label="Privacy & Security" onClick={() => navigate('/privacy')} />
        </div>

        {/* DANGER ZONE */}
        <div className="pt-8 border-t border-white/5 space-y-4">
          <button
            onClick={() => navigate('/delete-account')}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors group"
          >
            <div className="flex items-center gap-3 text-red-500">
              <Trash2 size={20} />
              <span className="font-bold text-xs uppercase tracking-widest">Delete Account</span>
            </div>
            <ChevronRight size={18} className="text-red-500/40 group-hover:translate-x-1 transition-transform" />
          </button>

          <Button
            onClick={logout}
            className="w-full h-14 rounded-2xl bg-white/5 hover:bg-red-500 hover:text-white text-white/40 font-black tracking-widest uppercase transition-all"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProfileLink = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void; }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
  >
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon size={18} />
      </div>
      <span className="font-bold text-[11px] uppercase tracking-widest text-white/70 group-hover:text-white">{label}</span>
    </div>
    <ChevronRight size={16} className="text-white/10 group-hover:text-primary transition-colors" />
  </button>
);

export default Profile;