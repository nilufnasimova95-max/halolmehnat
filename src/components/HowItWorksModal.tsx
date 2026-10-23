import { useState } from 'react';
import { 
  X, CheckCircle2, MapPin, Navigation, CreditCard, 
  Star, HardHat, Home, Sparkles, GraduationCap, ShieldCheck, 
  Smartphone, ArrowRight, Flame, Clock, Phone, Volume2, VolumeX
} from 'lucide-react';
import { speakUzbek } from '../utils/sound';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateJob: () => void;
  onOpenRegisterWorker: () => void;
  onOpenCommissionDashboard: () => void;
}

export function HowItWorksModal({
  isOpen,
  onClose,
  onOpenCreateJob,
  onOpenRegisterWorker,
  onOpenCommissionDashboard
}: HowItWorksModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const handlePlayVoice = () => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    speakUzbek(
      "HalolMehnat platformasidan foydalanish juda oson. Birinchidan, usta kerak bo'lsa, e'lon bering yoki ustani tanlang. Ikkinchidan, usta yo'lga chiqadi va siz uning manzilini xaritada ko'rib turasiz. Uchinchidan, ish bitgach, pulini berasiz. Agar savollaringiz bo'lsa, operatorimizga qo'ng'iroq qiling."
    );
    setTimeout(() => setIsPlayingAudio(false), 9000);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="relative bg-stone-900 text-white p-5 sm:p-6 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oddiy tilda tushuntirish</span>
            </span>

            <button
              onClick={handlePlayVoice}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isPlayingAudio ? 'bg-amber-500 text-stone-950 animate-pulse' : 'bg-stone-800 text-amber-300 hover:bg-stone-700'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingAudio ? "To'xtatish" : "🔊 Ovozli eshitish"}</span>
            </button>
          </div>

          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
            HalolMehnat platformasi qanday ishlaydi?
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Ko'chada sovuqda soatlab kutishga chek qo'yuvchi, uydan turib usta, mardikor, ayol tozalikchilarni topish va har bir kelishuvdan daromad olish tizimi.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-800">

          {/* Section 1: Sayt nomi va bosh g'oya */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 font-black flex items-center justify-center text-sm shadow-xs">
                H
              </span>
              <h3 className="font-bold text-stone-900 text-base">
                Platforma nomi: "HalolMehnat" (halolmehnat.uz)
              </h3>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              <strong>Asosiy vazifasi:</strong> Samarqand shahri va tumanlarida mardikor va ustalar ertalab soat 6:00 dan sovuqda ko'cha chetida (masalan, Siyob, Temiryo'l yoki tuman markazlarida) mijoz kutib turardi. Endi esa ular issiq uyida o'tirib, telefonida o'z ishlari rasmini (portfoliosini) ko'rsatadi va buyurtmalarni qabul qiladi. Talabalar va uyaladigan yoshlar ham bemalol halol ish topa oladi.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Step 1: Ish Beruvchi */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xs">1</span>
                <span>Ish beruvchi uchun</span>
              </div>
              <h4 className="font-bold text-stone-900 text-sm">
                E'lon berish ("Shuncha beraman")
              </h4>
              <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                <li>Bajariladigan ish rasmini (masalan, g'isht terish, ta'mir yoki tozalash) yuklaydi.</li>
                <li>Manzilini (tuman, ko'cha) tanlaydi.</li>
                <li>"Shuncha beraman" deb o'z budjetini yozadi (masalan, 450 000 so'm/kun).</li>
                <li>Yoki vitrinadan usta/sarishta bekani to'g'ridan-to'g'ri chaqiradi.</li>
              </ul>
            </div>

            {/* Step 2: Usta / Mardikor / Ayollar */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">2</span>
                <span>Usta & Ishchilar uchun</span>
              </div>
              <h4 className="font-bold text-stone-900 text-sm">
                Zakazni qabul qilish
              </h4>
              <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                <li>O'z mutaxassisligi (g'isht, kafel, svarka, tozalik) bo'yicha e'lonlarni ko'radi.</li>
                <li>Narx ma'qul bo'lsa, "Zakazni qabul qilish" tugmasini bosadi.</li>
                <li>Usta o'z profilini ochib, tajribasi va telefonini qoldirishi mumkin.</li>
                <li>Sovuq ko'chaga chiqmasdan, to'g'ridan-to'g'ri mijoz manziliga yo'l oladi.</li>
              </ul>
            </div>

            {/* Step 3: Jonli GPS Radar */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xs">3</span>
                <span>Jonli Kuzatuv (Radar)</span>
              </div>
              <h4 className="font-bold text-stone-900 text-sm">
                Telefon orqali xaritada ko'rish
              </h4>
              <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                <li>Ish beruvchi usta yo'lga chiqqanini va qayerdaligini ko'rib turadi.</li>
                <li>Qancha masofa qolgani va yetib kelish vaqti (ETA, daqiqa) ko'rinadi.</li>
                <li>Bir marta bosish orqali to'g'ridan-to'g'ri qo'ng'iroq qilish imkoniyati.</li>
                <li>Ish boshlangach va yakunlangach holat belgilanadi.</li>
              </ul>
            </div>

            {/* Step 4: Reyting & Sharh */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-xs">4</span>
                <span>Reyting & Izoh</span>
              </div>
              <h4 className="font-bold text-stone-900 text-sm">
                1–5 yulduzli baholash
              </h4>
              <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                <li>Ish yakunlangach, buyurtmachi ustaga 1 dan 5 gacha baho beradi.</li>
                <li>"O'z vaqtida keldi", "Toza ishladi" kabi tezkor belgilar qo'yadi.</li>
                <li>Bu baho ustaning umumiy reytingini oshiradi yoki pasaytiradi.</li>
                <li>Kelgusidagi boshqa mijozlar yaxshi ustalarni darhol taniydi.</li>
              </ul>
            </div>

          </div>

          {/* Section 3: Sizning kartangizga 20 000 so'm tushish tizimi */}
          <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Sizning daromadingiz: Har bir kelishuvdan 20 000 so'm
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-400 text-stone-950 px-2.5 py-1 rounded-lg">
                20,000 UZS / kelishuv
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Buyurtmachi va usta o'rtasida har bir kelishuv yuz berganda (buyurtma qabul qilinganda yoki to'g'ridan-to'g'ri chaqirilganda), platforma xizmati uchun <strong>20 000 so'm</strong> komissiya yoziladi.
            </p>

            <div className="p-3 bg-stone-800 rounded-xl border border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-stone-400">Platforma egasi kartasi: </span>
                <span className="font-mono font-bold text-amber-300">8600 •••• •••• 9541</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenCommissionDashboard();
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Kassa hisobotini ochish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section 4: Ayollar va Talabalar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                <span>🌸 Ayollar & Tozalik:</span>
              </div>
              <p className="text-rose-800 text-[11px]">
                Faqat erkaklar uchun emas, balki general uborka, oyna yuvish, parda-dazmol, ta'mirdan keyingi tozalash bo'yicha ayollar ham buyurtma topadi.
              </p>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Talabalar ligasi:</span>
              </div>
              <p className="text-blue-800 text-[11px]">
                Mardikor bozoriga chiqishga uyaladigan talabalar darsdan so'ng mebel ko'chirish, yordamchi ishlar orqali obro'li halol pul topadi.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors"
          >
            Tushundim, yopish
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenRegisterWorker();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Usta bo'lib ro'yxatdan o'tish
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCreateJob();
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Buyurtma berish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
