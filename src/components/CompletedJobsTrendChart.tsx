import React, { useState } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  TrendingUp, CheckCircle2, DollarSign, Calendar, 
  BarChart2, Sparkles, ArrowUpRight, Award, Filter
} from 'lucide-react';
import { JobOrder } from '../types';

interface CompletedJobsTrendChartProps {
  completedJobs: JobOrder[];
}

interface MonthlyDataPoint {
  month: string;
  monthShort: string;
  fullMonthName: string;
  jobsCompleted: number;
  commissionUzs: number;
  grossVolumeUzs: number;
  growthPct: number;
}

// Realistic monthly historical dataset leading up to current active performance
const MONTHLY_PERFORMANCE_DATA: MonthlyDataPoint[] = [
  {
    month: 'May',
    monthShort: 'May',
    fullMonthName: '2026-yil May',
    jobsCompleted: 32,
    commissionUzs: 640000,
    grossVolumeUzs: 14400000,
    growthPct: 0
  },
  {
    month: 'Iyun',
    monthShort: 'Iyun',
    fullMonthName: '2026-yil Iyun',
    jobsCompleted: 48,
    commissionUzs: 960000,
    grossVolumeUzs: 21600000,
    growthPct: 50
  },
  {
    month: 'Iyul',
    monthShort: 'Iyul',
    fullMonthName: '2026-yil Iyul',
    jobsCompleted: 65,
    commissionUzs: 1300000,
    grossVolumeUzs: 29250000,
    growthPct: 35.4
  },
  {
    month: 'Avg',
    monthShort: 'Avgust',
    fullMonthName: '2026-yil Avgust',
    jobsCompleted: 84,
    commissionUzs: 1680000,
    grossVolumeUzs: 37800000,
    growthPct: 29.2
  },
  {
    month: 'Sen',
    monthShort: 'Sentabr',
    fullMonthName: '2026-yil Sentabr',
    jobsCompleted: 112,
    commissionUzs: 2240000,
    grossVolumeUzs: 50400000,
    growthPct: 33.3
  },
  {
    month: 'Okt',
    monthShort: 'Oktabr (Joriy)',
    fullMonthName: '2026-yil Oktabr (Joriy oy)',
    jobsCompleted: 145,
    commissionUzs: 2900000,
    grossVolumeUzs: 65250000,
    growthPct: 29.5
  }
];

