import React, { useState } from 'react';
import { UserRole, Booking } from './types';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { CustomerSearch } from './components/CustomerSearch';
import { CustomerBookings } from './components/CustomerBookings';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdminPortal } from './components/AdminPortal';
import { LegalNotice } from './components/LegalNotice';
import { LocationRadar } from './components/LocationRadar';
import { SOSEmergencyModal } from './components/SOSEmergencyModal';
import { ShieldCheck, Phone, Mail, MapPin, Heart, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'RADAR' | 'BOOKINGS' | 'OWNER' | 'ADMIN' | 'LEGAL'>('SEARCH');
  const [currentRole, setCurrentRole] = useState<UserRole>('CUSTOMER');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [prefilledPickup, setPrefilledPickup] = useState<string>('');
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [activeSOSBooking, setActiveSOSBooking] = useState<Booking | null>(null);

  // Poll or retrieve most recent active booking for emergency vehicle context
  React.useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Find an active trip or the latest booking
          const active = data.find((b: Booking) => 
            b.status === 'CONFIRMED' || b.status === 'DRIVER_ASSIGNED' || b.status === 'TRIP_STARTED'
          ) || data[0];
          setActiveSOSBooking(active);
        }
      })
      .catch(() => {
        // ignore fallback
      });
  }, [refreshTrigger, activeTab]);

  const handleBookingCompleted = (booking: Booking) => {
    setActiveSOSBooking(booking);
    setActiveTab('BOOKINGS');
  };

  const handleRefreshAll = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Fixed Navigation & Role Persona Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onOpenSOS={() => setIsSOSOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        
        {/* VIEW 1: SEARCH & BOOK COMMERCIAL TRAVEL */}
        {activeTab === 'SEARCH' && (
          <div className="space-y-8">
            <HomeHero onExploreFleet={() => {
              const el = document.getElementById('search-interface-container');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />

            <div id="search-interface-container">
              <CustomerSearch
                initialPickup={prefilledPickup}
                onBookingSuccess={handleBookingCompleted}
                onOpenRadar={() => setActiveTab('RADAR')}
              />
            </div>
          </div>
        )}

        {/* VIEW 1B: GOOGLE MAPS & LOCATION RADAR (FIND BUYERS, RECEIVERS & CUSTOMERS) */}
        {activeTab === 'RADAR' && (
          <div className="space-y-6">
            <LocationRadar
              onSelectEntityForTrip={(pickupAddress, customerName, customerPhone) => {
                setPrefilledPickup(pickupAddress);
                setActiveTab('SEARCH');
              }}
            />
          </div>
        )}

        {/* VIEW 2: CUSTOMER MY BOOKINGS & TAX INVOICES */}
        {activeTab === 'BOOKINGS' && (
          <CustomerBookings onGoToSearch={() => setActiveTab('SEARCH')} />
        )}

        {/* VIEW 3: VEHICLE OPERATOR FLEET DASHBOARD */}
        {activeTab === 'OWNER' && (
          <OwnerDashboard
            onSwitchToAdminVerifier={() => {
              setCurrentRole('ADMIN');
              setActiveTab('ADMIN');
            }}
          />
        )}

        {/* VIEW 4: ADMIN / VERIFIER / 10% COMMISSION LEDGER */}
        {activeTab === 'ADMIN' && (
          <AdminPortal onRefreshAllData={handleRefreshAll} />
        )}

        {/* VIEW 5: REGULATORY COMPLIANCE & LEGAL POLICIES */}
        {activeTab === 'LEGAL' && (
          <LegalNotice />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 text-xs py-10 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm">
                LT
              </div>
              <span className="font-extrabold text-base text-white">Laxmi Travels</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Safe, regulated commercial passenger transport platform. 100% verified yellow-plate fleet, certified drivers, transparent per-km billing, and 10% platform commission accounting.
            </p>
            <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Compliant with Motor Vehicles Act, 1988</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setActiveTab('SEARCH')} className="hover:text-amber-400">
                  Fare Calculator & Verified Booking
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('BOOKINGS')} className="hover:text-amber-400">
                  GST Tax Invoices & Itinerary
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentRole('VEHICLE_OWNER'); setActiveTab('OWNER'); }} className="hover:text-amber-400">
                  Vehicle Owner Onboarding Wizard
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentRole('ADMIN'); setActiveTab('ADMIN'); }} className="hover:text-amber-400">
                  6-Point Document Verification
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentRole('ADMIN'); setActiveTab('ADMIN'); }} className="hover:text-amber-400">
                  10% Developer Commission Ledger
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Architecture & Zero Cost Setup
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>PWA: iOS & Android cross-platform installable</li>
              <li>0 Initial Software Cost: GitHub + Vercel + Supabase Free Tier</li>
              <li>PostgreSQL RLS ready</li>
              <li>Express API with full audit trails</li>
              <li>Confidential QR & Webhook Payment Architecture</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Contact & Emergency Safety
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>24x7 Helpline: +91 1800 200 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>support@laxmitravels.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Transport Hub, Sector 18, Commercial Zone</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-2">
          <span>© 2026 Laxmi Travels Transport Platform. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('LEGAL')} className="hover:text-slate-300">
              Privacy Policy
            </button>
            <button onClick={() => setActiveTab('LEGAL')} className="hover:text-slate-300">
              Terms of Transport
            </button>
            <button onClick={() => setActiveTab('LEGAL')} className="hover:text-slate-300">
              Aggregator Guidelines
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Top-Level Persistent SOS Emergency Button */}
      <div className="fixed bottom-5 right-5 z-40 no-print flex flex-col items-end gap-2">
        <button
          id="floating-sos-button"
          onClick={() => setIsSOSOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider shadow-2xl shadow-rose-900/50 hover:shadow-rose-600/60 active:scale-95 transition-all border-2 border-red-400/40"
          title="SOS Emergency - Tap to transmit live coordinates & vehicle details to safety desk"
        >
          {/* Pulsing beacon waves */}
          <span className="animate-ping absolute -inset-1 rounded-full bg-rose-500 opacity-40 group-hover:opacity-75"></span>
          
          <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="font-black text-sm tracking-widest text-white drop-shadow-xs">
            SOS
          </span>
          <span className="hidden sm:inline-block pl-1 text-[10px] text-rose-200 font-bold border-l border-white/20 uppercase tracking-normal">
            Emergency
          </span>
        </button>
      </div>

      {/* SOS Emergency Modal & Dispatcher */}
      <SOSEmergencyModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        activeBooking={activeSOSBooking}
      />
    </div>
  );
}
