import React, { useState, useRef } from 'react';
import { 
  X, CheckCircle2, Upload, Image as ImageIcon, Sparkles, 
  History, Camera, Trash2, ArrowRight, ShieldCheck, AlertCircle 
} from 'lucide-react';
import type { JobOrder } from '../types';
import { BeforeAfterViewer } from './BeforeAfterViewer';

interface CompleteJobModalProps {
  job: JobOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmComplete: (jobId: string, completionData: {
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
    completionNote?: string;
  }) => void;
}

// Preset samples for fast one-click testing if user does not upload own files
const PRESET_BEFORE_AFTER = [
  {
    id: 'renovation',
    label: "Ta'mir / Qayta qurish (Laminat & Devor)",
    before: '/src/assets/images/work_before_renovation_1792251821266.jpg',
    after: '/src/assets/images/work_after_renovation_1792251836245.jpg',
    note: "Eski xona tozalab tekislanib, sifatli laminat va pardozlash ishlari yakunlandi."
  },
  {
    id: 'cleaning',
    label: "Tozalash / General Uborka (Oshxona & Uy)",
    before: '/src/assets/images/cleaning_before_work_1792251849900.jpg',
    after: '/src/assets/images/cleaning_after_work_1792251863772.jpg',
    note: "Oshxona yuzalari va barcha anjomlar to'liq dezinfeksiya qilinib, yaraqlatib yuvildi."
  },
  {
    id: 'brickwork',
    label: "G'isht terish & Bino",
    before: '/src/assets/images/work_before_renovation_1792251821266.jpg',
    after: '/src/assets/images/job_bricklaying_wall_1791274845977.jpg',
    note: "Pishiq g'ishtdan mustahkam devor tekis va sifatli terildi."
  }
];

