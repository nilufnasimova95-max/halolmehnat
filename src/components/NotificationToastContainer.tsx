import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Bell, Navigation, CheckCircle2, 
  CreditCard, Star, HardHat, Sparkles, 
  MapPin, Clock, ArrowRight, UserCheck, Flame, MessageSquare
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastContainerProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onNotificationClick: (notif: AppNotification) => void;
}

export function NotificationToastContainer({
  notifications,
  onDismiss,
  onNotificationClick
}: NotificationToastContainerProps) {
  // Only display the 3 most recent active toasts to avoid clutter
  const activeToasts = notifications.slice(0, 3);

  if (activeToasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-2rem)] pointer-events-none"
      aria-live="polite"
    >
      {activeToasts.map((notif) => (
        <ToastItem
          key={notif.id}
          notif={notif}
          onDismiss={() => onDismiss(notif.id)}
          onClick={() => onNotificationClick(notif)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  notif,
  onDismiss,
  onClick
}: {
  notif: AppNotification;
  onDismiss: () => void;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const dismissedRef = useRef(false);

  const durationMs = 6000;

  // Auto-dismiss countdown timer that pauses on hover
  useEffect(() => {
    if (isHovered) return;

    const interval = 50;
    const step = (interval / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isHovered, durationMs]);

  // Safely trigger onDismiss in an effect when progress reaches 0, avoiding setState in render
  useEffect(() => {
    if (progress <= 0 && !dismissedRef.current) {
      dismissedRef.current = true;
      onDismiss();
    }
  }, [progress, onDismiss]);

  const handleDismiss = () => {
    if (!dismissedRef.current) {
      dismissedRef.current = true;
      onDismiss();
    }
  };

  const getStyleConfig = () => {
    switch (notif.type) {
      case 'worker_en_route':
        return {
          icon: <Navigation className="w-5 h-5 text-emerald-600 animate-pulse" />,
          accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          borderColor: 'border-emerald-300',
          barColor: 'bg-emerald-500',
          defaultBadge: "Usta Yo'lga Chiqdi"
        };
      case 'worker_arrived':
        return {
          icon: <MapPin className="w-5 h-5 text-blue-600" />,
          accentBg: 'bg-blue-50 text-blue-700 border-blue-200',
          borderColor: 'border-blue-300',
          barColor: 'bg-blue-500',
          defaultBadge: "Manzilga Yetib Keldi"
        };
      case 'payment_commission':
        return {
          icon: <CreditCard className="w-5 h-5 text-amber-600" />,
          accentBg: 'bg-amber-50 text-amber-800 border-amber-200',
          borderColor: 'border-amber-300',
          barColor: 'bg-amber-500',
          defaultBadge: "+20 000 UZS Kassa"
        };
      case 'review_added':
        return {
          icon: <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />,
          accentBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          borderColor: 'border-yellow-300',
          barColor: 'bg-yellow-500',
          defaultBadge: "Yangi Baho & Sharh"
        };
      case 'job_completed':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
          accentBg: 'bg-teal-50 text-teal-800 border-teal-200',
          borderColor: 'border-teal-300',
          barColor: 'bg-teal-500',
          defaultBadge: "Ish Bajarildi"
        };
      case 'worker_registered':
        return {
          icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
          accentBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          borderColor: 'border-indigo-300',
          barColor: 'bg-indigo-500',
          defaultBadge: "Yangi Usta Qo'shildi"
        };
      case 'message':
        return {
          icon: <MessageSquare className="w-5 h-5 text-amber-600" />,
          accentBg: 'bg-amber-50 text-amber-900 border-amber-200',
          borderColor: 'border-amber-300',
          barColor: 'bg-amber-500',
          defaultBadge: "Yangi Xabar"
        };
      case 'new_order':
      default:
        return {
          icon: <Flame className="w-5 h-5 text-amber-600" />,
          accentBg: 'bg-amber-50 text-amber-900 border-amber-200',
          borderColor: 'border-amber-300',
          barColor: 'bg-amber-500',
          defaultBadge: "Yangi Buyurtma"
        };
    }
  };

  const style = getStyleConfig();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative w-full bg-white rounded-xl shadow-2xl border ${style.borderColor} overflow-hidden transition-all duration-200 hover:shadow-2xl`}
      role="alert"
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Icon Avatar */}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${style.accentBg}`}>
            {style.icon}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${style.accentBg}`}>
                {notif.badgeText || style.defaultBadge}
              </span>
              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {notif.timestamp}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
              {notif.title}
            </h4>

            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              {notif.message}
            </p>

            {/* Extra Metadata tags if available */}
            {notif.extraDetails && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
                {notif.extraDetails.location && (
                  <span className="inline-flex items-center gap-1 font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                    <MapPin className="w-3 h-3 text-stone-500" />
                    {notif.extraDetails.location}
                  </span>
                )}
                {notif.extraDetails.etaMinutes && (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Navigation className="w-3 h-3" />
                    ETA: {notif.extraDetails.etaMinutes} daqiqa
                  </span>
                )}
                {notif.extraDetails.budgetUzs && (
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {notif.extraDetails.budgetUzs.toLocaleString()} so'm
                  </span>
                )}
              </div>
            )}

            {/* Quick Action Button */}
            {notif.actionText && (
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline transition-colors"
                >
                  <span>{notif.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-stone-400">
                  {isHovered ? 'To\'xtatildi' : 'O\'chishga yaqin'}
                </span>
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-2.5 right-2.5 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Yopish"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="h-1 w-full bg-stone-100">
        <div
          className={`h-full ${style.barColor} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
