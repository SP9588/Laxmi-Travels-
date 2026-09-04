import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { InvoiceModal } from './InvoiceModal';
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
  ArrowRight
} from 'lucide-react';

interface CustomerBookingsProps {
  onGoToSearch: () => void;
}

export const CustomerBookings: React.FC<CustomerBookingsProps> = ({ onGoToSearch }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Rating modal state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

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

  useEffect(() => {
    fetchBookings();
  }, []);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Travel Bookings</h2>
          <p className="text-xs text-slate-500">
            Real-time itinerary, driver updates, and official tax invoices
          </p>
        </div>
        <button
          id="btn-refresh-customer-bookings"
          onClick={fetchBookings}
          className="text-xs text-amber-600 hover:text-amber-700 font-semibold underline"
        >
          Refresh
        </button>
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
            Once you calculate a route and book an approved vehicle, your live trip itinerary, booking ID, and invoices will appear here.
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
            const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'TRIP_STARTED';

            return (
              <div
                key={booking.id}
                id={`booking-card-${booking.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs">
                      LT
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {booking.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.status === 'TRIP_STARTED'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'TRIP_COMPLETED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
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
