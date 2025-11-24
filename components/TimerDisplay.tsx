import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimerDisplayProps {
  startTime: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Set initial time to prevent 00:00 flash if re-mounting
    setElapsed(Math.floor((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  const Digit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-16 sm:w-16 sm:h-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
        <span className="text-3xl sm:text-4xl font-mono font-bold text-white tabular-nums drop-shadow-md">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );

  const Separator = () => (
    <div className="flex flex-col justify-center h-16 sm:h-20 pb-2">
      <span className="text-2xl text-white/80 font-bold animate-pulse">:</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-start gap-2 sm:gap-3">
        {hours > 0 && (
            <>
                <Digit value={hours} label="Hr" />
                <Separator />
            </>
        )}
        <Digit value={mins} label="Min" />
        <Separator />
        <Digit value={secs} label="Sec" />
      </div>
      
      <div className="flex items-center gap-2 mt-4 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
         <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,1)]"
         />
         <span className="text-xs font-bold text-white/90 uppercase tracking-widest shadow-sm">Recording</span>
      </div>
    </div>
  );
};
