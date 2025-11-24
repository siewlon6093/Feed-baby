
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilkInventoryItem, MilkStorageType } from '../types';
import { milkService } from '../services/milkService';
import { Droplet, Snowflake, Thermometer, Sun, X, AlertCircle, Trash2, Clock } from 'lucide-react';

interface MilkInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: MilkInventoryItem[];
  onDelete: (id: string) => void;
  volumeUnit: 'ML' | 'OZ';
}

export const MilkInventory: React.FC<MilkInventoryProps> = ({ isOpen, onClose, inventory, onDelete, volumeUnit }) => {
  const [filter, setFilter] = useState<MilkStorageType | 'ALL'>('ALL');

  const activeItems = useMemo(() => inventory.filter(i => !i.isConsumed), [inventory]);

  const stats = useMemo(() => {
    const totalMl = activeItems.reduce((acc, i) => acc + i.volumeMl, 0);
    const bags = activeItems.length;
    const totalVol = volumeUnit === 'OZ' ? (totalMl / 29.5735).toFixed(1) : Math.round(totalMl);
    return { totalVol, bags };
  }, [activeItems, volumeUnit]);

  const filteredItems = useMemo(() => {
    let items = activeItems;
    if (filter !== 'ALL') {
        items = items.filter(i => i.storage === filter);
    }
    // Sort by expiry (soonest first)
    return items.sort((a, b) => a.expiryTime - b.expiryTime);
  }, [activeItems, filter]);

  const expiringSoonCount = useMemo(() => {
    return activeItems.filter(i => milkService.getStatus(i.expiryTime) === 'SOON').length;
  }, [activeItems]);

  const getStorageIcon = (type: MilkStorageType) => {
      switch(type) {
          case 'FREEZER': return <Snowflake size={16} className="text-indigo-500" />;
          case 'FRIDGE': return <Thermometer size={16} className="text-sky-500" />;
          case 'ROOM': return <Sun size={16} className="text-amber-500" />;
      }
  };

  const getStorageLabel = (type: MilkStorageType) => {
    switch(type) {
        case 'FREEZER': return 'Freezer';
        case 'FRIDGE': return 'Fridge';
        case 'ROOM': return 'Room';
    }
  };

  const getStorageColor = (type: MilkStorageType) => {
    switch(type) {
        case 'FREEZER': return 'bg-indigo-50 border-indigo-100 text-indigo-700';
        case 'FRIDGE': return 'bg-sky-50 border-sky-100 text-sky-700';
        case 'ROOM': return 'bg-amber-50 border-amber-100 text-amber-700';
    }
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
                    className="fixed bottom-0 left-0 right-0 bg-[#FDFBF7] rounded-t-[40px] z-40 p-0 h-[92vh] flex flex-col shadow-2xl"
                    style={{ maxWidth: '448px', margin: '0 auto' }}
                >
                    {/* Header */}
                    <div className="px-8 pt-8 pb-4 bg-white rounded-t-[40px] border-b border-slate-100 z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                                        <Droplet size={20} fill="currentColor" className="opacity-50" />
                                    </div>
                                    Milk Stash
                                </h3>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stored</span>
                                <div className="text-2xl font-bold text-slate-800 mt-1">
                                    {stats.totalVol}<span className="text-sm font-medium text-slate-400 ml-1">{volumeUnit === 'OZ' ? 'oz' : 'ml'}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bag Count</span>
                                <div className="text-2xl font-bold text-slate-800 mt-1">
                                    {stats.bags}<span className="text-sm font-medium text-slate-400 ml-1">bags</span>
                                </div>
                            </div>
                        </div>

                        {/* Gentle Alert */}
                        {expiringSoonCount > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-800 text-sm font-medium"
                            >
                                <AlertCircle size={18} className="text-amber-500" />
                                <span>{expiringSoonCount} bag{expiringSoonCount > 1 ? 's' : ''} expiring soon! 💛</span>
                            </motion.div>
                        )}

                        {/* Filter Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                            {(['ALL', 'FRIDGE', 'FREEZER', 'ROOM'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                                >
                                    {f === 'ALL' ? 'All Milk' : f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#FDFBF7]">
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-12 opacity-50">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Droplet size={32} />
                                </div>
                                <p className="text-slate-400 font-medium">No milk in this stash yet.</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map(item => {
                                    const status = milkService.getStatus(item.expiryTime);
                                    const timeLeft = milkService.getTimeRemaining(item.expiryTime);
                                    const volDisplay = volumeUnit === 'OZ' ? (item.volumeMl / 29.5735).toFixed(1) : Math.round(item.volumeMl);
                                    
                                    return (
                                        <motion.div 
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`p-4 bg-white rounded-[24px] shadow-sm border flex items-center justify-between group ${status === 'EXPIRED' ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getStorageColor(item.storage)}`}>
                                                    {getStorageIcon(item.storage)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-700">{volDisplay} {volumeUnit === 'OZ' ? 'oz' : 'ml'}</h4>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStorageColor(item.storage)} border-none`}>
                                                            {getStorageLabel(item.storage)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium mt-1">
                                                        <span className={`font-bold ${status === 'EXPIRED' ? 'text-rose-500' : status === 'SOON' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                            {status === 'EXPIRED' ? 'Expired' : timeLeft + ' left'}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-slate-400">
                                                            {new Date(item.timestamp).toLocaleDateString([], {month:'short', day:'numeric'})}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onDelete(item.id)}
                                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors active:scale-95"
                                                aria-label="Remove from stash"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                        <div className="h-20" /> {/* Bottom padding */}
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
  );
};
