export type UserRole = 'CUSTOMER' | 'VEHICLE_OWNER' | 'VERIFIER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  state: string;
  address?: string;
  createdAt: string;
  isVerified?: boolean;
}

export type DocumentType = 
  | 'RC' 
  | 'INSURANCE' 
  | 'PUC' 
  | 'FITNESS' 
  | 'PERMIT' 
  | 'DRIVER_LICENSE';

export type DocumentStatus = 
  | 'NOT_UPLOADED' 
  | 'UPLOADED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'EXPIRED' 
  | 'EXPIRING_SOON';

export interface DocumentRecord {
  type: DocumentType;
  title: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  uploadDate: string;
  status: DocumentStatus;
  reviewer?: string;
  reviewTimestamp?: string;
  rejectionReason?: string;
  fileUrl?: string;
}

export type VehicleCategory = 
  | 'SEDAN' 
  | 'SUV' 
  | 'INNOVA_CRYSTA' 
  | 'TEMPO_TRAVELLER' 
  | 'LUXURY';

export type VehicleInspectionStatus = 
  | 'PENDING_INSPECTION' 
  | 'INSPECTION_REQUIRED' 
  | 'APPROVED' 
  | 'CONDITIONALLY_APPROVED' 
  | 'REJECTED' 
  | 'SUSPENDED';

export type VerificationStatus = 
  | 'NOT_SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'SUSPENDED';

export interface VehiclePhotos {
  front?: string;
  rear?: string;
  left?: string;
  right?: string;
  interior?: string;
  dashboard?: string;
}

export interface VehiclePricing {
  baseFare: number;
  perKmRate: number;
  minKm: number;
  driverAllowancePerDay: number;
}

export interface VehicleAvailability {
  isAvailable: boolean;
  city: string;
  state: string;
  serviceRadiusKm: number;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  registrationNumber: string;
  make: string;
  model: string;
  variant: string;
  manufacturingYear: number;
  category: VehicleCategory;
  seatingCapacity: number;
  fuelType: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC';
  acType: 'AC' | 'NON_AC';
  odometerReading: number;
  color: string;
  photos: VehiclePhotos;
  documents: Record<DocumentType, DocumentRecord>;
  verificationStatus: VerificationStatus;
  inspectionStatus: VehicleInspectionStatus;
  isApproved: boolean; // True ONLY when all docs verified & inspection approved
  pricing: VehiclePricing;
  availability: VehicleAvailability;
  rating?: number;
  totalTrips?: number;
  createdAt: string;
  verifiedAt?: string;
  adminNotes?: string[];
}

export type BookingStatus = 
  | 'REQUESTED' 
  | 'ACCEPTED' 
  | 'PAYMENT_PENDING' 
  | 'CONFIRMED' 
  | 'DRIVER_ASSIGNED' 
  | 'TRIP_STARTED' 
  | 'TRIP_IN_PROGRESS' 
  | 'TRIP_COMPLETED' 
  | 'CANCELLED' 
  | 'REFUND_PENDING' 
  | 'REFUNDED' 
  | 'DISPUTED';

export type PaymentStatus = 
  | 'CREATED' 
  | 'PENDING' 
  | 'AUTHORIZED' 
  | 'PAID' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED' 
  | 'SETTLED';

export type DriverStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_TRIP' | 'OFF_DUTY';

export interface DriverCredentialDoc {
  docType: 'DRIVING_LICENSE' | 'AADHAAR_CARD' | 'POLICE_VERIFICATION' | 'PSV_BADGE' | 'MEDICAL_CERTIFICATE';
  docNumber: string;
  docUrl?: string;
  fileName?: string;
  expiryDate?: string;
  verified: boolean;
  uploadedAt: string;
}

