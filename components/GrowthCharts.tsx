import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GrowthLog } from '../types';
import { Scale, Ruler, Trash2, Calendar, Pencil } from 'lucide-react';

interface GrowthChartsProps {
  logs: GrowthLog[];
  weightUnit: 'KG' | 'LB';
  heightUnit: 'CM' | 'IN';
  onDelete: (id: string) => void;
  onEdit: (log: GrowthLog) => void;
}

export const GrowthCharts: React.FC<GrowthChartsProps> = ({ logs, weightUnit, heightUnit, onDelete, onEdit }) => {
  const [chartType, setChartType] = useState<'WEIGHT' | 'HEIGHT'>('WEIGHT');

  // Calculate latest metrics for summary cards
  const latestMetrics = useMemo(() => {
    if (logs.length === 0) return { weight: '---', height: '---' };
    
    const sortedByDate = [...logs].sort((a, b) => b.date - a.date);
    const latest = sortedByDate[0];

    let w = '---';
    if (latest.weightKg) {
        w = weightUnit === 'LB' 
            ? `${(latest.weightKg * 2.20462).toFixed(2)} lb`
            : `${latest.weightKg} kg`;
    }

    let h = '---';
    if (latest.heightCm) {
        h = heightUnit === 'IN'
            ? `${(latest.heightCm / 2.54).toFixed(1)} in`
            : `${latest.heightCm} cm`;
    }

    return { weight: w, height: h };
  }, [logs, weightUnit, heightUnit]);

  const data = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date - b.date);
    
    return sorted.map(log => {
      const dateStr = new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      let weightDisplay = null;
      if (log.weightKg) {
        weightDisplay = weightUnit === 'LB' 
          ? Number((log.weightKg * 2.20462).toFixed(2)) 
          : log.weightKg;
      }

      let heightDisplay = null;
      if (log.heightCm) {
        heightDisplay = heightUnit === 'IN' 
          ? Number((log.heightCm / 2.54).toFixed(1)) 
          : log.heightCm;
      }

      return {
        date: dateStr,
        timestamp: log.date,
        weight: weightDisplay,
        height: heightDisplay,
      };
    }).filter(item => chartType === 'WEIGHT' ? item.weight !== null : item.height !== null);
  }, [logs, weightUnit, heightUnit, chartType]);

  const sortedLogs = useMemo(() => [...logs].sort((a, b) => b.date - a.date), [logs]);

  const unitLabel = chartType === 'WEIGHT' 
    ? (weightUnit === 'LB' ? 'lb' : 'kg')
    : (heightUnit === 'IN' ? 'in' : 'cm');

  const lineColor = chartType === 'WEIGHT' ? '#f59e0b' : '#10b981'; // Amber for weight, Emerald for height

  const formatWeight = (val?: number) => {
    if (!val) return null;
    return weightUnit === 'LB'
      ? `${(val * 2.20462).toFixed(2)} lb`
      : `${val} kg`;
  };

  const formatHeight = (val?: number) => {
    if (!val) return null;
    return heightUnit === 'IN'
      ? `${(val / 2.54).toFixed(1)} in`
      : `${val} cm`;
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400">
        <p>No growth measurements recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center bg-white`}>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-full mb-2">
                <Scale size={20} />
            </div>
            <span className="text-xl font-bold text-slate-800">{latestMetrics.weight}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current Weight</span>
        </div>
        <div className={`p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center bg-white`}>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full mb-2">
                <Ruler size={20} />
            </div>
            <span className="text-xl font-bold text-slate-800">{latestMetrics.height}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current Height</span>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setChartType('WEIGHT')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            chartType === 'WEIGHT' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
          }`}
        >
          Weight
        </button>
        <button
          onClick={() => setChartType('HEIGHT')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            chartType === 'HEIGHT' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
          }`}
        >
          Height
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${chartType === 'WEIGHT' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          {chartType === 'WEIGHT' ? 'Weight Trends' : 'Height Trends'}
        </h3>
        
        {data.length > 0 ? (
            <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                    interval="preserveStartEnd" 
                    padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                    tick={{ fontSize: 12, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                    domain={['auto', 'auto']}
                    padding={{ top: 20, bottom: 20 }}
                    unit={unitLabel}
                    width={60}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value} ${unitLabel}`, chartType === 'WEIGHT' ? 'Weight' : 'Height']}
                    labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                />
                <Line 
                    type="monotone" 
                    dataKey={chartType === 'WEIGHT' ? 'weight' : 'height'} 
                    stroke={lineColor} 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: lineColor }}
                    connectNulls
                />
                </LineChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <div className="h-64 w-full flex items-center justify-center text-slate-400 italic">
                No data for this metric
            </div>
        )}
      </div>

      {/* History List */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">History</h3>
        <div className="space-y-3">
            {sortedLogs.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                    <div>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                            <Calendar size={12} />
                            {new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                         </div>
                         <div className="flex gap-4">
                             {log.weightKg && (
                                 <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm">
                                     <Scale size={14} />
                                     {formatWeight(log.weightKg)}
                                 </div>
                             )}
                             {log.heightCm && (
                                 <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                                     <Ruler size={14} />
                                     {formatHeight(log.heightCm)}
                                 </div>
                             )}
                         </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit(log)}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-indigo-50 hover:text-indigo-500 transition-colors active:scale-95"
                            aria-label="Edit entry"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(log.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors active:scale-95"
                            aria-label="Delete entry"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};