import { useEffect, useState } from "react";
import { updateRow } from "../../lib/db.js";
import { useRealtimeRows } from "../../lib/useRealtimeRows.js";
import { Bell, Check, AlertTriangle, Info, Zap, DollarSign, Calendar, FileText, FileEdit, CheckSquare, ShieldAlert } from "lucide-react";

const typeCfg = {
  budget_alert:    { label: "Budget",        Icon: DollarSign,   color: "text-amber-400",   bg: "bg-amber-400/10" },
  schedule_risk:   { label: "Schedule",      Icon: Calendar,     color: "text-rose-400",    bg: "bg-rose-400/10" },
  safety_incident: { label: "Safety",        Icon: ShieldAlert,  color: "text-rose-400",    bg: "bg-rose-400/10" },
  change_order:    { label: "Change Order",  Icon: FileEdit,     color: "text-sky-400",     bg: "bg-sky-400/10" },
  task_due:        { label: "Task",          Icon: CheckSquare,  color: "text-[#cbd5e1]",  bg: "bg-white/[0.06]" },
  approval_needed: { label: "Approval",      Icon: AlertTriangle,color: "text-amber-400",   bg: "bg-amber-400/10" },
  field_report:    { label: "Field Report",  Icon: FileText,     color: "text-emerald-400", bg: "bg-emerald-400/10" },
  system:          { label: "System",        Icon: Info,         color: "text-[#94a3b8]",  bg: "bg-white/[0.04]" },
  ai_insight:      { label: "AI Insight",    Icon: Zap,          color: "text-[#60a5fa]",  bg: "bg-[#60a5fa]/10" },
};

const severityBorder = {
  info:     "border-l-white/[0.08]",
  warning:  "border-l-amber-400/40",
  critical: "border-l-rose-400/50",
};

export default function AppNotifications() {
  const { rows: notifs, loading, setRows: setNotifs } = useRealtimeRows("notifications", { perPage: 100, sort: "-created" });
  const [filter, setFilter] = useState("all");

  async function markRead(id) {
    try {
      const updated = await updateRow("notifications", id, { read: true });
      setNotifs(ns => ns.map(n => n.id === id ? updated : n));
    } catch {}
  }

  async function markAllRead() {
    const unread = notifs.filter(n => !n.read);
    await Promise.all(unread.map(n => updateRow("notifications", n.id, { read: true }).catch(() => {})));
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifs.filter(n => !n.read).length;
  const filtered = filter === "all" ? notifs : filter === "unread" ? notifs.filter(n => !n.read) : notifs.filter(n => n.type === filter);

  return (
    <div className="p-6 lg:p-8 max-w-[900px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Notifications</h1>
          <p className="text-[14px] text-[#94a3b8] font-body mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 text-[13px] text-[#94a3b8] hover:text-[#60a5fa] border border-white/[0.08] hover:border-[#60a5fa]/30 px-4 py-2 rounded-xl transition-all font-body">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {[
          ["all", "All"],
          ["unread", `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`],
          ["budget_alert", "Budget"],
          ["schedule_risk", "Schedule"],
          ["change_order", "Change Orders"],
          ["ai_insight", "AI Insights"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`text-[12.5px] font-body font-[450] px-3 py-1.5 rounded-lg transition-all border ${
              filter === k
                ? "bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20"
                : "text-[#94a3b8] hover:text-white hover:bg-white/[0.04] border-transparent"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="bg-[#18181b] border border-white/[0.06] rounded-2xl h-[80px] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#18181b] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Bell className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="text-[15px] text-white font-body font-[450] mb-1">No notifications</p>
          <p className="text-[13px] text-[#94a3b8] font-body">You're all caught up — alerts will appear here as your projects progress</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const t = typeCfg[n.type] || typeCfg.system;
            const border = severityBorder[n.severity] || severityBorder.info;
            return (
              <div key={n.id}
                className={`bg-[#18181b] border border-white/[0.06] border-l-4 ${border} rounded-2xl px-5 py-4 flex items-start gap-4 transition-all ${!n.read ? "bg-white/[0.02]" : "opacity-70"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${t.bg}`}>
                  <t.Icon className={`w-4 h-4 ${t.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-[14px] font-body font-[${n.read ? "450" : "500"}] ${n.read ? "text-[#cbd5e1]" : "text-white"}`}>{n.title}</p>
                      <p className="text-[13px] text-[#94a3b8] font-body mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.read && (
                      <button onClick={() => markRead(n.id)}
                        className="shrink-0 text-[#94a3b8] hover:text-[#60a5fa] transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]"
                        title="Mark as read">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] font-body font-[500] px-2 py-0.5 rounded-full ${t.color} ${t.bg}`}>{t.label}</span>
                    {n.severity === "critical" && <span className="text-[10px] font-body font-[500] text-rose-400">CRITICAL</span>}
                    {!n.read && <span className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
