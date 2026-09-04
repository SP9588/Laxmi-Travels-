import React, { useState } from 'react';
import { Vehicle, VehicleCategory, DocumentType } from '../types';
import { 
  X, 
  Car, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  DollarSign,
  MapPin,
  Sparkles
} from 'lucide-react';

interface VehicleOnboardingWizardProps {
  onClose: () => void;
  onVehicleCreated: (vehicle: Vehicle) => void;
}

export const VehicleOnboardingWizard: React.FC<VehicleOnboardingWizardProps> = ({
  onClose,
  onVehicleCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Owner Details & Settlement Bank/UPI
  const [ownerName, setOwnerName] = useState('Rajesh Sharma');
  const [ownerPhone, setOwnerPhone] = useState('+91 9811223344');
  const [ownerEmail, setOwnerEmail] = useState('rajesh.fleet@example.com');
  const [ownerCity, setOwnerCity] = useState('New Delhi');
  const [ownerState, setOwnerState] = useState('Delhi');
  const [settlementBank, setSettlementBank] = useState('HDFC Bank');
  const [settlementAccount, setSettlementAccount] = useState('50100234567890');
  const [settlementIFSC, setSettlementIFSC] = useState('HDFC0001234');
  const [settlementUPI, setSettlementUPI] = useState('rajesh@okhdfcbank');

  // Step 2: Vehicle Specs
  const [registrationNumber, setRegistrationNumber] = useState('DL 01 AZ 9876');
  const [make, setMake] = useState('Maruti Suzuki');
  const [model, setModel] = useState('Dzire Tour Commercial');
  const [variant, setVariant] = useState('VXi');
  const [manufacturingYear, setManufacturingYear] = useState(2023);
  const [category, setCategory] = useState<VehicleCategory>('SEDAN');
  const [seatingCapacity, setSeatingCapacity] = useState(4);
  const [fuelType, setFuelType] = useState<'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC'>('CNG');
  const [acType, setAcType] = useState<'AC' | 'NON_AC'>('AC');
  const [odometerReading, setOdometerReading] = useState(34500);
  const [color, setColor] = useState('Commercial White');

  // Step 3: Multi-Angle Vehicle Photos
  const [photos, setPhotos] = useState<{
    front: string;
    rear: string;
    left: string;
    right: string;
    interior: string;
    dashboard: string;
  }>({
    front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60',
    rear: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=60',
    left: '',
    right: '',
    interior: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60',
    dashboard: '',
  });

  // Step 4: Mandatory Legal Documents
  const [rcNumber, setRcNumber] = useState('DL01-2023-0098765');
  const [rcExpiry, setRcExpiry] = useState('2038-04-15');
  const [insuranceNumber, setInsuranceNumber] = useState('NIC-COM-8839210');
  const [insuranceExpiry, setInsuranceExpiry] = useState('2027-05-20');
  const [pucNumber, setPucNumber] = useState('PUC-DL-99482');
  const [pucExpiry, setPucExpiry] = useState('2027-01-10');
  const [fitnessNumber, setFitnessNumber] = useState('FIT-DL-118273');
  const [fitnessExpiry, setFitnessExpiry] = useState('2026-11-30');
  const [permitNumber, setPermitNumber] = useState('AITP-DL-55281');
  const [permitExpiry, setPermitExpiry] = useState('2028-09-12');
  const [dlNumber, setDlNumber] = useState('DL-0420110098271');
  const [dlExpiry, setDlExpiry] = useState('2032-06-25');

  // Step 5: Pricing & Availability
  const [baseFare, setBaseFare] = useState(500);
  const [perKmRate, setPerKmRate] = useState(14);
  const [minKm, setMinKm] = useState(40);
  const [driverAllowance, setDriverAllowance] = useState(400);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(150);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Photo input (data URL or direct URL)
  const handlePhotoUpload = (field: keyof typeof photos, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVehicle = async () => {
    if (!registrationNumber || !make || !model) {
      setErrorMsg('Vehicle registration, make, and model are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ownerId: 'OWNER-' + Date.now(),
        ownerName,
        ownerPhone,
        ownerEmail,
        registrationNumber,
        make,
        model,
        variant,
        manufacturingYear,
        category,
        seatingCapacity,
        fuelType,
        acType,
        odometerReading,
        color,
        photos,
        documents: {
          RC: {
            documentNumber: rcNumber,
            issueDate: '2023-04-15',
            expiryDate: rcExpiry,
            fileUrl: 'https://example.com/docs/rc.pdf',
          },
          INSURANCE: {
            documentNumber: insuranceNumber,
            issueDate: '2024-05-20',
            expiryDate: insuranceExpiry,
            fileUrl: 'https://example.com/docs/insurance.pdf',
          },
          PUC: {
            documentNumber: pucNumber,
            issueDate: '2024-07-10',
            expiryDate: pucExpiry,
            fileUrl: 'https://example.com/docs/puc.pdf',
          },
          FITNESS: {
            documentNumber: fitnessNumber,
            issueDate: '2024-11-30',
            expiryDate: fitnessExpiry,
            fileUrl: 'https://example.com/docs/fitness.pdf',
          },
          PERMIT: {
            documentNumber: permitNumber,
            issueDate: '2023-09-12',
            expiryDate: permitExpiry,
            fileUrl: 'https://example.com/docs/permit.pdf',
          },
          DRIVER_LICENSE: {
            documentNumber: dlNumber,
            issueDate: '2012-06-25',
            expiryDate: dlExpiry,
            fileUrl: 'https://example.com/docs/dl.pdf',
          },
        },
        pricing: {
          baseFare: Number(baseFare),
          perKmRate: Number(perKmRate),
          minKm: Number(minKm),
          driverAllowancePerDay: Number(driverAllowance),
        },
        availability: {
          isAvailable: true,
          city: ownerCity,
          state: ownerState,
          serviceRadiusKm: Number(serviceRadiusKm),
        },
      };

      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onVehicleCreated(data.vehicle);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to submit vehicle.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to fleet onboarding server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
        {/* Header with Progress Steps */}
        <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                LT
              </div>
              <h3 className="font-bold text-sm">
                Commercial Vehicle Onboarding (Step {currentStep} of {totalSteps})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* STEP 1: OWNER / OPERATOR PROFILE & SETTLEMENT DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  1. Operator Profile & Payout Settlement Details
                </h4>
                <p className="text-xs text-slate-500">
                  Provide verified contact info and bank/UPI details to receive your 90% net ride earnings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operator Full Name *</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (OTP Verified) *</label>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating City *</label>
                  <input
                    type="text"
                    value={ownerCity}
                    onChange={(e) => setOwnerCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={ownerState}
                    onChange={(e) => setOwnerState(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Confidential Owner Payout Settlement Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={settlementBank}
                      onChange={(e) => setSettlementBank(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Account Number</label>
                    <input
                      type="password"
                      value={settlementAccount}
                      onChange={(e) => setSettlementAccount(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={settlementIFSC}
                      onChange={(e) => setSettlementIFSC(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 bg-white uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Settlement UPI ID</label>
                    <input
                      type="text"
                      value={settlementUPI}
                      onChange={(e) => setSettlementUPI(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE SPECIFICATIONS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  2. Vehicle Specifications
                </h4>
                <p className="text-xs text-slate-500">
                  Accurate specs matching your official commercial Registration Certificate (RC).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration Number (Yellow Plate) *
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. DL 01 AB 1234"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold uppercase font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="SEDAN">Sedan (Dzire / Etios / Aura)</option>
                    <option value="SUV">SUV (Ertiga / Brezza / Carens)</option>
                    <option value="INNOVA_CRYSTA">Innova Crysta Premium</option>
                    <option value="TEMPO_TRAVELLER">Tempo Traveller (12-16 Seats)</option>
                    <option value="LUXURY">Luxury (Camry / Mercedes / Audi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model Name *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mfg Year *</label>
                  <input
                    type="number"
                    min="2012"
                    max={new Date().getFullYear()}
                    value={manufacturingYear}
                    onChange={(e) => setManufacturingYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seats *</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel *</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium bg-white"
                  >
                    <option value="DIESEL">Diesel</option>
                    <option value="PETROL">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">AC Type *</label>
                  <select
                    value={acType}
                    onChange={(e) => setAcType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium bg-white"
                  >
                    <option value="AC">AC (Air Conditioned)</option>
                    <option value="NON_AC">Non-AC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Odometer (KM)</label>
                  <input
                    type="number"
                    value={odometerReading}
                    onChange={(e) => setOdometerReading(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MULTI-ANGLE VEHICLE PHOTOGRAPHS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  3. Multi-Angle Vehicle Photographs
                </h4>
                <p className="text-xs text-slate-500">
                  Upload clear, high-resolution photographs covering front, rear, interior, and dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'front', label: 'Front Exterior (Number Plate Visible)' },
                  { key: 'rear', label: 'Rear Exterior' },
                  { key: 'left', label: 'Left Side Profile' },
                  { key: 'right', label: 'Right Side Profile' },
                  { key: 'interior', label: 'Passenger Interior Seating' },
                  { key: 'dashboard', label: 'Dashboard & Odometer' },
                ].map(({ key, label }) => {
                  const photoKey = key as keyof typeof photos;
                  const hasPhoto = Boolean(photos[photoKey]);

                  return (
                    <div
                      key={key}
                      className="border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-between text-center bg-slate-50 relative overflow-hidden h-36"
                    >
                      {hasPhoto ? (
                        <div className="w-full h-full relative">
                          <img
                            src={photos[photoKey]}
                            alt={label}
                            className="w-full h-20 object-cover rounded-lg mb-1"
                          />
                          <span className="text-[10px] font-semibold text-emerald-700 block truncate">
                            {label}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPhotos(prev => ({ ...prev, [photoKey]: '' }))}
                            className="text-[10px] text-red-600 font-semibold underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 rounded-lg p-2 transition">
                          <Camera className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                            {label}
                          </span>
                          <span className="text-[10px] text-amber-600 font-bold mt-1">Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(photoKey, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Photographs are reviewed by vehicle inspectors for dent-free condition, clean upholstery, and visible legal registration.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: MANDATORY 6-POINT LEGAL DOCUMENTS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  4. Mandatory Legal Transport Documents
                </h4>
                <p className="text-xs text-slate-500">
                  Each document is validated for commercial validity and expiration dates.
                </p>
              </div>

              <div className="space-y-3">
                {/* RC */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="sm:col-span-1">
                    <span className="font-bold text-slate-900 block">1. Registration Certificate (RC)</span>
                    <span className="text-slate-500 text-[11px]">Commercial yellow plate RC</span>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Doc Number</label>
                    <input
                      type="text"
                      value={rcNumber}
                      onChange={(e) => setRcNumber(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Expiry Date</label>
                    <input
                      type="date"
                      value={rcExpiry}
                      onChange={(e) => setRcExpiry(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Insurance */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="sm:col-span-1">
                    <span className="font-bold text-slate-900 block">2. Commercial Insurance</span>
                    <span className="text-slate-500 text-[11px]">Valid comprehensive/passenger cover</span>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Policy Number</label>
                    <input
                      type="text"
                      value={insuranceNumber}
                      onChange={(e) => setInsuranceNumber(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Expiry Date</label>
                    <input
                      type="date"
                      value={insuranceExpiry}
                      onChange={(e) => setInsuranceExpiry(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Fitness Certificate */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="sm:col-span-1">
                    <span className="font-bold text-slate-900 block">3. Fitness Certificate</span>
                    <span className="text-slate-500 text-[11px]">RTO commercial fitness certificate</span>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Certificate Number</label>
                    <input
                      type="text"
                      value={fitnessNumber}
                      onChange={(e) => setFitnessNumber(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Expiry Date</label>
                    <input
                      type="date"
                      value={fitnessExpiry}
                      onChange={(e) => setFitnessExpiry(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* PUC */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="sm:col-span-1">
                    <span className="font-bold text-slate-900 block">4. Pollution Under Control (PUC)</span>
                    <span className="text-slate-500 text-[11px]">Active emissions clearance</span>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">PUC Number</label>
                    <input
                      type="text"
                      value={pucNumber}
                      onChange={(e) => setPucNumber(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Expiry Date</label>
                    <input
                      type="date"
                      value={pucExpiry}
                      onChange={(e) => setPucExpiry(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Commercial Permit */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="sm:col-span-1">
                    <span className="font-bold text-slate-900 block">5. All India Tourist Permit</span>
                    <span className="text-slate-500 text-[11px]">National / State tourist permit</span>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Permit Number</label>
                    <input
                      type="text"
                      value={permitNumber}
                      onChange={(e) => setPermitNumber(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold">Expiry Date</label>
                    <input
                      type="date"
                      value={permitExpiry}
                      onChange={(e) => setPermitExpiry(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PRICING, RADIUS & SUBMISSION */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  5. Pricing & Availability Setup
                </h4>
                <p className="text-xs text-slate-500">
                  Set competitive per-kilometer fares and service coverage radius.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Fare (₹) *</label>
                  <input
                    type="number"
                    value={baseFare}
                    onChange={(e) => setBaseFare(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Per Kilometer Rate (₹/km) *</label>
                  <input
                    type="number"
                    value={perKmRate}
                    onChange={(e) => setPerKmRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driver Daily Allowance (₹) *</label>
                  <input
                    type="number"
                    value={driverAllowance}
                    onChange={(e) => setDriverAllowance(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Radius Coverage (KM) *</label>
                  <input
                    type="number"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  />
                </div>
              </div>

              {/* Commission disclosure card */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Transparent 10% Developer Platform Commission</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  For every completed ride, the platform automatically records a 10% developer fee from the final fare. For example, on a ₹5,000 passenger fare, ₹500 is the platform fee and ₹4,500 is credited to your settlement account.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-submit-vehicle-onboarding"
              onClick={handleSubmitVehicle}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting for Inspection...' : 'Submit Vehicle for Verification'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
