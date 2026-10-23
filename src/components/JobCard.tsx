import { useState, useRef } from 'react';
import { 
  MapPin, Clock, DollarSign, Navigation, Phone, 
  CheckCircle2, AlertCircle, Utensils, Wrench, Zap, ChevronRight, Star, 
  Camera, Maximize2, X, Compass, Radio, Mic, Volume2, Play, Pause, MessageSquare,
  Sparkles, History, CheckCheck
} from 'lucide-react';
import { JobOrder, JobProposal } from '../types';
import { BeforeAfterViewer } from './BeforeAfterViewer';

interface JobCardProps {
  job: JobOrder;
  onOpenLiveTracking: (job: JobOrder) => void;
  onAcceptJob: (job: JobOrder) => void;
  onOpenReviewModal?: (job: JobOrder, targetRole?: 'worker' | 'employer') => void;
  onOpenChat?: (job: JobOrder) => void;
  onOpenCompleteModal?: (job: JobOrder) => void;
  onOpenEmployerProfile?: (employerName: string) => void;
  onOpenWorkerProfile?: (workerId: string) => void;
  onOpenSubmitProposal?: (job: JobOrder) => void;
  onAcceptProposal?: (job: JobOrder, proposal: JobProposal) => void;
  onOpenMessenger?: (partnerId: string, jobId?: string) => void;
  currentRole: 'employer' | 'worker';
}

