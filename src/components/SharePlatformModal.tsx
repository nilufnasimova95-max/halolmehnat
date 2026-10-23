import { useState } from 'react';
import { 
  X, Share2, Copy, Check, Send, QrCode, 
  Globe, Search, Download, HelpCircle, 
  Smartphone, MessageSquare, ShieldCheck, ChevronRight,
  Gift, Sparkles, ExternalLink, Bot
} from 'lucide-react';

interface SharePlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SharePlatformModal({ isOpen, onClose }: SharePlatformModalProps) {
  const [activeTab, setActiveTab] = useState<'vercel' | 'share' | 'free' | 'domain' | 'discovery' | 'qr'>('vercel');
  const [copiedLink, setCopiedLink] = useState<'official' | 'live' | 'short' | 'vercel' | null>(null);

  if (!isOpen) return null;

  // Primary domain branding
  const officialDomain = 'https://halolmehnat.uz';
  const alternativeDomain = 'https://halolmehnat.com';

  // Current live deployment URL
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : 'https://ais-pre-glqv2d5ivqnl2nt5dit5sw-969185511858.asia-east1.run.app';

  // Example free short URLs
  const freeShortUrl = 'https://clck.ru/halolmehnat';
  const vercelFreeUrl = 'https://halolmehnat.vercel.app';

