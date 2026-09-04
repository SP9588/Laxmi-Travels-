import React from 'react';
import { Shield, Award, Clock, ArrowRight, CheckCircle2, AlertCircle, FileCheck2, Calculator } from 'lucide-react';

interface HomeHeroProps {
  onBookRideClick: () => void;
  onRegisterVehicleClick: () => void;
  approvedVehiclesCount: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onBookRideClick,
  onRegisterVehicleClick,
  approvedVehiclesCount,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-10 pb-16 border-b border-slate-800">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Zero-Data / Authenticity Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero Fake Listings Guarantee — 100% Verified Commercial Fleet</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Reliable Vehicles. Verified Operators.{' '}
            <span className="text-amber-400">Better Journeys.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Laxmi Travels connects passengers with legally verified four-wheeler operators for city, outstation, and tourism travel with transparent per-km fares and guaranteed safety checks.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              id="btn-hero-book-ride"
              onClick={onBookRideClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Fare & Book Ride</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-register-vehicle"
              onClick={onRegisterVehicleClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>Register Your Vehicle (Fleet Onboarding)</span>
            </button>
          </div>

          {/* Empty state notice if 0 approved vehicles */}
          {approvedVehiclesCount === 0 && (
            <div className="bg-slate-800/70 border border-amber-500/30 rounded-2xl p-4 text-left max-w-2xl mx-auto mb-8 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-amber-300 mb-1">
                  Clean Production Database: Starting from 0 Demo Records
                </p>
                <p className="leading-relaxed">
                  Per strict commercial integrity rules, this system contains <strong>zero demo/fake vehicles</strong>. As vehicle owners register and pass the 6-point verification (RC, Insurance, PUC, Fitness, Permit, Inspection), approved vehicles will appear in real-time searches.
                </p>
              </div>
            </div>
          )}

          {/* Pillars of Trust */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4 border-t border-slate-800/80">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-sm text-white mb-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>6-Point Document Gate</span>
              </div>
              <p className="text-xs text-slate-400">
                RC, Commercial Insurance, Fitness, PUC, Permit, and DL verified by human verifiers before public listing.
              </p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-sm text-white mb-1">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Automated 10% Commission</span>
              </div>
              <p className="text-xs text-slate-400">
                Fair & transparent model: Exactly 10% platform developer commission on the final fare, 90% net owner share.
              </p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-sm text-white mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Real-Time Expiry Monitor</span>
              </div>
              <p className="text-xs text-slate-400">
                Automatic suspension if vehicle insurance, fitness, or tourist permit reaches expiration date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
