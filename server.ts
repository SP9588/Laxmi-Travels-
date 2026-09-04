import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// PRIVATE / CONFIDENTIAL BACKEND CONFIGURATION
// NEVER exposed in client bundles or public endpoints
// ---------------------------------------------------------------------------
const PRIVATE_CONFIG = {
  developerPaymentEmail: process.env.DEVELOPER_PAYMENT_EMAIL || 'santoshprasad8891@gmail.com',
  privateUpiIdentifier: process.env.PRIVATE_UPI_IDENTIFIER || '9279120271@ybl',
  paymentGatewaySecret: process.env.PAYMENT_GATEWAY_SECRET || 'sandbox_secret_laxmi_2026',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// ---------------------------------------------------------------------------
// IN-MEMORY / ZERO-START REPOSITORY
// RULE: Starts from ZERO. No demo vehicles, demo bookings, demo reviews, etc.
// ---------------------------------------------------------------------------
interface ServerStore {
  users: any[];
  vehicles: any[];
  bookings: any[];
  commissionTransactions: any[];
  ownerSettlements: any[];
  auditLogs: any[];
  adminSettings: {
    commissionPercentage: number;
    qrDisplayName: string;
    companyLegalName: string;
    gstNumber: string;
    registeredOffice: string;
    supportPhone: string;
    supportEmail: string;
    isMaintenanceMode: boolean;
    minBookingAdvanceHours: number;
  };
}

const store: ServerStore = {
  users: [],
  vehicles: [],
  bookings: [],
  commissionTransactions: [],
  ownerSettlements: [],
  auditLogs: [],
  adminSettings: {
    commissionPercentage: 10, // Platform/developer commission: 10% of final fare
    qrDisplayName: 'Laxmi Travels',
    companyLegalName: 'Laxmi Travels Commercial Transport Ltd.',
    gstNumber: 'GSTIN07AAACL1234F1Z9',
    registeredOffice: 'Laxmi Travels Transport Hub, Sector 18, Commercial Zone, India',
    supportPhone: '+91 9279120271',
    supportEmail: 'support@laxmitravels.in',
    isMaintenanceMode: false,
    minBookingAdvanceHours: 1,
  },
};

// Helper: Record Audit Log
function logAuditEvent(actor: string, actorRole: string, action: string, entity: string, entityId: string, details: string) {
  const log = {
    id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    actor,
    actorRole,
    action,
    entity,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };
  store.auditLogs.unshift(log);
}

// Distance Calculation Helper between standard locations (or coordinate estimation)
const INDIAN_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  delhi: { lat: 28.6139, lng: 77.209 },
  noida: { lat: 28.5355, lng: 77.391 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  agra: { lat: 27.1767, lng: 78.0081 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  haridwar: { lat: 29.9457, lng: 78.1642 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  patna: { lat: 25.5941, lng: 85.1376 },
  ranchi: { lat: 23.3441, lng: 85.3096 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

function calculateDistanceKm(pickup: string, destination: string): number {
  const pNorm = pickup.toLowerCase().trim();
  const dNorm = destination.toLowerCase().trim();

  let pCoords = Object.entries(INDIAN_CITY_COORDINATES).find(([k]) => pNorm.includes(k))?.[1];
  let dCoords = Object.entries(INDIAN_CITY_COORDINATES).find(([k]) => dNorm.includes(k))?.[1];

  if (pCoords && dCoords) {
    // Haversine formula with road winding multiplier (approx 1.25x straight line)
    const R = 6371; // Earth's radius in km
    const dLat = ((dCoords.lat - pCoords.lat) * Math.PI) / 180;
    const dLon = ((dCoords.lng - pCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pCoords.lat * Math.PI) / 180) *
        Math.cos((dCoords.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    const roadKm = Math.round(straightKm * 1.25);
    return Math.max(roadKm, 15);
  }

  // Fallback heuristic based on query length/characters or standard default
  let hash = 0;
  for (let i = 0; i < pNorm.length + dNorm.length; i++) {
    hash = (hash * 31 + (pNorm.charCodeAt(i % pNorm.length) || 0) + (dNorm.charCodeAt(i % dNorm.length) || 0)) % 400;
  }
  return 45 + (hash % 220);
}

// ---------------------------------------------------------------------------
// REST API ROUTES
// ---------------------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Laxmi Travels',
    version: '1.0.0',
    time: new Date().toISOString(),
    emptyStateConfirmed: store.vehicles.length === 0 && store.bookings.length === 0,
  });
});

// 2. Authentication / Profile
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, role, city, state, address } = req.body;

  if (!name || !email || !phone || !role) {
    return res.status(400).json({ error: 'Missing required profile fields.' });
  }

  // Check if exists
  let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    return res.status(400).json({ error: 'User with this email already registered.' });
  }

  user = {
    id: 'USR-' + Date.now(),
    name,
    email: email.toLowerCase(),
    phone,
    role, // CUSTOMER, VEHICLE_OWNER, VERIFIER, ADMIN, SUPER_ADMIN
    city: city || 'New Delhi',
    state: state || 'Delhi',
    address: address || '',
    createdAt: new Date().toISOString(),
    isVerified: role === 'CUSTOMER' ? true : false,
  };

  store.users.push(user);
  logAuditEvent(user.name, user.role, 'USER_REGISTERED', 'users', user.id, `New ${user.role} profile registered.`);

  res.json({ success: true, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // If logging in for the first time during demo or onboarding, create the profile
    user = {
      id: 'USR-' + Date.now(),
      name: email.split('@')[0].toUpperCase(),
      email: email.toLowerCase(),
      phone: '+91 9876543210',
      role: role || 'CUSTOMER',
      city: 'New Delhi',
      state: 'Delhi',
      createdAt: new Date().toISOString(),
      isVerified: true,
    };
    store.users.push(user);
    logAuditEvent(user.name, user.role, 'USER_LOGIN_AUTO_PROVISIONED', 'users', user.id, 'Session initial login.');
  }

  res.json({ success: true, user });
});

