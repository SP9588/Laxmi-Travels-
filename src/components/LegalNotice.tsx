import React from 'react';
import { Scale, ShieldCheck, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const LegalNotice: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-amber-600 mb-1">
          <Scale className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Regulatory Compliance & Terms of Operation
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Laxmi Travels Legal Framework & Platform Policies
        </h2>
        <p className="text-xs text-slate-500">
          Operated in full compliance with the Motor Vehicles Act, 1988 and Motor Vehicle Aggregator Guidelines.
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1. Commercial Vehicle Only Policy (Strict Zero Private White-Plate Policy)</span>
          </h3>
          <p>
            Laxmi Travels strictly disallows any private non-commercial vehicle registration. Only commercial four-wheelers bearing legally issued commercial registration numbers (yellow background plates), valid commercial comprehensive insurance, tourist/state permits, and fitness certifications issued by competent Regional Transport Authorities (RTOs) are eligible for onboarding.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>2. 10% Developer Platform Commission Accounting</span>
          </h3>
          <p>
            For every booking executed through the platform, Laxmi Travels automatically debits a 10% developer/platform commission from the final customer fare to fund server infrastructure, continuous verification, secure payment processing, and safety audits. The remaining 90% is settled directly to the vehicle operator's designated bank account or UPI ID.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800">
            Example: Final Passenger Fare = ₹5,000.00 <br />
            Developer Commission (10%) = ₹500.00 <br />
            Vehicle Owner Net Payout (90%) = ₹4,500.00
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>3. 6-Point Verification Gate</span>
          </h3>
          <p>
            No vehicle is publicly indexed or bookable without satisfying the 6-point verification gate:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
            <li>Commercial Registration Certificate (RC) validation</li>
            <li>Commercial Comprehensive Insurance certificate</li>
            <li>Pollution Under Control (PUC) certificate</li>
            <li>Commercial Fitness certificate</li>
            <li>All-India Tourist Permit or State Passenger Permit</li>
            <li>Physical photographic roadworthiness inspection</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-purple-600" />
            <span>4. Data Privacy & Financial Confidentiality</span>
          </h3>
          <p>
            Customer payment credentials and vehicle owner sensitive bank account numbers are protected with end-to-end encryption. Invoices display only public references, vehicle registration, and necessary tax particulars.
          </p>
        </section>
      </div>

      <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-400">
        © 2026 Laxmi Travels. All Rights Reserved. Built for high-reliability cross-platform operations on Web, Android & iOS.
      </div>
    </div>
  );
};
