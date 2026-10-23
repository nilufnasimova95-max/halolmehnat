import { useState, useMemo } from 'react';
import { 
  X, HelpCircle, Search, ChevronDown, ChevronUp, ShieldCheck, 
  CreditCard, RefreshCw, Navigation, Phone, Sparkles, CheckCircle2, 
  AlertTriangle, MessageSquare, Heart, Volume2, VolumeX, ArrowRight,
  UserCheck, DollarSign, Send, ThumbsUp, Layers
} from 'lucide-react';
import { speakUzbek } from '../utils/sound';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateJob?: () => void;
  onOpenHowItWorks?: () => void;
  onOpenCommissionDashboard?: () => void;
}

interface FAQItem {
  id: string;
  category: 'trust' | 'pricing' | 'cancellation' | 'gps' | 'special';
  categoryLabel: string;
  questionUz: string;
  questionRu: string;
  shortAnswer: string;
  details: string[];
  actionType?: 'create_job' | 'how_it_works' | 'commission';
  actionLabel?: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'trust',
    categoryLabel: "🛡️ Ishonch & Xavfsizlik",
    questionUz: "Ustalarga qanday ishonsam bo'ladi? Ular qanday tekshiriladi?",
    questionRu: "Как я могу доверять работникам? Как они проверяются?",
    shortAnswer: "100% ochiq shaxs, real xalq sharhlari va oldindan hech qanday to'lov yo'qligi sababli xavf darajasi nolga teng.",
    details: [
      "Passport va shaxsiy ma'lumotlar: Har bir usta ro'yxatdan o'tganda faol telefon raqami, yashash manzili va mutaxassisligi tekshiriladi.",
      "Haqiqiy mijozlar bahosi (1-5 yulduz): Platformada soxta yoki sotib olingan sharhlar bo'lishi mumkin emas. Faqat ustani uyiga chaqirib, ishini qabul qilgan odamgina sharh va baho qoldira oladi.",
      "Bajarilgan ishlar fotosuratlari: Usta profilida ilgari qilgan sifatli ishlari (kafel, g'isht, tozalash, suvoq) suratlari joylashtiriladi.",
      "Oldindan to'lov yo'q: Pulni ish boshlanishidan oldin emas, ish to'liq sifatli yakunlangach, o'z qo'lingiz bilan berasiz."
    ],
    actionType: 'how_it_works',
    actionLabel: "Tizim qanday ishlashini ko'rish"
  },
  {
    id: 'faq-2',
    category: 'pricing',
    categoryLabel: "💰 Bepul & Narxlar",
    questionUz: "Platformadan foydalanish mutlaqo bepulmi? Yashirin to'lovlar bormi?",
    questionRu: "Бесплатна ли платформа? Есть ли скрытые платежи?",
    shortAnswer: "Ha! Buyurtmachi (ish beruvchi) uchun sayt 100% mutlaqo bepul (0 so'm). Hech qanday obuna yoki yashirin to'lov yo'q.",
    details: [
      "E'lon joylashtirish — 0 so'm: Saytga xohlagancha buyurtma berishingiz, usta qidirishingiz va telefon qilish mutlaqo bepul.",
      "Usta profillarini ko'rish — 0 so'm: Samarqand bo'ylab barcha usta, talaba va tozalash bekalarining telefonlarini bepul ko'rasiz.",
      "20 000 so'm kassa kafolati nima?: Faqat usta buyurtmani qabul qilib, ishni muvaffaqiyatli yakunlaganda platformaning 24/7 serveri va operatorlari faoliyati uchun ramziy 20 000 so'm komissiya hisoblanadi. Buyurtmachi hech qanday ortiqcha to'lov qilmaydi.",
      "Domen va hosting uchun xalqdan pul olinmaydi: Sayt doimiy ochiq va bepul rejimda xizmat ko'rsatadi."
    ],
    actionType: 'commission',
    actionLabel: "20 000 so'mlik kassa tizimi haqida"
  },
  {
    id: 'faq-3',
    category: 'cancellation',
    categoryLabel: "❌ Bekor qilish & Kafolat",
    questionUz: "Buyurtma bekor bo'lsa yoki usta kelmasa nima bo'ladi?",
    questionRu: "Что произойдет, если заказ будет отменен или мастер не приедет?",
    shortAnswer: "Sizga hech qanday jarima yoki to'lov yuklanmaydi. Tizim 1 bosishda yangi ustani topib beradi.",
    details: [
      "Hech qanday jarima yo'q: Agar rejangiz o'zgarsa yoki usta kelolmasa, buyurtmani istalgan daqiqada bepul bekor qilishingiz mumkin.",
      "Avtomatik zaxira usta: Agar usta yo'lda to'xtab qolsa yoki kechiksa, tizim 1 tugma bilan boshqa yaqin atrofdagi mutaxassisni chaqirish imkonini beradi.",
      "Kafolat summasining 100% qaytarilishi: Agar buyurtma bekor qilinsa, unga bog'liq barcha mablag' va hisob-kitoblar bir zumda bekor qilinadi yoki hisobingizga to'liq qaytadi.",
      "24/7 Operator yordami: +998 (66) 200-00-00 raqamiga qo'ng'iroq qilsangiz, dispetcher darhol muammoni hal qiladi va yangi usta jo'natadi."
    ],
    actionType: 'create_job',
    actionLabel: "Yangi buyurtma yaratish"
  },
  {
    id: 'faq-4',
    category: 'gps',
    categoryLabel: "📍 GPS & Kuzatuv",
    questionUz: "Ustaning kelayotganini xaritada qanday kuzataman?",
    questionRu: "Как отслеживать прибытие мастера на карте?",
    shortAnswer: "Jonli Radar tizimi orqali ustaning mashinada yoki piyoda kelayotganini, tezligini va qancha daqiqa qolganini real vaqtda ko'rasiz.",
    details: [
      "GPS Kuzatuv tugmasi: Usta 'Zakazni qabul qilish' tugmasini bosgan zahoti, buyurtma kartasida 'Jonli Radar' faollashadi.",
      "Kelish vaqti (ETA): Samarqand ko'chalari va tirbandlik hisobga olingan holda, usta necha daqiqada yetib kelishi soniyama-soniya yangilanadi.",
      "To'g'ridan-to'g'ri qo'ng'iroq va chat: Xaritada ustani ko'rib turgan holda unga telefon qilishingiz yoki 'Darvozani ochib qo'ydim' deb yozishingiz mumkin."
    ]
  },
  {
    id: 'faq-5',
    category: 'pricing',
    categoryLabel: "💰 Bepul & Narxlar",
    questionUz: "Usta bilan narxni qanday kelishamiz? Narx oshib ketmaydimi?",
    questionRu: "Как договориться о цене с мастером? Не вырастет ли цена?",
    shortAnswer: "Narx e'lon berilayotganda oldindan belgilanadi. Shuningdek saytda barcha kasblar bo'yicha Samarqand bozor narxlari kalkulyatori bor.",
    details: [
      "Oldindan kelishilgan byudjet: Buyurtma berganda o'zingiz to'lamoqchi bo'lgan summani (masalan: 350 000 so'm kunlik yoki ishbay) yozasiz. Usta ushbu narxga rozi bo'lib keladi.",
      "Narxlar katalogi: Menyu ichidagi 'Narxlar jadvali' bo'limida kafel (65-110 ming so'm/kv.m), g'isht terish (400-800 so'm/dona) va boshqa 20+ kasb bo'yicha aniq narxlar ko'rsatilgan.",
      "To'lov vositalari: Naqd pul, Uzcard, Humo, Payme yoki Click — o'zingizga qulay usulda ustaga berasiz."
    ]
  },
  {
    id: 'faq-6',
    category: 'special',
    categoryLabel: "🌸 Ayollar & Talabalar",
    questionUz: "Sarishta bekalar (tozalash) va Talabalar ligasi qanday ishlaydi?",
    questionRu: "Как работают услуги клининга и студенческая лига?",
    shortAnswer: "Xonadon tozaligi uchun faqat ayol bekalar, engil yordamchi ishlar uchun esa universitet talabalari alohida tartibda xizmat ko'rsatadi.",
    details: [
      "Ayollar uchun xavfsiz va saranjom xizmat: General uborka, deraza va oyna yuvish, dazmol va parvarishlash uchun faqat tajribali sarishta ayollar qabul qilinadi.",
      "Talabalarga halol daromad: Darsdan keyin bo'sh vaqtida yuk ko'chirish, bog'dorchilik, terim va mayda ta'mirlash ishlariga Samarqand oliygohlari talabalari yordamga keladi.",
      "Bozorga borishga hojat yo'q: Talaba ham, ayol ham ko'chada sovuqda turmasdan, uyidan turib buyurtma qabul qiladi."
    ]
  },
  {
    id: 'faq-7',
    category: 'trust',
    categoryLabel: "🛡️ Ishonch & Xavfsizlik",
    questionUz: "Ish sifati yoqmasa yoki kamchilik bo'lsa nima qilish kerak?",
    questionRu: "Что делать, если качество работы не понравилось или есть дефекты?",
    shortAnswer: "Ishni qabul qilayotganda kamchiliklarni ustaga ko'rsatib to'g'irlatish huquqiga egasiz, chunki to'lov faqat qabul qilingandan keyin amalga oshiriladi.",
    details: [
      "To'lovni to'xtatib turish: Ish to'liq ko'nglingizdagidek bitmaguncha pul bermaslikka haqingiz bor.",
      "Reyting va sharh orqali nazorat: Usta o'z reytingi tushib ketmasligi uchun sifatga javob beradi — salbiy sharh olgan ustaga keyingi buyurtmalar berilmaydi.",
      "Dispetcherlik vositachiligi: Agar kelishmovchilik yuzaga kelsa, platforma ma'muriyati xolis nazorat qiladi va masalani adolatli hal etishga yordam beradi."
    ]
  }
];

