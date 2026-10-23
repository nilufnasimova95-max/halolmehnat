export type JobCategory = 
  | 'devor_terish'             // G'isht terish & Bino
  | 'kafel_marmar'             // Kafel, Keramogranit & Marmar
  | 'suvoq_malyar'             // Suvoq, Shpaklyovka, Malyarka, Travertin
  | 'tom_krovlya'              // Tom yopish, Tunukasozlik, Profnastil
  | 'santexnik'                // Santexnika, Issiq pol, Kotyol, Trubalar
  | 'elektrik'                 // Elektr montaj, Shit, Podsvetka
  | 'svarka_temir'             // Payvandchi / Svarka, Darvoza, Naves
  | 'duradgor_mebel'           // Duradgor, Eshik-rom, Mebel yig'ish, Laminat
  | 'gipsokarton_shift'        // Gipsokarton, Natyajnoy shift
  | 'beton_fundament'          // Betonchi, Poydevor, Monolit, Armatura
  | 'fasad_izolyatsiya'        // Fasad, Penopleks, Izolyatsiya
  | 'pechka_tandir'            // Pechka, Tandir, O'choq, Kamin
  | 'bruschatka_yer'           // Bruschatka, Hovli tekislash, Drenaj
  | 'maishiy_texnika'          // Konditsioner montaj, Xolodilnik ta'miri
  | 'uy_tozalash_gen'          // Ayollar: General Uborka & Boshdan-oyoq tozalash
  | 'oyna_yuvish'              // Ayollar: Deraza & Oyna yuvish
  | 'remontdan_keyin_tozalash' // Ayollar: Ta'mirdan keyingi tozalash
  | 'dazmol_oshxona'           // Ayollar: Dazmol, Kir yuvish & Oshxona
  | 'enaga_parvarish'          // Ayollar: Bolalar & Qariyalar parvarishi
  | 'talabalar_ish'            // Talabalar ligasi - Yordamchi ishlar
  | 'yuk_mardikor'             // Yuk ko'chirish, Qora ish, Mardikor
  | 'boshqa';

export interface CraftPriceRate {
  id: string;
  category: JobCategory;
  tradeName: string;
  unit: string; // e.g. "kv.m", "dona", "nuqta", "kunlik"
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  description: string;
}

export type JobStatus = 
  | 'open'          // E'lon berilgan, kutilmoqda
  | 'assigned'      // Ishchi zakazni qabul qildi
  | 'en_route'      // Ishchi yo'lda kelmoqda (GPS kuzatuv faol)
  | 'arrived'       // Yetib keldi
  | 'in_progress'   // Ish jarayonda
  | 'completed'     // Bajarildi
  | 'cancelled';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface JobOrder {
  id: string;
  title: string;
  category: JobCategory;
  categoryLabel: string;
  description: string;
  photoUrl?: string;
  voiceNoteAudioUrl?: string;
  voiceDurationSeconds?: number;
  locationAddress: string;
  city: string;
  district: string;
  targetCoords: Coordinates;
  budgetUzs: number;
  paymentType: 'kunlik' | 'ishbay' | 'soatlik';
  urgent: boolean;
  mealProvided: boolean;
  toolsProvided: boolean;
  workersNeeded: number;
  status: JobStatus;
  
  // Employer details
  employerName: string;
  employerPhone: string;
  employerAvatar?: string;
  
  // Assigned Worker details (if assigned)
  workerId?: string;
  workerName?: string;
  workerPhone?: string;
  workerAvatar?: string;
  workerRole?: string;
  workerRating?: number;
  workerCurrentCoords?: Coordinates;
  workerEtaMinutes?: number;
  workerDistanceKm?: number;
  workerSpeedKmh?: number;

  // Platform commission (20,000 UZS)
  commissionAmount: number;
  commissionPaid: boolean;
  commissionReceiptId?: string;
  
  // Employer Review & Rating (Client rating Worker)
  reviewLeft?: boolean;
  ratingGiven?: number;
  reviewComment?: string;
  reviewTags?: string[];
  reviewedAt?: string;

  // Worker Review & Rating (Worker rating Client/Employer)
  workerReviewLeft?: boolean;
  workerRatingGiven?: number;
  workerReviewComment?: string;
  workerReviewTags?: string[];
  workerReviewedAt?: string;

  // Direct Job Chat Messages between Employer & Worker
  chatMessages?: ChatMessage[];

  // Before & After Photos for Completed Work
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  completionNote?: string;
  completedAt?: string;

  // Worker Proposals / Bids for this job order
  proposals?: JobProposal[];

  createdAt: string;
}