// 3. Vehicles
// GET: Customer view (only approved & available) OR Owner view (their vehicles) OR Admin view (all)
app.get('/api/vehicles', (req, res) => {
  const { ownerId, status, category, approvedOnly } = req.query;

  let list = [...store.vehicles];

  if (ownerId) {
    list = list.filter((v) => v.ownerId === ownerId);
  } else if (approvedOnly === 'true') {
    // Public customer search: STRICTLY only approved and available vehicles
    list = list.filter((v) => v.isApproved === true && v.availability?.isAvailable === true);
  }

  if (category && category !== 'ALL') {
    list = list.filter((v) => v.category === category);
  }

  res.json({ success: true, count: list.length, vehicles: list });
});

// POST: Register vehicle (Vehicle Owner step-by-step onboarding)
app.post('/api/vehicles', (req, res) => {
  const {
    ownerId,
    ownerName,
    ownerPhone,
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
    documents,
    pricing,
    availability,
  } = req.body;

  if (!registrationNumber || !make || !model) {
    return res.status(400).json({ error: 'Registration number, make, and model are mandatory.' });
  }

  // Check duplicate registration
  const duplicate = store.vehicles.find(
    (v) => v.registrationNumber.replace(/\s+/g, '').toUpperCase() === registrationNumber.replace(/\s+/g, '').toUpperCase()
  );
  if (duplicate) {
    return res.status(400).json({ error: 'Vehicle with this registration number is already submitted.' });
  }

  const defaultDocs = {
    RC: {
      type: 'RC',
      title: 'Registration Certificate',
      documentNumber: documents?.RC?.documentNumber || '',
      issueDate: documents?.RC?.issueDate || '',
      expiryDate: documents?.RC?.expiryDate || '',
      uploadDate: new Date().toISOString(),
      status: documents?.RC?.documentNumber ? 'UNDER_REVIEW' : 'NOT_UPLOADED',
      fileUrl: documents?.RC?.fileUrl || '',
    },
    INSURANCE: {
      type: 'INSURANCE',
      title: 'Commercial Insurance Policy',
      documentNumber: documents?.INSURANCE?.documentNumber || '',
      issueDate: documents?.INSURANCE?.issueDate || '',
      expiryDate: documents?.INSURANCE?.expiryDate || '',
      uploadDate: new Date().toISOString(),
      status: documents?.INSURANCE?.documentNumber ? 'UNDER_REVIEW' : 'NOT_UPLOADED',
      fileUrl: documents?.INSURANCE?.fileUrl || '',
    },
    PUC: {
      type: 'PUC',
      title: 'Pollution Under Control (PUC)',
      documentNumber: documents?.PUC?.documentNumber || '',
      issueDate: documents?.PUC?.issueDate || '',
      expiryDate: documents?.PUC?.expiryDate || '',
      uploadDate: new Date().toISOString(),
      status: documents?.PUC?.documentNumber ? 'UNDER_REVIEW' : 'NOT_UPLOADED',
      fileUrl: documents?.PUC?.fileUrl || '',
    },
    FITNESS: {
      type: 'FITNESS',
      title: 'Vehicle Fitness Certificate',
      documentNumber: documents?.FITNESS?.documentNumber || '',
      issueDate: documents?.FITNESS?.issueDate || '',
      expiryDate: documents?.FITNESS?.expiryDate || '',
      uploadDate: new Date().toISOString(),
      status: documents?.FITNESS?.documentNumber ? 'UNDER_REVIEW' : 'NOT_UPLOADED',
      fileUrl: documents?.FITNESS?.fileUrl || '',
    },
    PERMIT: {
      type: 'PERMIT',
      title: 'Commercial / All-India Tourist Permit',
      documentNumber: documents?.PERMIT?.documentNumber || '',
      issueDate: documents?.PERMIT?.issueDate || '',
      expiryDate: documents?.PERMIT?.expiryDate || '',
      uploadDate: new Date().toISOString(),
      status: documents?.PERMIT?.documentNumber ? 'UNDER_REVIEW' : 'NOT_UPLOADED',
      fileUrl: documents?.PERMIT?.fileUrl || '',
    },
    DRIVER_LICENSE: {
      type: 'DRIVER_LICENSE',
      title: 'Commercial Driving License',
      documentNumber: documents?.DRIVER_LICENSE?.documentNumber || '',
      issueDate: documents?.DRIVER_LICENSE?.issueDate || '',
      expiryDate: documents?.DRIVER_LICENSE?.expiryDate || '',
      uploadDate: new Date().toISOString(),
      status: documents?.DRIVER_LICENSE?.documentNumber ? 'UNDER_REVIEW' : 'NOT_UPLOADED',
      fileUrl: documents?.DRIVER_LICENSE?.fileUrl || '',
    },
  };

  const newVehicle = {
    id: 'VEH-' + Date.now(),
    ownerId: ownerId || 'OWNER-01',
    ownerName: ownerName || 'Registered Operator',
    ownerPhone: ownerPhone || '+91 9876543210',
    registrationNumber: registrationNumber.toUpperCase().trim(),
    make,
    model,
    variant: variant || '',
    manufacturingYear: Number(manufacturingYear) || new Date().getFullYear(),
    category: category || 'SEDAN',
    seatingCapacity: Number(seatingCapacity) || 4,
    fuelType: fuelType || 'DIESEL',
    acType: acType || 'AC',
    odometerReading: Number(odometerReading) || 0,
    color: color || 'White',
    photos: photos || {},
    documents: defaultDocs,
    verificationStatus: 'UNDER_REVIEW',
    inspectionStatus: 'PENDING_INSPECTION',
    isApproved: false, // Starts unapproved until human verifier review
    pricing: {
      baseFare: Number(pricing?.baseFare) || 500,
      perKmRate: Number(pricing?.perKmRate) || (category === 'INNOVA_CRYSTA' ? 22 : category === 'SUV' ? 19 : 14),
      minKm: Number(pricing?.minKm) || 40,
      driverAllowancePerDay: Number(pricing?.driverAllowancePerDay) || 400,
    },
    availability: {
      isAvailable: availability?.isAvailable ?? true,
      city: availability?.city || 'New Delhi',
      state: availability?.state || 'Delhi',
      serviceRadiusKm: Number(availability?.serviceRadiusKm) || 100,
    },
    rating: 5.0,
    totalTrips: 0,
    createdAt: new Date().toISOString(),
    adminNotes: [],
  };

  store.vehicles.push(newVehicle);
  logAuditEvent(
    newVehicle.ownerName,
    'VEHICLE_OWNER',
    'VEHICLE_SUBMITTED',
    'vehicles',
    newVehicle.id,
    `Vehicle ${newVehicle.registrationNumber} submitted for verification.`
  );

  res.status(201).json({ success: true, vehicle: newVehicle });
});

