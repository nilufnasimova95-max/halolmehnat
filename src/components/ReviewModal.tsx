import { useState, useEffect } from 'react';
import { 
  Star, X, CheckCircle2, ShieldCheck, 
  MessageSquare, Sparkles, ThumbsUp, Heart, User, HardHat, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobOrder } from '../types';

interface ReviewModalProps {
  job: JobOrder | null;
  isOpen: boolean;
  onClose: () => void;
  initialTargetRole?: 'worker' | 'employer';
  onSubmitReview: (
    jobId: string,
    targetId: string,
    rating: number,
    comment: string,
    tags: string[],
    targetRole: 'worker' | 'employer'
  ) => void;
}

const WORKER_RATING_DESCRIPTIONS: Record<number, { title: string; subtitle: string; color: string }> = {
  1: { title: "Juda yomon", subtitle: "Ish talabga javob bermadi, kamchiliklar ko'p", color: "text-red-500" },
  2: { title: "Qoniqarsiz", subtitle: "Kamchiliklar bo'ldi, qayta tuzatish talab qilindi", color: "text-orange-500" },
  3: { title: "O'rtacha", subtitle: "Ish bajarildi, lekin ba'zi e'tirozlar bor", color: "text-amber-500" },
  4: { title: "Yaxshi", subtitle: "Sifatli va o'z vaqtida bajarildi, rahmat", color: "text-emerald-500" },
  5: { title: "A'lo darajada!", subtitle: "Haqiqiy professional usta, hammaga tavsiya qilaman!", color: "text-amber-400" },
};

const EMPLOYER_RATING_DESCRIPTIONS: Record<number, { title: string; subtitle: string; color: string }> = {
  1: { title: "Juda qiyin mijoz", subtitle: "To'lov kechiktirildi yoki asossiz e'tirozlar bo'ldi", color: "text-red-500" },
  2: { title: "Qoniqarsiz", subtitle: "Kelishilgan shartlarga to'liq amal qilinmadi", color: "text-orange-500" },
  3: { title: "O'rtacha", subtitle: "Ish yakunlandi, lekin biroz tushunmovchiliklar bo'ldi", color: "text-amber-500" },
  4: { title: "Yaxshi mijoz", subtitle: "Muomala yaxshi, to'lov o'z vaqtida amalga oshirildi", color: "text-emerald-500" },
  5: { title: "Ajoyib mijoz!", subtitle: "To'lovni darhol to'ladi, choy-ovqat bilan siyladi, xushmuomala!", color: "text-amber-400" },
};

const WORKER_QUICK_TAGS = [
  "⏱️ O'z vaqtida keldi",
  "🧹 Toza va ozoda ishladi",
  "🔨 Mahoratli va tajribali usta",
  "😊 Hushmuomala va odobli",
  "🤝 Ortiqcha pul so'ramadi",
  "⚡ Tez va sifatli bajardi"
];

const EMPLOYER_QUICK_TAGS = [
  "💰 To'lovni o'z vaqtida to'ladi",
  "☕ Choy-ovqat bilan siyladi",
  "😊 Xushmuomala va madaniyatli",
  "📐 Ishni aniq tushuntirdi",
  "🤝 Kelishuvga sodiq qoldi",
  "⭐ Yana ishlashga tayyorman"
];

