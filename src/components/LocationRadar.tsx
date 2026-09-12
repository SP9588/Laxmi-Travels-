import React, { useState, useEffect } from 'react';
import { BusinessCustomerCategory, DirectoryEntity } from '../types';
import {
  MapPin,
  Search,
  Radio,
  Building2,
  Hotel,
  User,
  Compass,
  PlusCircle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Send,
  Sparkles,
  X,
  Navigation,
  Globe
} from 'lucide-react';

interface LocationRadarProps {
  onSelectEntityForTrip?: (pickupAddress: string, customerName: string, customerPhone: string) => void;
}

const POPULAR_HUBS = [
  { name: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167, city: 'New Delhi' },
  { name: 'Delhi Airport T3', lat: 28.5562, lng: 77.1000, city: 'New Delhi' },
  { name: 'DLF CyberCity, Gurugram', lat: 28.4907, lng: 77.0898, city: 'Gurugram' },
  { name: 'Noida Sector 62', lat: 28.6258, lng: 77.3695, city: 'Noida' },
  { name: 'Jaipur Pink City', lat: 26.9189, lng: 75.8156, city: 'Jaipur' },
  { name: 'Agra Taj Zone', lat: 27.1751, lng: 78.0421, city: 'Agra' },
  { name: 'Mumbai BKC', lat: 19.0657, lng: 72.8687, city: 'Mumbai' },
  { name: 'Bengaluru Electronic City', lat: 12.8452, lng: 77.6602, city: 'Bengaluru' },
];

