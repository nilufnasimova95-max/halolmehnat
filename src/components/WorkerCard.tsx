import { 
  Star, MapPin, GraduationCap, CheckCircle2, 
  Phone, Eye, Briefcase, ChevronRight, Camera, MessageSquare 
} from 'lucide-react';
import { WorkerProfile } from '../types';

interface WorkerCardProps {
  worker: WorkerProfile;
  onSelectWorker: (worker: WorkerProfile) => void;
  onHireWorker: (worker: WorkerProfile) => void;
  onOpenChat?: (worker: WorkerProfile) => void;
}

export function WorkerCard({ worker, onSelectWorker, onHireWorker, onOpenChat }: WorkerCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between">
      <div className="p-4 space-y-3.5">
        
        {/* Top: Avatar & Main Info */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0 cursor-pointer" onClick={() => onSelectWorker(worker)}>
            <img 
              src={worker.avatarUrl} 
              alt={worker.name} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-stone-100 shadow-sm"
            />
            {worker.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 
                onClick={() => onSelectWorker(worker)} 
                className="font-bold text-stone-900 text-sm hover:text-amber-700 cursor-pointer truncate"
              >
                {worker.name}
              </h4>

              {worker.isStudent && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-0.5 shrink-0">
                  <GraduationCap className="w-3 h-3" />
                  Talaba
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 truncate mt-0.5">
              {worker.roleTitle}
            </p>

            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {worker.rating}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">({worker.reviewCount || 0} baho)</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-stone-500 text-[11px] truncate">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                {worker.district}
              </span>
            </div>
          </div>
        </div>

        {/* Price & Experience Row */}
        <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl text-xs">
          <div>
            <div className="text-[10px] text-stone-500 uppercase font-medium">Kunlik xizmat</div>
            <div className="font-mono font-bold text-stone-900 text-sm tabular-nums">
              {worker.dailyRateUzs.toLocaleString()} so'm
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-stone-500 uppercase font-medium">Tajriba</div>
            <div className="font-semibold text-stone-800 text-xs">
              {worker.experience}
            </div>
          </div>
        </div>

        {/* Skills List (Unboxed clean text with bullet separators) */}
        <div className="text-[11px] text-stone-600 leading-snug line-clamp-2">
          {worker.skills.slice(0, 4).map((skill, index) => (
            <span key={index}>
              {index > 0 && <span className="text-stone-300 mx-1">·</span>}
              <span>{skill}</span>
            </span>
          ))}
        </div>

        {/* Badges for portfolio photos & past projects */}
        {((worker.portfolioPhotos && worker.portfolioPhotos.length > 0) || (worker.pastExperiences && worker.pastExperiences.length > 0)) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {worker.portfolioPhotos && worker.portfolioPhotos.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                <Camera className="w-3 h-3 text-emerald-600" />
                <span>{worker.portfolioPhotos.length} ta foto namuna</span>
              </span>
            )}
            {worker.pastExperiences && worker.pastExperiences.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                <Briefcase className="w-3 h-3 text-amber-600" />
                <span>{worker.pastExperiences.length} ta loyiha</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center gap-1.5">
        <button
          onClick={() => onSelectWorker(worker)}
          className="flex-1 py-2 px-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ko'rish</span>
        </button>

        {onOpenChat && (
          <button
            onClick={() => onOpenChat(worker)}
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center shadow-2xs"
            title={`${worker.name} bilan Messenjerda muloqot`}
          >
            <MessageSquare className="w-4 h-4 text-amber-700" />
          </button>
        )}

        <button
          onClick={() => onHireWorker(worker)}
          className="flex-1 py-2 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
        >
          <span>Chaqirish</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
