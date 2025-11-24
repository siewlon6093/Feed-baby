
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedingType, FeedingLog, MilkInventoryItem } from '../types';
import { Calendar, Moon, Milk, StickyNote, Package } from 'lucide-react';
import { milkService } from '../services/milkService';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingLog: FeedingLog | null;
  initialType: FeedingType | 'NURSING_MANUAL';
  volumeUnit: 'ML' | 'OZ';
  inventory?: MilkInventoryItem[];
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingLog,
  initialType,
  volumeUnit: appVolumeUnit,
  inventory = []
}) => {
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<FeedingType | 'NURSING_MANUAL'>(initialType);
  const [side, setSide] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'ML' | 'OZ'>(appVolumeUnit);
  const [food, setFood] = useState('');
  const [notes, setNotes] = useState('');
  
  const [useStash, setUseStash] = useState(false);
  const [selectedStashItem, setSelectedStashItem] = useState<string>('');

  const availableStash = useMemo(() => {
      return inventory
        .filter(i => !i.isConsumed)
        .sort((a, b) => a.expiryTime - b.expiryTime);
  }, [inventory]);

  useEffect(() => {
    if (isOpen) {
        setType(initialType);
        setNotes('');
        setUseStash(false);
        setSelectedStashItem('');
        
        if (editingLog) {
            const d = new Date(editingLog.startTime);
            const offset = d.getTimezoneOffset() * 60000;
            const iso = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
            setDate(iso);
            if (editingLog.notes) setNotes(editingLog.notes);

            if (editingLog.type === FeedingType.BREAST_LEFT || editingLog.type === FeedingType.BREAST_RIGHT) {
                setType('NURSING_MANUAL');
                setSide(editingLog.type === FeedingType.BREAST_LEFT ? 'LEFT' : 'RIGHT');
                setDuration(editingLog.durationSeconds ? Math.round(editingLog.durationSeconds / 60).toString() : '0');
            } else if (editingLog.type === FeedingType.SLEEP) {
                setType(FeedingType.SLEEP);
                if (editingLog.endTime) {
                    const ed = new Date(editingLog.endTime);
                    const edOffset = ed.getTimezoneOffset() * 60000;
                    const edIso = (new Date(ed.getTime() - edOffset)).toISOString().slice(0, 16);
                    setEndDate(edIso);
                }
            } else {
                setType(editingLog.type);
                if (editingLog.type === FeedingType.BOTTLE && editingLog.amountMl) {
                     setUnit(appVolumeUnit);
                     if (appVolumeUnit === 'OZ') {
                         setAmount((editingLog.amountMl / 29.5735).toFixed(1));
                     } else {
                         setAmount(editingLog.amountMl.toString());
                     }
                     if (editingLog.inventoryItemId) {
                         setUseStash(true);
                         setSelectedStashItem(editingLog.inventoryItemId);
                     }
                }
                if (editingLog.type === FeedingType.SOLIDS && editingLog.foodItem) {
                    setFood(editingLog.foodItem);
                }
            }
        } else {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            const nowIso = now.toISOString().slice(0, 16);
            setDate(nowIso);
            setEndDate(nowIso);
            setUnit(appVolumeUnit);
            setAmount('');
            setFood('');
            setDuration('');
            setSide('LEFT');
        }
    }
  }, [isOpen, editingLog, initialType, appVolumeUnit]);

  useEffect(() => {
      if (useStash && selectedStashItem) {
          const item = availableStash.find(i => i.id === selectedStashItem);
          if (item) {
              if (unit === 'OZ') {
                  setAmount((item.volumeMl / 29.5735).toFixed(1));
              } else {
                  setAmount(Math.round(item.volumeMl).toString());
              }
          }
      }
  }, [selectedStashItem, useStash, unit, availableStash]);

  const getTitle = () => {
    if (editingLog) return 'Edit Entry';
    switch(type) {
        case 'NURSING_MANUAL': return 'Log Nursing';
        case FeedingType.BOTTLE: return 'Log Bottle';
        case FeedingType.SOLIDS: return 'Log Solids';
        case FeedingType.SLEEP: return 'Log Sleep';
        default: return 'Manual Entry';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const timestamp = date ? new Date(date).getTime() : Date.now();
      
      let typeToSave: FeedingType;
      let extraData: Partial<FeedingLog> = {};

      if (type === 'NURSING_MANUAL') {
          typeToSave = side === 'LEFT' ? FeedingType.BREAST_LEFT : FeedingType.BREAST_RIGHT;
          extraData.durationSeconds = (parseInt(duration) || 0) * 60;
      } else if (type === FeedingType.SLEEP) {
          typeToSave = FeedingType.SLEEP;
          const endTime = endDate ? new Date(endDate).getTime() : Date.now();
          let durationSecs = Math.floor((endTime - timestamp) / 1000);
          if (durationSecs < 0) durationSecs = 0; 
          extraData.endTime = endTime;
          extraData.durationSeconds = durationSecs;
      } else {
          typeToSave = type as FeedingType;
          if (type === FeedingType.BOTTLE) {
              const inputAmount = Number(amount);
              if (unit === 'OZ') {
                  extraData.amountMl = inputAmount * 29.5735;
              } else {
                  extraData.amountMl = inputAmount;
              }
              if (useStash && selectedStashItem) {
                  extraData.inventoryItemId = selectedStashItem;
              }
          }
          if (type === FeedingType.SOLIDS) extraData.foodItem = food;
      }
      extraData.notes = notes;
      onSave({ timestamp, type: typeToSave, ...extraData });
  };

  return (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                />
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 bg-[#FDFBF7] rounded-t-[40px] z-40 p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
                    style={{ maxWidth: '448px', margin: '0 auto' }}
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
                    <h3 className="text-2xl font-bold mb-6 text-slate-800">{getTitle()}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2"><Calendar size={14} />{type === FeedingType.SLEEP ? 'Start Time' : 'Date & Time'}</label>
                            <input type="datetime-local" required className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-semibold text-slate-700 focus:border-indigo-500 outline-none shadow-sm" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        {type === 'NURSING_MANUAL' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Side</label>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setSide('LEFT')} className={`flex-1 py-4 rounded-2xl font-bold transition-all ${side === 'LEFT' ? 'bg-rose-100 text-rose-700 border-2 border-rose-200 shadow-sm' : 'bg-white text-slate-400 border border-slate-200'}`}>Left</button>
                                        <button type="button" onClick={() => setSide('RIGHT')} className={`flex-1 py-4 rounded-2xl font-bold transition-all ${side === 'RIGHT' ? 'bg-rose-100 text-rose-700 border-2 border-rose-200 shadow-sm' : 'bg-white text-slate-400 border border-slate-200'}`}>Right</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Duration (minutes)</label>
                                    <input type="number" inputMode="numeric" required className="w-full text-5xl font-bold text-center text-rose-500 border-b-2 border-slate-100 focus:border-rose-500 outline-none py-4 bg-transparent placeholder:text-slate-200" placeholder="0" value={duration} onChange={e => setDuration(e.target.value)} />
                                </div>
                            </div>
                        )}
                        {type === FeedingType.SLEEP && (
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2"><Moon size={14} />End Time</label>
                                <input type="datetime-local" required className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-semibold text-slate-700 focus:border-indigo-500 outline-none shadow-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        )}
                        {type === FeedingType.BOTTLE && (
                            <div>
                                 {availableStash.length > 0 && (
                                    <div className="mb-6">
                                        <button type="button" onClick={() => { setUseStash(!useStash); setSelectedStashItem(''); }} className={`w-full p-3 rounded-2xl border flex items-center gap-3 transition-all ${useStash ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${useStash ? 'bg-white' : 'bg-slate-100'}`}><Package size={16} /></div>
                                            <span className="font-bold text-sm">Use from Milk Stash</span>
                                            {useStash && <div className="w-3 h-3 bg-sky-500 rounded-full ml-auto" />}
                                        </button>
                                        {useStash && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 space-y-2 overflow-hidden">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Bag</p>
                                                <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                                                    {availableStash.map(item => {
                                                        const vol = unit === 'OZ' ? (item.volumeMl / 29.5735).toFixed(1) : Math.round(item.volumeMl);
                                                        const status = milkService.getStatus(item.expiryTime);
                                                        return (
                                                            <button key={item.id} type="button" onClick={() => setSelectedStashItem(item.id)} className={`w-full p-2 rounded-xl border text-left text-sm flex items-center justify-between ${selectedStashItem === item.id ? 'border-sky-500 bg-sky-50' : 'border-slate-100 bg-white'}`}>
                                                                <div><span className="font-bold text-slate-700">{vol} {unit === 'OZ' ? 'oz' : 'ml'}</span><span className="text-xs text-slate-400 ml-2">{item.storage.toLowerCase()}</span></div>
                                                                <span className={`text-[10px] font-bold ${status === 'EXPIRED' ? 'text-rose-500' : status === 'SOON' ? 'text-amber-500' : 'text-emerald-500'}`}>{status === 'EXPIRED' ? 'Exp' : status === 'SOON' ? 'Soon' : 'Fresh'}</span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                 )}
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide">Amount</label>
                                    <div className="flex bg-slate-100 rounded-xl p-1">
                                        <button type="button" onClick={() => setUnit('ML')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${unit === 'ML' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}>ML</button>
                                        <button type="button" onClick={() => setUnit('OZ')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${unit === 'OZ' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}>OZ</button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input type="number" inputMode="decimal" step="0.1" required className="w-full text-5xl font-bold text-center text-sky-500 border-b-2 border-slate-100 focus:border-sky-500 outline-none py-4 bg-transparent placeholder:text-slate-200" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                                    <span className="absolute right-0 bottom-6 text-slate-400 font-bold text-lg">{unit === 'OZ' ? 'oz' : 'ml'}</span>
                                </div>
                            </div>
                        )}
                        {type === FeedingType.SOLIDS && (
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Food Item</label>
                                <input type="text" required className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-semibold text-slate-700 focus:border-emerald-500 outline-none shadow-sm" placeholder="e.g. Mashed carrots" value={food} onChange={e => setFood(e.target.value)} />
                            </div>
                        )}
                         <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2"><StickyNote size={12} />Note (Optional)</label>
                            <textarea className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-medium text-slate-600 focus:border-indigo-500 outline-none shadow-sm resize-none" rows={2} placeholder="Details..." value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button type="button" onClick={onClose} className="py-4 px-6 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="py-4 px-6 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-300 transition-all">{editingLog ? 'Update Log' : 'Save Log'}</button>
                        </div>
                    </form>
                </motion.div>
            </>
        )}
    </AnimatePresence>
  );
};
