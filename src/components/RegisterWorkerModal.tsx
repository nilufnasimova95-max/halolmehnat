import React, { useState, useRef } from 'react';
import { 
  X, UserPlus, GraduationCap, CheckCircle2, 
  Sparkles, ShieldCheck, HeartHandshake, Phone,
  Upload, Image as ImageIcon, Briefcase, Plus, Trash2,
  Clock, DollarSign, MapPin, Award, Check, FileText, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkerProfile, JobCategory, WorkExperienceItem } from '../types';
import { SAMARKAND_DISTRICTS, CATEGORIES_LIST } from '../data/initialData';

interface RegisterWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterWorker: (worker: WorkerProfile) => void;
}

const PRESET_WORK_PHOTOS = [
  { label: "G'isht devor", url: '/src/assets/images/job_bricklaying_wall_1791274845977.jpg' },
  { label: "Kafel yotqizish", url: '/src/assets/images/job_tiling_ceramic_1791276098126.jpg' },
  { label: "Ta'mirlash (Remont)", url: '/src/assets/images/job_renovation_home_1791274894463.jpg' },
  { label: "Svarka & Darvoza", url: '/src/assets/images/job_welding_metal_1791276120058.jpg' },
  { label: "Tom yopish", url: '/src/assets/images/job_roofing_timber_1791276132009.jpg' },
  { label: "General tozalash", url: '/src/assets/images/cleaning_general_home_1791277293483.jpg' },
  { label: "Deraza yuvish", url: '/src/assets/images/window_washing_service_1791277323653.jpg' },
];

const POPULAR_SKILLS = [
  "G'isht terish", "Kafel 60x120", "Suvoq", "Malyarka",
  "Santexnika", "Issiq pol", "Elektr montaj", "Svarka naves",
  "Laminat", "General tozalash", "Bruschatka", "Duradgorlik"
];

