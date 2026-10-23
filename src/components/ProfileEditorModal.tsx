import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, Plus, Trash2, User, Phone, MapPin, 
  Briefcase, Clock, Award, Sparkles, DollarSign, 
  GraduationCap, Image as ImageIcon, CheckCircle2, AlertCircle,
  Upload, Camera, Eye, ChevronRight, FileText, Zap, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkerProfile, JobCategory, WorkExperienceItem } from '../types';
import { CATEGORIES_LIST, SAMARKAND_DISTRICTS } from '../data/initialData';

interface ProfileEditorModalProps {
  isOpen: boolean;
  worker: WorkerProfile | null;
  onClose: () => void;
  onSaveProfile: (updatedWorker: WorkerProfile) => void;
}

// Preset verified avatar options for fast selection
const PRESET_AVATARS = [
  { label: 'Usta 1 (Erkak)', url: '/src/assets/images/master_craftsman_portrait_1791274865042.jpg' },
  { label: 'Usta 2 (Erkak)', url: '/src/assets/images/young_builder_portrait_1791277292211.jpg' },
  { label: 'Mutaxassis (Ayol)', url: '/src/assets/images/woman_craft_cleaner_portrait_1791277307525.jpg' },
  { label: 'G\'isht ustasi', url: '/src/assets/images/job_bricklaying_wall_1791274845977.jpg' },
];

// Popular trade skills for 1-click addition
const POPULAR_SKILL_SUGGESTIONS = [
  "Kafel terish",
  "G'isht terish",
  "Suvoq va Shpaklyovka",
  "Malyarka va Travertin",
  "Santexnika montaj",
  "Issiq pol (Tyopliy pol)",
  "Elektr montaj",
  "Svarka va Darvoza",
  "Tom yopish (Krovlya)",
  "Gipsokarton shift",
  "Laminat yotqizish",
  "General Uborka",
  "Deraza va Oyna yuvish",
  "Bruschatka yotqizish",
  "Tandir va O'choq",
  "Yuk tashish"
];

// Verified high quality sample craft photos for 1-click portfolio addition
const PRESET_PORTFOLIO_PHOTOS = [
  { label: "G'isht devor terish", url: '/src/assets/images/job_bricklaying_wall_1791274845977.jpg', trade: "devor" },
  { label: "Kafel & Keramogranit", url: '/src/assets/images/job_tiling_ceramic_1791276098126.jpg', trade: "kafel" },
  { label: "Ta'mirdan keyingi natija", url: '/src/assets/images/job_renovation_home_1791274894463.jpg', trade: "remont" },
  { label: "Metall svarka va darvoza", url: '/src/assets/images/job_welding_metal_1791276120058.jpg', trade: "svarka" },
  { label: "Tom yopish & Yog'och", url: '/src/assets/images/job_roofing_timber_1791276132009.jpg', trade: "tom" },
  { label: "General tozalash", url: '/src/assets/images/cleaning_general_home_1791277293483.jpg', trade: "tozalash" },
  { label: "Oyna & Vitrina yuvish", url: '/src/assets/images/window_washing_service_1791277323653.jpg', trade: "oyna" },
  { label: "Laminat va xona pardozlash", url: '/src/assets/images/work_after_renovation_1792251836245.jpg', trade: "laminat" }
];

// Quick sample work experiences for 1-click convenience
const SAMPLE_WORK_EXPERIENCES: WorkExperienceItem[] = [
  {
    id: 'sample-exp-1',
    jobTitle: "Registon ko'chasidagi 2 qavatli xususiy xonadon devor va fasad ishlari",
    clientOrLocation: "Samarqand sh., Registon mavzesi",
    period: "2023 - 2024",
    description: "16 000 dona pishiq g'ishtdan mustahkam devorlar terildi, poydevor quyildi va fasad lazer sathida sifatli yakunlandi.",
    photoUrl: '/src/assets/images/job_bricklaying_wall_1791274845977.jpg'
  },
  {
    id: 'sample-exp-2',
    jobTitle: "Sug'diyona mavzesidagi kottej hammomi va oshxonasiga 60x120 kafel yotqizish",
    clientOrLocation: "Samarqand sh., Sug'diyona",
    period: "2024",
    description: "85 kv.m pol va devorlarga keramogranit kafel yotqizildi, 45 gradus aniq burchak kesimi bilan bajarildi.",
    photoUrl: '/src/assets/images/job_tiling_ceramic_1791276098126.jpg'
  },
  {
    id: 'sample-exp-3',
    jobTitle: "Urgut tumanidagi hovliga 8x12 profnastil naves va temir darvoza yasash",
    clientOrLocation: "Urgut tumani",
    period: "2023",
    description: "Mustahkam profildan karkas payvandlandi, korroziyaga qarshi bo'yoq bilan qoplandi va profnastil o'rnatildi.",
    photoUrl: '/src/assets/images/job_welding_metal_1791276120058.jpg'
  }
];

