import { useState, useEffect } from 'react';
import { 
  JobOrder, WorkerProfile, EmployerProfile, CommissionTransaction, 
  JobCategory, AppNotification, ChatMessage, MessengerConversation, JobProposal, Coordinates 
} from './types';
import { 
  INITIAL_JOBS, INITIAL_WORKERS, INITIAL_EMPLOYER_PROFILES, INITIAL_TRANSACTIONS, 
  INITIAL_NOTIFICATIONS, INITIAL_CONVERSATIONS, CATEGORIES_LIST, SAMARKAND_DISTRICTS 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { StudentZoneBanner } from './components/StudentZoneBanner';
import { WomenServicesBanner } from './components/WomenServicesBanner';
import { JobCard } from './components/JobCard';
import { WorkerCard } from './components/WorkerCard';
import { LiveTrackingRadar } from './components/LiveTrackingRadar';
import { CreateJobModal } from './components/CreateJobModal';
import { RegisterWorkerModal } from './components/RegisterWorkerModal';
import { WorkerProfileModal } from './components/WorkerProfileModal';
import { ProfileEditorModal } from './components/ProfileEditorModal';
import { EmployerProfileModal } from './components/EmployerProfileModal';
import { CommissionDashboardModal } from './components/CommissionDashboardModal';
import { TradesDirectoryModal } from './components/TradesDirectoryModal';
import { ReviewModal } from './components/ReviewModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import { NotificationHistoryModal } from './components/NotificationHistoryModal';
import { EasyStartGuide } from './components/EasyStartGuide';
import { QuickOrderModal } from './components/QuickOrderModal';
import { SharePlatformModal } from './components/SharePlatformModal';
import { CompletedJobsTrendChart } from './components/CompletedJobsTrendChart';
import { TopWorkersLeaderboard } from './components/TopWorkersLeaderboard';
import { JobChatModal } from './components/JobChatModal';
import { MessengerModal } from './components/MessengerModal';
import { SubmitProposalModal } from './components/SubmitProposalModal';
import { FAQModal } from './components/FAQModal';
import { CompleteJobModal } from './components/CompleteJobModal';
import { PerformanceMetricsModal } from './components/PerformanceMetricsModal';
import { playNotificationSound, speakUzbek } from './utils/sound';
import { 
  Search, Filter, PlusCircle, UserPlus, Navigation, 
  CheckCircle2, AlertCircle, HeartHandshake, ShieldCheck, 
  MapPin, Clock, ArrowRight, Zap, Phone, Calculator, Layers, Star, Sparkles, MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // State from LocalStorage or defaults
  const [jobs, setJobs] = useState<JobOrder[]>(() => {
    const saved = localStorage.getItem('halol_mehnat_jobs');
    if (!saved) return INITIAL_JOBS;
    try {
      let parsed: JobOrder[] = JSON.parse(saved);
      const hasCompleted = parsed.some(j => j.status === 'completed');
      if (!hasCompleted) {
        const initialCompleted = INITIAL_JOBS.filter(j => j.status === 'completed');
        parsed = [...parsed, ...initialCompleted];
      }
      // Hydrate chatMessages & before/after photos from initialData if missing
      parsed = parsed.map(job => {
        const initMatch = INITIAL_JOBS.find(ij => ij.id === job.id);
        let updated = { ...job };
        if ((!updated.chatMessages || updated.chatMessages.length === 0) && initMatch?.chatMessages) {
          updated.chatMessages = initMatch.chatMessages;
        }
        if (!updated.beforePhotoUrl && initMatch?.beforePhotoUrl) {
          updated.beforePhotoUrl = initMatch.beforePhotoUrl;
          updated.afterPhotoUrl = initMatch.afterPhotoUrl;
          updated.completionNote = updated.completionNote || initMatch.completionNote;
          updated.completedAt = updated.completedAt || initMatch.completedAt;
        }
        return updated;
      });
      return parsed;
    } catch {
      return INITIAL_JOBS;
    }
  });

  const [workers, setWorkers] = useState<WorkerProfile[]>(() => {
    const saved = localStorage.getItem('halol_mehnat_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [transactions, setTransactions] = useState<CommissionTransaction[]>(() => {
    const saved = localStorage.getItem('halol_mehnat_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [employers, setEmployers] = useState<EmployerProfile[]>(() => {
    const saved = localStorage.getItem('halol_mehnat_employers');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYER_PROFILES;
  });

  const [cardNumber, setCardNumber] = useState<string>(() => {
    return localStorage.getItem('halol_mehnat_card') || '8600 5304 1289 9541';
  });

  const [cardHolder, setCardHolder] = useState<string>(() => {
    return localStorage.getItem('halol_mehnat_card_holder') || 'Nilufar N. (Platforma egasi)';
  });

  // UI state
  const [currentRole, setCurrentRole] = useState<'employer' | 'worker'>('employer');
  const [activeView, setActiveView] = useState<'jobs' | 'workers' | 'students' | 'cleaning' | 'radar' | 'completed'>('jobs');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Modals state
  const [activeTrackingJob, setActiveTrackingJob] = useState<JobOrder | null>(null);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [initialJobCategory, setInitialJobCategory] = useState<JobCategory | undefined>(undefined);
  const [initialJobBudget, setInitialJobBudget] = useState<number | undefined>(undefined);
  const [isRegisterWorkerOpen, setIsRegisterWorkerOpen] = useState(false);
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<WorkerProfile | null>(null);
  const [selectedEmployerForProfile, setSelectedEmployerForProfile] = useState<EmployerProfile | null>(null);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerProfile | null>(null);
  const [isCommissionDashboardOpen, setIsCommissionDashboardOpen] = useState(false);
  const [isTradesDirectoryOpen, setIsTradesDirectoryOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reviewTargetJob, setReviewTargetJob] = useState<JobOrder | null>(null);
  const [reviewModalTargetRole, setReviewModalTargetRole] = useState<'worker' | 'employer'>('worker');
  const [chatTargetJob, setChatTargetJob] = useState<JobOrder | null>(null);
  const [completingTargetJob, setCompletingTargetJob] = useState<JobOrder | null>(null);
  const [isPerformanceMetricsOpen, setIsPerformanceMetricsOpen] = useState(false);
  
  // Platform Messenger state
  const [conversations, setConversations] = useState<MessengerConversation[]>(() => {
    const saved = localStorage.getItem('halol_mehnat_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>('conv-w-1');
  const [proposalTargetJob, setProposalTargetJob] = useState<JobOrder | null>(null);

  // Real-time Notification system state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('halol_mehnat_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('halol_mehnat_sound_enabled') !== 'false';
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('halol_mehnat_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('halol_mehnat_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('halol_mehnat_employers', JSON.stringify(employers));
  }, [employers]);

  useEffect(() => {
    localStorage.setItem('halol_mehnat_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('halol_mehnat_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('halol_mehnat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('halol_mehnat_sound_enabled', String(isSoundEnabled));
  }, [isSoundEnabled]);

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Main notification dispatcher
  const pushNotification = (notifData: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'timestamp'> & { timestamp?: string }) => {
    const newNotif: AppNotification = {
      timestamp: 'Hozirgina',
      ...notifData,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToasts(prev => [newNotif, ...prev.slice(0, 3)]);

    // Trigger subtle audible chime if enabled
    if (isSoundEnabled) {
      if (notifData.type === 'new_order') {
        playNotificationSound('order');
      } else if (notifData.type === 'worker_en_route' || notifData.type === 'worker_arrived') {
        playNotificationSound('en_route');
      } else if (notifData.type === 'payment_commission' || notifData.type === 'proposal_accepted') {
        playNotificationSound('cash');
      } else if (notifData.type === 'new_proposal') {
        playNotificationSound('order');
      } else {
        playNotificationSound('default');
      }
    }
  };

  const showToast = (msg: string) => {
    pushNotification({
      type: 'system',
      title: "Ma'lumot",
      message: msg,
      timestamp: 'Hozirgina',
      badgeText: "Tizim xabari"
    });
  };

  // Simulated live event generator (for realistic marketplace feel and testing)
  const triggerSimulatedNotification = (type: 'order' | 'proposal' | 'proposal_accepted' | 'status_change' | 'message' | 'en_route' | 'cash') => {
    if (type === 'order') {
      const sampleOrders = [
        {
          title: "Yangi buyurtma keldi: Registon atrofida g'isht terish",
          message: "Registon ko'chasidagi xonadonda 1 400 dona pishiq g'isht terish va poydevor ishlari",
          loc: "Samarqand shahri (Markaz)",
          price: 450000
        },
        {
          title: "Yangi buyurtma keldi: Siyob bozorida kafel terish",
          message: "Hammom va koridor uchun 60x120 granit kafel yotqizish, 28 kv.m",
          loc: "Samarqand shahri (Siyob bozori)",
          price: 720000
        },
        {
          title: "Yangi buyurtma keldi: Bog'ishamol tumanida uy tozalash",
          message: "Hovli va 5 xonali kottedjni general uborka qilish, oyna yuvish bilan",
          loc: "Samarqand shahri (Bog'ishamol)",
          price: 380000
        },
        {
          title: "Yangi buyurtma keldi: Urgut tumanida metall naves svarka",
          message: "Hovliga 6x8 o'lchamdagi profnastil naves va metall karkas yasash",
          loc: "Urgut tumani",
          price: 650000
        }
      ];
      const ord = sampleOrders[Math.floor(Math.random() * sampleOrders.length)];
      pushNotification({
        type: 'new_order',
        title: ord.title,
        message: ord.message,
        timestamp: 'Hozirgina',
        badgeText: "Yangi buyurtma",
        actionText: "Buyurtmaga o'tish",
        extraDetails: {
          location: ord.loc,
          budgetUzs: ord.price
        }
      });
    } else if (type === 'proposal') {
      const sampleProposals = [
        {
          worker: "Shavkat Normatov",
          specialty: "Kafel & Marmar ustasi",
          price: 1650000,
          duration: "3 kun",
          note: "Lazer va barcha professional asboblarim bor, burchaklarni 45 gradusda silliq qirqaman."
        },
        {
          worker: "Jasur Mirzayev",
          specialty: "Suvoq & Malyarka",
          price: 900000,
          duration: "2 kun",
          note: "Rotband suvoq va 2 qatlam shpaklyovka berib tayyorlab beramiz."
        },
        {
          worker: "Malika opa",
          specialty: "Sarishta Beka (Uborka)",
          price: 350000,
          duration: "Bugun (soat 17:00 gacha)",
          note: "O'zimizning nemis vositalarimiz bilan 2 kishi borib boshdan-oyoq tozalaymiz."
        }
      ];
      const p = sampleProposals[Math.floor(Math.random() * sampleProposals.length)];
      pushNotification({
        type: 'new_proposal',
        title: `Yangi taklif: ${p.worker}`,
        message: `${p.specialty} buyurtmangiz uchun ${p.price.toLocaleString()} so'm taklif qildi (${p.duration}). "${p.note}"`,
        timestamp: 'Hozirgina',
        badgeText: "Yangi taklif (Bid)",
        actionText: "Messenjerda ko'rish",
        extraDetails: {
          workerName: p.worker,
          proposedPriceUzs: p.price
        }
      });
    } else if (type === 'proposal_accepted') {
      pushNotification({
        type: 'proposal_accepted',
        title: "Taklifingiz qabul qilindi! 🎉",
        message: "Buyurtmachi sizning 450 000 so'mlik taklifingizni ma'qulladi. Usta chaqiruvga tayyor bo'ling!",
        timestamp: 'Hozirgina',
        badgeText: "Kelishuv tasdiqlandi",
        actionText: "Messenjerni ochish",
        extraDetails: {
          clientName: "Alisher Qodirov",
          budgetUzs: 450000
        }
      });
    } else if (type === 'status_change') {
      const statusChanges = [
        { label: "Usta yo'lga chiqdi", desc: "Buyurtmaga usta tayinlandi va chaqirilgan manzil tomon harakatlanmoqda." },
        { label: "Usta yetib keldi", desc: "Usta belgilangan manzilga yetib bordi va ishni boshlamoqda." },
        { label: "Ish jarayonda", desc: "Devor terish va tekislash ishlari faol bajarilmoqda." },
        { label: "Ish yakunlandi", desc: "Usta ishni yakunladi va 'Oldin & Keyin' fotosuratlarini yukladi." }
      ];
      const sc = statusChanges[Math.floor(Math.random() * statusChanges.length)];
      pushNotification({
        type: 'status_change',
        title: `Holat o'zgardi: ${sc.label}`,
        message: sc.desc,
        timestamp: 'Hozirgina',
        badgeText: `Holat: ${sc.label}`,
        actionText: "Tafsilotlar"
      });
    } else if (type === 'message') {
      const msgs = [
        { name: "Bahrom Rasulov", text: "Assalomu alaykum! Asboblarni yuklab yo'lga chiqdim, 15 daqiqada yetib boraman." },
        { name: "Malika opa", text: "Ertaga soat 09:00 ga 2 kishi bo'lib tozalash vositalari bilan boramiz." },
        { name: "Shavkat Normatov", text: "Kafel burchaklarini 45 gradusda chiroyli qilib kesib beraman, xotirjam bo'ling." }
      ];
      const m = msgs[Math.floor(Math.random() * msgs.length)];
      pushNotification({
        type: 'message',
        title: `Messenjer: ${m.name}`,
        message: m.text,
        timestamp: 'Hozirgina',
        badgeText: "Yangi xabar 💬",
        actionText: "Messenjerda javob berish",
        extraDetails: {
          workerName: m.name
        }
      });
    } else if (type === 'en_route') {
      const sampleWorkers = [
        { name: "Jasur Usta", role: "Suvoq & Malyar", eta: 11, dist: 2.8, target: "Siyob bozori tomon" },
        { name: "Bahrom Rasulov", role: "Devor teruvchi", eta: 14, dist: 3.6, target: "Registon ko'chasi tomon" },
        { name: "Malika opa", role: "Sarishta beka & General uborka", eta: 9, dist: 2.1, target: "Bog'ishamol tomon" },
        { name: "Farhod Usta", role: "Santexnik", eta: 16, dist: 4.2, target: "Universitet xiyoboni tomon" }
      ];
      const wrk = sampleWorkers[Math.floor(Math.random() * sampleWorkers.length)];
      pushNotification({
        type: 'worker_en_route',
        title: "Usta yo'lga chiqdi!",
        message: `${wrk.name} (${wrk.role}) buyurtmani qabul qildi va ${wrk.target} yo'lga chiqdi.`,
        timestamp: 'Hozirgina',
        badgeText: "GPS Radar",
        actionText: "Jonli radarda ko'rish",
        extraDetails: {
          workerName: wrk.name,
          etaMinutes: wrk.eta,
          distanceKm: wrk.dist
        }
      });
    } else if (type === 'cash') {
      pushNotification({
        type: 'payment_commission',
        title: "20 000 so'm kassa tushumi!",
        message: "Yangi buyurtma kelishuvi bo'yicha platforma kartangizga 20 000 so'm yozildi.",
        timestamp: 'Hozirgina',
        badgeText: "+20 000 UZS",
        actionText: "Kassa hisoboti",
        extraDetails: {
          budgetUzs: 20000
        }
      });
    }
  };

  // Background ticker: periodically simulate marketplace activity every 75s
  useEffect(() => {
    const interval = setInterval(() => {
      const types: Array<'order' | 'en_route'> = ['order', 'en_route'];
      const pick = types[Math.floor(Math.random() * types.length)];
      triggerSimulatedNotification(pick);
    }, 75000);

    return () => clearInterval(interval);
  }, [isSoundEnabled]);

  // Handler: notification action click router
  const handleNotificationAction = (notif: AppNotification) => {
    setIsNotificationsModalOpen(false);

    if (notif.type === 'payment_commission') {
      setIsCommissionDashboardOpen(true);
      return;
    }

    if (notif.type === 'message' || notif.conversationId) {
      handleOpenMessenger(notif.conversationId || notif.workerId, notif.jobId);
      return;
    }

    if (notif.type === 'new_proposal' || notif.type === 'proposal_accepted') {
      if (notif.jobId) {
        const found = jobs.find(j => j.id === notif.jobId);
        if (found) {
          setActiveView('jobs');
          return;
        }
      }
      handleOpenMessenger(notif.workerId, notif.jobId);
      return;
    }

    if (notif.type === 'status_change') {
      if (notif.jobId) {
        const found = jobs.find(j => j.id === notif.jobId);
        if (found) {
          if (found.status === 'en_route' || found.status === 'arrived') {
            setActiveTrackingJob(found);
            return;
          }
          if (found.status === 'completed') {
            setActiveView('completed');
            return;
          }
        }
      }
      setActiveView('jobs');
      return;
    }

    if (notif.type === 'worker_en_route' || notif.type === 'worker_arrived') {
      if (notif.jobId) {
        const found = jobs.find(j => j.id === notif.jobId);
        if (found) {
          setActiveTrackingJob(found);
          return;
        }
      }
      const anyEnRoute = jobs.find(j => j.status === 'en_route' || j.status === 'arrived');
      if (anyEnRoute) {
        setActiveTrackingJob(anyEnRoute);
      } else {
        setActiveView('radar');
      }
      return;
    }

    if (notif.type === 'job_completed') {
      if (notif.jobId) {
        const found = jobs.find(j => j.id === notif.jobId);
        if (found) {
          setReviewTargetJob(found);
          return;
        }
      }
      setActiveView('completed');
      return;
    }

    if (notif.workerId) {
      const foundWorker = workers.find(w => w.id === notif.workerId);
      if (foundWorker) {
        setSelectedWorkerForProfile(foundWorker);
        return;
      }
    }

    if (notif.type === 'new_order') {
      setActiveView('jobs');
      return;
    }
  };

  // Messenger Handler: Open Messenger with specified partner or default
  const handleOpenMessenger = (partnerId?: string, jobId?: string) => {
    if (partnerId) {
      let existing = conversations.find(c => c.partnerId === partnerId || c.id === partnerId);
      if (!existing) {
        const targetWorker = workers.find(w => w.id === partnerId);
        const targetEmp = employers.find(e => e.id === partnerId);
        const targetJob = jobId ? jobs.find(j => j.id === jobId) : undefined;

        const newConv: MessengerConversation = {
          id: `conv-${partnerId}-${Date.now()}`,
          partnerId,
          partnerName: targetWorker?.name || targetEmp?.name || targetJob?.workerName || "Usta / Mijoz",
          partnerAvatar: targetWorker?.avatarUrl || targetEmp?.avatarUrl || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg',
          partnerRole: targetWorker ? 'worker' : 'employer',
          partnerSpecialty: targetWorker?.roleTitle || "Buyurtmachi (Mijoz)",
          partnerPhone: targetWorker?.phone || targetEmp?.phone || '+998 90 123 45 67',
          partnerRating: targetWorker?.rating || 4.9,
          isOnline: true,
          lastMessage: "Yangi suhbat ochildi",
          lastMessageTime: 'Hozirgina',
          lastMessageTimestamp: Date.now(),
          unreadCount: 0,
          relatedJobId: targetJob?.id,
          relatedJobTitle: targetJob?.title,
          messages: []
        };
        setConversations(prev => [newConv, ...prev]);
        existing = newConv;
      } else {
        // Mark as read
        setConversations(prev => prev.map(c => c.id === existing!.id ? { ...c, unreadCount: 0 } : c));
      }
      setActiveConversationId(existing.id);
    }
    setIsMessengerOpen(true);
  };

  // Messenger Handler: Send Message + Simulated Realistic Uzbek Response
  const handleSendMessengerMessage = (
    conversationId: string, 
    text: string, 
    options?: {
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
    }
  ) => {
    const currentConv = conversations.find(c => c.id === conversationId);
    if (!currentConv) return;

    const newMsg = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversationId,
      senderRole: currentRole,
      senderId: 'current-user',
      senderName: currentRole === 'employer' ? 'Alisher Qodirov (Mijoz)' : 'Usta Bahrom Rasulov',
      text,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      isRead: true,
      voiceAudioUrl: options?.voiceAudioUrl,
      voiceDurationSeconds: options?.voiceDurationSeconds,
      isLocationShare: options?.isLocationShare,
      locationCoords: options?.locationCoords,
      locationAddress: options?.locationAddress,
      proposalOffer: options?.proposalOffer
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: newMsg.timestamp,
          lastMessageTimestamp: Date.now(),
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    // If related to an existing job order, sync to job chatMessages
    if (currentConv.relatedJobId) {
      const jobChatMsg: ChatMessage = {
        id: newMsg.id,
        jobId: currentConv.relatedJobId,
        senderRole: currentRole,
        senderName: newMsg.senderName,
        text: newMsg.text,
        timestamp: newMsg.timestamp,
        createdAt: newMsg.createdAt,
        isRead: true,
        voiceAudioUrl: newMsg.voiceAudioUrl,
        voiceDurationSeconds: newMsg.voiceDurationSeconds,
        isLocationShare: newMsg.isLocationShare,
        locationCoords: newMsg.locationCoords
      };

      setJobs(prev => prev.map(j => {
        if (j.id === currentConv.relatedJobId) {
          return {
            ...j,
            chatMessages: [...(j.chatMessages || []), jobChatMsg]
          };
        }
        return j;
      }));
    }

    // Realistic auto-reply simulation after 1.8 seconds
    setTimeout(() => {
      let replyText = "Va alaykum assalom! Xabaringizni oldim, hozir ko'rib chiqyapman.";
      const lower = text.toLowerCase();
      if (lower.includes("qachon") || lower.includes("vaqt")) {
        replyText = "Inshaalloh bugun peshindan keyin soat 14:00 da manzilga yetib boraman.";
      } else if (lower.includes("narx") || lower.includes("so'm") || lower.includes("som") || lower.includes("kelishaylik")) {
        replyText = "Narxini o'rtacha kelishamiz, sifatli va kafolatli qilib beraman.";
      } else if (lower.includes("manzil") || lower.includes("lokatsiya") || lower.includes("joylashuv")) {
        replyText = "Manzilni ko'rdim, Registon tomonda ekan. Yo'l tirband bo'lmasa 20 daqiqada boraman.";
      } else if (lower.includes("asbob") || lower.includes("texnika")) {
        replyText = "Barcha kerakli lazer, plitkorez va asbob-uskunalarim bor, xotirjam bo'ling.";
      } else if (lower.includes("salom") || lower.includes("assalomu")) {
        replyText = "Va alaykum assalom! Xizmatingizga tayyorman, qanday yordam bera olaman?";
      } else {
        replyText = "Tushunarli, kelishdik. Xizmatni vaqtida va a'lo darajada bajaramiz!";
      }

      const partnerReply = {
        id: `m-reply-${Date.now()}`,
        conversationId,
        senderRole: currentConv.partnerRole,
        senderId: currentConv.partnerId,
        senderName: currentConv.partnerName,
        senderAvatar: currentConv.partnerAvatar,
        text: replyText,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        isRead: false
      };

      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: replyText,
            lastMessageTime: partnerReply.timestamp,
            lastMessageTimestamp: Date.now(),
            unreadCount: (c.unreadCount || 0) + 1,
            messages: [...c.messages, partnerReply]
          };
        }
        return c;
      }));

      pushNotification({
        type: 'message',
        title: `Messenjer: ${currentConv.partnerName}`,
        message: replyText,
        timestamp: 'Hozirgina',
        conversationId,
        workerId: currentConv.partnerId,
        actionText: "Javob berish",
        badgeText: "Yangi xabar 💬"
      });
    }, 1800);
  };

  // Proposal Handler: Worker submits a proposal
  const handleSubmitProposal = (proposalData: Omit<JobProposal, 'id' | 'createdAt' | 'status'>) => {
    const newProposal: JobProposal = {
      ...proposalData,
      id: `prop-${Date.now()}`,
      createdAt: 'Hozirgina',
      status: 'pending'
    };

    setJobs(prev => prev.map(j => {
      if (j.id === proposalData.jobId) {
        return {
          ...j,
          proposals: [newProposal, ...(j.proposals || [])]
        };
      }
      return j;
    }));

    confetti({ particleCount: 60, spread: 70 });

    pushNotification({
      type: 'new_proposal',
      title: "Yangi narx taklifi tushdi!",
      message: `${proposalData.workerName} "${proposalData.jobTitle}" uchun ${proposalData.proposedPriceUzs.toLocaleString()} so'm taklif qildi (${proposalData.estimatedDuration}).`,
      timestamp: 'Hozirgina',
      jobId: proposalData.jobId,
      proposalId: newProposal.id,
      workerId: proposalData.workerId,
      badgeText: "Taklif (Bid)",
      actionText: "Buyurtmada ko'rish",
      extraDetails: {
        workerName: proposalData.workerName,
        proposedPriceUzs: proposalData.proposedPriceUzs
      }
    });
  };

  // Proposal Handler: Employer accepts a proposal
  const handleAcceptProposal = (job: JobOrder, proposal: JobProposal) => {
    const updatedJob: JobOrder = {
      ...job,
      status: 'en_route',
      workerId: proposal.workerId,
      workerName: proposal.workerName,
      workerPhone: proposal.workerPhone,
      workerRole: proposal.workerCategory,
      workerAvatar: proposal.workerAvatar,
      workerRating: proposal.workerRating,
      budgetUzs: proposal.proposedPriceUzs,
      workerEtaMinutes: 14,
      workerDistanceKm: 3.5,
      workerSpeedKmh: 30,
      commissionPaid: true,
      commissionReceiptId: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      proposals: (job.proposals || []).map(p => p.id === proposal.id ? { ...p, status: 'accepted' } : p)
    };

    setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));

    // 20,000 UZS platform commission transaction
    const newTxn: CommissionTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: job.id,
      orderTitle: job.title,
      employerName: job.employerName,
      workerName: proposal.workerName,
      amountUzs: 20000,
      paymentMethod: 'Uzcard',
      recipientCard: cardNumber,
      recipientName: cardHolder,
      timestamp: 'Hozirgina',
      status: 'muvaffaqiyatli'
    };
    setTransactions(prev => [newTxn, ...prev]);

    confetti({ particleCount: 90, spread: 80 });

    pushNotification({
      type: 'proposal_accepted',
      title: "Taklif qabul qilindi! 🎉",
      message: `${proposal.workerName} taklifi ma'qullandi (${proposal.proposedPriceUzs.toLocaleString()} so'm). Usta yo'lga chiqmoqda!`,
      timestamp: 'Hozirgina',
      jobId: job.id,
      badgeText: "Kelishuv tasdiqlandi",
      actionText: "Radarda kuzatish",
      extraDetails: {
        workerName: proposal.workerName,
        budgetUzs: proposal.proposedPriceUzs
      }
    });

    pushNotification({
      type: 'status_change',
      title: "Buyurtma holati o'zgardi",
      message: `"${job.title}" buyurtmasiga usta biriktirildi va yo'lga chiqdi.`,
      timestamp: 'Hozirgina',
      jobId: job.id,
      oldStatus: 'open',
      newStatus: 'en_route',
      badgeText: "Holat: Yo'lda",
      actionText: "Radarda ko'rish"
    });

    pushNotification({
      type: 'payment_commission',
      title: "20 000 so'm kassa tushumi!",
      message: `Taklif tasdiqlangani uchun platforma kartangizga 20 000 so'm yozildi.`,
      timestamp: 'Hozirgina',
      badgeText: "+20 000 UZS",
      actionText: "Kassa hisoboti",
      extraDetails: { budgetUzs: 20000 }
    });

    // Update conversation proposal status if thread exists
    setConversations(prev => prev.map(c => {
      if (c.partnerId === proposal.workerId || c.relatedJobId === job.id) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.proposalOffer && (m.proposalOffer.jobId === job.id || m.proposalOffer.amountUzs === proposal.proposedPriceUzs)) {
              return {
                ...m,
                proposalOffer: {
                  ...m.proposalOffer,
                  status: 'accepted'
                }
              };
            }
            return m;
          })
        };
      }
      return c;
    }));

    setActiveTrackingJob(updatedJob);
  };

  const handleStartNewConversation = (worker: WorkerProfile) => {
    handleOpenMessenger(worker.id);
  };

  // Handler: Create new Job
  const handleCreateJob = (newJobData: Partial<JobOrder>) => {
    const created: JobOrder = {
      id: `job-${Date.now()}`,
      title: newJobData.title || "Yangi buyurtma",
      category: newJobData.category || 'devor_terish',
      categoryLabel: newJobData.categoryLabel || "Xizmat",
      description: newJobData.description || '',
      photoUrl: newJobData.photoUrl || '/src/assets/images/job_bricklaying_wall_1791274845977.jpg',
      locationAddress: newJobData.locationAddress || 'Samarqand shahri, Registon ko\'chasi',
      city: 'Samarqand',
      district: newJobData.district || 'Samarqand shahri (Markaz / Registon)',
      targetCoords: newJobData.targetCoords || { lat: 39.6542, lng: 66.9597 },
      budgetUzs: newJobData.budgetUzs || 350000,
      paymentType: newJobData.paymentType || 'kunlik',
      urgent: newJobData.urgent ?? true,
      mealProvided: newJobData.mealProvided ?? true,
      toolsProvided: newJobData.toolsProvided ?? false,
      workersNeeded: newJobData.workersNeeded || 1,
      status: 'open',
      employerName: newJobData.employerName || 'Buyurtmachi',
      employerPhone: newJobData.employerPhone || '+998 90 123 45 67',
      commissionAmount: 20000,
      commissionPaid: false,
      createdAt: 'Hozirgina'
    };

    setJobs([created, ...jobs]);
    confetti({ particleCount: 50, spread: 60 });
    
    // Trigger real-time notification
    pushNotification({
      type: 'new_order',
      title: "Yangi buyurtma keldi!",
      message: `"${created.title}" e'loni joylandi. Samarqand ustalari va mardikorlari ogohlantirildi.`,
      timestamp: 'Hozirgina',
      jobId: created.id,
      badgeText: "Yangi e'lon",
      actionText: "Buyurtmaga o'tish",
      extraDetails: {
        location: created.locationAddress,
        budgetUzs: created.budgetUzs
      }
    });
  };

  // Handler: Accept Job (Worker takes order)
  const handleAcceptJob = (job: JobOrder) => {
    // Pick first online worker or default
    const assignedWorker = workers[0] || {
      id: 'w-auto',
      name: 'Bahrom Rasulov',
      phone: '+998 93 456 78 90',
      roleTitle: "Tajribali usta",
      avatarUrl: '/src/assets/images/master_craftsman_portrait_1791274865042.jpg',
      rating: 4.9
    };

    const updatedJob: JobOrder = {
      ...job,
      status: 'en_route',
      workerId: assignedWorker.id,
      workerName: assignedWorker.name,
      workerPhone: assignedWorker.phone,
      workerRole: assignedWorker.roleTitle,
      workerAvatar: assignedWorker.avatarUrl,
      workerRating: assignedWorker.rating,
      workerEtaMinutes: 14,
      workerDistanceKm: 3.6,
      workerSpeedKmh: 30,
      commissionPaid: true,
      commissionReceiptId: `PAY-${Math.floor(10000 + Math.random() * 90000)}`
    };

    // Update job in list
    setJobs(jobs.map(j => j.id === job.id ? updatedJob : j));

    // Record the 20,000 UZS platform commission transaction
    const newTxn: CommissionTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: job.id,
      orderTitle: job.title,
      employerName: job.employerName,
      workerName: assignedWorker.name,
      amountUzs: 20000,
      paymentMethod: 'Uzcard',
      recipientCard: cardNumber,
      recipientName: cardHolder,
      timestamp: 'Hozirgina',
      status: 'muvaffaqiyatli'
    };

    setTransactions([newTxn, ...transactions]);

    confetti({ particleCount: 80, spread: 70 });
    
    // 1. Worker en-route notification toast
    pushNotification({
      type: 'worker_en_route',
      title: "Usta yo'lga chiqdi!",
      message: `${assignedWorker.name} "${job.title}" buyurtmasini qabul qildi va chaqirilgan manzil tomon harakatlanmoqda.`,
      timestamp: 'Hozirgina',
      jobId: job.id,
      workerId: assignedWorker.id,
      badgeText: "GPS Radar",
      actionText: "Jonli radarda ko'rish",
      extraDetails: {
        workerName: assignedWorker.name,
        etaMinutes: 14,
        distanceKm: 3.6,
        location: job.locationAddress
      }
    });

    // 2. Commission payment notification toast
    pushNotification({
      type: 'payment_commission',
      title: "20 000 so'm kassa tushumi!",
      message: `"${job.title}" uchun platforma kartangizga 20 000 so'm tushdi.`,
      timestamp: 'Hozirgina',
      jobId: job.id,
      badgeText: "+20 000 UZS",
      actionText: "Kassa hisoboti",
      extraDetails: {
        budgetUzs: 20000
      }
    });
    
    // Auto-open live tracking so employer sees worker coming!
    setActiveTrackingJob(updatedJob);
  };

  // Handler: Hire Worker Directly
  const handleHireWorker = (worker: WorkerProfile) => {
    setSelectedWorkerForProfile(null);

    const directJob: JobOrder = {
      id: `job-${Date.now()}`,
      title: `${worker.roleTitle} xizmati uchun to'g'ridan-to'g'ri buyurtma`,
      category: worker.category,
      categoryLabel: worker.categoryLabel,
      description: `${worker.name} bilan to'g'ridan-to'g'ri kelishuv. Shartlar joyida kelishiladi.`,
      photoUrl: worker.portfolioPhotos[0] || '/src/assets/images/job_bricklaying_wall_1791274845977.jpg',
      locationAddress: `${worker.district}, Samarqand viloyati`,
      city: 'Samarqand',
      district: worker.district,
      targetCoords: worker.currentCoords || { lat: 39.6542, lng: 66.9597 },
      budgetUzs: worker.dailyRateUzs,
      paymentType: 'kunlik',
      urgent: true,
      mealProvided: true,
      toolsProvided: true,
      workersNeeded: 1,
      status: 'en_route',
      employerName: 'Buyurtmachi',
      employerPhone: '+998 90 987 65 43',
      workerId: worker.id,
      workerName: worker.name,
      workerPhone: worker.phone,
      workerAvatar: worker.avatarUrl,
      workerRole: worker.roleTitle,
      workerRating: worker.rating,
      workerEtaMinutes: 15,
      workerDistanceKm: 4.1,
      workerSpeedKmh: 28,
      commissionAmount: 20000,
      commissionPaid: true,
      createdAt: 'Hozirgina'
    };

    setJobs([directJob, ...jobs]);

    // Record commission
    const newTxn: CommissionTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: directJob.id,
      orderTitle: directJob.title,
      employerName: 'Buyurtmachi',
      workerName: worker.name,
      amountUzs: 20000,
      paymentMethod: 'Uzcard',
      recipientCard: cardNumber,
      recipientName: cardHolder,
      timestamp: 'Hozirgina',
      status: 'muvaffaqiyatli'
    };
    setTransactions([newTxn, ...transactions]);

    pushNotification({
      type: 'worker_en_route',
      title: "Usta yo'lga chiqdi!",
      message: `${worker.name} chaqiruvni qabul qildi va yo'lga chiqdi (ETA: 15 daqiqa).`,
      timestamp: 'Hozirgina',
      jobId: directJob.id,
      workerId: worker.id,
      badgeText: "Usta yo'lda",
      actionText: "Jonli radarda ko'rish",
      extraDetails: {
        workerName: worker.name,
        etaMinutes: 15,
        distanceKm: 4.1
      }
    });

    pushNotification({
      type: 'payment_commission',
      title: "20 000 so'm kassa tushumi!",
      message: `${worker.name} chaqirilgani uchun platforma kartangizga 20 000 so'm komissiya yozildi.`,
      timestamp: 'Hozirgina',
      jobId: directJob.id,
      badgeText: "+20 000 UZS",
      actionText: "Kassa hisoboti",
      extraDetails: {
        budgetUzs: 20000
      }
    });

    setActiveTrackingJob(directJob);
  };

  // Handler: Update Job Status (from tracking modal)
  const handleUpdateJobStatus = (jobId: string, newStatus: JobOrder['status']) => {
    const targetJob = jobs.find(j => j.id === jobId);
    const workerName = targetJob?.workerName || "Usta";

    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    if (activeTrackingJob && activeTrackingJob.id === jobId) {
      setActiveTrackingJob({ ...activeTrackingJob, status: newStatus });
    }

    if (newStatus === 'arrived') {
      pushNotification({
        type: 'worker_arrived',
        title: "Usta manzilga yetib keldi!",
        message: `${workerName} manzilga yetib bordi va ish joyini ko'zdan kechirmoqda.`,
        timestamp: 'Hozirgina',
        jobId,
        badgeText: "Yetib keldi",
        actionText: "Radarni tekshirish",
        extraDetails: {
          workerName,
          location: targetJob?.locationAddress
        }
      });

      if (isSoundEnabled) {
        speakUzbek(`${workerName} manzilga yetib keldi!`);
      }
    } else if (newStatus === 'in_progress') {
      pushNotification({
        type: 'job_started',
        title: "Ish jarayoni boshlandi",
        message: `${workerName} vazifani bajarishga kirishdi.`,
        timestamp: 'Hozirgina',
        jobId,
        badgeText: "Ish jarayonda",
        actionText: "Holatni ko'rish"
      });
    } else if (newStatus === 'completed') {
      pushNotification({
        type: 'job_completed',
        title: "Ish yakunlandi!",
        message: `Buyurtma muvaffaqiyatli bajarildi. Iltimos, ${workerName}ning xizmatini baholang va sharh qoldiring.`,
        timestamp: 'Hozirgina',
        jobId,
        badgeText: "Bajarildi",
        actionText: "Ustani baholash"
      });
    }
  };

  // Handler: Worker Approaching Notification (< 800m)
  const handleWorkerApproaching = (job: JobOrder, distanceKm: number, etaMinutes: number) => {
    const workerName = job.workerName || "Usta";
    const meters = Math.round(distanceKm * 1000);

    pushNotification({
      type: 'worker_en_route',
      title: `⚡ Usta yaqinlashmoqda! (${meters}m qoldi)`,
      message: `${workerName} ish joyingizga juda yaqin keldi (ETA: ~${etaMinutes} daqiqa). Darvozani ochish yoki kutib olishga tayyor turing!`,
      timestamp: 'Hozirgina',
      jobId: job.id,
      workerId: job.workerId,
      badgeText: `${meters}m qoldi ⚡`,
      actionText: "Radarda ko'rish",
      extraDetails: {
        workerName,
        etaMinutes,
        distanceKm
      }
    });

    if (isSoundEnabled) {
      playNotificationSound('en_route');
      speakUzbek(`Diqqat! Usta ish joyingizga yaqinlashmoqda, taxminan ${etaMinutes} daqiqada yetib keladi.`);
    }
  };

  // Handler: Complete Job with Before/After Photos
  const handleFinalizeJobCompletion = (jobId: string, completionData: {
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
    completionNote?: string;
  }) => {
    const targetJob = jobs.find(j => j.id === jobId);
    const workerName = targetJob?.workerName || "Usta";

    const updatedJobs = jobs.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'completed' as const,
          beforePhotoUrl: completionData.beforePhotoUrl || j.beforePhotoUrl,
          afterPhotoUrl: completionData.afterPhotoUrl || j.afterPhotoUrl,
          completionNote: completionData.completionNote || j.completionNote,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Bugun'
        };
      }
      return j;
    });

    setJobs(updatedJobs);
    localStorage.setItem('halol_mehnat_jobs', JSON.stringify(updatedJobs));

    if (activeTrackingJob && activeTrackingJob.id === jobId) {
      setActiveTrackingJob(prev => prev ? {
        ...prev,
        status: 'completed',
        beforePhotoUrl: completionData.beforePhotoUrl || prev.beforePhotoUrl,
        afterPhotoUrl: completionData.afterPhotoUrl || prev.afterPhotoUrl,
        completionNote: completionData.completionNote || prev.completionNote,
        completedAt: 'Hozirgina'
      } : null);
    }

    confetti({ particleCount: 120, spread: 80 });
    if (isSoundEnabled) {
      playNotificationSound('cash');
    }

    pushNotification({
      type: 'job_completed',
      title: "Ish yakunlandi & Hisobot yuklandi!",
      message: `${workerName} buyurtmani to'liq bajardi va 'Oldin / Keyin' fotosuratlarini taqdim etdi.`,
      timestamp: 'Hozirgina',
      jobId,
      badgeText: "Oldin / Keyin ✓",
      actionText: "Ustani baholash"
    });

    // Auto-prompt review modal for client or worker depending on role
    const completedJobItem = updatedJobs.find(j => j.id === jobId);
    if (completedJobItem) {
      setTimeout(() => {
        handleOpenReviewModal(completedJobItem, currentRole === 'worker' ? 'employer' : 'worker');
      }, 700);
    }
  };

  // Helper: Open Review modal with target role
  const handleOpenReviewModal = (job: JobOrder, role?: 'worker' | 'employer') => {
    setReviewTargetJob(job);
    setReviewModalTargetRole(role || (currentRole === 'worker' ? 'employer' : 'worker'));
  };

  // Helper: Open Employer Profile Modal
  const handleOpenEmployerProfile = (employerName: string) => {
    let emp = employers.find(e => e.name.toLowerCase() === employerName.toLowerCase());
    if (!emp) {
      const j = jobs.find(job => job.employerName.toLowerCase() === employerName.toLowerCase());
      emp = {
        id: `emp-${employerName.replace(/\s+/g, '-').toLowerCase()}`,
        name: employerName,
        phone: j?.employerPhone || '+998 90 123 45 67',
        avatarUrl: j?.employerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg',
        city: j?.city || 'Samarqand',
        district: j?.district || "Samarqand shahri (Markaz / Registon)",
        rating: 4.95,
        reviewCount: 6,
        completedJobsCount: 6,
        postedJobsCount: 7,
        paymentPunctualityRate: 100,
        memberSince: "2024-yildan beri a'zo",
        isVerified: true,
        bio: "HalolMehnat.uz tasdiqlangan ish beruvchisi.",
        reviews: []
      };
    }
    setSelectedEmployerForProfile(emp);
  };

  // Helper: Open Worker Profile Modal by ID
  const handleOpenWorkerProfileById = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setSelectedWorkerForProfile(worker);
    }
  };

  // Helper: Open current user profile (Employer or Worker based on currentRole)
  const handleOpenMyProfile = () => {
    if (currentRole === 'employer') {
      handleOpenEmployerProfile('Alisher Qodirov');
    } else {
      const worker = workers.find(w => w.id === 'w-1') || workers[0];
      setSelectedWorkerForProfile(worker);
    }
  };

  // Helper: Open Profile Editor for worker
  const handleOpenProfileEditor = (worker?: WorkerProfile) => {
    const target = worker || selectedWorkerForProfile || workers.find(w => w.id === 'w-1') || workers[0];
    setEditingWorker(target);
    setIsProfileEditorOpen(true);
  };

  // Handler: Save updated Worker Profile from ProfileEditorModal
  const handleSaveWorkerProfile = (updatedWorker: WorkerProfile) => {
    setWorkers(prevWorkers => {
      const updated = prevWorkers.map(w => w.id === updatedWorker.id ? updatedWorker : w);
      localStorage.setItem('halol_mehnat_workers', JSON.stringify(updated));
      return updated;
    });

    setSelectedWorkerForProfile(prev => {
      if (prev && prev.id === updatedWorker.id) {
        return updatedWorker;
      }
      return prev;
    });

    pushNotification({
      type: 'system',
      title: "Profil yangilandi! ✓",
      message: `${updatedWorker.name} ma'lumotlari, ko'nikmalari (${updatedWorker.skills.length} ta) va xizmat narxlari saqlandi.`,
      timestamp: 'Hozirgina',
      badgeText: "Profil saqlandi"
    });
  };

  // Handler: Register new Worker
  const handleRegisterWorker = (newWorker: WorkerProfile) => {
    setWorkers([newWorker, ...workers]);
    pushNotification({
      type: 'worker_registered',
      title: "Yangi usta ro'yxatdan o'tdi!",
      message: `Xush kelibsiz, ${newWorker.name}! Profilingiz (${newWorker.roleTitle}) faollashdi.`,
      timestamp: 'Hozirgina',
      workerId: newWorker.id,
      badgeText: "Yangi mutaxassis",
      actionText: "Profilni ko'rish"
    });
  };

  // Handler: Toggle worker Online/Offline status
  const handleToggleWorkerOnlineStatus = (workerId: string, isOnline: boolean) => {
    setWorkers(prevWorkers => {
      const updated = prevWorkers.map(w => w.id === workerId ? { ...w, isOnline } : w);
      localStorage.setItem('halol_mehnat_workers', JSON.stringify(updated));
      return updated;
    });

    setSelectedWorkerForProfile(prev => {
      if (prev && prev.id === workerId) {
        return { ...prev, isOnline };
      }
      return prev;
    });

    const targetWorker = workers.find(w => w.id === workerId);
    const workerName = targetWorker ? targetWorker.name : "Usta";

    if (isSoundEnabled) {
      playNotificationSound(isOnline ? 'order' : 'default');
    }

    pushNotification({
      type: 'system',
      title: isOnline ? `${workerName} Online holatga o'tdi` : `${workerName} Offline qilindi`,
      message: isOnline 
        ? "Usta asosiy vitrinada ko'rinmoqda va yangi buyurtmalarni qabul qilishi mumkin."
        : "Usta asosiy vitrinadan yashirildi (dam olish rejimida).",
      workerId
    });
  };

  // Handler: Submit 1-5 Star Rating & Review (Bidirectional: Client rates Worker OR Worker rates Client)
  const handleSubmitReview = (
    jobId: string,
    targetId: string,
    ratingGiven: number,
    comment: string,
    tags: string[],
    targetRole: 'worker' | 'employer'
  ) => {
    const targetJob = jobs.find(j => j.id === jobId);
    const workerName = targetJob?.workerName || "Usta";
    const employerName = targetJob?.employerName || "Buyurtmachi";

    if (targetRole === 'worker') {
      // 1. Client rating Worker
      setJobs(prevJobs => prevJobs.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'completed' as const,
            reviewLeft: true,
            ratingGiven,
            reviewComment: comment,
            reviewTags: tags,
            reviewedAt: 'Hozirgina'
          };
        }
        return j;
      }));

      // 2. Update WorkerProfile cumulative average rating & add review
      const newWorkerReview = {
        id: `rev-w-${Date.now()}`,
        employerName: employerName,
        authorName: `${employerName} (Ish beruvchi)`,
        authorRole: 'employer' as const,
        authorAvatar: targetJob?.employerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg',
        rating: ratingGiven,
        comment,
        date: 'Bugun',
        jobTitle: targetJob?.title || "Bajarilgan buyurtma",
        tags,
        isVerifiedOrder: true,
        likesCount: 1
      };

      setWorkers(prevWorkers => prevWorkers.map(w => {
        if (w.id === targetId || w.id === targetJob?.workerId) {
          const currentCount = w.reviewCount || 1;
          const currentRating = w.rating || 5.0;
          const newCount = currentCount + 1;
          const newRating = Number(((currentRating * currentCount + ratingGiven) / newCount).toFixed(2));
          return {
            ...w,
            rating: newRating,
            reviewCount: newCount,
            completedJobsCount: (w.completedJobsCount || 0) + 1,
            reviews: [newWorkerReview, ...(w.reviews || [])]
          };
        }
        return w;
      }));

      // Update selectedWorkerForProfile if open
      setSelectedWorkerForProfile(prev => {
        if (!prev || (prev.id !== targetId && prev.id !== targetJob?.workerId)) return prev;
        const currentCount = prev.reviewCount || 1;
        const currentRating = prev.rating || 5.0;
        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + ratingGiven) / newCount).toFixed(2));
        return {
          ...prev,
          rating: newRating,
          reviewCount: newCount,
          completedJobsCount: (prev.completedJobsCount || 0) + 1,
          reviews: [newWorkerReview, ...(prev.reviews || [])]
        };
      });

      pushNotification({
        type: 'review_added',
        title: `${ratingGiven}★ Ustaga baho va sharh saqlandi`,
        message: `${workerName}ning umumiy reytingi yangilandi (${ratingGiven}★). Minnatdorchilik uchun rahmat!`,
        timestamp: 'Hozirgina',
        jobId,
        workerId: targetJob?.workerId,
        badgeText: `${ratingGiven}.0 Baho`,
        actionText: "Profilni ko'rish"
      });

    } else {
      // 2. Worker rating Employer / Client!
      setJobs(prevJobs => prevJobs.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'completed' as const,
            workerReviewLeft: true,
            workerRatingGiven: ratingGiven,
            workerReviewComment: comment,
            workerReviewTags: tags,
            workerReviewedAt: 'Hozirgina'
          };
        }
        return j;
      }));

      // Update EmployerProfile cumulative average rating & add review
      const newEmployerReview = {
        id: `rev-e-${Date.now()}`,
        workerName: workerName,
        authorName: `${workerName} (Usta)`,
        authorRole: 'worker' as const,
        authorAvatar: targetJob?.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg',
        rating: ratingGiven,
        comment,
        date: 'Bugun',
        jobTitle: targetJob?.title || "Bajarilgan buyurtma",
        tags,
        isVerifiedOrder: true,
        likesCount: 1
      };

      setEmployers(prevEmployers => {
        const foundEmp = prevEmployers.find(e => e.name.toLowerCase() === employerName.toLowerCase() || e.id === targetId);
        if (foundEmp) {
          return prevEmployers.map(e => {
            if (e.id === foundEmp.id) {
              const currentCount = e.reviewCount || 1;
              const currentRating = e.rating || 5.0;
              const newCount = currentCount + 1;
              const newRating = Number(((currentRating * currentCount + ratingGiven) / newCount).toFixed(2));
              return {
                ...e,
                rating: newRating,
                reviewCount: newCount,
                completedJobsCount: (e.completedJobsCount || 0) + 1,
                reviews: [newEmployerReview, ...(e.reviews || [])]
              };
            }
            return e;
          });
        } else {
          const createdEmp: EmployerProfile = {
            id: `emp-${Date.now()}`,
            name: employerName,
            phone: targetJob?.employerPhone || '+998 90 123 45 67',
            avatarUrl: targetJob?.employerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg',
            city: targetJob?.city || 'Samarqand',
            district: targetJob?.district || 'Samarqand shahri (Markaz / Registon)',
            rating: ratingGiven,
            reviewCount: 1,
            completedJobsCount: 1,
            postedJobsCount: 1,
            paymentPunctualityRate: 100,
            memberSince: "2024-yildan beri a'zo",
            isVerified: true,
            bio: "HalolMehnat.uz tasdiqlangan buyurtmachisi.",
            reviews: [newEmployerReview]
          };
          return [createdEmp, ...prevEmployers];
        }
      });

      // Update selectedEmployerForProfile if open
      setSelectedEmployerForProfile(prev => {
        if (!prev || (prev.name.toLowerCase() !== employerName.toLowerCase() && prev.id !== targetId)) return prev;
        const currentCount = prev.reviewCount || 1;
        const currentRating = prev.rating || 5.0;
        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + ratingGiven) / newCount).toFixed(2));
        return {
          ...prev,
          rating: newRating,
          reviewCount: newCount,
          completedJobsCount: (prev.completedJobsCount || 0) + 1,
          reviews: [newEmployerReview, ...(prev.reviews || [])]
        };
      });

      pushNotification({
        type: 'review_added',
        title: `${ratingGiven}★ Buyurtmachiga baho berildi`,
        message: `${employerName}ga usta tomonidan ${ratingGiven}★ baho va fikr bildirildi.`,
        timestamp: 'Hozirgina',
        jobId,
        badgeText: `${ratingGiven}.0 Mijoz bahosi`
      });
    }

    if (isSoundEnabled) {
      playNotificationSound('cash');
    }
  };

  // Handler: Direct Chat between Employer & Worker
  const handleSendMessage = (
    jobId: string, 
    text: string, 
    senderRole: 'employer' | 'worker',
    extra?: {
      voiceAudioUrl?: string;
      voiceDurationSeconds?: number;
      isLocationShare?: boolean;
      locationCoords?: { lat: number; lng: number };
    }
  ) => {
    const currentJob = jobs.find(j => j.id === jobId);
    if (!currentJob) return;

    const senderName = senderRole === 'employer' 
      ? currentJob.employerName 
      : (currentJob.workerName || "Usta");

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId,
      senderRole,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      isRead: false,
      voiceAudioUrl: extra?.voiceAudioUrl,
      voiceDurationSeconds: extra?.voiceDurationSeconds,
      isLocationShare: extra?.isLocationShare,
      locationCoords: extra?.locationCoords
    };

    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const updatedMessages = [...(job.chatMessages || []), newMessage];
        const updatedJob = { ...job, chatMessages: updatedMessages };
        if (chatTargetJob?.id === jobId) {
          setChatTargetJob(updatedJob);
        }
        if (activeTrackingJob?.id === jobId) {
          setActiveTrackingJob(updatedJob);
        }
        return updatedJob;
      }
      return job;
    }));

    if (activeTrackingJob && activeTrackingJob.id === jobId) {
      setActiveTrackingJob(prev => prev ? {
        ...prev,
        chatMessages: [...(prev.chatMessages || []), newMessage]
      } : null);
    }

    if (isSoundEnabled) {
      playNotificationSound('message');
    }

    pushNotification({
      type: 'message',
      title: `Yangi xabar: ${senderName}`,
      message: text.length > 50 ? `${text.slice(0, 50)}...` : text,
      jobId: currentJob.id,
      jobTitle: currentJob.title,
      actionUrl: `/job/${currentJob.id}`
    });

    // Simulated lively response from the counterpart
    setTimeout(() => {
      const replyRole = senderRole === 'employer' ? 'worker' : 'employer';
      const replierName = replyRole === 'employer' 
        ? currentJob.employerName 
        : (currentJob.workerName || "Usta Farhod");

      const workerReplies = [
        "Xabaringizni oldim! Aytilgan vaqtda manzilga yetib boraman.",
        "Hammasi tushunarli, asboblarni olib chiqyapan.",
        "Rahmat! 10-15 daqiqada shu yerdaman.",
        "Mayli, albatta. Manzilga yetib kelgach telefon qilaman."
      ];
      const employerReplies = [
        "Katta rahmat! Sizni kutmoqdamiz.",
        "Iltimos, yetib kelgach xabar bering, darvozani ochib beramiz.",
        "Tushunarli, bemalol shoshilmasdan kelavering.",
        "Hammasi joyida, kerakli materiallar tayyor turibdi."
      ];

      const replyPool = replyRole === 'worker' ? workerReplies : employerReplies;
      const chosenReply = replyPool[Math.floor(Math.random() * replyPool.length)];

      const autoReplyMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        jobId,
        senderRole: replyRole,
        senderName: replierName,
        text: chosenReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        isRead: false
      };

      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          const updatedMessages = [...(job.chatMessages || []), autoReplyMessage];
          const updatedJob = { ...job, chatMessages: updatedMessages };
          setChatTargetJob(prev => prev && prev.id === jobId ? updatedJob : prev);
          setActiveTrackingJob(prev => prev && prev.id === jobId ? updatedJob : prev);
          return updatedJob;
        }
        return job;
      }));

      if (isSoundEnabled) {
        playNotificationSound('message');
      }

      pushNotification({
        type: 'message',
        title: `${replierName}dan javob:`,
        message: chosenReply,
        jobId: currentJob.id,
        jobTitle: currentJob.title
      });
    }, 1200);
  };

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'all' || job.district === selectedDistrict;
    const matchesSearch = !searchQuery.trim() || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.locationAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDistrict && matchesSearch;
  });

  const filteredWorkers = workers.filter((w) => {
    // Hide offline workers from the main workers catalog
    if (!w.isOnline) return false;
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'all' || w.district === selectedDistrict;
    const matchesSearch = !searchQuery.trim() || 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesDistrict && matchesSearch;
  });

  const studentWorkers = workers.filter(w => w.isOnline && w.isStudent);
  const studentJobs = jobs.filter(j => j.category === 'talabalar_ish' || j.category === 'yuk_mardikor');
  const cleaningWorkers = workers.filter(w => w.isOnline && (w.gender === 'ayol' || w.category === 'uy_tozalash_gen' || w.category === 'oyna_yuvish' || w.category === 'remontdan_keyin_tozalash' || w.category === 'dazmol_oshxona'));
  const cleaningJobs = jobs.filter(j => j.category === 'uy_tozalash_gen' || j.category === 'oyna_yuvish' || j.category === 'remontdan_keyin_tozalash' || j.category === 'dazmol_oshxona');

  // Completed jobs history
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const filteredCompletedJobs = completedJobs.filter((job) => {
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'all' || job.district === selectedDistrict;
    const matchesSearch = !searchQuery.trim() || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.locationAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.workerName && job.workerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesDistrict && matchesSearch;
  });

  // En-route jobs for the Radar tab
  const trackingJobs = jobs.filter(j => j.status === 'en_route' || j.status === 'arrived');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        onOpenCreateJob={() => {
          setInitialJobCategory(undefined);
          setInitialJobBudget(undefined);
          setIsCreateJobOpen(true);
        }}
        onOpenCommissionDashboard={() => setIsCommissionDashboardOpen(true)}
        onOpenPerformanceMetrics={() => setIsPerformanceMetricsOpen(true)}
        onOpenTradesDirectory={() => setIsTradesDirectoryOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenFAQ={() => setIsFAQOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
        onOpenMessenger={() => handleOpenMessenger()}
        unreadMessagesCount={unreadMessagesCount}
        currentRole={currentRole}
        onToggleRole={() => setCurrentRole(currentRole === 'employer' ? 'worker' : 'employer')}
        activeView={activeView}
        onSelectView={(v) => setActiveView(v)}
        activeJobsCount={jobs.filter(j => j.status === 'open').length}
        completedJobsCount={completedJobs.length}
        activeTrackingCount={trackingJobs.length}
        onOpenLiveTracking={() => {
          if (trackingJobs.length > 0) setActiveTrackingJob(trackingJobs[0]);
          else setActiveView('radar');
        }}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenMyProfile={handleOpenMyProfile}
        onOpenProfileEditor={() => handleOpenProfileEditor()}
      />

      {/* Real-time Notification Toast Stacking Container */}
      <NotificationToastContainer
        notifications={activeToasts}
        onDismiss={(id) => setActiveToasts(prev => prev.filter(t => t.id !== id))}
        onNotificationClick={(notif) => {
          handleNotificationAction(notif);
          setActiveToasts(prev => prev.filter(t => t.id !== notif.id));
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-6">

        {/* Real-Time Live GPS Tracking Banner for Employers (When worker is en route) */}
        {trackingJobs.length > 0 && (
          <div className="bg-stone-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-xl border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="w-4 h-4 rounded-full bg-emerald-400"></span>
                <span className="absolute w-7 h-7 rounded-full bg-emerald-400/40 animate-ping"></span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
                    JONLI GPS KUZATUV
                  </span>
                  <span className="text-sm font-bold text-white">
                    {trackingJobs[0].workerName || "Usta"} siz tomon yo'lda kelmoqda!
                  </span>
                </div>
                <div className="text-xs text-stone-300 mt-1 flex items-center gap-3 flex-wrap">
                  <span>
                    Qolgan masofa: <b className="text-emerald-400 font-mono text-sm">{trackingJobs[0].workerDistanceKm || 3.4} km</b>
                  </span>
                  <span>·</span>
                  <span>
                    Taxminiy kelish vaqti: <b className="text-amber-300 font-mono text-sm">{trackingJobs[0].workerEtaMinutes || 12} daqiqa</b>
                  </span>
                  <span>·</span>
                  <span className="text-stone-400">{trackingJobs[0].locationAddress}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setActiveTrackingJob(trackingJobs[0])}
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 whitespace-nowrap"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Xaritada jonli ko'rish</span>
              </button>

              <a
                href={`tel:${trackingJobs[0].workerPhone || '+998934567890'}`}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                title="Qo'ng'iroq qilish"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Qo'ng'iroq</span>
              </a>
            </div>
          </div>
        )}

        {/* Ultra-Simple Visual Guide for Everyday Users */}
        <EasyStartGuide
          onOpenQuickOrder={() => setIsQuickOrderOpen(true)}
          onSelectWorkerMode={() => {
            setCurrentRole('worker');
            setActiveView('jobs');
          }}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          onOpenTradesDirectory={() => setIsTradesDirectoryOpen(true)}
          onOpenShare={() => setIsShareModalOpen(true)}
          currentRole={currentRole}
        />

        {/* Hero Section */}
        {activeView === 'jobs' && (
          <HeroBanner
            onOpenCreateJob={() => {
              setInitialJobCategory(undefined);
              setInitialJobBudget(undefined);
              setIsCreateJobOpen(true);
            }}
            onOpenRegisterWorker={() => setIsRegisterWorkerOpen(true)}
            onOpenTradesDirectory={() => setIsTradesDirectoryOpen(true)}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            selectedCategory={selectedCategory}
          />
        )}

        {/* Women Services Banner */}
        {(activeView === 'jobs' || activeView === 'cleaning') && (
          <WomenServicesBanner
            onFilterCleaningGigs={() => {
              setSelectedCategory('uy_tozalash_gen');
              setActiveView('jobs');
            }}
            onOpenRegisterWorker={() => setIsRegisterWorkerOpen(true)}
            onOpenCreateCleaningJob={() => {
              setInitialJobCategory('uy_tozalash_gen');
              setInitialJobBudget(350000);
              setIsCreateJobOpen(true);
            }}
          />
        )}

        {/* Student Zone Banner */}
        {(activeView === 'jobs' || activeView === 'students') && (
          <StudentZoneBanner
            onFilterStudentGigs={() => {
              setSelectedCategory('talabalar_ish');
              setActiveView('jobs');
            }}
            onOpenRegisterStudent={() => setIsRegisterWorkerOpen(true)}
          />
        )}

        {/* Top Ustalari Leaderboard Section (Highlights top 5 highest-rated workers) */}
        {(activeView === 'jobs' || activeView === 'workers') && (
          <TopWorkersLeaderboard
            workers={workers}
            onSelectWorker={(worker) => setSelectedWorkerForProfile(worker)}
            onOpenRegisterWorker={() => setIsRegisterWorkerOpen(true)}
          />
        )}

        {/* Navigation & Search Control Bar */}
        <div className="space-y-3">
          
          {/* View switcher tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-stone-200/80 rounded-xl">
              <button
                onClick={() => setActiveView('jobs')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeView === 'jobs' 
                    ? 'bg-white text-stone-900 shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                E'lonlar & Buyurtmalar ({jobs.length})
              </button>

              <button
                onClick={() => setActiveView('workers')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeView === 'workers' 
                    ? 'bg-white text-stone-900 shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Usta & Mardikorlar ({workers.length})
              </button>

              <button
                onClick={() => setActiveView('completed')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'completed' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bajarilgan ishlar ({completedJobs.length})</span>
              </button>

              <button
                onClick={() => setActiveView('cleaning')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                  activeView === 'cleaning' 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🌸 Ayollar & Tozalik ({cleaningWorkers.length})</span>
              </button>

              <button
                onClick={() => setActiveView('students')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeView === 'students' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Talabalar Ligasi ({studentWorkers.length})
              </button>

              <button
                onClick={() => setActiveView('radar')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeView === 'radar' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Jonli Radar ({trackingJobs.length})</span>
              </button>
            </div>

            {/* Role indicator badge */}
            <div className="text-xs text-stone-500 flex items-center gap-2">
              <span>Hozirgi holat:</span>
              <span className="font-semibold text-stone-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                {currentRole === 'employer' ? '🏠 Ish beruvchi' : '🔨 Usta / Ishchi'}
              </span>
            </div>
          </div>

          {/* Search & Category Filter bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ish nomi, usta ismi yoki manzil bo'yicha qidirish..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            {/* District dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium text-stone-700"
              >
                <option value="all">Barcha tumanlar (Samarqand viloyati)</option>
                {SAMARKAND_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="md:col-span-3 flex items-center gap-2 justify-end">
              <button
                onClick={() => setIsRegisterWorkerOpen(true)}
                className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Usta ro'yxatdan o'tish</span>
              </button>
            </div>

          </div>

          {/* Category Horizontal Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
            <button
              onClick={() => setIsTradesDirectoryOpen(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm"
              title="Barcha ustachilik sohalari va narxlar kalkulyatori"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Narxlar Kalkulyatori</span>
            </button>

            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* VIEW 1: JOBS FEED */}
        {activeView === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-stone-900">
                  Faol Buyurtmalar & E'lonlar
                </h2>
                <p className="text-xs text-stone-500">
                  Ustalar uydan turib qabul qilishi mumkin bo'lgan buyurtmalar ro'yxati
                </p>
              </div>

              <span className="text-xs font-mono font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                Jami: {filteredJobs.length} ta
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
                <p className="text-stone-500 text-sm">
                  Ushbu filter bo'yicha buyurtmalar topilmadi.
                </p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSelectedDistrict('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onOpenLiveTracking={(j) => setActiveTrackingJob(j)}
                    onAcceptJob={handleAcceptJob}
                    onOpenReviewModal={(j, role) => handleOpenReviewModal(j, role)}
                    onOpenChat={(j) => handleOpenMessenger(j.workerId || 'partner', j.id)}
                    onOpenCompleteModal={(j) => setCompletingTargetJob(j)}
                    onOpenEmployerProfile={handleOpenEmployerProfile}
                    onOpenWorkerProfile={handleOpenWorkerProfileById}
                    onOpenSubmitProposal={(j) => setProposalTargetJob(j)}
                    onAcceptProposal={(j, prop) => handleAcceptProposal(j, prop)}
                    onOpenMessenger={(partnerId, jId) => handleOpenMessenger(partnerId, jId)}
                    currentRole={currentRole}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: WORKERS CATALOG */}
        {activeView === 'workers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-stone-900">
                    Usta va Mardikorlar Vitrinasi
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {filteredWorkers.length} nafar Online
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Hozirda buyurtma kutayotgan faol mutaxassislar (Offline holatdagi ustalar vitrinada ko'rinmaydi)
                </p>
              </div>

              <button
                onClick={() => setIsRegisterWorkerOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                + Ro'yxatdan o'tish
              </button>
            </div>

            {filteredWorkers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
                <p className="text-stone-700 font-bold text-sm">
                  Hozirda faol online ustalar topilmadi
                </p>
                <p className="text-stone-500 text-xs max-w-md mx-auto">
                  Tanlangan toifa yoki qidiruv bo'yicha barcha ustalar hozirda "Offline" rejimida yoki buyurtmalar bilan band.
                </p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSelectedDistrict('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onSelectWorker={(w) => setSelectedWorkerForProfile(w)}
                    onHireWorker={handleHireWorker}
                    onOpenChat={(w) => handleOpenMessenger(w.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: STUDENTS LEAGUE */}
        {activeView === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-stone-900">
                  Talabalar Uchun Halol Ishlar & Talaba Ishchilar
                </h2>
                <p className="text-xs text-stone-500">
                  Mardikor bozoriga borishga uyaladigan talabalar uchun qulay, obro'li va darsdan keyingi buyurtmalar
                </p>
              </div>

              <button
                onClick={() => setIsRegisterWorkerOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Talaba sifatida qo'shilish
              </button>
            </div>

            {/* Students workers list */}
            <div>
              <h3 className="text-sm font-bold text-stone-800 mb-3">
                Ishga tayyor talaba yoshlar:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onSelectWorker={(w) => setSelectedWorkerForProfile(w)}
                    onHireWorker={handleHireWorker}
                    onOpenChat={(w) => handleOpenMessenger(w.id)}
                  />
                ))}
              </div>
            </div>

            {/* Student-friendly jobs */}
            <div className="pt-6">
              <h3 className="text-sm font-bold text-stone-800 mb-3">
                Talabalar uchun mos ochiq e'lonlar:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onOpenLiveTracking={(j) => setActiveTrackingJob(j)}
                    onAcceptJob={handleAcceptJob}
                    onOpenReviewModal={(j, role) => handleOpenReviewModal(j, role)}
                    onOpenChat={(j) => handleOpenMessenger(j.workerId || 'partner', j.id)}
                    onOpenCompleteModal={(j) => setCompletingTargetJob(j)}
                    onOpenEmployerProfile={handleOpenEmployerProfile}
                    onOpenWorkerProfile={handleOpenWorkerProfileById}
                    onOpenSubmitProposal={(j) => setProposalTargetJob(j)}
                    onAcceptProposal={(j, prop) => handleAcceptProposal(j, prop)}
                    onOpenMessenger={(partnerId, jId) => handleOpenMessenger(partnerId, jId)}
                    currentRole={currentRole}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3.5: AYOLAR & TOZALIK XIZMATLARI */}
        {activeView === 'cleaning' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-stone-900">
                    Sarishta Bekalar & Uy Tozalash Xizmatlari
                  </h2>
                </div>
                <p className="text-xs text-stone-500">
                  General uborka, deraza va oyna yuvish, xonadonlarni tartibga keltirish bo'yicha ishonchli ayol mutaxassislar
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setInitialJobCategory('uy_tozalash_gen');
                    setInitialJobBudget(350000);
                    setIsCreateJobOpen(true);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>+ Tozalashga buyurtma berish 🌸</span>
                </button>

                <button
                  onClick={() => setIsRegisterWorkerOpen(true)}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200 transition-colors"
                >
                  Sarishta beka bo'lib qo'shilish
                </button>
              </div>
            </div>

            {/* Women Specialists Showcase */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-800">
                  Ishonchli Sarishta Bekalar & Tozalik ustalari:
                </h3>
                <span className="text-xs font-mono text-stone-500 font-semibold">
                  {cleaningWorkers.length} nafar mutaxassis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cleaningWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onSelectWorker={(w) => setSelectedWorkerForProfile(w)}
                    onHireWorker={handleHireWorker}
                    onOpenChat={(w) => handleOpenMessenger(w.id)}
                  />
                ))}
              </div>
            </div>

            {/* Open Cleaning Job Requests */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-800">
                  Faol tozalash va oyna yuvish buyurtmalari:
                </h3>
                <span className="text-xs font-mono text-stone-500 font-semibold">
                  {cleaningJobs.length} ta ochiq buyurtma
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cleaningJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onOpenLiveTracking={(j) => setActiveTrackingJob(j)}
                    onAcceptJob={handleAcceptJob}
                    onOpenReviewModal={(j, role) => handleOpenReviewModal(j, role)}
                    onOpenChat={(j) => handleOpenMessenger(j.workerId || 'partner', j.id)}
                    onOpenCompleteModal={(j) => setCompletingTargetJob(j)}
                    onOpenEmployerProfile={handleOpenEmployerProfile}
                    onOpenWorkerProfile={handleOpenWorkerProfileById}
                    onOpenSubmitProposal={(j) => setProposalTargetJob(j)}
                    onAcceptProposal={(j, prop) => handleAcceptProposal(j, prop)}
                    onOpenMessenger={(partnerId, jId) => handleOpenMessenger(partnerId, jId)}
                    currentRole={currentRole}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: LIVE RADAR SCREEN */}
        {activeView === 'radar' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                    Jonli Radar & Ishchilarni Kuzatish
                  </h2>
                </div>
                <p className="text-xs text-stone-300">
                  Buyurtmachi usta yo'lda kelayotganini, qancha masofa qolganini va telefon koordinatasini real vaqtda ko'radi
                </p>
              </div>

              {trackingJobs.length > 0 && (
                <button
                  onClick={() => setActiveTrackingJob(trackingJobs[0])}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Xaritani to'liq ekranda ochish</span>
                </button>
              )}
            </div>

            {trackingJobs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
                <Navigation className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="text-stone-700 font-semibold text-sm">
                  Hozirda yo'lda kelayotgan usta yo'q
                </p>
                <p className="text-stone-500 text-xs max-w-md mx-auto">
                  Istalgan ochiq buyurtmada "Zakazni qabul qilish" tugmasini bosing yoki ustani ishga chaqiring. Usta darhol yo'lga chiqadi va radarda ko'rinadi!
                </p>
                <button
                  onClick={() => setActiveView('jobs')}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
                >
                  Buyurtmalarga o'tish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackingJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {job.status === 'en_route' ? "Yo'lda kelmoqda" : "Yetib keldi"}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-900">
                        {job.budgetUzs.toLocaleString()} so'm
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm">{job.title}</h3>

                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <img 
                        src={job.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg'} 
                        alt="Usta" 
                        className="w-10 h-10 rounded-full object-cover border border-amber-400"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900">{job.workerName}</div>
                        <div className="text-[11px] text-stone-500">{job.workerRole}</div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          Taxminiy kelish vaqti: {job.workerEtaMinutes || 12} daqiqa
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTrackingJob(job)}
                        className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Jonli xarita & Radar</span>
                      </button>

                      <button
                        onClick={() => setChatTargetJob(job)}
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                        title="Usta bilan to'g'ridan-to'g'ri xabar yozish (Chat)"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-stone-950" />
                        <span>Chat</span>
                        {job.chatMessages && job.chatMessages.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-950 text-amber-300 font-mono">
                            {job.chatMessages.length}
                          </span>
                        )}
                      </button>

                      <a
                        href={`tel:${job.workerPhone}`}
                        className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Qo'ng'iroq</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: COMPLETED JOBS HISTORY */}
        {activeView === 'completed' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-stone-900">
                      Bajarilgan Ishlar Tarixi
                    </h2>
                    <p className="text-xs text-stone-500">
                      Muvaffaqiyatli topshirilgan buyurtmalar, qoldirilgan sharhlar va to'lov kvitansiyalari
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics Strip */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <span className="text-stone-500 block text-[10px]">Jami yakunlangan:</span>
                  <span className="font-mono font-bold text-emerald-900">{completedJobs.length} ta buyurtma</span>
                </div>

                <div className="px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <span className="text-stone-500 block text-[10px]">Umumiy to'langan summa:</span>
                  <span className="font-mono font-bold text-amber-900">
                    {completedJobs.reduce((acc, j) => acc + (j.budgetUzs || 0), 0).toLocaleString()} so'm
                  </span>
                </div>

                <div className="px-3 py-1.5 bg-stone-100 rounded-xl border border-stone-200 text-xs flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-stone-900">5.0</span>
                  <span className="text-stone-500 text-[10px]">(A'lo sifat)</span>
                </div>
              </div>
            </div>

            {/* Recharts Monthly Performance Trend Data Visualization */}
            <CompletedJobsTrendChart completedJobs={completedJobs} />

            {/* Before / After Guarantee & Showcase Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <span>"Oldin / Keyin" fotosuratlari orqali haqiqiy sifat nazorati</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      100% Halol Natija
                    </span>
                  </div>
                  <p className="text-stone-600 mt-0.5">
                    Usta topshirgan har bir ish kartasida interaktiv <b>Slayder</b> yoki <b>Yonma-yon</b> taqqoslash orqali boshlang'ich va yakuniy natijani bevosita tekshirishingiz mumkin.
                  </p>
                </div>
              </div>
            </div>

            {/* Filtered jobs list or empty state */}
            {filteredCompletedJobs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-stone-800 font-bold text-base">
                  Hozircha bajarilgan ishlar topilmadi
                </h3>
                <p className="text-stone-500 text-xs max-w-md mx-auto">
                  {searchQuery || selectedCategory !== 'all' || selectedDistrict !== 'all'
                    ? "Ushbu tanlangan filtr yoki qidiruv so'zi bo'yicha yakunlangan ishlar yo'q."
                    : "Buyurtmalar topshirilgach va ish beruvchi qabul qilgach, barcha yakunlangan ishlar avtomatik shu yerda aks etadi."}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => { setSelectedCategory('all'); setSelectedDistrict('all'); setSearchQuery(''); }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Filtrlarni tozalash
                  </button>
                  <button
                    onClick={() => setActiveView('jobs')}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Faol buyurtmalarni ko'rish
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompletedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onOpenLiveTracking={(j) => setActiveTrackingJob(j)}
                    onAcceptJob={handleAcceptJob}
                    onOpenReviewModal={(j, role) => handleOpenReviewModal(j, role)}
                    onOpenChat={(j) => handleOpenMessenger(j.workerId || 'partner', j.id)}
                    onOpenCompleteModal={(j) => setCompletingTargetJob(j)}
                    onOpenEmployerProfile={handleOpenEmployerProfile}
                    onOpenWorkerProfile={handleOpenWorkerProfileById}
                    onOpenMessenger={(partnerId, jId) => handleOpenMessenger(partnerId, jId)}
                    currentRole={currentRole}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xs">
              H
            </span>
            <span className="font-bold text-stone-900">
              HalolMehnat<span className="text-amber-500 font-black">.uz</span>
            </span>
            <span>— Sovuqda ko'chada kutishga chek qo'yuvchi tezkor platforma</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-stone-700 hover:text-stone-900 font-bold hover:underline flex items-center gap-1"
            >
              <span>🌐 .UZ Domen & Boshqalar qanday topadi?</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsFAQOpen(true)}
              className="text-stone-700 hover:text-stone-900 font-bold hover:underline flex items-center gap-1"
            >
              <span>❓ FAQ (Savol-Javoblar)</span>
            </button>
            <span>·</span>
            <button 
              onClick={() => setIsCommissionDashboardOpen(true)}
              className="text-amber-700 font-semibold hover:underline"
            >
              20 000 so'mlik kassa hisoboti
            </button>
            <span>·</span>
            <button 
              onClick={() => setIsPerformanceMetricsOpen(true)}
              className="text-amber-800 hover:text-amber-950 font-bold hover:underline flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-300"
            >
              <span>📊 Admin: Performance Metrikalar</span>
            </button>
            <span>·</span>
            <span>Samarqand viloyati va shahri, O'zbekiston</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Live Tracking Modal */}
      {activeTrackingJob && (
        <LiveTrackingRadar
          job={activeTrackingJob}
          allJobs={jobs}
          onClose={() => setActiveTrackingJob(null)}
          onUpdateJobStatus={handleUpdateJobStatus}
          onRequestReview={(j) => setReviewTargetJob(j)}
          onOpenChat={(j) => setChatTargetJob(j)}
          onOpenCompleteModal={(j) => setCompletingTargetJob(j)}
          onWorkerApproaching={handleWorkerApproaching}
          onSendMessage={handleSendMessage}
          currentRole={currentRole}
        />
      )}

      {/* 2. Create Job Modal */}
      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => {
          setIsCreateJobOpen(false);
          setInitialJobCategory(undefined);
          setInitialJobBudget(undefined);
        }}
        onCreateJob={handleCreateJob}
        initialCategory={initialJobCategory}
        initialBudget={initialJobBudget}
      />

      {/* 2.5 Trades Directory & Pricing Calculator Modal */}
      <TradesDirectoryModal
        isOpen={isTradesDirectoryOpen}
        onClose={() => setIsTradesDirectoryOpen(false)}
        onSelectTradeForJob={(cat, calculatedBudget) => {
          setInitialJobCategory(cat);
          setInitialJobBudget(calculatedBudget);
          setIsCreateJobOpen(true);
        }}
      />

      {/* 3. Register Worker Modal */}
      <RegisterWorkerModal
        isOpen={isRegisterWorkerOpen}
        onClose={() => setIsRegisterWorkerOpen(false)}
        onRegisterWorker={handleRegisterWorker}
      />

      {/* 4. Worker Profile Modal */}
      <WorkerProfileModal
        worker={selectedWorkerForProfile}
        onClose={() => setSelectedWorkerForProfile(null)}
        onHireWorker={handleHireWorker}
        onToggleOnlineStatus={handleToggleWorkerOnlineStatus}
        onOpenReviewModal={(w) => {
          let j = jobs.find(job => job.workerId === w.id);
          if (!j) {
            j = {
              id: `job-review-${w.id}`,
              title: `${w.roleTitle} xizmati`,
              category: w.category,
              categoryLabel: w.categoryLabel || 'Ustachilik',
              description: `${w.name} bajargan ish xizmati`,
              district: w.district,
              locationAddress: `${w.district}, Samarqand`,
              city: 'Samarqand',
              targetCoords: { lat: 39.6542, lng: 66.9597 },
              budgetUzs: w.dailyRateUzs,
              paymentType: 'kunlik',
              urgent: false,
              mealProvided: true,
              toolsProvided: true,
              workersNeeded: 1,
              employerName: 'Alisher Qodirov (Buyurtmachi)',
              employerPhone: '+998 90 123 45 67',
              employerAvatar: '/src/assets/images/master_craftsman_portrait_1791274865042.jpg',
              workerId: w.id,
              workerName: w.name,
              workerPhone: w.phone,
              workerAvatar: w.avatarUrl,
              workerRole: w.roleTitle,
              workerRating: w.rating,
              commissionAmount: 20000,
              commissionPaid: true,
              status: 'completed',
              createdAt: 'Bugun'
            };
          }
          setSelectedWorkerForProfile(null);
          handleOpenReviewModal(j, 'worker');
        }}
        onEditProfile={(w) => handleOpenProfileEditor(w)}
        onOpenChat={(w) => {
          setSelectedWorkerForProfile(null);
          handleOpenMessenger(w.id);
        }}
      />

      {/* 4.25 Profile Editor Modal (Personal information, skills, hourly rates) */}
      <ProfileEditorModal
        isOpen={isProfileEditorOpen}
        worker={editingWorker}
        onClose={() => setIsProfileEditorOpen(false)}
        onSaveProfile={handleSaveWorkerProfile}
      />

      {/* 4.5. Employer Profile Modal */}
      <EmployerProfileModal
        employer={selectedEmployerForProfile}
        isOpen={Boolean(selectedEmployerForProfile)}
        onClose={() => setSelectedEmployerForProfile(null)}
        onOpenReviewModal={() => {
          if (selectedEmployerForProfile) {
            const j = jobs.find(job => job.employerName.toLowerCase() === selectedEmployerForProfile.name.toLowerCase()) || jobs[0];
            if (j) {
              setSelectedEmployerForProfile(null);
              handleOpenReviewModal(j, 'employer');
            }
          }
        }}
      />

      {/* 5. Commission Dashboard Modal */}
      <CommissionDashboardModal
        isOpen={isCommissionDashboardOpen}
        onClose={() => setIsCommissionDashboardOpen(false)}
        transactions={transactions}
        cardNumber={cardNumber}
        cardHolder={cardHolder}
        onUpdateCard={(num, name) => {
          setCardNumber(num);
          setCardHolder(name);
          localStorage.setItem('halol_mehnat_card', num);
          localStorage.setItem('halol_mehnat_card_holder', name);
          showToast("Karta rekvizitlari muvaffaqiyatli saqlandi!");
        }}
        onOpenPerformanceMetrics={() => setIsPerformanceMetricsOpen(true)}
      />

      {/* 6. Rating & Review Modal (Bidirectional for Worker and Employer) */}
      <ReviewModal
        job={reviewTargetJob}
        isOpen={Boolean(reviewTargetJob)}
        onClose={() => setReviewTargetJob(null)}
        initialTargetRole={reviewModalTargetRole}
        onSubmitReview={handleSubmitReview}
      />

      {/* 6.5 Direct Job Chat Modal between Employer & Worker */}
      {chatTargetJob && (
        <JobChatModal
          isOpen={Boolean(chatTargetJob)}
          onClose={() => setChatTargetJob(null)}
          job={chatTargetJob}
          currentRole={currentRole}
          onSendMessage={handleSendMessage}
          onOpenPartnerProfile={(role, idOrName) => {
            if (role === 'worker') {
              handleOpenWorkerProfileById(idOrName);
            } else {
              handleOpenEmployerProfile(idOrName);
            }
          }}
        />
      )}

      {/* 6.6 Full Platform Messenger Modal (Threads, Voice notes, Location sharing, Proposals) */}
      <MessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(convId) => {
          setActiveConversationId(convId);
          setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
        }}
        onSendMessage={handleSendMessengerMessage}
        onAcceptProposal={(jobId, amount, workerId) => {
          const targetJob = jobs.find(j => j.id === jobId) || jobs[0];
          const proposal: JobProposal = {
            id: `prop-chat-${Date.now()}`,
            jobId: targetJob.id,
            jobTitle: targetJob.title,
            workerId,
            workerName: targetJob.workerName || "Usta",
            workerAvatar: targetJob.workerAvatar,
            workerPhone: targetJob.workerPhone || "+998 90 123 45 67",
            workerRating: targetJob.workerRating || 4.9,
            workerCategory: targetJob.categoryLabel,
            proposedPriceUzs: amount,
            estimatedDuration: "Kelishilgan",
            coverNote: "Messenjerdagi narx taklifi qabul qilindi",
            createdAt: 'Hozirgina',
            status: 'accepted'
          };
          handleAcceptProposal(targetJob, proposal);
        }}
        currentRole={currentRole}
        availableWorkers={workers}
        onStartNewConversation={handleStartNewConversation}
      />

      {/* 6.65 Worker Submit Proposal Modal */}
      {proposalTargetJob && (
        <SubmitProposalModal
          isOpen={Boolean(proposalTargetJob)}
          onClose={() => setProposalTargetJob(null)}
          job={proposalTargetJob}
          currentWorker={workers[0]}
          onSubmitProposal={handleSubmitProposal}
        />
      )}

      {/* 6.75 Complete Job & Before/After Photo Upload Modal */}
      <CompleteJobModal
        job={completingTargetJob}
        isOpen={Boolean(completingTargetJob)}
        onClose={() => setCompletingTargetJob(null)}
        onConfirmComplete={handleFinalizeJobCompletion}
      />

      {/* 7. How It Works Guide Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenCreateJob={() => {
          setInitialJobCategory(undefined);
          setInitialJobBudget(undefined);
          setIsCreateJobOpen(true);
        }}
        onOpenRegisterWorker={() => setIsRegisterWorkerOpen(true)}
        onOpenCommissionDashboard={() => setIsCommissionDashboardOpen(true)}
      />

      {/* 8. Notification History Modal */}
      <NotificationHistoryModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        onClearAll={() => setNotifications([])}
        onDeleteNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        onNotificationAction={handleNotificationAction}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
        onTriggerSimulatedNotification={triggerSimulatedNotification}
      />

      {/* 9. Ultra-Simple 1-Minute Quick Order Modal */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        onCreateJob={handleCreateJob}
      />

      {/* 10. Platform Share & QR Code Modal */}
      <SharePlatformModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* 11. FAQ Questions & Answers Modal */}
      <FAQModal
        isOpen={isFAQOpen}
        onClose={() => setIsFAQOpen(false)}
        onOpenCreateJob={() => {
          setInitialJobCategory(undefined);
          setInitialJobBudget(undefined);
          setIsCreateJobOpen(true);
        }}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenCommissionDashboard={() => setIsCommissionDashboardOpen(true)}
      />

      {/* 12. Performance Metrics Dashboard (Recharts Commission, Ratios & Daily Activity) */}
      <PerformanceMetricsModal
        isOpen={isPerformanceMetricsOpen}
        onClose={() => setIsPerformanceMetricsOpen(false)}
        jobs={jobs}
        workers={workers}
        transactions={transactions}
      />

      {/* Floating Fast Help Button for Users Struggling with Technology */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsQuickOrderOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-full shadow-2xl flex items-center gap-2 text-xs transition-transform active:scale-95 border-2 border-white"
          title="Oddiy va tez usta chaqirish (1 daqiqa)"
        >
          <PlusCircle className="w-4 h-4 text-stone-950" />
          <span>Tezkor Usta Chaqirish</span>
        </button>
        <a
          href="tel:+998662000000"
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-95 border-2 border-white"
          title="Operatorga qo'ng'iroq qilish: +998 (66) 200-00-00"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
}