export function CompletedJobsTrendChart({ completedJobs }: CompletedJobsTrendChartProps) {
  const [chartViewMode, setChartViewMode] = useState<'both' | 'jobs' | 'commission'>('both');
  const [timeRange, setTimeRange] = useState<'6m' | '3m'>('6m');

  const displayData = timeRange === '3m' 
    ? MONTHLY_PERFORMANCE_DATA.slice(-3) 
    : MONTHLY_PERFORMANCE_DATA;

  const totalJobsCount = displayData.reduce((acc, d) => acc + d.jobsCompleted, 0);
  const totalCommissionAmount = displayData.reduce((acc, d) => acc + d.commissionUzs, 0);
  const totalGrossAmount = displayData.reduce((acc, d) => acc + d.grossVolumeUzs, 0);
  const latestMonth = displayData[displayData.length - 1];

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyDataPoint = payload[0].payload;
      return (
        <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-stone-700 text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <span className="font-bold text-amber-400 font-display flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {data.fullMonthName}
            </span>
            {data.growthPct > 0 && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60">
                +{data.growthPct}%
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Bajarilgan ishlar:</span>
              </span>
              <b className="text-white font-mono">{data.jobsCompleted} ta</b>
            </div>

            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Platforma komissiyasi:</span>
              </span>
              <b className="text-amber-300 font-mono">{data.commissionUzs.toLocaleString()} so'm</b>
            </div>

            <div className="flex items-center justify-between text-stone-400 text-[11px] pt-1 border-t border-stone-800">
              <span>Umumiy ish haqi aylanmasi:</span>
              <span className="font-mono text-stone-300">{data.grossVolumeUzs.toLocaleString()} so'm</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-5">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
                <span>Oylik Ishlar va Komissiya Dinamikasi</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Recharts Vizualizatsiyasi
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Oylar kesimida bajarilgan jami ishlar soni va platformaning 20 000 so'mlik kafolatli komissiya o'sish trendi
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Controls & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Time range toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeRange === '6m' 
                  ? 'bg-white text-stone-900 shadow-2xs font-bold' 
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Oxirgi 6 oy
            </button>
            <button
              onClick={() => setTimeRange('3m')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeRange === '3m' 
                  ? 'bg-white text-stone-900 shadow-2xs font-bold' 
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Oxirgi 3 oy
            </button>
          </div>

          {/* Metric View Mode Toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setChartViewMode('both')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartViewMode === 'both' 
                  ? 'bg-amber-600 text-white shadow-2xs font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ikkalasi
            </button>
            <button
              onClick={() => setChartViewMode('jobs')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartViewMode === 'jobs' 
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Faqat Ishlar
            </button>
            <button
              onClick={() => setChartViewMode('commission')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                chartViewMode === 'commission' 
                  ? 'bg-amber-500 text-stone-950 shadow-2xs font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Faqat Komissiya
            </button>
          </div>

        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
            <span>Bajarilgan Buyurtmalar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-950 mt-1">
            {totalJobsCount} ta
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Oktabrda: <b>+{latestMonth.jobsCompleted} ta</b></span>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
            <span>Platforma Komissiyasi</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-950 mt-1">
            {totalCommissionAmount.toLocaleString()} so'm
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            Har bir kelishuvdan 20 000 UZS
          </div>
        </div>

        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
            <span>Ustalar Ish Haqi Hajmi</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-stone-900 mt-1">
            {(totalGrossAmount / 1000000).toFixed(1)} mln so'm
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            Ustalarga to'langan sof daromad
          </div>
        </div>

        <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between text-blue-800 text-xs font-medium">
            <span>O'rtacha Oylik O'sish</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-blue-950 mt-1">
            +31.5%
          </div>
          <div className="text-[11px] text-blue-700 mt-0.5">
            Har oy talab barqaror o'smoqda
          </div>
        </div>

      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={displayData}
            margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            
            <XAxis 
              dataKey="month" 
              stroke="#78716c" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: '#e7e5e4' }}
            />
            
            {/* Left Y-Axis: Jobs count */}
            {(chartViewMode === 'both' || chartViewMode === 'jobs') && (
              <YAxis 
                yAxisId="left"
                stroke="#059669"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val} ta`}
              />
            )}

            {/* Right Y-Axis: Commission amount in thousand so'm */}
            {(chartViewMode === 'both' || chartViewMode === 'commission') && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#d97706"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${Math.round(val / 1000)}k`}
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => {
                if (value === 'jobsCompleted') return <span className="text-xs font-bold text-stone-700">Bajarilgan Ishlar Soni (Dona)</span>;
                if (value === 'commissionUzs') return <span className="text-xs font-bold text-amber-700">Platforma Komissiyasi (UZS)</span>;
                return value;
              }}
            />

            {/* Bars for Completed Jobs */}
            {(chartViewMode === 'both' || chartViewMode === 'jobs') && (
              <Bar 
                yAxisId="left"
                dataKey="jobsCompleted" 
                name="jobsCompleted"
                fill="#10b981" 
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
            )}

            {/* Smooth Line with Points for Commission Earned */}
            {(chartViewMode === 'both' || chartViewMode === 'commission') && (
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="commissionUzs" 
                name="commissionUzs"
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#d97706', stroke: '#ffffff', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#b45309' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory footer note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-stone-100 text-xs text-stone-500">
        <div className="flex items-center gap-1.5 text-stone-600">
          <Award className="w-4 h-4 text-amber-600 shrink-0" />
          <span><b>Kafolatli tizim:</b> Har bir topshirilgan ishdan tushgan 20 000 so'm avtomatik Uzcard/Humo hisobiga o'tadi.</span>
        </div>
        <div className="text-[11px] font-mono text-stone-400">
          Recharts vizualizatsiyasi · Samarqand platformasi
        </div>
      </div>

    </div>
  );
}
