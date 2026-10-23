import { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, MapPin, DollarSign, Clock, 
  Check, Sparkles, AlertCircle, Info, ShieldCheck,
  Upload, Trash2, Image as ImageIcon, RefreshCw, CheckCircle2
} from 'lucide-react';
import { JobCategory, JobOrder } from '../types';
import { SAMARKAND_DISTRICTS } from '../data/initialData';
import { processAndResizeImage } from '../utils/imageResize';
import { VoiceInputRecorder } from './VoiceInputRecorder';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob: (newJob: Partial<JobOrder>) => void;
  initialCategory?: JobCategory;
  initialBudget?: number;
}

const PRESET_PHOTOS = [
  {
    title: "General Uborka 🌸",
    url: '/src/assets/images/cleaning_general_home_1791277293483.jpg'
  },
  {
    title: "Oyna & Deraza",
    url: '/src/assets/images/window_washing_service_1791277323653.jpg'
  },
  {
    title: "G'isht devor",
    url: '/src/assets/images/job_bricklaying_wall_1791274845977.jpg'
  },
  {
    title: "Kafel & Marmar",
    url: '/src/assets/images/job_tiling_ceramic_1791276098126.jpg'
  },
  {
    title: "Svarka & Temir",
    url: '/src/assets/images/job_welding_metal_1791276120058.jpg'
  },
  {
    title: "Tom yopish (Krovlya)",
    url: '/src/assets/images/job_roofing_timber_1791276132009.jpg'
  },
  {
    title: "Suvoq & Ta'mir",
    url: '/src/assets/images/job_renovation_home_1791274894463.jpg'
  },
  {
    title: "Talabalar & Yuk",
    url: '/src/assets/images/student_helper_portrait_1791274879904.jpg'
  }
];