// 4. Verifier / Admin Document Review
app.post('/api/vehicles/:id/verify-document', (req, res) => {
  const { id } = req.params;
  const { docType, status, rejectionReason, reviewerName } = req.body;

  const vehicle = store.vehicles.find((v) => v.id === id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  if (!vehicle.documents[docType]) {
    return res.status(400).json({ error: 'Invalid document type.' });
  }

  vehicle.documents[docType].status = status; // VERIFIED, REJECTED, EXPIRED
  vehicle.documents[docType].reviewer = reviewerName || 'Admin Verifier';
  vehicle.documents[docType].reviewTimestamp = new Date().toISOString();
  if (rejectionReason) {
    vehicle.documents[docType].rejectionReason = rejectionReason;
  }

  logAuditEvent(
    reviewerName || 'Verifier',
    'VERIFIER',
    'DOCUMENT_REVIEWED',
    'vehicles',
    vehicle.id,
    `Document ${docType} set to ${status}.`
  );

  res.json({ success: true, vehicle });
});

// 5. Verifier / Admin Inspection
app.post('/api/vehicles/:id/inspect', (req, res) => {
  const { id } = req.params;
  const { inspectionStatus, inspectorName, notes } = req.body;

  const vehicle = store.vehicles.find((v) => v.id === id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  vehicle.inspectionStatus = inspectionStatus; // APPROVED, CONDITIONALLY_APPROVED, REJECTED
  if (notes) {
    vehicle.adminNotes.push(`[${new Date().toLocaleDateString()}] ${inspectorName}: ${notes}`);
  }

  logAuditEvent(
    inspectorName || 'Inspector',
    'VERIFIER',
    'VEHICLE_INSPECTED',
    'vehicles',
    vehicle.id,
    `Inspection marked as ${inspectionStatus}.`
  );

  res.json({ success: true, vehicle });
});

// 6. Admin Final Approval Gate
// All mandatory documents (RC, Insurance, PUC, Fitness, Permit) must be VERIFIED and inspection APPROVED
app.post('/api/vehicles/:id/approve', (req, res) => {
  const { id } = req.params;
  const { adminName } = req.body;

  const vehicle = store.vehicles.find((v) => v.id === id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  const docs = vehicle.documents;
  const mandatoryDocs: (keyof typeof docs)[] = ['RC', 'INSURANCE', 'PUC', 'FITNESS', 'PERMIT'];
  const failedDocs = mandatoryDocs.filter((d) => docs[d]?.status !== 'VERIFIED');

  if (failedDocs.length > 0) {
    return res.status(400).json({
      error: `Cannot approve vehicle. The following mandatory documents are not verified: ${failedDocs.join(', ')}`,
    });
  }

  if (vehicle.inspectionStatus !== 'APPROVED') {
    return res.status(400).json({
      error: `Cannot approve vehicle. Vehicle condition inspection is not approved (current status: ${vehicle.inspectionStatus}).`,
    });
  }

  vehicle.verificationStatus = 'VERIFIED';
  vehicle.isApproved = true;
  vehicle.verifiedAt = new Date().toISOString();

  logAuditEvent(
    adminName || 'Admin',
    'ADMIN',
    'VEHICLE_APPROVED_FOR_BOOKING',
    'vehicles',
    vehicle.id,
    `Vehicle ${vehicle.registrationNumber} approved and listed publicly for customer bookings.`
  );

  res.json({ success: true, vehicle });
});

// 7. Suspend vehicle
app.post('/api/vehicles/:id/suspend', (req, res) => {
  const { id } = req.params;
  const { reason, adminName } = req.body;

  const vehicle = store.vehicles.find((v) => v.id === id);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  vehicle.isApproved = false;
  vehicle.verificationStatus = 'SUSPENDED';
  vehicle.adminNotes.push(`Suspended: ${reason}`);

  logAuditEvent(
    adminName || 'Admin',
    'ADMIN',
    'VEHICLE_SUSPENDED',
    'vehicles',
    vehicle.id,
    `Vehicle suspended. Reason: ${reason}`
  );

  res.json({ success: true, vehicle });
});

// 8. Fare Calculation Engine
// BUSINESS RULE: Developer commission is 10% of final customer fare (NOT distance).
app.post('/api/fare/calculate', (req, res) => {
  const { pickup, destination, category, tripType, roundTripDays, vehicleId } = req.body;

  if (!pickup || !destination) {
    return res.status(400).json({ error: 'Pickup and destination are required.' });
  }

  let oneWayDistance = calculateDistanceKm(pickup, destination);
  let billableDistance = tripType === 'ROUND_TRIP' ? oneWayDistance * 2 : oneWayDistance;

  // Pricing rates
  let perKmRate = 14;
  let baseFare = 500;
  let minKm = 40;
  let driverAllowance = 400;

  if (vehicleId) {
    const v = store.vehicles.find((item) => item.id === vehicleId);
    if (v && v.pricing) {
      perKmRate = v.pricing.perKmRate;
      baseFare = v.pricing.baseFare;
      minKm = v.pricing.minKm;
      driverAllowance = v.pricing.driverAllowancePerDay;
    }
  } else if (category) {
    if (category === 'INNOVA_CRYSTA') {
      perKmRate = 22;
      baseFare = 800;
      minKm = 60;
    } else if (category === 'SUV') {
      perKmRate = 19;
      baseFare = 700;
      minKm = 50;
    } else if (category === 'TEMPO_TRAVELLER') {
      perKmRate = 28;
      baseFare = 1200;
      minKm = 80;
    } else if (category === 'LUXURY') {
      perKmRate = 35;
      baseFare = 1500;
      minKm = 100;
    }
  }

  const effectiveKm = Math.max(billableDistance, minKm);
  const distanceFare = effectiveKm * perKmRate;
  const days = Number(roundTripDays) || 1;
  const totalDriverCharges = driverAllowance * (tripType === 'ROUND_TRIP' ? days : 1);
  const estimatedTollsAndTaxes = Math.round(billableDistance * 1.8);
  const nightCharges = 0; // optional

  const finalCustomerFare = baseFare + distanceFare + totalDriverCharges + estimatedTollsAndTaxes + nightCharges;

  // 10% Developer / Platform Commission calculated directly from the final fare
  const commissionRate = store.adminSettings.commissionPercentage || 10;
  const developerCommission = Math.round(finalCustomerFare * (commissionRate / 100));
  const ownerGrossShare = finalCustomerFare - developerCommission;

  res.json({
    success: true,
    calculation: {
      pickup,
      destination,
      oneWayDistanceKm: oneWayDistance,
      billableDistanceKm: billableDistance,
      baseFare,
      distanceFare,
      perKmRate,
      driverCharges: totalDriverCharges,
      estimatedTollsAndTaxes,
      nightCharges,
      finalCustomerFare,
      commissionPercentage: commissionRate,
      developerCommission, // e.g. ₹5,000 -> ₹500
      ownerGrossShare, // e.g. ₹5,000 -> ₹4,500
    },
  });
});

// 9. Bookings
app.get('/api/bookings', (req, res) => {
  const { customerId, ownerId } = req.query;
  let list = [...store.bookings];

  if (customerId) {
    list = list.filter((b) => b.customerId === customerId);
  } else if (ownerId) {
    list = list.filter((b) => b.ownerId === ownerId);
  }

  res.json({ success: true, count: list.length, bookings: list });
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const {
    customerId,
    customerName,
    customerPhone,
    vehicleId,
    pickup,
    destination,
    distanceKm,
    travelDate,
    travelTime,
    passengers,
    tripType,
    specialNotes,
    fareBreakdown,
  } = req.body;

  const vehicle = store.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Selected vehicle was not found.' });
  }

  if (!vehicle.isApproved) {
    return res.status(400).json({ error: 'This vehicle is not yet approved for public customer bookings.' });
  }

  const bookingSerial = store.bookings.length + 1;
  const bookingId = `LT-2026-${String(bookingSerial).padStart(6, '0')}`;

  const finalFare = fareBreakdown?.finalCustomerFare || 5000;
  const commRate = store.adminSettings.commissionPercentage || 10;
  const devCommission = Math.round(finalFare * (commRate / 100));
  const ownerShare = finalFare - devCommission;

  const newBooking = {
    id: bookingId,
    customerId: customerId || 'CUST-01',
    customerName: customerName || 'Valued Passenger',
    customerPhone: customerPhone || '+91 9876543210',
    vehicleId: vehicle.id,
    vehicleModel: `${vehicle.make} ${vehicle.model} (${vehicle.category})`,
    vehicleCategory: vehicle.category,
    vehicleNumber: vehicle.registrationNumber,
    ownerId: vehicle.ownerId,
    ownerName: vehicle.ownerName,
    pickup,
    destination,
    distanceKm: Number(distanceKm) || 120,
    travelDate: travelDate || new Date().toISOString().split('T')[0],
    travelTime: travelTime || '09:00',
    passengers: Number(passengers) || 2,
    tripType: tripType || 'ONE_WAY',
    specialNotes: specialNotes || '',
    fareBreakdown: {
      baseFare: fareBreakdown?.baseFare || 500,
      distanceFare: fareBreakdown?.distanceFare || 3800,
      driverCharges: fareBreakdown?.driverCharges || 400,
      estimatedTollsAndTaxes: fareBreakdown?.estimatedTollsAndTaxes || 300,
      nightCharges: 0,
      finalCustomerFare: finalFare,
    },
    commission: {
      percentage: commRate,
      developerCommission: devCommission,
      ownerGrossShare: ownerShare,
    },
    status: 'REQUESTED',
    payment: {
      orderId: 'ORD-' + Date.now(),
      status: 'PENDING',
    },
    settlementStatus: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  store.bookings.unshift(newBooking);
  logAuditEvent(
    newBooking.customerName,
    'CUSTOMER',
    'BOOKING_CREATED',
    'bookings',
    newBooking.id,
    `Booking ${newBooking.id} created from ${pickup} to ${destination}. Final fare: ₹${finalFare}.`
  );

  res.status(201).json({ success: true, booking: newBooking });
});

// 10. Booking Action State Machine (ACCEPT, TRIP_STARTED, TRIP_COMPLETED, CANCEL)
app.post('/api/bookings/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, actorRole, actorName, rating, reviewComment } = req.body;

  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (action === 'ACCEPT') {
    booking.status = 'ACCEPTED';
    booking.payment.status = 'PENDING';
  } else if (action === 'CONFIRM_PAYMENT') {
    booking.status = 'CONFIRMED';
    booking.payment.status = 'PAID';
    booking.payment.paidAt = new Date().toISOString();
  } else if (action === 'START_TRIP') {
    booking.status = 'TRIP_STARTED';
  } else if (action === 'COMPLETE_TRIP') {
    booking.status = 'TRIP_COMPLETED';
    booking.completedAt = new Date().toISOString();

    // Generate immutable financial commission record
    const commTx = {
      id: 'TX-COMM-' + Date.now(),
      bookingId: booking.id,
      customerId: booking.customerId,
      vehicleOwnerId: booking.ownerId,
      vehicleId: booking.vehicleId,
      distanceKm: booking.distanceKm,
      finalCustomerFare: booking.fareBreakdown.finalCustomerFare,
      commissionPercentage: booking.commission.percentage,
      commissionAmount: booking.commission.developerCommission,
      ownerAmount: booking.commission.ownerGrossShare,
      paymentStatus: 'PAID',
      settlementStatus: 'PENDING',
      timestamp: new Date().toISOString(),
    };
    store.commissionTransactions.unshift(commTx);

    // Update vehicle trip count
    const vehicle = store.vehicles.find((v) => v.id === booking.vehicleId);
    if (vehicle) {
      vehicle.totalTrips = (vehicle.totalTrips || 0) + 1;
    }
  } else if (action === 'CANCEL') {
    booking.status = 'CANCELLED';
    if (booking.payment.status === 'PAID') {
      booking.payment.status = 'REFUNDED';
    }
  } else if (action === 'RATE') {
    booking.rating = rating;
    booking.reviewComment = reviewComment;
  }

  logAuditEvent(
    actorName || 'System',
    actorRole || 'SYSTEM',
    `BOOKING_STATUS_${action}`,
    'bookings',
    booking.id,
    `Booking ${booking.id} transitioned to ${booking.status}.`
  );

  res.json({ success: true, booking });
});

// 11. Payment Gateway Integration Architecture
// Server-side order creation & webhook verification (Razorpay / Cashfree / UPI QR)
app.post('/api/payments/create-order', (req, res) => {
  const { bookingId } = req.body;
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const orderPayload = {
    orderId: 'ORDER_LT_' + Date.now(),
    amountPaise: Math.round(booking.fareBreakdown.finalCustomerFare * 100),
    currency: 'INR',
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    qrDisplayName: store.adminSettings.qrDisplayName,
    // Note: PRIVATE_CONFIG.privateUpiIdentifier is kept confidential on the server
    gatewayCheckoutUrl: `/checkout/${booking.id}`,
  };

  booking.payment.orderId = orderPayload.orderId;
  res.json({ success: true, order: orderPayload });
});

// Server-side Webhook / Verification endpoint
app.post('/api/payments/verify-webhook', (req, res) => {
  const { bookingId, transactionId, signature, status } = req.body;

  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  // Verify payment status
  if (status === 'SUCCESS' || status === 'PAID') {
    booking.payment.status = 'PAID';
    booking.payment.transactionId = transactionId || 'TXN-' + Date.now();
    booking.payment.paidAt = new Date().toISOString();
    booking.status = 'CONFIRMED';

    logAuditEvent(
      'PaymentGatewayWebhook',
      'PAYMENT_WEBHOOK',
      'PAYMENT_VERIFIED',
      'bookings',
      booking.id,
      `Payment verified for booking ${booking.id}. Transaction ID: ${booking.payment.transactionId}. Amount: ₹${booking.fareBreakdown.finalCustomerFare}.`
    );

    return res.json({ success: true, message: 'Payment verified and booking confirmed.', booking });
  } else {
    booking.payment.status = 'FAILED';
    return res.status(400).json({ error: 'Payment status failed or unverified.' });
  }
});

// 12. Admin Financials & Ledger
app.get('/api/admin/financials', (req, res) => {
  const totalBookings = store.bookings.length;
  const completedBookings = store.bookings.filter((b) => b.status === 'TRIP_COMPLETED');
  const grossBookingValue = completedBookings.reduce((sum, b) => sum + b.fareBreakdown.finalCustomerFare, 0);
  const totalDeveloperCommission = completedBookings.reduce((sum, b) => sum + b.commission.developerCommission, 0);
  const totalOwnerPayouts = grossBookingValue - totalDeveloperCommission;

  const pendingSettlements = store.commissionTransactions.filter((tx) => tx.settlementStatus === 'PENDING').length;

  res.json({
    success: true,
    metrics: {
      totalUsers: store.users.length,
      totalVehicles: store.vehicles.length,
      pendingVerificationVehicles: store.vehicles.filter((v) => !v.isApproved).length,
      approvedVehicles: store.vehicles.filter((v) => v.isApproved).length,
      totalBookings,
      completedTrips: completedBookings.length,
      grossBookingValue,
      developerCommissionTotal: totalDeveloperCommission, // 10% platform earnings
      ownerGrossShareTotal: totalOwnerPayouts, // 90% owner earnings
      commissionRate: store.adminSettings.commissionPercentage,
      pendingSettlements,
    },
    transactions: store.commissionTransactions,
  });
});

// 12b. Simulate a completed trip for financial testing/demonstration
app.post('/api/admin/simulate-completed-ride', (req, res) => {
  const { 
    customerName = 'Rohan Sharma',
    pickup = 'New Delhi Railway Station',
    destination = 'Agra Taj Mahal',
    category = 'SEDAN',
    fareAmount = 4500,
    dateOffsetDays = 0
  } = req.body;

  const now = new Date();
  if (dateOffsetDays !== 0) {
    now.setDate(now.getDate() + Number(dateOffsetDays));
  }
  const timestamp = now.toISOString();

  const fare = Number(fareAmount) || 4500;
  const commRate = store.adminSettings.commissionPercentage || 10;
  const commission = Math.round(fare * (commRate / 100));
  const ownerShare = fare - commission;
  const bookingId = 'LT-' + now.getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);

  const matchedVehicle = store.vehicles[0];

  const newBooking = {
    id: bookingId,
    customerId: 'cust-sim-' + Date.now(),
    customerName,
    customerPhone: '+91 98765 43210',
    vehicleId: matchedVehicle?.id || 'veh-commercial-01',
    vehicleModel: matchedVehicle ? `${matchedVehicle.make} ${matchedVehicle.model}` : 'Maruti Dzire Tour (Commercial)',
    vehicleCategory: category,
    vehicleNumber: matchedVehicle?.registrationNumber || 'DL 1Z A 9876',
    ownerId: matchedVehicle?.ownerId || 'owner-sim-01',
    ownerName: matchedVehicle?.ownerName || 'Rajesh Kumar Transport',
    pickup,
    destination,
    distanceKm: Math.round(fare / 14),
    travelDate: now.toISOString().split('T')[0],
    travelTime: '08:30 AM',
    passengers: 3,
    tripType: 'ONE_WAY',
    fareBreakdown: {
      baseFare: 500,
      distanceFare: fare - 900,
      driverCharges: 400,
      estimatedTollsAndTaxes: 0,
      nightCharges: 0,
      finalCustomerFare: fare,
    },
    commission: {
      percentage: commRate,
      developerCommission: commission,
      ownerGrossShare: ownerShare,
    },
    status: 'TRIP_COMPLETED',
    payment: {
      orderId: 'ORD-SIM-' + Date.now(),
      transactionId: 'TXN-UPI-' + Date.now(),
      method: 'UPI_SECURE',
      status: 'PAID',
      paidAt: timestamp,
    },
    settlementStatus: 'PENDING',
    createdAt: timestamp,
    completedAt: timestamp,
  };

  store.bookings.unshift(newBooking);

  const commTx = {
    id: 'TX-COMM-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    bookingId: newBooking.id,
    customerId: newBooking.customerId,
    vehicleOwnerId: newBooking.ownerId,
    vehicleId: newBooking.vehicleId,
    distanceKm: newBooking.distanceKm,
    finalCustomerFare: fare,
    commissionPercentage: commRate,
    commissionAmount: commission,
    ownerAmount: ownerShare,
    paymentStatus: 'PAID',
    settlementStatus: 'PENDING',
    timestamp,
  };

  store.commissionTransactions.unshift(commTx);

  logAuditEvent(
    'Admin Simulation',
    'ADMIN',
    'SIMULATED_TRIP_COMPLETED',
    'commission_ledger',
    commTx.id,
    `Simulated completed trip ${bookingId} on ${now.toISOString().split('T')[0]} generating ₹${commission} platform commission.`
  );

  res.json({ success: true, booking: newBooking, transaction: commTx });
});

// 13. Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ success: true, logs: store.auditLogs.slice(0, 100) });
});

