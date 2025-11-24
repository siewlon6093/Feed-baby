
import React from 'react';
import { FeedingLog, FeedingType } from '../types';
import { Baby, Milk, Utensils, Clock, Pencil, Moon, Droplet, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryItemProps {
  log: FeedingLog;
  unit: 'ML' | 'OZ';
  onDelete: (id: string) => void;
  onEdit: (log: FeedingLog) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ log, unit, onDelete, onEdit }) => {
  const date = new Date(log.startTime);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const getIcon = () => {
    switch (log.type) {
      case FeedingType.BREAST_LEFT:
      case FeedingType.BREAST_RIGHT:
        return <Baby className="w-5 h-5 text-rose-400" />;
      case FeedingType.BOTTLE:
        return <Milk className="w-5 h-5 text-sky-400" />;
      case FeedingType.SOLIDS:
        return <Utensils className="w-5 h-5 text-emerald-400" />;
      case FeedingType.SLEEP:
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case FeedingType.PUMP:
        return <Droplet className="w-5 h-5 text-purple-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getDetails = () => {
    if (log.type === FeedingType.PUMP) {
        const vol = log.amountMl ? (unit === 'OZ' ? `${(log.amountMl / 29.5735).toFixed(1)} oz` : `${log.amountMl} ml`) : '';
        const bags = log.bagCount ? `${log.bagCount} bag${log.bagCount > 1 ? 's' : ''}` : '';
        return `${vol} ${bags ? `• ${bags}` : ''}`;
    }

    if (log.durationSeconds) {
      const hrs = Math.floor(log.durationSeconds / 3600);
      const mins = Math.floor((log.durationSeconds % 3600) / 60);
      
      if (log.type === FeedingType.SLEEP) {
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      }
      return `${mins}m ${log.durationSeconds % 60}s`;
    }
    if (log.amountMl) {
      if (unit === 'OZ') {
        return `${(log.amountMl / 29.5735).toFixed(1)} oz`;
      }
      return `${log.amountMl} ml`;
    }
    if (log.foodItem) {
      return log.foodItem;
    }
    return '';
  };

  const getLabel = () => {
    switch (log.type) {
      case FeedingType.BREAST_LEFT: return 'Left Nursing';
      case FeedingType.BREAST_RIGHT: return 'Right Nursing';
      case FeedingType.BOTTLE: return 'Bottle';
      case FeedingType.SOLIDS: return 'Solids';
      case FeedingType.SLEEP: return 'Sleep';
      case FeedingType.PUMP: return 'Pumped Milk';
      default: return 'Log';
    }
  };

  const getBgColor = () => {
    switch (log.type) {
        case FeedingType.BOTTLE: return 'bg-sky-50 border-sky-100';
        case FeedingType.SOLIDS: return 'bg-emerald-50 border-emerald-100';
        case FeedingType.SLEEP: return 'bg-indigo-50 border-indigo-100';
        case FeedingType.PUMP: return 'bg-purple-50 border-purple-100';
        default: return 'bg-rose-50 border-rose-100';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group flex items-center justify-between p-3 sm:p-4 bg-white rounded-[20px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl ${getBgColor()} border shadow-sm`}>
          {getIcon()}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-700 text-sm truncate">{getLabel()}</h3>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-0.5">
            <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{timeString}</span>
            {getDetails() && (
                <span className="text-slate-600 font-bold truncate">{getDetails()}</span>
            )}
          </div>
          {log.storage && (
              <div className="text-[10px] font-bold text-purple-400 bg-purple-50 px-2 py-0.5 rounded-md w-fit mt-1">
                  Stored in {log.storage.toLowerCase()}
              </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        {log.type !== FeedingType.PUMP && (
             <button 
             onClick={(e) => { e.stopPropagation(); onEdit(log); }}
             className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-indigo-50 hover:text-indigo-500 transition-colors active:scale-95"
             aria-label="Edit"
           >
             <Pencil size={18} />
           </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors active:scale-95"
          aria-label="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};
