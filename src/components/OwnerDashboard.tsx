import React, { useState, useEffect } from 'react';
import { Vehicle, Booking, DocumentRecord, DocumentType } from '../types';
import { VehicleOnboardingWizard } from './VehicleOnboardingWizard';
import { 
  Car, 
  Plus, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  ChevronRight,
  Eye,
  AlertCircle
} from 'lucide-react';

interface OwnerDashboardProps {
  onSwitchToAdminVerifier: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onSwitchToAdminVerifier }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedVehicleDocs, setSelectedVehicleDocs] = useState<Vehicle | null>(null);

  const fetchOwnerData = async () => {
    setIsLoading(true);
    try {
      // Get all vehicles for this operator
      const [resVehicles, resBookings] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/bookings'),
      ]);

      const vData = await resVehicles.json();
      const bData = await resBookings.json();

      if (vData.success) setVehicles(vData.vehicles || []);
      if (bData.success) setBookings(bData.bookings || []);
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  // Trip action handlers
  const handleTripAction = async (bookingId: string, action: 'ACCEPT' | 'START_TRIP' | 'COMPLETE_TRIP') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorRole: 'VEHICLE_OWNER',
          actorName: 'Operator',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOwnerData();
      }
    } catch (err) {
      console.error('Trip action error:', err);
    }
  };

  // Financial calculations: Completed trips
  const completedTrips = bookings.filter((b) => b.status === 'TRIP_COMPLETED');
  const grossEarnings = completedTrips.reduce((sum, b) => sum + b.fareBreakdown.finalCustomerFare, 0);
  const developerCommission = completedTrips.reduce((sum, b) => sum + b.commission.developerCommission, 0);
  const netOwnerPayout = grossEarnings - developerCommission;

  return (
    <div className="space-y-8">
      {/* Top Header & New Vehicle Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Vehicle Operator Fleet Dashboard</h2>
          <p className="text-xs text-slate-500">
            Manage your registered four-wheelers, track verification progress, and monitor 90% net earnings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-register-new-vehicle"
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Vehicle</span>
          </button>
        </div>
      </div>

      {/* Financial Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Gross Passenger Fares
          </span>
          <div className="text-2xl font-black text-slate-900">
            ₹{grossEarnings.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            From {completedTrips.length} completed rides
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-600 block mb-1">
            Platform Commission (10%)
          </span>
          <div className="text-2xl font-black text-amber-600">
            -₹{developerCommission.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Standard developer & safety fee
          </span>
        </div>

        <div className="bg-emerald-950 p-5 rounded-2xl border border-emerald-800 text-white shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
            Net Owner Payout (90%)
          </span>
          <div className="text-2xl font-black text-emerald-300">
            ₹{netOwnerPayout.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">
            Direct bank / UPI settlement eligible
          </span>
        </div>
      </div>

      {/* ZERO-STATE: If 0 vehicles registered */}
      {vehicles.length === 0 && !isLoading ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <Car className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Your vehicle list is empty.
          </h3>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed max-w-sm mx-auto">
            Register your first vehicle to begin the 6-point verification process (RC, Insurance, PUC, Fitness, Permit, Inspection).
          </p>
          <button
            id="btn-empty-register-first-vehicle"
            onClick={() => setIsWizardOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
          >
            Start Vehicle Onboarding Wizard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Registered Fleet Vehicles ({vehicles.length})
            </h3>
            <span className="text-xs text-slate-500">
              Approved vehicles are automatically discoverable by customers.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              // Check document status
              const docs = v.documents;
              const hasExpiredDocs = (Object.values(docs) as DocumentRecord[]).some((d) => d.status === 'EXPIRED');

              return (
                <div
                  key={v.id}
                  id={`owner-vehicle-${v.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900">
                          {v.make} {v.model}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            v.isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.verificationStatus === 'SUSPENDED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.isApproved ? 'APPROVED & LIVE' : v.verificationStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {v.registrationNumber} • {v.category.replace('_', ' ')} • {v.manufacturingYear}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                      ₹{v.pricing?.perKmRate || 14}/km
                    </span>
                  </div>

                  {/* Verification & Inspection Status Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Document Gate</span>
                      <span className="font-semibold text-slate-800">
                        {v.verificationStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Physical Condition</span>
                      <span className="font-semibold text-slate-800">
                        {v.inspectionStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Document Expiry Checklist */}
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Documents & Expiration Tracker
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(Object.entries(v.documents) as [DocumentType, DocumentRecord][]).map(([key, doc]) => (
                        <span
                          key={key}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            doc.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : doc.status === 'EXPIRED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                          title={`Expiry: ${doc.expiryDate || 'N/A'}`}
                        >
                          {doc.type}: {doc.status}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedVehicleDocs(v)}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Documents</span>
                    </button>

                    {!v.isApproved && (
                      <button
                        id={`btn-open-verifier-for-${v.id}`}
                        onClick={onSwitchToAdminVerifier}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline flex items-center gap-1"
                      >
                        <span>Review as Admin Verifier</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operator Bookings & Trips Section */}
      {bookings.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Assigned Passenger Booking Requests & Active Trips
          </h3>

          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-slate-900">{booking.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Route: <strong>{booking.pickup}</strong> ➔ <strong>{booking.destination}</strong> ({booking.distanceKm} km)
                  </div>
                  <div className="text-xs text-slate-500">
                    Passenger: {booking.customerName} ({booking.customerPhone})
                  </div>
                </div>

                {/* Financial breakdown for operator */}
                <div className="text-right sm:text-right shrink-0">
                  <div className="text-xs text-slate-500">
                    Fare: ₹{booking.fareBreakdown.finalCustomerFare} • Comm (10%): -₹{booking.commission.developerCommission}
                  </div>
                  <div className="text-sm font-extrabold text-emerald-700">
                    Your Net Share: ₹{booking.commission.ownerGrossShare}
                  </div>

                  {/* Trip lifecycle buttons */}
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    {booking.status === 'REQUESTED' && (
                      <button
                        onClick={() => handleTripAction(booking.id, 'ACCEPT')}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs"
                      >
                        Accept Ride
                      </button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleTripAction(booking.id, 'START_TRIP')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"
                      >
                        Start Trip
                      </button>
                    )}
                    {booking.status === 'TRIP_STARTED' && (
                      <button
                        onClick={() => handleTripAction(booking.id, 'COMPLETE_TRIP')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                      >
                        Complete Trip & Finalize Fare
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Onboarding Wizard Modal */}
      {isWizardOpen && (
        <VehicleOnboardingWizard
          onClose={() => setIsWizardOpen(false)}
          onVehicleCreated={(newVehicle) => {
            setVehicles((prev) => [newVehicle, ...prev]);
            fetchOwnerData();
          }}
        />
      )}

      {/* Document Inspector Modal */}
      {selectedVehicleDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {selectedVehicleDocs.make} {selectedVehicleDocs.model} ({selectedVehicleDocs.registrationNumber})
                </h4>
                <p className="text-xs text-slate-500">Legal Document Portfolio & Expiry</p>
              </div>
              <button
                onClick={() => setSelectedVehicleDocs(null)}
                className="text-slate-400 hover:text-slate-900 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {(Object.entries(selectedVehicleDocs.documents) as [DocumentType, DocumentRecord][]).map(([key, doc]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{doc.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200">
                      {doc.status}
                    </span>
                  </div>
                  <div className="text-slate-600">Doc Number: <span className="font-mono">{doc.documentNumber || 'Pending'}</span></div>
                  <div className="text-slate-500 text-[11px]">Valid Until: {doc.expiryDate || 'N/A'}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedVehicleDocs(null)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
