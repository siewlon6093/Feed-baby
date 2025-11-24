
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedingType, FeedingLog, MilkStorageType } from '../types';
import { Calendar, Droplet, Minus, Plus, StickyNote, Archive } from 'lucide-react';

interface PumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  volumeUnit: 'ML' | 'OZ';
}

export const PumpModal: React.FC<PumpModalProps> = ({
  isOpen,
  onClose,
  onSave,
  volumeUnit: appVolumeUnit
}) => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'ML' | 'OZ'>(appVolumeUnit);
  const [bags, setBags] = useState(1);
  const [storage, setStorage] = useState<MilkStorageType>('FRIDGE');
  const [notes, setNotes] = useState('');
  const [addToInventory, setAddToInventory] = useState(true);

  useEffect(() => {
    if (isOpen) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const nowIso = now.toISOString().slice(0, 16);
        setDate(nowIso);
        setAmount('');
        setUnit(appVolumeUnit);
        setBags(1);
        setStorage('FRIDGE');
        setNotes('');
        setAddToInventory(true);
    }
  }, [isOpen, appVolumeUnit]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const timestamp = date ? new Date(date).getTime() : Date.now();
      
      let finalAmountMl = 0;
      const inputAmount = parseFloat(amount);
      if (!isNaN(inputAmount) && inputAmount > 0) {
          finalAmountMl = unit === 'OZ' ? inputAmount * 29.5735 : inputAmount;
      }

      onSave({
          timestamp,
          type: FeedingType.PUMP,
          amountMl: finalAmountMl,
          bagCount: bags,
          storage,
          notes,
          addToInventory // Flag for App.tsx to handle inventory creation
      });
  };

  const adjustBags = (delta: number) => {
      setBags(prev => Math.max(1, prev + delta));
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
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                            <Droplet size={20} fill="currentColor" className="opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Log Pumping</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Time */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <Calendar size={12} />
                                Date & Time
                            </label>
                            <input 
                                type="datetime-local" 
                                required
                                className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-semibold text-slate-700 focus:border-purple-500 outline-none shadow-sm"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>

                        {/* Amount Input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Total Volume</label>
                                <div className="flex bg-slate-100 rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setUnit('ML')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${unit === 'ML' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        ML
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUnit('OZ')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${unit === 'OZ' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        OZ
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    inputMode="decimal"
                                    step="0.1"
                                    required
                                    className="w-full text-5xl font-bold text-center text-purple-500 border-b-2 border-slate-100 focus:border-purple-500 outline-none py-4 bg-transparent placeholder:text-slate-200"
                                    placeholder="0"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                                <span className="absolute right-0 bottom-6 text-slate-400 font-bold text-lg">
                                    {unit === 'OZ' ? 'oz' : 'ml'}
                                </span>
                            </div>
                        </div>

                        {/* Bags & Storage Grid */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Bag Count</label>
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => adjustBags(-1)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"><Minus size={14} /></button>
                                    <span className="text-xl font-bold text-slate-700">{bags}</span>
                                    <button type="button" onClick={() => adjustBags(1)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"><Plus size={14} /></button>
                                </div>
                             </div>
                             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Storage</label>
                                <select 
                                    value={storage}
                                    onChange={(e) => setStorage(e.target.value as any)}
                                    className="w-full bg-slate-50 text-slate-700 font-bold text-sm p-2 rounded-lg border border-slate-200 outline-none"
                                >
                                    <option value="ROOM">Room Temp</option>
                                    <option value="FRIDGE">Fridge</option>
                                    <option value="FREEZER">Freezer</option>
                                </select>
                             </div>
                        </div>

                         {/* Inventory Toggle */}
                         <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100 cursor-pointer" onClick={() => setAddToInventory(!addToInventory)}>
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${addToInventory ? 'bg-purple-500 border-purple-500' : 'bg-white border-slate-300'}`}>
                                {addToInventory && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-purple-900">Add to Milk Stash</span>
                                <span className="block text-xs text-purple-600/70">Automatically track expiry</span>
                            </div>
                             <Archive size={18} className="ml-auto text-purple-300" />
                        </div>


                        {/* Notes */}
                        <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <StickyNote size={12} />
                                Note (Optional)
                            </label>
                            <textarea
                                className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-medium text-slate-600 focus:border-purple-500 outline-none shadow-sm resize-none"
                                rows={3}
                                placeholder="e.g. Right side produced more..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="py-4 px-6 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="py-4 px-6 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-300 transition-all"
                            >
                                Save Log
                            </button>
                        </div>
                    </form>
                </motion.div>
            </>
        )}
    </AnimatePresence>
  );
};
