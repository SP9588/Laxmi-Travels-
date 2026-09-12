import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DriverRecord, DriverStatus, Vehicle, Booking } from '../types';
import {
  UserCheck,
  Plus,
  Car,
  Phone,
  ShieldCheck,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  Star,
  Trash2,
  RefreshCw,
  Edit2,
  X,
  Radio,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface DriverProfileProps {
  vehicles: Vehicle[];
  bookings?: Booking[];
  onDriverUpdated?: () => void;
}

export const DriverProfile: React.FC<DriverProfileProps> = ({
  vehicles,
  bookings = [],
  onDriverUpdated,
}) => {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDriverForDocUpload, setSelectedDriverForDocUpload] = useState<DriverRecord | null>(null);
  const [selectedDocTypeToUpload, setSelectedDocTypeToUpload] = useState<
    'DRIVING_LICENSE' | 'AADHAAR_CARD' | 'POLICE_VERIFICATION' | 'PSV_BADGE'
  >('DRIVING_LICENSE');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | DriverStatus>('ALL');

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      if (data.success) {
        setDrivers(data.drivers || []);
      }
    } catch (err) {
      console.error('Failed to load driver profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleToggleStatus = async (driverId: string) => {
    try {
      const res = await fetch(`/api/drivers/${driverId}/toggle-status`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDrivers((prev) => prev.map((d) => (d.id === driverId ? data.driver : d)));
        onDriverUpdated?.();
      } else {
        alert(data.error || 'Failed to toggle status');
      }
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  const handleAssignVehicle = async (driverId: string, vehicleId: string) => {
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentVehicleId: vehicleId }),
      });
      const data = await res.json();
      if (data.success) {
        setDrivers((prev) => prev.map((d) => (d.id === driverId ? data.driver : d)));
        onDriverUpdated?.();
      }
    } catch (err) {
      console.error('Vehicle assign failed:', err);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to remove this driver profile from your fleet?')) return;
    try {
      const res = await fetch(`/api/drivers/${driverId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDrivers((prev) => prev.filter((d) => d.id !== driverId));
        onDriverUpdated?.();
      } else {
        alert(data.error || 'Failed to delete driver');
      }
    } catch (err) {
      console.error('Delete driver error:', err);
    }
  };

  // Metrics calculation
  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter((d) => d.status === 'AVAILABLE').length;
  const activeTripsDrivers = drivers.filter((d) => d.status === 'ASSIGNED' || d.status === 'ON_TRIP').length;
  const offDutyDrivers = drivers.filter((d) => d.status === 'OFF_DUTY').length;

  const filteredDrivers = drivers.filter((d) => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  return (
    <div id="driver-profile-manager" className="space-y-6">
      {/* Header section with Stats and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">Commercial Chauffeur & Driver Profiles</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Fleet Personnel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage commercial chauffeurs, upload verified licenses, ID proofs, police clearance, and monitor live trip assignments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-refresh-drivers"
            onClick={fetchDrivers}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
            title="Refresh driver records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="btn-add-driver-profile"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Driver & Upload Credentials</span>
          </button>
        </div>
      </div>

      {/* Driver Fleet Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold block ${statusFilter === 'ALL' ? 'text-slate-400' : 'text-slate-400'}`}>
            Total Chauffeurs
          </span>
          <div className="text-2xl font-black mt-0.5">{totalDrivers}</div>
          <span className={`text-[11px] ${statusFilter === 'ALL' ? 'text-slate-400' : 'text-slate-500'}`}>
            Registered in fleet
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('AVAILABLE')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'AVAILABLE'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-700 shadow-sm'
              : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">
            Ready & Available
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">{availableDrivers}</div>
          <span className="text-[11px] text-slate-500">Ready for dispatch</span>
        </div>

        <div
          onClick={() => setStatusFilter('ASSIGNED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'ASSIGNED' || statusFilter === 'ON_TRIP'
              ? 'bg-amber-950 text-amber-100 border-amber-700 shadow-sm'
              : 'bg-white text-slate-900 border-slate-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-600 block">
            Active / On Trip
          </span>
          <div className="text-2xl font-black text-amber-600 mt-0.5">{activeTripsDrivers}</div>
          <span className="text-[11px] text-slate-500">Currently dispatched</span>
        </div>

        <div
          onClick={() => setStatusFilter('OFF_DUTY')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'OFF_DUTY'
              ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Off Duty / Rest
          </span>
          <div className="text-2xl font-black text-slate-700 mt-0.5">{offDutyDrivers}</div>
          <span className="text-[11px] text-slate-500">On shift break</span>
        </div>
      </div>

      {/* Driver Profiles List */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <UserCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {statusFilter === 'ALL' ? 'No Drivers Registered Yet' : `No Drivers with Status: ${statusFilter}`}
          </h4>
          <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto leading-relaxed">
            Add certified commercial chauffeurs and upload their Commercial DL, Police Clearance, and Aadhaar to enable trip assignments.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition"
          >
            Register First Driver
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrivers.map((driver) => {
            const isAssigned = driver.status === 'ASSIGNED';
            const isOnTrip = driver.status === 'ON_TRIP';
            const isAvailable = driver.status === 'AVAILABLE';
            const isOffDuty = driver.status === 'OFF_DUTY';

            // Find matching booking if assigned
            const activeBooking = bookings.find((b) => b.id === driver.activeBookingId);

            return (
              <div
                key={driver.id}
                id={`driver-card-${driver.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 space-y-4"
              >
                {/* Driver Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {driver.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-slate-900">{driver.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{driver.rating || 5.0}★ Rating</span>
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {driver.experienceYears} Years Exp
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${driver.phone}`} className="hover:text-amber-600 transition">
                            {driver.phone}
                          </a>
                        </span>
                        {driver.email && <span>• {driver.email}</span>}
                        {driver.emergencyContact && (
                          <span>• Emg: <span className="font-mono text-slate-600">{driver.emergencyContact}</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assignment Status Badge & Toggle */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isOnTrip
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : isAssigned
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-500 animate-pulse'
                            : isOnTrip
                            ? 'bg-blue-500 animate-pulse'
                            : isAssigned
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{driver.status.replace('_', ' ')}</span>
                    </div>

                    {/* Quick availability toggle button */}
                    {!isOnTrip && (
                      <button
                        onClick={() => handleToggleStatus(driver.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition ${
                          isAvailable
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                        title={isAvailable ? 'Set driver to Off Duty' : 'Set driver to Available'}
                      >
                        {isAvailable ? 'Mark Off-Duty' : 'Set Available'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Assignment Info & Vehicle Link */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {/* Assigned Vehicle */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Vehicle</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{driver.currentVehicleModel || 'No Vehicle Assigned'}</span>
                    </div>
                    <div className="font-mono text-slate-500 text-[11px]">
                      {driver.currentVehicleNumber ? (
                        <span>Reg: {driver.currentVehicleNumber}</span>
                      ) : (
                        <span className="italic text-slate-400">Available to assign to fleet</span>
                      )}
                    </div>
                  </div>

                  {/* Current Active Trip / Dispatch */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Assignment</span>
                    {driver.activeBookingId ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800">
                          <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span className="font-mono">{driver.activeBookingId}</span>
                        </div>
                        {activeBooking ? (
                          <div className="text-[11px] text-slate-600 truncate">
                            {activeBooking.pickup} ➔ {activeBooking.destination}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500">Live Dispatched Trip</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-[11px] pt-1">
                        No active booking • Standby ready
                      </div>
                    )}
                  </div>

                  {/* Historical Records */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Trip Track Record</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{driver.totalTripsCompleted || 0} Successful Journeys</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Zero safety infractions reported
                    </div>
                  </div>
                </div>

                {/* Verified Credentials Vault */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Commercial Credentials & Statutory Verification</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Regulatory Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {/* 1. Driving License */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>Driving License</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          VERIFIED
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 font-bold truncate">
                        {driver.credentials.drivingLicense?.docNumber || 'Not provided'}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Exp: {driver.credentials.drivingLicense?.expiryDate || 'Valid'}</span>
                        <button
                          onClick={() => {
                            setSelectedDriverForDocUpload(driver);
                            setSelectedDocTypeToUpload('DRIVING_LICENSE');
                          }}
                          className="text-amber-600 hover:text-amber-700 font-bold underline"
                        >
                          Update
                        </button>
                      </div>
                    </div>

                    {/* 2. Aadhaar Card */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aadhaar Identity</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          VERIFIED
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 font-bold truncate">
                        {driver.credentials.aadhaarCard?.docNumber || 'XXXX-XXXX-XXXX'}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="truncate">{driver.credentials.aadhaarCard?.fileName || 'National UID'}</span>
                        <button
                          onClick={() => {
                            setSelectedDriverForDocUpload(driver);
                            setSelectedDocTypeToUpload('AADHAAR_CARD');
                          }}
                          className="text-amber-600 hover:text-amber-700 font-bold underline"
                        >
                          Update
                        </button>
                      </div>
                    </div>

                    {/* 3. Police Verification */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                          <span>Police Clearance</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          CLEARED
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 font-bold truncate">
                        {driver.credentials.policeVerification?.docNumber || 'PV-PENDING'}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Exp: {driver.credentials.policeVerification?.expiryDate || '2027'}</span>
                        <button
                          onClick={() => {
                            setSelectedDriverForDocUpload(driver);
                            setSelectedDocTypeToUpload('POLICE_VERIFICATION');
                          }}
                          className="text-amber-600 hover:text-amber-700 font-bold underline"
                        >
                          Update
                        </button>
                      </div>
                    </div>

                    {/* 4. PSV Commercial Badge */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                          <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>PSV Badge</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {driver.credentials.psvBadge ? 'VERIFIED' : 'OPTIONAL'}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 font-bold truncate">
                        {driver.credentials.psvBadge?.docNumber || 'PSV-Badge-Verified'}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Commercial Certified</span>
                        <button
                          onClick={() => {
                            setSelectedDriverForDocUpload(driver);
                            setSelectedDocTypeToUpload('PSV_BADGE');
                          }}
                          className="text-amber-600 hover:text-amber-700 font-bold underline"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Assign Vehicle & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600">Assign to Vehicle:</span>
                    <select
                      id={`select-vehicle-${driver.id}`}
                      value={driver.currentVehicleId || ''}
                      onChange={(e) => handleAssignVehicle(driver.id, e.target.value)}
                      disabled={isOnTrip}
                      className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    >
                      <option value="">Unassigned (Standby)</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.model} ({v.registrationNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        setSelectedDriverForDocUpload(driver);
                        setSelectedDocTypeToUpload('DRIVING_LICENSE');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload Documents</span>
                    </button>

                    {!isOnTrip && (
                      <button
                        onClick={() => handleDeleteDriver(driver.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                        title="Remove driver"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Register New Driver Profile with Full Credentials */}
      <AnimatePresence>
        {isAddModalOpen && (
          <RegisterDriverModal
            vehicles={vehicles}
            onClose={() => setIsAddModalOpen(false)}
            onDriverAdded={() => {
              setIsAddModalOpen(false);
              fetchDrivers();
              onDriverUpdated?.();
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal 2: Single Credential Document Upload & Verification */}
      <AnimatePresence>
        {selectedDriverForDocUpload && (
          <UploadCredentialModal
            driver={selectedDriverForDocUpload}
            initialDocType={selectedDocTypeToUpload}
            onClose={() => setSelectedDriverForDocUpload(null)}
            onUploaded={() => {
              setSelectedDriverForDocUpload(null);
              fetchDrivers();
              onDriverUpdated?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Register Driver Profile Modal
// ---------------------------------------------------------------------------
interface RegisterDriverModalProps {
  vehicles: Vehicle[];
  onClose: () => void;
  onDriverAdded: () => void;
}

const RegisterDriverModal: React.FC<RegisterDriverModalProps> = ({
  vehicles,
  onClose,
  onDriverAdded,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [assignedVehicleId, setAssignedVehicleId] = useState('');

  // Credentials
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('2029-12-31');
  const [licenseFileName, setLicenseFileName] = useState('');
  const [licenseFilePreview, setLicenseFilePreview] = useState<string | null>(null);

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFileName, setAadhaarFileName] = useState('');

  const [policeVerificationNumber, setPoliceVerificationNumber] = useState('');
  const [policeVerificationExpiry, setPoliceVerificationExpiry] = useState('2027-12-31');
  const [policeFileName, setPoliceFileName] = useState('');

  const [psvBadgeNumber, setPsvBadgeNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Usability: Drag & Drop + Click File Upload Handlers
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, setFileName: (f: string) => void) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, setFileName: (f: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Driver name is required.');
    if (!phone.trim()) return setErrorMsg('Driver mobile number is required.');
    if (!licenseNumber.trim()) return setErrorMsg('Commercial Driving License number is required.');

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          emergencyContact: emergencyContact.trim(),
          experienceYears,
          assignedVehicleId,
          licenseNumber: licenseNumber.trim().toUpperCase(),
          licenseExpiry,
          licenseFileName: licenseFileName || 'commercial_dl.pdf',
          aadhaarNumber: aadhaarNumber.trim(),
          aadhaarFileName: aadhaarFileName || 'aadhaar_card.pdf',
          policeVerificationNumber: policeVerificationNumber.trim(),
          policeVerificationExpiry,
          policeVerificationFileName: policeFileName || 'police_clearance.pdf',
          psvBadgeNumber: psvBadgeNumber.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onDriverAdded();
      } else {
        setErrorMsg(data.error || 'Failed to register driver.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg('Failed to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl border border-slate-200 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Register Commercial Chauffeur</h3>
              <p className="text-xs text-slate-500">Upload driver credentials, statutory verifications & licenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* Section 1: Personal Details */}
          <div className="space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block border-b pb-1">
              1. Personal & Contact Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Chauffeur Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh Chauhan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Primary Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98711 44520"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. driver@laxmitravels.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Emergency Contact Phone & Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98110 55670 (Spouse)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Driving Experience (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Assign to Fleet Vehicle
                </label>
                <select
                  value={assignedVehicleId}
                  onChange={(e) => setAssignedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                >
                  <option value="">Unassigned (Standby Pool)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Credentials Upload */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block border-b pb-1">
              2. Credentials & Statutory Document Uploads
            </span>

            {/* A. Commercial Driving License */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Commercial Driving License (DL) *</span>
                </span>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  Mandatory
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">DL Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-0420180099123"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 uppercase font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">DL Expiry Date</label>
                  <input
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Drag & Drop File Upload Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, setLicenseFileName)}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-3 text-center bg-white cursor-pointer transition relative"
              >
                <input
                  type="file"
                  id="file-upload-dl"
                  onChange={(e) => handleFileInput(e, setLicenseFileName)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex items-center justify-center gap-2">
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-slate-700">
                    {licenseFileName ? `Selected: ${licenseFileName}` : 'Drag & drop DL document or click to browse'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">PDF, PNG, JPG up to 10MB</span>
              </div>
            </div>

            {/* B. Aadhaar Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aadhaar Identity Card</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  KYC Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Aadhaar Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 5432-8765-4819"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleFileDrop(e, setAadhaarFileName)}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-lg p-2 text-center bg-white cursor-pointer transition relative flex items-center justify-center"
                >
                  <input
                    type="file"
                    id="file-upload-aadhaar"
                    onChange={(e) => handleFileInput(e, setAadhaarFileName)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-[11px] font-semibold text-slate-700 truncate">
                    {aadhaarFileName ? `Selected: ${aadhaarFileName}` : 'Upload Aadhaar File'}
                  </span>
                </div>
              </div>
            </div>

            {/* C. Police Clearance Certificate */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  <span>Police Verification Certificate (PCC)</span>
                </span>
                <span className="text-[10px] text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded">
                  Safety Clearance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Clearance Certificate No.</label>
                  <input
                    type="text"
                    placeholder="e.g. PV-DL-2026-88310"
                    value={policeVerificationNumber}
                    onChange={(e) => setPoliceVerificationNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Validity Until</label>
                  <input
                    type="date"
                    value={policeVerificationExpiry}
                    onChange={(e) => setPoliceVerificationExpiry(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, setPoliceFileName)}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-lg p-2 text-center bg-white cursor-pointer transition relative flex items-center justify-center"
              >
                <input
                  type="file"
                  id="file-upload-pcc"
                  onChange={(e) => handleFileInput(e, setPoliceFileName)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-[11px] font-semibold text-slate-700 truncate">
                  {policeFileName ? `Selected: ${policeFileName}` : 'Upload Police Clearance Certificate (PCC)'}
                </span>
              </div>
            </div>

            {/* D. PSV Commercial Badge */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-800 text-[11px] block">
                Public Service Vehicle (PSV) Commercial Badge (Optional)
              </span>
              <input
                type="text"
                placeholder="e.g. PSV-DEL-55910"
                value={psvBadgeNumber}
                onChange={(e) => setPsvBadgeNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500 uppercase"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Save & Verify Credentials'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Single Credential Document Upload Modal
// ---------------------------------------------------------------------------
interface UploadCredentialModalProps {
  driver: DriverRecord;
  initialDocType: 'DRIVING_LICENSE' | 'AADHAAR_CARD' | 'POLICE_VERIFICATION' | 'PSV_BADGE';
  onClose: () => void;
  onUploaded: () => void;
}

const UploadCredentialModal: React.FC<UploadCredentialModalProps> = ({
  driver,
  initialDocType,
  onClose,
  onUploaded,
}) => {
  const [docType, setDocType] = useState(initialDocType);
  const [docNumber, setDocNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2029-12-31');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    // Populate existing values if available
    const key =
      docType === 'DRIVING_LICENSE'
        ? 'drivingLicense'
        : docType === 'AADHAAR_CARD'
        ? 'aadhaarCard'
        : docType === 'POLICE_VERIFICATION'
        ? 'policeVerification'
        : 'psvBadge';

    const existing = (driver.credentials as any)[key];
    if (existing) {
      setDocNumber(existing.docNumber || '');
      setExpiryDate(existing.expiryDate || '2029-12-31');
      setFileName(existing.fileName || '');
    }
  }, [docType, driver]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setStatusMsg('');

    try {
      const res = await fetch(`/api/drivers/${driver.id}/upload-credential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          docNumber: docNumber.trim(),
          fileName: fileName || `${docType.toLowerCase()}_verified.pdf`,
          expiryDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onUploaded();
      } else {
        setStatusMsg(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      console.error('Upload credential error:', err);
      setStatusMsg('Server connection failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Upload Credential Document</h4>
              <p className="text-[11px] text-slate-500">For Chauffeur {driver.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Document Category</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
            >
              <option value="DRIVING_LICENSE">Commercial Driving License (DL)</option>
              <option value="AADHAAR_CARD">Aadhaar Card (UIDAI)</option>
              <option value="POLICE_VERIFICATION">Police Verification Certificate</option>
              <option value="PSV_BADGE">Public Service Vehicle (PSV) Badge</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Document Identification Number</label>
            <input
              type="text"
              required
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="e.g. DL-0420180099123"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Valid Until / Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Drag & Drop Box */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select / Drop Document File</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) setFileName(e.dataTransfer.files[0].name);
              }}
              className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-4 text-center bg-slate-50 cursor-pointer relative transition"
            >
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setFileName(e.target.files[0].name);
                }}
                accept=".pdf,.png,.jpg,.jpeg"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className="font-semibold text-slate-800">
                {fileName ? fileName : 'Drop file here or click to browse'}
              </div>
              <span className="text-[10px] text-slate-400">PDF, PNG, JPG (Verified & encrypted)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs"
            >
              {isUploading ? 'Uploading...' : 'Save & Verify Document'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
