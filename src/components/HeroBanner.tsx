import { 
  ShieldCheck, MapPin, Zap, Flame, ThermometerSnowflake, 
  GraduationCap, Search, PlusCircle, Compass, Phone, HelpCircle, ArrowRight
} from 'lucide-react';

interface HeroBannerProps {
  onOpenCreateJob: () => void;
  onOpenRegisterWorker: () => void;
  onOpenTradesDirectory: () => void;
  onOpenHowItWorks?: () => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string;
}

export function HeroBanner({ 
  onOpenCreateJob, 
  onOpenRegisterWorker, 
  onOpenTradesDirectory, 
  onOpenHowItWorks,
  onSelectCategory,
  selectedCategory 
}: HeroBannerProps) {
  return (
    <div className="relative bg-stone-900 text-white rounded-3xl overflow-hidden shadow-xl border border-stone-800 my-2">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.25),rgba(255,255,255,0))]" />
      
      <div className="relative max-w-5xl mx-auto px-5 py-7 sm:py-10 sm:px-8 text-center sm:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Column: Heading & Simple Actions */}
        <div className="flex-1 space-y-4">
          
          {/* Mission kicker tags */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/90 border border-stone-700/80 text-amber-300 text-xs font-semibold">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-400" />
              <span>Sovuqda ko'chada kutmasdan, uydan turib usta toping!</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              <span>🌐 HalolMehnat.uz</span>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
            Samarqandda usta va ishchi topish <br className="hidden sm:inline" />
            endi <span className="text-amber-400">juda oson va xavfsiz</span>.
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
            Ustani chaqirasiz, telefoningizda qayerdaligini ko'rib turasiz. Ish bitgach naqd yoki kartadan hisoblashasiz. Hech qanday ortiqcha qiyinchiliksiz!
          </p>

          {/* TWO PRIMARY SIMPLE BUTTONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3 pt-1">
            <button
              onClick={onOpenCreateJob}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl text-sm shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-stone-950" />
              <span>USTA CHAQIRISH 🏠</span>
            </button>

            <button
              onClick={onOpenRegisterWorker}
              className="px-5 py-3.5 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold rounded-2xl text-sm border border-stone-700 transition-colors flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Men ustaman (Ish qidiryapman) 🔨</span>
            </button>

            {onOpenHowItWorks && (
              <button
                onClick={onOpenHowItWorks}
                className="px-4 py-3 bg-stone-800/70 hover:bg-stone-700 text-stone-300 font-medium rounded-2xl text-xs border border-stone-700/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Qanday ishlaydi?</span>
              </button>
            )}
          </div>

          {/* Micro trust indicators */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Jonli GPS radar (Usta qayerda kelmoqda)
            </span>
            <span className="text-stone-700">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Kafolatli va halol xizmat
            </span>
          </div>

        </div>

        {/* Right Column: Live Radar Preview Card */}
        <div className="w-full sm:w-80 bg-stone-800/80 backdrop-blur-md rounded-2xl border border-stone-700 p-4 shadow-2xl shrink-0 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-stone-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">Jonli radar misoli</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">12 daq qoldi</span>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Usta:</span>
              <span className="font-semibold text-stone-200">Bahrom Usta (Tajribali)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Hozirgi holat:</span>
              <span className="font-semibold text-emerald-400">🚗 Yo'lda (3.4 km)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Ish turi:</span>
              <span className="font-bold text-amber-300">G'isht terish & Bino</span>
            </div>
          </div>

          <button
            onClick={() => onSelectCategory('devor_terish')}
            className="w-full py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>E'lonlarni ko'rish</span>
          </button>
        </div>

      </div>
    </div>
  );
}
