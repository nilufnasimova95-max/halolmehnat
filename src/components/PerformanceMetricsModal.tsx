import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  LineChart, Line, ComposedChart, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  TrendingUp, BarChart3, PieChart as PieIcon, Activity, 
  Calendar, DollarSign, CheckCircle2, Clock, Users, 
  ShieldCheck, ArrowUpRight, ArrowDownRight, Download, 
  RefreshCw, Filter, Layers, Zap, X, MapPin, Sparkles, Building2
} from 'lucide-react';
import { JobOrder, WorkerProfile, CommissionTransaction } from '../types';
import { SAMARKAND_DISTRICTS, CATEGORIES_LIST } from '../data/initialData';

interface PerformanceMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobOrder[];
  workers: WorkerProfile[];
  transactions: CommissionTransaction[];
}

// Color palettes for Recharts
const STATUS_COLORS = {
  completed: '#059669', // Emerald
  in_progress: '#f59e0b', // Amber
  en_route: '#3b82f6', // Blue
  arrived: '#8b5cf6', // Violet
  open: '#0284c7', // Sky
  cancelled: '#94a3b8' // Slate
};

const CATEGORY_COLORS = [
  '#f59e0b', '#059669', '#3b82f6', '#8b5cf6', 
  '#ec4899', '#f97316', '#06b6d4', '#84cc16'
];

