import React, { useState, useMemo } from 'react';
import { CommissionTransaction } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowUpRight,
  BarChart3,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface FinancialAnalyticsProps {
  transactions: CommissionTransaction[];
  commissionRate?: number;
  onRefreshData?: () => void;
}

export const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  transactions,
  commissionRate = 10,
  onRefreshData,
}) => {
  // Available months extracted from transactions or default to current 2026-09
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [showGrossComparison, setShowGrossComparison] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simMessage, setSimMessage] = useState<string>('');

  // Extract unique months from existing transactions + fallback defaults
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>(['2026-09', '2026-08', '2026-07']);
    transactions.forEach((tx) => {
      if (tx.timestamp) {
        const d = new Date(tx.timestamp);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        monthSet.add(`${yyyy}-${mm}`);
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  // Generate daily points for the selected month (e.g. 1 to 30/31 days)
  const monthlyData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;

    // Number of days in selected month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const monthName = new Date(year, monthIndex, 1).toLocaleString('en-IN', {
      month: 'long',
      year: 'numeric',
    });

    // Initialize days map
    const dailyMap: Record<
      number,
      {
        dayNumber: number;
        date: string;
        dayLabel: string;
        commission: number;
        grossFare: number;
        ownerShare: number;
        tripsCount: number;
      }
    > = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
      const dayLabel = `${String(day).padStart(2, '0')} ${new Date(year, monthIndex, 1).toLocaleString('en-IN', { month: 'short' })}`;
      dailyMap[day] = {
        dayNumber: day,
        date: dateStr,
        dayLabel,
        commission: 0,
        grossFare: 0,
        ownerShare: 0,
        tripsCount: 0,
      };
    }

    // Populate with actual transactions matching the month
    transactions.forEach((tx) => {
      const txDate = new Date(tx.timestamp);
      const txYear = txDate.getFullYear();
      const txMonth = String(txDate.getMonth() + 1).padStart(2, '0');
      const txMonthKey = `${txYear}-${txMonth}`;

      if (txMonthKey === selectedMonth) {
        const day = txDate.getDate();
        if (dailyMap[day]) {
          dailyMap[day].commission += tx.commissionAmount;
          dailyMap[day].grossFare += tx.finalCustomerFare;
          dailyMap[day].ownerShare += tx.ownerAmount;
          dailyMap[day].tripsCount += 1;
        }
      }
    });

    const chartPoints = Object.values(dailyMap).sort((a, b) => a.dayNumber - b.dayNumber);

    // Summary calculations
    const totalCommission = chartPoints.reduce((acc, curr) => acc + curr.commission, 0);
    const totalGross = chartPoints.reduce((acc, curr) => acc + curr.grossFare, 0);
    const totalOwner = chartPoints.reduce((acc, curr) => acc + curr.ownerShare, 0);
    const totalTrips = chartPoints.reduce((acc, curr) => acc + curr.tripsCount, 0);

    // Active days and peak day
    const activeDays = chartPoints.filter((p) => p.commission > 0);
    let peakDay = { dayLabel: 'None', commission: 0 };
    chartPoints.forEach((p) => {
      if (p.commission > peakDay.commission) {
        peakDay = { dayLabel: p.dayLabel, commission: p.commission };
      }
    });

    const avgDailyCommission = activeDays.length > 0 ? Math.round(totalCommission / activeDays.length) : 0;

    return {
      monthName,
      chartPoints,
      totalCommission,
      totalGross,
      totalOwner,
      totalTrips,
      peakDay,
      avgDailyCommission,
      activeDaysCount: activeDays.length,
    };
  }, [selectedMonth, transactions]);

  // Quick Action: Simulate a sample ride to observe live data
  const handleSimulateRide = async (fare = 5200, offsetDays = 0) => {
    setIsSimulating(true);
    setSimMessage('');
    try {
      const res = await fetch('/api/admin/simulate-completed-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fareAmount: fare,
          dateOffsetDays: offsetDays,
          pickup: 'Delhi Airport T3',
          destination: 'Jaipur Pink City',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimMessage(`Sample ride generated! Added ₹${data.transaction.commissionAmount} commission.`);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Simulation failed:', err);
      setSimMessage('Simulation request failed.');
    } finally {
      setIsSimulating(false);
      setTimeout(() => setSimMessage(''), 4000);
    }
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold border-b border-slate-700 pb-1 flex justify-between items-center">
            <span>{data.dayLabel}</span>
            <span className="text-[10px] text-amber-400 font-mono">
              {data.tripsCount} {data.tripsCount === 1 ? 'Trip' : 'Trips'}
            </span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center text-amber-400 font-bold">
              <span>Commission ({commissionRate}%):</span>
              <span className="font-mono text-sm">₹{data.commission.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Gross Booking Value:</span>
              <span className="font-mono">₹{data.grossFare.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>Operator Payout (90%):</span>
              <span className="font-mono">₹{data.ownerShare.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="financial-analytics-container">
      {/* Analytics Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Monthly Platform Commission Analytics
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
              {commissionRate}% Platform Take
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily timeline of automated 10% developer fee collections across all completed trips
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="select-analytics-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-800 text-xs font-bold focus:outline-hidden cursor-pointer"
            >
              {availableMonths.map((m) => {
                const [y, mm] = m.split('-');
                const name = new Date(parseInt(y, 10), parseInt(mm, 10) - 1, 1).toLocaleString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <option key={m} value={m}>
                    {name} {m === '2026-09' ? '(Current)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Toggle Gross Fare Line */}
          <button
            id="btn-toggle-gross-line"
            onClick={() => setShowGrossComparison(!showGrossComparison)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              showGrossComparison
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showGrossComparison ? 'Gross Fare: ON' : 'Gross Fare: OFF'}
          </button>

          {/* Refresh Button */}
          {onRefreshData && (
            <button
              id="btn-refresh-analytics"
              onClick={onRefreshData}
              title="Refresh Analytics Data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {simMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{simMessage}</span>
        </div>
      )}

      {/* Monthly Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-xs border border-amber-600/30">
          <div className="flex items-center justify-between text-slate-900/80 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {monthlyData.monthName} Commission
            </span>
            <DollarSign className="w-4 h-4 text-slate-950" />
          </div>
          <div className="text-2xl font-black text-slate-950">
            ₹{monthlyData.totalCommission.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-semibold text-slate-900/80 block mt-0.5">
            Exact 10% platform share
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Gross Monthly Bookings
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{monthlyData.totalGross.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {monthlyData.totalTrips} completed {monthlyData.totalTrips === 1 ? 'ride' : 'rides'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Operator Net Payouts
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ₹{monthlyData.totalOwner.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            90% payable to fleet owners
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Peak Day Collection
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{monthlyData.peakDay.commission.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {monthlyData.peakDay.commission > 0 ? `Recorded on ${monthlyData.peakDay.dayLabel}` : 'No collections yet'}
          </span>
        </div>
      </div>

      {/* Recharts Line Chart Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Daily Platform Commission Collections ({monthlyData.monthName})
            </h4>
            <p className="text-xs text-slate-500">
              Daily 10% commission curve collected upon completed commercial travel bookings
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-700">
              <span className="w-3 h-1 bg-amber-500 rounded-full inline-block"></span>
              <span>10% Platform Commission</span>
            </div>
            {showGrossComparison && (
              <div className="flex items-center gap-1.5 font-medium text-slate-500">
                <span className="w-3 h-1 bg-slate-400 rounded-full inline-block"></span>
                <span>Gross Passenger Fare</span>
              </div>
            )}
          </div>
        </div>

        {/* The Recharts Line Chart */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData.chartPoints}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {showGrossComparison && (
                <Line
                  type="monotone"
                  dataKey="grossFare"
                  name="Gross Fare"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 4, fill: '#94a3b8' }}
                />
              )}

              <Line
                type="monotone"
                dataKey="commission"
                name="Platform Commission"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#d97706', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Empty State Banner & Quick Simulation for Testing */}
        {monthlyData.totalCommission === 0 && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 block">
                No rides completed in {monthlyData.monthName} yet.
              </span>
              <p className="text-amber-700">
                The zero-start ledger tracks real completed bookings. Would you like to generate a sample completed trip to inspect the line chart?
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-simulate-sample-trip"
                onClick={() => handleSimulateRide(4800, 0)}
                disabled={isSimulating}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Recording...' : 'Add Sample Ride (₹480 Comm)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Collections Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold">Daily Commission Breakdown ({monthlyData.monthName})</h4>
            <p className="text-xs text-slate-400">
              Audit log of daily platform collections, booking volumes, and operator disbursements
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateRide(5500, -1)}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              + Yesterday Ride
            </button>
            <button
              onClick={() => handleSimulateRide(4200, 0)}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
            >
              + Today Ride
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Completed Trips</th>
                <th className="py-2.5 px-4">Gross Fare (₹)</th>
                <th className="py-2.5 px-4 text-amber-600">Platform Commission (10%)</th>
                <th className="py-2.5 px-4 text-emerald-700">Operator Share (90%)</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.chartPoints
                .filter((p) => p.commission > 0 || p.dayNumber <= new Date().getDate())
                .reverse()
                .map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {row.dayLabel}
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {row.tripsCount > 0 ? (
                        <span className="font-semibold text-slate-800">
                          {row.tripsCount} {row.tripsCount === 1 ? 'ride' : 'rides'}
                        </span>
                      ) : (
                        <span className="text-slate-400">0 rides</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">
                      ₹{row.grossFare.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-600">
                      ₹{row.commission.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">
                      ₹{row.ownerShare.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4">
                      {row.commission > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          COLLECTED
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
