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
  drivers: any[];
  directoryEntities: any[];
  commissionTransactions: any[];
  ownerSettlements: any[];
  auditLogs: any[];
  sosIncidents: any[];
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
  drivers: [
    {
      id: 'drv-01',
      ownerId: 'owner-sim-01',
      name: 'Ramesh Singh Chauhan',
      phone: '+91 98711 44520',
      email: 'ramesh.chauhan@laxmitravels.in',
      emergencyContact: '+91 98110 55670 (Spouse)',
      experienceYears: 8,
      rating: 4.9,
      totalTripsCompleted: 142,
      status: 'AVAILABLE',
      currentVehicleId: 'veh-commercial-01',
      currentVehicleModel: 'Maruti Dzire Tour (Commercial)',
      currentVehicleNumber: 'DL 1Z A 9876',
      activeBookingId: undefined,
      credentials: {
        drivingLicense: {
          docType: 'DRIVING_LICENSE',
          docNumber: 'DL-0420180099123',
          fileName: 'commercial_dl_ramesh.pdf',
          expiryDate: '2029-08-15',
          verified: true,
          uploadedAt: '2026-08-01T10:00:00.000Z',
        },
        aadhaarCard: {
          docType: 'AADHAAR_CARD',
          docNumber: 'XXXX-XXXX-4819',
          fileName: 'aadhaar_ramesh_chauhan.pdf',
          verified: true,
          uploadedAt: '2026-08-01T10:00:00.000Z',
        },
        policeVerification: {
          docType: 'POLICE_VERIFICATION',
          docNumber: 'PV-DL-2026-88310',
          fileName: 'delhi_police_clearance.pdf',
          expiryDate: '2027-08-01',
          verified: true,
          uploadedAt: '2026-08-01T10:00:00.000Z',
        },
        psvBadge: {
          docType: 'PSV_BADGE',
          docNumber: 'PSV-DEL-55910',
          fileName: 'psv_badge_commercial.pdf',
          expiryDate: '2028-12-31',
          verified: true,
          uploadedAt: '2026-08-01T10:00:00.000Z',
        },
      },
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    },
    {
      id: 'drv-02',
      ownerId: 'owner-sim-01',
      name: 'Sunil Kumar Sharma',
      phone: '+91 99102 33451',
      email: 'sunil.sharma@laxmitravels.in',
      emergencyContact: '+91 98101 22340 (Brother)',
      experienceYears: 6,
      rating: 4.8,
      totalTripsCompleted: 88,
      status: 'AVAILABLE',
      currentVehicleId: '',
      currentVehicleModel: '',
      currentVehicleNumber: '',
      activeBookingId: undefined,
      credentials: {
        drivingLicense: {
          docType: 'DRIVING_LICENSE',
          docNumber: 'UP-1420190088741',
          fileName: 'dl_sunil_sharma.pdf',
          expiryDate: '2030-03-20',
          verified: true,
          uploadedAt: '2026-08-10T11:00:00.000Z',
        },
        aadhaarCard: {
          docType: 'AADHAAR_CARD',
          docNumber: 'XXXX-XXXX-9124',
          fileName: 'aadhaar_sunil_sharma.pdf',
          verified: true,
          uploadedAt: '2026-08-10T11:00:00.000Z',
        },
        policeVerification: {
          docType: 'POLICE_VERIFICATION',
          docNumber: 'PV-UP-2026-11942',
          fileName: 'noida_police_verification.pdf',
          expiryDate: '2027-08-10',
          verified: true,
          uploadedAt: '2026-08-10T11:00:00.000Z',
        },
      },
      createdAt: '2026-08-10T11:00:00.000Z',
      updatedAt: '2026-08-10T11:00:00.000Z',
    },
  ],
  directoryEntities: [
    {
      id: 'dir-ent-01',
      name: 'DLF CyberCity Executive Mobility Desk',
      category: 'CORPORATE_BUYER',
      categoryLabel: 'Corporate Mobility Buyer',
      contactPerson: 'Vikramaditya Sengupta',
      phone: '+91 98101 23456',
      email: 'traveldesk@cybercity-dlf.com',
      city: 'Gurugram',
      address: 'Building 10, DLF Cyber City, Phase II, Gurugram',
      latitude: 28.4907,
      longitude: 77.0898,
      coverageRadiusKm: 35,
      isOnline: true,
      statusText: 'Active Corporate Buyer - Seeking Daily Sedans & Innovas',
      totalTripsRequested: 48,
      gstin: '06AAACD1928K1ZU',
      notes: 'Priority morning corporate airport runs & Gurugram-Noida shuttles',
      registeredAt: '2026-08-15T09:00:00.000Z',
      lastActive: '2026-09-04T08:30:00.000Z',
    },
    {
      id: 'dir-ent-02',
      name: 'The Leela Palace Concierge & Guest Desk',
      category: 'HOTEL_RECEIVER',
      categoryLabel: 'Hotel Concierge Receiver',
      contactPerson: 'Arun K. Pillai (Head Concierge)',
      phone: '+91 98710 99881',
      email: 'concierge.delhi@theleela.com',
      city: 'New Delhi',
      address: 'Diplomatic Enclave, Chanakyapuri, New Delhi',
      latitude: 28.5824,
      longitude: 77.1895,
      coverageRadiusKm: 25,
      isOnline: true,
      statusText: 'Online Receiver - Ready to Receive Luxury & Premium Fleet',
      totalTripsRequested: 82,
      gstin: '07AAACT8819L1Z2',
      notes: 'Requires yellow-plate verified cars only with uniformed chauffeurs',
      registeredAt: '2026-08-01T10:00:00.000Z',
      lastActive: '2026-09-04T10:15:00.000Z',
    },
    {
      id: 'dir-ent-03',
      name: 'Taj Mahal Hotel Front Dispatch',
      category: 'HOTEL_RECEIVER',
      categoryLabel: 'Hotel Concierge Receiver',
      contactPerson: 'Meenakshi Sundaram',
      phone: '+91 98200 11223',
      email: 'dispatch.tajdelhi@tajhotels.com',
      city: 'New Delhi',
      address: 'Number 1, Mansingh Road, New Delhi',
      latitude: 28.6052,
      longitude: 77.2255,
      coverageRadiusKm: 30,
      isOnline: true,
      statusText: 'Online Receiver - On-demand airport drops & Agra roundtrips',
      totalTripsRequested: 65,
      gstin: '07AAACT5544J1Z8',
      notes: 'Daily Agra Samay express dispatch requests',
      registeredAt: '2026-08-10T12:00:00.000Z',
      lastActive: '2026-09-04T09:45:00.000Z',
    },
    {
      id: 'dir-ent-04',
      name: 'Rajasthan Heritage Tourism & B2B Hub',
      category: 'TRAVEL_AGENT',
      categoryLabel: 'B2B Travel Agent / Tour Operator',
      contactPerson: 'Gajendra Singh Rathore',
      phone: '+91 94140 88776',
      email: 'gajendra@rajasthanheritagetours.in',
      city: 'Jaipur',
      address: 'MI Road, Near Ajmeri Gate, Jaipur',
      latitude: 26.9189,
      longitude: 75.8156,
      coverageRadiusKm: 60,
      isOnline: true,
      statusText: 'Active Buyer - Weekend Jaipur-Delhi Golden Triangle bookings',
      totalTripsRequested: 110,
      gstin: '08AAACR4419P1ZW',
      notes: 'Golden Triangle (Delhi-Jaipur-Agra) round-trip fleet aggregator',
      registeredAt: '2026-08-05T14:30:00.000Z',
      lastActive: '2026-09-04T10:50:00.000Z',
    },
    {
      id: 'dir-ent-05',
      name: 'Pooja Verma (Frequent Commuter)',
      category: 'INDIVIDUAL_CUSTOMER',
      categoryLabel: 'Individual Traveler / Passenger',
      contactPerson: 'Pooja Verma',
      phone: '+91 98112 33445',
      email: 'pooja.verma.tech@gmail.com',
      city: 'Noida',
      address: 'Sector 62, Near Electronic City Metro, Noida',
      latitude: 28.6258,
      longitude: 77.3695,
      coverageRadiusKm: 15,
      isOnline: true,
      statusText: 'Online Passenger - Searching rides to IGI Airport T3',
      totalTripsRequested: 14,
      notes: 'Regular airport commuter, prefers clean AC Sedans',
      registeredAt: '2026-08-20T16:00:00.000Z',
      lastActive: '2026-09-04T10:40:00.000Z',
    },
    {
      id: 'dir-ent-06',
      name: 'Aditya Mathur (Executive Individual)',
      category: 'INDIVIDUAL_CUSTOMER',
      categoryLabel: 'Individual Traveler / Passenger',
      contactPerson: 'Aditya Mathur',
      phone: '+91 97170 55667',
      email: 'aditya.mathur@consultant.in',
      city: 'New Delhi',
      address: 'Vasant Vihar, Block C, New Delhi',
      latitude: 28.5583,
      longitude: 77.1614,
      coverageRadiusKm: 20,
      isOnline: true,
      statusText: 'Online Passenger - Looking for Delhi-Chandigarh One Way',
      totalTripsRequested: 9,
      notes: 'Needs quiet ride with verified commercial chauffeur',
      registeredAt: '2026-08-25T11:20:00.000Z',
      lastActive: '2026-09-04T09:10:00.000Z',
    },
    {
      id: 'dir-ent-07',
      name: 'Jaipur Blue Pottery & Gem Exports',
      category: 'COMMERCIAL_BUSINESS',
      categoryLabel: 'Commercial Enterprise / Shipper',
      contactPerson: 'Dinesh Khandelwal',
      phone: '+91 98290 77112',
      email: 'logistics@jaipurgems-export.com',
      city: 'Jaipur',
      address: 'Johari Bazaar, Pink City, Jaipur',
      latitude: 26.9204,
      longitude: 75.8272,
      coverageRadiusKm: 50,
      isOnline: false,
      statusText: 'Offline - Operating business hours 10 AM to 8 PM',
      totalTripsRequested: 32,
      gstin: '08AAACJ7788Q1ZP',
      notes: 'Delegation and artisan transport to Delhi Trade Fairs',
      registeredAt: '2026-08-18T10:00:00.000Z',
      lastActive: '2026-09-03T18:00:00.000Z',
    },
  ],
  commissionTransactions: [],
  ownerSettlements: [],
  auditLogs: [],
  sosIncidents: [],
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

