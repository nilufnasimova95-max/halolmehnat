import React, { useState } from 'react';
import { 
  X, Bell, CheckCircle2, Trash2, Volume2, VolumeX,
  Navigation, MapPin, CreditCard, Star, Flame, 
  ArrowRight, Sparkles, Filter, CheckCheck, Clock, MessageSquare
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  onNotificationAction: (notif: AppNotification) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerSimulatedNotification: (type: 'order' | 'proposal' | 'proposal_accepted' | 'status_change' | 'message' | 'en_route' | 'cash') => void;
}

export function NotificationHistoryModal({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onClearAll,
  onDeleteNotification,
  onNotificationAction,
  isSoundEnabled,
  onToggleSound,
  onTriggerSimulatedNotification
}: NotificationHistoryModalProps) {
  const [filterType, setFilterType] = useState<'all' | 'orders' | 'proposals' | 'status' | 'messages' | 'cash'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'orders') {
      return notif.type === 'new_order' || notif.type === 'job_completed';
    }
    if (filterType === 'proposals') {
      return notif.type === 'new_proposal' || notif.type === 'proposal_accepted';
    }
    if (filterType === 'status') {
      return notif.type === 'status_change' || notif.type === 'job_started' || notif.type === 'worker_en_route' || notif.type === 'worker_arrived';
    }
    if (filterType === 'messages') {
      return notif.type === 'message';
    }
    if (filterType === 'cash') {
      return notif.type === 'payment_commission' || notif.type === 'review_added';
    }
    return true;
  });

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'new_proposal':
        return <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />;
      case 'proposal_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'status_change':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'worker_en_route':
        return <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />;
      case 'worker_arrived':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'payment_commission':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'review_added':
        return <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />;
      case 'job_completed':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'new_order':
      default:
        return <Flame className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-stone-950 text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Bildirishnomalar tarixi
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {unreadCount} ta o'qilmagan
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                Buyurtmalar, usta harakatlari va kassa xabarlari
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio chime toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg transition-colors ${
                isSoundEnabled 
                  ? 'bg-stone-800 text-amber-400 hover:bg-stone-700' 
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
              title={isSoundEnabled ? "Ovoz yoqilgan (chime)" : "Ovoz o'chirilgan"}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Bulk Actions */}
        <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-lg overflow-x-auto max-w-full">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterType === 'all' 
                  ? 'bg-white text-stone-900 shadow-sm font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Barchasi ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('orders')}
              className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterType === 'orders' 
                  ? 'bg-white text-stone-900 shadow-sm font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Buyurtmalar
            </button>
            <button
              onClick={() => setFilterType('proposals')}
              className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterType === 'proposals' 
                  ? 'bg-white text-amber-900 shadow-sm font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Takliflar (Bids)
            </button>
            <button
              onClick={() => setFilterType('status')}
              className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterType === 'status' 
                  ? 'bg-white text-stone-900 shadow-sm font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Holat o'zgarishi
            </button>
            <button
              onClick={() => setFilterType('messages')}
              className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterType === 'messages' 
                  ? 'bg-white text-stone-900 shadow-sm font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Messenjer
            </button>
            <button
              onClick={() => setFilterType('cash')}
              className={`px-2 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterType === 'cash' 
                  ? 'bg-white text-stone-900 shadow-sm font-bold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Kassa
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-stone-600 hover:text-amber-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>O'qilgan qilish</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-stone-500 hover:text-rose-600 font-medium flex items-center gap-1 hover:underline ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tozalash</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-stone-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800">
                Bildirishnomalar mavjud emas
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Hozircha hech qanday bildirishnoma kelmadi. Quyidagi sinov tugmalari orqali tizimni tekshirib ko'rishingiz mumkin.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) onMarkAsRead(notif.id);
                  onNotificationAction(notif);
                }}
                className={`pt-2.5 first:pt-0 group relative p-3 rounded-xl transition-colors cursor-pointer border ${
                  !notif.read 
                    ? 'bg-amber-50/50 hover:bg-amber-50/80 border-amber-200/70 shadow-xs' 
                    : 'bg-white hover:bg-stone-50 border-stone-200/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Indicator & Icon */}
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
                      {getNotificationIcon(notif.type)}
                    </div>
                    {!notif.read && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white ring-1 ring-amber-300" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {notif.badgeText && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                            {notif.badgeText}
                          </span>
                        )}
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${
                          !notif.read ? 'text-stone-900' : 'text-stone-700'
                        }`}>
                          {notif.title}
                        </h4>
                      </div>
                      <span className="text-[11px] text-stone-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Metadata details */}
                    {notif.extraDetails && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                        {notif.extraDetails.location && (
                          <span className="text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {notif.extraDetails.location}
                          </span>
                        )}
                        {notif.extraDetails.etaMinutes && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Navigation className="w-3 h-3" />
                            ETA: {notif.extraDetails.etaMinutes} daq
                          </span>
                        )}
                        {notif.extraDetails.budgetUzs && (
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            {notif.extraDetails.budgetUzs.toLocaleString()} so'm
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action link */}
                    {notif.actionText && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:text-amber-900 transition-colors">
                          <span>{notif.actionText}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Simulation Testing Bar (interactive playground for immediate evaluation) */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Real vaqt sinovi (Sinov xabari yuborish):</span>
            </span>
            <span className="text-[10px] text-stone-400">
              Bosganda jonli Toast chiqadi
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => onTriggerSimulatedNotification('order')}
              className="px-2 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate">Yangi buyurtma</span>
            </button>

            <button
              onClick={() => onTriggerSimulatedNotification('proposal')}
              className="px-2 py-1.5 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate">Yangi taklif (Bid)</span>
            </button>

            <button
              onClick={() => onTriggerSimulatedNotification('status_change')}
              className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-blue-300 text-blue-900 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate">Holat o'zgarishi</span>
            </button>

            <button
              onClick={() => onTriggerSimulatedNotification('message')}
              className="px-2 py-1.5 bg-white hover:bg-amber-50 border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate">Messenjer xabari</span>
            </button>

            <button
              onClick={() => onTriggerSimulatedNotification('en_route')}
              className="px-2 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate">Usta yo'lda</span>
            </button>

            <button
              onClick={() => onTriggerSimulatedNotification('cash')}
              className="px-2 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate">20 000 so'm kassa</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