  const shareText = "HalolMehnat — Sovuqda ko'chada kutmasdan uydan turib usta chaqirish va ish topish platformasi! Real vaqtda GPS-kuzatuv, mikrofonda ovozli buyurtma va kafolatli ustalar:";

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(vercelFreeUrl)}&text=${encodeURIComponent(shareText)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + vercelFreeUrl)}`;
  const smsShareUrl = `sms:?body=${encodeURIComponent(shareText + ' ' + vercelFreeUrl)}`;

  const handleCopy = async (type: 'official' | 'live' | 'short' | 'vercel', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(type);
      setTimeout(() => setCopiedLink(null), 2500);
    } catch (err) {
      console.error("Nusxalashda xatolik:", err);
    }
  };

  // QR Code image URL generated dynamically for vercel domain
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(vercelFreeUrl)}&color=1c1917&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-black text-lg sm:text-xl text-white">
                  HalolMehnat<span className="text-amber-400">.vercel.app</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ⭐ Tanlangan Manzil
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Qisqa, esda qoladigan va 100% bepul rasmiy veb-manzil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 flex items-center gap-1 overflow-x-auto shrink-0 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'vercel'
                ? 'border-purple-600 text-purple-950 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>⭐ halolmehnat.vercel.app</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'share'
                ? 'border-amber-500 text-stone-950 bg-white font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Share2 className="w-4 h-4 text-amber-600" />
            <span>📤 Ulashish</span>
          </button>

          <button
            onClick={() => setActiveTab('free')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'free'
                ? 'border-emerald-500 text-stone-950 bg-white font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>🎁 Bepul Variantlar (0 so'm)</span>
          </button>

          <button
            onClick={() => setActiveTab('domain')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'domain'
                ? 'border-amber-500 text-stone-950 bg-white font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>🌐 .UZ va .COM</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'qr'
                ? 'border-amber-500 text-stone-950 bg-white font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-stone-700" />
            <span>📱 QR-Kod</span>
          </button>
        </div>

        {/* Modal Body */}
        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB 0: VERCEL DOMAIN (USER PREFERRED DOMAIN) */}
          {activeTab === 'vercel' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Hero Spotlight Card */}
              <div className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-purple-900 via-indigo-950 to-stone-950 text-white rounded-3xl shadow-xl border border-purple-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Siz tanlagan asosiy manzil</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 100% Bepul (0 so'm)
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2 flex-wrap">
                    <span>https://</span>
                    <span className="text-purple-300 underline decoration-purple-500 decoration-wavy underline-offset-4">halolmehnat</span>
                    <span className="text-amber-400">.vercel.app</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1.5 leading-relaxed">
                    Eslab qolish juda oson, chiroyli va har qanday telefon hamda kompyuter brauzerida xalqaro yuqori tezlikda ochiladi.
                  </p>
                </div>

                {/* Copy Box */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-stone-900/90 p-2.5 rounded-2xl border border-purple-500/40">
                  <input
                    type="text"
                    readOnly
                    value={vercelFreeUrl}
                    className="flex-1 bg-transparent text-xs sm:text-sm font-mono text-purple-200 px-2 outline-none select-all truncate font-bold"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy('vercel', vercelFreeUrl)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                        copiedLink === 'vercel'
                          ? 'bg-emerald-500 text-stone-950 scale-105'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {copiedLink === 'vercel' ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink === 'vercel' ? "Nusxalandi! ✅" : "Nusxalash"}</span>
                    </button>

                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1 border border-stone-700"
                      title="Hozirgi serverda sinab ko'rish"
                    >
                      <span>Jonli Sinov ↗</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-stone-300">
                  <div className="bg-white/5 backdrop-blur-xs p-2 rounded-xl border border-white/10 text-center">
                    <span className="block font-bold text-white">💰 0 so'm</span>
                    <span className="text-[10px] text-stone-400">Umrbod tekin</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-2 rounded-xl border border-white/10 text-center">
                    <span className="block font-bold text-white">🔒 SSL / HTTPS</span>
                    <span className="text-[10px] text-stone-400">Yashil qulfcha</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-2 rounded-xl border border-white/10 text-center">
                    <span className="block font-bold text-white">⚡ Global CDN</span>
                    <span className="text-[10px] text-stone-400">1 soniyada ochiladi</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xs p-2 rounded-xl border border-white/10 text-center">
                    <span className="block font-bold text-white">📱 PWA Tayyor</span>
                    <span className="text-[10px] text-stone-400">Telefonga o'rnatiladi</span>
                  </div>
                </div>
              </div>

              {/* Direct Social Sharing Buttons */}
              <div className="space-y-2.5">
                <span className="text-xs font-black text-stone-900 block flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  <span>«halolmehnat.vercel.app» manzilini darhol ulashish:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <a
                    href={telegramShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram guruhlarga</span>
                  </a>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={smsShareUrl}
                    className="p-3 bg-stone-800 hover:bg-stone-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>SMS / Xabar</span>
                  </a>
                </div>
              </div>

              {/* 3 Steps Guide to Connect Vercel */}
              <div className="p-4 sm:p-5 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                    V
                  </div>
                  <div>
                    <h4 className="font-black text-purple-950 text-sm">
                      Vercel.com orqali nomni 2 daqiqada band qilish qo'llanmasi
                    </h4>
                    <p className="text-[11px] text-purple-800">
                      Loyiha fayllarida <b>vercel.json</b> sozlamasi allaqachon tayyorlangan!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] flex items-center justify-center">
                      1
                    </span>
                    <h5 className="font-bold text-stone-900">GitHub repozitoriy</h5>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Loyiha kodini o'z bepul GitHub profilingizga yuklaysiz (yoki push qilasiz).
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] flex items-center justify-center">
                      2
                    </span>
                    <h5 className="font-bold text-stone-900">Vercel.com sayti</h5>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      <b>Vercel.com</b> saytiga kirib, GitHub orqali ro'yxatdan o'tasiz va "Add New Project" tugmasini bosasiz.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-1">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] flex items-center justify-center">
                      3
                    </span>
                    <h5 className="font-bold text-stone-900">Nomni kiritish</h5>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Project Name joyiga <code className="bg-purple-100 text-purple-900 px-1 rounded font-bold">halolmehnat</code> deb yozib, Deploy tugmasini bosasiz. Bo'ldi!
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-purple-200 text-xs text-stone-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="text-[11px]">
                      Hozirgi barcha usta qidirish, ovozli yozish va GPS xaritalar Vercel'da 100% ishlaydi.
                    </span>
                  </div>
                  <a
                    href="https://vercel.com/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 shadow-2xs"
                  >
                    <span>Vercel.com ↗</span>
                  </a>
                </div>
              </div>

              {/* QR Code Quick Card */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2.5 rounded-2xl border border-stone-300 shrink-0 shadow-xs">
                  <img
                    src={qrCodeUrl}
                    alt="halolmehnat.vercel.app QR Code"
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="font-bold text-stone-900 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                    <QrCode className="w-4 h-4 text-purple-600" />
                    <span>Telefon kamerasi orqali to'g'ridan-to'g'ri ochish:</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Odamlar telefon kamerasini ushbu QR-kodga tutishi bilan <code className="font-mono font-bold text-purple-900">halolmehnat.vercel.app</code> ochiladi.
                  </p>
                  <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                    <button
                      onClick={() => setActiveTab('qr')}
                      className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                    >
                      <span>Katta formatda ko'rish va yuklab olish →</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 1: QUICK SHARE */}
          {activeTab === 'share' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Primary Active Live Link Box */}
              <div className="p-4 sm:p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs sm:text-sm font-black text-emerald-950">
                      Hozir Jonli Ishlayotgan Sayt Havolasi (100% Ochiq):
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full">
                    Jonli Server
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2 rounded-xl border border-emerald-300">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-transparent text-xs sm:text-sm font-mono text-stone-900 px-2 outline-none select-all truncate font-semibold"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy('live', currentUrl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        copiedLink === 'live'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      }`}
                    >
                      {copiedLink === 'live' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'live' ? "Nusxalandi!" : "Nusxalash"}</span>
                    </button>

                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-1 shadow-xs"
                    >
                      <span>Ochish ↗</span>
                    </a>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">
                  ✅ Ushbu havolani bosgan har qanday odamda sayt hozirning o'zidayoq to'liq ochiladi va ishlaydi!
                </p>
              </div>

              {/* Crucial Explanation about halolmehnat.uz */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-950">
                      Nega brauzerda «halolmehnat.uz» deb yozganda hali ochilmayapti?
                    </h4>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      Chunki <b>«halolmehnat.uz»</b> — bu rejalashtirilgan brend domen nomi. Uni hali siz (yoki biz) <b>Eskiz.uz</b> yoki <b>Reg.uz</b> saytidan rasman sotib olmadingiz (ro'yxatdan o'tkazmadingiz)!
                    </p>
                  </div>
                </div>

                <div className="pl-7 text-xs text-stone-700 space-y-1.5 bg-white/70 p-3 rounded-xl border border-amber-200">
                  <p>
                    📌 <b>Domen nima degani?</b> Bu xuddi telefon raqami yoki mashina nomeri kabi. Sayt tayyor bo'lsa ham, agar unga <code className="bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-bold">halolmehnat.uz</code> nomerini Eskiz.uz'dan ~33,000 so'mga sotib olib ulamasangiz, brauzer bu nom qayerga borishini bilmaydi.
                  </p>
                  <p>
                    👉 <b>Hozir nima qilish kerak?</b> Hozir odamlarga tarqatish uchun yuqoridagi <b>yashil jonli havoladan</b> foydalanasiz. Xohlagan vaqtingizda esa Eskiz.uz dan domenni olib ulab qo'yish mumkin.
                  </p>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 block">
                  Bitta bosishda guruhlar va yaqinlarga yuborish:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Telegram */}
                  <a
                    href={telegramShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  {/* SMS */}
                  <a
                    href={smsShareUrl}
                    className="p-3 bg-stone-800 hover:bg-stone-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Oddiy SMS</span>
                  </a>
                </div>
              </div>

              {/* Mini discovery tip */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="text-xs text-stone-600 leading-relaxed">
                  <b className="text-stone-900">Usta va mijozlarni tezroq jalb qilish usuli:</b> Havolani Samarqanddagi usta va qurilish Telegram guruhlariga (masalan: <i>«Samarqand Ustalar», «Kvartira remont Samarqand»</i>) jo'nating. Ular bepul kirib buyurtma olishadi.
                </div>
              </div>

            </div>
          )}

          {/* TAB: FREE DOMAIN & FREE OPTIONS */}
          {activeTab === 'free' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Answer Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-white/20 text-white">
                    <Gift className="w-5 h-5 text-amber-300" />
                  </span>
                  <span className="font-extrabold text-sm sm:text-base">
                    HA, 100% BEPUL FOYDALANSA BO'LADI! (0 SO'M XARAJAT)
                  </span>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Siz domenga ham, hostingga ham 1 tiyin to'lamasdan saytni xalqqa taqdim etishingiz mumkin. Quyida 4 ta eng qulay va 100% bepul usul keltirilgan:
                </p>
              </div>

              {/* 1. Hozirgi bepul havola */}
              <div className="p-4 bg-white rounded-2xl border-2 border-emerald-400 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    <h4 className="font-black text-stone-900 text-sm">
                      Hozirgi Bepul Havolamiz (Google Cloud / AI Studio)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    🟢 Tayyor & 0 so'm
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Saytimiz hozirning o'zidayoq butun dunyo uchun ochiq! Google Cloud serverlarida bepul joylashgan, SSL sertifikati (yashil qulfcha) himoyalangan va hech qachon to'lov so'ramaydi.
                </p>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <code className="text-xs font-mono font-bold text-stone-900 break-all">
                    {currentUrl}
                  </code>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy('live', currentUrl)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedLink === 'live' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'live' ? "Nusxalandi!" : "Nusxalash"}</span>
                    </button>
                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ochish</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 2. Bepul Qisqa Havolalar (TinyURL / clck.ru / is.gd) */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    <h4 className="font-black text-stone-900 text-sm">
                      Bepul Qisqa Havola Yaratish (Oson eslab qolish uchun)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700">
                    0 so'm / 10 soniya
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Agar uzoq havolani telefon va qog'ozda yozish noqulay bo'lsa, uni bepul qisqartirib olishingiz mumkin. Masalan:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-blue-600 font-bold block">TinyURL bepul xizmati:</span>
                      <span className="font-mono font-bold text-stone-900">tinyurl.com/halolmehnat</span>
                    </div>
                    <a
                      href={`https://tinyurl.com/api-create.php?url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1"
                    >
                      <span>Ochish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-700 font-bold block">clck.ru (Yandex tekin xizmati):</span>
                      <span className="font-mono font-bold text-stone-900">clck.ru/halolmehnat</span>
                    </div>
                    <a
                      href="https://clck.ru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1"
                    >
                      <span>Ochish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  👉 <b>Qanday qilinadi:</b> Hozirgi saytimiz havolasini nusxalang, TinyURL yoki clck.ru saytiga qo'ying va bitta tugma bilan qisqa havolaga aylantiring!
                </div>
              </div>

              {/* 3. Telegram WebApp & Bot — Eng ommabop va 100% BEPUL */}
              <div className="p-4 bg-white rounded-2xl border-2 border-sky-400 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#229ED9] text-white flex items-center justify-center text-xs font-black">
                      3
                    </span>
                    <h4 className="font-black text-stone-900 text-sm flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-[#229ED9]" />
                      <span>Telegram Bot va WebApp (O'zbekistonda 1-o'rindagi usul)</span>
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800">
                    🔥 Eng ko'p mijoz
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  O'zbekistonda aholining <b>90% dan ortig'i har kuni Telegramda</b>. Odamlar brauzerga nom terib o'tirmaydi, Telegram orqali kirishni xush ko'rishadi!
                </p>

                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs space-y-2">
                  <div className="font-bold text-sky-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Telegram orqali 100% bepul qanday ishlatiladi?</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sky-900">
                    <li>Telegramda rasmiy <b>@BotFather</b> orqali bepul bot ochiladi (masalan: <b>@halolmehnat_bot</b>).</li>
                    <li>Ushbu sayt havolasi botga <b>«Web App»</b> tugmasi qilib ulanadi.</li>
                    <li>Har qanday foydalanuvchi yoki usta botga kirib, <b>«🛠 Ustalar Bozorini Ochish»</b> tugmasini bossa, sayt to'g'ridan-to'g'ri Telegram ichida ochiladi!</li>
                    <li>Xarajat: <b>0 so'm</b>, umrbod bepul!</li>
                  </ul>
                </div>
              </div>

              {/* 4. Vercel va Netlify bepul subdomenlari */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                      4
                    </span>
                    <h4 className="font-black text-stone-900 text-sm">
                      Vercel va Netlify Bepul Subdomenlari (.app)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700">
                    Dasturchilar tanlovi
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Dunyodagi eng yirik hosting provayderlari <b>Vercel</b> va <b>Netlify</b> har qanday loyiha uchun bepul subdomen beradi:
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-900 break-all">
                    <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>https://halolmehnat.vercel.app</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy('vercel', 'https://halolmehnat.vercel.app')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedLink === 'vercel' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'vercel' ? "Nusxalandi!" : "Nusxalash"}</span>
                    </button>
                    <a
                      href="https://vercel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <span>Vercel.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-xs space-y-1.5 text-purple-950">
                  <span className="font-bold block text-purple-900">
                    🚀 halolmehnat.vercel.app qilish juda oson va ajoyib g'oya:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-purple-900/90 text-[11px]">
                    <li><b>GitHub:</b> Kod bepul GitHub hisobingizga yuklanadi.</li>
                    <li><b>Vercel:</b> <b>Vercel.com</b> saytiga bepul kirib, GitHub orqali «Import Project» bosiladi.</li>
                    <li><b>Nom berish:</b> Loyihaga <code>halolmehnat</code> deb nom berilsa, Vercel darhol <b>halolmehnat.vercel.app</b> manzilini 100% tekinga biriktirib beradi!</li>
                  </ol>
                </div>
              </div>

              {/* Taqqoslash va Xulosa */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-2 text-xs">
                <div className="font-black text-amber-400 flex items-center gap-2 text-sm">
                  <span>⚖️ Xulosa: Bepul vs Pullik</span>
                </div>
                <p className="text-stone-300 leading-relaxed">
                  • <b>Bepul usullar (0 so'm):</b> Saytning barcha funksiyalari (GPS-xarita, usta chaqirish, mikrofon bilan ovozli yozish, SMS/Telegram) xuddi hozirgidek 100% to'liq ishlayveradi.<br/>
                  • <b>Pullik .UZ domen (~33 000 so'm/yil):</b> Faqat qisqa va milliy <code>halolmehnat.uz</code> nomiga ega bo'lish uchun kerak. Agar hozir xarajat qilishni xohlamasangiz, <b>bepul havoladan bemalol foydalanavering!</b>
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: DOMAIN EXPLANATION (.UZ & .COM) */}
          {activeTab === 'domain' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Highlight card */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-850 text-white p-5 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-black">
                    Platforma Nomi va Manzili
                  </span>
                  <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                    Tasdiqlangan
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                    HalolMehnat<span className="text-amber-400">.uz</span>
                  </h3>
                  <p className="text-stone-300 text-xs">
                    Shuningdek xalqaro bozor uchun: <b>HalolMehnat.com</b>
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-800 text-xs text-stone-300 leading-relaxed">
                  «HalolMehnat» nomi xalqimizning mehnati qadriga yetish, usta va mardikorlarimizni sovuqda ko'chada kutishdan asrash va 20,000 so'mlik adolatli kafolatli tizimni ifodalaydi.
                </div>
              </div>

              {/* How .UZ domain works in Uzbekistan */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>O'zbekistonda .UZ Domen qanday ishlaydi va olinadi?</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <h5 className="font-bold text-stone-900">
                        .UZ Domen — O'zbekistonning milliy rasmiy internet domeni
                      </h5>
                      <p className="text-stone-600 mt-0.5 leading-relaxed">
                        Sayt nomi sifatida <b>halolmehnat.uz</b> tanlangan. Odamlar har qanday telefon yoki kompyuter brauzerida ushbu nomni yozsa, saytingiz ochiladi.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <h5 className="font-bold text-stone-900">
                        Qayerdan ro'yxatdan o'tkaziladi? (Akkreditatsiyadan o'tgan registratorlar)
                      </h5>
                      <p className="text-stone-600 mt-0.5 leading-relaxed">
                        O'zbekistonda rasmiy .UZ domenini <b>Eskiz.uz</b>, <b>cpanel.uz</b> yoki <b>Reg.uz</b> saytlaridan pasport/ID karta orqali 3 daqiqada ro'yxatdan o'tkazish mumkin. Narxi yiliga atigi ~<b>30 000 — 35 000 so'm</b> atrofida.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <h5 className="font-bold text-stone-900">
                        Saytga qanday ulanadi? (DNS sozlamalari)
                      </h5>
                      <p className="text-stone-600 mt-0.5 leading-relaxed">
                        Domenni olgach, uning shaxsiy kabinetida <b>DNS (A-Record va CNAME)</b> yozuviga ushbu server IP manzili ko'rsatiladi. Shunda 10-15 daqiqa ichida sayt butun O'zbekiston bo'ylab <b>HalolMehnat.uz</b> nomi bilan ochiq bo'ladi.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Status summary */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>SEO va ijtimoiy tarmoq kartalari HalolMehnat.uz nomiga to'liq sozlangan!</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: HOW OTHERS FIND THE PLATFORM */}
          {activeTab === 'discovery' && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <h4 className="font-display font-black text-sm sm:text-base text-amber-950">
                  Odamlar va ustalar bu saytni qanday topishadi?
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  O'zbekistonda yangi servisni xalqqa tanitishning 5 ta eng samarali va bepul yo'li saytimizga integratsiya qilingan:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs">
                
                {/* 1. Telegram */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-stone-950 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#229ED9] text-white flex items-center justify-center text-xs font-black">
                        1
                      </span>
                      <span>Telegram guruhlar va kanallar (90% auditoriya)</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full">
                      Eng asosiysi
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed pl-8">
                    O'zbekistonda ustalar ham, mijozlar ham Telegramda faol. Sayt havolasini «Samarqand Ustalar», «Urgut Qurilish», «Santexniklar chat» va mahalla guruhlariga tarqatish orqali minglab odamlar darhol kiradi.
                  </p>
                </div>

                {/* 2. Google and Yandex SEO */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-stone-950 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                        2
                      </span>
                      <span>Google va Yandex qidiruv tizimlari (SEO)</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full">
                      Avtomatik
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed pl-8">
                    Saytimiz kodiga <i>«Samarqand usta bozori»</i>, <i>«mardikor yollash»</i>, <i>«uyga santexnik elektrik chaqirish»</i> kabi qidiruv kalit so'zlari va Schema.org kiritilgan. Odamlar internetda qidirganda sayt chiqadi.
                  </p>
                </div>

                {/* 3. QR Codes at Construction Markets */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-stone-950 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">
                        3
                      </span>
                      <span>Qurilish bozorlaridagi QR-kodli plakatlar</span>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full">
                      Jonli natija
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed pl-8">
                    Siyob bozori, Urgut qurilish bozori va Jomboydagi qurilish mollari do'konlariga QR-kodni qog'ozga chiqarib ilib qo'yilsa, ustalarning o'zlari telefon kamerasini tutib saytga ulanishadi.
                  </p>
                </div>

                {/* 4. Phone PWA installation */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-stone-950 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                        4
                      </span>
                      <span>Telefonga ilova qilib o'rnatish (PWA)</span>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold text-[10px] rounded-full">
                      Play Market siz
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed pl-8">
                    Play Market'dan qidirish shart emas: foydalanuvchi saytga kirganda brauzer menyusidan <b>«Bosh ekranga qo'shish» (Add to Home Screen)</b> tugmasini bossa, telefonida ilovadek belgisi paydo bo'ladi.
                  </p>
                </div>

                {/* 5. Word-of-mouth & Fair Commission */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-stone-950 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center text-xs font-black">
                        5
                      </span>
                      <span>Og'izdan-og'izga tavsiya (Halol 20,000 so'm tizim)</span>
                    </div>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-800 font-bold text-[10px] rounded-full">
                      Ishonch
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed pl-8">
                    Bozorda kun bo'yi sovuqda turmasdan uydan turib buyurtma olgan usta buni do'stlariga aytadi. GPS orqali usta kelayotganini ko'rgan ish beruvchi esa qo'shnilariga tavsiya qiladi.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: QR CODE (FOR MARKETS & POSTERS) */}
          {activeTab === 'qr' && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-6">
                
                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-3xl border-2 border-stone-300 shadow-md shrink-0 flex flex-col items-center">
                  <img
                    src={qrCodeUrl}
                    alt="HalolMehnat.uz QR Kodi"
                    className="w-48 h-48 object-contain"
                  />
                  <div className="text-center mt-2">
                    <span className="font-mono text-xs font-black text-stone-900 block">
                      HalolMehnat.uz
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">
                      Kamera bilan skaner qiling
                    </span>
                  </div>
                </div>

                {/* Explanatory text & actions */}
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                      Bozor va do'konlar uchun
                    </span>
                    <h4 className="font-display font-black text-stone-950 text-base sm:text-lg mt-1">
                      Ushbu QR-kod orqali sayt 1 soniyada ochiladi
                    </h4>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Ushbu QR-kodni printerdan qog'ozga chiqarib (A4 formatda), Samarqand va tumanlardagi qurilish mollari do'konlari, g'isht/sement omborlari yoki mardikorlar to'planadigan joylarga ilib qo'yish mumkin.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <a
                      href={qrCodeUrl}
                      download="HalolMehnat-UZ-QR.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>QR-kod rasmini yuklab olish</span>
                    </a>

                    <button
                      onClick={() => window.print?.()}
                      className="w-full sm:w-auto px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition-colors"
                    >
                      Chop etish (Print)
                    </button>
                  </div>
                </div>

              </div>

              {/* Instructions */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <span className="text-base">📱</span>
                <span>Har qanday oddiy Android yoki iPhone kamerasi ushbu kodni ko'rishi bilan darhol <b>HalolMehnat.uz</b> saytini ochadi.</span>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>HalolMehnat.uz — Xalq uchun qulay va ochiq platforma</span>
          </div>
          
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Tushundim
          </button>
        </div>

      </div>
    </div>
  );
}
