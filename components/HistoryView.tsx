
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedingLog, FeedingType } from '../types';
import { HistoryItem } from './HistoryItem';
import { EmptyStateIllustration } from './Illustrations';
import { Baby, Milk, Moon, Droplet } from 'lucide-react';

interface HistoryViewProps {
  logs: FeedingLog[];
  unit: 'ML' | 'OZ';
  onDelete: (id: string) => void;
  onEdit: (log: FeedingLog) => void;
}

interface DailyGroup {
  dateKey: string;
  displayDate: string;
  logs: FeedingLog[];
  summary: {
    nursingMins: number;
    bottleVol: number;
    pumpVol: number;
    sleepHrs: number;
  };
}

export const HistoryView: React.FC<HistoryViewProps> = ({ logs, unit, onDelete, onEdit }) => {
  
  const groupedLogs = useMemo(() => {
    const groups: Record<string, DailyGroup> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    logs.forEach(log => {
      const dateObj = new Date(log.startTime);
      const dateKey = dateObj.toDateString();
      
      if (!groups[dateKey]) {
        let displayDate = dateObj.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        if (dateKey === today) displayDate = 'Today';
        else if (dateKey === yesterday) displayDate = 'Yesterday';

        groups[dateKey] = {
          dateKey,
          displayDate,
          logs: [],
          summary: { nursingMins: 0, bottleVol: 0, pumpVol: 0, sleepHrs: 0 }
        };
      }

      groups[dateKey].logs.push(log);

      // Add to summary
      if ((log.type === FeedingType.BREAST_LEFT || log.type === FeedingType.BREAST_RIGHT) && log.durationSeconds) {
        groups[dateKey].summary.nursingMins += Math.round(log.durationSeconds / 60);
      }
      if (log.type === FeedingType.BOTTLE && log.amountMl) {
        groups[dateKey].summary.bottleVol += log.amountMl;
      }
      if (log.type === FeedingType.PUMP && log.amountMl) {
        groups[dateKey].summary.pumpVol += log.amountMl;
      }
      if (log.type === FeedingType.SLEEP && log.durationSeconds) {
        groups[dateKey].summary.sleepHrs += (log.durationSeconds / 3600);
      }
    });

    // Sort groups by date descending, and logs within groups by time descending
    return Object.values(groups)
      .sort((a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime())
      .map(group => ({
        ...group,
        logs: group.logs.sort((a, b) => b.startTime - a.startTime)
      }));
  }, [logs]);

  const formatVol = (ml: number) => {
    if (unit === 'OZ') return `${(ml / 29.5735).toFixed(1)} oz`;
    return `${Math.round(ml)} ml`;
  };

  if (logs.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 flex flex-col items-center justify-center min-h-[60vh] pointer-events-none pb-32">
        {/* Inner container has pointer-events-auto to allow text selection if needed, but main container lets clicks pass through to Nav */}
        <div className="pointer-events-auto flex flex-col items-center">
            <EmptyStateIllustration />
            <h3 className="text-xl font-bold text-slate-700 mt-6 mb-2">No Activity Yet</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto">
            Start tracking feeds, sleep, and growth to see your baby's timeline here.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-8 pb-24 space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-800">Activity Log</h2>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
          {logs.length} Entries
        </span>
      </div>

      {groupedLogs.map((group) => (
        <section key={group.dateKey} className="relative">
          {/* Sticky Date Header */}
          <div className="sticky top-0 z-10 bg-[#FDFBF7]/95 backdrop-blur-sm py-3 mb-2 border-b border-slate-100/50">
             <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-lg font-bold text-slate-700">{group.displayDate}</h3>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {new Date(group.dateKey).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                </span>
             </div>
             
             {/* Daily Summary Pills */}
             <div className="flex flex-wrap gap-2">
                {group.summary.nursingMins > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold border border-rose-100">
                        <Baby size={12} />
                        {group.summary.nursingMins}m
                    </div>
                )}
                {group.summary.bottleVol > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-bold border border-sky-100">
                        <Milk size={12} />
                        {formatVol(group.summary.bottleVol)}
                    </div>
                )}
                 {group.summary.pumpVol > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold border border-purple-100">
                        <Droplet size={12} />
                        {formatVol(group.summary.pumpVol)}
                    </div>
                )}
                {group.summary.sleepHrs > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100">
                        <Moon size={12} />
                        {group.summary.sleepHrs.toFixed(1)}h
                    </div>
                )}
             </div>
          </div>

          {/* Items List */}
          <div className="space-y-3 pl-1 relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-[-10px] top-4 bottom-4 w-0.5 bg-slate-100 rounded-full opacity-50 hidden sm:block" />
            
            <AnimatePresence mode="popLayout" initial={false}>
                {group.logs.map((log) => (
                <HistoryItem 
                    key={log.id} 
                    log={log} 
                    unit={unit} 
                    onDelete={onDelete} 
                    onEdit={onEdit} 
                />
                ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
};
