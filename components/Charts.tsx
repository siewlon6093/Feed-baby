import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FeedingLog, FeedingType } from '../types';
import { Clock, Milk, Activity, Moon } from 'lucide-react';

interface ChartsProps {
  logs: FeedingLog[];
  unit: 'ML' | 'OZ';
}

export const Charts: React.FC<ChartsProps> = ({ logs, unit }) => {
  
  // Filter logs for the last 7 days once to ensure accuracy
  const recentLogs = useMemo(() => {
    const startOfPeriod = new Date();
    startOfPeriod.setDate(startOfPeriod.getDate() - 6); // 6 days ago + today = 7 days
    startOfPeriod.setHours(0, 0, 0, 0);
    return logs.filter(log => log.startTime >= startOfPeriod.getTime());
  }, [logs]);

  // Calculate Averages for the week
  const averages = useMemo(() => {
    let totalBottle = 0;
    let totalBreastMins = 0;
    let totalSleepMins = 0;
    let sleepCount = 0;
    
    recentLogs.forEach(log => {
        if (log.type === FeedingType.BOTTLE && log.amountMl) {
            totalBottle += log.amountMl;
        } else if ((log.type === FeedingType.BREAST_LEFT || log.type === FeedingType.BREAST_RIGHT) && log.durationSeconds) {
            totalBreastMins += (log.durationSeconds / 60);
        } else if (log.type === FeedingType.SLEEP && log.durationSeconds) {
            totalSleepMins += (log.durationSeconds / 60);
            sleepCount++;
        }
    });

    const avgBottleMl = totalBottle / 7;
    const avgBreastMins = totalBreastMins / 7;
    // Calculate average duration PER sleep session, not per day, or per day? Let's do per day for consistency.
    const avgSleepMinsPerDay = totalSleepMins / 7;

    return {
        bottle: unit === 'OZ' ? (avgBottleMl / 29.5735).toFixed(1) : Math.round(avgBottleMl),
        breast: Math.round(avgBreastMins),
        sleep: Math.round(avgSleepMinsPerDay / 60), // In hours
        frequency: Math.round(recentLogs.filter(l => l.type !== FeedingType.SLEEP).length / 7)
    };
  }, [recentLogs, unit]);

  // Process data for bar charts
  const data = useMemo(() => {
    const last7Days = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toLocaleDateString(), // Full date for matching
        dayName: d.toLocaleDateString([], { weekday: 'short' }) // Label
      };
    });

    const dataMap = new Map<string, { name: string; bottle: number; breast: number }>();

    // Initialize map with full date string keys to avoid day-of-week collisions with old data
    last7Days.forEach(d => {
      dataMap.set(d.dateStr, { name: d.dayName, bottle: 0, breast: 0 });
    });

    recentLogs.forEach(log => {
      const logDate = new Date(log.startTime).toLocaleDateString();
      if (dataMap.has(logDate)) {
        const entry = dataMap.get(logDate)!;
        if (log.type === FeedingType.BOTTLE && log.amountMl) {
          entry.bottle += log.amountMl;
        } else if ((log.type === FeedingType.BREAST_LEFT || log.type === FeedingType.BREAST_RIGHT) && log.durationSeconds) {
          entry.breast += (log.durationSeconds / 60);
        }
      }
    });

    return Array.from(dataMap.values()).map(item => ({
      ...item,
      bottle: unit === 'OZ' 
        ? Number((item.bottle / 29.5735).toFixed(1)) 
        : Math.round(item.bottle),
      breast: Math.round(item.breast)
    }));
  }, [recentLogs, unit]);

  return (
    <div className="space-y-6">
        {/* Weekly Averages Summary */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="p-2 bg-pink-50 text-pink-500 rounded-full mb-2">
                    <Clock size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{averages.breast}m</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Nursing</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-full mb-2">
                    <Milk size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{averages.bottle}{unit === 'OZ' ? 'oz' : 'ml'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Bottle</span>
            </div>
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-full mb-2">
                    <Activity size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{averages.frequency}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Feeds/Day</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-full mb-2">
                    <Moon size={20} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{averages.sleep}h</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg Sleep/Day</span>
            </div>
        </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
          Bottle Volume ({unit === 'OZ' ? 'oz' : 'ml'})
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} ${unit === 'OZ' ? 'oz' : 'ml'}`, 'Volume']}
              />
              <Bar dataKey="bottle" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Breastfeeding Duration (mins)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} mins`, 'Duration']}
              />
              <Bar dataKey="breast" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};