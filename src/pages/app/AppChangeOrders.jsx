import { useEffect, useState } from "react";
import { createRow, listRows, updateRow } from "../../lib/db.js";
import { Plus, FileEdit, X, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

function fmt(n) {
  if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

const statusCfg = {
  pending:   { label: "Pending",   color: "text-[#8a9b8e]", bg: "bg-white/[0.04]",    border: "border-white/[0.08]",    Icon: Clock },
  in_review: { label: "In Review", color: "text-amber-400",  bg: "bg-amber-400/10",   border: "border-amber-400/20",   Icon: Clock },
  approved:  { label: "Approved",  color: "text-emerald-400",bg: "bg-emerald-400/10", border: "border-emerald-400/20", Icon: CheckCircle },
  rejected:  { label: "Rejected",  color: "text-rose-400",   bg: "bg-rose-400/10",    border: "border-rose-400/20",    Icon: XCircle },
};

export default function AppChangeOrders() {
  const [orders, setOrders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    Promise.all([
      listRows("change_orders", { perPage: 100, sort: "-created", signal: ctrl.signal }),
      listRows("projects", { perPage: 50, sort: "name", signal: ctrl.signal }),
    ]).then(([co, pr]) => {
      setOrders(co);
      setProjects(pr);
    }).catch(e => { if (e?.name !== "AbortError") console.error(e); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const totalApproved = orders.filter(o => o.status === "approved").reduce((a, o) => a + (o.cost_impact || 0), 0);
  const totalPending = orders.filter(o => o.status === "pending" || o.status === "in_review").reduce((a, o) => a + (o.cost_impact || 0), 0);

  function projectName(id) {
    return projects.find(p => p.id === id)?.name || "—";
  }

  async function updateStatus(id, status) {
    try {
      const updated = await updateRow("change_orders", id, { status });
      setOrders(os => os.map(o => o.id === id ? updated : o));
    } catch {}
  }

  const counts = { all: orders.length, pending: 0, in_review: 0, approved: 0, rejected: 0 };
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Change Orders</h1>
          <p className="text-[14px] text-[#6b7a6e] font-body mt-0.5">{orders.length} total · {orders.filter(o=>o.status==="pending"||o.status==="in_review").length} awaiting action</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
          <Plus className="w-4 h-4" /> New Change Order
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-[12px] text-[#6b7a6e] font-body mb-2">Approved cost impact</p>
          <p className="font-display font-[700] text-[22px] text-emerald-400 tracking-[-0.02em]">+{fmt(totalApproved)}</p>
        </div>
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-[12px] text-[#6b7a6e] font-body mb-2">Pending cost exposure</p>
          <p className="font-display font-[700] text-[22px] text-amber-400 tracking-[-0.02em]">+{fmt(totalPending)}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {[["all","All"],["pending","Pending"],["in_review","In Review"],["approved","Approved"],["rejected","Rejected"]].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`text-[13px] font-body font-[450] px-3.5 py-1.5 rounded-lg transition-all ${
              filter === k ? "bg-[#e8ff4d]/10 text-[#e8ff4d] border border-[#e8ff4d]/20" : "text-[#6b7a6e] hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}>
            {label} <span className={`ml-1 text-[11px] ${filter === k ? "text-[#e8ff4d]/60" : "text-[#4a5c4e]"}`}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="bg-[#0f1410] border border-white/[0.06] rounded-2xl h-[100px] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-12 text-center">
          <FileEdit className="w-10 h-10 text-[#3a4c3e] mx-auto mb-3" />
          <p className="text-[15px] text-white font-body font-[450] mb-1">No change orders</p>
          <p className="text-[13px] text-[#4a5c4e] font-body mb-4">Document scope changes and cost impacts here</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
            <Plus className="w-4 h-4" /> New Change Order
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const s = statusCfg[o.status] || statusCfg.pending;
            return (
              <div key={o.id} className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-body font-[500] text-[15px] text-white truncate">{o.title}</h3>
                    <p className="text-[12px] text-[#4a5c4e] font-body mt-0.5">{projectName(o.project_id)} · {o.requested_by && `Requested by ${o.requested_by}`}</p>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1.5 text-[11px] font-body font-[500] px-2.5 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
                    <s.Icon className="w-3 h-3" />{s.label}
                  </span>
                </div>
                {o.description && <p className="text-[13px] text-[#6b7a6e] font-body leading-relaxed mb-3">{o.description}</p>}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-[10px] text-[#4a5c4e] font-body uppercase tracking-wide">Cost Impact</p>
                      <p className="text-[14px] font-display font-[600] text-white">+{fmt(o.cost_impact || 0)}</p>
                    </div>
                    {o.schedule_impact_days > 0 && (
                      <div>
                        <p className="text-[10px] text-[#4a5c4e] font-body uppercase tracking-wide">Schedule</p>
                        <p className="text-[14px] font-display font-[600] text-amber-400">+{o.schedule_impact_days}d</p>
                      </div>
                    )}
                  </div>
                  {(o.status === "pending" || o.status === "in_review") && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateStatus(o.id, "rejected")}
                        className="text-[12px] text-rose-400 border border-rose-400/20 hover:bg-rose-400/10 px-3 py-1.5 rounded-lg font-body transition-all">
                        Reject
                      </button>
                      <button onClick={() => updateStatus(o.id, "approved")}
                        className="text-[12px] text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 px-3 py-1.5 rounded-lg font-body transition-all">
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <NewCOModal
          projects={projects}
          onClose={() => setShowModal(false)}
          onCreated={co => { setOrders(os => [co, ...os]); setShowModal(false); }}
        />
      )}
    </div>
  );
}

function NewCOModal({ projects, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", project_id: "", description: "", requested_by: "", cost_impact: "", schedule_impact_days: "", status: "pending", submitted_date: new Date().toISOString().split("T")[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.project_id) { setError("Please select a project."); return; }
    setError(""); setLoading(true);
    try {
      const rec = await createRow("change_orders", {
        ...form,
        cost_impact: parseFloat(form.cost_impact) || 0,
        schedule_impact_days: parseInt(form.schedule_impact_days) || 0,
      });
      onCreated(rec);
    } catch { setError("Failed to create change order. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1410] border border-white/[0.08] rounded-2xl w-full max-w-[480px] my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[16px] text-white">New Change Order</h2>
          <button onClick={onClose} className="text-[#4a5c4e] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-3 py-2.5 rounded-xl font-body"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {[
            { k: "title", label: "Title *", ph: "HVAC upgrade — Floor 3" },
            { k: "requested_by", label: "Requested By", ph: "J. Morales" },
          ].map(({ k, label, ph }) => (
            <div key={k}>
              <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">{label}</label>
              <input type="text" value={form[k]} onChange={set(k)} placeholder={ph}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Project *</label>
            <select value={form.project_id} onChange={set("project_id")}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
              <option value="">Select project…</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Describe the scope change and reason…"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden resize-none transition-all placeholder:text-[#3a4c3e]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Cost Impact ($)</label>
              <input type="number" value={form.cost_impact} onChange={set("cost_impact")} placeholder="42000"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Schedule (days)</label>
              <input type="number" value={form.schedule_impact_days} onChange={set("schedule_impact_days")} placeholder="0"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] text-[#8a9b8e] hover:text-white text-[14px] font-body py-3 rounded-xl transition-all">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#e8ff4d] hover:bg-white text-[#0b0f0e] text-[14px] font-display font-[700] py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Submitting…" : "Submit Change Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