export interface DriverRecord {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  email?: string;
  emergencyContact?: string;
  experienceYears: number;
  rating: number;
  totalTripsCompleted: number;
  status: DriverStatus;
  currentVehicleId?: string;
  currentVehicleModel?: string;
  currentVehicleNumber?: string;
  activeBookingId?: string;
  credentials: {
    drivingLicense: DriverCredentialDoc;
    aadhaarCard: DriverCredentialDoc;
    policeVerification: DriverCredentialDoc;
    psvBadge?: DriverCredentialDoc;
    medicalCertificate?: DriverCredentialDoc;
  };
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverDetails {
  name: string;
  phone: string;
  licenseNumber?: string;
  rating?: number;
  assignedAt: string;
  liveStatus?: 'ASSIGNED' | 'EN_ROUTE_TO_PICKUP' | 'ARRIVED_AT_PICKUP' | 'ON_TRIP';
}

export interface BookingNotification {
  id: string;
  type: 'BOOKING_CONFIRMED' | 'DRIVER_ASSIGNED' | 'STATUS_UPDATE' | 'TRIP_STARTED' | 'TRIP_COMPLETED';
  title: string;
  message: string;
  bookingId: string;
  timestamp: string;
  driver?: DriverDetails;
  status?: BookingStatus;
  read?: boolean;
}

export interface FareCalculation {
  distanceKm: number;
  baseFare: number;
  distanceFare: number;
  driverCharges: number;
  estimatedTollsAndTaxes: number;
  nightCharges: number;
  finalCustomerFare: number;
  developerCommission: number; // 10%
  ownerGrossShare: number; // 90%
}

export interface Booking {
  id: string; // Public format: LT-2026-000001
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleModel: string;
  vehicleCategory: VehicleCategory;
  vehicleNumber: string;
  ownerId: string;
  ownerName: string;
  pickup: string;
  destination: string;
  distanceKm: number;
  travelDate: string;
  travelTime: string;
  passengers: number;
  tripType: 'ONE_WAY' | 'ROUND_TRIP';
  specialNotes?: string;
  fareBreakdown: {
    baseFare: number;
    distanceFare: number;
    driverCharges: number;
    estimatedTollsAndTaxes: number;
    nightCharges: number;
    finalCustomerFare: number;
  };
  commission: {
    percentage: number; // default 10%
    developerCommission: number; // exactly 10% of finalCustomerFare
    ownerGrossShare: number; // finalCustomerFare - developerCommission
  };
  status: BookingStatus;
  payment: {
    orderId?: string;
    transactionId?: string;
    method?: 'GATEWAY_ONLINE' | 'UPI_SECURE' | 'CARD_NETBANKING';
    status: PaymentStatus;
    paidAt?: string;
  };
  settlementStatus: 'PENDING' | 'PROCESSING' | 'SETTLED';
  settledAt?: string;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  reviewComment?: string;
  review?: BookingReview;
  driver?: DriverDetails;
}

export interface BookingReview {
  rating: number;
  driverRating?: number;
  vehicleCleanlinessRating?: number;
  punctualityRating?: number;
  acComfortRating?: number;
  comment: string;
  tags?: string[];
  wouldRecommend?: boolean;
  reviewedAt: string;
}

export interface CommissionTransaction {
  id: string;
  bookingId: string;
  customerId: string;
  vehicleOwnerId: string;
  vehicleId: string;
  distanceKm: number;
  finalCustomerFare: number;
  commissionPercentage: number;
  commissionAmount: number;
  ownerAmount: number;
  paymentStatus: PaymentStatus;
  settlementStatus: 'PENDING' | 'PROCESSING' | 'SETTLED';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AdminSettings {
  commissionPercentage: number; // 10
  qrDisplayName: string;
  companyLegalName: string;
  gstNumber: string;
  registeredOffice: string;
  supportPhone: string;
  supportEmail: string;
  isMaintenanceMode: boolean;
  minBookingAdvanceHours: number;
}

export interface DailyCommissionStat {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "04 Sep" or "Day 04"
  dayNumber: number;
  commissionAmount: number; // 10% platform earnings
  grossBookingValue: number;
  ownerShare: number; // 90% owner earnings
  completedTripsCount: number;
}

export interface MonthlyCommissionSummary {
  monthKey: string; // YYYY-MM
  monthName: string; // "September 2026"
  totalCommission: number;
  totalGrossBookingValue: number;
  totalOwnerShare: number;
  totalTrips: number;
  avgDailyCommission: number;
  peakDayAmount: number;
  peakDayLabel: string;
  dailyStats: DailyCommissionStat[];
}

export type BusinessCustomerCategory = 
  | 'CORPORATE_BUYER' 
  | 'HOTEL_RECEIVER' 
  | 'INDIVIDUAL_CUSTOMER' 
  | 'TRAVEL_AGENT' 
  | 'COMMERCIAL_BUSINESS';

export interface DirectoryEntity {
  id: string;
  name: string;
  category: BusinessCustomerCategory;
  categoryLabel: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  coverageRadiusKm: number;
  isOnline: boolean;
  statusText: string;
  totalTripsRequested: number;
  gstin?: string;
  notes?: string;
  registeredAt: string;
  lastActive: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

export interface SOSEmergencyIncident {
  id: string;
  timestamp: string;
  passengerName: string;
  passengerPhone: string;
  bookingId?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    addressText?: string;
    googleMapsUrl: string;
  };
  notifiedContacts: {
    name: string;
    phone: string;
    type: 'SUPPORT_TEAM' | 'POLICE_112' | 'REGISTERED_CONTACT';
    status: 'SENT' | 'FAILED';
  }[];
  status: 'DISPATCHED' | 'ACKNOWLEDGED' | 'RESOLVED';
  incidentNotes?: string;
}


