import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Phone, MapPin, Mic, Volume2, Play, Pause, 
  Search, CheckCheck, Clock, User, HardHat, Sparkles, 
  CheckCircle2, DollarSign, ArrowLeft, MessageSquare, 
  FileText, ShieldCheck, Star, Navigation, AlertCircle
} from 'lucide-react';
import { MessengerConversation, MessengerMessage, WorkerProfile, JobOrder, Coordinates } from '../types';
import { playNotificationSound, createSampleVoiceNoteAudioUrl } from '../utils/sound';

interface MessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: MessengerConversation[];
  activeConversationId?: string;
  onSelectConversation: (convId: string) => void;
  onSendMessage: (conversationId: string, text: string, options?: {
    voiceAudioUrl?: string;
    voiceDurationSeconds?: number;
    isLocationShare?: boolean;
    locationCoords?: Coordinates;
    locationAddress?: string;
    proposalOffer?: {
      jobId: string;
      jobTitle: string;
      amountUzs: number;
      duration?: string;
      status: 'pending' | 'accepted' | 'rejected';
    };
  }) => void;
  onAcceptProposal?: (jobId: string, proposalAmount: number, workerId: string) => void;
  currentRole: 'employer' | 'worker';
  availableWorkers: WorkerProfile[];
  onStartNewConversation: (worker: WorkerProfile) => void;
}