export function JobCard({ 
  job, 
  onOpenLiveTracking, 
  onAcceptJob, 
  onOpenReviewModal, 
  onOpenChat,
  onOpenCompleteModal,
  onOpenEmployerProfile,
  onOpenWorkerProfile,
  onOpenSubmitProposal,
  onAcceptProposal,
  onOpenMessenger,
  currentRole 
}: JobCardProps) {
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const [isBeforeAfterLightboxOpen, setIsBeforeAfterLightboxOpen] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAssigned = Boolean(job.workerName);

  const toggleVoicePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!job.voiceNoteAudioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(job.voiceNoteAudioUrl);
      audioRef.current.onended = () => setIsPlayingVoice(false);
      audioRef.current.onerror = () => setIsPlayingVoice(false);
    }

    if (isPlayingVoice) {
      audioRef.current.pause();
      setIsPlayingVoice(false);
    } else {
      audioRef.current.play().catch(() => setIsPlayingVoice(false));
      setIsPlayingVoice(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
        {/* Job Photo & Top Badges */}
        <div 
          onClick={() => job.photoUrl && setIsPhotoLightboxOpen(true)}
          className="relative aspect-16/9 bg-stone-100 overflow-hidden cursor-pointer group"
          title="Rasmni kattalashtirib ko'rish"
        >
          {job.photoUrl ? (
            <img 
              src={job.photoUrl} 
              alt={job.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-500 text-xs">
              Rasm yuklanmagan
            </div>
          )}

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          {/* Hover zoom indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <span className="px-3 py-1.5 rounded-xl bg-stone-900/80 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs shadow-md">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Rasmni ko'rish</span>
            </span>
          </div>

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-white bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg">
                {job.categoryLabel}
              </span>

              {job.photoUrl?.startsWith('data:') && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-950 bg-emerald-400 px-2 py-1 rounded-lg shadow-sm">
                  <Camera className="w-3 h-3 text-emerald-950" />
                  <span>Kameradan olingan</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {job.status === 'en_route' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-950 bg-emerald-400 px-2.5 py-1 rounded-lg shadow-md animate-pulse">
                  <Radio className="w-3 h-3" />
                  <span>GPS: {job.workerDistanceKm || 3.4} km qoldi</span>
                </span>
              )}

              {job.status === 'completed' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-emerald-600 px-2.5 py-1 rounded-lg shadow-md">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  <span>Bajarildi</span>
                </span>
              )}

              {job.urgent && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-950 bg-amber-400 px-2 py-0.5 rounded shadow-sm">
                  <Zap className="w-3 h-3 fill-amber-950" />
                  Shoshilinch
                </span>
              )}
            </div>
          </div>

          {/* Bottom overlay with Budget */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white pointer-events-none">
            <div>
              <div className="text-[11px] text-stone-200 uppercase font-medium">To'lov miqdori</div>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-300">
                {job.budgetUzs.toLocaleString()} so'm
                <span className="text-xs font-normal text-stone-200 ml-1">/{job.paymentType}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-stone-300 font-sans">{job.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base line-clamp-2 leading-snug">
              {job.title}
            </h3>

            <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
              {job.description}
            </p>

            {/* Employer Voice Note Audio Player */}
            {job.voiceNoteAudioUrl && (
              <div 
                onClick={toggleVoicePlayback}
                className="mt-2.5 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer hover:bg-amber-100/70 transition-colors shadow-2xs group"
                title="Ish beruvchining ovozli xabarini tinglash"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isPlayingVoice 
                      ? 'bg-amber-600 text-white animate-pulse' 
                      : 'bg-amber-500 text-stone-950 group-hover:scale-105'
                  }`}>
                    {isPlayingVoice ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>Ish beruvchining ovozi</span>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded">
                        {job.voiceDurationSeconds ? `${job.voiceDurationSeconds}s` : 'Audio'}
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-700">
                      {isPlayingVoice ? "Eshittirilmoqda..." : "Bosib tinglash (yozish o'rniga)"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 pr-1 text-amber-600">
                  <Volume2 className={`w-4 h-4 ${isPlayingVoice ? 'animate-bounce' : ''}`} />
                </div>
              </div>
            )}
          </div>

          {/* Employer & Location Details */}
          <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
            {/* Employer Profile Strip */}
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-stone-50 hover:bg-stone-100/80 transition-colors rounded-xl border border-stone-200/70">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmployerProfile?.(job.employerName);
                }}
                className="flex items-center gap-2 text-left group min-w-0"
                title="Ish beruvchi profili va baholarini ko'rish"
              >
                <img 
                  src={job.employerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg'} 
                  alt={job.employerName} 
                  className="w-6 h-6 rounded-full object-cover border border-amber-400 shrink-0"
                />
                <div className="truncate">
                  <div className="font-bold text-stone-900 text-xs group-hover:text-amber-800 truncate flex items-center gap-1">
                    <span>{job.employerName}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-1 rounded">Mijoz 🏠</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmployerProfile?.(job.employerName);
                }}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 shrink-0 ml-1"
                title="Mijoz reytingi va sharhlarini ko'rish"
              >
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Reyting & Sharhlar</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{job.locationAddress}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              {job.mealProvided && (
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  <Utensils className="w-3 h-3" />
                  Tushlik bor
                </span>
              )}
              {job.toolsProvided && (
                <span className="flex items-center gap-1 text-stone-700 bg-stone-100 px-2 py-0.5 rounded font-medium">
                  <Wrench className="w-3 h-3" />
                  Asbob beriladi
                </span>
              )}
            </div>
          </div>

          {/* Assigned Worker Info with GPS Distance telemetry */}
          {isAssigned && (
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => job.workerId && onOpenWorkerProfile?.(job.workerId)}
                  className="flex items-center gap-2 truncate text-left group"
                  title="Usta profilini ko'rish"
                >
                  <img 
                    src={job.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg'} 
                    alt={job.workerName} 
                    className="w-7 h-7 rounded-full object-cover border border-amber-400 shrink-0"
                  />
                  <div className="truncate">
                    <div className="font-bold text-stone-900 group-hover:text-amber-800 truncate flex items-center gap-1">
                      <span>{job.workerName}</span>
                      <span className="text-[10px] text-stone-400 font-normal">profil</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {job.status === 'en_route' ? "Yo'lda kelmoqda" : 
                       job.status === 'arrived' ? "Yetib keldi 📍" : 
                       job.status === 'in_progress' ? "Ish boshlandi 🛠️" : "Yakunlandi ✅"}
                    </div>
                  </div>
                </button>

                {job.status === 'en_route' && (
                  <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                    ETA: {job.workerEtaMinutes || 12} daq
                  </span>
                )}
              </div>

              {job.status === 'en_route' && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200/70 text-emerald-800 font-semibold">
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Qolgan masofa:</span>
                  </div>
                  <span className="font-mono font-bold">{job.workerDistanceKm || 3.4} km</span>
                </div>
              )}
            </div>
          )}

          {/* Completed Job Before / After Work Result Display */}
          {job.status === 'completed' && job.beforePhotoUrl && job.afterPhotoUrl && (
            <div className="pt-2 border-t border-stone-100">
              <BeforeAfterViewer
                beforePhotoUrl={job.beforePhotoUrl}
                afterPhotoUrl={job.afterPhotoUrl}
                jobTitle={job.title}
                workerName={job.workerName}
                compact={true}
                onOpenLightbox={() => setIsBeforeAfterLightboxOpen(true)}
              />

              {job.completionNote && (
                <div className="mt-2 p-2 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 flex items-start gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="italic leading-snug">{job.completionNote}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-2 flex flex-col gap-2">
            {/* Worker direct completion trigger */}
            {currentRole === 'worker' && onOpenCompleteModal && job.status !== 'completed' && job.status !== 'open' && (
              <button
                type="button"
                onClick={() => onOpenCompleteModal(job)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ishni yakunlash & Fotosuratlar yuklash</span>
              </button>
            )}

            {/* Before/After Lightbox button for completed jobs */}
            {job.status === 'completed' && job.beforePhotoUrl && job.afterPhotoUrl && (
              <button
                type="button"
                onClick={() => setIsBeforeAfterLightboxOpen(true)}
                className="w-full py-2 px-3 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-amber-400 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 border border-stone-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Oldin & Keyin taqqoslash (Katta ekran)</span>
              </button>
            )}

            {/* Proposals on this job order */}
            {job.proposals && job.proposals.length > 0 && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kelgan takliflar ({job.proposals.length} ta)</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold bg-amber-200/70 px-2 py-0.5 rounded-full">
                    Faol takliflar
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {job.proposals.map((prop) => (
                    <div 
                      key={prop.id}
                      className="p-2 bg-white rounded-lg border border-amber-200/80 shadow-2xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {prop.workerAvatar && (
                            <img 
                              src={prop.workerAvatar} 
                              alt={prop.workerName} 
                              className="w-5 h-5 rounded-full object-cover border border-stone-200 shrink-0" 
                            />
                          )}
                          <span className="font-bold text-stone-900 truncate">{prop.workerName}</span>
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1 rounded shrink-0">
                            {prop.workerRating}★
                          </span>
                        </div>
                        <span className="font-mono font-bold text-amber-700 text-xs shrink-0">
                          {prop.proposedPriceUzs.toLocaleString()} so'm
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        "{prop.coverNote}"
                      </p>

                      <div className="flex items-center justify-between gap-1 pt-0.5 text-[10px]">
                        <span className="text-stone-400">Muddat: {prop.estimatedDuration}</span>
                        
                        {currentRole === 'employer' && job.status === 'open' && onAcceptProposal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAcceptProposal(job, prop);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Qabul qilish</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.status === 'open' ? (
              <div className="space-y-1.5">
                <button
                  onClick={() => onAcceptJob(job)}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Zakazni qabul qilish ({job.budgetUzs.toLocaleString()} so'm)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {currentRole === 'worker' && onOpenSubmitProposal && (
                  <button
                    type="button"
                    onClick={() => onOpenSubmitProposal(job)}
                    className="w-full py-2 px-3 bg-amber-100/90 hover:bg-amber-200 text-stone-900 text-xs font-bold rounded-xl transition-colors border border-amber-300 flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>O'z narxingizni taklif qilish (Bid / Narx taklifi)</span>
                  </button>
                )}
              </div>
            ) : job.status === 'completed' ? (
              <div className="space-y-2">
                {/* Bidirectional Rating Statuses */}
                <div className="space-y-1.5">
                  {/* 1. Client's Rating for Worker */}
                  {job.reviewLeft ? (
                    <div className="p-2 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs flex items-center justify-between text-amber-950">
                      <span className="flex items-center gap-1 font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        Ustaga baho: {job.ratingGiven}★
                      </span>
                      <span className="text-[11px] text-stone-600 truncate max-w-[160px] italic">
                        "{job.reviewComment}"
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal?.(job, 'worker')}
                      className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Star className="w-4 h-4 fill-stone-950" />
                      <span>Ustani baholash va sharh qoldirish ⭐</span>
                    </button>
                  )}

                  {/* 2. Worker's Rating for Client */}
                  {job.workerReviewLeft ? (
                    <div className="p-2 bg-emerald-50/90 border border-emerald-200/90 rounded-xl text-xs flex items-center justify-between text-emerald-950">
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <Star className="w-3.5 h-3.5 fill-emerald-500" />
                        Mijozga baho: {job.workerRatingGiven}★
                      </span>
                      <span className="text-[11px] text-stone-600 truncate max-w-[160px] italic">
                        "{job.workerReviewComment}"
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal?.(job, 'employer')}
                      className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors border border-stone-200 flex items-center justify-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>Buyurtmachi (Mijoz)ni baholash ⭐</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenLiveTracking(job)}
                  className="w-full py-1 text-stone-500 hover:text-stone-800 text-[11px] font-medium text-center"
                >
                  Kelishuv cheki & tafsilotlar
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenLiveTracking(job)}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Ustaning yo'lini xaritada kuzatish</span>
              </button>
            )}

            {/* Direct Job Chat Button */}
            {onOpenChat && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(job);
                }}
                className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-stone-200 hover:border-stone-300"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {job.workerName 
                    ? `${job.workerName.split(' ')[0]} bilan chat` 
                    : "Muloqot / Xabar yozish"}
                </span>
                {job.chatMessages && job.chatMessages.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-stone-950 ml-1">
                    {job.chatMessages.length}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Lightbox Modal for Full-Resolution Work Photo */}
      {isPhotoLightboxOpen && job.photoUrl && (
        <div 
          onClick={() => setIsPhotoLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[92vh]"
          >
            {/* Top header */}
            <div className="flex items-center justify-between p-3.5 bg-stone-950 text-white border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-stone-950">
                  {job.categoryLabel}
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                  {job.title}
                </h4>
              </div>
              <button
                onClick={() => setIsPhotoLightboxOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo View */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden p-2">
              <img 
                src={job.photoUrl} 
                alt={job.title} 
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Bottom details */}
            <div className="p-3 bg-stone-950 border-t border-stone-800 text-stone-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{job.locationAddress}</span>
              </div>
              <div className="font-mono tabular-nums text-amber-400 font-bold">
                Byudjet: {job.budgetUzs.toLocaleString()} so'm
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Before/After Comparison Lightbox Modal */}
      {isBeforeAfterLightboxOpen && job.beforePhotoUrl && job.afterPhotoUrl && (
        <div 
          onClick={() => setIsBeforeAfterLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[94vh]"
          >
            <div className="flex items-center justify-between p-4 bg-stone-950 text-white border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bajarilgan ish natijasi
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                  {job.title}
                </h4>
              </div>
              <button
                onClick={() => setIsBeforeAfterLightboxOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-950">
              <BeforeAfterViewer
                beforePhotoUrl={job.beforePhotoUrl}
                afterPhotoUrl={job.afterPhotoUrl}
                jobTitle={job.title}
                workerName={job.workerName}
                compact={false}
              />

              {job.completionNote && (
                <div className="p-3.5 bg-stone-900/90 border border-stone-800 rounded-xl text-xs text-stone-200">
                  <div className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Usta hisoboti va bajarilgan ish tavsifi:</span>
                  </div>
                  <p className="italic leading-relaxed">"{job.completionNote}"</p>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-stone-950 border-t border-stone-800 text-stone-300 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                {job.workerName && (
                  <span className="font-semibold text-white">Usta: {job.workerName}</span>
                )}
                <span>·</span>
                <span className="truncate max-w-xs">{job.locationAddress}</span>
              </div>
              <div className="font-mono tabular-nums text-amber-400 font-bold">
                Byudjet: {job.budgetUzs.toLocaleString()} so'm ({job.paymentType})
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