export function FAQModal({
  isOpen,
  onClose,
  onOpenCreateJob,
  onOpenHowItWorks,
  onOpenCommissionDashboard
}: FAQModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1'); // Default expand trust question
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [contactFeedbackSent, setContactFeedbackSent] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  if (!isOpen) return null;

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.questionUz.toLowerCase().includes(q) ||
        item.questionRu.toLowerCase().includes(q) ||
        item.shortAnswer.toLowerCase().includes(q) ||
        item.details.some(d => d.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handlePlayVoiceSummary = () => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    speakUzbek(
      "HalolMehnat platformasi haqida eng muhim savollarga javoblar. Birinchidan, xizmat ish beruvchilar uchun 100% bepul. Ikkinchidan, barcha ustalar tekshirilgan va real sharhlarga ega. Uchinchidan, agar ish bekor qilinsa, sizga hech qanday jarima solinmaydi. Savolingiz bo'lsa, operatorimizga bemalol qo'ng'iroq qilishingiz mumkin."
    );
    setTimeout(() => setIsPlayingAudio(false), 11000);
  };

  const handleSendQuickQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactFeedbackSent(true);
    setContactMessage('');
    setTimeout(() => setContactFeedbackSent(false), 5000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white p-5 sm:p-6 shrink-0 border-b border-stone-800">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Yopish (Esc)"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Ko'p Beriladigan Savollar & Javoblar</span>
            </span>

            <button
              onClick={handlePlayVoiceSummary}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                isPlayingAudio 
                  ? 'bg-amber-500 text-stone-950 shadow-md animate-pulse' 
                  : 'bg-stone-800/80 text-amber-300 hover:bg-stone-700 border border-stone-700'
              }`}
              title="Ovozli tarzda qisqa eshitish"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingAudio ? "To'xtatish" : "🔊 Ovozli eshitish"}</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
            FAQ — Barcha Savollaringizga Ochiq Javoblar
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Ustalarga ishonch, bepul xizmat ko'rsatish shartlari, buyurtmani bekor qilish tartibi va kafolatlar haqida batafsil ma'lumotlar.
          </p>

          {/* Quick interactive Search input */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Savolingiz bo'yicha qidiring: masalan: ishonch, bepul, bekor qilish, karta, narx..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-800/90 text-white placeholder-stone-400 text-xs sm:text-sm rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick search suggestion tags */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-stone-400 shrink-0">Ommabop mavzular:</span>
            {[
              { label: "Ustalarga ishonch?", query: "ishonch" },
              { label: "Platforma bepulmi?", query: "bepul" },
              { label: "Bekor qilinsa nima bo'ladi?", query: "bekor" },
              { label: "20 000 so'm kassa?", query: "20 000" },
              { label: "Jonli radar?", query: "radar" }
            ].map(tag => (
              <button
                key={tag.label}
                onClick={() => setSearchQuery(tag.query)}
                className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 transition-colors shrink-0 border border-stone-700/60"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-2 bg-stone-50 border-b border-stone-200 overflow-x-auto shrink-0 no-scrollbar">
          {[
            { id: 'all', label: 'Barcha savollar' },
            { id: 'trust', label: '🛡️ Ishonch & Xavfsizlik' },
            { id: 'pricing', label: '💰 Bepul & Narxlar' },
            { id: 'cancellation', label: '❌ Bekor qilish & Kafolat' },
            { id: 'gps', label: '📍 GPS & Kuzatuv' },
            { id: 'special', label: '🌸 Ayollar & Talabalar' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body: FAQ Accordion List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <HelpCircle className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-stone-700 font-bold text-sm">
                "{searchQuery}" so'rovi bo'yicha savol topilmadi
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Qidiruv so'zini o'zgartirib ko'ring yoki quyidagi tugma orqali operatorimizdan bevosita so'rang.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                Barcha savollarni ko'rsatish
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'border-amber-400 bg-amber-50/20 shadow-sm ring-1 ring-amber-300/40' 
                      : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  {/* Question Click Header */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 focus:outline-none"
                    aria-expanded={isExpanded}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 uppercase tracking-wider">
                          {item.categoryLabel}
                        </span>
                        {item.id === 'faq-1' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Eng ko'p berilgan savol ★
                          </span>
                        )}
                        {item.id === 'faq-2' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                            0 so'm bepul
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-snug">
                        {item.questionUz}
                      </h3>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {item.questionRu}
                      </p>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isExpanded ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Answer Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-amber-100/60 animate-in fade-in duration-150 space-y-3.5">
                      {/* Short summary highlight box */}
                      <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-start gap-2.5 shadow-2xs">
                        <span className="text-amber-600 font-black text-sm shrink-0">💡</span>
                        <div className="text-xs sm:text-sm font-semibold text-stone-900 leading-relaxed">
                          {item.shortAnswer}
                        </div>
                      </div>

                      {/* Detailed Bullet Points */}
                      <div className="space-y-2">
                        {item.details.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{point}</span>
                          </div>
                        ))}
                      </div>

                      {/* Interactive Action CTA within Answer */}
                      {item.actionType && (
                        <div className="pt-2 flex items-center gap-2">
                          {item.actionType === 'create_job' && onOpenCreateJob && (
                            <button
                              onClick={() => { onClose(); onOpenCreateJob(); }}
                              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <span>{item.actionLabel || "Buyurtma berish"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {item.actionType === 'how_it_works' && onOpenHowItWorks && (
                            <button
                              onClick={() => { onClose(); onOpenHowItWorks(); }}
                              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <span>{item.actionLabel || "Yo'riqnoma"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {item.actionType === 'commission' && onOpenCommissionDashboard && (
                            <button
                              onClick={() => { onClose(); onOpenCommissionDashboard(); }}
                              className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-stone-300"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                              <span>{item.actionLabel || "Kassa hisoboti"}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Bottom Live Help & Contact Strip */}
          <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl border border-stone-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    Savolingizga javob topmadingizmi?
                  </h4>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  Bizning qo'llab-quvvatlash markazimiz 24/7 har qanday savolingizga javob berishga tayyor.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="tel:+998662000000"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+998 (66) 200-00-00</span>
                </a>

                <a
                  href="https://t.me/halolmehnat_admin"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Qo'llab-quvvatlash</span>
                </a>
              </div>
            </div>

            {/* Quick in-modal question form */}
            <form onSubmit={handleSendQuickQuestion} className="pt-2 border-t border-stone-700/80 flex gap-2">
              <input
                type="text"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Savolingizni shu yerga yozing..."
                className="flex-1 px-3 py-2 bg-stone-800 text-white placeholder-stone-400 text-xs rounded-xl border border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95"
              >
                <span>Yuborish</span>
                <Send className="w-3 h-3" />
              </button>
            </form>

            {contactFeedbackSent && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Savolingiz muvaffaqiyatli qabul qilindi! Operatorimiz 5 daqiqa ichida javob beradi.</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>HalolMehnat.uz — 100% halol va shaffof mehnat kafolati</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
}
