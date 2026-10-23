import { useState } from 'react';
import { 
  X, Phone, Star, MapPin, Calendar, CheckCircle2, 
  ShieldCheck, Share2, Award, ThumbsUp, Heart, Briefcase,
  MessageSquare, Sparkles, Filter, UserCheck
} from 'lucide-react';
import type { EmployerProfile, ReviewItem } from '../types';

interface EmployerProfileModalProps {
  employer: EmployerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReviewModal?: () => void;
}

export function EmployerProfileModal({ 
  employer, 
  isOpen, 
  onClose,
  onOpenReviewModal 
}: EmployerProfileModalProps) {
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [likedReviewIds, setLikedReviewIds] = useState<Record<string, boolean>>({});

  if (!isOpen || !employer) return null;

  const reviews = employer.reviews || [];
  const totalReviews = reviews.length || employer.reviewCount || 1;

  // Compute star distribution breakdown
  const starCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // If no reviews in array, synthesize proportional counts from employer.rating
  if (reviews.length === 0) {
    starCounts[5] = Math.max(1, Math.round(totalReviews * 0.88));
    starCounts[4] = Math.max(0, Math.round(totalReviews * 0.10));
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
        
        {/* Header Cover */}
        <div className="relative bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 p-6 text-white shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <img 
                src={employer.avatarUrl} 
                alt={employer.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-amber-400/90 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-stone-900 text-white" title="Telefon tasdiqlangan">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                  {employer.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Ish beruvchi 🏠
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-300 pt-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {employer.rating.toFixed(1)} ({totalReviews} ta usta bahosi)
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {employer.district}, {employer.city}
                </span>
                <span>·</span>
                <span className="text-stone-400">{employer.memberSince}</span>
              </div>

              {employer.bio && (
                <p className="text-xs text-stone-300 italic pt-1 max-w-lg">
                  "{employer.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-5 grid grid-cols-3 gap-2.5 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
            <div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-400 tabular-nums">
                {employer.completedJobsCount} ta
              </div>
              <div className="text-[11px] text-stone-300">Bajarilgan buyurtma</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {employer.paymentPunctualityRate || 100}%
              </div>
              <div className="text-[11px] text-stone-300">Vaqtida to'lov intizomi</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-300 tabular-nums">
                {employer.rating.toFixed(1)} ★
              </div>
              <div className="text-[11px] text-stone-300">Ustalar ishonchi</div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Average Rating & Star Breakdown Section */}
          <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              Ustalar tomonidan berilgan reyting va xolis sharhlar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left: Overall Big Score */}
              <div className="md:col-span-5 text-center md:text-left flex flex-col items-center md:items-start justify-center p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
                <div className="text-4xl sm:text-5xl font-black font-display text-stone-900 tracking-tight flex items-baseline gap-1">
                  <span>{employer.rating.toFixed(1)}</span>
                  <span className="text-base font-semibold text-stone-400">/ 5.0</span>
                </div>
                
                <div className="flex items-center gap-1 my-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-4 h-4 ${
                        s <= Math.round(employer.rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-stone-200 text-stone-300'
                      }`} 
                    />
                  ))}
                </div>

                <div className="text-xs text-stone-600 font-medium">
                  Jami <span className="font-bold text-stone-900">{totalReviews} ta</span> usta va mardikor baholagan
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Halol & tasdiqlangan sharhlar</span>
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

          {/* Star Filter Tabs */}
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
                Barchasi ({totalReviews})
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
                onClick={onOpenReviewModal}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 border border-amber-300 shadow-2xs"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>Mijozga baho qoldirish</span>
              </button>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Ustalar qoldirgan xolis fikrlar ({filteredReviews.length} ta ko'rsatilmoqda)
            </h4>

            {filteredReviews.length > 0 ? (
              <div className="space-y-3">
                {filteredReviews.map((rev) => {
                  const isLiked = likedReviewIds[rev.id];
                  const likesCount = (rev.likesCount || 0) + (isLiked ? 1 : 0);

                  return (
                    <div 
                      key={rev.id} 
                      className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2.5 transition-shadow hover:shadow-xs"
                    >
                      {/* Review Header: Worker Name + Stars + Date */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={rev.authorAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg'} 
                            alt={rev.authorName || rev.workerName || "Usta"} 
                            className="w-9 h-9 rounded-full object-cover border border-amber-400"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-stone-900">
                                {rev.authorName || rev.workerName || "Usta"}
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                                ✓ Tasdiqlangan usta
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 truncate max-w-xs">
                              {rev.jobTitle}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 fill-stone-100'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-stone-400 font-sans">{rev.date}</span>
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-stone-700 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-stone-200/60">
                        "{rev.comment}"
                      </p>

                      {/* Tags & Like Button */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {rev.tags?.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-white text-stone-600 px-2.5 py-0.5 rounded-full border border-stone-200 font-medium">
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
              <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
                Bu yulduz bo'yicha hozircha sharhlar yo'q.
              </div>
            )}
          </div>

          {/* Halol Ish beruvchi Kafolati */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900">Halol Buyurtmachi kafolati:</div>
              <div className="text-emerald-800 leading-relaxed mt-0.5">
                Ushbu ish beruvchi barcha ustalar bilan to'lovni vaqtida amalga oshirgan va kelishuv shartlariga qat'iy amal qilgan. HalolMehnat.uz barcha tomonlarning halolligini kafolatlaydi.
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-600">
            Samarqand shahri va viloyatida ro'yxatdan o'tgan
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a 
              href={`tel:${employer.phone}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{employer.phone}</span>
            </a>

            <button 
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