export function CreateJobModal({ 
  isOpen, 
  onClose, 
  onCreateJob,
  initialCategory,
  initialBudget 
}: CreateJobModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JobCategory>('devor_terish');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Samarqand shahri (Markaz / Registon)');
  const [locationAddress, setLocationAddress] = useState('Samarqand shahri, Registon ko\'chasi, 14-uy');
  const [budgetUzs, setBudgetUzs] = useState(400000);
  const [paymentType, setPaymentType] = useState<'kunlik' | 'ishbay' | 'soatlik'>('kunlik');
  const [urgent, setUrgent] = useState(true);
  const [mealProvided, setMealProvided] = useState(true);
  const [toolsProvided, setToolsProvided] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PHOTOS[0].url);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoTab, setPhotoTab] = useState<'camera_upload' | 'presets'>('camera_upload');
  
  // Voice Note Audio & Duration
  const [voiceNoteAudioUrl, setVoiceNoteAudioUrl] = useState<string | null>(null);
  const [voiceDurationSeconds, setVoiceDurationSeconds] = useState<number>(0);

  // Live Camera Viewfinder State
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employerName, setEmployerName] = useState('Alisher aka');
  const [employerPhone, setEmployerPhone] = useState('+998 90 123 45 67');

  // Stop camera stream utility
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  // Start live camera stream
  const startLiveCamera = async (facing: 'environment' | 'user' = 'environment') => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setIsLiveCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Kameraga ulanib bo'lmadi:", err);
      setCameraError("Kameraga ulanib bo'lmadi yoki ruxsat berilmadi. Fayl yuklash yoki standart kameradan foydalaning.");
      setIsLiveCameraActive(false);
      // Fallback to standard input
      cameraInputRef.current?.click();
    }
  };

  // Snap photo from live video feed
  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    try {
      setIsProcessingPhoto(true);
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCustomPhoto(dataUrl);
        setSelectedPhoto(dataUrl);
        stopLiveCamera();
      }
    } catch (err) {
      console.error("Suratga olishda xatolik:", err);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Cleanup camera when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      if (!customPhoto) {
        if (initialCategory === 'uy_tozalash_gen') setSelectedPhoto(PRESET_PHOTOS[0].url);
        else if (initialCategory === 'oyna_yuvish') setSelectedPhoto(PRESET_PHOTOS[1].url);
        else if (initialCategory === 'kafel_marmar') setSelectedPhoto(PRESET_PHOTOS[3].url);
        else if (initialCategory === 'svarka_temir') setSelectedPhoto(PRESET_PHOTOS[4].url);
        else if (initialCategory === 'tom_krovlya') setSelectedPhoto(PRESET_PHOTOS[5].url);
      }
    }
    if (initialBudget) {
      setBudgetUzs(initialBudget);
    }
  }, [initialCategory, initialBudget, customPhoto]);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      const compressedDataUrl = await processAndResizeImage(file, 1200, 0.82);
      setCustomPhoto(compressedDataUrl);
      setSelectedPhoto(compressedDataUrl);
      setPhotoTab('camera_upload');
    } catch (err) {
      console.error("Rasm yuklashda xatolik:", err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemoveCustomPhoto = () => {
    setCustomPhoto(null);
    const defaultPreset = PRESET_PHOTOS.find(p => p.url.includes(category))?.url || PRESET_PHOTOS[0].url;
    setSelectedPhoto(defaultPreset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateJob({
      title,
      category,
      categoryLabel: 
        category === 'uy_tozalash_gen' ? "General Uborka 🌸" :
        category === 'oyna_yuvish' ? "Deraza & Oyna yuvish" :
        category === 'remontdan_keyin_tozalash' ? "Remontdan keyin tozalash" :
        category === 'dazmol_oshxona' ? "Dazmol & Oshxona yordami" :
        category === 'devor_terish' ? "Devor terish & G'isht" :
        category === 'kafel_marmar' ? "Kafel & Marmar" :
        category === 'suvoq_malyar' ? "Suvoq & Malyarka" :
        category === 'tom_krovlya' ? "Tom yopish (Krovlya)" :
        category === 'santexnik' ? "Santexnika & Issiq pol" :
        category === 'elektrik' ? "Elektr & Montaj" :
        category === 'svarka_temir' ? "Payvandchi & Svarka" :
        category === 'duradgor_mebel' ? "Duradgor & Laminat" :
        category === 'gipsokarton_shift' ? "Gipsokarton & Shift" :
        category === 'beton_fundament' ? "Beton & Fundament" :
        category === 'fasad_izolyatsiya' ? "Fasad & Penopleks" :
        category === 'pechka_tandir' ? "Tandir & O'choq-kamin" :
        category === 'bruschatka_yer' ? "Bruschatka & Hovli" :
        category === 'maishiy_texnika' ? "Konditsioner & Texnika" :
        category === 'talabalar_ish' ? "Talabalar ligasi" : "Boshqa xizmat",
      description: description || "Ish sharoitlari joyida batafsil tushuntiriladi. Ish o'z vaqtida va sifatli bajarilishi zarur.",
      voiceNoteAudioUrl: voiceNoteAudioUrl || undefined,
      voiceDurationSeconds: voiceDurationSeconds || undefined,
      photoUrl: customPhoto || selectedPhoto,
      city: 'Samarqand',
      district,
      locationAddress,
      targetCoords: {
        lat: district.includes('Urgut') ? 39.4050 :
             district.includes("Pastdarg'om") ? 39.5850 :
             district.includes('Toyloq') ? 39.6050 :
             district.includes("Temiryo'l") ? 39.6840 :
             district.includes("Sug'diyona") ? 39.6720 :
             district.includes('Siyob') ? 39.6640 :
             district.includes('Motrid') ? 39.6950 : 39.6542,
        lng: district.includes('Urgut') ? 67.2450 :
             district.includes("Pastdarg'om") ? 66.7550 :
             district.includes('Toyloq') ? 67.0450 :
             district.includes("Temiryo'l") ? 66.9240 :
             district.includes("Sug'diyona") ? 66.9380 :
             district.includes('Siyob') ? 66.9820 :
             district.includes('Motrid') ? 66.9450 : 66.9597,
      },
      budgetUzs,
      paymentType,
      urgent,
      mealProvided,
      toolsProvided,
      workersNeeded: 1,
      employerName,
      employerPhone,
      status: 'open',
      commissionAmount: 20000,
      commissionPaid: false,
      createdAt: 'Hozirgina'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 text-white shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-white">
              Yangi Buyurtma Berish (Usta yoki Ishchi Topish)
            </h2>
            <p className="text-xs text-stone-300">
              Barcha ustachilik sohalari: devor, kafel, svarka, tom, santexnik, elektrik va h.k.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Ishning qisqacha nomi *
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Hammomga 40 kv.m kafel urish yoki darvoza yasash..."
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ustachilik sohasi *
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="uy_tozalash_gen">🌸 General Uborka (Boshdan-oyoq tozalash)</option>
                <option value="oyna_yuvish">✨ Deraza & Oyna yuvish</option>
                <option value="remontdan_keyin_tozalash">🧹 Remontdan keyingi tozalash</option>
                <option value="dazmol_oshxona">🧺 Dazmol & Oshxona yordami</option>
                <option value="devor_terish">G'isht & Devor terish</option>
                <option value="kafel_marmar">Kafel & Keramogranit</option>
                <option value="suvoq_malyar">Suvoq & Malyarka</option>
                <option value="tom_krovlya">Tom yopish (Krovlya / Tunuka)</option>
                <option value="santexnik">Santexnika & Issiq pol</option>
                <option value="elektrik">Elektr & Montaj</option>
                <option value="svarka_temir">Payvandchi / Svarka (Naves, Darvoza)</option>
                <option value="duradgor_mebel">Duradgor & Laminat / Mebel</option>
                <option value="gipsokarton_shift">Gipsokarton & Natyajnoy shift</option>
                <option value="beton_fundament">Betonchi & Fundament</option>
                <option value="fasad_izolyatsiya">Fasad & Penopleks</option>
                <option value="pechka_tandir">Tandir & O'choq-kamin</option>
                <option value="bruschatka_yer">Bruschatka & Hovli ishlari</option>
                <option value="maishiy_texnika">Konditsioner & Texnika</option>
                <option value="talabalar_ish">Talabalar uchun yordamchi ish</option>
                <option value="yuk_mardikor">Yuk tashish & Mardikor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tuman / Hudud (Samarqand)
              </label>
              <select 
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setLocationAddress(`${e.target.value}, markaziy hudud`);
                }}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {SAMARKAND_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Aniq manzil / Mo'ljal
            </label>
            <input 
              type="text" 
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Masalan: Samarqand shahri, Registon yoki Sug'diyona mavzesi, 12-uy"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Budget ("Shuncha beraman") */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950">
                To'lov summasi ("Shuncha beraman") *
              </label>
              <div className="flex gap-1">
                {(['kunlik', 'ishbay', 'soatlik'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPaymentType(type)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      paymentType === type 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    {type === 'kunlik' ? 'Kunlik' : type === 'ishbay' ? 'Ishbay' : 'Soatlik'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input 
                type="number" 
                step="20000"
                min="50000"
                value={budgetUzs}
                onChange={(e) => setBudgetUzs(Number(e.target.value))}
                required
                className="w-full pl-3 pr-20 py-2.5 rounded-lg border border-amber-300 bg-white font-mono font-bold text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-3 top-3 text-xs font-semibold text-amber-800">
                SO'M
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              {[150000, 350000, 500000, 800000, 1500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudgetUzs(val)}
                  className="px-2 py-1 bg-white border border-amber-300 rounded hover:bg-amber-100 font-mono text-stone-700"
                >
                  {val.toLocaleString()} so'm
                </button>
              ))}
            </div>
          </div>

          {/* Description & Voice Speech-to-Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-900">
                Batafsil talab va ish hajmi *
              </label>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 font-semibold flex items-center gap-1">
                🎙️ Ovoz orqali aytish mumkin
              </span>
            </div>

            <textarea 
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masalan: 45 kv.m kafel uriladi. Materiallar va kley sotib olingan. Toza ishlaydigan usta kerak."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />

            {/* Voice Microphone Recorder & Speech-To-Text Component */}
            <VoiceInputRecorder
              currentText={description}
              onTranscription={(transcribedText) => {
                setDescription(transcribedText);
                if (!title) {
                  setTitle(transcribedText.slice(0, 60));
                }
              }}
              onAudioRecorded={(audioUrl, dur) => {
                setVoiceNoteAudioUrl(audioUrl);
                setVoiceDurationSeconds(dur);
              }}
            />
          </div>

          {/* Photo Section: Camera Snap / File Upload / Presets */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>Nima ishligini rasmga olish yoki yuklash</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Xona, devor, kafel yoki ta'mirlanadigan buyumning rasmini olib tashlang
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setPhotoTab('camera_upload')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    photoTab === 'camera_upload'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>O'z rasmingiz</span>
                  {customPhoto && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoTab('presets')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    photoTab === 'presets'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                  <span>Shablon rasmlar</span>
                </button>
              </div>
            </div>

            {/* Hidden native inputs for Camera and File upload */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            {photoTab === 'camera_upload' ? (
              <div>
                {isLiveCameraActive ? (
                  /* Live Camera Video Viewfinder */
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500 bg-black shadow-lg">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-64 sm:h-72 object-cover"
                    />
                    
                    {/* Viewfinder Overlay Guides */}
                    <div className="absolute inset-4 border border-dashed border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="text-[11px] font-semibold text-white/80 bg-black/50 px-2 py-1 rounded backdrop-blur-xs">
                        Ish joyini ramka ichiga oling
                      </span>
                    </div>

                    {/* Top status */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/95 text-white font-bold text-xs shadow-md backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span>Jonli kamera faol</span>
                      </span>

                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-white text-xs transition-colors backdrop-blur-sm"
                        title="Kamerani yopish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Camera Shutter Bar */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 bg-stone-950/85 backdrop-blur-md p-2.5 rounded-xl text-white">
                      <button
                        type="button"
                        onClick={() => {
                          const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
                          setCameraFacing(nextFacing);
                          startLiveCamera(nextFacing);
                        }}
                        className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors"
                        title="Old / Orqa kamerani almashtirish"
                      >
                        🔄 Kamera
                      </button>

                      {/* Giant Shutter Button */}
                      <button
                        type="button"
                        onClick={captureLivePhoto}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Suratga olish 📸</span>
                      </button>

                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        className="px-2.5 py-1.5 text-stone-400 hover:text-white text-xs"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </div>
                ) : customPhoto ? (
                  /* Custom photo active preview */
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-stone-900 shadow-md">
                    <img 
                      src={customPhoto} 
                      alt="Olingan ish joyi rasmi" 
                      className="w-full h-56 object-cover"
                    />
                    
                    {/* Top status bar */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/95 text-white font-bold text-xs shadow-md backdrop-blur-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Siz olgan rasm tayyor ✓</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleRemoveCustomPhoto}
                        className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-rose-600 text-white text-xs transition-colors backdrop-blur-sm"
                        title="Rasmni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom action controls */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-stone-950/85 backdrop-blur-md p-2.5 rounded-xl text-white">
                      <p className="text-[11px] text-stone-200">
                        Ustalar bu rasmni ko'rib hajmni to'g'ri baholaydi
                      </p>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startLiveCamera(cameraFacing)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Qayta suratga olish</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Fayl tanlash</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Capture / Upload prompt box */
                  <div className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-5 bg-amber-50/50 text-center transition-colors">
                    {isProcessingPhoto ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2.5">
                        <RefreshCw className="w-7 h-7 text-amber-600 animate-spin" />
                        <span className="text-xs font-bold text-stone-800">Rasm tayyorlanmoqda...</span>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                          <Camera className="w-7 h-7" />
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">
                            Nima ishligini kameraga olib tashlang
                          </h4>
                          <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                            Buzilgan devor, tozalanishi kerak bo'lgan xona, kafel yoki o'rnatiladigan jihozni kameradan darhol suratga oling
                          </p>
                        </div>

                        {cameraError && (
                          <div className="text-[11px] text-amber-900 bg-amber-100 p-2 rounded-lg max-w-md mx-auto">
                            {cameraError}
                          </div>
                        )}

                        {/* Dual Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => startLiveCamera('environment')}
                            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            <span>📸 Jonli kamerani yoqish (Suratga olish)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold rounded-xl text-xs shadow-2xs transition-colors flex items-center justify-center gap-2"
                          >
                            <Upload className="w-4 h-4 text-stone-600" />
                            <span>📁 Galereya / Fayl yuklash</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
                          <span>Telefon kamerasi yoki noutbuk veb-kamerasi ishlaydi</span>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => setPhotoTab('presets')}
                            className="text-amber-700 font-medium hover:underline"
                          >
                            yoki tayyor shablon rasmlar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Presets Grid */
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-stone-500">
                    Mos shablon rasmini tanlang:
                  </p>
                  <button
                    type="button"
                    onClick={() => setPhotoTab('camera_upload')}
                    className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>O'z ishingizni rasmga olish</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(p.url);
                        setCustomPhoto(null);
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all group aspect-4/3 text-left ${
                        selectedPhoto === p.url && !customPhoto
                          ? 'border-amber-500 ring-2 ring-amber-400' 
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 text-white text-[9px] font-medium truncate text-center">
                        {p.title}
                      </div>
                      {selectedPhoto === p.url && !customPhoto && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conditions Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
              <input 
                type="checkbox" 
                checked={mealProvided}
                onChange={(e) => setMealProvided(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-stone-700">Tushlik beriladi 🍲</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
              <input 
                type="checkbox" 
                checked={toolsProvided}
                onChange={(e) => setToolsProvided(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-stone-700">Asboblar bor 🔨</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
              <input 
                type="checkbox" 
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-amber-800 font-semibold">Shoshilinch (Bugun) ⚡</span>
            </label>
          </div>

          {/* Employer Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ismingiz
              </label>
              <input 
                type="text" 
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Telefon raqamingiz
              </label>
              <input 
                type="text" 
                value={employerPhone}
                onChange={(e) => setEmployerPhone(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Commission Note */}
          <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-800">Platforma kafolati: </span>
              Buyurtmangizni usta qabul qilganda jonli xaritada qancha vaqtda kelishini kuzatib turasiz. Har bir kelishuvdan platforma komissiyasi: 20 000 so'm.
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-2"
            >
              <span>E'lonni chiqarish</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