export function RegisterWorkerModal({ isOpen, onClose, onRegisterWorker }: RegisterWorkerModalProps) {
  const [activeStep, setActiveStep] = useState<'basics' | 'skills_exp' | 'portfolio'>('basics');

  // Step 1: Basics
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 9');
  const [roleTitle, setRoleTitle] = useState("G'isht teruvchi usta");
  const [category, setCategory] = useState<JobCategory>('devor_terish');
  const [gender, setGender] = useState<'erkak' | 'ayol'>('erkak');
  const [isStudent, setIsStudent] = useState(false);
  const [studentUniversity, setStudentUniversity] = useState("Samarqand Davlat Universiteti (SamDU)");
  const [experience, setExperience] = useState('5 yil');
  const [dailyRateUzs, setDailyRateUzs] = useState(350000);
  const [hourlyRateUzs, setHourlyRateUzs] = useState(45000);
  const [district, setDistrict] = useState('Samarqand shahri (Markaz / Registon)');
  const [bio, setBio] = useState("Assalomu alaykum! Ishimni sifatli qilaman, vaqtida kelaman.");
  const [selectedAvatar, setSelectedAvatar] = useState('/src/assets/images/master_craftsman_portrait_1791274865042.jpg');

  // Step 2: Skills & Past Experience
  const [skills, setSkills] = useState<string[]>(["Pishiq g'isht", "Devor terish", "Lazer sath"]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  
  const [pastExperiences, setPastExperiences] = useState<WorkExperienceItem[]>([
    {
      id: 'init-exp-1',
      jobTitle: "Registon mavzesidagi 2 qavatli xonadon devor va fasad ishlari",
      clientOrLocation: "Samarqand sh., Registon",
      period: "2023 - 2024",
      description: "Pishiq g'ishtdan mustahkam devorlar terildi, lazer tekislash va sifatli topshirildi.",
      photoUrl: '/src/assets/images/job_bricklaying_wall_1791274845977.jpg'
    }
  ]);
  const [expTitleInput, setExpTitleInput] = useState('');
  const [expDescInput, setExpDescInput] = useState('');
  const [expPeriodInput, setExpPeriodInput] = useState('2024');

  // Step 3: Portfolio Photos
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([
    '/src/assets/images/job_bricklaying_wall_1791274845977.jpg',
    '/src/assets/images/job_renovation_home_1791274894463.jpg'
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Skill handlers
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills(prev => [...prev, trimmed]);
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  // Past Experience handlers
  const handleAddExperience = () => {
    if (!expTitleInput.trim()) return;
    const newExp: WorkExperienceItem = {
      id: `exp-${Date.now()}`,
      jobTitle: expTitleInput.trim(),
      clientOrLocation: `${district}, Samarqand`,
      period: expPeriodInput.trim() || '2024',
      description: expDescInput.trim() || "Buyurtmachi talabiga muvofiq ishlar to'liq va sifatli bajarildi.",
      photoUrl: portfolioPhotos[0] || '/src/assets/images/job_bricklaying_wall_1791274845977.jpg'
    };
    setPastExperiences(prev => [newExp, ...prev]);
    setExpTitleInput('');
    setExpDescInput('');
  };

  const handleAddSampleExperience = () => {
    const sample: WorkExperienceItem = {
      id: `exp-${Date.now()}`,
      jobTitle: `${roleTitle} bo'yicha Samarqand shahridagi loyiha`,
      clientOrLocation: "Samarqand sh., Sug'diyona mavzesi",
      period: "2023 - 2024",
      description: "Buyurtmachi bilan kelishilgan holda barcha ishlar o'z vaqtida, sifatli va kafolat bilan topshirildi.",
      photoUrl: portfolioPhotos[0] || '/src/assets/images/job_bricklaying_wall_1791274845977.jpg'
    };
    setPastExperiences(prev => [sample, ...prev]);
  };

  // File upload for portfolio
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

    confetti({ particleCount: 35, spread: 50 });
  };

  const handleTogglePresetPhoto = (url: string) => {
    if (portfolioPhotos.includes(url)) {
      setPortfolioPhotos(prev => prev.filter(p => p !== url));
    } else {
      setPortfolioPhotos(prev => [...prev, url]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Iltimos, ism-familiyangizni kiriting");
      setActiveStep('basics');
      return;
    }

    const catObj = CATEGORIES_LIST.find(c => c.id === category);

    const newWorker: WorkerProfile = {
      id: `w-${Date.now()}`,
      name: name.trim(),
      category,
      categoryLabel: catObj?.label || "Mutaxassis",
      roleTitle: roleTitle.trim(),
      skills: skills.length ? skills : ['Sifatli mehnat', 'Halol ish'],
      experience: experience.trim(),
      pastExperiences,
      dailyRateUzs: Number(dailyRateUzs),
      hourlyRateUzs: Number(hourlyRateUzs),
      rating: 5.0,
      reviewCount: 1,
      completedJobsCount: 0,
      phone: phone.trim(),
      city: 'Samarqand',
      district,
      bio: bio.trim(),
      avatarUrl: isStudent ? '/src/assets/images/student_helper_portrait_1791274879904.jpg' : selectedAvatar,
      isOnline: true,
      isStudent,
      studentUniversity: isStudent ? studentUniversity : undefined,
      gender,
      portfolioPhotos: portfolioPhotos.length > 0 ? portfolioPhotos : [
        '/src/assets/images/job_bricklaying_wall_1791274845977.jpg',
        '/src/assets/images/job_renovation_home_1791274894463.jpg'
      ],
      currentCoords: {
        lat: district.includes('Urgut') ? 39.4050 :
             district.includes("Pastdarg'om") ? 39.5850 :
             district.includes('Toyloq') ? 39.6050 : 39.6542,
        lng: district.includes('Urgut') ? 67.2450 :
             district.includes("Pastdarg'om") ? 66.7550 :
             district.includes('Toyloq') ? 67.0450 : 66.9597,
      }
    };

    onRegisterWorker(newWorker);
    confetti({ particleCount: 80, spread: 70 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[94vh] my-auto">
        
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
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                Batafsil Profil Yaratish (Registration)
              </div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                HalolMehnat.uz da Usta Profilini Yaratish
              </h2>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-800 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveStep('basics')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeStep === 'basics' 
                  ? 'bg-amber-500 text-stone-950 font-bold' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>1. Asosiy ma'lumotlar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('skills_exp')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeStep === 'skills_exp' 
                  ? 'bg-amber-500 text-stone-950 font-bold' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>2. Ko'nikma & Tajribalar ({skills.length + pastExperiences.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('portfolio')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeStep === 'portfolio' 
                  ? 'bg-amber-500 text-stone-950 font-bold' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <span>3. Portfel rasmlari ({portfolioPhotos.length})</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* STEP 1: BASICS */}
          {activeStep === 'basics' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-amber-500/10 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Sovuqda ko'chada kutish yo'q! Uydan turib telefon orqali to'g'ridan-to'g'ri buyurtma oling.
                  </span>
                </div>
              </div>

              {/* Student status toggle */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-blue-700" />
                  <div>
                    <div className="text-xs font-bold text-blue-950">Talabalar Ligasi (Talabamisiz?)</div>
                    <div className="text-[11px] text-blue-800">
                      Darsdan bo'sh vaqtingizda halol pul topish rejimi
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isStudent}
                    onChange={(e) => {
                      setIsStudent(e.target.checked);
                      if (e.target.checked) {
                        setCategory('talabalar_ish');
                        setRoleTitle("Talaba - Yordamchi & Qora ish");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isStudent && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Universitet yoki Institut nomi
                  </label>
                  <input 
                    type="text" 
                    value={studentUniversity}
                    onChange={(e) => setStudentUniversity(e.target.value)}
                    placeholder="Masalan: SamDU, SamDAQU, SamISI..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Ism-familiyangiz *
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Sardor Rustamov"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Telefon raqamingiz *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Specialty & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Kasbiy lavozimingiz (Unvon) *
                  </label>
                  <input 
                    type="text" 
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Masalan: G'isht teruvchi usta, Duradgor..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Kasb toifasi
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value as JobCategory;
                      setCategory(val);
                      if (val.startsWith('uy_') || val.startsWith('oyna_') || val.startsWith('remontdan_') || val.startsWith('dazmol_')) {
                        setGender('ayol');
                        setSelectedAvatar('/src/assets/images/woman_craft_cleaner_portrait_1791277307525.jpg');
                      } else {
                        setGender('erkak');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District & Daily / Hourly Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Hudud (Samarqand)
                  </label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    {SAMARKAND_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Soatlik xizmat (so'm)
                  </label>
                  <input 
                    type="number" 
                    step="5000"
                    value={hourlyRateUzs}
                    onChange={(e) => setHourlyRateUzs(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Kunlik xizmat (so'm) *
                  </label>
                  <input 
                    type="number" 
                    step="10000"
                    value={dailyRateUzs}
                    onChange={(e) => setDailyRateUzs(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  O'zingiz haqingizda qisqacha ma'lumot (Bio)
                </label>
                <textarea 
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ishni vijdonan, toza va o'z vaqtida topshiraman..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('skills_exp')}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Ko'nikma va Tajribalar (2-qadam)</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SKILLS & PAST EXPERIENCES */}
          {activeStep === 'skills_exp' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs text-stone-700">
                💡 <b>Ko'nikma va Tajribalar:</b> Oldin bajargan ob'ektlaringizni kiritish orqali buyurtmachilar sizga to'liq ishonadi.
              </div>

              {/* Skills Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1.5">
                  Qo'lingizdan keladigan ishlar & Ko'nikmalar ({skills.length} ta)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(customSkillInput);
                      }
                    }}
                    placeholder="Masalan: Fasad g'isht, penopleks..."
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    className="px-3 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                  >
                    Qo'shish
                  </button>
                </div>

                {/* Popular skill pills */}
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map((skill, idx) => {
                    const active = skills.includes(skill);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => active ? handleRemoveSkill(skill) : handleAddSkill(skill)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                          active 
                            ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold' 
                            : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {active ? <Check className="w-3 h-3 text-amber-700" /> : <Plus className="w-3 h-3 text-stone-400" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Past Experiences Section */}
              <div className="pt-3 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase">
                    Oldingi ish tajribalari ({pastExperiences.length} ta loyiha)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSampleExperience}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Tezkor namuna qo'shish</span>
                  </button>
                </div>

                {/* Quick Add Exp Box */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={expTitleInput}
                      onChange={(e) => setExpTitleInput(e.target.value)}
                      placeholder="Ob'ekt nomi (masalan: 2 qavatli kottej fasadi)"
                      className="sm:col-span-2 px-3 py-1.5 rounded-xl border border-stone-300 text-xs outline-none bg-white"
                    />
                    <input
                      type="text"
                      value={expPeriodInput}
                      onChange={(e) => setExpPeriodInput(e.target.value)}
                      placeholder="Yili (masalan: 2024)"
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs outline-none bg-white font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={expDescInput}
                      onChange={(e) => setExpDescInput(e.target.value)}
                      placeholder="Qanday ish bajarilgani (masalan: 10 000 g'isht terildi)"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 text-xs outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold shrink-0"
                    >
                      Qo'shish
                    </button>
                  </div>
                </div>

                {/* Experiences list */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pastExperiences.map((exp, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{exp.jobTitle} <span className="font-mono text-stone-500 font-normal">({exp.period})</span></div>
                        <div className="text-stone-600 text-[11px] line-clamp-1">{exp.description}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPastExperiences(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-stone-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('basics')}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  Orqaga
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('portfolio')}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Portfel rasmlari (3-qadam)</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PORTFOLIO PHOTOS */}
          {activeStep === 'portfolio' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b>Portfel fotosuratlari:</b> Telefoningizdan bajargan ishlaringiz rasmini yuklang yoki tayyor sifatli rasmlardan tanlang.
                </div>
              </div>

              {/* Direct file upload area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 border-2 border-dashed border-amber-400 hover:border-amber-600 bg-amber-50/40 hover:bg-amber-50/70 rounded-2xl cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-stone-900">
                  📁 Telefon yoki kompyuterdan rasm yuklash (Bosing)
                </div>
              </div>

              {/* Verified preset craft photos library */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Tayyor sifatli ish rasmlaridan tanlash (bosish orqali qo'shish)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_WORK_PHOTOS.map((item, idx) => {
                    const isAdded = portfolioPhotos.includes(item.url);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTogglePresetPhoto(item.url)}
                        className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                          isAdded 
                            ? 'border-emerald-500 ring-2 ring-emerald-400/40 shadow-sm' 
                            : 'border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        <img src={item.url} alt={item.label} className="w-full h-16 object-cover" />
                        <div className="p-1 bg-white text-[10px] font-semibold text-stone-800 truncate flex items-center justify-between">
                          <span className="truncate">{item.label}</span>
                          {isAdded && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current portfolio count */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700">Portfeldagi rasmlar soni:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {portfolioPhotos.length} ta rasm
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('skills_exp')}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  Orqaga
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Batafsil Profilni Faollashtirish</span>
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