export function CompleteJobModal({
  job,
  isOpen,
  onClose,
  onConfirmComplete
}: CompleteJobModalProps) {
  if (!isOpen || !job) return null;

  const [beforePhoto, setBeforePhoto] = useState<string>(job.beforePhotoUrl || '');
  const [afterPhoto, setAfterPhoto] = useState<string>(job.afterPhotoUrl || '');
  const [completionNote, setCompletionNote] = useState<string>(
    job.completionNote || "Ish to'liq va sifatli bajarildi, buyurtmachi natijadan mamnun bo'ldi."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (target === 'before') {
            setBeforePhoto(reader.result);
          } else {
            setAfterPhoto(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_BEFORE_AFTER[0]) => {
    setBeforePhoto(preset.before);
    setAfterPhoto(preset.after);
    setCompletionNote(preset.note);
  };

  const handleSubmit = (withPhotos: boolean) => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmComplete(job.id, {
        beforePhotoUrl: withPhotos ? beforePhoto : undefined,
        afterPhotoUrl: withPhotos ? afterPhoto : undefined,
        completionNote: completionNote.trim() || undefined
      });
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const hasBothPhotos = Boolean(beforePhoto && afterPhoto);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-stone-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">
                  Ishni yakunlash & Fotosuratlar yuklash
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Usta hisoboti
                </span>
              </div>
              <p className="text-xs text-stone-300">
                "{job.title}" · <span className="text-amber-400 font-mono font-bold">{job.budgetUzs.toLocaleString()} so'm</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Explanation banner */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-300/80 rounded-xl flex items-start gap-3 text-xs text-stone-800">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-950 mb-0.5">
                Ish sifatini tasdiqlovchi "Oldin / Keyin" juftligi
              </div>
              <p className="text-stone-600 leading-relaxed">
                Usta ish boshlanishidan oldingi va ish yakunlangandan keyingi fotosuratlarni yuklashi mumkin. Bu fotosuratlar buyurtma tarixida saqlanadi, mijozlarga taqdim etiladi va usta portfoliosiga qo'shiladi.
              </p>
            </div>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div>
            <div className="text-xs font-bold text-stone-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Namuna suratlardan bir zumda tanlash (Tezkor test):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_BEFORE_AFTER.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/50 text-left transition-all text-xs group"
                >
                  <div className="font-bold text-stone-800 group-hover:text-amber-900 truncate">
                    {preset.label}
                  </div>
                  <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-1">
                    <span>2 ta surat biriktirish</span>
                    <ArrowRight className="w-3 h-3 text-amber-500 ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input 
            type="file" 
            ref={beforeInputRef} 
            accept="image/*" 
            onChange={(e) => handleFileUpload(e, 'before')} 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={afterInputRef} 
            accept="image/*" 
            onChange={(e) => handleFileUpload(e, 'after')} 
            className="hidden" 
          />

          {/* Side-by-side Upload Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Before Photo Box */}
            <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/50 space-y-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800">
                  <span className="w-2 h-2 rounded-full bg-stone-500"></span>
                  <History className="w-3.5 h-3.5 text-stone-600" />
                  <span>1. Ishdan oldingi holat (Oldin)</span>
                </div>
                {beforePhoto && (
                  <button
                    type="button"
                    onClick={() => setBeforePhoto('')}
                    className="text-stone-400 hover:text-red-500 text-xs transition-colors p-1"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {beforePhoto ? (
                <div className="relative rounded-lg overflow-hidden border border-stone-300 aspect-video bg-stone-900 group">
                  <img 
                    src={beforePhoto} 
                    alt="Oldin" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => beforeInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-white text-stone-900 text-xs font-bold rounded-lg shadow-md hover:bg-stone-100"
                    >
                      Almashtirish
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-stone-900/80 text-white text-[10px] font-bold rounded">
                    Oldin (Ish boshida)
                  </span>
                </div>
              ) : (
                <div 
                  onClick={() => beforeInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-lg aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-white hover:bg-amber-50/20"
                >
                  <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mb-1.5">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-700">Oldingi suratni yuklash</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">PNG, JPG yoki kameradan</span>
                </div>
              )}
            </div>

            {/* 2. After Photo Box */}
            <div className="border border-emerald-200 rounded-xl p-3.5 bg-emerald-50/30 space-y-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Ishdan keyingi natija (Keyin)</span>
                </div>
                {afterPhoto && (
                  <button
                    type="button"
                    onClick={() => setAfterPhoto('')}
                    className="text-stone-400 hover:text-red-500 text-xs transition-colors p-1"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {afterPhoto ? (
                <div className="relative rounded-lg overflow-hidden border border-emerald-300 aspect-video bg-stone-900 group">
                  <img 
                    src={afterPhoto} 
                    alt="Keyin (Natija)" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => afterInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-emerald-700"
                    >
                      Almashtirish
                    </button>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded">
                    Keyin (Natija ✓)
                  </span>
                </div>
              ) : (
                <div 
                  onClick={() => afterInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-lg aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-white hover:bg-emerald-50/50"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-800">Natija suratini yuklash</span>
                  <span className="text-[10px] text-emerald-600/70 mt-0.5">Bajarilgan toza ish</span>
                </div>
              )}
            </div>

          </div>

          {/* Live Before/After Interactive Comparison Preview (If both present) */}
          {hasBothPhotos && (
            <div className="p-3 bg-stone-900 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  Jonli taqqoslash predprosmotri:
                </span>
                <span className="text-[11px] text-stone-400 font-normal">
                  Tarixda xuddi shu ko'rinishda namoyish etiladi
                </span>
              </div>
              <BeforeAfterViewer 
                beforePhotoUrl={beforePhoto} 
                afterPhotoUrl={afterPhoto} 
                jobTitle={job.title}
                workerName={job.workerName}
                compact={true}
              />
            </div>
          )}

          {/* Completion Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">
              Usta izohi yoki bajarilgan ish hisoboti:
            </label>
            <textarea
              rows={2}
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Masalan: 90 kv.m maydonga laminat to'shab chiqildi, chetlari yopildi."
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-stone-600 hover:text-stone-900 text-xs font-bold rounded-xl transition-colors"
          >
            Bekor qilish
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-3.5 py-2 text-stone-600 hover:text-stone-800 text-xs font-medium rounded-xl hover:bg-stone-200 transition-colors"
            >
              Suratsiz yakunlash
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {hasBothPhotos ? "Suratlar bilan yakunlash ✓" : "Ishni to'liq yakunlash"}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
