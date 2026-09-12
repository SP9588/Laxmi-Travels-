import React from 'react';
import { UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  ShieldCheck, 
  Car, 
  Search, 
  FileText, 
  ClipboardCheck, 
  Lock, 
  User, 
  Scale, 
  Layers,
  Radio,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'SEARCH' | 'RADAR' | 'BOOKINGS' | 'OWNER' | 'ADMIN' | 'LEGAL';
  setActiveTab: (tab: 'SEARCH' | 'RADAR' | 'BOOKINGS' | 'OWNER' | 'ADMIN' | 'LEGAL') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onOpenSOS?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onOpenSOS,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Banner: Official Brand & Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-300">Laxmi Travels Official Transport Platform</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">“Travel Safely. Travel Smart. Travel with Laxmi Travels.”</span>
        </div>

        {/* Role Switcher & Persona Simulator */}
        <div className="flex items-center gap-2">
          {onOpenSOS && (
            <button
              id="top-banner-sos-button"
              onClick={onOpenSOS}
              className="flex sm:hidden items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider animate-pulse shadow-xs"
            >
              <AlertTriangle className="w-3 h-3 text-amber-300" />
              <span>SOS</span>
            </button>
          )}
          <span className="text-slate-400 text-[11px] hidden sm:inline">Active Persona:</span>
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              id="role-customer-toggle"
              onClick={() => {
                setCurrentRole('CUSTOMER');
                if (activeTab === 'OWNER' || activeTab === 'ADMIN') setActiveTab('SEARCH');
              }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                currentRole === 'CUSTOMER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Customer
            </button>
            <button
              id="role-owner-toggle"
              onClick={() => {
                setCurrentRole('VEHICLE_OWNER');
                setActiveTab('OWNER');
              }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                currentRole === 'VEHICLE_OWNER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Vehicle Owner
            </button>
            <button
              id="role-admin-toggle"
              onClick={() => {
                setCurrentRole('ADMIN');
                setActiveTab('ADMIN');
              }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                currentRole === 'ADMIN' || currentRole === 'VERIFIER'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin / Verifier
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setActiveTab('SEARCH')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Laxmi Travels
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-normal hidden sm:block">
              Commercial Fleet & Tourism Platform
            </p>
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            id="nav-tab-search"
            onClick={() => setActiveTab('SEARCH')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'SEARCH'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Rides & Fares</span>
          </button>

          <button
            id="nav-tab-radar"
            onClick={() => setActiveTab('RADAR')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'RADAR'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Maps & Radar</span>
          </button>

          <button
            id="nav-tab-bookings"
            onClick={() => setActiveTab('BOOKINGS')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'BOOKINGS'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Bookings</span>
          </button>

          <button
            id="nav-tab-owner"
            onClick={() => setActiveTab('OWNER')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'OWNER'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Vehicle Operators</span>
            <span className="sm:hidden">Fleet</span>
          </button>

          <button
            id="nav-tab-admin"
            onClick={() => setActiveTab('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ADMIN'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Admin & Commission</span>
            <span className="md:hidden">Admin</span>
          </button>

          <button
            id="nav-tab-legal"
            onClick={() => setActiveTab('LEGAL')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'LEGAL'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-slate-400" />
            <span>Legal</span>
          </button>
        </nav>

        {/* Action Controls: SOS Emergency & PWA Install */}
        <div className="flex items-center gap-2">
          {onOpenSOS && (
            <button
              id="nav-sos-button"
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/30 active:scale-95 transition group"
              title="SOS Emergency — Instantly send live GPS location and vehicle details"
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-75"></span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300 relative inline-flex" />
              </div>
              <span className="font-extrabold tracking-wide">SOS</span>
              <span className="hidden sm:inline text-[10px] text-rose-200 font-semibold lowercase">/ help</span>
            </button>
          )}

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
