import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Phone, MapPin, CheckCheck, Clock, 
  MessageSquare, User, HardHat, ShieldCheck, Sparkles, 
  Smile, RefreshCw, Paperclip, Mic, MicOff, Volume2, Play, Pause, Navigation
} from 'lucide-react';
import { JobOrder, ChatMessage } from '../types';
import { createSampleVoiceNoteAudioUrl, playNotificationSound } from '../utils/sound';

interface JobChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobOrder;
  currentRole: 'employer' | 'worker';
  onSendMessage: (
    jobId: string, 
    text: string, 
    senderRole: 'employer' | 'worker',
    extra?: {
      voiceAudioUrl?: string;
      voiceDurationSeconds?: number;
      isLocationShare?: boolean;
      locationCoords?: { lat: number; lng: number };
    }
  ) => void;
  onToggleRole?: () => void;
  onOpenPartnerProfile?: (role: 'employer' | 'worker', idOrName: string) => void;
}

const QUICK_PROMPTS_EMPLOYER = [
  "Assalomu alaykum! Buyurtma bo'yicha gaplashsak degandim.",
  "Qachon yetib kela olasiz?",
  "Darvoza oldidaman, eshik ochiq.",
  "Manzilimizni topishda qiynalmadingizmi?",
  "Barcha kerakli materiallar tayyor turibdi.",
  "Iltimos, yetib kelgach telefon qilib yuboring."
];

const QUICK_PROMPTS_WORKER = [
  "Assalomu alaykum! Zakazni qabul qildim, yo'ldaman.",
  "Taxminan 10-15 daqiqada yetib boraman.",
  "Asboblarim va uskunalarim yonimda tayyor.",
  "Manzilga yetib keldim, darvoza oldidaman.",
  "Hammasi tushunarli, aytilgan vaqtda boshlaymiz."
];

