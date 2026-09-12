import React, { useState, useEffect } from 'react';
import { Vehicle, DocumentType, DocumentRecord, AuditLog, CommissionTransaction, AdminSettings, DirectoryEntity, BusinessCustomerCategory } from '../types';
import { FinancialAnalytics } from './FinancialAnalytics';
import { 
  ShieldCheck, 
  Car, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Database, 
  History, 
  Copy, 
  Check, 
  FileCode,
  Settings,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Radio,
  Building2,
  Hotel,
  User,
  Search,
  Phone,
  MapPin,
  PlusCircle,
  Compass
} from 'lucide-react';

interface AdminPortalProps {
  onRefreshAllData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onRefreshAllData }) => {
  const [activeTab, setActiveTab] = useState<'VERIFICATION' | 'COMMISSION' | 'DIRECTORY' | 'AUDIT' | 'SUPABASE' | 'SETTINGS'>('VERIFICATION');
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [commissionTransactions, setCommissionTransactions] = useState<CommissionTransaction[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [directoryEntities, setDirectoryEntities] = useState<DirectoryEntity[]>([]);
  const [directoryFilter, setDirectoryFilter] = useState<string>('ALL');
  const [directorySearch, setDirectorySearch] = useState<string>('');

  // Settings state
  const [commissionRate, setCommissionRate] = useState(10);
  const [qrName, setQrName] = useState('Laxmi Travels');

  // Supabase SQL copy state
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseSchema, setSupabaseSchema] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchAdminData = async () => {
    try {
      const [resVehicles, resFin, resLogs, resSchema, resDir] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/admin/financials'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/supabase-schema'),
        fetch('/api/directory/entities'),
      ]);

      const vData = await resVehicles.json();
      const fData = await resFin.json();
      const lData = await resLogs.json();
      const sData = await resSchema.text();
      const dData = await resDir.json();

      if (vData.success) setVehicles(vData.vehicles || []);
      if (fData.success) {
        setFinancials(fData.metrics);
        setCommissionTransactions(fData.transactions || []);
        if (fData.metrics?.commissionRate) setCommissionRate(fData.metrics.commissionRate);
      }
      if (lData.success) setAuditLogs(lData.logs || []);
      if (dData.success) setDirectoryEntities(dData.entities || []);
      setSupabaseSchema(sData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleToggleEntityOnline = async (id: string) => {
    try {
      const res = await fetch(`/api/directory/toggle-online/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDirectoryEntities(prev => prev.map(e => e.id === id ? { ...e, isOnline: data.entity.isOnline, statusText: data.entity.statusText } : e));
      }
    } catch (err) {
      console.error('Failed to toggle directory status:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 1. Verify specific document
  const handleVerifyDocument = async (vehicleId: string, docType: DocumentType, status: 'VERIFIED' | 'REJECTED') => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/verify-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          status,
          rejectionReason: status === 'REJECTED' ? 'Document expired or illegible.' : undefined,
          reviewerName: 'Admin Officer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Document ${docType} updated to ${status}.`);
        fetchAdminData();
        if (selectedVehicle && selectedVehicle.id === vehicleId) {
          setSelectedVehicle(data.vehicle);
        }
      }
    } catch (err) {
      console.error('Error updating document:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 2. Inspect vehicle condition
  const handleInspectVehicle = async (vehicleId: string, status: 'APPROVED' | 'REJECTED') => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionStatus: status,
          inspectorName: 'Certified Inspector',
          notes: status === 'APPROVED' ? 'Clean exterior, valid tyres, functional AC & safety belt checked.' : 'Visible dents / safety issue.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Physical condition inspection set to ${status}.`);
        fetchAdminData();
        if (selectedVehicle && selectedVehicle.id === vehicleId) {
          setSelectedVehicle(data.vehicle);
        }
      }
    } catch (err) {
      console.error('Error updating inspection:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 3. Final Approval Gate
  const handleFinalApprove = async (vehicleId: string) => {
    setIsProcessingAction(true);
    setStatusMsg('');
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: 'Super Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Vehicle fully approved! It is now publicly bookable by customers.');
        fetchAdminData();
        onRefreshAllData();
        if (selectedVehicle && selectedVehicle.id === vehicleId) {
          setSelectedVehicle(data.vehicle);
        }
      } else {
        setStatusMsg(`Approval Blocked: ${data.error}`);
      }
    } catch (err) {
      setStatusMsg('Network error during final vehicle approval.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 4. Suspend vehicle
  const handleSuspend = async (vehicleId: string) => {
    setIsProcessingAction(true);
    try {
      await fetch(`/api/vehicles/${vehicleId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Administrative review or document expiry', adminName: 'Super Admin' }),
      });
      setStatusMsg('Vehicle suspended from active booking searches.');
      fetchAdminData();
      onRefreshAllData();
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Copy Supabase Schema
  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Laxmi Travels Administrative & Verifier Console
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
              Root Access
            </span>
          </div>
          <p className="text-xs text-slate-500">
            6-point document verification, vehicle inspection gates, 10% developer commission ledger & audit trails
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-300 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('VERIFICATION')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'VERIFICATION' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verification Queue ({vehicles.filter(v => !v.isApproved).length})
          </button>
          <button
            id="btn-tab-commission"
            onClick={() => setActiveTab('COMMISSION')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'COMMISSION' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Financial Analytics & Commission</span>
          </button>
          <button
            id="btn-tab-directory"
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'DIRECTORY' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>Buyers & Receivers ({directoryEntities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'AUDIT' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('SUPABASE')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              activeTab === 'SUPABASE' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase Schema</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg('')} className="text-amber-700 font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. VEHICLE VERIFICATION QUEUE & 6-POINT GATE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-6">
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center max-w-lg mx-auto">
              <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                No vehicles submitted for verification.
              </h4>
              <p className="text-xs text-slate-500">
                When vehicle operators complete the 11-step onboarding wizard, their applications appear here for human document review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle List */}
              <div className="lg:col-span-1 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Submitted Fleet ({vehicles.length})
                </span>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                        selectedVehicle?.id === v.id
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {v.make} {v.model}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            v.isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.isApproved ? 'LIVE' : 'PENDING REVIEW'}
                        </span>
                      </div>
                      <div className="font-mono text-slate-600 font-semibold">
                        {v.registrationNumber}
                      </div>
                      <div className="text-slate-500 flex justify-between">
                        <span>Operator: {v.ownerName}</span>
                        <span>{v.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Details & 6-Point Checklist Panel */}
              <div className="lg:col-span-2">
                {selectedVehicle ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.registrationNumber})
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              selectedVehicle.isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {selectedVehicle.isApproved ? 'APPROVED' : 'UNDER REVIEW'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Operator: <strong>{selectedVehicle.ownerName}</strong> ({selectedVehicle.ownerPhone}) • Hub: {selectedVehicle.availability?.city}
                        </p>
                      </div>

                      {/* Final Gate Approval Button */}
                      <div className="flex items-center gap-2">
                        {selectedVehicle.isApproved ? (
                          <button
                            onClick={() => handleSuspend(selectedVehicle.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold"
                          >
                            Suspend Vehicle
                          </button>
                        ) : (
                          <button
                            id="btn-final-approve-gate"
                            onClick={() => handleFinalApprove(selectedVehicle.id)}
                            disabled={isProcessingAction}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Approve for Customer Bookings</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step 1: Document Inspection Checklist */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        1. Mandatory Legal Document Checklist (5 Mandatory Criteria)
                      </h4>

                      <div className="space-y-2">
                        {(Object.entries(selectedVehicle.documents) as [DocumentType, DocumentRecord][]).map(([key, doc]) => {
                          const docType = key as DocumentType;
                          const isVerified = doc.status === 'VERIFIED';
                          const isRejected = doc.status === 'REJECTED';

                          return (
                            <div
                              key={key}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{doc.title}</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                      isVerified
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isRejected
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {doc.status}
                                  </span>
                                </div>
                                <div className="text-slate-600 font-mono text-[11px]">
                                  Doc #: {doc.documentNumber || 'N/A'} • Expiry: {doc.expiryDate || 'N/A'}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  id={`btn-verify-doc-${key.toLowerCase()}`}
                                  onClick={() => handleVerifyDocument(selectedVehicle.id, docType, 'VERIFIED')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                    isVerified
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white border border-slate-300 text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleVerifyDocument(selectedVehicle.id, docType, 'REJECTED')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                    isRejected
                                      ? 'bg-red-600 text-white'
                                      : 'bg-white border border-slate-300 text-red-700 hover:bg-red-50'
                                  }`}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Physical Inspection Gate */}
                    <div className="pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        2. Physical Vehicle Inspection & Roadworthiness Check
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block mb-0.5">
                            Inspection Status: {selectedVehicle.inspectionStatus.replace('_', ' ')}
                          </span>
                          <span className="text-slate-500">
                            Check bodywork dents, tyre tread, headlight function, seatbelts & commercial cleanliness.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            id="btn-inspect-approve"
                            onClick={() => handleInspectVehicle(selectedVehicle.id, 'APPROVED')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                              selectedVehicle.inspectionStatus === 'APPROVED'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            Pass Inspection
                          </button>
                          <button
                            onClick={() => handleInspectVehicle(selectedVehicle.id, 'REJECTED')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                              selectedVehicle.inspectionStatus === 'REJECTED'
                                ? 'bg-red-600 text-white'
                                : 'bg-white border border-slate-300 text-red-700 hover:bg-red-50'
                            }`}
                          >
                            Fail Inspection
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    Select a vehicle from the queue to review its mandatory legal documents and photo inspection.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. COMMISSION & FINANCIAL DASHBOARD WITH RECHARTS LINE CHART */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'COMMISSION' && financials && (
        <div className="space-y-6">
          {/* Recharts Financial Analytics Component */}
          <FinancialAnalytics
            transactions={commissionTransactions}
            commissionRate={commissionRate}
            onRefreshData={fetchAdminData}
          />
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Gross Booking Value
              </span>
              <div className="text-2xl font-black text-slate-900">
                ₹{financials.grossBookingValue.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {financials.completedTrips} completed rides
              </span>
            </div>

            <div className="bg-amber-500 text-slate-950 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-900/80 block mb-1">
                Total Developer Commission (10%)
              </span>
              <div className="text-2xl font-black text-slate-950">
                ₹{financials.developerCommissionTotal.toLocaleString('en-IN')}
              </div>
              <span className="text-xs font-semibold text-slate-900/80 mt-1 block">
                10% mandatory platform share
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">
                Total Operator Payouts (90%)
              </span>
              <div className="text-2xl font-black text-emerald-700">
                ₹{financials.ownerGrossShareTotal.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Gross driver & owner share
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Pending Settlements
              </span>
              <div className="text-2xl font-black text-slate-900">
                {financials.pendingSettlements}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Awaiting batch payout
              </span>
            </div>
          </div>

          {/* Immutable Commission Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Immutable Financial Commission Ledger</h3>
                <p className="text-xs text-slate-400">
                  Every ride produces an exact 10% developer commission record.
                </p>
              </div>
            </div>

            {commissionTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No completed transactions have generated commission yet. Complete a test booking to view financial rows.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Tx ID / Booking Ref</th>
                      <th className="py-3 px-4">Distance</th>
                      <th className="py-3 px-4">Final Customer Fare</th>
                      <th className="py-3 px-4 text-amber-600">Developer Commission (10%)</th>
                      <th className="py-3 px-4 text-emerald-700">Owner Share (90%)</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commissionTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          {tx.bookingId}
                          <div className="text-[10px] text-slate-400 font-normal">{tx.id}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">{tx.distanceKm} km</td>
                        <td className="py-3 px-4 font-bold font-mono text-slate-900">
                          ₹{tx.finalCustomerFare}
                        </td>
                        <td className="py-3 px-4 font-bold font-mono text-amber-600">
                          ₹{tx.commissionAmount}
                        </td>
                        <td className="py-3 px-4 font-bold font-mono text-emerald-700">
                          ₹{tx.ownerAmount}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {tx.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2B. BUYERS & RECEIVERS DIRECTORY (GOOGLE MAPS & RADIUS RADAR) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">Registered Commercial Buyers, Hotel Receivers & Passengers</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
                    {directoryEntities.length} Total Records
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Active directory of business customers, hotel concierge receiver desks, and individual end-users with radius and online/able status.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, city, phone..."
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 text-xs">
              {[
                { id: 'ALL', label: 'All Records' },
                { id: 'CORPORATE_BUYER', label: 'Corporate Buyers' },
                { id: 'HOTEL_RECEIVER', label: 'Hotel Receivers' },
                { id: 'INDIVIDUAL_CUSTOMER', label: 'Individual Passengers' },
                { id: 'TRAVEL_AGENT', label: 'B2B Travel Agents' },
                { id: 'COMMERCIAL_BUSINESS', label: 'Commercial Business' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDirectoryFilter(c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    directoryFilter === c.id
                      ? 'bg-slate-900 text-amber-400 font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label} ({
                    c.id === 'ALL'
                      ? directoryEntities.length
                      : directoryEntities.filter((e) => e.category === c.id).length
                  })
                </button>
              ))}
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Entity / Customer Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location & Hub</th>
                    <th className="py-3 px-4">Radius</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Status & Radius Ability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {directoryEntities
                    .filter((ent) => {
                      if (directoryFilter !== 'ALL' && ent.category !== directoryFilter) return false;
                      if (!directorySearch) return true;
                      const q = directorySearch.toLowerCase();
                      return (
                        ent.name.toLowerCase().includes(q) ||
                        ent.city.toLowerCase().includes(q) ||
                        ent.phone.toLowerCase().includes(q) ||
                        ent.contactPerson?.toLowerCase().includes(q)
                      );
                    })
                    .map((ent) => (
                      <tr key={ent.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{ent.name}</div>
                          <div className="text-[10px] text-slate-400">{ent.contactPerson || 'Direct'}</div>
                          {ent.gstin && (
                            <div className="text-[10px] text-slate-500 font-mono">GST: {ent.gstin}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {ent.categoryLabel || ent.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{ent.city}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{ent.address}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {ent.coverageRadiusKm || 25} km
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-mono">{ent.phone}</div>
                          <div className="text-[10px] text-slate-400">{ent.email || '—'}</div>
                        </td>
                        <td className="py-3 px-4">
                          {ent.isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ONLINE & ABLE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                              OFFLINE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            id={`btn-admin-toggle-online-${ent.id}`}
                            onClick={() => handleToggleEntityOnline(ent.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                              ent.isOnline
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {ent.isOnline ? 'Set Offline' : 'Set Online'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. AUDIT LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white">
            <h3 className="text-sm font-bold">Cryptographic-Style Audit Trail</h3>
            <p className="text-xs text-slate-400">
              Immutable records for vehicle registration, document verification, payments, and commission calculations
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Audit trail starts at zero. System actions will be logged automatically.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 text-xs flex items-start justify-between gap-3 hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {log.actorRole}
                      </span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Actor: {log.actor} • Entity: {log.entity} ({log.entityId})
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. SUPABASE SCHEMA EXPORT TOOL */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'SUPABASE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Supabase PostgreSQL Schema & Row-Level-Security (RLS)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                100% Free Tier Compatible. Copy and run directly in your Supabase SQL Editor.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs self-start"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy Schema SQL'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs rounded-xl overflow-x-auto max-h-96 border border-slate-800">
            <pre>{supabaseSchema}</pre>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <span className="font-bold block">Next Steps to launch with 0 initial software cost:</span>
            <ol className="list-decimal list-inside space-y-1 text-emerald-900">
              <li>Create a free Supabase project at <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">supabase.com</code>.</li>
              <li>Paste the above SQL in the <strong>SQL Editor</strong> and execute it.</li>
              <li>Push this repository to GitHub (<code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">git push origin main</code>).</li>
              <li>Connect GitHub to Vercel (free tier) and add environment variables from <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">.env.example</code>.</li>
            </ol>
          </div>
        </div>
      )}

    </div>
  );
};