export const LocationRadar: React.FC<LocationRadarProps> = ({ onSelectEntityForTrip }) => {
  // Navigation & Center Location
  const [selectedHub, setSelectedHub] = useState(POPULAR_HUBS[0]);
  const [customLocationText, setCustomLocationText] = useState('Connaught Place, New Delhi');
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: POPULAR_HUBS[0].lat,
    lng: POPULAR_HUBS[0].lng,
  });

  // Radius control (km)
  const [radiusKm, setRadiusKm] = useState<number>(35);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Automation & Scan state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanIteration, setScanIteration] = useState<number>(1);
  const [scanSummary, setScanSummary] = useState<any>(null);
  const [entitiesInRadius, setEntitiesInRadius] = useState<any[]>([]);

  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'CORPORATE_BUYER' as BusinessCustomerCategory,
    contactPerson: '',
    phone: '',
    email: '',
    city: 'New Delhi',
    address: '',
    coverageRadiusKm: 30,
    isOnline: true,
    gstin: '',
    notes: '',
  });

  // Perform radius scan against backend
  const executeRadiusScan = async (lat = centerCoords.lat, lng = centerCoords.lng, r = radiusKm, filter = categoryFilter) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/directory/scan-radius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerLat: lat,
          centerLng: lng,
          radiusKm: r,
          categoryFilter: filter,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEntitiesInRadius(data.entities || []);
        setScanSummary(data.summary || null);
        setScanIteration((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to execute radius scan:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Initial scan on mount
  useEffect(() => {
    executeRadiusScan();
  }, [centerCoords, radiusKm, categoryFilter]);

  // Handle Quick Hub Select
  const handleSelectHub = (hub: typeof POPULAR_HUBS[0]) => {
    setSelectedHub(hub);
    setCustomLocationText(hub.name);
    setCenterCoords({ lat: hub.lat, lng: hub.lng });
    setFormData((prev) => ({ ...prev, city: hub.city }));
  };

  // Toggle online / able status for an entity
  const handleToggleOnline = async (entityId: string) => {
    try {
      const res = await fetch(`/api/directory/toggle-online/${entityId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setEntitiesInRadius((prev) =>
          prev.map((e) => (e.id === entityId ? { ...e, isOnline: data.entity.isOnline, statusText: data.entity.statusText } : e))
        );
        // Refresh summary
        executeRadiusScan();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Submit new registration
  const handleRegisterEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/directory/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: centerCoords.lat + (Math.random() - 0.5) * 0.05,
          longitude: centerCoords.lng + (Math.random() - 0.5) * 0.05,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegSuccessMsg(`Successfully registered ${data.entity.name} in Laxmi Travels registry!`);
        setIsRegisterModalOpen(false);
        // Reset form
        setFormData({
          name: '',
          category: 'CORPORATE_BUYER',
          contactPerson: '',
          phone: '',
          email: '',
          city: selectedHub.city,
          address: '',
          coverageRadiusKm: 30,
          isOnline: true,
          gstin: '',
          notes: '',
        });
        executeRadiusScan();
        setTimeout(() => setRegSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error('Failed to register entity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (cat: BusinessCustomerCategory) => {
    switch (cat) {
      case 'CORPORATE_BUYER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Corporate Buyer
          </span>
        );
      case 'HOTEL_RECEIVER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 flex items-center gap-1">
            <Hotel className="w-3 h-3" />
            Hotel Receiver
          </span>
        );
      case 'INDIVIDUAL_CUSTOMER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <User className="w-3 h-3" />
            Individual Passenger
          </span>
        );
      case 'TRAVEL_AGENT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 flex items-center gap-1">
            <Compass className="w-3 h-3" />
            B2B Agent
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
            Commercial Client
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="location-radar-section">
      {/* Top Banner & Automated Discovery Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold">Google Maps & Real-Time Location Radar</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Iteration #{scanIteration} Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Iteratively navigate locations via Google Maps, auto-scan buyers, hotel receivers, and individual end-users who are online and available within your radius.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              id="btn-trigger-automated-scan"
              onClick={() => executeRadiusScan()}
              disabled={isScanning}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Network...' : 'Run Automated Radar Scan'}</span>
            </button>

            <button
              id="btn-open-register-entity-modal"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Business / Customer</span>
            </button>
          </div>
        </div>

        {/* Quick Location Navigators */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Navigate Target Location / Hub:</span>
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              Center: {centerCoords.lat.toFixed(4)}° N, {centerCoords.lng.toFixed(4)}° E
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {POPULAR_HUBS.map((hub, idx) => (
              <button
                key={idx}
                id={`hub-nav-btn-${idx}`}
                onClick={() => handleSelectHub(hub)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  selectedHub.name === hub.name
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>{hub.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {regSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{regSuccessMsg}</span>
        </div>
      )}

      {/* Map Radar + Radius Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Google Maps Pinpoint & Radius Visualization */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-900">{customLocationText}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
                {radiusKm} km Radar Radius
              </span>
            </div>

            {/* Radius selector pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 mr-1">Scan Radius:</span>
              {[15, 25, 35, 50, 75].map((r) => (
                <button
                  key={r}
                  id={`btn-radius-${r}`}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                    radiusKm === r
                      ? 'bg-slate-900 text-amber-400'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Embedded Google Maps View */}
          <div className="relative w-full h-80 bg-slate-100">
            <iframe
              title="Google Maps Location Radar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                customLocationText
              )}&z=12&output=embed`}
            />

            {/* Live Radar Overlay Pill */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-[11px]">
                Radius Coverage: <strong className="text-amber-400">{radiusKm} km</strong> from {selectedHub.city}
              </span>
            </div>
          </div>

          {/* Radar Metrics bar */}
          <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Entities In Radius</span>
              <div className="text-lg font-black text-slate-900">
                {scanSummary?.entitiesInRadius ?? entitiesInRadius.length}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Online & Able</span>
              <div className="text-lg font-black text-emerald-800">
                {scanSummary?.onlineAndAbleInRadius ?? entitiesInRadius.filter((e) => e.isOnline).length}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-950">
              <span className="text-[10px] text-blue-700 font-bold uppercase block">Corporate Buyers</span>
              <div className="text-lg font-black text-blue-800">
                {scanSummary?.buyersCount ?? entitiesInRadius.filter((e) => e.category === 'CORPORATE_BUYER' || e.category === 'TRAVEL_AGENT').length}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-950">
              <span className="text-[10px] text-purple-700 font-bold uppercase block">Hotel Receivers</span>
              <div className="text-lg font-black text-purple-800">
                {scanSummary?.receiversCount ?? entitiesInRadius.filter((e) => e.category === 'HOTEL_RECEIVER').length}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Category Filter & Real-Time Status Pill Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Filter Categories in Radius</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              {[
                { id: 'ALL', label: 'All Registered Categories' },
                { id: 'CORPORATE_BUYER', label: 'Corporate Mobility Buyers' },
                { id: 'HOTEL_RECEIVER', label: 'Hotel Concierge Receivers' },
                { id: 'INDIVIDUAL_CUSTOMER', label: 'Individual Passengers' },
                { id: 'TRAVEL_AGENT', label: 'B2B Travel Agents' },
                { id: 'COMMERCIAL_BUSINESS', label: 'Commercial Enterprises' },
              ].map((c) => (
                <button
                  key={c.id}
                  id={`cat-filter-${c.id.toLowerCase()}`}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                    categoryFilter === c.id
                      ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-[10px] opacity-70">
                    {c.id === 'ALL'
                      ? entitiesInRadius.length
                      : entitiesInRadius.filter((e) => e.category === c.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200/80 p-4 text-xs space-y-2 text-amber-900">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Real-Time Radius Connectivity</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              When an end-user, hotel receiver, or corporate buyer is marked <strong>ONLINE</strong>, they can immediately receive direct trip bookings and vehicle assignments from the Laxmi Travels fleet within their coverage radius.
            </p>
          </div>
        </div>
      </div>

      {/* Discovered Entities & Record Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold">
              Active Buyers, Receivers & Commuters in {radiusKm} km Radius ({entitiesInRadius.length})
            </h4>
            <p className="text-xs text-slate-400">
              Real-time records of registered businesses, receivers, and individual passengers online & reachable
            </p>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add New Record</span>
          </button>
        </div>

        {entitiesInRadius.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <Radio className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">No entities discovered within {radiusKm} km of this center.</p>
            <p>Expand the radius slider or click "Register Business / Customer" to add records for this location.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entitiesInRadius.map((ent) => (
              <div key={ent.id} className="p-4 hover:bg-slate-50 transition text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ent.name}</span>
                    {getCategoryBadge(ent.category)}
                    {ent.isOnline ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ONLINE & ABLE ({ent.distanceKm ?? 0} km away)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px]">
                        OFFLINE / STANDBY ({ent.distanceKm ?? 0} km away)
                      </span>
                    )}
                  </div>

                  <div className="text-slate-600 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {ent.address}, {ent.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {ent.phone}
                    </span>
                    {ent.email && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {ent.email}
                      </span>
                    )}
                  </div>

                  {ent.notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      Note: "{ent.notes}"
                    </p>
                  )}
                </div>

                {/* Status Toggle & Trip Connection Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id={`btn-toggle-online-${ent.id}`}
                    onClick={() => handleToggleOnline(ent.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                      ent.isOnline
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {ent.isOnline ? 'Active: ONLINE' : 'Active: OFFLINE'}
                  </button>

                  {onSelectEntityForTrip && (
                    <button
                      id={`btn-dispatch-entity-${ent.id}`}
                      onClick={() => onSelectEntityForTrip(ent.address || ent.city, ent.contactPerson || ent.name, ent.phone)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-xs transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Select For Ride</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal for Various Categories of Businesses & Customers */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register Business or Customer Record</h3>
                <p className="text-xs text-slate-500">
                  Add commercial buyers, hotel receivers, or passenger commuters to the location registry
                </p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterEntity} className="space-y-3.5 text-xs">
              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  Registration Category
                </label>
                <select
                  id="reg-input-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 bg-white"
                >
                  <option value="CORPORATE_BUYER">Corporate Mobility Buyer (Company Travel Desk)</option>
                  <option value="HOTEL_RECEIVER">Hotel Concierge / Guest Receiver Desk</option>
                  <option value="INDIVIDUAL_CUSTOMER">Individual Traveler / Frequent Passenger</option>
                  <option value="TRAVEL_AGENT">B2B Travel Agent / Tour Operator</option>
                  <option value="COMMERCIAL_BUSINESS">Commercial Enterprise / Logistics Client</option>
                </select>
              </div>

              {/* Entity Name */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  Entity / Business / Customer Name *
                </label>
                <input
                  id="reg-input-name"
                  type="text"
                  required
                  placeholder="e.g. Radisson Blu Hotel Concierge or Infosys Travel Desk"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Contact Person
                  </label>
                  <input
                    id="reg-input-contact-person"
                    type="text"
                    placeholder="Name of contact"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Phone Number *
                  </label>
                  <input
                    id="reg-input-phone"
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    City
                  </label>
                  <input
                    id="reg-input-city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Email Address
                  </label>
                  <input
                    id="reg-input-email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  Physical Address / Hub Location
                </label>
                <input
                  id="reg-input-address"
                  type="text"
                  placeholder="e.g. Sector 18 Commercial Zone or Airport Terminal 3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Coverage Radius (km)
                  </label>
                  <input
                    id="reg-input-radius"
                    type="number"
                    min="5"
                    max="200"
                    value={formData.coverageRadiusKm}
                    onChange={(e) => setFormData({ ...formData, coverageRadiusKm: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    GSTIN (Optional)
                  </label>
                  <input
                    id="reg-input-gstin"
                    type="text"
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  Trip Requirements / Operational Notes
                </label>
                <textarea
                  id="reg-input-notes"
                  rows={2}
                  placeholder="e.g. Requires AC sedans for regular 9 AM airport pick-ups"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Online Status Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="reg-checkbox-online"
                  type="checkbox"
                  checked={formData.isOnline}
                  onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="reg-checkbox-online" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Mark as Online & Able in respective radius immediately
                </label>
              </div>

              {/* Submit / Cancel buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-entity-registration"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Save & Register Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
