
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BabyProfile, BabyAvatarConfig, FeedingLog, GrowthLog } from '../types';
import { BabyAvatar } from './BabyAvatar';
import { 
  LogOut, Milk, Moon, Sun, Heart, Sparkles, Zap, Star, Smile, Cloud,
  Edit2, Calendar, Scale, Clock, Check, X, Lock, UserPlus, Settings, User as UserIcon,
  ChevronLeft, Mail, Shield, CloudRain, Download, Trash2, ChevronRight, Loader2
} from 'lucide-react';

interface ProfileHubProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentProfile: BabyProfile | null;
  onSave: (profile: BabyProfile) => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  lastFeedingLog?: FeedingLog;
  latestGrowthLog?: GrowthLog;
  lastSleepLog?: FeedingLog;
}

// --- Constants ---
const PERSONALITY_OPTIONS = [
    { id: 'milk_monster', label: 'Milk Monster', icon: Milk, color: 'blue' },
    { id: 'calm_sleeper', label: 'Calm Sleeper', icon: Moon, color: 'indigo' },
    { id: 'early_bird', label: 'Early Bird', icon: Sun, color: 'amber' },
    { id: 'cuddle_lover', label: 'Cuddle Lover', icon: Heart, color: 'rose' },
    { id: 'curious_mind', label: 'Curious Mind', icon: Sparkles, color: 'purple' },
    { id: 'fast_feeder', label: 'Fast Feeder', icon: Zap, color: 'yellow' },
    { id: 'night_owl', label: 'Night Owl', icon: Star, color: 'slate' },
    { id: 'happy_baby', label: 'Happy Baby', icon: Smile, color: 'emerald' },
    { id: 'gentle_dreamer', label: 'Gentle Dreamer', icon: Cloud, color: 'sky' },
];

const AVATAR_COLORS = ['rose', 'blue', 'green', 'yellow', 'neutral'] as const;
const AVATAR_MOODS = ['calm', 'happy', 'sleepy', 'curious'] as const;
const PARENT_ROLES = ['MAMA', 'PAPA', 'GUARDIAN', 'NANNY', 'OTHER'];

type ViewState = 'MAIN' | 'EDIT_BABY' | 'EDIT_PARENT' | 'SETTINGS';