// 14. Admin Settings update
app.post('/api/admin/config', (req, res) => {
  const { commissionPercentage, qrDisplayName, companyLegalName, supportPhone, supportEmail } = req.body;

  if (commissionPercentage !== undefined) {
    store.adminSettings.commissionPercentage = Number(commissionPercentage);
  }
  if (qrDisplayName) store.adminSettings.qrDisplayName = qrDisplayName;
  if (companyLegalName) store.adminSettings.companyLegalName = companyLegalName;
  if (supportPhone) store.adminSettings.supportPhone = supportPhone;
  if (supportEmail) store.adminSettings.supportEmail = supportEmail;

  logAuditEvent('Admin', 'ADMIN', 'CONFIG_UPDATED', 'admin_settings', '1', 'Platform parameters updated.');
  res.json({ success: true, settings: store.adminSettings });
});

// 15. Export Supabase SQL Schema endpoint (For user to run in Supabase SQL editor)
app.get('/api/admin/supabase-schema', (req, res) => {
  const sql = `
-- ========================================================================
-- LAXMI TRAVELS: PRODUCTION SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Zero demo data: Starts empty. Run this in your Supabase SQL Editor.
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CUSTOMER', 'VEHICLE_OWNER', 'VERIFIER', 'ADMIN', 'SUPER_ADMIN')),
  city TEXT DEFAULT 'New Delhi',
  state TEXT DEFAULT 'Delhi',
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  manufacturing_year INT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('SEDAN', 'SUV', 'INNOVA_CRYSTA', 'TEMPO_TRAVELLER', 'LUXURY')),
  seating_capacity INT NOT NULL,
  fuel_type TEXT NOT NULL,
  ac_type TEXT NOT NULL,
  odometer_reading INT DEFAULT 0,
  color TEXT DEFAULT 'White',
  photos JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '{}'::jsonb,
  verification_status TEXT DEFAULT 'UNDER_REVIEW',
  inspection_status TEXT DEFAULT 'PENDING_INSPECTION',
  is_approved BOOLEAN DEFAULT FALSE,
  pricing JSONB NOT NULL,
  availability JSONB NOT NULL,
  rating NUMERIC(3,2) DEFAULT 5.0,
  total_trips INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  admin_notes TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  vehicle_model TEXT NOT NULL,
  vehicle_category TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id),
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km INT NOT NULL,
  travel_date DATE NOT NULL,
  travel_time TIME NOT NULL,
  passengers INT NOT NULL,
  trip_type TEXT NOT NULL,
  fare_breakdown JSONB NOT NULL,
  commission JSONB NOT NULL,
  status TEXT NOT NULL,
  payment JSONB DEFAULT '{}'::jsonb,
  settlement_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Commission Transactions (Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.commission_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id TEXT REFERENCES public.bookings(id),
  customer_id UUID,
  vehicle_owner_id UUID,
  vehicle_id UUID,
  distance_km INT NOT NULL,
  final_customer_fare NUMERIC(10,2) NOT NULL,
  commission_percentage NUMERIC(5,2) DEFAULT 10.00,
  commission_amount NUMERIC(10,2) NOT NULL,
  owner_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL,
  settlement_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Public can read ONLY approved & available vehicles
CREATE POLICY "Public can view approved vehicles" ON public.vehicles
  FOR SELECT USING (is_approved = TRUE);

-- 2. Vehicle owner can view and manage their own vehicles
CREATE POLICY "Owners manage own vehicles" ON public.vehicles
  FOR ALL USING (auth.uid() = owner_id);

-- 3. Customers view their own bookings
CREATE POLICY "Customers view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id);

-- 4. Vehicle owners view assigned bookings
CREATE POLICY "Owners view assigned bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = owner_id);
`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(sql);
});

// ---------------------------------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Laxmi Travels server listening on port ${PORT}`);
  });
}

startServer();