export function PerformanceMetricsModal({
  isOpen,
  onClose,
  jobs,
  workers,
  transactions
}: PerformanceMetricsModalProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '6m' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'commission' | 'ratio' | 'daily'>('overview');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Filter jobs by selected district if applicable
  const filteredJobs = useMemo(() => {
    if (selectedDistrict === 'all') return jobs;
    return jobs.filter(j => j.district.toLowerCase().includes(selectedDistrict.toLowerCase()));
  }, [jobs, selectedDistrict]);

  // Real-time calculated KPI Metrics
  const kpis = useMemo(() => {
    const completed = filteredJobs.filter(j => j.status === 'completed');
    const active = filteredJobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled');
    const openCount = filteredJobs.filter(j => j.status === 'open').length;
    const inProgressCount = filteredJobs.filter(j => j.status === 'in_progress' || j.status === 'arrived' || j.status === 'en_route').length;
    
    const totalJobs = filteredJobs.length;
    const completionRate = totalJobs > 0 ? +((completed.length / totalJobs) * 100).toFixed(1) : 0;
    
    // Commission revenue: 20,000 UZS per completed job + recorded transactions
    const totalCommissionRevenue = transactions.reduce((acc, t) => acc + t.amountUzs, 0) + 
      (completed.length * 20000);
    
    const totalGrossTurnover = completed.reduce((acc, j) => acc + (j.budgetUzs || 350000), 0) + 
      active.reduce((acc, j) => acc + (j.budgetUzs || 350000), 0);

    const onlineWorkers = workers.filter(w => w.isOnline).length;
    const totalWorkers = workers.length;

    return {
      completedCount: completed.length,
      activeCount: active.length,
      openCount,
      inProgressCount,
      totalJobs,
      completionRate,
      totalCommissionRevenue,
      totalGrossTurnover,
      onlineWorkers,
      totalWorkers,
      avgOrderValue: totalJobs > 0 ? Math.round(totalGrossTurnover / totalJobs) : 380000
    };
  }, [filteredJobs, transactions, workers]);

  // 1. Commission Growth Dataset (Cumulative & Period)
  const commissionGrowthData = useMemo(() => {
    interface CommissionPoint {
      period: string;
      month: string;
      periodCommission: number;
      cumulativeCommission: number;
      completedOrders: number;
      growthPct: number;
    }

    const monthlyBaseline: CommissionPoint[] = [
      { period: 'May', month: 'May 2026', periodCommission: 640000, cumulativeCommission: 640000, completedOrders: 32, growthPct: 0 },
      { period: 'Iyun', month: 'Iyun 2026', periodCommission: 960000, cumulativeCommission: 1600000, completedOrders: 48, growthPct: 50 },
      { period: 'Iyul', month: 'Iyul 2026', periodCommission: 1300000, cumulativeCommission: 2900000, completedOrders: 65, growthPct: 35.4 },
      { period: 'Avg', month: 'Avgust 2026', periodCommission: 1680000, cumulativeCommission: 4580000, completedOrders: 84, growthPct: 29.2 },
      { period: 'Sen', month: 'Sentabr 2026', periodCommission: 2240000, cumulativeCommission: 6820000, completedOrders: 112, growthPct: 33.3 },
      { 
        period: 'Okt',
        month: 'Oktabr (Joriy)', 
        periodCommission: 2900000 + (kpis.completedCount * 20000), 
        cumulativeCommission: 9720000 + (kpis.completedCount * 20000), 
        completedOrders: 145 + kpis.completedCount, 
        growthPct: 29.5 
      }
    ];

    if (timeRange === '6m') return monthlyBaseline;
    if (timeRange === '1y') {
      const yearStart: CommissionPoint[] = [
        { period: 'Yan', month: 'Yanvar', periodCommission: 380000, cumulativeCommission: 380000, completedOrders: 19, growthPct: 0 },
        { period: 'Fev', month: 'Fevral', periodCommission: 440000, cumulativeCommission: 820000, completedOrders: 22, growthPct: 15.8 },
        { period: 'Mar', month: 'Mart', periodCommission: 520000, cumulativeCommission: 1340000, completedOrders: 26, growthPct: 18.2 },
        { period: 'Apr', month: 'Aprel', periodCommission: 580000, cumulativeCommission: 1920000, completedOrders: 29, growthPct: 11.5 }
      ];
      return [...yearStart, ...monthlyBaseline];
    }

    // 7d or 30d daily commission representation
    const daysCount = timeRange === '7d' ? 7 : 30;
    const dailyData: CommissionPoint[] = [];
    let runningTotal = 7500000;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = `${d.getDate()}-${d.toLocaleDateString('uz-UZ', { month: 'short' })}`;
      
      // Daily commissions (between 4 to 12 jobs * 20,000 UZS)
      const dayCompleted = 5 + Math.floor(Math.sin(i * 0.8) * 3 + (i % 4));
      const dayCommission = dayCompleted * 20000;
      runningTotal += dayCommission;

      dailyData.push({
        period: dayLabel,
        month: dayLabel,
        periodCommission: dayCommission,
        cumulativeCommission: runningTotal,
        completedOrders: dayCompleted,
        growthPct: +(Math.random() * 5 + 1.5).toFixed(1)
      });
    }

    return dailyData;
  }, [timeRange, kpis.completedCount]);

  // 2. Active versus Completed Job Ratios Dataset
  const ratioPieData = useMemo(() => {
    return [
      { name: 'Muvaffaqiyatli Bajarildi', value: Math.max(1, kpis.completedCount + 145), color: STATUS_COLORS.completed },
      { name: 'Ish Jarayonda (Yetib borgan)', value: Math.max(1, kpis.inProgressCount + 18), color: STATUS_COLORS.in_progress },
      { name: "Ochiq Yangi E'lonlar", value: Math.max(1, kpis.openCount + 24), color: STATUS_COLORS.open },
      { name: "Yo'lda Kelayotgan Ustalar", value: Math.max(1, filteredJobs.filter(j => j.status === 'en_route').length + 12), color: STATUS_COLORS.en_route }
    ];
  }, [kpis, filteredJobs]);

  // 2b. Category-by-Category Active vs Completed Ratio
  const categoryRatioData = useMemo(() => {
    const categoriesSample = [
      { key: 'devor_terish', name: "Devor & G'isht" },
      { key: 'uy_tozalash_gen', name: "Uy Tozalash 🌸" },
      { key: 'kafel_marmar', name: "Kafel & Marmar" },
      { key: 'suvoq_malyar', name: "Suvoq & Ta'mir" },
      { key: 'tom_krovlya', name: "Tom yopish" },
      { key: 'santexnik', name: "Santexnika" },
      { key: 'elektrik', name: "Elektr & Montaj" },
      { key: 'talabalar_ish', name: "Talabalar Ligasi" }
    ];

    return categoriesSample.map((cat, idx) => {
      const matchCompleted = filteredJobs.filter(j => j.category === cat.key && j.status === 'completed').length;
      const matchActive = filteredJobs.filter(j => j.category === cat.key && j.status !== 'completed').length;
      
      const completed = matchCompleted + 12 + ((idx * 5) % 15);
      const active = matchActive + 3 + ((idx * 3) % 8);
      const total = completed + active;
      const ratioPct = Math.round((completed / total) * 100);

      return {
        category: cat.name,
        completed,
        active,
        total,
        ratioPct
      };
    });
  }, [filteredJobs]);

  // 3. Daily Platform Activity Timeline Dataset (14-30 days)
  const dailyActivityData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 14 : 30;
    const result = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getDate()}-${d.toLocaleDateString('uz-UZ', { month: 'short' })}`;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      // Higher activity on weekends and construction peak days
      const newOrders = Math.floor(10 + Math.sin(i * 0.9) * 4 + (isWeekend ? 6 : 2));
      const completedOrders = Math.floor(newOrders * 0.82 + (i % 2));
      const activeDispatches = Math.floor(newOrders * 0.92);
      const dailyCommissionUzs = completedOrders * 20000;

      result.push({
        date: dateStr,
        newOrders,
        completedOrders,
        activeDispatches,
        dailyCommissionUzs,
        fulfillmentPct: Math.round((completedOrders / newOrders) * 100)
      });
    }

    return result;
  }, [timeRange]);

  // CSV Export utility
  const handleExportCSV = () => {
    try {
      const headers = ['Sana', 'Yangi Buyurtmalar', 'Bajarilgan Ishlar', 'Faol Ustalar', 'Kunlik Komissiya (UZS)', 'Bajarilish Nisbati (%)'];
      const rows = dailyActivityData.map(d => [
        d.date,
        d.newOrders,
        d.completedOrders,
        d.activeDispatches,
        d.dailyCommissionUzs,
        `${d.fulfillmentPct}%`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `HalolMehnat_Performance_Metrics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("CSV eksport qilishda xatolik:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[96vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Executive Header */}
        <div className="bg-stone-950 text-white px-5 py-4 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  Performance Metrics & Admin Analytics
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ADMIN REJIMI
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-amber-300 border border-stone-700">
                  📍 Samarqand Viloyati
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Platforma komissiyalari o'sishi, buyurtmalar nisbati va kunlik faollikning Recharts vizualizatsiyasi
              </p>
            </div>
          </div>

          {/* Action buttons & Close */}
          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold border border-stone-700 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Statistikani CSV formatida yuklab olish"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{downloadSuccess ? "Yuklandi ✓" : "CSV Eksport"}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Controls & Filter Ribbon */}
        <div className="bg-stone-900 text-stone-200 px-5 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Umumiy Tahlil</span>
            </button>

            <button
              onClick={() => setActiveTab('commission')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'commission'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Komissiya O'sishi</span>
            </button>

            <button
              onClick={() => setActiveTab('ratio')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ratio'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Faol / Bajarilgan Nisbati</span>
            </button>

            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Kunlik Faollik</span>
            </button>
          </div>

          {/* Time Range & District Selectors */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              {(['7d', '30d', '6m', '1y'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    timeRange === range
                      ? 'bg-stone-700 text-white shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {range === '7d' ? '7 kun' : range === '30d' ? '30 kun' : range === '6m' ? '6 oy' : 'Yillik'}
                </button>
              ))}
            </div>

            {/* District dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-stone-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-stone-900 text-white">Barcha Samarqand hududlari</option>
                {SAMARKAND_DISTRICTS.map(dist => (
                  <option key={dist} value={dist} className="bg-stone-900 text-white">
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Content Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-stone-50/70">
          
          {/* TOP 4 EXECUTIVE KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Commission Growth */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Jami Komissiya Tushumi
                </span>
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-stone-950">
                {kpis.totalCommissionRevenue.toLocaleString()} <span className="text-sm font-sans font-bold text-stone-500">so'm</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  +29.5% oylik o'sish
                </span>
                <span className="text-stone-400 font-mono text-[11px]">20 000 UZS / ish</span>
              </div>
            </div>

            {/* KPI 2: Active vs Completed Ratio */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Muvaffaqiyatli Bajarilish
                </span>
                <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
                  {kpis.completionRate}%
                </span>
                <span className="text-xs text-stone-500 font-semibold">konversiya</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                <span className="text-stone-600 font-medium">
                  Yakunlangan: <b className="font-mono text-emerald-800">{kpis.completedCount} ta</b>
                </span>
                <span className="text-stone-600 font-medium">
                  Faol: <b className="font-mono text-amber-800">{kpis.activeCount} ta</b>
                </span>
              </div>
            </div>

            {/* KPI 3: Daily Activity Pulse */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Kunlik O'rtacha Faollik
                </span>
                <span className="p-2 rounded-xl bg-blue-500/15 text-blue-700">
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-stone-950">
                18.4 <span className="text-sm font-sans font-bold text-stone-500">buyurtma/kun</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                <span className="text-blue-700 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  Qaynoq soatlar: 07:00-10:00
                </span>
                <span className="text-stone-400 font-mono text-[11px]">Samarqand</span>
              </div>
            </div>

            {/* KPI 4: Active Master Craftsmen Liquidity */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-violet-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Ustalar Likvidligi
                </span>
                <span className="p-2 rounded-xl bg-violet-500/15 text-violet-700">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-stone-950">
                  {kpis.onlineWorkers}
                </span>
                <span className="text-xs text-stone-500 font-semibold">/ {kpis.totalWorkers} nafar usta online</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {Math.round((kpis.onlineWorkers / Math.max(1, kpis.totalWorkers)) * 100)}% ustalar navbatchilikda
                </span>
                <span className="text-stone-400 text-[11px]">Jonli vitrina</span>
              </div>
            </div>

          </div>

          {/* MAIN CHART 1: COMMISSION GROWTH TIMELINE */}
          {(activeTab === 'overview' || activeTab === 'commission') && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                      Platforma Komissiyasi O'sishi (Recharts Area & Dinamika)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    20 000 so'mlik kafolatli komissiyalarning oylik va umumiy jamg'arma o'sishi dinamikasi
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500"></span>
                    <span className="text-stone-600 font-semibold">Umumiy jamg'arma (Kumulyativ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-600"></span>
                    <span className="text-stone-600 font-semibold">Davriy tushum</span>
                  </div>
                </div>
              </div>

              {/* Recharts Area Chart for Commission */}
              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={commissionGrowthData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="periodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="period" 
                      stroke="#94a3b8" 
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip content={<CommissionCustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="cumulativeCommission" 
                      name="Umumiy Jamg'arma" 
                      stroke="#d97706" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#commissionGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="periodCommission" 
                      name="Davr Komissiyasi" 
                      stroke="#059669" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#periodGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Commission Summary Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <div className="text-stone-500 text-[11px]">Oxirgi oy tushumi:</div>
                  <div className="font-mono font-bold text-amber-700 text-sm">2 900 000 so'm</div>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <div className="text-stone-500 text-[11px]">Bajarilgan tranzaksiyalar:</div>
                  <div className="font-mono font-bold text-emerald-800 text-sm">145 ta kelishuv</div>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <div className="text-stone-500 text-[11px]">O'rtacha komissiya/kun:</div>
                  <div className="font-mono font-bold text-stone-800 text-sm">96 600 so'm</div>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <div className="text-stone-500 text-[11px]">Kelgusi oy prognozi:</div>
                  <div className="font-mono font-bold text-blue-700 text-sm">~3 850 000 so'm</div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN CHART 2: ACTIVE VERSUS COMPLETED JOB RATIOS */}
          {(activeTab === 'overview' || activeTab === 'ratio') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Donut Pie Chart */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold">
                      <PieIcon className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                      Buyurtmalar Holati Nisbati
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Faol buyurtmalar va yakunlangan ishlar mutanosibligi
                  </p>
                </div>

                {/* Donut Chart with Center Label */}
                <div className="h-64 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ratioPieData}
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {ratioPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<RatioPieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Fulfillment Badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black font-mono text-emerald-800">
                      {kpis.completionRate}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Bajarilish
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                  {ratioPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-stone-700 font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-stone-900">{item.value} ta</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Bar Chart: Active vs Completed by Category */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                      Sohalar Bo'yicha Bajarilish Nisbati (BarChart)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Har bir kasb turi bo'yicha yakunlangan va faol buyurtmalar solishtirmasi
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-600"></span>
                      <span className="text-stone-600 font-medium">Yakunlangan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500"></span>
                      <span className="text-stone-600 font-medium">Faol / Jarayonda</span>
                    </div>
                  </div>
                </div>

                {/* Grouped Bar Chart */}
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryRatioData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="category" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        angle={-20} 
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip content={<CategoryBarTooltip />} />
                      <Bar dataKey="completed" name="Yakunlangan" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="active" name="Faol / Jarayonda" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 flex items-center justify-between">
                  <span>Eng yuqori bajarilish darajasi: <b className="text-stone-900">Devor & G'isht (88%)</b> va <b className="text-stone-900">Uy tozalash (85%)</b></span>
                  <span className="text-emerald-700 font-bold font-mono">Yuqori likvidlik</span>
                </div>
              </div>

            </div>
          )}

          {/* MAIN CHART 3: DAILY PLATFORM ACTIVITY (ComposedChart) */}
          {(activeTab === 'overview' || activeTab === 'daily') && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-700 flex items-center justify-center font-bold">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                      Kunlik Platforma Faolligi (Recharts ComposedChart)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Har kungi yangi buyurtmalar, muvaffaqiyatli yakunlangan ishlar va usta marshrutlari
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-500"></span>
                    <span className="text-stone-600 font-medium">Yangi buyurtmalar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-600"></span>
                    <span className="text-stone-600 font-medium">Bajarilgan ishlar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-amber-500"></span>
                    <span className="text-stone-600 font-medium">Faol Ustalar</span>
                  </div>
                </div>
              </div>

              {/* Composed Chart */}
              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={dailyActivityData}
                    margin={{ top: 10, right: 15, left: -5, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip content={<DailyActivityTooltip />} />
                    <Bar dataKey="newOrders" name="Yangi Buyurtmalar" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.85} />
                    <Bar dataKey="completedOrders" name="Bajarilgan Ishlar" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="activeDispatches" name="Ustalar Harakati" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Daily Insights Strip */}
              <div className="bg-amber-500/10 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Admin Tahlili: </span>
                    <span>Haftaning shanba va dushanba kunlarida Samarkandda eng yuqori usta chaqirish to'lqini qayd etilmoqda.</span>
                  </div>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3 h-3" />
                  <span>Kunlik Hisobotni CSV yuklash</span>
                </button>
              </div>
            </div>
          )}

          {/* DETAILED ACTIVITY DATA TABLE */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">
                  Kunlik Tahliliy Hisobot Jadvali (Oxirgi 14 kun)
                </h4>
                <p className="text-[11px] text-stone-500">
                  Admin nazorati va buxgalteriya balansi uchun har kungi ko'rsatkichlar
                </p>
              </div>
              <span className="font-mono text-xs text-stone-400">HalolMehnat.uz</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-2.5">Sana</th>
                    <th className="px-4 py-2.5">Yangi Buyurtmalar</th>
                    <th className="px-4 py-2.5">Bajarilgan Ishlar</th>
                    <th className="px-4 py-2.5">Faol Ustalar</th>
                    <th className="px-4 py-2.5">Platforma Komissiyasi</th>
                    <th className="px-4 py-2.5 text-right">Bajarilish Nisbati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {dailyActivityData.slice(-7).reverse().map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-stone-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>{row.date}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono">{row.newOrders} ta</td>
                      <td className="px-4 py-2.5 font-mono text-emerald-700 font-bold">
                        {row.completedOrders} ta
                      </td>
                      <td className="px-4 py-2.5 font-mono">{row.activeDispatches} nafar</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-amber-800">
                        {row.dailyCommissionUzs.toLocaleString()} so'm
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                          {row.fulfillmentPct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Custom Tooltip for Commission Growth
function CommissionCustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-stone-950/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-stone-800 text-xs space-y-2 min-w-[220px]">
        <div className="font-bold text-amber-400 border-b border-stone-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">+{data.growthPct}%</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-stone-300">
            <span>Umumiy Jamg'arma:</span>
            <b className="font-mono text-amber-300">{data.cumulativeCommission?.toLocaleString()} so'm</b>
          </div>
          <div className="flex items-center justify-between text-stone-300">
            <span>Davriy Komissiya:</span>
            <b className="font-mono text-emerald-400">{data.periodCommission?.toLocaleString()} so'm</b>
          </div>
          <div className="flex items-center justify-between text-stone-400 text-[11px] pt-1 border-t border-stone-800">
            <span>Bajarilgan Ishlar:</span>
            <span className="font-mono text-white">{data.completedOrders} ta</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Ratio Donut Pie
function RatioPieCustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-stone-950/95 text-white p-3 rounded-xl shadow-xl border border-stone-800 text-xs space-y-1">
        <div className="font-bold text-amber-400">{data.name}</div>
        <div className="flex items-center justify-between gap-4 font-mono">
          <span className="text-stone-400">Miqdori:</span>
          <b className="text-white">{data.value} ta buyurtma</b>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Category Bar Chart
function CategoryBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-stone-950/95 text-white p-3 rounded-xl shadow-xl border border-stone-800 text-xs space-y-1.5 min-w-[200px]">
        <div className="font-bold text-white border-b border-stone-800 pb-1">{data.category}</div>
        <div className="flex items-center justify-between text-emerald-400">
          <span>Yakunlangan:</span>
          <b className="font-mono">{data.completed} ta</b>
        </div>
        <div className="flex items-center justify-between text-amber-400">
          <span>Faol / Jarayonda:</span>
          <b className="font-mono">{data.active} ta</b>
        </div>
        <div className="flex items-center justify-between text-stone-400 text-[11px] pt-1 border-t border-stone-800">
          <span>Bajarilish darajasi:</span>
          <b className="font-mono text-white">{data.ratioPct}%</b>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Daily Activity
function DailyActivityTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-stone-950/95 text-white p-3 rounded-xl shadow-xl border border-stone-800 text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-amber-400 border-b border-stone-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">{data.fulfillmentPct}% yakunlandi</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-blue-300">
            <span>Yangi Buyurtmalar:</span>
            <b className="font-mono">{data.newOrders} ta</b>
          </div>
          <div className="flex items-center justify-between text-emerald-400">
            <span>Bajarilgan Ishlar:</span>
            <b className="font-mono">{data.completedOrders} ta</b>
          </div>
          <div className="flex items-center justify-between text-amber-300">
            <span>Faol Ustalar:</span>
            <b className="font-mono">{data.activeDispatches} nafar</b>
          </div>
          <div className="flex items-center justify-between text-stone-400 text-[11px] pt-1 border-t border-stone-800">
            <span>Kunlik Komissiya:</span>
            <b className="font-mono text-amber-400">{data.dailyCommissionUzs?.toLocaleString()} so'm</b>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
