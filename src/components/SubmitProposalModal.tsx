import React, { useState } from 'react';
import { 
  X, DollarSign, Clock, Send, Sparkles, CheckCircle2, 
  MapPin, ShieldCheck, Briefcase 
} from 'lucide-react';
import { JobOrder, WorkerProfile, JobProposal } from '../types';

interface SubmitProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobOrder;
  currentWorker: WorkerProfile;
  onSubmitProposal: (proposal: Omit<JobProposal, 'id' | 'createdAt' | 'status'>) => void;
}

export function SubmitProposalModal({
  isOpen,
  onClose,
  job,
  currentWorker,
  onSubmitProposal
}: SubmitProposalModalProps) {
  const [proposedPrice, setProposedPrice] = useState<string>(job.budgetUzs.toString());
  const [estimatedDuration, setEstimatedDuration] = useState<string>("1 kun");
  const [coverNote, setCoverNote] = useState<string>(
    "Kerakli barcha professional asbob-uskunalarim bor. Ishni sifatli va vaqtida bajarib beraman."
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(proposedPrice.replace(/\D/g, ''), 10) || job.budgetUzs;

    onSubmitProposal({
      jobId: job.id,
      jobTitle: job.title,
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      workerAvatar: currentWorker.avatarUrl,
      workerPhone: currentWorker.phone,
      workerRating: currentWorker.rating,
      workerCategory: currentWorker.roleTitle,
      proposedPriceUzs: priceNum,
      estimatedDuration,
      coverNote: coverNote.trim()
    });

    onClose();
  };

  const quickDurations = ["Bugun (3-4 soat)", "1 kun", "2-3 kun", "1 hafta"];

  const quickTemplates = [
    "Barcha asboblarim bor, lazer bilan tekis va sifatli qilib beraman.",
    "2 kishi brigada bo'lib tez va saranjom yakunlaymiz.",
    "Manzilga 30 daqiqada yetib bora olaman, ishni darhol boshlaymiz.",
    "Bajarilgan ishga 1 yil kafolat beraman."
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Buyurtmaga narx taklifi yuborish
              </h3>
              <p className="text-xs text-stone-400">
                Ish beruvchiga o'z narxingiz va shartlaringizni taklif qiling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Job Summary Pill */}
        <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-200/80 text-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">
              {job.categoryLabel}
            </span>
            <h4 className="font-bold text-stone-900 truncate">
              {job.title}
            </h4>
            <div className="text-stone-500 flex items-center gap-1 text-[11px] mt-0.5">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span className="truncate">{job.locationAddress}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-stone-500 block">Mijoz byudjeti</span>
            <span className="font-mono font-bold text-sm text-stone-900">
              {job.budgetUzs.toLocaleString()} so'm
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Price input */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5">
              Siz taklif qiladigan narx (so'mda):
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono text-base font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-hidden"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">
                UZS
              </span>
            </div>
            
            {/* Quick Presets */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {[
                job.budgetUzs,
                Math.round(job.budgetUzs * 0.9 / 10000) * 10000,
                Math.round(job.budgetUzs * 1.15 / 10000) * 10000
              ].map((val, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setProposedPrice(val.toString())}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 transition-colors"
                >
                  {val.toLocaleString()} so'm
                </button>
              ))}
            </div>
          </div>

          {/* Duration estimation */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Ishni qancha vaqtda bajarasiz?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickDurations.map((dur, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setEstimatedDuration(dur)}
                  className={`py-2 px-2 text-xs rounded-xl font-medium border text-center transition-all ${
                    estimatedDuration === dur 
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-600 shadow-2xs' 
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Cover note / message */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5">
              Ish beruvchiga qisqa izoh (shartlar & tajriba):
            </label>
            <textarea
              rows={3}
              required
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="w-full p-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-hidden leading-relaxed"
              placeholder="Asboblaringiz borligi, tajribangiz yoki brigada soni haqida yozing..."
            />

            {/* Quick response chips */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Tezkor variantlar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTemplates.map((tpl, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setCoverNote(tpl)}
                    className="text-[11px] text-stone-600 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-lg border border-stone-200 transition-colors text-left"
                  >
                    "{tpl}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Worker identity badge */}
          <div className="p-2.5 bg-stone-100 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <img 
                src={currentWorker.avatarUrl} 
                alt={currentWorker.name} 
                className="w-8 h-8 rounded-lg object-cover border border-stone-200"
              />
              <div>
                <span className="font-bold text-stone-900 block">{currentWorker.name}</span>
                <span className="text-[10px] text-stone-500">{currentWorker.roleTitle}</span>
              </div>
            </div>
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {currentWorker.rating}★ ({currentWorker.reviewCount || 0})
            </span>
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Taklifni yuborish</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
