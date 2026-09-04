import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingNotification } from '../types';
import {
  CheckCircle2,
  Car,
  UserCheck,
  Phone,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bell,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react';

interface BookingToastProps {
  notifications: BookingNotification[];
  onDismiss: (id: string) => void;
  onFocusBooking?: (bookingId: string) => void;
  soundEnabled?: boolean;
}

// Gentle synthetic audio chime using Web Audio API (zero external asset dependency)
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Tone 2 (Harmonic major third)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.09, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.38);
  } catch {
    // Browsers with strict autoplay policies may require first click
  }
}

export const BookingToastContainer: React.FC<BookingToastProps> = ({
  notifications,
  onDismiss,
  onFocusBooking,
}) => {
  return (
    <div
      id="booking-toast-overlay"
      className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {notifications.map((notif) => (
          <SingleToastItem
            key={notif.id}
            notification={notif}
            onDismiss={() => onDismiss(notif.id)}
            onFocusBooking={onFocusBooking}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface SingleToastItemProps {
  notification: BookingNotification;
  onDismiss: () => void;
  onFocusBooking?: (bookingId: string) => void;
}

const SingleToastItem: React.FC<SingleToastItemProps> = ({
  notification,
  onDismiss,
  onFocusBooking,
}) => {
  const [progress, setProgress] = useState(100);
  const durationMs = notification.type === 'DRIVER_ASSIGNED' ? 8000 : 7000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [durationMs, onDismiss]);

  const isDriverAssigned = notification.type === 'DRIVER_ASSIGNED';
  const isBookingConfirmed = notification.type === 'BOOKING_CONFIRMED';
  const isTripStarted = notification.type === 'TRIP_STARTED';
  const isTripCompleted = notification.type === 'TRIP_COMPLETED';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      id={`toast-item-${notification.id}`}
      className="pointer-events-auto relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl border border-slate-800 p-4"
    >
      {/* Auto-dismiss progress line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
        <div
          className={`h-full transition-all duration-75 ${
            isBookingConfirmed
              ? 'bg-emerald-500'
              : isDriverAssigned
              ? 'bg-amber-500'
              : isTripCompleted
              ? 'bg-purple-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3 pt-1">
        {/* Type Icon Badge */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isBookingConfirmed
              ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60'
              : isDriverAssigned
              ? 'bg-amber-950 text-amber-400 border-amber-700/60'
              : isTripCompleted
              ? 'bg-purple-950 text-purple-400 border-purple-700/60'
              : 'bg-blue-950 text-blue-400 border-blue-700/60'
          }`}
        >
          {isBookingConfirmed && <CheckCircle2 className="w-5 h-5" />}
          {isDriverAssigned && <UserCheck className="w-5 h-5" />}
          {isTripStarted && <Car className="w-5 h-5" />}
          {isTripCompleted && <ShieldCheck className="w-5 h-5" />}
          {!isBookingConfirmed && !isDriverAssigned && !isTripStarted && !isTripCompleted && (
            <Bell className="w-5 h-5" />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-100 tracking-tight">
                {notification.title}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 font-bold">
                {notification.bookingId}
              </span>
            </div>

            <button
              onClick={onDismiss}
              title="Dismiss alert"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-snug">
            {notification.message}
          </p>

          {/* Special Chauffeur Assignment Card */}
          {isDriverAssigned && notification.driver && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span>{notification.driver.name}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  ★ {notification.driver.rating || '4.9'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span className="font-mono">{notification.driver.phone}</span>
                <a
                  href={`tel:${notification.driver.phone}`}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[10px] hover:bg-amber-400 transition"
                >
                  <Phone className="w-2.5 h-2.5" />
                  <span>Call Chauffeur</span>
                </a>
              </div>
            </div>
          )}

          {/* Quick Action Footer */}
          <div className="flex items-center justify-between pt-1.5 text-[10px]">
            <span className="text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              <span>Just now</span>
            </span>

            {onFocusBooking && (
              <button
                onClick={() => onFocusBooking(notification.bookingId)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
              >
                <span>View Itinerary</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