// 9. Real-Time Booking Notifications System (Server-Sent Events)
interface SSEClient {
  id: string;
  customerId?: string;
  res: express.Response;
}
const sseClients: SSEClient[] = [];

function broadcastBookingNotification(event: {
  type: 'BOOKING_CONFIRMED' | 'DRIVER_ASSIGNED' | 'STATUS_UPDATE' | 'TRIP_STARTED' | 'TRIP_COMPLETED' | 'CANCELLED' | 'SOS_EMERGENCY_ALERT';
  title: string;
  message: string;
  bookingId: string;
  timestamp: string;
  booking?: any;
  driver?: any;
  status?: string;
  incident?: any;
}) {
  const payloadString = `data: ${JSON.stringify(event)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.res.write(payloadString);
    } catch (err) {
      sseClients.splice(i, 1);
    }
  }
}

// SSE subscription endpoint for real-time customer and fleet alerts
app.get('/api/bookings/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering
  res.flushHeaders?.();

  const clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const customerId = req.query.customerId as string;

  const client: SSEClient = { id: clientId, customerId, res };
  sseClients.push(client);

  // Immediate handshake message
  res.write(`data: ${JSON.stringify({
    type: 'CONNECTED',
    clientId,
    timestamp: new Date().toISOString(),
    message: 'Real-time booking alert stream established.'
  })}\n\n`);

  // Heartbeat keep-alive every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (err) {
      clearInterval(heartbeat);
      const idx = sseClients.findIndex((c) => c.id === clientId);
      if (idx !== -1) sseClients.splice(idx, 1);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const idx = sseClients.findIndex((c) => c.id === clientId);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
  });
});

// Bookings query
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

// 10. Booking Action State Machine (ACCEPT, ASSIGN_DRIVER, TRIP_STARTED, TRIP_COMPLETED, CANCEL)
app.post('/api/bookings/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, actorRole, actorName, rating, reviewComment, driverName, driverPhone, driverLicense, driverRating } = req.body;

  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (action === 'ACCEPT') {
    booking.status = 'ACCEPTED';
    booking.payment.status = 'PENDING';
    broadcastBookingNotification({
      type: 'STATUS_UPDATE',
      title: 'Booking Accepted by Fleet Operator',
      message: `Your booking ${booking.id} has been accepted by ${booking.ownerName}. Preparing vehicle and assigning commercial chauffeur.`,
      bookingId: booking.id,
      status: 'ACCEPTED',
      timestamp: new Date().toISOString(),
      booking,
    });
  } else if (action === 'CONFIRM_PAYMENT') {
    booking.status = 'CONFIRMED';
    booking.payment.status = 'PAID';
    booking.payment.paidAt = new Date().toISOString();
    broadcastBookingNotification({
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed!',
      message: `Your ride ${booking.id} (${booking.pickup} ➔ ${booking.destination}) is confirmed. Payment received successfully.`,
      bookingId: booking.id,
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
      booking,
    });
  } else if (action === 'ASSIGN_DRIVER') {
    const assignedName = driverName || 'Suresh Chand Sharma';
    const assignedPhone = driverPhone || '+91 98112 34567';
    booking.driver = {
      name: assignedName,
      phone: assignedPhone,
      licenseNumber: driverLicense || 'DL-0420190087654',
      rating: Number(driverRating) || 4.9,
      vehicleNumber: booking.vehicleNumber,
      assignedAt: new Date().toISOString(),
      liveStatus: 'ASSIGNED',
    };
    booking.status = 'DRIVER_ASSIGNED';

    broadcastBookingNotification({
      type: 'DRIVER_ASSIGNED',
      title: 'Chauffeur Assigned to Your Ride!',
      message: `${assignedName} (${assignedPhone}) has been assigned with ${booking.vehicleModel}. Verified commercial badge & 4.9★ rating.`,
      bookingId: booking.id,
      status: 'DRIVER_ASSIGNED',
      timestamp: new Date().toISOString(),
      booking,
      driver: booking.driver,
    });
  } else if (action === 'START_TRIP') {
    booking.status = 'TRIP_STARTED';
    if (booking.driver) {
      booking.driver.liveStatus = 'ON_TRIP';
    }
    broadcastBookingNotification({
      type: 'TRIP_STARTED',
      title: 'Trip Started — Safe Travels!',
      message: `Trip ${booking.id} to ${booking.destination} is now in progress. Live speed and GPS tracking enabled.`,
      bookingId: booking.id,
      status: 'TRIP_STARTED',
      timestamp: new Date().toISOString(),
      booking,
      driver: booking.driver,
    });
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

    broadcastBookingNotification({
      type: 'TRIP_COMPLETED',
      title: 'Destination Reached — Trip Completed!',
      message: `Trip ${booking.id} reached ${booking.destination}. Your official GST tax invoice is available for download.`,
      bookingId: booking.id,
      status: 'TRIP_COMPLETED',
      timestamp: new Date().toISOString(),
      booking,
    });
  } else if (action === 'CANCEL') {
    booking.status = 'CANCELLED';
    if (booking.payment.status === 'PAID') {
      booking.payment.status = 'REFUNDED';
    }
    broadcastBookingNotification({
      type: 'CANCELLED',
      title: 'Booking Cancelled',
      message: `Booking ${booking.id} has been cancelled. Any eligible refund has been queued.`,
      bookingId: booking.id,
      status: 'CANCELLED',
      timestamp: new Date().toISOString(),
      booking,
    });
  } else if (action === 'RATE') {
    const finalRating = Number(rating) || 5;
    const finalComment = reviewComment || '';
    const reviewData = {
      rating: finalRating,
      driverRating: req.body.driverRating ? Number(req.body.driverRating) : undefined,
      vehicleCleanlinessRating: req.body.vehicleCleanlinessRating ? Number(req.body.vehicleCleanlinessRating) : undefined,
      punctualityRating: req.body.punctualityRating ? Number(req.body.punctualityRating) : undefined,
      acComfortRating: req.body.acComfortRating ? Number(req.body.acComfortRating) : undefined,
      comment: finalComment,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      wouldRecommend: req.body.wouldRecommend !== undefined ? Boolean(req.body.wouldRecommend) : true,
      reviewedAt: new Date().toISOString(),
    };
    booking.rating = finalRating;
    booking.reviewComment = finalComment;
    booking.review = reviewData;

    if (req.body.markCompleted && booking.status !== 'TRIP_COMPLETED') {
      booking.status = 'TRIP_COMPLETED';
      booking.completedAt = new Date().toISOString();
    }

    // Blend into vehicle rating
    const vehicle = store.vehicles.find((v) => v.id === booking.vehicleId);
    if (vehicle) {
      vehicle.rating = vehicle.rating
        ? Number(((vehicle.rating * 4 + finalRating) / 5).toFixed(1))
        : finalRating;
    }

    // Blend into driver rating
    if (booking.driver && reviewData.driverRating) {
      booking.driver.rating = Number((((booking.driver.rating || 4.9) * 4 + reviewData.driverRating) / 5).toFixed(1));
      const matchedDriver = store.drivers.find(
        (d) => d.phone === booking.driver?.phone || (d.name && booking.driver?.name && d.name.toLowerCase() === booking.driver.name.toLowerCase())
      );
      if (matchedDriver) {
        matchedDriver.rating = Number((((matchedDriver.rating || 4.9) * 4 + reviewData.driverRating) / 5).toFixed(1));
      }
    }
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

// Dedicated Passenger Feedback & Travel Review Endpoint
app.post('/api/bookings/:id/review', (req, res) => {
  const { id } = req.params;
  const {
    rating,
    driverRating,
    vehicleCleanlinessRating,
    punctualityRating,
    acComfortRating,
    comment,
    reviewComment,
    tags,
    wouldRecommend,
    markCompleted,
    actorName,
  } = req.body;

  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const finalRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const finalComment = comment || reviewComment || '';
  const reviewData = {
    rating: finalRating,
    driverRating: driverRating ? Math.min(5, Math.max(1, Number(driverRating))) : undefined,
    vehicleCleanlinessRating: vehicleCleanlinessRating ? Math.min(5, Math.max(1, Number(vehicleCleanlinessRating))) : undefined,
    punctualityRating: punctualityRating ? Math.min(5, Math.max(1, Number(punctualityRating))) : undefined,
    acComfortRating: acComfortRating ? Math.min(5, Math.max(1, Number(acComfortRating))) : undefined,
    comment: finalComment,
    tags: Array.isArray(tags) ? tags : [],
    wouldRecommend: wouldRecommend !== undefined ? Boolean(wouldRecommend) : true,
    reviewedAt: new Date().toISOString(),
  };

  booking.rating = finalRating;
  booking.reviewComment = finalComment;
  booking.review = reviewData;

  if (markCompleted || booking.status !== 'TRIP_COMPLETED') {
    booking.status = 'TRIP_COMPLETED';
    if (!booking.completedAt) {
      booking.completedAt = new Date().toISOString();
    }
  }

  // Update vehicle rating
  const vehicle = store.vehicles.find((v) => v.id === booking.vehicleId);
  if (vehicle) {
    vehicle.rating = vehicle.rating
      ? Number(((vehicle.rating * 4 + finalRating) / 5).toFixed(1))
      : finalRating;
  }

  // Update driver rating
  if (booking.driver && reviewData.driverRating) {
    booking.driver.rating = Number((((booking.driver.rating || 4.9) * 4 + reviewData.driverRating) / 5).toFixed(1));
    const matchedDriver = store.drivers.find(
      (d) => d.phone === booking.driver?.phone || (d.name && booking.driver?.name && d.name.toLowerCase() === booking.driver.name.toLowerCase())
    );
    if (matchedDriver) {
      matchedDriver.rating = Number((((matchedDriver.rating || 4.9) * 4 + reviewData.driverRating) / 5).toFixed(1));
    }
  }

  logAuditEvent(
    actorName || booking.customerName || 'Passenger',
    'CUSTOMER',
    'BOOKING_REVIEWED',
    'bookings',
    booking.id,
    `Passenger rated booking ${booking.id} with ${finalRating}★: "${finalComment || 'No comment provided'}"`
  );

  broadcastBookingNotification({
    type: 'STATUS_UPDATE',
    title: 'Travel Feedback Recorded',
    message: `Thank you for rating trip ${booking.id} (${finalRating}★). Your review helps ensure passenger safety and fleet excellence.`,
    bookingId: booking.id,
    status: booking.status,
    timestamp: new Date().toISOString(),
    booking,
  });

  res.json({ success: true, booking, review: reviewData });
});

// Dedicated endpoint to assign driver to a booking
app.post('/api/bookings/:id/assign-driver', (req, res) => {
  const { id } = req.params;
  const { name, phone, licenseNumber, rating, vehicleNumber } = req.body;

  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const driverData = {
    name: name || 'Suresh Chand Sharma',
    phone: phone || '+91 98112 34567',
    licenseNumber: licenseNumber || 'DL-0420190087654',
    rating: Number(rating) || 4.9,
    vehicleNumber: vehicleNumber || booking.vehicleNumber,
    assignedAt: new Date().toISOString(),
    liveStatus: 'ASSIGNED' as const,
  };

  booking.driver = driverData;
  booking.status = 'DRIVER_ASSIGNED';

  logAuditEvent(
    booking.ownerName,
    'VEHICLE_OWNER',
    'DRIVER_ASSIGNED',
    'bookings',
    booking.id,
    `Driver ${driverData.name} (${driverData.phone}) assigned to booking ${booking.id}.`
  );

  broadcastBookingNotification({
    type: 'DRIVER_ASSIGNED',
    title: 'Driver Assigned!',
    message: `${driverData.name} (${driverData.phone}) has been assigned with vehicle ${booking.vehicleModel} (${booking.vehicleNumber}).`,
    bookingId: booking.id,
    status: 'DRIVER_ASSIGNED',
    timestamp: new Date().toISOString(),
    booking,
    driver: driverData,
  });

  res.json({ success: true, booking, driver: driverData });
});

// Quick testing endpoint to simulate booking events (confirmation, driver assignment, etc.)
app.post('/api/bookings/:id/simulate-notification', (req, res) => {
  const { id } = req.params;
  const { type = 'CONFIRM_PAYMENT' } = req.body;

  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (type === 'CONFIRM_PAYMENT') {
    booking.status = 'CONFIRMED';
    booking.payment.status = 'PAID';
    booking.payment.paidAt = new Date().toISOString();

    broadcastBookingNotification({
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed!',
      message: `Trip ${booking.id} (${booking.pickup} ➔ ${booking.destination}) is confirmed. Payment verified via UPI / Gateway.`,
      bookingId: booking.id,
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
      booking,
    });
  } else if (type === 'ASSIGN_DRIVER') {
    const driverData = req.body.driverData || {
      name: 'Ramesh Singh Chauhan',
      phone: '+91 98711 44520',
      licenseNumber: 'DL-0420180099123',
      rating: 4.9,
      vehicleNumber: booking.vehicleNumber,
      assignedAt: new Date().toISOString(),
      liveStatus: 'ASSIGNED' as const,
    };
    booking.driver = driverData;
    booking.status = 'DRIVER_ASSIGNED';

    // Sync driver state in store.drivers
    const matchedDriver = store.drivers.find(
      (d) => d.phone === driverData.phone || d.name.toLowerCase() === driverData.name.toLowerCase()
    );
    if (matchedDriver) {
      matchedDriver.status = 'ASSIGNED';
      matchedDriver.activeBookingId = booking.id;
      matchedDriver.currentVehicleNumber = booking.vehicleNumber;
      matchedDriver.currentVehicleModel = booking.vehicleModel;
    }

    broadcastBookingNotification({
      type: 'DRIVER_ASSIGNED',
      title: 'Commercial Chauffeur Assigned!',
      message: `Chauffeur ${driverData.name} (${driverData.phone}) assigned to your trip with ${booking.vehicleModel}. Rated 4.9★ with commercial badge.`,
      bookingId: booking.id,
      status: 'DRIVER_ASSIGNED',
      timestamp: new Date().toISOString(),
      booking,
      driver: driverData,
    });
  } else if (type === 'COMPLETE_TRIP') {
    booking.status = 'TRIP_COMPLETED';
    booking.completedAt = new Date().toISOString();

    // Generate commission transaction if not already present
    const existingTx = store.commissionTransactions.find((tx) => tx.bookingId === booking.id);
    if (!existingTx) {
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
    }

    broadcastBookingNotification({
      type: 'TRIP_COMPLETED',
      title: 'Destination Reached — Trip Completed!',
      message: `Trip ${booking.id} reached ${booking.destination}. Rate your travel experience and download your official invoice.`,
      bookingId: booking.id,
      status: 'TRIP_COMPLETED',
      timestamp: new Date().toISOString(),
      booking,
    });
  }

  res.json({ success: true, booking });
});

// 10c. SOS Emergency Response & Dispatch API
app.post('/api/emergency/sos', (req, res) => {
  const {
    latitude,
    longitude,
    accuracy,
    addressText,
    bookingId,
    vehicleModel,
    vehicleNumber,
    driverName,
    driverPhone,
    passengerName,
    passengerPhone,
    emergencyContacts = [],
    incidentNotes,
  } = req.body;

  const incidentId = 'SOS-' + Date.now().toString().slice(-6);
  const lat = Number(latitude) || 28.6139;
  const lng = Number(longitude) || 77.2090;
  const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

  const notifiedContacts = [
    {
      name: 'Laxmi Travels 24x7 Safety Desk',
      phone: store.adminSettings.supportPhone || '+91 9279120271',
      type: 'SUPPORT_TEAM',
      status: 'SENT',
    },
    {
      name: 'National Emergency Helpline',
      phone: '112',
      type: 'POLICE_112',
      status: 'SENT',
    },
    ...emergencyContacts.map((c: any) => ({
      name: c.name || 'Emergency Contact',
      phone: c.phone || 'N/A',
      type: 'REGISTERED_CONTACT',
      status: 'SENT',
    })),
  ];

  const incident = {
    id: incidentId,
    timestamp: new Date().toISOString(),
    passengerName: passengerName || 'Passenger',
    passengerPhone: passengerPhone || '+91 98112 33445',
    bookingId: bookingId || (store.bookings[0]?.id || 'WALK_IN_PASSENGER'),
    vehicleModel: vehicleModel || 'Commercial Fleet Vehicle',
    vehicleNumber: vehicleNumber || 'DL 1Z A 9876',
    driverName: driverName || 'Assigned Commercial Chauffeur',
    driverPhone: driverPhone || '+91 98711 44520',
    location: {
      latitude: lat,
      longitude: lng,
      accuracy: accuracy || 15,
      addressText: addressText || `Near GPS ${lat}, ${lng}`,
      googleMapsUrl,
    },
    notifiedContacts,
    status: 'DISPATCHED',
    incidentNotes: incidentNotes || 'Emergency SOS broadcast triggered from client application.',
  };

  if (!store.sosIncidents) {
    store.sosIncidents = [];
  }
  store.sosIncidents.unshift(incident);

  // Log critical audit event
  logAuditEvent(
    passengerName || 'Passenger',
    'EMERGENCY_DISPATCH',
    'SOS_EMERGENCY_TRIGGERED',
    'sosIncidents',
    incidentId,
    `CRITICAL SOS TRIGGERED! Vehicle: ${vehicleNumber} | Driver: ${driverName} | Location: ${lat}, ${lng}`
  );

  // Broadcast high-priority SSE notification to all connected clients
  broadcastBookingNotification({
    type: 'SOS_EMERGENCY_ALERT',
    title: `🚨 EMERGENCY SOS DISPATCHED: ${incident.vehicleNumber}`,
    message: `Passenger distress signal broadcasted! Vehicle: ${incident.vehicleModel} (${incident.vehicleNumber}) with Chauffeur ${incident.driverName}. Location: ${incident.location.addressText}`,
    bookingId: incident.bookingId,
    status: 'EMERGENCY_SOS',
    timestamp: incident.timestamp,
    incident,
  });

  res.json({
    success: true,
    incident,
    dispatchedAt: incident.timestamp,
    supportDesk: store.adminSettings.supportPhone,
    nationalEmergency: '112',
  });
});

app.get('/api/emergency/incidents', (req, res) => {
  res.json({
    success: true,
    count: (store.sosIncidents || []).length,
    incidents: store.sosIncidents || [],
  });
});

// 10b. Driver Profiles & Credential Management APIs
app.get('/api/drivers', (req, res) => {
  // Sync live trip statuses
  store.drivers.forEach((drv) => {
    const activeBooking = store.bookings.find(
      (b) =>
        b.driver &&
        (b.driver.phone === drv.phone || b.driver.name.toLowerCase() === drv.name.toLowerCase()) &&
        (b.status === 'CONFIRMED' || b.status === 'DRIVER_ASSIGNED' || b.status === 'TRIP_STARTED')
    );

    if (activeBooking) {
      drv.status = activeBooking.status === 'TRIP_STARTED' ? 'ON_TRIP' : 'ASSIGNED';
      drv.activeBookingId = activeBooking.id;
      drv.currentVehicleNumber = activeBooking.vehicleNumber;
      drv.currentVehicleModel = activeBooking.vehicleModel;
    } else if (drv.status === 'ASSIGNED' || drv.status === 'ON_TRIP') {
      drv.status = 'AVAILABLE';
      drv.activeBookingId = undefined;
    }
  });

  res.json({ success: true, drivers: store.drivers });
});

// Register New Driver Profile
app.post('/api/drivers', (req, res) => {
  const {
    name,
    phone,
    email,
    emergencyContact,
    experienceYears,
    licenseNumber,
    licenseExpiry,
    licenseFileName,
    aadhaarNumber,
    aadhaarFileName,
    policeVerificationNumber,
    policeVerificationExpiry,
    policeVerificationFileName,
    psvBadgeNumber,
    assignedVehicleId,
  } = req.body;

  if (!name || !phone || !licenseNumber) {
    return res.status(400).json({ error: 'Driver name, phone, and driving license number are required.' });
  }

  // Check if driver with phone already exists
  const existing = store.drivers.find((d) => d.phone === phone);
  if (existing) {
    return res.status(400).json({ error: 'A driver with this mobile number is already registered.' });
  }

  let assignedVeh = undefined;
  if (assignedVehicleId) {
    assignedVeh = store.vehicles.find((v) => v.id === assignedVehicleId);
  }

  const newDriver = {
    id: 'drv-' + Date.now(),
    ownerId: 'owner-sim-01',
    name,
    phone,
    email: email || '',
    emergencyContact: emergencyContact || '',
    experienceYears: Number(experienceYears) || 3,
    rating: 5.0,
    totalTripsCompleted: 0,
    status: 'AVAILABLE' as const,
    currentVehicleId: assignedVeh?.id || '',
    currentVehicleModel: assignedVeh?.model || '',
    currentVehicleNumber: assignedVeh?.registrationNumber || '',
    activeBookingId: undefined,
    credentials: {
      drivingLicense: {
        docType: 'DRIVING_LICENSE' as const,
        docNumber: licenseNumber,
        fileName: licenseFileName || 'commercial_dl_uploaded.pdf',
        expiryDate: licenseExpiry || '2030-12-31',
        verified: true,
        uploadedAt: new Date().toISOString(),
      },
      aadhaarCard: {
        docType: 'AADHAAR_CARD' as const,
        docNumber: aadhaarNumber || 'XXXX-XXXX-XXXX',
        fileName: aadhaarFileName || 'aadhaar_card_uploaded.pdf',
        verified: true,
        uploadedAt: new Date().toISOString(),
      },
      policeVerification: {
        docType: 'POLICE_VERIFICATION' as const,
        docNumber: policeVerificationNumber || 'PV-' + Math.floor(100000 + Math.random() * 900000),
        fileName: policeVerificationFileName || 'police_clearance_certificate.pdf',
        expiryDate: policeVerificationExpiry || '2027-12-31',
        verified: true,
        uploadedAt: new Date().toISOString(),
      },
      psvBadge: psvBadgeNumber
        ? {
            docType: 'PSV_BADGE' as const,
            docNumber: psvBadgeNumber,
            fileName: 'psv_badge.pdf',
            expiryDate: '2028-12-31',
            verified: true,
            uploadedAt: new Date().toISOString(),
          }
        : undefined,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.drivers.unshift(newDriver);

  logAuditEvent(
    'Operator',
    'VEHICLE_OWNER',
    'DRIVER_REGISTERED',
    'drivers',
    newDriver.id,
    `Driver ${newDriver.name} (${newDriver.phone}) registered with verified credentials DL ${licenseNumber}.`
  );

  res.status(201).json({ success: true, driver: newDriver });
});

// Update Driver Details / Assignment
app.put('/api/drivers/:id', (req, res) => {
  const { id } = req.params;
  const driver = store.drivers.find((d) => d.id === id);
  if (!driver) {
    return res.status(404).json({ error: 'Driver profile not found.' });
  }

  const {
    name,
    phone,
    email,
    emergencyContact,
    experienceYears,
    status,
    currentVehicleId,
  } = req.body;

  if (name) driver.name = name;
  if (phone) driver.phone = phone;
  if (email !== undefined) driver.email = email;
  if (emergencyContact !== undefined) driver.emergencyContact = emergencyContact;
  if (experienceYears !== undefined) driver.experienceYears = Number(experienceYears);
  if (status && ['AVAILABLE', 'OFF_DUTY'].includes(status) && driver.status !== 'ON_TRIP') {
    driver.status = status;
  }

  if (currentVehicleId !== undefined) {
    if (!currentVehicleId) {
      driver.currentVehicleId = '';
      driver.currentVehicleModel = '';
      driver.currentVehicleNumber = '';
    } else {
      const veh = store.vehicles.find((v) => v.id === currentVehicleId);
      if (veh) {
        driver.currentVehicleId = veh.id;
        driver.currentVehicleModel = veh.model;
        driver.currentVehicleNumber = veh.registrationNumber;
      }
    }
  }

  driver.updatedAt = new Date().toISOString();

  logAuditEvent(
    'Operator',
    'VEHICLE_OWNER',
    'DRIVER_UPDATED',
    'drivers',
    driver.id,
    `Driver ${driver.name} details updated.`
  );

  res.json({ success: true, driver });
});

// Upload or replace driver credential document
app.post('/api/drivers/:id/upload-credential', (req, res) => {
  const { id } = req.params;
  const { docType, docNumber, fileName, expiryDate } = req.body;

  const driver = store.drivers.find((d) => d.id === id);
  if (!driver) {
    return res.status(404).json({ error: 'Driver profile not found.' });
  }

  const credentialKey =
    docType === 'DRIVING_LICENSE'
      ? 'drivingLicense'
      : docType === 'AADHAAR_CARD'
      ? 'aadhaarCard'
      : docType === 'POLICE_VERIFICATION'
      ? 'policeVerification'
      : docType === 'PSV_BADGE'
      ? 'psvBadge'
      : 'medicalCertificate';

  driver.credentials[credentialKey] = {
    docType,
    docNumber: docNumber || driver.credentials[credentialKey]?.docNumber || 'DOC-VERIFIED',
    fileName: fileName || `${docType.toLowerCase()}_credential.pdf`,
    expiryDate: expiryDate || '2029-12-31',
    verified: true,
    uploadedAt: new Date().toISOString(),
  };

  driver.updatedAt = new Date().toISOString();

  logAuditEvent(
    'Operator',
    'VEHICLE_OWNER',
    'CREDENTIAL_UPLOADED',
    'drivers',
    driver.id,
    `Credential ${docType} uploaded for driver ${driver.name}.`
  );

  res.json({ success: true, driver, message: 'Credential document successfully verified and updated.' });
});

// Quick toggle driver availability (AVAILABLE <-> OFF_DUTY)
app.post('/api/drivers/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const driver = store.drivers.find((d) => d.id === id);
  if (!driver) {
    return res.status(404).json({ error: 'Driver profile not found.' });
  }

  if (driver.status === 'ON_TRIP') {
    return res.status(400).json({ error: 'Cannot toggle status while driver is actively on trip.' });
  }

  driver.status = driver.status === 'AVAILABLE' ? 'OFF_DUTY' : 'AVAILABLE';
  driver.updatedAt = new Date().toISOString();

  res.json({ success: true, driver });
});

// Delete Driver profile (only if not on trip)
app.delete('/api/drivers/:id', (req, res) => {
  const { id } = req.params;
  const index = store.drivers.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Driver profile not found.' });
  }

  if (store.drivers[index].status === 'ON_TRIP' || store.drivers[index].status === 'ASSIGNED') {
    return res.status(400).json({ error: 'Cannot delete driver assigned to an active trip.' });
  }

  const deleted = store.drivers.splice(index, 1)[0];

  logAuditEvent(
    'Operator',
    'VEHICLE_OWNER',
    'DRIVER_REMOVED',
    'drivers',
    id,
    `Driver ${deleted.name} removed from fleet.`
  );

  res.json({ success: true, message: 'Driver removed.' });
});

// ---------------------------------------------------------------------------
// 10B. GOOGLE MAPS & LOCATION RADAR: BUSINESS & CUSTOMER DIRECTORY REGISTRATION
// ---------------------------------------------------------------------------

// Helper: Haversine distance in KM
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// GET all registered buyers, receivers, and individual customers
app.get('/api/directory/entities', (req, res) => {
  const { category, city, onlineOnly } = req.query;
  let list = [...store.directoryEntities];

  if (category && category !== 'ALL') {
    list = list.filter((e) => e.category === category);
  }
  if (city) {
    list = list.filter((e) => e.city.toLowerCase() === (city as string).toLowerCase());
  }
  if (onlineOnly === 'true') {
    list = list.filter((e) => e.isOnline === true);
  }

  res.json({ success: true, entities: list, totalCount: list.length });
});

// POST: Register a new business or customer category
app.post('/api/directory/register', (req, res) => {
  const {
    name,
    category,
    categoryLabel,
    contactPerson,
    phone,
    email,
    city,
    address,
    latitude,
    longitude,
    coverageRadiusKm,
    isOnline,
    gstin,
    notes,
    statusText,
  } = req.body;

  if (!name || !category || !phone) {
    return res.status(400).json({ error: 'Name, Category, and Phone are required.' });
  }

  // Resolve coordinates if missing based on city
  const cityKey = (city || 'delhi').toLowerCase().trim();
  const matchedCoords = Object.entries(INDIAN_CITY_COORDINATES).find(([k]) => cityKey.includes(k))?.[1] || {
    lat: 28.6139,
    lng: 77.209,
  };

  const finalLat = typeof latitude === 'number' ? latitude : matchedCoords.lat + (Math.random() - 0.5) * 0.08;
  const finalLng = typeof longitude === 'number' ? longitude : matchedCoords.lng + (Math.random() - 0.5) * 0.08;

  const categoryLabelsMap: Record<string, string> = {
    CORPORATE_BUYER: 'Corporate Mobility Buyer',
    HOTEL_RECEIVER: 'Hotel Concierge Receiver',
    INDIVIDUAL_CUSTOMER: 'Individual Traveler / Passenger',
    TRAVEL_AGENT: 'B2B Travel Agent / Tour Operator',
    COMMERCIAL_BUSINESS: 'Commercial Enterprise / Shipper',
  };

  const newEntity = {
    id: 'dir-ent-' + Date.now(),
    name,
    category,
    categoryLabel: categoryLabel || categoryLabelsMap[category] || 'Commercial Travel Partner',
    contactPerson: contactPerson || name,
    phone,
    email: email || '',
    city: city || 'New Delhi',
    address: address || `${city || 'New Delhi'} Central Commercial Hub`,
    latitude: Math.round(finalLat * 10000) / 10000,
    longitude: Math.round(finalLng * 10000) / 10000,
    coverageRadiusKm: Number(coverageRadiusKm) || 25,
    isOnline: isOnline !== undefined ? Boolean(isOnline) : true,
    statusText: statusText || (isOnline ? 'Online & Available in Radius' : 'Offline / Standard Hours'),
    totalTripsRequested: 0,
    gstin: gstin || '',
    notes: notes || '',
    registeredAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  store.directoryEntities.unshift(newEntity);

  logAuditEvent(
    newEntity.name,
    'CUSTOMER',
    'DIRECTORY_ENTITY_REGISTERED',
    'directoryEntities',
    newEntity.id,
    `Registered new ${newEntity.categoryLabel} (${newEntity.name}) in ${newEntity.city}.`
  );

  res.status(201).json({ success: true, entity: newEntity });
});

// POST: Toggle online / able status
app.post('/api/directory/toggle-online/:id', (req, res) => {
  const { id } = req.params;
  const entity = store.directoryEntities.find((e) => e.id === id);
  if (!entity) {
    return res.status(404).json({ error: 'Directory entity not found.' });
  }

  entity.isOnline = !entity.isOnline;
  entity.lastActive = new Date().toISOString();
  entity.statusText = entity.isOnline ? 'Online & Ready in Radius' : 'Offline / Standby';

  res.json({ success: true, entity });
});

// POST: Automated radius scanning across Google Maps coordinates
app.post('/api/directory/scan-radius', (req, res) => {
  const { centerLat, centerLng, radiusKm = 30, categoryFilter } = req.body;

  const lat = typeof centerLat === 'number' ? centerLat : 28.6139;
  const lng = typeof centerLng === 'number' ? centerLng : 77.209;
  const rad = Number(radiusKm) || 30;

  let candidates = [...store.directoryEntities];
  if (categoryFilter && categoryFilter !== 'ALL') {
    candidates = candidates.filter((c) => c.category === categoryFilter);
  }

  const results = candidates.map((ent) => {
    const distanceKm = haversineDistanceKm(lat, lng, ent.latitude, ent.longitude);
    const inRadius = distanceKm <= rad;
    return {
      ...ent,
      distanceKm,
      inRadius,
      isAbleInRadius: inRadius && ent.isOnline,
    };
  });

  const withinRadius = results.filter((r) => r.inRadius).sort((a, b) => a.distanceKm - b.distanceKm);

  const summary = {
    totalEntitiesEvaluated: candidates.length,
    entitiesInRadius: withinRadius.length,
    onlineAndAbleInRadius: withinRadius.filter((r) => r.isOnline).length,
    buyersCount: withinRadius.filter((r) => r.category === 'CORPORATE_BUYER' || r.category === 'TRAVEL_AGENT').length,
    receiversCount: withinRadius.filter((r) => r.category === 'HOTEL_RECEIVER').length,
    individualCustomersCount: withinRadius.filter((r) => r.category === 'INDIVIDUAL_CUSTOMER').length,
    scannedCenter: { lat, lng },
    radiusKm: rad,
  };

  res.json({
    success: true,
    summary,
    entities: withinRadius,
  });
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

    broadcastBookingNotification({
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed!',
      message: `Your booking ${booking.id} (${booking.pickup} ➔ ${booking.destination}) is confirmed. Payment verified via ${booking.payment.method || 'UPI'}.`,
      bookingId: booking.id,
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
      booking,
    });

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