export const ProfileHub: React.FC<ProfileHubProps> = ({ 
    isOpen, onClose, user, currentProfile, onSave, onUpdateUser, onLogout, lastFeedingLog, latestGrowthLog, lastSleepLog
}) => {
    const [view, setView] = useState<ViewState>('MAIN');
    const [isLoading, setIsLoading] = useState(false);

    // --- Baby Form State ---
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState<'BOY' | 'GIRL' | 'NEUTRAL'>('NEUTRAL');
    const [volumeUnit, setVolumeUnit] = useState<'ML' | 'OZ'>('ML');
    const [weightUnit, setWeightUnit] = useState<'KG' | 'LB'>('KG');
    const [heightUnit, setHeightUnit] = useState<'CM' | 'IN'>('CM');
    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [reminderInterval, setReminderInterval] = useState(180);
    const [avatarConfig, setAvatarConfig] = useState<BabyAvatarConfig>({ colorTheme: 'neutral', mood: 'calm' });
    const [personalityTags, setPersonalityTags] = useState<string[]>([]);

    // --- Parent Form State ---
    const [parentName, setParentName] = useState('');
    const [parentRole, setParentRole] = useState('MAMA');
    const [parentTheme, setParentTheme] = useState('rose');

    const isGuest = user?.isGuest;

    useEffect(() => {
        if (isOpen) {
            setView('MAIN');
            if (currentProfile) {
                setName(currentProfile.name);
                setDob(currentProfile.birthDate);
                setGender(currentProfile.gender);
                setVolumeUnit(currentProfile.volumeUnit);
                setWeightUnit(currentProfile.weightUnit || 'KG');
                setHeightUnit(currentProfile.heightUnit || 'CM');
                setRemindersEnabled(currentProfile.remindersEnabled || false);
                setReminderInterval(currentProfile.reminderIntervalMinutes || 180);
                setAvatarConfig(currentProfile.avatarConfig || { colorTheme: 'neutral', mood: 'calm' });
                setPersonalityTags(currentProfile.personalityTags || []);
            } else {
                setView('EDIT_BABY'); // Force setup
                setAvatarConfig({ colorTheme: 'neutral', mood: 'calm' });
                setPersonalityTags([]);
                setName('');
                setDob('');
            }

            if (user && !isGuest) {
                setParentName(user.name);
                setParentRole(user.role || 'MAMA');
                setParentTheme(user.colorTheme || 'rose');
            }
        }
    }, [isOpen, currentProfile, isGuest, user]);

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '';
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return '';
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - birth.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays < 7) return `${diffDays}d old`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w old`;
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30.44);
            return `${months}m old`;
        }
        return `${Math.floor(diffDays / 365)}y old`;
    };

    const togglePersonalityTag = (tagId: string) => {
        setPersonalityTags(prev => {
            if (prev.includes(tagId)) return prev.filter(t => t !== tagId);
            if (prev.length >= 3) return prev; 
            return [...prev, tagId];
        });
    };

    const handleSaveBaby = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            birthDate: dob,
            gender,
            volumeUnit,
            weightUnit,
            heightUnit,
            age: calculateAge(dob),
            remindersEnabled,
            reminderIntervalMinutes: reminderInterval,
            avatarConfig,
            personalityTags
        });
        setView('MAIN');
    };

    const handleSaveParent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || isGuest) return;
        
        setIsLoading(true);
        // Simulate API call via App wrapper
        onUpdateUser({
            ...user,
            name: parentName,
            role: parentRole as any,
            colorTheme: parentTheme as any
        });
        
        setTimeout(() => {
            setIsLoading(false);
            setView('MAIN');
        }, 500); // Gentle artificial delay for UX
    };

    // --- Render Sections ---
    // (Render functions omitted for brevity as logic is unchanged, focusing on structure fix below)
    const renderHeader = () => {
        let title = 'Profile Hub';
        if (view === 'EDIT_BABY') title = 'Customize Baby';
        if (view === 'EDIT_PARENT') title = 'Edit Account';
        if (view === 'SETTINGS') title = 'Settings';

        return (
            <div className="sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-md z-20 pt-6 pb-2 px-6 flex items-center justify-between border-b border-slate-100/50">
                <div className="flex items-center gap-2">
                    {view !== 'MAIN' && (
                        <button 
                            onClick={() => setView('MAIN')}
                            className="w-8 h-8 -ml-2 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        {title}
                    </h3>
                </div>
                <button 
                    type="button" 
                    onClick={onClose}
                    className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        );
    };
    // Helper rendering methods from previous implementation...
    const renderParentCard = () => {
        if (isGuest) {
            return (
                <div className="bg-white p-6 rounded-[24px] border border-indigo-100 shadow-sm mb-6 text-center">
                     <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mx-auto mb-3">
                        <Lock size={24} />
                     </div>
                     <h4 className="font-bold text-slate-800 mb-2">Using Guest Mode</h4>
                     <p className="text-sm text-slate-500 mb-4">
                        Create an account to sync your baby's milestones and access them on any device.
                     </p>
                     <button 
                        onClick={onLogout} 
                        className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                     >
                        <UserPlus size={16} />
                        Create Account
                     </button>
                </div>
            );
        }
        const theme = user?.colorTheme || 'rose';
        const themeColors: Record<string, string> = {
            rose: 'bg-rose-50 text-rose-500 border-rose-100',
            blue: 'bg-blue-50 text-blue-500 border-blue-100',
            indigo: 'bg-indigo-50 text-indigo-500 border-indigo-100',
            emerald: 'bg-emerald-50 text-emerald-500 border-emerald-100',
            amber: 'bg-amber-50 text-amber-500 border-amber-100',
        };
        return (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-5 mb-6 relative overflow-hidden group">
                 <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${themeColors[theme].split(' ')[0]}`} />
                 <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-[20px] ${themeColors[theme]} border flex items-center justify-center font-bold text-xl shadow-sm transition-colors`}>
                            {user?.name.charAt(0).toUpperCase() || <UserIcon size={24} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">{user?.name}</h4>
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide rounded-md mb-1">
                                {user?.role || 'Parent'}
                            </span>
                            <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => setView('EDIT_PARENT')}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-100"
                        >
                            <Edit2 size={18} />
                        </button>
                         <button 
                            onClick={() => setView('SETTINGS')}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-100"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                 </div>
            </div>
        );
    };
    const renderBabyIdentityCard = () => (
        <div className="relative w-full bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-white overflow-hidden text-center pb-8">
             <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-${avatarConfig.colorTheme}-50/80 to-white`} />
             <div className="relative z-10 pt-10 px-6">
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto w-40 h-40 mb-2"
                 >
                     <BabyAvatar config={avatarConfig} size="hero" />
                 </motion.div>
                 <h2 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">{name || 'Baby'}</h2>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6">
                     <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                        {dob ? calculateAge(dob) : 'Newborn'}
                     </span>
                 </div>
                 <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[32px]">
                     {personalityTags.length > 0 ? (
                         personalityTags.map(tagId => {
                             const tag = PERSONALITY_OPTIONS.find(p => p.id === tagId);
                             if (!tag) return null;
                             return (
                                <div key={tagId} className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold bg-${tag.color}-50 text-${tag.color}-600 border border-${tag.color}-100 shadow-sm`}>
                                    <tag.icon size={12} strokeWidth={2.5} />
                                    {tag.label}
                                </div>
                             );
                         })
                     ) : (
                         <span className="text-slate-300 text-xs font-medium italic">Add personality tags...</span>
                     )}
                 </div>
                 <div className="grid grid-cols-3 gap-2 text-left mb-8">
                     <div className="bg-slate-50/80 p-3 rounded-[20px] border border-slate-100 flex flex-col items-center text-center justify-center">
                         <div className="text-slate-400 mb-1"><Clock size={14} strokeWidth={3} /></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Last Feed</span>
                         <p className="text-slate-800 font-bold text-xs truncate w-full">
                             {lastFeedingLog ? new Date(lastFeedingLog.startTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'}) : '--:--'}
                         </p>
                     </div>
                     <div className="bg-slate-50/80 p-3 rounded-[20px] border border-slate-100 flex flex-col items-center text-center justify-center">
                         <div className="text-indigo-300 mb-1"><Moon size={14} strokeWidth={3} /></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Last Sleep</span>
                         <p className="text-slate-800 font-bold text-xs">
                             {lastSleepLog ? (lastSleepLog.durationSeconds ? `${Math.round(lastSleepLog.durationSeconds/60)}m` : 'Active') : '--'}
                         </p>
                     </div>
                     <div className="bg-slate-50/80 p-3 rounded-[20px] border border-slate-100 flex flex-col items-center text-center justify-center">
                         <div className="text-emerald-300 mb-1"><Scale size={14} strokeWidth={3} /></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Weight</span>
                         <p className="text-slate-800 font-bold text-xs">
                             {latestGrowthLog?.weightKg 
                                ? (weightUnit === 'LB' ? `${(latestGrowthLog.weightKg * 2.20462).toFixed(1)}lb` : `${latestGrowthLog.weightKg}kg`) 
                                : '--'}
                         </p>
                     </div>
                 </div>
                 <button 
                    onClick={() => setView('EDIT_BABY')}
                    className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                    <Edit2 size={16} />
                    Customize Profile
                 </button>
             </div>
        </div>
    );
    const renderEditBabyForm = () => (
        <form onSubmit={handleSaveBaby} className="space-y-8 pb-12">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                 <div className="flex justify-center mb-6 scale-110">
                     <BabyAvatar config={avatarConfig} size="lg" />
                 </div>
                 <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Theme Color</label>
                        <div className="flex justify-center gap-3">
                            {AVATAR_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setAvatarConfig(prev => ({ ...prev, colorTheme: c }))}
                                    className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${avatarConfig.colorTheme === c ? `ring-2 ring-offset-2 ring-indigo-500 scale-110` : `hover:scale-105`}`}
                                >
                                    <div className={`w-full h-full rounded-full bg-${c}-400 border-2 border-white shadow-sm`} />
                                    {avatarConfig.colorTheme === c && <Check size={14} className="text-white absolute drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Current Mood</label>
                        <div className="flex justify-center flex-wrap gap-2">
                            {AVATAR_MOODS.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setAvatarConfig(prev => ({ ...prev, mood: m }))}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${avatarConfig.mood === m ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-500 mb-3">Personality Tags <span className="text-slate-300 font-normal text-xs">(Max 3)</span></label>
                <div className="grid grid-cols-2 gap-2">
                    {PERSONALITY_OPTIONS.map(tag => {
                        const isSelected = personalityTags.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => togglePersonalityTag(tag.id)}
                                className={`p-3 rounded-2xl flex items-center gap-3 transition-all border text-left ${isSelected ? `border-${tag.color}-200 bg-${tag.color}-50 text-${tag.color}-700 shadow-sm` : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/60' : 'bg-slate-100'}`}>
                                    <tag.icon size={14} />
                                </div>
                                <span className="text-xs font-bold">{tag.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="space-y-4 bg-slate-50 p-6 rounded-[32px]">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Baby Details</h4>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Name</label>
                    <input 
                        type="text" 
                        required
                        className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-semibold focus:border-indigo-500 outline-none shadow-sm"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Birthday</label>
                    <input 
                        type="date" 
                        required
                        className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-semibold focus:border-indigo-500 outline-none shadow-sm"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                    />
                </div>
            </div>
             <div className="space-y-4 bg-slate-50 p-6 rounded-[32px]">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">App Settings</h4>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setVolumeUnit(volumeUnit === 'ML' ? 'OZ' : 'ML')} className={`flex-1 py-3 rounded-xl text-xs font-bold shadow-sm border transition-colors ${volumeUnit === 'ML' ? 'bg-white text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-transparent'}`}>Milliliters (ml)</button>
                    <button type="button" onClick={() => setVolumeUnit(volumeUnit === 'OZ' ? 'ML' : 'OZ')} className={`flex-1 py-3 rounded-xl text-xs font-bold shadow-sm border transition-colors ${volumeUnit === 'OZ' ? 'bg-white text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-transparent'}`}>Ounces (oz)</button>
                </div>
                 <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                    <label className="text-sm font-bold text-slate-600">Feed Reminders</label>
                    <button 
                        type="button"
                        onClick={() => setRemindersEnabled(!remindersEnabled)}
                        className={`w-12 h-7 rounded-full transition-all relative ${remindersEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${remindersEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
            <button type="submit" className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-3xl shadow-xl shadow-slate-300 transition-all active:scale-95 text-lg">Save Updates</button>
        </form>
    );
    const renderEditParentForm = () => (
        <form onSubmit={handleSaveParent} className="space-y-8 pb-12">
             <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">
                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl font-bold mb-4 bg-${parentTheme}-50 text-${parentTheme}-500 border border-${parentTheme}-100`}>
                    {parentName.charAt(0).toUpperCase() || 'U'}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Choose Avatar Color</p>
                <div className="flex gap-2">
                    {['rose', 'blue', 'indigo', 'emerald', 'amber'].map(c => (
                        <button 
                            key={c} 
                            type="button"
                            onClick={() => setParentTheme(c)}
                            className={`w-8 h-8 rounded-full bg-${c}-400 border-2 border-white shadow-sm transition-transform ${parentTheme === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-200' : 'hover:scale-110'}`} 
                        />
                    ))}
                </div>
             </div>
             <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Your Name</label>
                    <input 
                        type="text" 
                        required
                        className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-semibold focus:border-indigo-500 outline-none shadow-sm text-lg"
                        value={parentName}
                        onChange={e => setParentName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Your Role</label>
                    <div className="flex flex-wrap gap-2">
                        {PARENT_ROLES.map(role => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setParentRole(role)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${parentRole === role ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                            >
                                {role.charAt(0) + role.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Account</label>
                    <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-medium text-slate-400 flex items-center gap-3">
                        <Mail size={18} />
                        {user?.email}
                        <Lock size={14} className="ml-auto opacity-50" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 ml-1">Email cannot be changed for security reasons.</p>
                </div>
             </div>
             <div className="pt-4">
                 <button type="submit" disabled={isLoading} className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-3xl shadow-xl shadow-slate-300 transition-all active:scale-95 text-lg flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Save Account'}
                </button>
                <button type="button" onClick={() => setView('MAIN')} className="w-full py-4 mt-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Cancel</button>
             </div>
        </form>
    );
    const renderSettings = () => (
        <div className="space-y-6 pb-12">
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center"><CloudRain size={20} /></div>
                        <div className="text-left"><h4 className="text-sm font-bold text-slate-700">Cloud Sync</h4><p className="text-xs text-slate-400">Last synced just now</p></div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wide border border-emerald-100">Active</div>
                </div>
                <button 
                    onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, profile: currentProfile }));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href",     dataStr);
                        downloadAnchorNode.setAttribute("download", "feedbaby_data.json");
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                    }}
                    className="w-full p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center"><Download size={20} /></div>
                        <div className="text-left"><h4 className="text-sm font-bold text-slate-700">Export Data</h4><p className="text-xs text-slate-400">Download a JSON backup</p></div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                </button>
                <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                        <div className="text-left"><h4 className="text-sm font-bold text-slate-700">Privacy Policy</h4><p className="text-xs text-slate-400">Read terms & conditions</p></div>
                    </div>
                     <ChevronRight size={16} className="text-slate-300" />
                </div>
            </div>
            <div className="bg-rose-50 rounded-[32px] border border-rose-100 p-1 overflow-hidden">
                <button 
                    onClick={() => {
                        if(window.confirm("Are you sure? This cannot be undone.")) {
                            onLogout(); // Simulating delete for now
                        }
                    }}
                    className="w-full p-4 hover:bg-rose-100 transition-colors rounded-[28px] flex items-center gap-3 text-rose-600"
                >
                    <div className="w-10 h-10 bg-white/50 text-rose-500 rounded-xl flex items-center justify-center"><Trash2 size={20} /></div>
                    <div className="text-left"><h4 className="text-sm font-bold">Delete Account</h4><p className="text-xs opacity-70">Permanently remove all data</p></div>
                </button>
            </div>
            <div className="text-center pt-4">
                <button onClick={onLogout} className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-2 mx-auto"><LogOut size={16} /> Log Out</button>
                <p className="text-[10px] text-slate-300 mt-4">Version 1.2.0 • Nurture App</p>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                    />
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 w-full bg-[#FDFBF7] rounded-t-[40px] z-40 h-[92vh] overflow-y-auto shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]"
                        style={{ maxWidth: '448px', margin: '0 auto' }}
                    >
                        {renderHeader()}
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {view === 'MAIN' && (
                                    <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        {renderParentCard()}
                                        {renderBabyIdentityCard()}
                                    </motion.div>
                                )}
                                {view === 'EDIT_BABY' && (
                                    <motion.div key="edit_baby" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        {renderEditBabyForm()}
                                    </motion.div>
                                )}
                                {view === 'EDIT_PARENT' && (
                                    <motion.div key="edit_parent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        {renderEditParentForm()}
                                    </motion.div>
                                )}
                                 {view === 'SETTINGS' && (
                                    <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        {renderSettings()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
