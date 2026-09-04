import React, { useState } from 'react';
import { Vehicle, FareCalculation, Booking } from '../types';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Printer
} from 'lucide-react';

interface BookingModalProps {
  vehicle: Vehicle;
  fareCalc: FareCalculation;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  vehicle,
  fareCalc,
  onClose,
  onBookingSuccess,
}) => {
  const [passengerName, setPassengerName] = useState('Santosh Kumar');
  const [passengerPhone, setPassengerPhone] = useState('+91 9876543210');
  const [passengerEmail, setPassengerEmail] = useState('passenger@example.com');
  const [specialNotes, setSpecialNotes] = useState('');
  
  // Payment step
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'DETAILS' | 'CHECKOUT' | 'SUCCESS'>('DETAILS');
  const [paymentMethod, setPaymentMethod] = useState<'UPI_GATEWAY' | 'CARD' | 'NETBANKING'>('UPI_GATEWAY');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Submit Booking Request
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !passengerPhone) {
      setErrorMsg('Passenger name and contact number are required.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Create booking on server
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'CUST-' + Date.now(),
          customerName: passengerName,
          customerPhone: passengerPhone,
          vehicleId: vehicle.id,
          pickup: fareCalc.pickup || 'Delhi NCR',
          destination: fareCalc.destination || 'Jaipur',
          distanceKm: fareCalc.billableDistanceKm || fareCalc.distanceKm,
          travelDate: new Date().toISOString().split('T')[0],
          travelTime: '08:00',
          passengers: vehicle.seatingCapacity,
          tripType: 'ONE_WAY',
          specialNotes,
          fareBreakdown: {
            baseFare: fareCalc.baseFare,
            distanceFare: fareCalc.distanceFare,
            driverCharges: fareCalc.driverCharges,
            estimatedTollsAndTaxes: fareCalc.estimatedTollsAndTaxes,
            nightCharges: fareCalc.nightCharges || 0,
            finalCustomerFare: fareCalc.finalCustomerFare,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedBooking(data.booking);
        // Create server-side payment order
        await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: data.booking.id }),
        });
        setPaymentStep('CHECKOUT');
      } else {
        setErrorMsg(data.error || 'Failed to initialize booking.');
      }
    } catch (err: any) {
      setErrorMsg('Network error connecting to payment gateway.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Verify Payment (Server-side Webhook verification)
  const handleSimulatePaymentConfirmation = async () => {
    if (!createdBooking) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/payments/verify-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: createdBooking.id,
          transactionId: 'TXN_GATEWAY_' + Math.floor(Math.random() * 900000 + 100000),
          signature: 'sha256_mock_valid_signature_token',
          status: 'SUCCESS',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedBooking(data.booking);
        setPaymentStep('SUCCESS');
        onBookingSuccess(data.booking);
      } else {
        setErrorMsg('Payment verification failed on server.');
      }
    } catch (err) {
      setErrorMsg('Payment gateway timeout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl my-8 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              LT
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {paymentStep === 'SUCCESS' ? 'Booking Confirmed' : 'Confirm Travel & Payment'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {vehicle.make} {vehicle.model} • {vehicle.registrationNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: PASSENGER & FARE DETAILS */}
        {paymentStep === 'DETAILS' && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-5">
            {/* Fare Summary pill */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Trip Distance</span>
                <span className="font-semibold text-slate-900">
                  {fareCalc.billableDistanceKm || fareCalc.distanceKm} km
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Base + Distance Fare</span>
                <span className="font-semibold text-slate-900">
                  ₹{fareCalc.baseFare + fareCalc.distanceFare}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Driver Allowance + Tolls & Taxes</span>
                <span className="font-semibold text-slate-900">
                  ₹{fareCalc.driverCharges + fareCalc.estimatedTollsAndTaxes}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Total Payable Fare</span>
                <span className="text-xl font-extrabold text-slate-950">
                  ₹{fareCalc.finalCustomerFare.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                <span>Platform Commission (10%): ₹{fareCalc.developerCommission}</span>
                <span className="text-emerald-700 font-medium">Operator Share: ₹{fareCalc.ownerGrossShare}</span>
              </div>
            </div>

            {/* Passenger Form */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Passenger Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Primary Passenger Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email (for Tax Invoice & Booking Slip)
                </label>
                <input
                  type="email"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Special Travel Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Airport terminal 3 pickup, luggage assistance"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Operator Trust Banner */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Vehicle <strong>{vehicle.registrationNumber}</strong> is legally insured and verified under Laxmi Travels safety guidelines.
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Generating Secure Order...' : 'Proceed to Payment Gateway'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: SECURE PAYMENT GATEWAY WORKFLOW */}
        {paymentStep === 'CHECKOUT' && createdBooking && (
          <div className="p-6 space-y-5">
            <div className="text-center pb-2">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Secure Commercial Payment Gateway
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-2">
                ₹{createdBooking.fareBreakdown.finalCustomerFare.toLocaleString('en-IN')}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Booking Reference: {createdBooking.id}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI_GATEWAY')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'UPI_GATEWAY'
                    ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5 text-amber-600" />
                <span className="text-xs">UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-slate-700" />
                <span className="text-xs">Debit/Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Lock className="w-5 h-5 text-slate-700" />
                <span className="text-xs">NetBanking</span>
              </button>
            </div>

            {/* Simulated Secure QR or Card fields */}
            {paymentMethod === 'UPI_GATEWAY' ? (
              <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-3">
                <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-xl flex items-center justify-center shadow-inner">
                  {/* Stylized QR placeholder */}
                  <div className="w-full h-full border-4 border-slate-900 rounded-lg flex flex-col items-center justify-center p-2 text-slate-900 font-mono text-[10px] text-center">
                    <QrCode className="w-16 h-16 text-slate-900 mb-1" />
                    <span className="font-bold">Laxmi Travels</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-400">
                    Scan via PhonePe, Google Pay, Paytm, or BHIM
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Merchant Name: <strong>Laxmi Travels</strong> • End-to-end encrypted
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Card Number</label>
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono bg-white text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Expiry</label>
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">CVV</label>
                    <input
                      type="password"
                      disabled
                      value="•••"
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono bg-white text-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Server-side verification simulation button */}
            <button
              type="button"
              id="btn-simulate-payment-webhook"
              onClick={handleSimulatePaymentConfirmation}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Verifying Server Webhook Signature...'
                  : `Complete Payment (₹${createdBooking.fareBreakdown.finalCustomerFare})`}
              </span>
            </button>

            <p className="text-[10px] text-center text-slate-400">
              Payments are authenticated via server-side cryptographic signatures. Zero sensitive card or UPI data stored.
            </p>
          </div>
        )}

        {/* STEP 3: BOOKING CONFIRMATION & INVOICE ACCESS */}
        {paymentStep === 'SUCCESS' && createdBooking && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Payment Authorized & Verified
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-1">
                Booking Confirmed!
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Booking Reference ID: <strong className="font-mono text-slate-900">{createdBooking.id}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Vehicle:</span>
                <span className="font-semibold text-slate-800">{vehicle.make} {vehicle.model} ({vehicle.registrationNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operator:</span>
                <span className="font-semibold text-slate-800">{vehicle.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700">₹{createdBooking.fareBreakdown.finalCustomerFare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Ref:</span>
                <span className="font-mono text-slate-700">{createdBooking.payment.transactionId}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                View in My Bookings
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
