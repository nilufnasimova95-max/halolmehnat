import { Sparkles, Heart, CheckCircle2, ArrowRight, ShieldCheck, Sun } from 'lucide-react';

interface WomenServicesBannerProps {
  onFilterCleaningGigs: () => void;
  onOpenRegisterWorker: () => void;
  onOpenCreateCleaningJob: () => void;
}

export function WomenServicesBanner({ 
  onFilterCleaningGigs, 
  onOpenRegisterWorker,
  onOpenCreateCleaningJob
}: WomenServicesBannerProps) {
  return (
    <div className="bg-gradient-to-r from-rose-950 via-stone-900 to-amber-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-rose-900/50 my-6 relative overflow-hidden">
      
      {/* Decorative floral aura */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Copy */}
        <div className="flex-1 space-y-3 text-center md:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/70 border border-rose-700/80 text-rose-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <span>Ayollar & Sarishta Bekalar Bo'limi</span>
          </div>

          <h2 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight">
            Uydan turib General Uborka, oyna yuvish va xonadon xizmatlari!
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
            Platformadan endi ayollar va opa-singillarimiz ham bemalol foydalana oladi. Xonadonlarni saranjomlash, deraza va balkon oynalarini yuvish, remontdan keyingi tozalash va dazmol xizmatlari uchun uydan turib buyurtma oling yoki ishonchli sarishta bekalarni chaqiring!
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-rose-200 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              General Uborka (Boshdan-oyoq tozalash)
            </span>
            <span className="text-rose-400">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Deraza & Oyna yuvish
            </span>
            <span className="text-rose-400">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Remontdan keyingi tozalash
            </span>
            <span className="text-rose-400">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Dazmol & Oshxona yordami
            </span>
          </div>

        </div>

        {/* Right CTA cluster */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={onOpenCreateCleaningJob}
            className="px-5 py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Tozalashga buyurtma berish 🌸</span>
          </button>

          <button
            onClick={onFilterCleaningGigs}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-rose-200 font-semibold rounded-xl text-xs border border-rose-800/80 transition-colors flex items-center justify-center gap-2"
          >
            <span>Tozalik buyurtmalarini saralash</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenRegisterWorker}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs border border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <span>Sarishta beka bo'lib qo'shilish</span>
          </button>
        </div>

      </div>

    </div>
  );
}
