import React from 'react';
import { Booking } from '../types';
import { X, Printer, ShieldCheck, Car, CheckCircle2 } from 'lucide-react';

interface InvoiceModalProps {
  booking: Booking;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${booking.id.replace('LT-', '')}`;
  const issueDate = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden text-slate-900 border border-slate-200">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between no-print">
          <span className="text-xs font-semibold text-amber-400">
            Commercial Transport Receipt & Tax Invoice
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formal Printable Invoice Body */}
        <div className="p-8 space-y-6 print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm">
                  LT
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Laxmi Travels
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Commercial Transport Platform & Fleet Management
              </p>
              <p className="text-[11px] text-slate-500">
                GSTIN: 07AAACL1234F1Z9 • CIN: U63040DL2026PTC123456
              </p>
              <p className="text-[11px] text-slate-500">
                Laxmi Travels Transport Hub, Sector 18, Commercial Zone, India
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                {booking.payment.status === 'PAID' ? 'PAID IN FULL' : 'PAYMENT PENDING'}
              </span>
              <div className="text-xs font-bold text-slate-900 font-mono">
                {invoiceNumber}
              </div>
              <div className="text-xs text-slate-500">
                Date: {issueDate}
              </div>
              <div className="text-xs text-slate-500">
                Booking Ref: <strong>{booking.id}</strong>
              </div>
            </div>
          </div>

          {/* Passenger & Operator Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px] mb-1">
                Billed To (Passenger)
              </span>
              <div className="font-bold text-slate-900 text-sm">{booking.customerName}</div>
              <div className="text-slate-600">Contact: {booking.customerPhone}</div>
              <div className="text-slate-600">Passengers: {booking.passengers} Pax</div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px] mb-1">
                Vehicle & Operator Details
              </span>
              <div className="font-bold text-slate-900 text-sm">{booking.vehicleModel}</div>
              <div className="text-slate-600 font-mono">Reg: {booking.vehicleNumber}</div>
              <div className="text-slate-600">Operator: {booking.ownerName} (Verified)</div>
            </div>
          </div>

          {/* Trip Routing Table */}
          <div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2">Trip Particulars</th>
                  <th className="py-2">Type / Route</th>
                  <th className="py-2 text-right">Distance</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-semibold text-slate-900">
                    Point-to-Point Transport Service
                    <div className="text-[11px] text-slate-500 font-normal">
                      Date: {booking.travelDate} at {booking.travelTime}
                    </div>
                  </td>
                  <td className="py-3 text-slate-700">
                    {booking.pickup} ➔ {booking.destination}
                    <div className="text-[10px] text-slate-400">
                      {booking.tripType.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono">
                    {booking.distanceKm} km
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-900">
                    ₹{booking.fareBreakdown.baseFare + booking.fareBreakdown.distanceFare}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-700" colSpan={3}>
                    Driver Allowance / Night Stay
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-900">
                    ₹{booking.fareBreakdown.driverCharges}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-700" colSpan={3}>
                    Estimated Tolls, Parking & State Taxes
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-900">
                    ₹{booking.fareBreakdown.estimatedTollsAndTaxes}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="border-t border-slate-200 pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Fare:</span>
                <span className="font-mono">
                  ₹{booking.fareBreakdown.finalCustomerFare}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount / Promo:</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-950 text-sm">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-base font-extrabold text-slate-950">
                  ₹{booking.fareBreakdown.finalCustomerFare.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Transaction ID: <span className="font-mono">{booking.payment.transactionId || 'ONLINE_TXN_VERIFIED'}</span>
              </div>
            </div>
          </div>

          {/* Verification & Compliance Note */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Safe Commercial Trip</span>
            </div>
            <p>
              This is a computer-generated tax invoice issued by Laxmi Travels Platform. Commercial vehicle documents, pollution certificate, commercial insurance, and operator credentials are electronically logged and audited.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