export function ProfileEditorModal({
  isOpen,
  worker,
  onClose,
  onSaveProfile
}: ProfileEditorModalProps) {
  if (!isOpen || !worker) return null;

  // Form State
  const [name, setName] = useState(worker.name);
  const [roleTitle, setRoleTitle] = useState(worker.roleTitle);
  const [category, setCategory] = useState<JobCategory>(worker.category);
  const [phone, setPhone] = useState(worker.phone);
  const [district, setDistrict] = useState(worker.district);
  const [city, setCity] = useState(worker.city || 'Samarqand');
  const [experience, setExperience] = useState(worker.experience);
  const [bio, setBio] = useState(worker.bio);
  const [gender, setGender] = useState<'erkak' | 'ayol'>(worker.gender || 'erkak');
  const [isStudent, setIsStudent] = useState(worker.isStudent);
  const [studentUniversity, setStudentUniversity] = useState(worker.studentUniversity || 'Samarqand Davlat Universiteti');
  const [avatarUrl, setAvatarUrl] = useState(worker.avatarUrl);

  // Skills State
  const [skills, setSkills] = useState<string[]>(worker.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Past Work Experiences State
  const [pastExperiences, setPastExperiences] = useState<WorkExperienceItem[]>(() => {
    if (worker.pastExperiences && worker.pastExperiences.length > 0) {
      return worker.pastExperiences;
    }
    return [
      {
        id: `exp-${Date.now()}-1`,
        jobTitle: `${worker.roleTitle || "Usta"} bo'yicha Samarqanddagi ob'ekt`,
        clientOrLocation: `${worker.district}, Samarqand`,
        period: "2023 - 2024",
        description: `${worker.bio || "Ish to'liq va sifatli bajarilgan, buyurtmachi natijadan mamnun bo'lgan."}`,
        photoUrl: worker.portfolioPhotos?.[0] || '/src/assets/images/job_bricklaying_wall_1791274845977.jpg'
      }
    ];
  });

  // New Experience Sub-Form State
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpLocation, setNewExpLocation] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('2024');
  const [newExpDescription, setNewExpDescription] = useState('');
  const [newExpPhotoUrl, setNewExpPhotoUrl] = useState('');
  const [isAddingExp, setIsAddingExp] = useState(false);

  // Portfolio Photos State
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>(() => {
    if (worker.portfolioPhotos && worker.portfolioPhotos.length > 0) {
      return worker.portfolioPhotos;
    }
    return ['/src/assets/images/job_bricklaying_wall_1791274845977.jpg'];
  });
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Rates State (Hourly & Daily)
  const [hourlyRateUzs, setHourlyRateUzs] = useState<number>(worker.hourlyRateUzs || Math.round(worker.dailyRateUzs / 8));
  const [dailyRateUzs, setDailyRateUzs] = useState<number>(worker.dailyRateUzs || 350000);

  // Active Tab: personal | skills | experience | portfolio | rates | preview
  const [activeTab, setActiveTab] = useState<'personal' | 'skills' | 'experience' | 'portfolio' | 'rates' | 'preview'>('personal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-sync if worker prop changes
  useEffect(() => {
    if (worker) {
      setName(worker.name);
      setRoleTitle(worker.roleTitle);
      setCategory(worker.category);
      setPhone(worker.phone);
      setDistrict(worker.district);
      setCity(worker.city || 'Samarqand');
      setExperience(worker.experience);
      setBio(worker.bio);
      setGender(worker.gender || 'erkak');
      setIsStudent(worker.isStudent);
      setStudentUniversity(worker.studentUniversity || 'Samarqand Davlat Universiteti');
      setAvatarUrl(worker.avatarUrl);
      setSkills(worker.skills || []);
      setPortfolioPhotos(worker.portfolioPhotos && worker.portfolioPhotos.length > 0 ? worker.portfolioPhotos : ['/src/assets/images/job_bricklaying_wall_1791274845977.jpg']);
      setPastExperiences(worker.pastExperiences || []);
      setHourlyRateUzs(worker.hourlyRateUzs || Math.round(worker.dailyRateUzs / 8));
      setDailyRateUzs(worker.dailyRateUzs || 350000);
    }
  }, [worker]);

  // Skill Handlers
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillInput('');
      return;
    }
    setSkills(prev => [...prev, trimmed]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  // Past Experience Handlers
  const handleAddExperience = () => {
    if (!newExpTitle.trim()) {
      alert("Iltimos, ob'ekt yoki ish nomini kiriting");
      return;
    }
    const newExp: WorkExperienceItem = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobTitle: newExpTitle.trim(),
      clientOrLocation: newExpLocation.trim() || `${district}, Samarqand`,
      period: newExpPeriod.trim() || "2024",
      description: newExpDescription.trim() || "Ish to'liq va sifatli bajarildi, buyurtmachi qabul qildi.",
      photoUrl: newExpPhotoUrl || portfolioPhotos[0] || '/src/assets/images/job_bricklaying_wall_1791274845977.jpg'
    };

    setPastExperiences(prev => [newExp, ...prev]);
    setNewExpTitle('');
    setNewExpLocation('');
    setNewExpPeriod('2024');
    setNewExpDescription('');
    setNewExpPhotoUrl('');
    setIsAddingExp(false);
  };

  const handleRemoveExperience = (id: string) => {
    setPastExperiences(prev => prev.filter(e => e.id !== id));
  };

  const handleAddSampleExperience = () => {
    const sample = SAMPLE_WORK_EXPERIENCES[Math.floor(Math.random() * SAMPLE_WORK_EXPERIENCES.length)];
    const newExp: WorkExperienceItem = {
      ...sample,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setPastExperiences(prev => [newExp, ...prev]);
  };

  // Portfolio Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPortfolioPhotos(prev => [reader.result as string, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });

    confetti({ particleCount: 30, spread: 40 });
  };

  const handleAddPresetPhoto = (url: string) => {
    if (portfolioPhotos.includes(url)) return;
    setPortfolioPhotos(prev => [...prev, url]);
  };

  const handleRemovePhoto = (url: string) => {
    setPortfolioPhotos(prev => prev.filter(p => p !== url));
  };

  // Validation
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Ism-familiyani kiritish shart";
    if (!roleTitle.trim()) errs.roleTitle = "Mutaxassislik unvonini kiritish shart";
    if (!phone.trim()) errs.phone = "Telefon raqamini kiritish shart";
    if (dailyRateUzs < 50000) errs.dailyRateUzs = "Kunlik narx kamida 50 000 so'm bo'lishi kerak";
    if (skills.length === 0) errs.skills = "Kamida 1 ta ko'nikma qo'shing";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submit
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      if (errors.name || errors.phone || errors.roleTitle) {
        setActiveTab('personal');
      } else if (errors.skills) {
        setActiveTab('skills');
      } else if (errors.dailyRateUzs) {
        setActiveTab('rates');
      }
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const selectedCategoryObj = CATEGORIES_LIST.find(c => c.id === category);
      const updatedProfile: WorkerProfile = {
        ...worker,
        name: name.trim(),
        roleTitle: roleTitle.trim(),
        category,
        categoryLabel: selectedCategoryObj?.label || worker.categoryLabel,
        phone: phone.trim(),
        district,
        city: city.trim(),
        experience: experience.trim(),
        bio: bio.trim(),
        gender,
        isStudent,
        studentUniversity: isStudent ? studentUniversity.trim() : undefined,
        avatarUrl,
        skills,
        pastExperiences,
        portfolioPhotos: portfolioPhotos.length > 0 ? portfolioPhotos : worker.portfolioPhotos,
        hourlyRateUzs: Number(hourlyRateUzs),
        dailyRateUzs: Number(dailyRateUzs),
      };

      onSaveProfile(updatedProfile);
      confetti({ particleCount: 80, spread: 60 });
      setIsSaving(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col my-auto max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                Batafsil Profil Tahrirlagichi (Profile Builder)
              </div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                Ko'nikmalar, Oldingi Ish Tajribalari va Portfel Rasmlari
              </h2>
            </div>
          </div>

          {/* Navigation Tabs (Mobile-friendly horizontal scroll) */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-stone-800 overflow-x-auto text-xs font-semibold pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'personal' 
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>1. Shaxsiy ma'lumotlar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'skills' 
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>2. Ko'nikmalar ({skills.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('experience')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'experience' 
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Oldingi tajribalar ({pastExperiences.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('portfolio')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'portfolio' 
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>4. Portfel rasmlari ({portfolioPhotos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rates')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'rates' 
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>5. Xizmat narxlari</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview' 
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ko'rinishi (Preview)</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: Personal Information */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <b>Oson va tushunarli:</b> Ism-familiyangiz va Samarqanddagi tumaningizni belgilang. Buyurtmachilar siz bilan to'g'ridan-to'g'ri bog'lanishadi.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Ism-familiya *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Bahrom Rasulov"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none"
                    required
                  />
                  {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* Role Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Kasbiy lavozim (Unvon) *
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Masalan: G'isht teruvchi & Fasad ustasi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none"
                    required
                  />
                  {errors.roleTitle && <p className="text-xs text-rose-600 mt-1">{errors.roleTitle}</p>}
                </div>

                {/* Primary Category */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Asosiy mutaxassislik toifasi
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as JobCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none bg-white"
                  >
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Telefon raqam *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none font-mono"
                      required
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                {/* District in Samarkand */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Hudud / Tuman (Samarqand)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none bg-white"
                    >
                      {SAMARKAND_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Umumiy ish tajribasi
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Masalan: 12 yil yoki 4 yil"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Gender and Student status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Mutaxassis jinsi
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('erkak')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-colors ${
                        gender === 'erkak' 
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm' 
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      Erkak usta 🔨
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('ayol')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-colors ${
                        gender === 'ayol' 
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      Ayol mutaxassis 🌸
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Talabalar Ligasi
                  </label>
                  <label className="flex items-center gap-2.5 p-2 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isStudent}
                      onChange={(e) => setIsStudent(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Men talabaman (darsdan so'ng ishlayman)
                    </span>
                  </label>
                </div>
              </div>

              {isStudent && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                    Universitet / Institut nomi
                  </label>
                  <input
                    type="text"
                    value={studentUniversity}
                    onChange={(e) => setStudentUniversity(e.target.value)}
                    placeholder="Masalan: Samarqand Davlat Arxitektura-Qurilish Universiteti (SamDAQU)"
                    className="w-full px-3.5 py-2 rounded-lg border border-blue-300 text-xs outline-none bg-white"
                  />
                </div>
              )}

              {/* Bio / Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  O'zingiz haqida batafsil ma'lumot (Bio)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Qanday asboblaringiz bor, ishga qanday yondashasiz, sifat kafolati..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none"
                />
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Profil rasmi (Avatar)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(item.url)}
                      className={`relative p-1.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                        avatarUrl === item.url 
                          ? 'border-amber-500 bg-amber-50/60 shadow-sm' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <span className="text-[11px] font-medium text-stone-700 truncate max-w-full">
                        {item.label}
                      </span>
                      {avatarUrl === item.url && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-stone-950 rounded-full flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Skills & Expertise */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-start gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900">Qo'lidan keladigan ishlar & Ko'nikmalar:</span> Qanchalik aniq ko'nikmalarni tanlasangiz, buyurtmachilar sizni shunchalik tez topishadi.
                </div>
              </div>

              {/* Add Custom Skill */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Yangi ko'nikma yozib qo'shish
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(newSkillInput);
                      }
                    }}
                    placeholder="Masalan: Fasad penopleks yopishtirish yoki Marmar burchak kesish"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Qo'shish</span>
                  </button>
                </div>
                {errors.skills && <p className="text-xs text-rose-600 mt-1">{errors.skills}</p>}
              </div>

              {/* Current Active Skills */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Siz tanlagan ko'nikmalar ({skills.length} ta)
                </label>
                {skills.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Hozircha hech qanday ko'nikma qo'shilmagan.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold shadow-2xs group"
                      >
                        <span>✓ {skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="w-4 h-4 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors ml-0.5"
                          title="Ko'nikmani o'chirish"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Suggestions (1-Click) */}
              <div className="pt-3 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Ommabop ko'nikmalar (1 ta bosishda qo'shish yoki o'chirish)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILL_SUGGESTIONS.map((sug, idx) => {
                    const isAdded = skills.includes(sug);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => isAdded ? handleRemoveSkill(sug) : handleAddSkill(sug)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                          isAdded 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                            : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {isAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3 text-stone-400" />}
                        <span>{sug}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Past Work Experiences (Crucial User Requirement) */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-stone-900">Oldingi ish tajribalari va Bajarilgan loyihalar</div>
                    <div className="text-stone-600 text-xs mt-0.5">
                      Qayerda qanday ish qilganingiz, qaysi ob'ektlarni sifatli topshirganingizni ko'rsatish buyurtmachilarda to'liq ishonch uyg'otadi.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSampleExperience}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Tayyor namunaviy loyihani kiritish"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tezkor namuna qo'shish</span>
                  <span className="sm:hidden">Namuna</span>
                </button>
              </div>

              {/* Add New Experience Sub-Form Toggle */}
              {!isAddingExp ? (
                <button
                  type="button"
                  onClick={() => setIsAddingExp(true)}
                  className="w-full py-3 px-4 border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl text-stone-700 hover:text-amber-800 text-xs font-bold transition-all flex items-center justify-center gap-2 bg-stone-50/50 hover:bg-amber-50/30"
                >
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>Yangi bajargan ish / ob'ekt tajribasini qo'shish</span>
                </button>
              ) : (
                <div className="p-4 bg-stone-50 rounded-2xl border-2 border-amber-400/80 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-600" />
                      Yangi ish tajribasi kartasi
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingExp(false)}
                      className="text-stone-400 hover:text-stone-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        Ob'ekt yoki Ish nomi *
                      </label>
                      <input
                        type="text"
                        value={newExpTitle}
                        onChange={(e) => setNewExpTitle(e.target.value)}
                        placeholder="Masalan: Registon ko'chasidagi 2 qavatli uy devori"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        Joylashuv / Hudud
                      </label>
                      <input
                        type="text"
                        value={newExpLocation}
                        onChange={(e) => setNewExpLocation(e.target.value)}
                        placeholder="Masalan: Samarqand sh., Registon mavzesi"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        Bajarilgan yili / davri
                      </label>
                      <input
                        type="text"
                        value={newExpPeriod}
                        onChange={(e) => setNewExpPeriod(e.target.value)}
                        placeholder="Masalan: 2023 - 2024"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        Rasm biriktirish
                      </label>
                      <select
                        value={newExpPhotoUrl}
                        onChange={(e) => setNewExpPhotoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none bg-white focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Portfeldagi birinchi rasmdan foydalanish</option>
                        {PRESET_PORTFOLIO_PHOTOS.map((p, i) => (
                          <option key={i} value={p.url}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                      Nimalar qilindi? (Batafsil tavsif)
                    </label>
                    <textarea
                      rows={2}
                      value={newExpDescription}
                      onChange={(e) => setNewExpDescription(e.target.value)}
                      placeholder="Masalan: 12 000 pishiq g'ishtdan mustahkam devor terildi, lazer tekislash va fasad ishlari yakunlandi."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingExp(false)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-sm"
                    >
                      Ro'yxatga qo'shish
                    </button>
                  </div>
                </div>
              )}

              {/* Experiences Cards List */}
              <div className="space-y-3">
                {pastExperiences.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                    <Briefcase className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-600">Hozircha oldingi ish tajribalari kiritilmagan.</p>
                    <p className="text-[11px] text-stone-400 mt-1">Yuqoridagi tugma orqali o'zingiz bajargan ishlarni qo'shing.</p>
                  </div>
                ) : (
                  pastExperiences.map((exp, index) => (
                    <div 
                      key={exp.id || index}
                      className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-amber-300 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {exp.photoUrl ? (
                          <img
                            src={exp.photoUrl}
                            alt={exp.jobTitle}
                            className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <Briefcase className="w-6 h-6 text-amber-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-stone-900 truncate">
                              {exp.jobTitle}
                            </h4>
                            {exp.period && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-700">
                                📅 {exp.period}
                              </span>
                            )}
                          </div>
                          {exp.clientOrLocation && (
                            <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{exp.clientOrLocation}</span>
                            </p>
                          )}
                          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                            "{exp.description}"
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 self-end sm:self-center"
                        title="Tajribani o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Portfolio Photos Upload (Crucial User Requirement) */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-stone-900">Portfel rasmlarini yuklash (Portfolio Photos)</div>
                  <div className="text-stone-600 text-xs mt-0.5">
                    Telefoningiz yoki kompyuteringizdan bajargan ishlaringiz fotosuratlarini yuklang yoki tayyor sifatli rasmlardan tanlang. Rasmlar buyurtmachilarga sizning mahoratingizni isbotlaydi.
                  </div>
                </div>
              </div>

              {/* Upload Action Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Direct File Upload from Computer / Phone Camera */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-amber-400 hover:border-amber-600 bg-amber-50/40 hover:bg-amber-50/70 rounded-2xl cursor-pointer text-center transition-all group flex flex-col items-center justify-center gap-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      📁 Telefon yoki kompyuterdan rasm yuklash
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      JPG, PNG fotosuratlarni tanlang (bir nechta yuklash mumkin)
                    </div>
                  </div>
                </div>

                {/* 2. Fast Camera / Photo Presets */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-stone-600" />
                      <span>Haqiqiy ish rasmlari soni</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Hozirda portfelingizda <b>{portfolioPhotos.length} ta</b> fotosurat mavjud.
                    </p>
                  </div>

                  <div className="text-[11px] text-stone-500 bg-white p-2 rounded-xl border border-stone-200 mt-2">
                    💡 <b>Maslahat:</b> Har bir usta o'zining kamida 2-3 ta sifatli ishini yuklasa, kunlik buyurtmalar oqimi 4 barobar ko'payadi.
                  </div>
                </div>
              </div>

              {/* Current Portfolio Photos Gallery */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Portfeldagi rasmlar ({portfolioPhotos.length} ta)
                </label>
                
                {portfolioPhotos.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Hozircha portfel rasmlari yuklanmagan.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {portfolioPhotos.map((photo, idx) => (
                      <div 
                        key={idx}
                        className="relative rounded-2xl overflow-hidden border border-stone-200 aspect-4/3 group shadow-2xs bg-stone-100"
                      >
                        <img 
                          src={photo} 
                          alt={`Portfel ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-stone-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPhotoPreview(photo)}
                            className="p-2 rounded-xl bg-white/90 hover:bg-white text-stone-900 shadow-md transition-transform active:scale-90"
                            title="Kattalashtirib ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo)}
                            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform active:scale-90"
                            title="Rasmni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Pick from Verified Craft Photo Library */}
              <div className="pt-3 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Tayyor sifatli ish rasmlaridan tanlash (1 ta bosishda portfelga qo'shish)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_PORTFOLIO_PHOTOS.map((item, idx) => {
                    const isAdded = portfolioPhotos.includes(item.url);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => isAdded ? handleRemovePhoto(item.url) : handleAddPresetPhoto(item.url)}
                        className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                          isAdded 
                            ? 'border-emerald-500 ring-2 ring-emerald-400/40 shadow-sm' 
                            : 'border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        <img src={item.url} alt={item.label} className="w-full h-20 object-cover" />
                        <div className="p-1.5 bg-white text-[11px] font-semibold text-stone-800 truncate flex items-center justify-between">
                          <span className="truncate">{item.label}</span>
                          {isAdded && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Rates (Hourly & Daily) */}
          {activeTab === 'rates' && (
            <div className="space-y-5">
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b>Shaffof narxlar:</b> Soatlik va kunlik narxni to'g'ri ko'rsatish buyurtmachilar bilan kelishmovchiliklarning oldini oladi. HalolMehnat.uz da vositachisiz to'g'ridan-to'g'ri hisob-kitob qilasiz.
                </div>
              </div>

              {/* Hourly Rate */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Soatlik xizmat haqi (UZS / soat)
                    </label>
                    <p className="text-[11px] text-stone-500">Qisqa vaqtli yoki mayda tuzatish ishlari uchun</p>
                  </div>
                  <div className="font-mono text-lg font-black text-amber-700 tabular-nums">
                    {Number(hourlyRateUzs).toLocaleString()} so'm/soat
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step={5000}
                    min={10000}
                    value={hourlyRateUzs}
                    onChange={(e) => setHourlyRateUzs(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-base font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none bg-white"
                  />
                </div>

                {/* Quick Hourly Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] text-stone-400 self-center">Tezkor tanlov:</span>
                  {[30000, 40000, 50000, 65000, 80000, 100000].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setHourlyRateUzs(rate)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                        hourlyRateUzs === rate 
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-600' 
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {rate.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Rate */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Kunlik xizmat haqi (UZS / 8 soatlik to'liq kun) *
                    </label>
                    <p className="text-[11px] text-stone-500">To'liq ish kuni uchun standart usta narxi</p>
                  </div>
                  <div className="font-mono text-lg font-black text-emerald-700 tabular-nums">
                    {Number(dailyRateUzs).toLocaleString()} so'm/kun
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step={10000}
                    min={50000}
                    value={dailyRateUzs}
                    onChange={(e) => setDailyRateUzs(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-base font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none bg-white"
                    required
                  />
                </div>
                {errors.dailyRateUzs && <p className="text-xs text-rose-600">{errors.dailyRateUzs}</p>}

                {/* Quick Daily Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] text-stone-400 self-center">Tezkor tanlov:</span>
                  {[200000, 250000, 300000, 350000, 400000, 500000].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setDailyRateUzs(rate)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                        dailyRateUzs === rate 
                          ? 'bg-emerald-600 text-white font-bold border-emerald-700' 
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {rate.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Live Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-500">
                Ish beruvchilar sizning yangilangan profilingizni quyidagicha ko'radi:
              </div>

              {/* Preview Card Mock */}
              <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-stone-900 text-base truncate">
                        {name || "Ism kiritilmagan"}
                      </h4>
                      {isStudent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-0.5">
                          <GraduationCap className="w-3 h-3" />
                          Talaba
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 font-medium">{roleTitle || "Mutaxassislik"}</p>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <span className="font-bold text-amber-600">⭐ {worker.rating.toFixed(1)}</span>
                      <span>·</span>
                      <span>{district}, {city}</span>
                      <span>·</span>
                      <span>Tajriba: {experience}</span>
                    </div>
                  </div>
                </div>

                {/* Price pill */}
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Soatlik: </span>
                    <span className="font-mono font-bold text-stone-900">{Number(hourlyRateUzs).toLocaleString()} so'm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Kunlik: </span>
                    <span className="font-mono font-bold text-emerald-700">{Number(dailyRateUzs).toLocaleString()} so'm</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div>
                  <div className="text-[11px] font-bold text-stone-500 uppercase mb-1.5">Ko'nikmalar:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-950 rounded-md border border-amber-200">
                        ✓ {skill}
                      </span>
                    ))}
                    {skills.length > 6 && (
                      <span className="text-[11px] px-2 py-0.5 bg-stone-100 text-stone-500 rounded-md">
                        +{skills.length - 6} yana
                      </span>
                    )}
                  </div>
                </div>

                {/* Past Experiences Preview */}
                {pastExperiences.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-stone-500 uppercase mb-1.5">
                      Oldingi tajribalari ({pastExperiences.length} ta loyiha):
                    </div>
                    <div className="space-y-1.5">
                      {pastExperiences.slice(0, 2).map((exp, i) => (
                        <div key={i} className="text-xs p-2 bg-stone-50 rounded-xl border border-stone-200">
                          <div className="font-bold text-stone-800">{exp.jobTitle} ({exp.period})</div>
                          <div className="text-stone-600 text-[11px] mt-0.5">{exp.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio Photos Preview */}
                {portfolioPhotos.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-stone-500 uppercase mb-1.5">
                      Portfel rasmlari ({portfolioPhotos.length} ta):
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {portfolioPhotos.slice(0, 3).map((photo, i) => (
                        <img key={i} src={photo} alt="" className="w-full h-16 rounded-xl object-cover border border-stone-200" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lightbox Photo Preview Modal */}
          {selectedPhotoPreview && (
            <div className="fixed inset-0 z-70 bg-black/90 flex items-center justify-center p-4">
              <div className="relative max-w-2xl w-full">
                <button
                  type="button"
                  onClick={() => setSelectedPhotoPreview(null)}
                  className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300"
                >
                  <X className="w-6 h-6" />
                </button>
                <img src={selectedPhotoPreview} alt="Portfel rasmi" className="w-full rounded-2xl shadow-2xl max-h-[80vh] object-contain" />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500 text-center sm:text-left">
            <span>Barcha ko'nikma, tajriba va portfel rasmlari saqlanadi.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors"
            >
              Bekor qilish
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <span>Saqlanmoqda...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profilni saqlash</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Export both standard and alias name
export const ProfileEditor = ProfileEditorModal;
