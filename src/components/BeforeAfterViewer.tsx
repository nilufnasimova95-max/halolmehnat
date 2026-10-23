import React, { useState, useRef } from 'react';
import { Sparkles, History, Maximize2, Columns, SlidersHorizontal } from 'lucide-react';

interface BeforeAfterViewerProps {
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  jobTitle?: string;
  workerName?: string;
  className?: string;
  compact?: boolean;
  onOpenLightbox?: () => void;
}

export function BeforeAfterViewer({
  beforePhotoUrl,
  afterPhotoUrl,
  jobTitle,
  workerName,
  className = '',
  compact = false,
  onOpenLightbox
}: BeforeAfterViewerProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Controls Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-stone-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Ish natijasi: Oldin & Keyin</span>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('slider');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'slider' 
                ? 'bg-white text-stone-900 shadow-2xs font-bold' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Slayder bilan taqqoslash"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Slayder</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('side-by-side');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'side-by-side' 
                ? 'bg-white text-stone-900 shadow-2xs font-bold' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Yonma-yon ko'rish"
          >
            <Columns className="w-3 h-3" />
            <span>Yonma-yon</span>
          </button>

          {onOpenLightbox && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLightbox();
              }}
              className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
              title="Kattalashtirish"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Image View Area */}
      {viewMode === 'slider' ? (
        <div 
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className={`relative select-none overflow-hidden rounded-xl border border-stone-200 cursor-ew-resize bg-stone-950 ${
            compact ? 'h-52 sm:h-56' : 'h-64 sm:h-80'
          }`}
        >
          {/* Base: After (Keyin) Photo */}
          <img 
            src={afterPhotoUrl} 
            alt="Ishdan keyin - Natija" 
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay: Before (Oldin) Photo clipped to slider percentage */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img 
              src={beforePhotoUrl} 
              alt="Ishdan oldin" 
              className="absolute inset-0 max-w-none h-full object-cover"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%'
              }}
            />
          </div>

          {/* Slider Divider Line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-stone-900/90 text-white border-2 border-white flex items-center justify-center shadow-xl text-[10px] font-bold">
              ‹ ›
            </div>
          </div>

          {/* Badges on Photos */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="px-2 py-1 bg-stone-900/80 backdrop-blur-xs text-stone-200 border border-stone-700 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
              <History className="w-3 h-3 text-stone-400" />
              Oldin
            </span>
          </div>

          <div className="absolute top-2 right-2 pointer-events-none">
            <span className="px-2 py-1 bg-emerald-600/90 backdrop-blur-xs text-white border border-emerald-400 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
              <Sparkles className="w-3 h-3 text-emerald-200" />
              Keyin (Natija)
            </span>
          </div>

          {/* Instructions banner at bottom */}
          <div className="absolute bottom-2 inset-x-2 pointer-events-none flex justify-center">
            <span className="px-2.5 py-0.5 bg-stone-900/75 backdrop-blur-xs text-stone-300 text-[10px] rounded-full font-medium shadow-sm border border-stone-700/50">
              Surish orqali taqqoslang ({Math.round(sliderPosition)}%)
            </span>
          </div>
        </div>
      ) : (
        /* Side-by-Side View */
        <div className="grid grid-cols-2 gap-2">
          {/* Before Photo */}
          <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-950 group">
            <div className={`w-full ${compact ? 'h-40' : 'h-52 sm:h-64'}`}>
              <img 
                src={beforePhotoUrl} 
                alt="Ishdan oldingi holat" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-stone-900/85 text-stone-200 border border-stone-700 rounded text-[10px] font-bold flex items-center gap-1">
                <History className="w-3 h-3 text-stone-400" />
                Oldin
              </span>
            </div>
            <div className="p-2 bg-stone-900/90 text-stone-300 text-[10px] truncate">
              Ish boshlanishidan oldin
            </div>
          </div>

          {/* After Photo */}
          <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-stone-950 group">
            <div className={`w-full ${compact ? 'h-40' : 'h-52 sm:h-64'}`}>
              <img 
                src={afterPhotoUrl} 
                alt="Ishdan keyingi holat - Natija" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 bg-emerald-600 text-white border border-emerald-400 rounded text-[10px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-200" />
                Keyin (Natija)
              </span>
            </div>
            <div className="p-2 bg-emerald-950 text-emerald-200 text-[10px] truncate font-medium border-t border-emerald-800">
              {workerName ? `${workerName} bajargan ish` : "Bajarilgan sifatli ish"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
