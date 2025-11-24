import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Scale, Ruler } from 'lucide-react';
import { GrowthLog } from '../types';

interface GrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  weightUnit: 'KG' | 'LB';
  heightUnit: 'CM' | 'IN';
  editingLog?: GrowthLog | null;
}

export const GrowthModal: React.FC<GrowthModalProps> = ({ isOpen, onClose, onSave, weightUnit, heightUnit, editingLog }) => {
    const [date, setDate] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingLog) {
                const d = new Date(editingLog.date);
                const offset = d.getTimezoneOffset() * 60000;
                const iso = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
                setDate(iso);
                
                if (editingLog.weightKg) {
                    const w = weightUnit === 'LB' ? editingLog.weightKg * 2.20462 : editingLog.weightKg;
                    setWeight(weightUnit === 'LB' ? w.toFixed(2) : w.toString());
                } else {
                    setWeight('');
                }

                if (editingLog.heightCm) {
                    const h = heightUnit === 'IN' ? editingLog.heightCm / 2.54 : editingLog.heightCm;
                    setHeight(heightUnit === 'IN' ? h.toFixed(1) : h.toString());
                } else {
                    setHeight('');
                }
            } else {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                const nowIso = now.toISOString().slice(0, 16);
                setDate(nowIso);
                setWeight('');
                setHeight('');
            }
        }
    }, [isOpen, editingLog, weightUnit, heightUnit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const timestamp = date ? new Date(date).getTime() : Date.now();
        const w = parseFloat(weight);
        const h = parseFloat(height);

        let weightKg: number | undefined = undefined;
        let heightCm: number | undefined = undefined;

        if (!isNaN(w) && w > 0) {
            weightKg = weightUnit === 'LB' ? w * 0.453592 : w;
        }
        if (!isNaN(h) && h > 0) {
            heightCm = heightUnit === 'IN' ? h * 2.54 : h;
        }

        onSave({
            date: timestamp,
            weightKg,
            heightCm
        });
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
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Ruler size={24} />
                            </div>
                            {editingLog ? 'Edit Measurement' : 'Log Measurement'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <Calendar size={14} />
                                    Date
                                </label>
                                <input 
                                    type="datetime-local" 
                                    required
                                    className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-semibold text-slate-700 focus:border-indigo-500 outline-none shadow-sm"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Weight ({weightUnit === 'LB' ? 'lb' : 'kg'})</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold text-amber-500 focus:border-amber-500 outline-none shadow-sm text-lg"
                                        placeholder="0.00"
                                        value={weight}
                                        onChange={e => setWeight(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Height ({heightUnit === 'IN' ? 'in' : 'cm'})</label>
                                    <input 
                                        type="number"
                                        step="0.1"
                                        className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold text-emerald-500 focus:border-emerald-500 outline-none shadow-sm text-lg"
                                        placeholder="0.0"
                                        value={height}
                                        onChange={e => setHeight(e.target.value)}
                                    />
                                </div>
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
                                    {editingLog ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};