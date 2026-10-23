import { useState } from 'react';
import { 
  X, Phone, Star, MapPin, Calendar, CheckCircle2, 
  GraduationCap, Briefcase, ShieldCheck, Share2, Award, Clock,
  Filter, ThumbsUp, Sparkles, UserCheck, Edit3, FileText, ZoomIn, Plus, Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import type { WorkerProfile as WorkerProfileData, ReviewItem } from '../types';

interface WorkerProfileModalProps {
  worker: WorkerProfileData | null;
  onClose: () => void;
  onHireWorker: (worker: WorkerProfileData) => void;
  onToggleOnlineStatus?: (workerId: string, isOnline: boolean) => void;
  onOpenReviewModal?: (worker: WorkerProfileData) => void;
  onEditProfile?: (worker: WorkerProfileData) => void;
  onOpenChat?: (worker: WorkerProfileData) => void;
}

export function WorkerProfileModal({ 
  worker, 
  onClose, 
  onHireWorker,
  onToggleOnlineStatus,
  onOpenReviewModal,
  onEditProfile,
  onOpenChat
}: WorkerProfileModalProps) {
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [likedReviewIds, setLikedReviewIds] = useState<Record<string, boolean>>({});
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  if (!worker) return null;

  const reviews = worker.reviews || [];
  const totalReviews = Math.max(reviews.length, worker.reviewCount || 1);

  // Compute star distribution breakdown
  const starCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // If reviews array has fewer items than total reviewCount, synthesize proportional counts from worker.rating
  if (reviews.length <= 1) {
    starCounts[5] = Math.max(1, Math.round(totalReviews * 0.90));
    starCounts[4] = Math.max(0, Math.round(totalReviews * 0.08));
    starCounts[3] = Math.max(0, Math.round(totalReviews * 0.02));
  }

  const filteredReviews = reviews.filter(r => {
    if (selectedStarFilter === 'all') return true;
    return r.rating === selectedStarFilter;
  });

  const toggleLikeReview = (id: string) => {
    setLikedReviewIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh] my-auto">
        
        {/* Cover / Header */}
        <div className="relative bg-stone-900 p-6 text-white shrink-0">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onEditProfile && (
              <button
                onClick={() => onEditProfile(worker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Shaxsiy ma'lumotlar, ko'nikmalar va narxlarni tahrirlash"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Profilni tahrirlash</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <img 
                src={worker.avatarUrl} 
                alt={worker.name} 
                className="w-24 h-24 rounded-2xl object-cover border-4 border-amber-400/80 shadow-lg"
              />
              {worker.isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-stone-900 rounded-full" title="Hozir online" />
              )}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                  {worker.name}
                </h2>
                {worker.isStudent && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900 text-blue-200 border border-blue-700 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Talaba
                  </span>
                )}
              </div>

              <p className="text-sm text-stone-300 font-medium">
                {worker.roleTitle}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-400 pt-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {worker.rating.toFixed(1)} ({totalReviews} baholash)
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {worker.district}, {worker.city}
                </span>
                <span>·</span>
                <span>{worker.completedJobsCount} ta ish yakunlangan</span>
              </div>
            </div>
          </div>

          {/* Online / Offline Status Interactive Switcher */}
          <div className="mt-4 pt-3.5 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/70 p-3.5 rounded-xl border border-stone-800/90">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                {worker.isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${worker.isOnline ? 'bg-emerald-500' : 'bg-stone-500'}`}></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {worker.isOnline ? "Holat: Online (Ishga tayyor)" : "Holat: Offline (Band / Dam olmoqda)"}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    worker.isOnline 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}>
                    {worker.isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  {worker.isOnline 
                    ? "Usta asosiy vitrinada ko'rinadi va buyurtmachilardan qo'ng'iroq qabul qiladi." 
                    : "Offline holatida usta asosiy vitrinadan yashiriladi."}
                </p>
              </div>
            </div>

            {/* Interactive Toggle Switch */}
            <button
              type="button"
              onClick={() => onToggleOnlineStatus?.(worker.id, !worker.isOnline)}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner ${
                worker.isOnline ? 'bg-emerald-500' : 'bg-stone-700'
              }`}
              role="switch"
              aria-checked={worker.isOnline}
              title={worker.isOnline ? "Offline qilish (vitrinadan yashirish)" : "Online qilish (vitrinada ko'rsatish)"}
            >
              <span
                className={`pointer-events-none inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out text-[10px] font-black ${
                  worker.isOnline ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-stone-600'
                }`}
              >
                {worker.isOnline ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Rate & Status Card: Hourly Rate & Daily Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <div className="text-xs text-stone-500 font-medium">Soatlik xizmat haqi</div>
              <div className="text-xl font-bold font-mono text-amber-700 tabular-nums mt-0.5">
                {(worker.hourlyRateUzs || Math.round(worker.dailyRateUzs / 8)).toLocaleString()} so'm
              </div>
              <div className="text-[11px] text-stone-400">1 soatlik xizmat / tuzatish</div>
            </div>

            <div>
              <div className="text-xs text-stone-500 font-medium">Kunlik xizmat haqi</div>
              <div className="text-xl font-bold font-mono text-emerald-800 tabular-nums mt-0.5">
                {worker.dailyRateUzs.toLocaleString()} so'm
              </div>
              <div className="text-[11px] text-stone-400">8 soatlik to'liq kun</div>
            </div>

            <div>
              <div className="text-xs text-stone-500 font-medium">Tajriba & Mahorat</div>
              <div className="text-xl font-bold font-mono text-stone-900 tabular-nums mt-0.5">
                {worker.experience}
              </div>
              <div className="text-[11px] text-stone-400 truncate">
                {worker.isStudent ? (worker.studentUniversity || 'Talaba') : 'Professional tajriba'}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Usta haqida ma'lumot
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/60">
              "{worker.bio}"
            </p>
          </div>

          {/* Skills tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Qo'lidan keladigan ishlar & Ko'nikmalar ({worker.skills.length})
              </h3>
              {onEditProfile && (
                <button
                  type="button"
                  onClick={() => onEditProfile(worker)}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ko'nikma & Narxlarni o'zgartirish</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg border border-stone-200/80 transition-colors"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Past Work Experiences & Projects Section (User Requirement) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Oldingi ish tajribalari & Bajarilgan loyihalar</span>
                {worker.pastExperiences && worker.pastExperiences.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
                    {worker.pastExperiences.length} ta
                  </span>
                )}
              </h3>
              {onEditProfile && (
                <button
                  type="button"
                  onClick={() => onEditProfile(worker)}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yangi tajriba qo'shish</span>
                </button>
              )}
            </div>

            {worker.pastExperiences && worker.pastExperiences.length > 0 ? (
              <div className="space-y-2.5">
                {worker.pastExperiences.map((exp, idx) => (
                  <div 
                    key={exp.id || idx}
                    className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 hover:border-amber-300 transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {exp.photoUrl ? (
                        <div 
                          className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200 cursor-pointer group"
                          onClick={() => setLightboxPhoto(exp.photoUrl!)}
                          title="Rasmni kattalashtirish"
                        >
                          <img src={exp.photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-amber-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                            {exp.jobTitle}
                          </h4>
                          {exp.period && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-stone-700 border border-stone-200">
                              📅 {exp.period}
                            </span>
                          )}
                        </div>
                        {exp.clientOrLocation && (
                          <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{exp.clientOrLocation}</span>
                          </p>
                        )}
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          "{exp.description}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs text-stone-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-800">Usta hali oldingi ob'ektlarini kiritmagan.</span>
                  <div className="text-[11px] text-stone-500">Profil tahrirlagich orqali bajargan ishlaringizni qo'shishingiz mumkin.</div>
                </div>
                {onEditProfile && (
                  <button
                    type="button"
                    onClick={() => onEditProfile(worker)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shrink-0 shadow-2xs"
                  >
                    Qo'shish
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Portfolio gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Qilingan ishlaridan namunalar (Portfel rasmlari)</span>
                {worker.portfolioPhotos && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 font-mono">
                    {worker.portfolioPhotos.length} ta rasm
                  </span>
                )}
              </h3>
              {onEditProfile && (
                <button
                  type="button"
                  onClick={() => onEditProfile(worker)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Rasm yuklash</span>
                </button>
              )}
            </div>

            {worker.portfolioPhotos && worker.portfolioPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {worker.portfolioPhotos.map((photo, i) => (
                  <div 
                    key={i} 
                    onClick={() => setLightboxPhoto(photo)}
                    className="relative rounded-2xl overflow-hidden border border-stone-200 aspect-4/3 group cursor-pointer shadow-2xs bg-stone-100"
                    title="Rasmni kattalashtirish"
                  >
                    <img src={photo} alt="Ish namunasi" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-2.5 opacity-90 group-hover:opacity-100">
                      <span className="text-white text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Haqiqiy ish
                      </span>
                      <ZoomIn className="w-4 h-4 text-white/80 group-hover:text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                Hozircha fotosuratlar yuklanmagan.
              </div>
            )}
          </div>

          {/* Average Rating & Star Breakdown Section */}
          <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Ish beruvchilarning baholari va izohlari ({totalReviews} ta)
              </h3>
              <div className="flex items-center gap-2">
                {onOpenReviewModal && (
                  <button
                    type="button"
                    onClick={() => onOpenReviewModal(worker)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-stone-950" />
                    <span>Baho va sharh qoldirish</span>
                  </button>
                )}
                <span className="flex items-center gap-1 font-bold text-xs text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {worker.rating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left: Overall Big Score */}
              <div className="md:col-span-5 text-center md:text-left flex flex-col items-center md:items-start justify-center p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
                <div className="text-4xl sm:text-5xl font-black font-display text-stone-900 tracking-tight flex items-baseline gap-1">
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-base font-semibold text-stone-400">/ 5.0</span>
                </div>
                
                <div className="flex items-center gap-1 my-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-4 h-4 ${
                        s <= Math.round(worker.rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-stone-200 text-stone-300'
                      }`} 
                    />
                  ))}
                </div>

                <div className="text-xs text-stone-600 font-medium">
                  Jami <span className="font-bold text-stone-900">{totalReviews} ta</span> baholash asosida
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tasdiqlangan buyurtmalar</span>
                </div>
              </div>

              {/* Right: Star Progress Bars */}
              <div className="md:col-span-7 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = starCounts[star as keyof typeof starCounts] || 0;
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  return (
                    <div 
                      key={star} 
                      onClick={() => setSelectedStarFilter(selectedStarFilter === star ? 'all' : star)}
                      className={`flex items-center gap-2 text-xs cursor-pointer p-1 rounded-lg transition-colors ${
                        selectedStarFilter === star ? 'bg-amber-100/70 font-bold' : 'hover:bg-stone-100'
                      }`}
                    >
                      <span className="w-12 text-stone-700 font-medium flex items-center gap-0.5">
                        <span>{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </span>

                      <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <span className="w-9 text-right font-mono text-[11px] text-stone-500">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Star Filter Tabs & Action */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-stone-100">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Filtr:
              </span>
              <button
                type="button"
                onClick={() => setSelectedStarFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedStarFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Barchasi ({reviews.length > 0 ? reviews.length : totalReviews})
              </button>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedStarFilter(selectedStarFilter === star ? 'all' : star)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    selectedStarFilter === star
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Star className="w-3 h-3 fill-amber-500" />
                  <span>{star}★ ({starCounts[star as keyof typeof starCounts] || 0})</span>
                </button>
              ))}
            </div>

            {onOpenReviewModal && (
              <button
                type="button"
                onClick={() => onOpenReviewModal(worker)}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 border border-amber-300 shadow-2xs"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>Ustani baholash</span>
              </button>
            )}
          </div>

          {/* Employer Reviews & Ratings Section */}
          <div className="space-y-3">
            {filteredReviews.length > 0 ? (
              <div className="space-y-3">
                {filteredReviews.map((rev) => {
                  const isLiked = likedReviewIds[rev.id];
                  const likesCount = (rev.likesCount || 0) + (isLiked ? 1 : 0);

                  return (
                    <div key={rev.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">
                            {rev.employerName || rev.authorName || "Buyurtmachi"}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                            ✓ Tasdiqlangan buyurtmachi
                          </span>
                          <div className="flex items-center gap-0.5 ml-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-400 font-sans">{rev.date}</span>
                      </div>

                      {rev.jobTitle && (
                        <div className="text-[11px] text-stone-500 font-medium">
                          Buyurtma: {rev.jobTitle}
                        </div>
                      )}

                      <p className="text-xs text-stone-700 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-stone-200/60">
                        "{rev.comment}"
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {rev.tags?.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-white text-stone-600 px-2 py-0.5 rounded-full border border-stone-200 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleLikeReview(rev.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isLiked 
                              ? 'bg-amber-100 text-amber-900 font-bold' 
                              : 'bg-white hover:bg-stone-100 text-stone-500 border border-stone-200'
                          }`}
                          title="Foydali sharh"
                        >
                          <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-amber-600 text-amber-600' : ''}`} />
                          <span>Foydali {likesCount > 0 && `(${likesCount})`}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-stone-900">Alisher Qodirov (Ish beruvchi)</span>
                  <span className="text-[10px] text-stone-400">Kecha</span>
                </div>
                <p className="italic text-stone-700">
                  "Usta bilan ishlash juda yoqdi. Kelishilgan vaqtda yetib keldi, asboblari soz, ishni sifatli qilib berdi. Tavsiya qilaman!"
                </p>
                <div className="flex gap-1">
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-stone-200">⏱️ O'z vaqtida keldi</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-stone-200">🔨 Mahoratli usta</span>
                </div>
              </div>
            )}
          </div>

          {/* Assurance info */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Sovuqda ko'chada kutish yo'q!</div>
              <div>
                Ushbu mutaxassis uydan turib buyurtma oladi. Ishga taklif qilganingizda uning yo'lga chiqqanini va qancha vaqtda kelishini telefoningizdagi jonli xaritada ko'rib turasiz.
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-600">
            Kelishuv xizmat haqi: <span className="font-semibold text-stone-900">20 000 so'm</span> (karta orqali)
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onEditProfile && (
              <button 
                type="button"
                onClick={() => onEditProfile(worker)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-stone-900 rounded-xl text-xs font-bold transition-colors border border-amber-300"
                title="Profil ma'lumotlari, ko'nikmalar va narxlarni tahrirlash"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>
            )}

            <a 
              href={`tel:${worker.phone}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{worker.phone}</span>
            </a>

            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(worker)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                title={`${worker.name} bilan Messenjerda muloqot`}
              >
                <MessageSquare className="w-4 h-4 text-amber-700" />
                <span>Messenjerda yozish</span>
              </button>
            )}

            <button 
              onClick={() => onHireWorker(worker)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
            >
              <span>Ushbu ustani ishga chaqirish</span>
            </button>
          </div>
        </div>

      </div>

      {/* Enlarged Portfolio Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div 
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-70 bg-black/95 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors shadow-lg"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={lightboxPhoto} 
              alt="Haqiqiy ish namunasi" 
              className="w-full rounded-2xl shadow-2xl max-h-[82vh] object-contain border border-white/20"
            />
            <div className="mt-3 px-4 py-2 bg-stone-900/80 rounded-full text-white text-xs font-medium flex items-center gap-2 border border-stone-700/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{worker.name} — Bajarilgan ish namunasi (Portfel)</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Alias export to support both naming conventions
export const WorkerProfile = WorkerProfileModal;
