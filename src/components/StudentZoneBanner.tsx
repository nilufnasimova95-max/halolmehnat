import { GraduationCap, Heart, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface StudentZoneBannerProps {
  onFilterStudentGigs: () => void;
  onOpenRegisterStudent: () => void;
}

export function StudentZoneBanner({ onFilterStudentGigs, onOpenRegisterStudent }: StudentZoneBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-900/60 my-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left copy */}
        <div className="flex-1 space-y-2.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-700 text-blue-200 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-blue-300" />
            <span>Talabalar & Yoshlar Ligasi</span>
          </div>

          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
            Mardikor bozoriga borishga uyalasizmi? Halol mehnat hech qachon ayb emas!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Sovuqda ko'chada soatlab turish yo'q. Telefoningiz orqali darsdan bo'sh vaqtingizda mebel ko'chirish, yuk tushirish, ombor yoki xonadon yordamchisi bo'lib munosib pul ishlang.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-blue-200 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Kontrakt va yotoqxona xarajatlari uchun
            </span>
            <span className="text-blue-500">·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              3-4 soatlik erkin grafikdagi ishlar
            </span>
            <span className="text-blue-500">·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Kunlik to'lov naqd yoki kartaga
            </span>
          </div>
        </div>

        {/* Right buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={onFilterStudentGigs}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow flex items-center justify-center gap-2"
          >
            <span>Talabalar ishlarini saralash</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRegisterStudent}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <span>Talaba sifatida ro'yxatdan o'tish</span>
          </button>
        </div>

      </div>
    </div>
  );
}
