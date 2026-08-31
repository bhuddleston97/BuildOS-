import { useEffect, useState } from "react";
import { listRows } from "../../lib/db.js";
import { DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";

function fmt(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${Number(n).toFixed(2)}`;
}

export default function AppFinancials() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    listRows("projects", { perPage: 50, sort: "-budget", signal: ctrl.signal })
      .then(setProjects)
      .catch(e => { if (e?.name !== "AbortError") console.error(e); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const totalBudget = projects.reduce((a, p) => a + (p.budget || 0), 0);
  const totalSpent = projects.reduce((a, p) => a + (p.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const burnPct = totalBudget > 0 ? Math.round(totalSpent / totalBudget * 100) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Financials</h1>
        <p className="text-[14px] text-[#6b7a6e] font-body mt-0.5">Budget overview across all active projects</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-[#6b7a6e] font-body">Total Portfolio Budget</p>
            <DollarSign className="w-4 h-4 text-[#e8ff4d]" />
          </div>
          <p className="font-display font-[700] text-[26px] text-white tracking-[-0.02em]">{fmt(totalBudget)}</p>
        </div>
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-[#6b7a6e] font-body">Total Spent</p>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-display font-[700] text-[26px] text-white tracking-[-0.02em]">{fmt(totalSpent)}</p>
          <p className="text-[12px] text-amber-400 font-body mt-0.5">{burnPct}% of budget used</p>
        </div>
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-[#6b7a6e] font-body">Remaining Budget</p>
            <TrendingDown className={`w-4 h-4 ${totalRemaining < 0 ? "text-rose-400" : "text-emerald-400"}`} />
          </div>
          <p className={`font-display font-[700] text-[26px] tracking-[-0.02em] ${totalRemaining < 0 ? "text-rose-400" : "text-white"}`}>
            {fmt(Math.abs(totalRemaining))}{totalRemaining < 0 ? " over" : ""}
          </p>
        </div>
      </div>

      {/* Budget burn bar */}
      <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-[600] text-[15px] text-white">Portfolio Budget Burn</h2>
          <span className="text-[13px] text-[#6b7a6e] font-body">{burnPct}%</span>
        </div>
        <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${burnPct > 90 ? "bg-rose-400" : burnPct > 70 ? "bg-amber-400" : "bg-[#e8ff4d]"}`}
            style={{ width: `${Math.min(burnPct, 100)}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[12px] text-[#4a5c4e] font-body">$0</span>
          <span className="text-[12px] text-[#4a5c4e] font-body">{fmt(totalBudget)}</span>
        </div>
      </div>

      {/* Per-project breakdown */}
      <div>
        <h2 className="font-display font-[600] text-[16px] text-white mb-4">Project Breakdown</h2>
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06] text-[11px] text-[#4a5c4e] font-body font-[500] uppercase tracking-wide">
            <span>Project</span>
            <span className="text-right">Budget</span>
            <span className="text-right">Spent</span>
            <span className="text-right hidden sm:block">Remaining</span>
          </div>
          {loading ? (
            Array.from({length: 4}).map((_, i) => <div key={i} className="h-[56px] border-b border-white/[0.04] animate-pulse" />)
          ) : projects.map((p, i) => {
            const remaining = (p.budget || 0) - (p.spent || 0);
            const pct = p.budget > 0 ? Math.round(p.spent / p.budget * 100) : 0;
            return (
              <div key={p.id} className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center ${i < projects.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                <div>
                  <p className="text-[14px] text-white font-body font-[450] truncate">{p.name}</p>
                  <div className="h-1 bg-white/[0.06] rounded-full mt-2 overflow-hidden w-full">
                    <div className={`h-full rounded-full ${pct > 90 ? "bg-rose-400" : pct > 70 ? "bg-amber-400" : "bg-[#e8ff4d]"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
                <span className="text-[13px] text-[#8a9b8e] font-body text-right">{fmt(p.budget || 0)}</span>
                <span className="text-[13px] text-white font-body text-right">{fmt(p.spent || 0)}</span>
                <span className={`text-[13px] font-body text-right hidden sm:block ${remaining < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {remaining < 0 ? "-" : ""}{fmt(Math.abs(remaining))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
