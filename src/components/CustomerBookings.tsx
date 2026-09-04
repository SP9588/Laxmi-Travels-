import React, { useState, useEffect, useRef } from 'react';
import { Booking, BookingNotification, DriverDetails } from '../types';
import { InvoiceModal } from './InvoiceModal';
import { BookingToastContainer, playNotificationSound } from './BookingToast';
import { 
  FileText, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Printer, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Bell,
  Volume2,
  VolumeX,
  UserCheck,
  Phone,
  Sparkles,
  Radio,
  X,
  Trash2
} from 'lucide-react';

interface CustomerBookingsProps {
  onGoToSearch: () => void;
}

export const CustomerBookings: React.FC<CustomerBookingsProps> = ({ onGoToSearch }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Real-time notification & toast states
  const [toasts, setToasts] = useState<BookingNotification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<BookingNotification[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isSseConnected, setIsSseConnected] = useState(false);
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Rating modal state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to push new toast and save in history
  const pushNotification = (notifData: Omit<BookingNotification, 'id' | 'timestamp'>) => {
    const newNotif: BookingNotification = {
      ...notifData,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setToasts((prev) => [newNotif, ...prev.slice(0, 4)]); // Show up to 5 concurrent toasts
    setNotificationHistory((prev) => [newNotif, ...prev]);

    if (isSoundEnabled) {
      playNotificationSound();
    }
  };

  // Real-Time Server-Sent Events (SSE) Listener
  useEffect(() => {
    fetchBookings();

    const connectSSE = () => {
      try {
        const es = new EventSource('/api/bookings/events');
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsSseConnected(true);
        };

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CONNECTED') {
              setIsSseConnected(true);
              return;
            }

            if (data.type === 'BOOKING_CONFIRMED') {
              pushNotification({
                type: 'BOOKING_CONFIRMED',
                title: data.title || 'Booking Confirmed!',
                message: data.message || `Booking ${data.bookingId} has been confirmed.`,
                bookingId: data.bookingId,
                status: 'CONFIRMED',
              });

              // Update booking state in place
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === data.bookingId
                    ? { ...b, status: 'CONFIRMED', payment: { ...b.payment, status: 'PAID' } }
                    : b
                )
              );
            } else if (data.type === 'DRIVER_ASSIGNED') {
              pushNotification({
                type: 'DRIVER_ASSIGNED',
                title: data.title || 'Chauffeur Assigned!',
                message: data.message || `A certified chauffeur was assigned to ${data.bookingId}.`,
                bookingId: data.bookingId,
                driver: data.driver,
                status: 'DRIVER_ASSIGNED',
              });

              // Update booking with driver info
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === data.bookingId
                    ? {
                        ...b,
                        status: 'DRIVER_ASSIGNED',
                        driver: data.driver || b.driver,
                      }
                    : b
                )
              );
            } else if (data.type === 'TRIP_STARTED') {
              pushNotification({
                type: 'TRIP_STARTED',
                title: data.title || 'Trip Started',
                message: data.message || `Trip ${data.bookingId} is in progress.`,
                bookingId: data.bookingId,
                status: 'TRIP_STARTED',
                driver: data.driver,
              });

              setBookings((prev) =>
                prev.map((b) =>
                  b.id === data.bookingId ? { ...b, status: 'TRIP_STARTED' } : b
                )
              );
            } else if (data.type === 'TRIP_COMPLETED') {
              pushNotification({
                type: 'TRIP_COMPLETED',
                title: data.title || 'Trip Completed!',
                message: data.message || `Trip ${data.bookingId} has arrived at destination.`,
                bookingId: data.bookingId,
                status: 'TRIP_COMPLETED',
              });

              setBookings((prev) =>
                prev.map((b) =>
                  b.id === data.bookingId ? { ...b, status: 'TRIP_COMPLETED' } : b
                )
              );
            } else if (data.type === 'STATUS_UPDATE') {
              pushNotification({
                type: 'STATUS_UPDATE',
                title: data.title || 'Trip Update',
                message: data.message || `Trip status updated to ${data.status}.`,
                bookingId: data.bookingId,
                status: data.status,
              });
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === data.bookingId ? { ...b, status: data.status || b.status } : b
                )
              );
            }
          } catch (err) {
            console.error('Error parsing SSE event:', err);
          }
        };

        es.onerror = () => {
          setIsSseConnected(false);
          es.close();
          // Retry connection after 5 seconds
          setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('Failed to create EventSource connection:', err);
        setIsSseConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isSoundEnabled]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleFocusBooking = (bookingId: string) => {
    setHighlightedBookingId(bookingId);
    const element = document.getElementById(`booking-card-${bookingId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightedBookingId(null);
    }, 4000);
  };

  // Quick testing simulator for instant user verification
  const handleSimulateUpdate = async (type: 'CONFIRM_PAYMENT' | 'ASSIGN_DRIVER') => {
    if (bookings.length === 0) return;
    const targetBooking = bookings[0];
    setIsSimulating(true);
    try {
      await fetch(`/api/bookings/${targetBooking.id}/simulate-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    } catch (err) {
      console.error('Failed to trigger simulated update:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRateRide = async () => {
    if (!ratingBooking) return;
    try {
      await fetch(`/api/bookings/${ratingBooking.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RATE',
          rating: stars,
          reviewComment: reviewText,
        }),
      });
      setRatingBooking(null);
      fetchBookings();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Real-time Toast Notifications Container */}
      <BookingToastContainer
        notifications={toasts}
        onDismiss={dismissToast}
        onFocusBooking={handleFocusBooking}
        soundEnabled={isSoundEnabled}
      />

      {/* Top Header & Real-time status controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">My Travel Bookings</h2>
            <div
              id="badge-sse-status"
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                isSseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isSseConnected ? 'Connected to live real-time server feed' : 'Reconnecting to stream...'}
            >
              <Radio className={`w-3 h-3 ${isSseConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              <span>{isSseConnected ? 'Live Feed Active' : 'Connecting...'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Real-time itinerary, driver assignment alerts, and official tax invoices
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Notification sound toggle */}
          <button
            id="btn-toggle-sound"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            title={isSoundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isSoundEnabled
                ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{isSoundEnabled ? 'Chime On' : 'Muted'}</span>
          </button>

          {/* Notification History Drawer Trigger */}
          <button
            id="btn-open-notification-history"
            onClick={() => setIsHistoryOpen(true)}
            className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition text-xs font-semibold flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline text-[11px]">Alerts</span>
            {notificationHistory.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {notificationHistory.length}
              </span>
            )}
          </button>

          {/* Interactive Simulation Controls for Demonstration / Instant testing */}
          {bookings.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-1 hidden md:inline">
                Test Real-Time:
              </span>
              <button
                id="btn-test-confirm-toast"
                onClick={() => handleSimulateUpdate('CONFIRM_PAYMENT')}
                disabled={isSimulating}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] transition"
                title="Simulate booking confirmation toast alert"
              >
                Confirm Trip
              </button>
              <button
                id="btn-test-assign-driver-toast"
                onClick={() => handleSimulateUpdate('ASSIGN_DRIVER')}
                disabled={isSimulating}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition"
                title="Simulate driver assignment toast alert"
              >
                Assign Driver
              </button>
            </div>
          )}

          <button
            id="btn-refresh-customer-bookings"
            onClick={fetchBookings}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold underline px-1"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ZERO-STATE: Strictly required by prompt */}
      {bookings.length === 0 && !isLoading ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            You don't have any bookings yet.
          </h3>
          <p className="text-xs text-slate-600 mb-5 leading-relaxed max-w-sm mx-auto">
            Once you calculate a route and book an approved vehicle, your live trip itinerary, booking ID, real-time driver alerts, and invoices will appear here.
          </p>
          <button
            id="btn-empty-book-first-ride"
            onClick={onGoToSearch}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
          >
            Find a Verified Vehicle
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCompleted = booking.status === 'TRIP_COMPLETED';
            const isHighlighted = highlightedBookingId === booking.id;
            const hasDriver = !!booking.driver;

            return (
              <div
                key={booking.id}
                id={`booking-card-${booking.id}`}
                className={`bg-white rounded-2xl border transition-all duration-300 p-5 space-y-4 ${
                  isHighlighted
                    ? 'ring-4 ring-amber-400 border-amber-500 shadow-xl bg-amber-50/20'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                      LT
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {booking.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.status === 'DRIVER_ASSIGNED'
                              ? 'bg-amber-100 text-amber-900'
                              : booking.status === 'TRIP_STARTED'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'TRIP_COMPLETED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {booking.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {booking.status === 'DRIVER_ASSIGNED' && <UserCheck className="w-3 h-3 text-amber-600" />}
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Booked for {booking.customerName} • {booking.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Fare</span>
                    <span className="text-lg font-extrabold text-slate-950">
                      ₹{booking.fareBreakdown.finalCustomerFare.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Route & Travel Spec */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Route</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{booking.pickup}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{booking.destination}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {booking.distanceKm} km • {booking.tripType.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Schedule</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{booking.travelDate}</span>
                      <Clock className="w-3.5 h-3.5 text-slate-500 ml-1" />
                      <span>{booking.travelTime}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {booking.passengers} Passengers
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Assigned Vehicle</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Car className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{booking.vehicleModel}</span>
                    </div>
                    <div className="font-mono text-slate-600 text-[11px]">
                      {booking.vehicleNumber} (Operator: {booking.ownerName})
                    </div>
                  </div>
                </div>

                {/* Assigned Chauffeur / Driver Section if assigned */}
                {hasDriver && booking.driver && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {booking.driver.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                            ★ {booking.driver.rating || '4.9'}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            Verified Commercial Chauffeur
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px] font-mono flex items-center gap-2">
                          <span>License: {booking.driver.licenseNumber || 'Verified Badge'}</span>
                          <span>•</span>
                          <span>Vehicle: {booking.vehicleNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${booking.driver.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Driver ({booking.driver.phone})</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Card Actions: Invoice & Rating */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-view-invoice-${booking.id}`}
                      onClick={() => setSelectedInvoiceBooking(booking)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Tax Invoice</span>
                    </button>

                    {isCompleted && !booking.rating && (
                      <button
                        onClick={() => {
                          setRatingBooking(booking);
                          setStars(5);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>Rate Ride</span>
                      </button>
                    )}

                    {booking.rating && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Rated {booking.rating}/5</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Payment: {booking.payment.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal Popup */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}

      {/* Notification History Popover/Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Notification Alerts Log</h3>
                  <p className="text-[11px] text-slate-500">Live booking confirmations & driver assignments</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {notificationHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No notifications recorded in this session yet.
                </div>
              ) : (
                notificationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Now'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{item.message}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {item.bookingId}
                      </span>
                      <button
                        onClick={() => {
                          setIsHistoryOpen(false);
                          handleFocusBooking(item.bookingId);
                        }}
                        className="text-[11px] text-amber-600 hover:text-amber-700 font-bold"
                      >
                        View Trip
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notificationHistory.length > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  onClick={() => setNotificationHistory([])}
                  className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ride Rating Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">Rate Your Journey</h3>
            <p className="text-xs text-slate-500">
              Trip {ratingBooking.id} with {ratingBooking.vehicleModel}
            </p>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setStars(num)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-8 h-8 ${
                      num <= stars
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience (driving safety, cleanliness, punctuality)..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setRatingBooking(null)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRateRide}
                className="w-1/2 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

