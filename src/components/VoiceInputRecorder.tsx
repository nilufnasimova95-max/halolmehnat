import { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Square, Play, Pause, Trash2, 
  Volume2, Sparkles, CheckCircle2, AlertCircle, RefreshCw, AudioWaveform
} from 'lucide-react';

interface VoiceInputRecorderProps {
  onTranscription: (text: string) => void;
  onAudioRecorded?: (audioUrl: string | null, durationSeconds: number) => void;
  currentText?: string;
  placeholder?: string;
}

// Common Uzbek job request templates that user can also tap
const QUICK_UZBEK_PHRASES = [
  "Hovli devoriga pishiq g'isht teradigan usta kerak",
  "Hammom va oshxonaga kafel urish kerak, material bor",
  "3 xonali kvartirani boshdan-oyoq tozalash (general uborka)",
  "Santexnika quvuri va kranni almashtirish kerak",
  "Elektr montaj va lyustralarni o'rnatish lozim",
  "Yuk tushirish va ko'tarishga 2 nafar mardikor kerak",
  "Tom yopish va tunuka tunukasoz usta kerak"
];

// Helper to format seconds as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function VoiceInputRecorder({
  onTranscription,
  onAudioRecorded,
  currentText = '',
  placeholder = "Ovozingiz avtomatik tarzda matnga aylanadi..."
}: VoiceInputRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [liveInterimText, setLiveInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check browser support
  useEffect(() => {
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
    const hasSpeech = typeof window !== 'undefined' && 
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setIsSupported(hasMedia || hasSpeech);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  // Start Voice Recording & Speech-to-Text
  const startRecording = async () => {
    setSpeechError(null);
    setLiveInterimText('');
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    // 1. Setup Audio MediaRecorder
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true 
          } 
        });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const mimeType = recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          // Convert to object URL or Data URL
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            setRecordedAudioUrl(base64Audio);
            if (onAudioRecorded) {
              onAudioRecorded(base64Audio, recordingSeconds || 5);
            }
          };
        };

        recorder.start(100);
      }
    } catch (err: any) {
      console.warn("Mikrofonga ulanishda xatolik:", err);
      // Even if mic recording is restricted, speech recognition or text might still work
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setSpeechError("Mikrofondan foydalanishga ruxsat berilmadi. Iltimos brauzer sozlamalarida mikrofonga ruxsat bering.");
      }
    }

    // 2. Setup Web Speech Recognition (Speech-to-Text)
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        
        // Try Uzbek first, browser fallbacks gracefully
        recognition.lang = 'uz-UZ';

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript + ' ';
            } else {
              interim += transcript;
            }
          }

          if (interim) {
            setLiveInterimText(interim);
          }

          if (final) {
            setLiveInterimText('');
            const combined = currentText ? `${currentText.trim()} ${final.trim()}` : final.trim();
            onTranscription(combined);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error === 'no-speech') {
            // normal pause
          } else if (event.error === 'language-not-supported') {
            // Try fallback language ru-RU
            try {
              recognition.lang = 'ru-RU';
              recognition.start();
            } catch (e) {
              // ignore
            }
          }
        };

        recognition.start();
      } catch (err) {
        console.warn("SpeechRecognition boshlanmadi:", err);
      }
    }

    setIsRecording(true);

    // Timer
    timerIntervalRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => {
        const next = prev + 1;
        setAudioDuration(next);
        if (next >= 120) { // Max 2 minutes
          stopRecording();
        }
        return next;
      });
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    stopRecordingCleanup();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (liveInterimText.trim()) {
      const combined = currentText ? `${currentText.trim()} ${liveInterimText.trim()}` : liveInterimText.trim();
      onTranscription(combined);
      setLiveInterimText('');
    }
  };

  // Toggle playback of recorded audio
  const togglePlayAudio = () => {
    if (!recordedAudioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(recordedAudioUrl);
      audioElementRef.current.onended = () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
      };
      audioElementRef.current.ontimeupdate = () => {
        if (audioElementRef.current) {
          const prog = (audioElementRef.current.currentTime / audioElementRef.current.duration) * 100;
          setAudioProgress(prog || 0);
        }
      };
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Delete recorded voice note
  const handleDeleteAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setRecordedAudioUrl(null);
    setAudioDuration(0);
    setIsPlayingAudio(false);
    setAudioProgress(0);
    if (onAudioRecorded) {
      onAudioRecorded(null, 0);
    }
  };

  // Quick phrase insertion
  const handleSelectPhrase = (phrase: string) => {
    const combined = currentText ? `${currentText.trim()}. ${phrase}` : phrase;
    onTranscription(combined);
  };

  return (
    <div className="space-y-3">
      {/* Voice Bar Main Action Box */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all ${
        isRecording 
          ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-200' 
          : recordedAudioUrl
          ? 'bg-emerald-50/70 border-emerald-300'
          : 'bg-amber-50/70 border-amber-300/80 hover:border-amber-400'
      }`}>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Status Label & Wave */}
          <div className="flex items-center gap-3">
            {isRecording ? (
              <div className="relative flex items-center justify-center shrink-0">
                <span className="w-5 h-5 rounded-full bg-rose-500 animate-ping absolute" />
                <span className="w-4 h-4 rounded-full bg-rose-600 relative flex items-center justify-center text-white text-[10px]">
                  ●
                </span>
              </div>
            ) : recordedAudioUrl ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm">
                <Mic className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <span>
                  {isRecording 
                    ? "Ovozingiz yozilmoqda va matnga aylanmoqda..." 
                    : recordedAudioUrl 
                    ? "Ovozli xabar tayyor va saqlandi!" 
                    : "Yozish o'rniga ovoz bilan ayting"}
                </span>

                {isRecording && (
                  <span className="font-mono text-rose-600 font-bold bg-white px-2 py-0.5 rounded-full border border-rose-300 text-xs">
                    {formatTime(recordingSeconds)}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-stone-600 mt-0.5">
                {isRecording 
                  ? "Batafsil gapiring: qayerda, qanday ish va qachon kerakligi haqida..."
                  : recordedAudioUrl
                  ? `Usta bu ovozli xabarni bevosita eshitishi mumkin (${audioDuration} soniya)`
                  : "Mikrofonni bosing va gapiring — sayt uni o'zi matnga yozib beradi!"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md animate-pulse transition-transform active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>To'xtatish (Saqlash)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-95 ${
                  recordedAudioUrl
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                }`}
              >
                <Mic className="w-4 h-4 text-stone-950" />
                <span>{recordedAudioUrl ? "Qayta gapirish 🎙️" : "Mikrofonni yoqish 🎙️"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Waves Animation during recording */}
        {isRecording && (
          <div className="mt-3 pt-3 border-t border-rose-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 h-6">
              {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65, 40, 85].map((height, i) => (
                <span
                  key={i}
                  className="w-1 bg-rose-500 rounded-full animate-pulse inline-block"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: '0.6s'
                  }}
                />
              ))}
            </div>

            {liveInterimText && (
              <div className="flex-1 ml-2 text-xs text-rose-900 bg-white/80 p-2 rounded-lg border border-rose-200 italic truncate font-medium">
                "{liveInterimText}"
              </div>
            )}
          </div>
        )}

        {/* Recorded Audio Player Controls */}
        {recordedAudioUrl && !isRecording && (
          <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
                title="Eshittirish"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <div className="text-xs">
                <span className="font-bold text-stone-800">Yozilgan ovozli xabar</span>
                <span className="text-[11px] text-stone-500 ml-1.5 font-mono">({audioDuration} sek)</span>
              </div>
            </div>

            {/* Visual audio progress bar */}
            <div className="flex-1 max-w-[150px] sm:max-w-[200px] bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-150"
                style={{ width: `${audioProgress}%` }}
              />
            </div>

            <button
              type="button"
              onClick={handleDeleteAudio}
              className="text-stone-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
              title="O'chirish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Permission / Browser Error notice */}
        {speechError && (
          <div className="mt-2 text-xs text-amber-800 bg-amber-100 p-2 rounded-lg flex items-center gap-1.5 border border-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{speechError}</span>
          </div>
        )}
      </div>

      {/* Fast Uzbek Speech Chips (Bir bosishda tayyor matn) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Yoki tayyor variantni bitta bosishda tanlang:</span>
          </span>
          <span className="text-[10px] text-stone-400">Yozish shart emas</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_UZBEK_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPhrase(phrase)}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-950 text-[11px] border border-stone-200 hover:border-amber-300 transition-colors text-left flex items-center gap-1.5"
            >
              <span className="text-amber-600">💬</span>
              <span>{phrase}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
