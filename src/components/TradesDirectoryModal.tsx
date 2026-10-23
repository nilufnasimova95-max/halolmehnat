import { useState } from 'react';
import { 
  X, Calculator, Hammer, Layers, Paintbrush, 
  Home, Wrench, Zap, Flame, Box, Maximize2, 
  Shield, Sliders, Sun, Grid, Cpu, GraduationCap, 
  Truck, ArrowRight, Check, Search, TrendingUp
} from 'lucide-react';
import { CraftPriceRate, JobCategory } from '../types';
import { CRAFT_PRICE_RATES } from '../data/initialData';

interface TradesDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTradeForJob: (category: JobCategory, calculatedBudget: number) => void;
}

export function TradesDirectoryModal({
  isOpen,
  onClose,
  onSelectTradeForJob
}: TradesDirectoryModalProps) {
  const [selectedRate, setSelectedRate] = useState<CraftPriceRate>(CRAFT_PRICE_RATES[0]);
  const [volume, setVolume] = useState<number>(100);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const totalCalculated = volume * selectedRate.averagePrice;
  const minCalculated = volume * selectedRate.minPrice;
  const maxCalculated = volume * selectedRate.maxPrice;

  const filteredRates = CRAFT_PRICE_RATES.filter(r => 
    r.tradeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 text-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                Barcha Ustachilik Sohalari & Narxlar Reestri
              </h2>
            </div>
            <p className="text-xs text-stone-300">
              O'zbekiston bo'yicha barcha ustachilik kasblari, o'rtacha bozor narxlari va tezkor kalkulyator
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

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Trades List */}
          <div className="lg:col-span-7 border-r border-stone-200 p-4 overflow-y-auto space-y-3">
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Kasb yoki ish turini qidirish (kafel, svarka, tom...)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-2">
              {filteredRates.map((rate) => {
                const isSelected = selectedRate.id === rate.id;
                return (
                  <div
                    key={rate.id}
                    onClick={() => {
                      setSelectedRate(rate);
                      // sensible default volume depending on unit
                      if (rate.unit === 'dona' && rate.category === 'devor_terish') setVolume(1500);
                      else if (rate.unit === 'dona') setVolume(1);
                      else if (rate.unit === 'nuqta') setVolume(8);
                      else if (rate.unit === 'kunlik') setVolume(2);
                      else setVolume(60);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-400'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                        {rate.tradeName}
                      </h4>
                      <span className="font-mono text-xs font-bold text-amber-700 tabular-nums">
                        {rate.averagePrice.toLocaleString()} so'm <span className="text-[10px] font-normal text-stone-500">/{rate.unit}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 mt-1 line-clamp-1">
                      {rate.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1.5 pt-1 border-t border-stone-100">
                      <span>Diapazon: {rate.minPrice.toLocaleString()} – {rate.maxPrice.toLocaleString()} so'm</span>
                      {isSelected && <span className="font-bold text-amber-600">Tanlangan ✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Live Work Volume & Cost Calculator */}
          <div className="lg:col-span-5 p-5 bg-stone-50/70 overflow-y-auto space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>Usta Ish Haqini Hisoblash</span>
              </div>

              {/* Selected Trade Highlight */}
              <div className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                <div className="text-[11px] text-stone-400">Tanlangan soha:</div>
                <div className="font-bold text-stone-900 text-sm">
                  {selectedRate.tradeName}
                </div>
                <div className="text-xs text-stone-600">
                  {selectedRate.description}
                </div>
              </div>

              {/* Input volume */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Ish hajmini kiriting ({selectedRate.unit} hisobida):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={volume}
                    onChange={(e) => setVolume(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-stone-500 uppercase">
                    {selectedRate.unit}
                  </span>
                </div>
              </div>

              {/* Calculation Summary Card */}
              <div className="p-4 bg-stone-900 text-white rounded-xl space-y-2.5 shadow-md">
                <div className="text-xs text-stone-300">
                  Taxminiy umumiy usta xarajati:
                </div>
                <div className="text-2xl font-black font-mono tabular-nums text-amber-400">
                  {totalCalculated.toLocaleString()} so'm
                </div>
                <div className="text-[11px] text-stone-400 border-t border-stone-800 pt-2 flex justify-between">
                  <span>Min: {minCalculated.toLocaleString()}</span>
                  <span>Max: {maxCalculated.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action to create job using this calculation */}
            <div className="pt-4 space-y-2">
              <button
                onClick={() => {
                  onSelectTradeForJob(selectedRate.category, totalCalculated);
                  onClose();
                }}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm shadow transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Shu hisob bilan buyurtma berish</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-stone-500 text-center">
                Platforma orqali kelishuv tasdiqlanganda 20 000 so'm xizmat komissiyasi hisoblanadi.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