export function JobChatModal({
  isOpen,
  onClose,
  job,
  currentRole: initialCurrentRole,
  onSendMessage,
  onOpenPartnerProfile
}: JobChatModalProps) {
  const [activeRole, setActiveRole] = useState<'employer' | 'worker'>(initialCurrentRole);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Sync role when prop changes
  useEffect(() => {
    setActiveRole(initialCurrentRole);
  }, [initialCurrentRole]);

  // Messages for this specific job
  const messages = job.chatMessages || [];

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Voice recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  if (!isOpen) return null;

  const partnerRole = activeRole === 'employer' ? 'worker' : 'employer';
  const partnerName = activeRole === 'employer' 
    ? (job.workerName || "Usta / Ishchi") 
    : (job.employerName || "Ish beruvchi");
  const partnerPhone = activeRole === 'employer' ? job.workerPhone : job.employerPhone;
  const partnerAvatar = activeRole === 'employer'
    ? (job.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg')
    : (job.employerAvatar || '/src/assets/images/woman_craft_cleaner_portrait_1791277307525.jpg');

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    onSendMessage(job.id, text, activeRole);
    setInputText('');

    // Trigger typing simulation indicator for 1.2 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1300);
  };

  const handleSendLocation = () => {
    const locText = `📍 Joylashuv ulashildi: ${job.locationAddress}`;
    onSendMessage(job.id, locText, activeRole, {
      isLocationShare: true,
      locationCoords: job.targetCoords
    });
    playNotificationSound('message');
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    const duration = Math.max(2, recordingSeconds || 3);
    const sampleAudioUrl = createSampleVoiceNoteAudioUrl(duration);
    
    onSendMessage(job.id, `🎙️ Ovozli xabar (${duration} soniya)`, activeRole, {
      voiceAudioUrl: sampleAudioUrl,
      voiceDurationSeconds: duration
    });
    playNotificationSound('message');
  };

  const handleTogglePlayAudio = (msgId: string, url: string) => {
    if (playingAudioId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(url);
    } else {
      audioPlayerRef.current.src = url;
    }

    setPlayingAudioId(msgId);
    audioPlayerRef.current.play().catch(() => setPlayingAudioId(null));
    audioPlayerRef.current.onended = () => setPlayingAudioId(null);
    audioPlayerRef.current.onerror = () => setPlayingAudioId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = activeRole === 'employer' ? QUICK_PROMPTS_EMPLOYER : QUICK_PROMPTS_WORKER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col h-[90vh] max-h-[720px] animate-fadeIn">
        
        {/* Header */}
        <div className="px-4 py-3 bg-stone-900 text-white flex items-center justify-between gap-3 shrink-0">
          
          <div 
            onClick={() => onOpenPartnerProfile?.(partnerRole, partnerRole === 'worker' ? (job.workerId || '') : job.employerName)}
            className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
            title={`${partnerName} profilini va baholarini ko'rish`}
          >
            <div className="relative shrink-0">
              <img 
                src={partnerAvatar} 
                alt={partnerName} 
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white truncate hover:text-amber-400 transition-colors">
                  {partnerName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {partnerRole === 'worker' ? '🔨 Usta' : '🏠 Ish beruvchi'}
                </span>
              </div>
              
              <p className="text-[11px] text-stone-300 truncate max-w-xs">
                {job.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct Phone Call button */}
            {partnerPhone && (
              <a
                href={`tel:${partnerPhone}`}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors shadow-sm flex items-center gap-1 text-xs font-bold"
                title="To'g'ridan-to'g'ri qo'ng'iroq qilish"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Qo'ng'iroq</span>
              </a>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl transition-colors"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Perspective / Role Switcher Bar */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="text-stone-500">Sizning rolingiz:</span>
            <span className="font-bold text-stone-900">
              {activeRole === 'employer' ? '🏠 Ish beruvchi (Mijoz)' : '🔨 Usta / Ishchi'}
            </span>
          </div>

          <button
            onClick={() => setActiveRole(prev => prev === 'employer' ? 'worker' : 'employer')}
            className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-stone-900 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
            title="Suhbatdosh rolini sinash uchun almashtirish"
          >
            <RefreshCw className="w-3 h-3 text-stone-700" />
            <span>Rolni almashtirish ({activeRole === 'employer' ? "Usta bo'lish" : "Mijoz bo'lish"})</span>
          </button>
        </div>

        {/* Job Details Strip with quick status badge */}
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 text-xs flex items-center justify-between text-stone-600 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{job.locationAddress}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="font-mono font-bold text-emerald-800">
              {job.budgetUzs.toLocaleString()} so'm
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
              {job.status === 'en_route' ? "Yo'lda" : job.status === 'arrived' ? "Yetib keldi" : "Faol"}
            </span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-100/50">
          
          {/* Security Notice */}
          <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-center text-[11px] text-stone-500 shadow-2xs space-y-0.5">
            <div className="flex items-center justify-center gap-1 font-bold text-stone-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>HalolMehnat Jonli Chat — Ish beruvchi va Usta o'rtasida</span>
            </div>
            <p className="text-[10px] text-stone-400">
              Kafolatlangan xavfsiz muloqot. Har ikkala tomon real vaqtda xabar almashishi mumkin.
            </p>
          </div>

          {/* Empty Conversation State */}
          {messages.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-sm">
                  Muloqotni boshlang!
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mt-0.5">
                  Yetib borish vaqti, darvoza yoki kerakli asboblar haqida xabar yozing.
                </p>
              </div>
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg) => {
            const isMe = msg.senderRole === activeRole;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={msg.senderAvatar || partnerAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0 mb-1"
                  />
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Name */}
                  <span className={`text-[10px] font-semibold text-stone-400 block px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {isMe ? "Siz" : msg.senderName}
                  </span>

                  {/* Bubble Content */}
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-amber-500 text-stone-950 font-medium rounded-br-xs'
                        : 'bg-white text-stone-900 border border-stone-200 rounded-bl-xs'
                    }`}
                  >
                    {/* Audio Note player if voice */}
                    {msg.voiceAudioUrl ? (
                      <div className="space-y-1.5 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePlayAudio(msg.id, msg.voiceAudioUrl!)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              playingAudioId === msg.id 
                                ? 'bg-stone-950 text-white animate-pulse' 
                                : 'bg-white text-stone-900 shadow-sm hover:scale-105'
                            }`}
                          >
                            {playingAudioId === msg.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="text-xs font-bold flex items-center gap-1">
                              <span>Ovozli xabar</span>
                              <span className="text-[10px] opacity-75 font-mono">({msg.voiceDurationSeconds || 3}s)</span>
                            </div>
                            <div className="h-1.5 w-full bg-stone-950/20 rounded-full overflow-hidden mt-1">
                              <div className={`h-full bg-stone-950 rounded-full ${playingAudioId === msg.id ? 'w-full transition-all duration-3000' : 'w-1/3'}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : msg.isLocationShare ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Navigation className="w-4 h-4 text-emerald-800 animate-pulse" />
                          <span>Jonli Joylashuv Koordinatasi</span>
                        </div>
                        <p className="text-xs font-medium">{msg.text}</p>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    )}
                    
                    <div className={`flex items-center gap-1 justify-end text-[10px] mt-1 ${
                      isMe ? 'text-amber-950/70' : 'text-stone-400'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-amber-950" />}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-stone-500 text-xs animate-pulse pl-9">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] text-stone-400">{partnerName} yozmoqda...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-3 py-2 bg-white border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            Tezkor:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-stone-900 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 border border-stone-200 hover:border-amber-300"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Recording active bar */}
        {isRecordingVoice && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-900 flex items-center justify-between text-xs font-bold animate-pulse shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span>Ovoz yozilmoqda... {recordingSeconds} soniya</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecordingVoice(false)}
                className="px-2 py-1 text-stone-600 hover:text-stone-900 text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Yuborish</span>
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            
            {/* Share Location button */}
            <button
              type="button"
              onClick={handleSendLocation}
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-emerald-700 transition-colors shrink-0"
              title="Joylashuvni yuborish"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Voice record button */}
            <button
              type="button"
              onClick={() => {
                if (isRecordingVoice) {
                  handleSendVoiceNote();
                } else {
                  setIsRecordingVoice(true);
                }
              }}
              className={`p-2.5 rounded-2xl transition-all shrink-0 ${
                isRecordingVoice 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
              title="Ovozli xabar yuborish"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${partnerName}ga xabar yozing...`}
              className="flex-1 px-4 py-2.5 bg-stone-100 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-200 text-stone-950 disabled:text-stone-400 rounded-2xl transition-all shadow-sm active:scale-95 disabled:active:scale-100 shrink-0 font-bold"
              aria-label="Yuborish"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