export function ReviewModal({ 
  job, 
  isOpen, 
  onClose, 
  initialTargetRole = 'worker',
  onSubmitReview 
}: ReviewModalProps) {
  const [targetRole, setTargetRole] = useState<'worker' | 'employer'>(initialTargetRole);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Update targetRole when modal opens or initialTargetRole changes
  useEffect(() => {
    if (isOpen) {
      setTargetRole(initialTargetRole);
      setRating(5);
      setHoverRating(null);
      setComment('');
      setSelectedTags(
        initialTargetRole === 'worker' 
          ? ["⏱️ O'z vaqtida keldi", "🔨 Mahoratli va tajribali usta"]
          : ["💰 To'lovni o'z vaqtida to'ladi", "😊 Xushmuomala va madaniyatli"]
      );
    }
  }, [isOpen, initialTargetRole]);

  // When targetRole tab changes
  const handleSwitchTargetRole = (role: 'worker' | 'employer') => {
    setTargetRole(role);
    setRating(5);
    setComment('');
    setSelectedTags(
      role === 'worker' 
        ? ["⏱️ O'z vaqtida keldi", "🔨 Mahoratli va tajribali usta"]
        : ["💰 To'lovni o'z vaqtida to'ladi", "😊 Xushmuomala va madaniyatli"]
    );
  };

  if (!isOpen || !job) return null;

  const isRatingWorker = targetRole === 'worker';
  const targetName = isRatingWorker ? (job.workerName || "Usta") : job.employerName;
  const targetAvatar = isRatingWorker 
    ? (job.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg')
    : (job.employerAvatar || '/src/assets/images/woman_craft_cleaner_portrait_1791277307525.jpg');

  const activeStar = hoverRating || rating;
  const ratingDescriptions = isRatingWorker ? WORKER_RATING_DESCRIPTIONS : EMPLOYER_RATING_DESCRIPTIONS;
  const currentDesc = ratingDescriptions[activeStar] || ratingDescriptions[5];
  const quickTags = isRatingWorker ? WORKER_QUICK_TAGS : EMPLOYER_QUICK_TAGS;

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultComment = isRatingWorker 
      ? (rating >= 4 ? "Ish a'lo darajada sifatli bajarildi, ustaga katta rahmat!" : "Ish yakunlandi.")
      : (rating >= 4 ? "To'lov o'z vaqtida amalga oshirildi, ajoyib buyurtmachi!" : "Buyurtma yakunlandi.");

    const finalComment = comment.trim() || defaultComment;
    const targetId = isRatingWorker ? (job.workerId || 'worker-target') : (job.employerName || 'employer-target');

    onSubmitReview(
      job.id,
      targetId,
      rating,
      finalComment,
      selectedTags,
      targetRole
    );

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header */}
        <div className="relative bg-stone-900 text-white p-5 sm:p-6 text-center shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRatingWorker ? "Ustani baholash" : "Mijoz / Buyurtmachini baholash"}</span>
          </div>

          <h3 className="font-display font-bold text-lg sm:text-xl text-white">
            {isRatingWorker ? "Ustaning ish sifatini baholang" : "Buyurtmachi bilan ishlashni baholang"}
          </h3>

          <p className="text-xs text-stone-300 mt-1 max-w-sm mx-auto">
            {isRatingWorker 
              ? `Sizning bahoingiz ${targetName}ning umumiy reytingi va platformadagi obro'siga ta'sir qiladi`
              : `Sizning bahoingiz ${targetName}ning profilida ko'rinadi va boshqa ustalarga yo'naltiruvchi bo'ladi`}
          </p>

          {/* Bidirectional Mode Selector Tabs */}
          <div className="mt-3.5 inline-flex p-1 bg-stone-800/90 rounded-2xl border border-stone-700 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchTargetRole('worker')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                targetRole === 'worker' 
                  ? 'bg-amber-500 text-stone-950 shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Ustani baholash</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTargetRole('employer')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                targetRole === 'employer' 
                  ? 'bg-amber-500 text-stone-950 shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mijozni baholash</span>
            </button>
          </div>

          {/* Target Profile Mini Strip */}
          <div className="mt-3.5 inline-flex items-center gap-3 p-2 px-3.5 bg-stone-800/80 rounded-2xl border border-stone-700 max-w-xs mx-auto">
            <img 
              src={targetAvatar} 
              alt={targetName} 
              className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 shrink-0"
            />
            <div className="text-left truncate">
              <div className="font-bold text-xs text-white truncate">{targetName}</div>
              <div className="text-[11px] text-stone-300 truncate">
                {isRatingWorker ? (job.workerRole || "Mutaxassis") : "Ish beruvchi (Buyurtmachi)"}
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Interactive Stars Selector */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                  aria-label={`${star} yulduz`}
                >
                  <Star 
                    className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                      star <= activeStar 
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]' 
                        : 'text-stone-300 fill-stone-100'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {/* Dynamic Label based on star */}
            <div className="pt-1">
              <div className={`font-display font-bold text-base ${currentDesc.color}`}>
                {rating} / 5 — {currentDesc.title}
              </div>
              <div className="text-xs text-stone-500">
                {currentDesc.subtitle}
              </div>
            </div>
          </div>

          {/* Quick Tags / Chips */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              {isRatingWorker ? "Usta nima uchun ma'qul keldi? (Tezkor belgilar)" : "Mijoz bilan ishlash qanday kechdi?"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag, idx) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written comment */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isRatingWorker 
                ? "Ustaga batafsil izoh yoki minnatdorchilik (ixtiyoriy)" 
                : "Buyurtmachi haqida izoh (boshqa ustalar uchun tavsiya)"}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isRatingWorker
                  ? "Masalan: Usta ishini juda toza va sifatli bajardi. Vaqtida kelib, va'da qilinganidek topshirdi. Hammaga tavsiya qilaman!"
                  : "Masalan: Buyurtmachi juda madaniyatli, to'lovni ish bitishi bilan darhol o'tkazib berdi, choy-ovqat bilan siyladi. Hamkorlikdan mamnunman!"
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Guarantee / Trust note */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-800">Halol reyting kafolati: </span>
              {isRatingWorker 
                ? "Faqatgina buyurtmani yakunlagan haqiqiy ish beruvchilar ustaga baho qoldira oladi."
                : "Faqatgina buyurtmani bajargan usta buyurtmachini baholay oladi. Bu platformada soxta baholarni oldini oladi."}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
            >
              Keyinroq baholash
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-stone-950" />
              <span>{isRatingWorker ? "Ustani baholash" : "Mijozni baholash"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
