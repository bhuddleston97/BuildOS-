import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createRow, listRows } from "../../lib/db.js";
import { Plus, Search, FolderOpen, Users, MapPin, X, AlertCircle } from "lucide-react";

function fmt(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

const statusConfig = {
  active: { label: "On Track", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  at_risk: { label: "At Risk", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  delayed: { label: "Delayed", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
  completed: { label: "Complete", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20" },
};

export default function AppProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  // Wizard button is a Link, modal is for quick-add

  useEffect(() => {
    const ctrl = new AbortController();
    listRows("projects", { perPage: 50, sort: "-created", signal: ctrl.signal })
      .then(setProjects)
      .catch(e => { if (e?.name !== "AbortError") console.error(e); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Projects</h1>
          <p className="text-[14px] text-[#6b7a6e] font-body mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link to="/app/projects/new"
          className="flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all duration-200 min-h-[44px]">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5c4e]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
          className="w-full max-w-[380px] bg-[#0f1410] border border-white/[0.06] text-white text-[14px] font-body pl-10 pr-4 py-2.5 rounded-xl outline-hidden focus:border-[#e8ff4d]/40 transition-colors placeholder:text-[#3a4c3e]" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="bg-[#0f1410] border border-white/[0.06] rounded-2xl h-[180px] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-12 text-center">
          <FolderOpen className="w-10 h-10 text-[#3a4c3e] mx-auto mb-3" />
          <p className="text-[15px] text-white font-body font-[450] mb-1">{search ? "No projects match your search" : "No projects yet"}</p>
          <p className="text-[13px] text-[#4a5c4e] font-body mb-4">
            {search ? "Try a different search term" : "Create your first project to get started"}
          </p>
          {!search && (
            <Link to="/app/projects/new"
              className="inline-flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
              <Plus className="w-4 h-4" /> New Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} onUpdate={updated => setProjects(ps => ps.map(x => x.id === updated.id ? updated : x))} />)}
        </div>
      )}

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreated={p => { setProjects(ps => [p, ...ps]); setShowModal(false); }} />}
    </div>
  );
}

function ProjectCard({ project: p }) {
  const s = statusConfig[p.status] || statusConfig.active;
  const pct = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
  return (
    <div className="bg-[#0f1410] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-body font-[500] text-[15px] text-white group-hover:text-[#e8ff4d] transition-colors line-clamp-1">{p.name}</h3>
          <p className="text-[12px] text-[#4a5c4e] font-body mt-0.5 truncate">{p.client}</p>
        </div>
        <span className={`shrink-0 text-[11px] font-body font-[500] px-2.5 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
          {s.label}
        </span>
      </div>

      {p.location && (
        <div className="flex items-center gap-1.5 text-[12px] text-[#4a5c4e] font-body mb-3">
          <MapPin className="w-3 h-3" />
          {p.location}
        </div>
      )}

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#4a5c4e] font-body">{fmt(p.spent)} spent of {fmt(p.budget)}</span>
          <span className="text-[12px] text-[#6b7a6e] font-body">{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-rose-400" : pct > 70 ? "bg-amber-400" : "bg-[#e8ff4d]"}`}
            style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-[#4a5c4e] font-body">
          <Users className="w-3.5 h-3.5" />
          {p.crew_count || 0} crew
        </div>
        {p.phase && <span className="text-[11px] text-[#4a5c4e] font-body truncate max-w-[140px]">{p.phase}</span>}
      </div>
    </div>
  );
}

function NewProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", client: "", location: "", phase: "", budget: "", status: "active" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Project name is required."); return; }
    setError(""); setLoading(true);
    try {
      const rec = await createRow("projects", {
        ...form,
        budget: parseFloat(form.budget) || 0,
        spent: 0,
        progress: 0,
        crew_count: 0,
      });
      onCreated(rec);
    } catch (err) {
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1410] border border-white/[0.08] rounded-2xl w-full max-w-[480px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[16px] text-white">New Project</h2>
          <button onClick={onClose} className="text-[#4a5c4e] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-3 py-2.5 rounded-xl font-body">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {[
            { k: "name", label: "Project Name *", ph: "Downtown Office Retrofit" },
            { k: "client", label: "Client", ph: "Zenith Properties LLC" },
            { k: "location", label: "Location", ph: "Central Business District" },
            { k: "phase", label: "Current Phase", ph: "Foundation" },
            { k: "budget", label: "Budget ($)", ph: "1350000", type: "number" },
          ].map(({ k, label, ph, type }) => (
            <div key={k}>
              <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">{label}</label>
              <input type={type || "text"} value={form[k]} onChange={set(k)} placeholder={ph}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Status</label>
            <select value={form.status} onChange={set("status")}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all">
              <option value="active">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] text-[#8a9b8e] hover:text-white text-[14px] font-body font-[450] py-3 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#e8ff4d] hover:bg-white text-[#0b0f0e] text-[14px] font-display font-[700] py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Creating…" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
