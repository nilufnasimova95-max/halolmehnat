import { useState, useRef } from 'react';
import { 
  X, Phone, User, MapPin, Camera, CheckCircle2, 
  Sparkles, ArrowRight, Upload, RefreshCw, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobOrder, JobCategory } from '../types';
import { SAMARKAND_DISTRICTS } from '../data/initialData';
import { processAndResizeImage } from '../utils/imageResize';
import { VoiceInputRecorder } from './VoiceInputRecorder';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob: (newJob: Partial<JobOrder>) => void;
}

export function QuickOrderModal({ isOpen, onClose, onCreateJob }: QuickOrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [workDescription, setWorkDescription] = useState('');
  const [district, setDistrict] = useState('Samarqand shahri (Markaz / Registon)');
  const [budgetUzs, setBudgetUzs] = useState('300000');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [voiceNoteAudioUrl, setVoiceNoteAudioUrl] = useState<string | null>(null);
  const [voiceDurationSeconds, setVoiceDurationSeconds] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingPhoto(true);
      const dataUrl = await processAndResizeImage(file, 1200, 0.82);
      setPhoto(dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workDescription.trim()) return;

    // Detect category roughly from text
    let cat: JobCategory = 'devor_terish';
    const text = workDescription.toLowerCase();
    if (text.includes('toza') || text.includes('uborka') || text.includes('yuv')) cat = 'uy_tozalash_gen';
    else if (text.includes('kafel') || text.includes('marmar')) cat = 'kafel_marmar';
    else if (text.includes('suvoq') || text.includes('malyar') || text.includes('bo\'yoq')) cat = 'suvoq_malyar';
    else if (text.includes('tom') || text.includes('tunuka')) cat = 'tom_krovlya';
    else if (text.includes('kran') || text.includes('santex') || text.includes('suv') || text.includes('truba')) cat = 'santexnik';
    else if (text.includes('tok') || text.includes('elektr') || text.includes('sim') || text.includes('rozetka')) cat = 'elektrik';
    else if (text.includes('svarka') || text.includes('temir') || text.includes('darvoza')) cat = 'svarka_temir';
    else if (text.includes('mebel') || text.includes('eshik') || text.includes('rom')) cat = 'duradgor_mebel';
    else if (text.includes('yuk') || text.includes('mardikor')) cat = 'yuk_mardikor';

    onCreateJob({
      title: workDescription.slice(0, 70),
      category: cat,
      categoryLabel: "Tezkor chaqiruv",
      description: workDescription,
      voiceNoteAudioUrl: voiceNoteAudioUrl || undefined,
      voiceDurationSeconds: voiceDurationSeconds || undefined,
      photoUrl: photo || '/src/assets/images/job_bricklaying_wall_1791274845977.jpg',
      locationAddress: `${district}, Samarqand viloyati`,
      city: 'Samarqand',
      district,
      budgetUzs: parseInt(budgetUzs) || 300000,
      paymentType: 'kunlik',
      urgent: true,
      mealProvided: true,
      toolsProvided: false,
      employerName: name,
      employerPhone: phone,
      status: 'open',
      createdAt: 'Hozirgina'
    });

    confetti({ particleCount: 70, spread: 60 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[94vh]">
        
        {/* Top Simple Header */}
        <div className="bg-amber-500 text-stone-950 p-5 shrink-0 flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-950 text-amber-300">
              Oddiy & Tezkor (1 daqiqa)
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl mt-1 text-stone-950">
              Usta yoki Ishchi Chaqirish
            </h3>
            <p className="text-xs text-stone-900 font-medium">
              Hech qanday murakkabliksiz, faqat telefoningiz va nima ishligini ayting
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-950/10 hover:bg-stone-950/20 text-stone-950 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Step 1: Nima ish */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-stone-900">
                1. Qanday ish bajarilishi kerak? *
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                🎙️ Yozish shart emas!
              </span>
            </div>

            <textarea
              rows={2}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Masalan: Hammomdagi kranni almashtirish kerak yoki hovliga devor terishga 1 kishi kerak..."
              required
              className="w-full p-3 rounded-xl border-2 border-stone-300 focus:border-amber-500 text-sm focus:outline-none placeholder:text-stone-400"
            />

            {/* Voice Speech-to-Text & Mic Recorder */}
            <VoiceInputRecorder
              currentText={workDescription}
              onTranscription={(text) => setWorkDescription(text)}
              onAudioRecorded={(audioUrl, dur) => {
                setVoiceNoteAudioUrl(audioUrl);
                setVoiceDurationSeconds(dur);
              }}
            />
          </div>

          {/* Photo attach button */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              Ish joyi rasmi (Ixtiyoriy, lekin foydali)
            </label>

            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={cameraInputRef} 
              onChange={handlePhotoSelect} 
              className="hidden" 
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handlePhotoSelect} 
              className="hidden" 
            />

            {photo ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 h-28 bg-stone-900 flex items-center justify-center">
                <img src={photo} alt="Yuklangan rasm" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">
                  Rasm tayyor ✓
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>Kameradan rasmga olish</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-4 h-4 text-stone-500" />
                  <span>Galereya</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Telefon & Ism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                2. Ismingiz *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Sardor aka"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                3. Telefon raqamingiz *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Tuman & Narx */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Qaysi hudud / tuman?
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-xs bg-white font-medium text-stone-800"
              >
                {SAMARKAND_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Qancha berasiz? (so'mda)
              </label>
              <input
                type="number"
                step="50000"
                value={budgetUzs}
                onChange={(e) => setBudgetUzs(e.target.value)}
                placeholder="300 000"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-mono font-bold text-stone-900"
              />
            </div>
          </div>

          {/* Big Green Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessingPhoto}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-2xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
            >
              <span>✅ BUYURTMANI YUBORISH (USTA CHAQIRISH)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-[11px] text-stone-500 mt-2">
              Ustalar darhol ko'radi va telefoningizga qo'ng'iroq qiladi
            </p>
          </div>

          {/* Telephone Helpline */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
            <div>
              <span className="font-bold">Yozishga erinsangiz:</span>
              <p className="text-[11px] text-amber-800">Operatorimizga bitta qo'ng'iroq qiling</p>
            </div>
            <a
              href="tel:+998662000000"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Qo'ng'iroq</span>
            </a>
          </div>

        </form>

      </div>
    </div>
  );
}
