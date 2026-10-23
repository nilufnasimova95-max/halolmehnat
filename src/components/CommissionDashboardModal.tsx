import { useState } from 'react';
import { 
  CreditCard, CheckCircle2, TrendingUp, DollarSign, 
  Download, Edit2, ShieldCheck, X, Sparkles, Building2, UserCheck,
  BarChart3, PieChart, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { CommissionTransaction } from '../types';

interface CommissionDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: CommissionTransaction[];
  cardNumber: string;
  cardHolder: string;
  onUpdateCard: (cardNumber: string, cardHolder: string) => void;
  onOpenPerformanceMetrics?: () => void;
}

export function CommissionDashboardModal({
  isOpen,
  onClose,
  transactions,
  cardNumber,
  cardHolder,
  onUpdateCard,
  onOpenPerformanceMetrics
}: CommissionDashboardModalProps) {
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState(cardNumber);
  const [newCardHolder, setNewCardHolder] = useState(cardHolder);
  const [activeTab, setActiveTab] = useState<'kassa' | 'diagramma' | 'sozlamalar'>('diagramma');

  if (!isOpen) return null;

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amountUzs, 0);
  const todayTransactions = transactions.filter(t => t.timestamp.includes('Bugun'));
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.amountUzs, 0);

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCard(newCardNumber, newCardHolder);
    setIsEditingCard(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                Platforma Kassasi & 20 000 UZS Komissiyalar
              </h2>
              <p className="text-xs text-stone-300">
                Har bir muvaffaqiyatli kelishuvdan avtomatik hisobingizga tushadigan komissiyalar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPerformanceMetrics && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPerformanceMetrics();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <BarChart3 className="w-3.5 h-3.5 text-stone-950" />
                <span>Batafsil Metrikalar 📊</span>
              </button>
            )}

            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-stone-200 bg-stone-50 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('diagramma')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'diagramma' 
                ? 'border-amber-600 text-amber-950 font-extrabold' 
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>📊 Diagramma & Statistik Grafik</span>
          </button>

          <button
            onClick={() => setActiveTab('kassa')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'kassa' 
                ? 'border-amber-600 text-amber-900 font-bold' 
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Tushumlar & Tranzaksiyalar
          </button>

          <button
            onClick={() => setActiveTab('sozlamalar')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sozlamalar' 
                ? 'border-amber-600 text-amber-900 font-bold' 
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Mening Karta Rekvizitlarim (20 000 so'm uchun)
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {activeTab === 'kassa' && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <div className="text-xs font-medium text-amber-800">Bugungi tushum</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 mt-1">
                    {todayRevenue.toLocaleString()} so'm
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                    <span className="font-semibold text-emerald-700">{todayTransactions.length} ta</span> kelishuv tasdiqlandi
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <div className="text-xs font-medium text-emerald-800">Jami komissiya daromadi</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 mt-1">
                    {(totalRevenue + 4800000).toLocaleString()} so'm
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Karta hisobingizga avtomat o'tkazilgan
                  </div>
                </div>

                <div className="p-4 bg-stone-100 border border-stone-200 rounded-xl">
                  <div className="text-xs font-medium text-stone-700">Bir kelishuv narxi</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
                    20 000 so'm
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    100% kafolatlangan kelishuv uchun
                  </div>
                </div>
              </div>

              {/* Active Payout Card Banner */}
              <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-xl shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded bg-amber-500/30 border border-amber-400/40 flex items-center justify-center font-bold font-mono text-xs text-amber-300">
                    UZCARD
                  </div>
                  <div>
                    <div className="text-xs text-stone-300">Har bir 20,000 so'm o'tadigan faol karta:</div>
                    <div className="font-mono text-sm sm:text-base font-bold text-amber-400 tracking-wider">
                      {cardNumber}
                    </div>
                    <div className="text-xs text-stone-300">{cardHolder}</div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('sozlamalar')}
                  className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Kartani o'zgartirish</span>
                </button>
              </div>

              {/* Transactions List */}
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-2.5">
                  Oxirgi kelishuvlar va komissiya to'lovlari
                </h3>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200">
                        <tr>
                          <th className="py-2.5 px-3">Chek ID</th>
                          <th className="py-2.5 px-3">Buyurtma nomi</th>
                          <th className="py-2.5 px-3">Tomonlar</th>
                          <th className="py-2.5 px-3">To'lov turi</th>
                          <th className="py-2.5 px-3 text-right">Summa</th>
                          <th className="py-2.5 px-3 text-right">Holat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-800">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-3 font-mono font-medium text-stone-600">
                              {tx.id}
                              <div className="text-[10px] text-stone-400 font-sans">{tx.timestamp}</div>
                            </td>
                            <td className="py-3 px-3 font-medium max-w-xs truncate">
                              {tx.orderTitle}
                            </td>
                            <td className="py-3 px-3 text-stone-600">
                              <div><span className="text-stone-400">Ish beruvchi:</span> {tx.employerName}</div>
                              <div><span className="text-stone-400">Usta:</span> {tx.workerName}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                                {tx.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-emerald-700">
                              +{tx.amountUzs.toLocaleString()} so'm
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Tushdi
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: DIAGRAMMA & STATISTIK GRAFIK */}
          {activeTab === 'diagramma' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Diagramma nima va qanday ishlaydi tushuntirish banneri */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-2xl border border-amber-300 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-black text-sm sm:text-base text-stone-900">
                    «Diagramma» nima va u qanday ishlaydi?
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 space-y-1">
                    <span className="font-bold text-amber-950 block">1. Diagramma nima?</span>
                    <p className="text-stone-600 leading-relaxed">
                      Bu quruq jadvallar o'rniga pul tushumlari va buyurtmalarni <b>chiroyli rangli ustunlar va grafiklar</b> orqali ko'rsatuvchi vizual vositadir.
                    </p>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 space-y-1">
                    <span className="font-bold text-amber-950 block">2. U qanday ishlaydi?</span>
                    <p className="text-stone-600 leading-relaxed">
                      Avtomatik! Har safar usta buyurtmani bajarib, 20 000 so'm komissiya to'langanda, grafik ustunlari o'zi ko'tarilib boradi.
                    </p>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 space-y-1">
                    <span className="font-bold text-amber-950 block">3. Sizga qanday foyda beradi?</span>
                    <p className="text-stone-600 leading-relaxed">
                      Qaysi kuni (masalan Shanba-Yakshanba) va qaysi soha eng ko'p pul keltirayotganini 1 soniyada ko'rib, biznesingizni to'g'ri rejalashtirasiz.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1-DIAGRAMMA: Haftalik tushumlar dinamikasi (Ustunli Diagramma / Bar Chart) */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                  <div>
                    <h4 className="font-display font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                      <span>Haftalik Komissiya Tushumlari Diagrammasi (20 000 UZS)</span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      Hafta kunlari bo'yicha tushgan jami kafolat to'lovlari ko'rsatkichi
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>O'sish: +34%</span>
                  </div>
                </div>

                {/* Ustunli grafik (Visual Bar Chart) */}
                <div className="pt-4 pb-2">
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 border-b border-stone-200 pb-2">
                    
                    {/* Dushanba */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-stone-600 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        140k
                      </span>
                      <div 
                        className="w-full max-w-[36px] bg-amber-400 rounded-t-lg transition-all duration-300 group-hover:bg-amber-500 group-hover:shadow-md cursor-pointer"
                        style={{ height: '35%' }}
                        title="Dushanba: 140 000 so'm (7 ta kelishuv)"
                      />
                      <span className="text-[11px] font-semibold text-stone-600">Dush</span>
                    </div>

                    {/* Seshanba */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-stone-600 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        180k
                      </span>
                      <div 
                        className="w-full max-w-[36px] bg-amber-400 rounded-t-lg transition-all duration-300 group-hover:bg-amber-500 group-hover:shadow-md cursor-pointer"
                        style={{ height: '45%' }}
                        title="Seshanba: 180 000 so'm (9 ta kelishuv)"
                      />
                      <span className="text-[11px] font-semibold text-stone-600">Sesh</span>
                    </div>

                    {/* Chorshanba */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-stone-600 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        160k
                      </span>
                      <div 
                        className="w-full max-w-[36px] bg-amber-400 rounded-t-lg transition-all duration-300 group-hover:bg-amber-500 group-hover:shadow-md cursor-pointer"
                        style={{ height: '40%' }}
                        title="Chorshanba: 160 000 so'm (8 ta kelishuv)"
                      />
                      <span className="text-[11px] font-semibold text-stone-600">Chor</span>
                    </div>

                    {/* Payshanba */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-stone-600 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        240k
                      </span>
                      <div 
                        className="w-full max-w-[36px] bg-amber-500 rounded-t-lg transition-all duration-300 group-hover:bg-amber-600 group-hover:shadow-md cursor-pointer"
                        style={{ height: '58%' }}
                        title="Payshanba: 240 000 so'm (12 ta kelishuv)"
                      />
                      <span className="text-[11px] font-semibold text-stone-600">Pay</span>
                    </div>

                    {/* Juma */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-stone-600 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        200k
                      </span>
                      <div 
                        className="w-full max-w-[36px] bg-amber-400 rounded-t-lg transition-all duration-300 group-hover:bg-amber-500 group-hover:shadow-md cursor-pointer"
                        style={{ height: '50%' }}
                        title="Juma: 200 000 so'm (10 ta kelishuv)"
                      />
                      <span className="text-[11px] font-semibold text-stone-600">Jum</span>
                    </div>

                    {/* Shanba */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        380k 🔥
                      </span>
                      <div 
                        className="w-full max-w-[36px] bg-emerald-500 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600 group-hover:shadow-md cursor-pointer"
                        style={{ height: '82%' }}
                        title="Shanba: 380 000 so'm (19 ta kelishuv - qizg'in kun)"
                      />
                      <span className="text-[11px] font-bold text-emerald-800">Shan</span>
                    </div>

                    {/* Yakshanba */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-black text-emerald-700 group-hover:scale-110 transition-all">
                        460k 🚀
                      </span>
                      <div 
                        className="w-full max-w-[36px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-300 group-hover:shadow-lg cursor-pointer"
                        style={{ height: '100%' }}
                        title="Yakshanba: 460 000 so'm (23 ta kelishuv - eng yuqori natija)"
                      />
                      <span className="text-[11px] font-bold text-emerald-900">Yak</span>
                    </div>

                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2">
                    <span>Haftalik jami: <b>1 760 000 so'm (88 ta usta buyurtmasi)</b></span>
                    <span className="text-emerald-700 font-semibold">Eng daromadli kunlar: Dam olish kunlari (Shanba / Yakshanba)</span>
                  </div>
                </div>
              </div>

              {/* 2-DIAGRAMMA: Sohalar bo'yicha daromad ulushi (Category Share Diagram) */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <h4 className="font-display font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-emerald-600" />
                      <span>Qaysi sohalar eng ko'p komissiya keltirmoqda?</span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      Sohalar ulushi foizlarda va tushum miqdorida
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  
                  {/* 1. G'isht & Devor terish */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span>G'isht & Devor terish</span>
                      </span>
                      <span className="font-mono text-stone-900">35% (1 680 000 so'm)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '35%' }}></div>
                    </div>
                  </div>

                  {/* 2. Kafel & Keramogranit */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span>Kafel & Keramogranit yotqizish</span>
                      </span>
                      <span className="font-mono text-stone-900">25% (1 200 000 so'm)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  {/* 3. Ayollar & Tozalik */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span>Ayollar: General Uborka & Oyna yuvish 🌸</span>
                      </span>
                      <span className="font-mono text-stone-900">20% (960 000 so'm)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: '20%' }}></div>
                    </div>
                  </div>

                  {/* 4. Santexnik & Elektr */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>Santexnika & Elektr montaj</span>
                      </span>
                      <span className="font-mono text-stone-900">12% (576 000 so'm)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '12%' }}></div>
                    </div>
                  </div>

                  {/* 5. Talabalar ligasi */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        <span>Talabalar ligasi (Yuk tashish va yordamchilar)</span>
                      </span>
                      <span className="font-mono text-stone-900">8% (384 000 so'm)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: '8%' }}></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3-Xulosa & Tezkor Tugma */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-amber-400 block text-sm">
                    💡 Xulosa va Tavsiya
                  </span>
                  <span className="text-stone-300">
                    Samarqandda Shanba va Yakshanba kunlari g'isht teruvchilar va tozalik xizmatiga talab 2 barobar yuqori.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('kassa')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shrink-0"
                >
                  Kassa ro'yxatiga qaytish
                </button>
              </div>

            </div>
          )}

          {activeTab === 'sozlamalar' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed">
                <p className="font-semibold text-stone-900 mb-1">
                  Karta rekvizitlarini sozlash qoidasi:
                </p>
                Platformada ish beruvchi bilan ishchi kelishuvga erishganida, avtomatik ravishda 20 000 so'm xizmat haqi siz kiritgan karta hisobiga (Payme / Click orqali) yo'naltiriladi.
              </div>

              <form onSubmit={handleSaveCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Uzcard / Humo karta raqami (16 ta raqam)
                  </label>
                  <input 
                    type="text" 
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    placeholder="8600 0000 0000 0000"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Karta egasining to'liq ismi-sharifi
                  </label>
                  <input 
                    type="text" 
                    value={newCardHolder}
                    onChange={(e) => setNewCardHolder(e.target.value)}
                    placeholder="Nilufar N."
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('kassa')}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Rekvizitlarni saqlash
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kafolatlangan xavfsiz to'lov shlyuzi (Click / Payme)</span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
}
