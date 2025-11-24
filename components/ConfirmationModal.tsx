
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  isDestructive = true
}) => {
  
  const handleSafeConfirm = () => {
    try {
      onConfirm();
    } catch (error) {
      console.error("Error during confirmation action:", error);
    } finally {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
                // Close if clicking the backdrop (self), but not children
                if (e.target === e.currentTarget) onClose();
            }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDestructive ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                {isDestructive ? <Trash2 size={32} /> : <AlertCircle size={32} />}
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                {message}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={onClose}
                  className="py-3.5 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSafeConfirm}
                  className={`py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isDestructive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                >
                  {isDestructive && <Trash2 size={16} />}
                  {confirmLabel}
                </button>
              </div>

            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
