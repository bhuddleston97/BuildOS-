import { useEffect, useState } from "react";
import { createRow, listRows } from "../../lib/db.js";
import { useRealtimeRows } from "../../lib/useRealtimeRows.js";
import { Plus, FileText, X, AlertCircle, Sun, Cloud, CloudRain } from "lucide-react";

const weatherIcons = { clear: "☀️", cloudy: "☁️", rain: "🌧️", wind: "💨", snow: "❄️", delay: "⛔" };

export default function AppReports() {
  const { rows: reports, loading, setRows: setReports } = useRealtimeRows("field_reports", { perPage: 50, sort: "-created" });
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Field Reports</h1>
          <p className="text-[14px] text-[#94a3b8] font-body mt-0.5">{reports.length} report{reports.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#60a5fa] text-[#09090b] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
          <Plus className="w-4 h-4" /> Submit Report
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 4}).map((_, i) => <div key={i} className="bg-[#18181b] border border-white/[0.06] rounded-2xl h-[120px] animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#18181b] border border-white/[0.06] rounded-2xl p-12 text-center">
          <FileText className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="text-[15px] text-white font-body font-[450] mb-1">No field reports yet</p>
          <p className="text-[13px] text-[#94a3b8] font-body mb-4">Submit your first daily report from the field</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#60a5fa] text-[#09090b] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
            <Plus className="w-4 h-4" /> Submit Report
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-[#18181b] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-body font-[500] text-white">{r.submitted_by || "Unknown"}</span>
                    {r.weather && <span className="text-[16px]">{weatherIcons[r.weather] || "☀️"}</span>}
                    {r.report_date && <span className="text-[12px] text-[#94a3b8] font-body">{r.report_date}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-[12px] text-[#94a3b8] font-body">
                  {r.crew_count > 0 && <span>{r.crew_count} crew</span>}
                  {r.hours_worked > 0 && <span>{r.hours_worked}h</span>}
                  {r.safety_incidents > 0 && (
                    <span className="text-rose-400 font-[500]">{r.safety_incidents} incident{r.safety_incidents !== 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>
              {r.work_performed && <p className="text-[14px] text-[#cbd5e1] font-body leading-relaxed">{r.work_performed}</p>}
              {r.issues && <p className="text-[13px] text-amber-400/80 font-body mt-2 leading-relaxed">⚠ {r.issues}</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && <NewReportModal onClose={() => setShowModal(false)} onCreated={r => { setReports(rs => [r, ...rs]); setShowModal(false); }} />}
    </div>
  );
}

function NewReportModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ project_id: "", submitted_by: "", report_date: new Date().toISOString().split("T")[0], weather: "clear", work_performed: "", issues: "", crew_count: "", hours_worked: "", safety_incidents: "0" });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listRows("projects", { perPage: 50, sort: "name" }).then(setProjects).catch(() => {});
  }, []);

  function set(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.project_id) { setError("Please select a project."); return; }
    if (!form.work_performed.trim()) { setError("Work performed summary is required."); return; }
    setError(""); setLoading(true);
    try {
      const rec = await createRow("field_reports", {
        ...form,
        crew_count: parseInt(form.crew_count) || 0,
        hours_worked: parseInt(form.hours_worked) || 0,
        safety_incidents: parseInt(form.safety_incidents) || 0,
      });
      onCreated(rec);
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl w-full max-w-[500px] my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[16px] text-white">Submit Field Report</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-3 py-2.5 rounded-xl font-body">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Project *</label>
              <select value={form.project_id} onChange={set("project_id")}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
                <option value="">Select project…</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Submitted By</label>
              <input type="text" value={form.submitted_by} onChange={set("submitted_by")} placeholder="Your name"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Date</label>
              <input type="date" value={form.report_date} onChange={set("report_date")}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden" />
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Weather</label>
              <select value={form.weather} onChange={set("weather")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
                <option value="clear">☀️ Clear</option>
                <option value="cloudy">☁️ Cloudy</option>
                <option value="rain">🌧️ Rain</option>
                <option value="wind">💨 Wind</option>
                <option value="snow">❄️ Snow</option>
                <option value="delay">⛔ Weather Delay</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Crew Count</label>
              <input type="number" min="0" value={form.crew_count} onChange={set("crew_count")} placeholder="0"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Hours Worked</label>
              <input type="number" min="0" value={form.hours_worked} onChange={set("hours_worked")} placeholder="0"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-slate-500" />
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Safety Incidents</label>
              <input type="number" min="0" value={form.safety_incidents} onChange={set("safety_incidents")} placeholder="0"
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Work Performed *</label>
            <textarea value={form.work_performed} onChange={set("work_performed")} rows={3} placeholder="Describe what was accomplished today…"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all resize-none placeholder:text-slate-500" />
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Issues / Notes</label>
            <textarea value={form.issues} onChange={set("issues")} rows={2} placeholder="Any problems, delays, or items to flag…"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all resize-none placeholder:text-slate-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] text-[#cbd5e1] hover:text-white text-[14px] font-body py-3 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#60a5fa] hover:bg-white text-[#09090b] text-[14px] font-display font-[700] py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
