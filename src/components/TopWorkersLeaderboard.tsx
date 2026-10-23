import React from 'react';
import { 
  Trophy, Star, Award, CheckCircle2, Phone, 
  MapPin, ArrowRight, ShieldCheck, Sparkles, Crown, Zap
} from 'lucide-react';
import { WorkerProfile } from '../types';

interface TopWorkersLeaderboardProps {
  workers: WorkerProfile[];
  onSelectWorker: (worker: WorkerProfile) => void;
  onOpenRegisterWorker: () => void;
}

export function TopWorkersLeaderboard({
  workers,
  onSelectWorker,
  onOpenRegisterWorker
}: TopWorkersLeaderboardProps) {
  // Sort dynamically by rating, then review count, then completed jobs (only active online workers)
  const topWorkers = workers
    .filter(w => w.isOnline)
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return b.completedJobsCount - a.completedJobsCount;
    })
    .slice(0, 5);

  if (topWorkers.length === 0) return null;

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          rankLabel: '#1 Oltin Usta',
          icon: <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />,
          badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 shadow-sm font-extrabold',
          borderClass: 'border-amber-400/80 ring-2 ring-amber-400/30',
          podiumTag: '👑 Samarqand 1-raqamli ustasi',
          cardBg: 'bg-gradient-to-b from-amber-50/70 to-white'
        };
      case 1:
        return {
          rankLabel: '#2 Kumush Usta',
          icon: <Award className="w-4 h-4 text-slate-500 fill-slate-300" />,
          badgeClass: 'bg-slate-100 text-slate-900 border-slate-300 font-bold',
          borderClass: 'border-slate-300',
          podiumTag: '🥈 2-o\'rin yetakchisi',
          cardBg: 'bg-white'
        };
      case 2:
        return {
          rankLabel: '#3 Bronza Usta',
          icon: <Award className="w-4 h-4 text-amber-700 fill-amber-600" />,
          badgeClass: 'bg-orange-100 text-amber-900 border-orange-200 font-bold',
          borderClass: 'border-orange-200',
          podiumTag: '🥉 3-o\'rin yetakchisi',
          cardBg: 'bg-white'
        };
      case 3:
        return {
          rankLabel: '#4 Yetakchi',
          icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500" />,
          badgeClass: 'bg-stone-100 text-stone-800 border-stone-200 font-bold',
          borderClass: 'border-stone-200',
          podiumTag: '⭐ Top-5 a\'zosi',
          cardBg: 'bg-white'
        };
      case 4:
      default:
        return {
          rankLabel: '#5 Yetakchi',
          icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500" />,
          badgeClass: 'bg-stone-100 text-stone-800 border-stone-200 font-bold',
          borderClass: 'border-stone-200',
          podiumTag: '⭐ Top-5 a\'zosi',
          cardBg: 'bg-white'
        };
    }
  };

  return (
    <section className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-emerald-500/10 rounded-3xl border border-amber-200/80 p-4 sm:p-6 shadow-sm space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-stone-900 flex items-center gap-2">
                <span>Top Ustalari — Samarqand Reytingi</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow-2xs">
                  <Sparkles className="w-3 h-3" />
                  TOP-5
                </span>
              </h2>
              <p className="text-xs text-stone-600">
                Mijozlar tomonidan eng yuqori baholangan (5.0 ⭐) va sifatli xizmat ko'rsatgan yetakchi ustalar
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kafolatlangan Sifat</span>
          </span>
        </div>
      </div>

      {/* Top 5 Workers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {topWorkers.map((worker, index) => {
          const badge = getRankBadge(index);
          return (
            <div
              key={worker.id}
              onClick={() => onSelectWorker(worker)}
              className={`relative rounded-2xl border ${badge.borderClass} ${badge.cardBg} p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-1`}
            >
              {/* Podium Rank Ribbon */}
              <div className="flex items-center justify-between gap-1 mb-2.5">
                <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border ${badge.badgeClass}`}>
                  {badge.icon}
                  <span>{badge.rankLabel}</span>
                </span>

                <span className="text-[10px] text-stone-500 font-semibold truncate">
                  {badge.podiumTag}
                </span>
              </div>

              {/* Avatar + Main Info */}
              <div className="space-y-2.5 text-center flex flex-col items-center">
                <div className="relative">
                  <img
                    src={worker.avatarUrl}
                    alt={worker.name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                  />
                  {worker.isOnline && (
                    <span 
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" 
                      title="Hozir online"
                    />
                  )}
                  {index === 0 && (
                    <span className="absolute -top-2 -right-1 bg-amber-500 text-stone-950 p-1 rounded-full shadow">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">
                    {worker.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-1 font-medium mt-0.5">
                    {worker.roleTitle}
                  </p>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/60 text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-stone-900">{worker.rating.toFixed(1)}</span>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-600 font-medium text-[11px]">{worker.reviewCount} baho</span>
                </div>

                {/* Completed jobs & location */}
                <div className="space-y-1 w-full text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Bajarilgan ish:</span>
                    <span className="font-bold text-emerald-700 font-mono">{worker.completedJobsCount} ta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Tajriba:</span>
                    <span className="font-semibold text-stone-700">{worker.experience}</span>
                  </div>
                  <div className="flex items-center justify-between truncate">
                    <span className="text-stone-400">Hudud:</span>
                    <span className="font-medium text-stone-700 truncate max-w-[100px]">{worker.district}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-3 mt-2 border-t border-stone-100 space-y-2">
                <div className="text-center">
                  <span className="text-[10px] text-stone-400 block">Kunlik stavkasi</span>
                  <span className="font-mono font-bold text-xs text-stone-900">
                    {worker.dailyRateUzs.toLocaleString()} so'm
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWorker(worker);
                    }}
                    className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[11px] font-bold transition-colors text-center"
                  >
                    Profil
                  </button>
                  <a
                    href={`tel:${worker.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 text-center"
                    title="Qo'ng'iroq qilish"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Bog'lanish</span>
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Motivational Call to Action for Other Workers */}
      <div className="p-3.5 sm:p-4 bg-white/90 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="font-bold text-stone-900 block sm:inline mr-1">
              Siz ham usta yoki mardikormisiz?
            </span>
            <span className="text-stone-600">
              Halol va sifatli ishlang, mijozlardan 5.0 yulduz oling va TOP-5 yetakchilar safiga kirib ko'proq buyurtma oling!
            </span>
          </div>
        </div>

        <button
          onClick={onOpenRegisterWorker}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-2xs"
        >
          <span>Usta sifatida anketani to'ldirish</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </section>
  );
}
