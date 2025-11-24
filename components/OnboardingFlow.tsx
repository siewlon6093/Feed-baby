
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BabyProfile, User } from '../types';
import { ArrowRight, Calendar, Ruler, Scale, Check, ChevronLeft, Baby } from 'lucide-react';
import { BabyAvatar } from './BabyAvatar';

interface OnboardingFlowProps {
  user: User;
  onComplete: (profile: BabyProfile) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  
  // Form State
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'BOY' | 'GIRL' | 'NEUTRAL'>('NEUTRAL');
  const [volumeUnit, setVolumeUnit] = useState<'ML' | 'OZ'>('ML');
  const [weightUnit, setWeightUnit] = useState<'KG' | 'LB'>('KG');
  const [heightUnit, setHeightUnit] = useState<'CM' | 'IN'>('CM');

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) setStep(s => s + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleFinish = () => {
    // Calculate initial age string
    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '';
        const birth = new Date(birthDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - birth.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w old`;
        const months = Math.floor(diffDays / 30.44);
        return `${months}m old`;
    };

    const newProfile: BabyProfile = {
        name,
        birthDate: dob,
        gender,
        volumeUnit,
        weightUnit,
        heightUnit,
        age: calculateAge(dob),
        remindersEnabled: false,
        reminderIntervalMinutes: 180,
        avatarConfig: { colorTheme: 'neutral', mood: 'happy' }, // Default happy start
        personalityTags: []
    };

    onComplete(newProfile);
  };

  const variants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  // Helper for rendering step dots
  const StepIndicator = () => (
    <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map(i => (
            <motion.div 
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-500' : i < step ? 'w-2 bg-indigo-200' : 'w-2 bg-slate-200'}`}
            />
        ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFBF7] relative overflow-hidden font-['Quicksand']">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
         <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl"
         />
         <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-40 -left-20 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl"
         />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-[40px] p-8"
        >
            <StepIndicator />

            <div className="min-h-[320px] flex flex-col">
                <AnimatePresence mode="wait">
                    
                    {/* STEP 1: NAME */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            variants={variants}
                            initial="enter" animate="center" exit="exit"
                            className="flex-1 flex flex-col"
                        >
                            <div className="flex-1">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <Baby size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-3">Hello, {user.name.split(' ')[0]}!</h2>
                                <p className="text-slate-500 font-medium text-lg mb-8">Let's set up your baby's space. First, what shall we call your little one?</p>
                                
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Baby's Name</label>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        placeholder="e.g. Oliver"
                                        className="w-full p-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl text-xl font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: BIRTHDAY & GENDER */}
                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            variants={variants}
                            initial="enter" animate="center" exit="exit"
                            className="flex-1 flex flex-col"
                        >
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome, {name}!</h2>
                            <p className="text-slate-500 font-medium mb-8">When did the journey begin?</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Calendar size={14} />
                                        Date of Birth
                                    </label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 bg-slate-50 rounded-2xl text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={dob}
                                        onChange={e => setDob(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender (Optional)</label>
                                    <div className="flex gap-3">
                                        {(['BOY', 'GIRL', 'NEUTRAL'] as const).map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${gender === g ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                {g === 'NEUTRAL' ? 'Surprise' : g.charAt(0) + g.slice(1).toLowerCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: UNITS & FINAL */}
                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            variants={variants}
                            initial="enter" animate="center" exit="exit"
                            className="flex-1 flex flex-col"
                        >
                            <div className="mb-6 text-center">
                                <div className="mx-auto w-24 h-24 mb-4">
                                    <BabyAvatar config={{ colorTheme: 'neutral', mood: 'happy' }} size="lg" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Almost Ready!</h2>
                                <p className="text-slate-500 text-sm">How do you prefer to measure things?</p>
                            </div>

                            <div className="space-y-4 bg-slate-50 p-6 rounded-3xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                        <Scale size={16} /> Milk Volume
                                    </span>
                                    <div className="flex bg-white rounded-lg p-1 shadow-sm">
                                        <button onClick={() => setVolumeUnit('ML')} className={`px-3 py-1 rounded-md text-xs font-bold ${volumeUnit === 'ML' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}>ML</button>
                                        <button onClick={() => setVolumeUnit('OZ')} className={`px-3 py-1 rounded-md text-xs font-bold ${volumeUnit === 'OZ' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}>OZ</button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                        <Ruler size={16} /> Weight
                                    </span>
                                    <div className="flex bg-white rounded-lg p-1 shadow-sm">
                                        <button onClick={() => setWeightUnit('KG')} className={`px-3 py-1 rounded-md text-xs font-bold ${weightUnit === 'KG' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400'}`}>KG</button>
                                        <button onClick={() => setWeightUnit('LB')} className={`px-3 py-1 rounded-md text-xs font-bold ${weightUnit === 'LB' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400'}`}>LB</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                {step > 1 && (
                    <button 
                        onClick={handleBack}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                <button 
                    onClick={handleNext}
                    disabled={step === 1 && !name}
                    className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 text-lg"
                >
                    {step === totalSteps ? 'Start Tracking' : 'Next'}
                    {step < totalSteps && <ArrowRight size={20} />}
                    {step === totalSteps && <Check size={20} />}
                </button>
            </div>
        </motion.div>
      </div>
    </div>
  );
};