export function MessengerModal({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onAcceptProposal,
  currentRole,
  availableWorkers,
  onStartNewConversation
}: MessengerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'workers' | 'unread'>('all');
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);
  const [proposalAmount, setProposalAmount] = useState('500000');
  const [proposalDuration, setProposalDuration] = useState('1 kun');
  const [isNewChatPickerOpen, setIsNewChatPickerOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Auto-switch mobile pane when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      setMobilePane('chat');
    }
  }, [activeConversationId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (mobilePane === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages, mobilePane]);

  if (!isOpen) return null;

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.partnerSpecialty && conv.partnerSpecialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (conv.relatedJobTitle && conv.relatedJobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'workers') {
      return conv.partnerRole === 'worker';
    }
    if (filterTab === 'unread') {
      return conv.unreadCount > 0;
    }
    return true;
  });

  const handleSend = () => {
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick chips templates
  const quickChips = currentRole === 'employer' ? [
    "Assalomu alaykum!",
    "Qachon boshlay olasiz?",
    "Manzilga kelib ko'ra olasizmi?",
    "Narxini kelishaylik",
    "Lokatsiyani yubordim 📍"
  ] : [
    "Assalomu alaykum!",
    "Bugun boshlay olaman",
    "Asboblarim tayyor",
    "Manzilga yo'lga chiqdim 🚗",
    "Kelishdik, albatta boraman"
  ];

  const handleSendVoiceNote = () => {
    if (!activeConv) return;
    setIsRecordingVoice(true);
    setRecordingSeconds(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(s => s + 1);
    }, 1000);

    // Auto complete simulated voice note after 3 seconds
    setTimeout(() => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsRecordingVoice(false);
      const fakeVoiceUrl = createSampleVoiceNoteAudioUrl(5);
      onSendMessage(activeConv.id, "🎤 Ovozli xabar (0:05)", {
        voiceAudioUrl: fakeVoiceUrl,
        voiceDurationSeconds: 5
      });
      playNotificationSound('default');
    }, 3000);
  };

  const handleShareCurrentLocation = () => {
    if (!activeConv) return;
    onSendMessage(activeConv.id, "📍 Samarkanddagi aniq ish joylashuvi yuborildi", {
      isLocationShare: true,
      locationCoords: { lat: 39.6542, lng: 66.9597 },
      locationAddress: "Samarqand shahri, Registon maydoni yaqinida"
    });
  };

  const handleSendProposalOffer = () => {
    if (!activeConv || !proposalAmount) return;
    const amount = parseInt(proposalAmount.replace(/\D/g, ''), 10) || 450000;
    onSendMessage(activeConv.id, `💼 Narx taklifi: ${amount.toLocaleString()} so'm (${proposalDuration})`, {
      proposalOffer: {
        jobId: activeConv.relatedJobId || 'job-custom',
        jobTitle: activeConv.relatedJobTitle || "Kelishilgan ustachilik xizmati",
        amountUzs: amount,
        duration: proposalDuration,
        status: 'pending'
      }
    });
    setIsProposalFormOpen(false);
  };

  const handlePlayVoice = (msgId: string, url?: string) => {
    if (!url) return;
    if (playingVoiceId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingVoiceId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    audioPlayerRef.current = new Audio(url);
    audioPlayerRef.current.play().then(() => {
      setPlayingVoiceId(msgId);
    }).catch(() => {
      setPlayingVoiceId(null);
    });

    audioPlayerRef.current.onended = () => {
      setPlayingVoiceId(null);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[94vh] sm:h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 py-3 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  HalolMehnat Messenjer
                </h3>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Jonli aloqa
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Ishchilar, ustalar va mijozlar o'rtasida to'g'ridan-to'g'ri xavfsiz muloqot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewChatPickerOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors shadow-sm"
              title="Katalogdagi istalgan usta yoki buyurtmachiga xabar yozish"
            >
              <span>+ Yangi suhbat</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Conversations List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-stone-200 bg-stone-50 flex flex-col shrink-0 ${
            mobilePane === 'chat' ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Search & Filter Bar */}
            <div className="p-3 border-b border-stone-200 bg-white space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Usta, buyurtma yoki xabarlarni qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-100 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`flex-1 py-1 rounded-lg transition-colors text-center ${
                    filterTab === 'all' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Barchasi ({conversations.length})
                </button>
                <button
                  onClick={() => setFilterTab('workers')}
                  className={`flex-1 py-1 rounded-lg transition-colors text-center ${
                    filterTab === 'workers' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Ustalar
                </button>
                <button
                  onClick={() => setFilterTab('unread')}
                  className={`flex-1 py-1 rounded-lg transition-colors text-center ${
                    filterTab === 'unread' ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  O'qilmagan
                </button>
              </div>
            </div>

            {/* Conversation Threads */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-200/70 p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-700">Suhbat topilmadi</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Usta yoki buyurtmachi bilan suhbatni boshlash uchun quyidagi tugmani bosing.
                  </p>
                  <button
                    onClick={() => setIsNewChatPickerOpen(true)}
                    className="mt-3 px-3 py-1.5 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl shadow-2xs"
                  >
                    + Yangi suhbat
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConv?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        setMobilePane('chat');
                      }}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected 
                          ? 'bg-amber-100/70 border border-amber-300/80 shadow-2xs' 
                          : 'bg-white hover:bg-stone-100/90 border border-transparent'
                      }`}
                    >
                      {/* Avatar with Online badge */}
                      <div className="relative shrink-0">
                        <img 
                          src={conv.partnerAvatar} 
                          alt={conv.partnerName} 
                          className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                        />
                        {conv.isOnline && (
                          <span 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" 
                            title="Onlayn"
                          />
                        )}
                      </div>

                      {/* Info & Last message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {conv.partnerName}
                          </h4>
                          <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                            {conv.lastMessageTime}
                          </span>
                        </div>

                        {conv.partnerSpecialty && (
                          <p className="text-[10px] text-amber-700 font-semibold truncate">
                            {conv.partnerSpecialty}
                          </p>
                        )}

                        <p className={`text-xs mt-0.5 truncate ${
                          conv.unreadCount > 0 ? 'font-bold text-stone-900' : 'text-stone-500'
                        }`}>
                          {conv.lastMessage}
                        </p>

                        {/* Extra indicators */}
                        <div className="mt-1 flex items-center justify-between gap-1">
                          {conv.relatedJobTitle ? (
                            <span className="text-[9px] font-medium bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded truncate max-w-[170px]">
                              📋 {conv.relatedJobTitle}
                            </span>
                          ) : <span />}

                          {conv.unreadCount > 0 && (
                            <span className="min-w-[18px] h-[18px] rounded-full bg-amber-500 text-stone-950 font-black text-[10px] flex items-center justify-center px-1 shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile bottom new chat button */}
            <div className="p-2 border-t border-stone-200 bg-white sm:hidden">
              <button
                onClick={() => setIsNewChatPickerOpen(true)}
                className="w-full py-2 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>+ Yangi suhbat boshlash</span>
              </button>
            </div>
          </div>

          {/* Right Column: Active Conversation Stream */}
          {activeConv ? (
            <div className={`flex-1 flex flex-col bg-stone-50 ${
              mobilePane === 'list' ? 'hidden md:flex' : 'flex'
            }`}>
              
              {/* Active Chat Header */}
              <div className="px-4 py-3 bg-white border-b border-stone-200 flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setMobilePane('list')}
                    className="md:hidden p-1.5 -ml-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                    aria-label="Orqaga"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <img 
                      src={activeConv.partnerAvatar} 
                      alt={activeConv.partnerName} 
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                    />
                    {activeConv.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-900 truncate">
                        {activeConv.partnerName}
                      </h4>
                      {activeConv.partnerRating && (
                        <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {activeConv.partnerRating}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-stone-500 truncate">
                      <span>{activeConv.partnerSpecialty || "Foydalanuvchi"}</span>
                      <span>·</span>
                      <span className={activeConv.isOnline ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                        {activeConv.isOnline ? 'Onlayn 🟢' : 'Yaqinda chiqqan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${activeConv.partnerPhone}`}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="To'g'ridan-to'g'ri qo'ng'iroq qilish"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Qo'ng'iroq:</span>
                    <span className="font-mono">{activeConv.partnerPhone}</span>
                  </a>

                  <button
                    onClick={() => setIsProposalFormOpen(!isProposalFormOpen)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                    title="Narx taklif qilish yoki o'zgartirish"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Narx taklifi</span>
                  </button>
                </div>
              </div>

              {/* Related Job Banner if any */}
              {activeConv.relatedJobTitle && (
                <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/60 text-xs flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-stone-600">Bog'langan buyurtma:</span>
                    <span className="font-bold text-stone-900 truncate">
                      {activeConv.relatedJobTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
                    Faol buyurtma
                  </span>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConv.messages.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-stone-800">Suhbatni boshlang!</p>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                      Quyidagi tayyor tezkor so'zlarni bosing yoki xabar yozib jo'nating.
                    </p>
                  </div>
                ) : (
                  activeConv.messages.map((msg) => {
                    const isMe = msg.senderRole === currentRole || msg.senderId === 'current-user';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img 
                            src={msg.senderAvatar || activeConv.partnerAvatar} 
                            alt={msg.senderName} 
                            className="w-7 h-7 rounded-lg object-cover shrink-0 mt-1 border border-stone-200"
                          />
                        )}

                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xs space-y-2 ${
                          isMe 
                            ? 'bg-stone-900 text-white rounded-tr-none' 
                            : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-none'
                        }`}>
                          {/* Sender name for group clarity */}
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                            <span className="font-bold">{msg.senderName}</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </div>

                          {/* Text body */}
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                          </p>

                          {/* Voice Note player card */}
                          {msg.voiceAudioUrl && (
                            <div className={`p-2.5 rounded-xl border flex items-center gap-3 ${
                              isMe ? 'bg-stone-800/90 border-stone-700' : 'bg-stone-50 border-stone-200'
                            }`}>
                              <button
                                onClick={() => handlePlayVoice(msg.id, msg.voiceAudioUrl)}
                                className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                              >
                                {playingVoiceId === msg.id ? (
                                  <Pause className="w-4 h-4 fill-stone-950" />
                                ) : (
                                  <Play className="w-4 h-4 fill-stone-950 ml-0.5" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                  <span>Ovozli xabar</span>
                                  <span>0:{msg.voiceDurationSeconds || '05'}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {[40, 75, 55, 90, 65, 30, 80, 50, 95, 45, 70].map((h, i) => (
                                    <div
                                      key={i}
                                      style={{ height: `${h * 0.2}px` }}
                                      className={`w-1 rounded-full ${
                                        playingVoiceId === msg.id ? 'bg-amber-400 animate-pulse' : (isMe ? 'bg-stone-600' : 'bg-stone-300')
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Shared Location Card */}
                          {msg.isLocationShare && (
                            <div className={`p-2.5 rounded-xl border space-y-1.5 ${
                              isMe ? 'bg-stone-800 border-stone-700' : 'bg-amber-50/80 border-amber-200'
                            }`}>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span>GPS Manzil ulashildi</span>
                              </div>
                              <p className="text-[11px] opacity-90">
                                {msg.locationAddress || "Samarqand shahri, Registon maydoni"}
                              </p>
                              {msg.locationCoords && (
                                <a
                                  href={`https://maps.google.com/?q=${msg.locationCoords.lat},${msg.locationCoords.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:underline pt-0.5"
                                >
                                  <span>Google Maps xaritasida ochish</span>
                                  <Navigation className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Proposal Offer Card */}
                          {msg.proposalOffer && (
                            <div className={`p-3 rounded-xl border space-y-2 ${
                              isMe ? 'bg-amber-950/40 border-amber-600/40' : 'bg-amber-50 border-amber-300'
                            }`}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  Narx taklifi / Kelishuv
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  msg.proposalOffer.status === 'accepted' 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-amber-500 text-stone-950'
                                }`}>
                                  {msg.proposalOffer.status === 'accepted' ? 'Qabul qilingan' : 'Kutilmoqda'}
                                </span>
                              </div>

                              <div className="flex items-baseline justify-between">
                                <div className="font-mono text-base sm:text-lg font-black text-amber-400">
                                  {msg.proposalOffer.amountUzs.toLocaleString()} so'm
                                </div>
                                {msg.proposalOffer.duration && (
                                  <span className="text-xs text-stone-400 font-medium">
                                    Muddat: {msg.proposalOffer.duration}
                                  </span>
                                )}
                              </div>

                              {/* Action button inside message */}
                              {msg.proposalOffer.status === 'pending' && onAcceptProposal && !isMe && (
                                <button
                                  onClick={() => onAcceptProposal(
                                    msg.proposalOffer?.jobId || 'job-custom',
                                    msg.proposalOffer?.amountUzs || 450000,
                                    activeConv.partnerId
                                  )}
                                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Ushbu taklifni qabul qilish</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Proposal Offer Input Drawer if open */}
              {isProposalFormOpen && (
                <div className="p-3 bg-amber-50 border-t border-amber-200 animate-in slide-in-from-bottom duration-150 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      Yangi narx taklifi (Bid / Offer) yuborish
                    </span>
                    <button 
                      onClick={() => setIsProposalFormOpen(false)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-stone-600 block mb-1">
                        Taklif narxi (so'mda):
                      </label>
                      <input
                        type="text"
                        value={proposalAmount}
                        onChange={(e) => setProposalAmount(e.target.value)}
                        placeholder="Masalan: 450000"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-mono font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-600 block mb-1">
                        Taxminiy muddat:
                      </label>
                      <input
                        type="text"
                        value={proposalDuration}
                        onChange={(e) => setProposalDuration(e.target.value)}
                        placeholder="Masalan: 2 kun yoki bugun"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsProposalFormOpen(false)}
                      className="px-3 py-1 text-xs text-stone-600 hover:text-stone-800"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleSendProposalOffer}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg shadow-sm"
                    >
                      Taklifni chatda jo'natish
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Reply Chips Bar */}
              <div className="px-3 py-2 bg-stone-100/90 border-t border-stone-200 overflow-x-auto whitespace-nowrap flex items-center gap-1.5 no-scrollbar shrink-0">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
                  Tezkor:
                </span>
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSendMessage(activeConv.id, chip);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-amber-100 hover:border-amber-300 text-stone-700 hover:text-amber-950 text-[11px] font-medium border border-stone-200 transition-colors shrink-0 shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-stone-200 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Share GPS Location Button */}
                  <button
                    onClick={handleShareCurrentLocation}
                    className="p-2 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-stone-200"
                    title="Samarkand ish joylashuvini jo'natish"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>

                  {/* Voice note record button */}
                  <button
                    onClick={handleSendVoiceNote}
                    disabled={isRecordingVoice}
                    className={`p-2 rounded-xl transition-colors border ${
                      isRecordingVoice 
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                        : 'text-stone-500 hover:text-amber-600 hover:bg-amber-50 border-stone-200'
                    }`}
                    title={isRecordingVoice ? `Yozilmoqda... (${recordingSeconds}s)` : "Ovozli xabar yuborish (3s)"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={isRecordingVoice ? `Ovoz yozilmoqda... (${recordingSeconds}s)` : "Xabar yozing... (Enter bosish)"}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isRecordingVoice}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-transform active:scale-95 shadow-sm flex items-center justify-center shrink-0"
                    aria-label="Xabarni yuborish"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-stone-50">
              <MessageSquare className="w-12 h-12 text-stone-300 mb-3" />
              <h4 className="text-base font-bold text-stone-800">Suhbat tanlang</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Chap tomondagi ro'yxatdan usta yoki buyurtmachi bilan suhbatni tanlang, yoki yangi muloqot boshlang.
              </p>
            </div>
          )}

        </div>

        {/* Modal for Starting a New Chat with any Worker from Catalog */}
        {isNewChatPickerOpen && (
          <div className="absolute inset-0 z-20 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Yangi suhbat boshlash</h4>
                  <p className="text-xs text-stone-400">Katalogdagi ustani tanlang</p>
                </div>
                <button
                  onClick={() => setIsNewChatPickerOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-stone-100">
                {availableWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    onClick={() => {
                      onStartNewConversation(worker);
                      setIsNewChatPickerOpen(false);
                      setMobilePane('chat');
                    }}
                    className="pt-2 first:pt-0 flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={worker.avatarUrl} 
                        alt={worker.name} 
                        className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-stone-900 truncate">
                            {worker.name}
                          </h5>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                            {worker.rating}★
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {worker.roleTitle} · {worker.district}
                        </p>
                      </div>
                    </div>

                    <button className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg shadow-2xs shrink-0">
                      Yozish
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
