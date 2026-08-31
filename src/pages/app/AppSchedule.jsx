import { useEffect, useState } from "react";
import { createRow, listRows } from "../../lib/db.js";
import { Calendar, Plus, X, AlertCircle } from "lucide-react";

export default function AppSchedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    listRows("schedule_items", { perPage: 100, sort: "planned_start", signal: ctrl.signal })
      .then(setItems)
      .catch(e => { if (e?.name !== "AbortError") console.error(e); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Schedule</h1>
          <p className="text-[14px] text-[#6b7a6e] font-body mt-0.5">{items.length} milestone{items.length !== 1 ? "s" : ""} scheduled</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 5}).map((_, i) => <div key={i} className="bg-[#0f1410] border border-white/[0.06] rounded-2xl h-[72px] animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Calendar className="w-10 h-10 text-[#3a4c3e] mx-auto mb-3" />
          <p className="text-[15px] text-white font-body font-[450] mb-1">No milestones yet</p>
          <p className="text-[13px] text-[#4a5c4e] font-body mb-4">Add key dates and milestones to keep projects on track</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const planned = item.planned_start || item.planned_end;
            const isLate = item.planned_end && new Date(item.planned_end) < new Date() && item.status !== "completed";
            return (
              <div key={item.id} className="bg-[#0f1410] border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === "completed" ? "bg-emerald-400" : isLate ? "bg-rose-400" : "bg-[#e8ff4d]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-white font-body font-[450]">{item.title || item.name || "Untitled"}</p>
                  {item.description && <p className="text-[12px] text-[#4a5c4e] font-body mt-0.5 truncate">{item.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  {planned && <p className="text-[13px] text-[#8a9b8e] font-body">{planned}</p>}
                  {isLate && <p className="text-[11px] text-rose-400 font-body">Overdue</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <NewMilestoneModal onClose={() => setShowModal(false)} onCreated={item => { setItems(is => [...is, item].sort((a,b) => (a.planned_start||"").localeCompare(b.planned_start||""))); setShowModal(false); }} />}
    </div>
  );
}

function NewMilestoneModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", project_id: "", planned_start: "", planned_end: "", status: "pending" });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listRows("projects", { perPage: 50, sort: "name" }).then(setProjects).catch(() => {});
  }, []);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setError(""); setLoading(true);
    try {
      const rec = await createRow("schedule_items", form);
      onCreated(rec);
    } catch {
      setError("Failed to add milestone. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1410] border border-white/[0.08] rounded-2xl w-full max-w-[440px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[16px] text-white">Add Milestone</h2>
          <button onClick={onClose} className="text-[#4a5c4e] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-3 py-2.5 rounded-xl font-body">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Milestone Title *</label>
            <input type="text" value={form.title} onChange={set("title")} placeholder="Foundation complete"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Project</label>
            <select value={form.project_id} onChange={set("project_id")}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
              <option value="">Select project…</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Start Date</label>
              <input type="date" value={form.planned_start} onChange={set("planned_start")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden" />
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">End Date</label>
              <input type="date" value={form.planned_end} onChange={set("planned_end")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] text-[#8a9b8e] hover:text-white text-[14px] font-body py-3 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#e8ff4d] hover:bg-white text-[#0b0f0e] text-[14px] font-display font-[700] py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Saving…" : "Add Milestone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
