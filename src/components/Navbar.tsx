import { useState } from 'react';
import { 
  PlusCircle, CreditCard, User, Menu, X, 
  HardHat, Navigation, ShieldCheck, Heart, Bell, Share2, CheckCircle2, HelpCircle,
  BarChart3, Star, Edit3, MessageSquare
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateJob: () => void;
  onOpenCommissionDashboard: () => void;
  onOpenPerformanceMetrics: () => void;
  onOpenTradesDirectory: () => void;
  onOpenHowItWorks: () => void;
  onOpenFAQ: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenMessenger?: () => void;
  unreadMessagesCount?: number;
  currentRole: 'employer' | 'worker';
  onToggleRole: () => void;
  activeView: 'jobs' | 'workers' | 'students' | 'cleaning' | 'radar' | 'completed';
  onSelectView: (view: 'jobs' | 'workers' | 'students' | 'cleaning' | 'radar' | 'completed') => void;
  activeJobsCount: number;
  completedJobsCount?: number;
  activeTrackingCount?: number;
  onOpenLiveTracking?: () => void;
  onOpenShare?: () => void;
  onOpenMyProfile?: () => void;
  onOpenProfileEditor?: () => void;
}

export function Navbar({
  onOpenCreateJob,
  onOpenCommissionDashboard,
  onOpenPerformanceMetrics,
  onOpenTradesDirectory,
  onOpenHowItWorks,
  onOpenFAQ,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenMessenger,
  unreadMessagesCount = 0,
  currentRole,
  onToggleRole,
  activeView,
  onSelectView,
  activeJobsCount,
  completedJobsCount = 0,
  activeTrackingCount = 0,
  onOpenLiveTracking,
  onOpenShare,
  onOpenMyProfile,
  onOpenProfileEditor
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark with .uz domain branding */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => onSelectView('jobs')} 
            className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-display flex items-center gap-2 hover:opacity-95 group"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              H
            </span>
            <span className="flex items-baseline">
              <span>HalolMehnat</span>
              <span className="text-amber-500 text-lg sm:text-xl font-black">.uz</span>
            </span>
          </button>

          {/* User-selected Vercel URL button */}
          <button
            onClick={onOpenShare}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors shadow-2xs group"
            title="halolmehnat.vercel.app — Siz tanlagan manzil va ulashish oynasi"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="font-mono text-xs text-purple-700 font-extrabold group-hover:text-purple-900">halolmehnat.vercel.app</span>
            <span className="text-[10px] bg-purple-200/80 text-purple-950 px-1.5 py-0.2 rounded-md font-bold">⭐</span>
          </button>
        </div>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-semibold text-stone-600">
          <button 
            onClick={() => onSelectView('jobs')}
            className={`transition-colors hover:text-stone-900 whitespace-nowrap ${
              activeView === 'jobs' ? 'text-amber-600 font-bold' : ''
            }`}
          >
            Buyurtmalar
          </button>

          <button 
            onClick={() => onSelectView('workers')}
            className={`transition-colors hover:text-stone-900 whitespace-nowrap ${
              activeView === 'workers' ? 'text-amber-600 font-bold' : ''
            }`}
          >
            Usta & Mardikorlar
          </button>

          <button 
            onClick={() => onSelectView('cleaning')}
            className={`transition-colors hover:text-stone-900 whitespace-nowrap flex items-center gap-1 ${
              activeView === 'cleaning' ? 'text-rose-600 font-bold' : 'text-stone-600'
            }`}
          >
            <span>Ayollar & Tozalik 🌸</span>
          </button>

          <button 
            onClick={onOpenTradesDirectory}
            className="transition-colors hover:text-stone-900 whitespace-nowrap text-amber-700 font-bold flex items-center gap-1"
          >
            <span>Ustachilik Narxlari</span>
          </button>

          <button 
            onClick={() => onSelectView('students')}
            className={`transition-colors hover:text-stone-900 whitespace-nowrap ${
              activeView === 'students' ? 'text-blue-600 font-bold' : ''
            }`}
          >
            Talabalar Ligasi
          </button>

          <button 
            onClick={() => onSelectView('completed')}
            className={`flex items-center gap-1.5 transition-colors hover:text-stone-900 whitespace-nowrap ${
              activeView === 'completed' ? 'text-emerald-700 font-bold' : 'text-stone-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bajarilgan ishlar</span>
            {completedJobsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                {completedJobsCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => onSelectView('radar')}
            className={`flex items-center gap-1.5 transition-colors hover:text-stone-900 whitespace-nowrap ${
              activeView === 'radar' ? 'text-emerald-600 font-bold' : ''
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Jonli Radar</span>
          </button>

          <button 
            onClick={onOpenHowItWorks}
            className="transition-colors hover:text-amber-700 whitespace-nowrap text-stone-500 hover:text-stone-900 flex items-center gap-1"
            title="Platforma qanday ishlashi haqida yo'riqnoma"
          >
            <span>Qanday ishlaydi?</span>
          </button>

          <button 
            onClick={onOpenFAQ}
            className="transition-colors hover:text-amber-700 whitespace-nowrap text-stone-500 hover:text-stone-900 flex items-center gap-1 font-medium"
            title="Ko'p beriladigan savollar va javoblar (FAQ)"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>FAQ (Savol-Javob)</span>
          </button>

          <button 
            onClick={onOpenPerformanceMetrics}
            className="transition-colors hover:text-stone-900 whitespace-nowrap text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-xl border border-amber-300 shadow-2xs"
            title="Admin Performance Metrikalari (Komissiya o'sishi, nisbatlar, kunlik faollik)"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Metrikalar 📊</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Live GPS Radar Quick Button */}
          {activeTrackingCount > 0 && (
            <button
              onClick={onOpenLiveTracking || (() => onSelectView('radar'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-all shadow-xs"
              title="Real vaqtda GPS kuzatuv (Usta yo'lda)"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">GPS Kuzatuv</span>
              <span className="font-mono bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {activeTrackingCount}
              </span>
            </button>
          )}

          {/* Messenjer Button with Badge */}
          {onOpenMessenger && (
            <button
              onClick={onOpenMessenger}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-stone-900 text-xs font-bold transition-all shadow-2xs"
              title="Messenjer: foydalanuvchilar o'rtasida jonli muloqot va takliflar"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Messenjer</span>
              {unreadMessagesCount > 0 && (
                <span className="min-w-[18px] h-[18px] bg-amber-500 text-stone-950 font-mono text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-pulse">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </button>
          )}

          {/* Notification Bell Button with Badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors flex items-center justify-center"
            title="Bildirishnomalar tarixi"
            aria-label="Bildirishnomalar"
          >
            <Bell className="w-4 h-4 text-stone-700" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-amber-500 text-stone-950 font-mono text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Share Platform & .UZ Domain Info Button */}
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-stone-900 text-xs font-bold border border-amber-300 transition-colors shadow-2xs"
            title="HalolMehnat.uz manzili va boshqalar qanday topishi haqida"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-900" />
            <span className="hidden sm:inline">Ulashish & .UZ</span>
          </button>

          {/* Platform 20,000 UZS Commission Quick Button */}
          <button
            onClick={onOpenCommissionDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold transition-colors"
            title="Platforma komissiyalari va karta hisobi"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Kassa:</span>
            <span className="font-mono tabular-nums font-bold text-amber-800">20 000 so'm</span>
          </button>

          {/* My Profile Button with Average Rating */}
          {onOpenMyProfile && (
            <button
              onClick={onOpenMyProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-900 text-xs font-bold transition-all shadow-2xs"
              title="Mening profilim, o'rtacha reytingim va barcha sharhlar"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="hidden sm:inline">Profilim</span>
              <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded-full">
                {currentRole === 'employer' ? '4.96★' : '4.95★'}
              </span>
            </button>
          )}

          {/* Worker Profile Editor Quick Button */}
          {currentRole === 'worker' && onOpenProfileEditor && (
            <button
              onClick={onOpenProfileEditor}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all border border-stone-200"
              title="Shaxsiy ma'lumotlar, ko'nikmalar va soatlik narxlarni tahrirlash"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Tahrirlash</span>
            </button>
          )}

          {/* Role Switcher */}
          <button
            onClick={onToggleRole}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
            title="Rejimni almashtirish"
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentRole === 'employer' ? 'Rejim: Ish beruvchi' : 'Rejim: Ishchi / Usta'}</span>
          </button>

          {/* Primary CTA: Buyurtma berish */}
          <button
            onClick={onOpenCreateJob}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buyurtma berish</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 text-sm font-semibold">
          <button
            onClick={() => { onSelectView('jobs'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 flex items-center justify-between"
          >
            <span>Buyurtmalar</span>
            <span className="text-xs text-stone-400 font-mono">{activeJobsCount} ta</span>
          </button>
          
          <button
            onClick={() => { onSelectView('workers'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50"
          >
            Usta & Mardikorlar katalogi
          </button>

          <button
            onClick={() => { onSelectView('cleaning'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-rose-700 font-bold flex items-center justify-between"
          >
            <span>Ayollar & Tozalik (Sarishta Bekalar)</span>
            <span>🌸</span>
          </button>

          <button
            onClick={() => { onSelectView('students'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-blue-700 font-bold"
          >
            Talabalar ligasi (Halol ish)
          </button>

          <button
            onClick={() => { onSelectView('radar'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-emerald-700 font-bold flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Jonli Radar & GPS Kuzatuv</span>
          </button>

          <button
            onClick={() => { onSelectView('completed'); setMobileMenuOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 font-bold flex items-center justify-between ${
              activeView === 'completed' ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bajarilgan ishlar tarixi</span>
            </span>
            {completedJobsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                {completedJobsCount} ta
              </span>
            )}
          </button>

          {onOpenMessenger && (
            <button
              onClick={() => { onOpenMessenger(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-amber-950 font-bold flex items-center justify-between bg-amber-50/70 border border-amber-300"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Messenjer (Chat & Muloqot)</span>
              </span>
              {unreadMessagesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950">
                  {unreadMessagesCount} ta yangi
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => { onOpenNotifications(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-stone-800 font-bold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Bildirishnomalar tarixi</span>
            </span>
            {unreadNotificationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950">
                {unreadNotificationsCount} ta yangi
              </span>
            )}
          </button>

          <button
            onClick={() => { onOpenShare?.(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-stone-900 font-bold flex items-center gap-2 bg-amber-50 border border-amber-200"
          >
            <Share2 className="w-4 h-4 text-amber-600" />
            <span>📤 Platformani ulashish (Telegram, QR)</span>
          </button>

          <button
            onClick={() => { onOpenHowItWorks(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-amber-700 font-bold flex items-center gap-2"
          >
            <span>💡 Qanday ishlaydi? (Yo'riqnoma)</span>
          </button>

          <button
            onClick={() => { onOpenFAQ(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-stone-800 font-bold flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>❓ FAQ — Ko'p beriladigan savollar</span>
          </button>

          <button
            onClick={() => { onOpenPerformanceMetrics(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-amber-900 font-bold flex items-center gap-2 bg-amber-50 border border-amber-200"
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>📊 Performance Metrikalar (Admin Analytics)</span>
          </button>

          {onOpenMyProfile && (
            <button
              onClick={() => { onOpenMyProfile(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 text-amber-950 font-bold flex items-center justify-between bg-amber-50/80 border border-amber-300"
            >
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Mening Profilim & Baholarim</span>
              </span>
              <span className="text-xs bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full font-black">
                {currentRole === 'employer' ? '4.96★' : '4.95★'}
              </span>
            </button>
          )}

          {currentRole === 'worker' && onOpenProfileEditor && (
            <button
              onClick={() => { onOpenProfileEditor(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-stone-100 text-stone-900 font-bold flex items-center gap-2 bg-stone-100 border border-stone-200"
            >
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span>✏️ Usta profilini tahrirlash (Ko'nikmalar, Narxlar)</span>
            </button>
          )}

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">Sizning rejimingiz:</span>
            <button
              onClick={onToggleRole}
              className="text-xs font-bold text-stone-800 bg-stone-100 px-3 py-1 rounded-lg"
            >
              {currentRole === 'employer' ? 'Ish beruvchi 🏠' : 'Ishchi / Usta 🔨'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
