import { useState } from 'react';
import { 
  Home, HardHat, Phone, Volume2, VolumeX, Sparkles, 
  CheckCircle2, ArrowRight, HelpCircle, Navigation, 
  MessageSquare, ShieldCheck, Zap, Share2
} from 'lucide-react';
import { speakUzbek } from '../utils/sound';

interface EasyStartGuideProps {
  onOpenQuickOrder: () => void;
  onSelectWorkerMode: () => void;
  onOpenHowItWorks: () => void;
  onOpenTradesDirectory: () => void;
  onOpenShare?: () => void;
  currentRole: 'employer' | 'worker';
}

export function EasyStartGuide({
  onOpenQuickOrder,
  onSelectWorkerMode,
  onOpenHowItWorks,
  onOpenTradesDirectory,
  onOpenShare,
  currentRole
}: EasyStartGuideProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayVoiceGuide = () => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const text = "Assalomu alaykum! HalolMehnat platformasiga xush kelibsiz. Agar sizga usta kerak bo'lsa, 'Menga usta kerak' tugmasini bosing. Yozishga qiynalsangiz, mikrofonga shunchaki gapiring, saytimiz uni matnga aylantirib beradi. Agar usta bo'lsangiz, 'Men ustaman' tugmasini bosing.";
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'uz-UZ';
      utter.rate = 0.9;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-300/80 shadow-md space-y-6">
      
      {/* Top Banner Title & Voice Guide Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wide">
              Oddiy Xalq Uchun Oson Yo'riqnoma
            </span>
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              Hech qanday murakkabliksiz
            </span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-stone-900 mt-1">
            Saytdan foydalanish juda oson. Sizga nima kerak?
          </h2>
        </div>

        {/* Audio helper button */}
        <button
          onClick={handlePlayVoiceGuide}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            isPlayingAudio 
              ? 'bg-amber-500 text-stone-950 shadow-md animate-pulse' 
              : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
          }`}
          title="O'zbek tilida ovozli tushuntirish"
        >
          {isPlayingAudio ? <VolumeX className="w-4 h-4 text-stone-950" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          <span>{isPlayingAudio ? "Ovozni to'xtatish" : "🔊 Ovozli eshitish"}</span>
        </button>
      </div>

      {/* TWO PRIMARY PATHS - LARGE CLICK TARGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Choice A: Menga Usta Kerak */}
        <div 
          onClick={onOpenQuickOrder}
          className="relative bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 border border-amber-400 flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-950 text-amber-400 flex items-center justify-center shadow-md">
              <Home className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-stone-950/15 px-2 py-0.5 rounded">
                Ish beruvchilar uchun
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl mt-1 text-stone-950">
                1. Menga Usta yoki Mardikor kerak 🏠
              </h3>
              <p className="text-xs sm:text-sm text-stone-900 mt-1 font-medium leading-relaxed">
                Devor terish, kafel, svarka, tom yopish, santexnik, elektr yoki uyni tozalash uchun usta chaqirish
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-950/15 flex items-center justify-between font-black text-xs sm:text-sm">
            <span>HOZIROQ USTA CHAQIRISH (1 DAQIQA)</span>
            <div className="w-8 h-8 rounded-full bg-stone-950 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Choice B: Men Ustaman, Menga Ish Kerak */}
        <div 
          onClick={onSelectWorkerMode}
          className="relative bg-stone-900 hover:bg-stone-800 text-white p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 border border-stone-700 flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
              <HardHat className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-amber-300">
                Usta va Mardikorlar uchun
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl mt-1 text-white">
                2. Men Ustaman, Menga Ish kerak 🔨
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                Sovuqda ko'chada kutmasdan, uydan turib ochiq buyurtmalarni ko'rish va zakazni qabul qilish
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-700 flex items-center justify-between font-black text-xs sm:text-sm text-amber-400">
            <span>BUYURTMALAR VA ISHLARNI KO'RISH</span>
            <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform border border-stone-600">
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>

      </div>

      {/* 3 ODDIY QADAM (Visual 3-Step Infographic) */}
      <div className="pt-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-3 text-center sm:text-left">
          Platforma qanday ishlaydi? Atigi 3 ta qadam:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
            <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                <span>Ovozli aytish yoki yozish 🎙️</span>
              </h4>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Yozish shart emas! Mikrofonga gapirib ovozli xabar qoldiring yoki rasmini yuklang
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                Usta yo'lga chiqadi
              </h4>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Xaritada usta qayerdaligi va necha daqiqada kelishi ko'rinadi
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
            <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                To'lov & 1–5★ Baholash
              </h4>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Ish bitgach hisoblashasiz va ustani 1–5 yulduzcha hamda samimiy sharh bilan baholaysiz
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* EMERGENCY HELPLINE BANNER FOR NON-TECH USERS */}
      <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-900">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 mx-auto sm:mx-0 shadow-xs">
            <Phone className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="font-black text-sm text-stone-950">
              Saytdan foydalana olmasangiz — Bitta qo'ng'iroq qiling!
            </div>
            <p className="text-xs text-stone-700">
              Operatorimiz o'zi sizga usta topib beradi yoki usta bo'lsangiz ro'yxatdan o'tkazib qo'yadi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <a
            href="tel:+998662000000"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>+998 (66) 200-00-00</span>
          </a>

          <button
            onClick={onOpenHowItWorks}
            className="px-3 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Qo'llanma</span>
          </button>

          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              title="Platforma manzili (.UZ) va boshqalar qanday topishi haqida"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Ulashish & .UZ 🌐</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