export interface JobProposal {
  id: string;
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  workerAvatar?: string;
  workerPhone: string;
  workerRating: number;
  workerCategory: string;
  proposedPriceUzs: number;
  estimatedDuration: string; // e.g. "Bugun (3-4 soat)", "1 kun", "3 kun"
  coverNote: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderRole: 'employer' | 'worker';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  createdAt: number;
  isRead?: boolean;
  voiceAudioUrl?: string;
  voiceDurationSeconds?: number;
  isLocationShare?: boolean;
  locationCoords?: Coordinates;
}

export interface ReviewItem {
  id: string;
  employerName?: string;
  workerName?: string;
  authorName?: string;
  authorRole?: 'employer' | 'worker';
  authorAvatar?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  jobTitle: string;
  tags?: string[];
  isVerifiedOrder?: boolean;
  likesCount?: number;
  userLiked?: boolean;
  targetRole?: 'worker' | 'employer';
}

export interface EmployerProfile {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  city: string;
  district: string;
  rating: number; // e.g. 4.95
  reviewCount: number;
  completedJobsCount: number;
  postedJobsCount: number;
  paymentPunctualityRate: number; // e.g. 100%
  memberSince: string;
  isVerified: boolean;
  bio: string;
  reviews: ReviewItem[];
}

export interface WorkExperienceItem {
  id: string;
  jobTitle: string; // e.g. "Registon mavzesi — 2 qavatli xususiy uy devor terish"
  clientOrLocation?: string; // e.g. "Samarqand sh., Registon"
  period?: string; // e.g. "2023 - 2024"
  description: string; // e.g. "Pishiq g'ishtdan mustahkam devorlar terildi, poydevor va fasad ishlari sifatli yakunlandi."
  photoUrl?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  category: JobCategory;
  categoryLabel: string;
  roleTitle: string; // e.g. "G'isht teruvchi usta", "Talaba-yordamchi"
  skills: string[];
  experience: string;
  pastExperiences?: WorkExperienceItem[];
  dailyRateUzs: number;
  hourlyRateUzs?: number;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  phone: string;
  city: string;
  district: string;
  bio: string;
  avatarUrl: string;
  isOnline: boolean;
  isStudent: boolean;
  studentUniversity?: string;
  gender?: 'ayol' | 'erkak';
  portfolioPhotos: string[];
  currentCoords: Coordinates;
  reviews?: ReviewItem[];
}

export interface CommissionTransaction {
  id: string;
  orderId: string;
  orderTitle: string;
  employerName: string;
  workerName: string;
  amountUzs: number; // 20,000 UZS
  paymentMethod: 'Uzcard' | 'Humo' | 'Payme' | 'Click';
  recipientCard: string;
  recipientName: string;
  timestamp: string;
  status: 'muvaffaqiyatli' | 'kutilmoqda';
}

export type NotificationType = 
  | 'new_order'          // 'Yangi buyurtma keldi'
  | 'new_proposal'       // 'Yangi narx taklifi / bid tushdi'
  | 'proposal_accepted'  // 'Taklifingiz qabul qilindi'
  | 'status_change'      // 'Buyurtma holati o'zgardi'
  | 'worker_en_route'    // 'Usta yo\'lga chiqdi'
  | 'worker_arrived'     // 'Usta manzilga yetib keldi'
  | 'job_started'        // 'Ish boshlandi'
  | 'job_completed'      // 'Ish muvaffaqiyatli yakunlandi'
  | 'payment_commission' // '20 000 so\'m kassa tushumi'
  | 'review_added'       // 'Yangi sharh & baho'
  | 'worker_registered'  // 'Yangi usta ro\'yxatdan o\'tdi'
  | 'message'            // 'Yangi muloqot xabari'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  createdAt: number;
  read: boolean;
  jobId?: string;
  jobTitle?: string;
  actionUrl?: string;
  workerId?: string;
  actionText?: string;
  badgeText?: string;
  proposalId?: string;
  oldStatus?: JobStatus;
  newStatus?: JobStatus;
  conversationId?: string;
  extraDetails?: {
    location?: string;
    budgetUzs?: number;
    proposedPriceUzs?: number;
    workerName?: string;
    clientName?: string;
    etaMinutes?: number;
    distanceKm?: number;
    statusLabel?: string;
  };
}

export interface MessengerMessage {
  id: string;
  conversationId: string;
  senderRole: 'employer' | 'worker';
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  createdAt: number;
  isRead?: boolean;
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

export interface MessengerConversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerRole: 'worker' | 'employer';
  partnerSpecialty?: string;
  partnerPhone: string;
  partnerRating?: number;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageTimestamp: number;
  unreadCount: number;
  relatedJobId?: string;
  relatedJobTitle?: string;
  messages: MessengerMessage[];
}
