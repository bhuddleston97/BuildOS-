import { useEffect, useState } from "react";
import { createRow, listRows } from "../../lib/db.js";
import { useRealtimeRows } from "../../lib/useRealtimeRows.js";
import { Plus, Building2, Star, Phone, Mail, X, AlertCircle, ShieldCheck, ShieldAlert, Shield } from "lucide-react";

const complianceCfg = {
  compliant:     { label: "Compliant",      color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", Icon: ShieldCheck },
  expiring_soon: { label: "Expiring Soon",  color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",  Icon: ShieldAlert },
  non_compliant: { label: "Non-Compliant",  color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20",   Icon: ShieldAlert },
  pending:       { label: "Pending Review", color: "text-[#cbd5e1]",   bg: "bg-white/[0.04]",   border: "border-white/[0.08]",  Icon: Shield },
};

export default function AppVendors() {
  const { rows: vendors, setRows: setVendors } = useRealtimeRows("vendors", { perPage: 100, sort: "name" });
  const { rows: subs, setRows: setSubs, loading } = useRealtimeRows("subcontractors", { perPage: 100, sort: "name" });
  const [tab, setTab] = useState("vendors");
  const [showModal, setShowModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const list = tab === "vendors" ? vendors : subs;

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Vendors & Subs</h1>
          <p className="text-[14px] text-[#94a3b8] font-body mt-0.5">{vendors.length} vendor{vendors.length!==1?"s":""} · {subs.length} subcontractor{subs.length!==1?"s":""}</p>
        </div>
        <button onClick={() => tab === "vendors" ? setShowModal(true) : setShowSubModal(true)}
          className="flex items-center gap-2 bg-[#60a5fa] text-[#09090b] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
          <Plus className="w-4 h-4" /> Add {tab === "vendors" ? "Vendor" : "Subcontractor"}
        </button>
      </div>

      {/* Compliance summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(complianceCfg).map(([k, c]) => {
          const count = [...vendors, ...subs].filter(x => x.compliance_status === k).length;
          return (
            <div key={k} className={`bg-[#18181b] border rounded-xl p-4 ${c.border}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <c.Icon className={`w-3.5 h-3.5 ${c.color}`} />
                <span className={`text-[11px] font-body font-[500] ${c.color}`}>{c.label}</span>
              </div>
              <p className="font-display font-[700] text-[20px] text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-5 w-fit">
        {[["vendors","Vendors"],["subs","Subcontractors"]].map(([k,label])=>(
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 text-[13px] font-body font-[450] rounded-lg transition-all ${tab===k ? "bg-[#60a5fa] text-[#09090b] font-[600]" : "text-[#94a3b8] hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({length:4}).map((_,i)=><div key={i} className="bg-[#18181b] border border-white/[0.06] rounded-2xl h-[160px] animate-pulse" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-[#18181b] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Building2 className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="text-[15px] text-white font-body font-[450] mb-1">No {tab === "vendors" ? "vendors" : "subcontractors"} yet</p>
          <p className="text-[13px] text-[#94a3b8] font-body mb-4">Add your first entry to track compliance and contacts</p>
          <button onClick={() => tab === "vendors" ? setShowModal(true) : setShowSubModal(true)}
            className="inline-flex items-center gap-2 bg-[#60a5fa] text-[#09090b] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all">
            <Plus className="w-4 h-4" /> Add {tab === "vendors" ? "Vendor" : "Subcontractor"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map(v => <VendorCard key={v.id} vendor={v} />)}
        </div>
      )}

      {showModal && <VendorModal onClose={() => setShowModal(false)} onCreated={v => { setVendors(vs => [v, ...vs]); setShowModal(false); }} />}
      {showSubModal && <SubModal vendors={vendors} onClose={() => setShowSubModal(false)} onCreated={s => { setSubs(ss => [s, ...ss]); setShowSubModal(false); }} />}
    </div>
  );
}

function VendorCard({ vendor: v }) {
  const c = complianceCfg[v.compliance_status] || complianceCfg.pending;
  return (
    <div className="bg-[#18181b] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-body font-[500] text-[15px] text-white truncate">{v.name}</h3>
          <p className="text-[12px] text-[#94a3b8] font-body mt-0.5">{v.trade}</p>
        </div>
        <span className={`shrink-0 flex items-center gap-1 text-[11px] font-body font-[500] px-2.5 py-1 rounded-full border ${c.color} ${c.bg} ${c.border}`}>
          <c.Icon className="w-3 h-3" />{c.label}
        </span>
      </div>
      {v.rating > 0 && (
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({length: 5}).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < v.rating ? "text-[#60a5fa]" : "text-white/10"}`} fill={i < v.rating ? "currentColor" : "none"} />
          ))}
        </div>
      )}
      <div className="space-y-1.5">
        {v.contact_name && <p className="text-[12px] text-[#94a3b8] font-body">{v.contact_name}</p>}
        {v.phone && <div className="flex items-center gap-2 text-[12px] text-[#94a3b8] font-body"><Phone className="w-3 h-3" />{v.phone}</div>}
        {v.email && <div className="flex items-center gap-2 text-[12px] text-[#94a3b8] font-body"><Mail className="w-3 h-3" />{v.email}</div>}
        {v.insurance_expiry && <p className="text-[11px] text-[#94a3b8] font-body">Insurance exp: {v.insurance_expiry}</p>}
      </div>
    </div>
  );
}

function VendorModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", trade: "", contact_name: "", email: "", phone: "", license_number: "", insurance_expiry: "", compliance_status: "pending", rating: "0" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Vendor name is required."); return; }
    setError(""); setLoading(true);
    try {
      const rec = await createRow("vendors", { ...form, rating: parseInt(form.rating) || 0 });
      onCreated(rec);
    } catch { setError("Failed to add vendor. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl w-full max-w-[480px] my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[16px] text-white">Add Vendor</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-3 py-2.5 rounded-xl font-body"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {[
            { k: "name", label: "Company Name *", ph: "Apex Steel Fabricators" },
            { k: "trade", label: "Trade / Specialty", ph: "Structural Steel" },
            { k: "contact_name", label: "Contact Name", ph: "Carlos Reyes" },
            { k: "phone", label: "Phone", ph: "(415) 882-3300" },
            { k: "email", label: "Email", ph: "carlos@vendor.com", type: "email" },
            { k: "license_number", label: "License #", ph: "CA-STR-4821" },
          ].map(({ k, label, ph, type }) => (
            <div key={k}>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">{label}</label>
              <input type={type||"text"} value={form[k]} onChange={set(k)} placeholder={ph}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-slate-500" />
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Insurance Expiry</label>
              <input type="date" value={form.insurance_expiry} onChange={set("insurance_expiry")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden" />
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Compliance</label>
              <select value={form.compliance_status} onChange={set("compliance_status")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
                <option value="pending">Pending</option>
                <option value="compliant">Compliant</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="non_compliant">Non-Compliant</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/[0.04] border border-white/[0.08] text-[#cbd5e1] hover:text-white text-[14px] font-body py-3 rounded-xl transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#60a5fa] hover:bg-white text-[#09090b] text-[14px] font-display font-[700] py-3 rounded-xl transition-all disabled:opacity-50">{loading ? "Adding…" : "Add Vendor"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubModal({ vendors, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", trade: "", vendor_id: "", contact_name: "", email: "", phone: "", license_number: "", insurance_expiry: "", compliance_status: "pending", w9_on_file: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setError(""); setLoading(true);
    try {
      const rec = await createRow("subcontractors", form);
      onCreated(rec);
    } catch { setError("Failed to add subcontractor. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl w-full max-w-[480px] my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[16px] text-white">Add Subcontractor</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-3 py-2.5 rounded-xl font-body"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {[
            { k: "name", label: "Company Name *", ph: "Pacific MEP Solutions" },
            { k: "trade", label: "Trade", ph: "Electrical" },
            { k: "contact_name", label: "Contact Name", ph: "James Wu" },
            { k: "phone", label: "Phone", ph: "(510) 442-1100" },
            { k: "email", label: "Email", ph: "james@sub.com", type: "email" },
            { k: "license_number", label: "License #", ph: "CA-ELE-5577" },
          ].map(({ k, label, ph, type }) => (
            <div key={k}>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">{label}</label>
              <input type={type||"text"} value={form[k]} onChange={set(k)} placeholder={ph}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-slate-500" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Parent Vendor (optional)</label>
            <select value={form.vendor_id} onChange={set("vendor_id")}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
              <option value="">None</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Insurance Expiry</label>
              <input type="date" value={form.insurance_expiry} onChange={set("insurance_expiry")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden" />
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Compliance</label>
              <select value={form.compliance_status} onChange={set("compliance_status")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
                <option value="pending">Pending</option>
                <option value="compliant">Compliant</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="non_compliant">Non-Compliant</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.w9_on_file} onChange={e => setForm(f => ({ ...f, w9_on_file: e.target.checked }))}
              className="w-4 h-4 rounded border border-white/20 bg-white/[0.04] accent-[#60a5fa]" />
            <span className="text-[13px] text-[#cbd5e1] font-body">W-9 on file</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/[0.04] border border-white/[0.08] text-[#cbd5e1] hover:text-white text-[14px] font-body py-3 rounded-xl transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#60a5fa] hover:bg-white text-[#09090b] text-[14px] font-display font-[700] py-3 rounded-xl transition-all disabled:opacity-50">{loading ? "Adding…" : "Add Subcontractor"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
