import React, { useState, useEffect, useRef } from 'react';
import { FeedingType, FeedingLog, BabyProfile, GrowthLog, User, MilkInventoryItem } from './types';
import { TimerDisplay } from './components/TimerDisplay';
import { HistoryItem } from './components/HistoryItem';
import { HistoryView } from './components/HistoryView';
import { Charts } from './components/Charts';
import { GrowthCharts } from './components/GrowthCharts';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { analyzeFeedingLogs } from './services/geminiService';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { milkService } from './services/milkService';
import { Logo } from './components/Logo';
import { BabyAvatar } from './components/BabyAvatar';
import { EmptyStateIllustration } from './components/Illustrations';
import { ProfileHub } from './components/ProfileHub';
import { ManualEntryModal } from './components/ManualEntryModal';
import { GrowthModal } from './components/GrowthModal';
import { PumpModal } from './components/PumpModal';
import { MilkInventory } from './components/MilkInventory';
import { ConfirmationModal } from './components/ConfirmationModal';
import { 
  Square, Sparkles, Activity, 
  Baby, Milk, Utensils, Clock, ArrowRight, Settings,
  BellRing, AlertCircle, Moon, Scale, Ruler, TrendingUp, Plus, Droplet, Package,
  ScrollText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  // --- User State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- App State ---
  const [logs, setLogs] = useState<FeedingLog[]>([]);
  const [growthLogs, setGrowthLogs] = useState<GrowthLog[]>([]);
  const [activeTimer, setActiveTimer] = useState<{
    type: FeedingType.BREAST_LEFT | FeedingType.BREAST_RIGHT | FeedingType.SLEEP;
    startTime: number;
  } | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);
  const [milkInventory, setMilkInventory] = useState<MilkInventoryItem[]>([]);

  // Refs for stale closure fixing in callbacks
  const logsRef = useRef(logs);
  const milkInventoryRef = useRef(milkInventory);

  useEffect(() => { logsRef.current = logs; }, [logs]);
  useEffect(() => { milkInventoryRef.current = milkInventory; }, [milkInventory]);

  const [view, setView] = useState<'TRACK' | 'ACTIVITY' | 'INSIGHTS' | 'GROWTH'>('TRACK');
  
  // Modals
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [growthModalOpen, setGrowthModalOpen] = useState(false);
  const [profileHubOpen, setProfileHubOpen] = useState(false);
  const [pumpModalOpen, setPumpModalOpen] = useState(false);
  const [milkInventoryOpen, setMilkInventoryOpen] = useState(false);
  
  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const [editingLog, setEditingLog] = useState<FeedingLog | null>(null);
  const [editingGrowthLog, setEditingGrowthLog] = useState<GrowthLog | null>(null);
  const [insightText, setInsightText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual Entry Logic State (used for opening modal)
  const [manualType, setManualType] = useState<FeedingType | 'NURSING_MANUAL'>('NURSING_MANUAL');

  // Notification State
  const lastNotificationTimeRef = useRef<number>(0);
  const [nextFeedTime, setNextFeedTime] = useState<Date | null>(null);

  // --- Auth & Data Loading Effects ---

  useEffect(() => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
          setUser(currentUser);
      } else {
          setIsLoadingData(false);
      }
  }, []);

  useEffect(() => {
      if (user) {
          setIsLoadingData(true);
          storageService.loadUserData(user.id).then(data => {
              setLogs(data.logs);
              setGrowthLogs(data.growthLogs);
              setActiveTimer(data.activeTimer);
              setMilkInventory(data.milkInventory);
              
              if (data.babyProfile) {
                  const parsed = data.babyProfile;
                  // Defaults
                  if (!parsed.volumeUnit) parsed.volumeUnit = 'ML';
                  if (!parsed.weightUnit) parsed.weightUnit = 'KG';
                  if (!parsed.heightUnit) parsed.heightUnit = 'CM';
                  if (parsed.remindersEnabled === undefined) parsed.remindersEnabled = false;
                  if (!parsed.reminderIntervalMinutes) parsed.reminderIntervalMinutes = 180;
                  if (!parsed.avatarConfig) parsed.avatarConfig = { colorTheme: 'neutral', mood: 'calm' };
                  if (!parsed.personalityTags) parsed.personalityTags = [];
                  setBabyProfile(parsed);
              } else {
                  setBabyProfile(null);
              }
              
              setIsLoadingData(false);
          });
      }
  }, [user]);

  // Sync Data Changes
  useEffect(() => {
    if (user && !isLoadingData) {
        storageService.saveLogs(user.id, logs);
    }
  }, [logs, user, isLoadingData]);

  useEffect(() => {
    if (user && !isLoadingData) {
        storageService.saveGrowthLogs(user.id, growthLogs);
    }
  }, [growthLogs, user, isLoadingData]);

  useEffect(() => {
    if (user && !isLoadingData) {
        storageService.saveActiveTimer(user.id, activeTimer);
    }
  }, [activeTimer, user, isLoadingData]);

  useEffect(() => {
    if (user && !isLoadingData && babyProfile) {
        storageService.saveBabyProfile(user.id, babyProfile);
    }
  }, [babyProfile, user, isLoadingData]);

  useEffect(() => {
    if (user && !isLoadingData) {
        storageService.saveInventory(user.id, milkInventory);
    }
  }, [milkInventory, user, isLoadingData]);

  useEffect(() => {
    if (!manualModalOpen) {
        setEditingLog(null);
    }
  }, [manualModalOpen]);

  // Reminder Logic
  useEffect(() => {
    const checkReminders = () => {
      if (!babyProfile?.remindersEnabled || !babyProfile.reminderIntervalMinutes || logs.length === 0) {
        setNextFeedTime(null);
        return;
      }

      const lastFeed = logs.find(l => l.type === FeedingType.BREAST_LEFT || l.type === FeedingType.BREAST_RIGHT || l.type === FeedingType.BOTTLE);
      if (!lastFeed) return;

      const intervalMs = babyProfile.reminderIntervalMinutes * 60 * 1000;
      const nextDue = lastFeed.startTime + intervalMs;
      setNextFeedTime(new Date(nextDue));

      const now = Date.now();
      if (now >= nextDue && (now - nextDue < 30 * 60 * 1000)) {
        if (now - lastNotificationTimeRef.current > 60 * 60 * 1000) {
             sendNotification(babyProfile.name);
             lastNotificationTimeRef.current = now;
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [logs, babyProfile]);

  // --- Helpers ---
  const getVolumeUnit = () => babyProfile?.volumeUnit || 'ML';
  const getWeightUnit = () => babyProfile?.weightUnit || 'KG';
  const getHeightUnit = () => babyProfile?.heightUnit || 'CM';

  const sendNotification = (babyName: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(`Time to feed ${babyName}!`, { body: "It's been a while.", icon: "/favicon.ico" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") sendNotification(babyName);
      });
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return '';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30.44);
        const weeks = Math.floor((diffDays % 30.44) / 7);
        return weeks > 0 ? `${months}m ${weeks}w` : `${months}m`;
    }
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getLastBreastSide = () => {
    const lastLog = logs.find(l => l.type === FeedingType.BREAST_LEFT || l.type === FeedingType.BREAST_RIGHT);
    if (!lastLog) return null;
    const isLeft = lastLog.type === FeedingType.BREAST_LEFT;
    const timeDiff = Date.now() - lastLog.startTime;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const mins = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    let timeString = '';
    if (hours > 0) timeString += `${hours}h `;
    timeString += `${mins}m ago`;
    return { side: isLeft ? 'Left' : 'Right', next: isLeft ? 'Right' : 'Left', timeString };
  };

  // --- Handlers ---

  const handleAuthSuccess = (newUser: User) => {
      if (Date.now() - newUser.createdAt < 5000 && !newUser.isGuest) { 
        storageService.migrateAnonymousData(newUser.id);
      }
      setUser(newUser);
  };

  const handleUpdateUser = async (updatedUser: User) => {
      await authService.updateUser(updatedUser.id, updatedUser);
      setUser(updatedUser);
  };

  const handleLogout = async () => {
      await authService.logout();
      setUser(null); setLogs([]); setGrowthLogs([]); setBabyProfile(null); setActiveTimer(null); setMilkInventory([]);
      setProfileHubOpen(false);
  };

  const handleStartTimer = (type: FeedingType.BREAST_LEFT | FeedingType.BREAST_RIGHT | FeedingType.SLEEP) => {
    if (activeTimer) handleStopTimer();
    setActiveTimer({ type, startTime: Date.now() });
  };

  const handleStopTimer = () => {
    if (!activeTimer) return null;
    const endTime = Date.now();
    const duration = Math.floor((endTime - activeTimer.startTime) / 1000);
    const newLog: FeedingLog = {
      id: crypto.randomUUID(),
      type: activeTimer.type as FeedingType,
      startTime: activeTimer.startTime,
      endTime,
      durationSeconds: duration,
      notes: ''
    };
    setLogs(prev => [newLog, ...prev]);
    setActiveTimer(null);
  };

  const handleManualSubmit = (data: any) => {
    if (data.inventoryItemId) {
        // Consume inventory item
        setMilkInventory(prev => prev.map(item => 
            item.id === data.inventoryItemId ? { ...item, isConsumed: true } : item
        ));
    }

    if (editingLog) {
        const updatedLog: FeedingLog = {
            ...editingLog,
            startTime: data.timestamp,
            type: data.type,
            amountMl: data.amountMl,
            durationSeconds: data.durationSeconds,
            foodItem: data.foodItem,
            endTime: data.endTime,
            inventoryItemId: data.inventoryItemId
        };
        setLogs(prev => prev.map(l => l.id === editingLog.id ? updatedLog : l));
        setEditingLog(null);
    } else {
        const newLog: FeedingLog = {
            id: crypto.randomUUID(),
            startTime: data.timestamp,
            type: data.type,
            amountMl: data.amountMl,
            durationSeconds: data.durationSeconds,
            foodItem: data.foodItem,
            endTime: data.endTime,
            notes: data.notes,
            inventoryItemId: data.inventoryItemId
        };
        setLogs(prev => [newLog, ...prev]);
    }
    setManualModalOpen(false);
  };

  const handlePumpSubmit = (data: any) => {
      const newLog: FeedingLog = {
          id: crypto.randomUUID(),
          type: FeedingType.PUMP,
          startTime: data.timestamp,
          amountMl: data.amountMl,
          bagCount: data.bagCount,
          storage: data.storage,
          notes: data.notes
      };
      setLogs(prev => [newLog, ...prev]);

      // Add to Inventory with link to source log
      if (data.addToInventory) {
          const newItems = milkService.createItemsFromPump(data.amountMl, data.bagCount, data.storage, data.timestamp, newLog.id);
          setMilkInventory(prev => [...prev, ...newItems]);
      }

      setPumpModalOpen(false);
  };

  // --- Delete Handlers with Confirmation ---

  const handleDeleteInventoryItem = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "Remove from Stash?",
      message: "This bag will be permanently removed from your inventory. This will also update the original pumping log stats.",
      onConfirm: () => {
        // SYNC LOGIC: Update the parent Pump Log
        // Use ref to ensure we have the latest inventory even if closure is stale
        const currentInventory = milkInventoryRef.current;
        const itemToDelete = currentInventory.find(i => i.id === id);

        if (itemToDelete && itemToDelete.sourceLogId) {
            setLogs(prevLogs => {
                const parentLog = prevLogs.find(l => l.id === itemToDelete.sourceLogId);
                if (!parentLog) return prevLogs;

                // Decrease bag count and volume
                const newCount = (parentLog.bagCount || 1) - 1;
                
                if (newCount <= 0) {
                    return prevLogs.filter(l => l.id !== parentLog.id);
                }
                
                return prevLogs.map(l => l.id === parentLog.id ? {
                    ...l, 
                    bagCount: newCount,
                    amountMl: Math.max(0, (l.amountMl || 0) - itemToDelete.volumeMl)
                } : l);
            });
        }
        setMilkInventory(prev => prev.filter(i => i.id !== id));
      }
    });
  };

  const handleGrowthSubmit = (data: any) => {
    if (editingGrowthLog) {
       setGrowthLogs(prev => prev.map(l => l.id === editingGrowthLog.id ? {
            ...l,
            date: data.date,
            weightKg: data.weightKg,
            heightCm: data.heightCm
        } : l));
    } else {
        const newLog: GrowthLog = { id: crypto.randomUUID(), date: data.date, weightKg: data.weightKg, heightCm: data.heightCm };
        setGrowthLogs(prev => [newLog, ...prev]);
    }
    setGrowthModalOpen(false);
    setEditingGrowthLog(null);
  };

  const handleDeleteGrowthLog = (id: string) => {
      setConfirmState({
        isOpen: true,
        title: "Delete Measurement?",
        message: "Are you sure you want to remove this growth entry?",
        onConfirm: () => {
             setGrowthLogs(prev => prev.filter(l => l.id !== id));
        }
      });
  };

  const handleEditGrowthLog = (log: GrowthLog) => {
      setEditingGrowthLog(log);
      setGrowthModalOpen(true);
  };

  const handleEditLog = (log: FeedingLog) => {
    setEditingLog(log);
    setManualModalOpen(true);
  };

  const handleDeleteLog = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Activity Log?",
      message: "Are you sure? If this was a pumping session, all associated milk bags will be removed from your stash.",
      onConfirm: () => {
        // Use ref to ensure we access the latest logs state inside the callback
        const currentLogs = logsRef.current;
        const logToDelete = currentLogs.find(l => l.id === id);
        
        // SYNC LOGIC: Remove associated stash items or restore consumed ones
        if (logToDelete) {
            if (logToDelete.type === FeedingType.PUMP) {
                // Remove all inventory items created by this log
                setMilkInventory(prev => prev.filter(i => i.sourceLogId !== id));
            } else if (logToDelete.type === FeedingType.BOTTLE && logToDelete.inventoryItemId) {
                // Restore the consumed inventory item
                setMilkInventory(prev => prev.map(i => 
                    i.id === logToDelete.inventoryItemId ? { ...i, isConsumed: false } : i
                ));
            }
        }

        setLogs(prev => prev.filter(l => l.id !== id));
      }
    });
  };

  const generateInsights = async () => {
    setIsGenerating(true);
    const text = await analyzeFeedingLogs(logs, getVolumeUnit());
    setInsightText(text);
    setIsGenerating(false);
  };

  const handleSaveProfile = (profile: BabyProfile) => setBabyProfile(profile);

  // --- Render ---
  if (!user) return <div className="min-h-screen bg-slate-50 font-sans"><AuthScreen onSuccess={handleAuthSuccess} /></div>;
  if (user && !babyProfile && !isLoadingData) return <OnboardingFlow user={user} onComplete={handleSaveProfile} />;

  const primaryTagId = babyProfile?.personalityTags?.[0];
  const PERSONALITY_LABELS: Record<string, string> = {
      'milk_monster': 'Milk Monster', 'calm_sleeper': 'Calm Sleeper', 'early_bird': 'Early Bird',
      'cuddle_lover': 'Cuddle Lover', 'curious_mind': 'Curious Mind', 'fast_feeder': 'Fast Feeder',
      'night_owl': 'Night Owl', 'happy_baby': 'Happy Baby', 'gentle_dreamer': 'Gentle Dreamer'
  };
  const primaryTagLabel = primaryTagId ? PERSONALITY_LABELS[primaryTagId] : null;
  const lastSleepLog = logs.filter(l => l.type === FeedingType.SLEEP).sort((a, b) => b.startTime - a.startTime)[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative font-['Quicksand'] overflow-x-hidden text-slate-900">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
         <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], x: [-20, 20, -20] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px]" />
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3], y: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/3 -left-20 w-[400px] h-[400px] bg-rose-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
            {view === 'TRACK' && (
                <motion.div key="track" className="w-full max-w-md mx-auto w-full pb-28 px-6 pt-4">
                    <header className="mb-8">
                        <motion.button onClick={() => setProfileHubOpen(true)} whileTap={{ scale: 0.98 }} className="w-full relative bg-white/60 backdrop-blur-xl rounded-[32px] p-6 shadow-sm border border-white/50 flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    {babyProfile ? <BabyAvatar config={babyProfile.avatarConfig} size="md" className="relative z-10 drop-shadow-sm" /> : <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center border-2 border-white relative z-10"><Logo className="w-8 h-8" color="text-indigo-400" /></div>}
                                </div>
                                <div className="text-left">
                                    {babyProfile ? (
                                        <>
                                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">{babyProfile.name}</h1>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-200">{calculateAge(babyProfile.birthDate)}</span>
                                                {primaryTagLabel && <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-md border border-indigo-100 truncate max-w-[100px]">{primaryTagLabel}</span>}
                                            </div>
                                        </>
                                    ) : (
                                        <><h1 className="text-xl font-bold text-slate-800">{user?.isGuest ? 'Guest Mode' : 'Welcome, Parent'}</h1><p className="text-slate-400 text-sm font-medium">Tap to setup baby profile</p></>
                                    )}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm border border-slate-50 group-hover:text-indigo-500 transition-colors"><Settings size={20} /></div>
                        </motion.button>
                    </header>

                    {activeTimer ? (
                        <div className="mb-8 p-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-[40px] shadow-2xl shadow-pink-500/40 text-white relative overflow-hidden">
                            {activeTimer.type === FeedingType.SLEEP && <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-indigo-900" />}
                            <div className="absolute -top-4 -right-4 opacity-10 rotate-12">{activeTimer.type === FeedingType.SLEEP ? <Moon size={120} /> : <Baby size={120} />}</div>
                            <div className="relative z-10 flex flex-col items-center">
                                <h2 className="text-white/90 font-semibold tracking-wide uppercase text-sm mb-6 flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    {activeTimer.type === FeedingType.SLEEP ? <Moon size={14} /> : <Baby size={14} />}
                                    {activeTimer.type === FeedingType.SLEEP ? 'Baby Sleeping' : `Nursing ${activeTimer.type === FeedingType.BREAST_LEFT ? 'Left' : 'Right'}`}
                                </h2>
                                <div className="mb-10 scale-110"><TimerDisplay startTime={activeTimer.startTime} /></div>
                                <button onClick={handleStopTimer} className={`w-full py-5 bg-white ${activeTimer.type === FeedingType.SLEEP ? 'text-indigo-900' : 'text-rose-600'} rounded-3xl font-bold text-lg shadow-xl hover:bg-slate-50 transition active:scale-95 flex items-center justify-center gap-3`}>
                                    <Square size={20} fill="currentColor" />
                                    {activeTimer.type === FeedingType.SLEEP ? 'Wake Up' : 'Finish Session'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {babyProfile?.remindersEnabled && nextFeedTime && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 mx-auto p-4 rounded-2xl flex items-center justify-between shadow-sm border ${new Date() > nextFeedTime ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${new Date() > nextFeedTime ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{new Date() > nextFeedTime ? <AlertCircle size={20} /> : <BellRing size={20} />}</div>
                                        <div><p className="text-xs font-bold uppercase opacity-60 tracking-wider">Next Feed</p><p className="font-bold text-lg leading-tight">{nextFeedTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p></div>
                                    </div>
                                </motion.div>
                            )}
                            {getLastBreastSide() && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center gap-2 mb-4 text-sm bg-white/80 backdrop-blur-md text-indigo-800 py-2 px-5 rounded-full w-fit mx-auto border border-white shadow-sm">
                                    <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider">Last</span><span className="font-bold">{getLastBreastSide()?.side}</span><span className="text-xs text-indigo-300 mx-1">•</span><span className="text-xs text-indigo-400 font-medium">{getLastBreastSide()?.timeString}</span><ArrowRight size={14} className="text-indigo-300 mx-2"/><span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider">Next</span><span className="font-bold text-indigo-600">{getLastBreastSide()?.next}</span>
                                </motion.div>
                            )}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleStartTimer(FeedingType.BREAST_LEFT)} className="relative h-40 p-4 bg-white hover:bg-rose-50 border border-slate-100 hover:border-rose-100 text-rose-700 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100/50 rounded-bl-[32px] transition-transform group-hover:scale-110" />
                                    {getLastBreastSide()?.next === 'Left' && <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-bounce z-10">RECOMMENDED</span>}
                                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shadow-inner text-rose-400 mb-1 group-hover:scale-110 transition-transform"><Baby size={28} /></div>
                                    <span className="font-bold text-sm text-slate-600 group-hover:text-rose-700">Left Breast</span>
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleStartTimer(FeedingType.BREAST_RIGHT)} className="relative h-40 p-4 bg-white hover:bg-rose-50 border border-slate-100 hover:border-rose-100 text-rose-700 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100/50 rounded-bl-[32px] transition-transform group-hover:scale-110" />
                                    {getLastBreastSide()?.next === 'Right' && <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-bounce z-10">RECOMMENDED</span>}
                                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shadow-inner text-rose-400 mb-1 group-hover:scale-110 transition-transform"><Baby size={28} className="scale-x-[-1]" /></div>
                                    <span className="font-bold text-sm text-slate-600 group-hover:text-rose-700">Right Breast</span>
                                </motion.button>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { icon: Clock, label: 'Manual', onClick: () => { setManualType('NURSING_MANUAL'); setManualModalOpen(true); }, color: 'slate' },
                            { icon: Milk, label: 'Bottle', onClick: () => { setManualType(FeedingType.BOTTLE); setManualModalOpen(true); }, color: 'sky' },
                            { icon: Droplet, label: 'Pump', onClick: () => setPumpModalOpen(true), color: 'purple' },
                            { icon: Utensils, label: 'Solids', onClick: () => { setManualType(FeedingType.SOLIDS); setManualModalOpen(true); }, color: 'emerald' },
                            { icon: Moon, label: 'Sleep', onClick: () => handleStartTimer(FeedingType.SLEEP), color: 'indigo' },
                            { icon: Package, label: 'Stash', onClick: () => setMilkInventoryOpen(true), color: 'amber' }
                        ].map((btn, i) => (
                            <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={btn.onClick} className={`aspect-square bg-white border border-slate-100 text-${btn.color}-600 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-md group`}>
                                <div className={`w-9 h-9 rounded-full bg-${btn.color}-50 group-hover:bg-${btn.color}-100 flex items-center justify-center text-${btn.color}-500 transition-colors`}><btn.icon size={18} /></div>
                                <span className={`text-[10px] font-bold uppercase tracking-wide text-slate-400 group-hover:text-${btn.color}-600`}>{btn.label}</span>
                            </motion.button>
                        ))}
                    </div>

                     <div className="mt-8">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
                        </div>
                        <div className="space-y-3">
                            {logs.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center pointer-events-none"><EmptyStateIllustration /><p className="text-slate-400 font-medium mt-4">Quiet for now...</p></div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {logs.slice(0, 3).map(log => (
                                        <HistoryItem key={log.id} log={log} unit={getVolumeUnit()} onDelete={handleDeleteLog} onEdit={handleEditLog} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
            {view !== 'TRACK' && (
                <motion.div key={view} className="w-full">
                   
                   {view === 'GROWTH' && (
                        <div className="max-w-md mx-auto px-6 pt-8 pb-24">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Growth</h2>
                                <button onClick={() => { setEditingGrowthLog(null); setGrowthModalOpen(true); }} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors active:scale-95"><Plus /></button>
                            </div>
                            <GrowthCharts logs={growthLogs} weightUnit={getWeightUnit()} heightUnit={getHeightUnit()} onDelete={handleDeleteGrowthLog} onEdit={handleEditGrowthLog} />
                        </div>
                   )}
                   {view === 'INSIGHTS' && <div className="max-w-md mx-auto px-6 pt-8 pb-24"><h2 className="text-2xl font-bold mb-6">Insights</h2><Charts logs={logs} unit={getVolumeUnit()} /><button onClick={generateInsights} className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-bold">Generate AI Report</button>{insightText && <div className="mt-4 p-4 bg-white rounded-2xl border">{insightText}</div>}</div>}
                   {view === 'ACTIVITY' && <HistoryView logs={logs} unit={getVolumeUnit()} onDelete={handleDeleteLog} onEdit={handleEditLog} />}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <ManualEntryModal isOpen={manualModalOpen} onClose={() => setManualModalOpen(false)} onSave={handleManualSubmit} editingLog={editingLog} initialType={manualType} volumeUnit={getVolumeUnit()} inventory={milkInventory} />
      <GrowthModal isOpen={growthModalOpen} onClose={() => { setGrowthModalOpen(false); setEditingGrowthLog(null); }} onSave={handleGrowthSubmit} weightUnit={getWeightUnit()} heightUnit={getHeightUnit()} editingLog={editingGrowthLog} />
      <PumpModal isOpen={pumpModalOpen} onClose={() => setPumpModalOpen(false)} onSave={handlePumpSubmit} volumeUnit={getVolumeUnit()} />
      <MilkInventory isOpen={milkInventoryOpen} onClose={() => setMilkInventoryOpen(false)} inventory={milkInventory} onDelete={handleDeleteInventoryItem} volumeUnit={getVolumeUnit()} />
      <ProfileHub 
        isOpen={profileHubOpen} 
        onClose={() => setProfileHubOpen(false)} 
        user={user} 
        currentProfile={babyProfile} 
        onSave={handleSaveProfile} 
        onUpdateUser={handleUpdateUser} 
        onLogout={handleLogout} 
        lastFeedingLog={logs.sort((a, b) => b.startTime - a.startTime)[0]} 
        latestGrowthLog={growthLogs.sort((a, b) => b.date - a.date)[0]}
        lastSleepLog={lastSleepLog}
      />

      <ConfirmationModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
      />

      <nav className="fixed bottom-6 left-4 right-4 h-[72px] bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/20 z-30 flex justify-around items-center max-w-[400px] mx-auto">
          {['TRACK', 'ACTIVITY', 'GROWTH', 'INSIGHTS'].map((v: any) => (
              <button key={v} onClick={() => setView(v)} className={`flex flex-col items-center gap-1 p-2 transition-all relative ${view === v ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
                  <div className={`absolute inset-0 bg-indigo-50 rounded-xl scale-0 transition-transform ${view === v ? 'scale-100' : ''}`} />
                  {v === 'TRACK' && <Activity size={24} className="relative z-10" />}
                  {v === 'ACTIVITY' && <ScrollText size={24} className="relative z-10" />}
                  {v === 'GROWTH' && <TrendingUp size={24} className="relative z-10" />}
                  {v === 'INSIGHTS' && <Sparkles size={24} className="relative z-10" />}
              </button>
          ))}
      </nav>
    </div>
  );
};

export default App;