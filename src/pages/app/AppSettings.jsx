import { useState } from "react";
import { useAuth } from "../../lib/auth.jsx";
import { updateRow } from "../../lib/db.js";
import { Check, AlertCircle } from "lucide-react";

export default function AppSettings() {
  const { user, signOut } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || "", job_title: user?.job_title || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSave(e) {
    e.preventDefault();
    setError(""); setSaving(true); setSaved(false);
    try {
      await updateRow("users", user.id, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[640px] mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Settings</h1>
        <p className="text-[14px] text-[#6b7a6e] font-body mt-0.5">Manage your account</p>
      </div>

      <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[15px] text-white">Profile</h2>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-3 py-2.5 rounded-xl font-body">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] px-3 py-2.5 rounded-xl font-body">
              <Check className="w-4 h-4 shrink-0" />Profile saved successfully
            </div>
          )}
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Email</label>
            <input type="email" value={user?.email || ""} disabled
              className="w-full bg-white/[0.02] border border-white/[0.05] text-[#4a5c4e] text-[14px] font-body px-4 py-3 rounded-xl outline-hidden cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Full Name</label>
            <input type="text" value={form.full_name} onChange={set("full_name")} placeholder="Jane Smith"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-4 py-3 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Job Title</label>
            <input type="text" value={form.job_title} onChange={set("job_title")} placeholder="Project Manager"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-4 py-3 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
          </div>
          <button type="submit" disabled={saving}
            className="bg-[#e8ff4d] hover:bg-white text-[#0b0f0e] text-[14px] font-display font-[700] px-6 py-3 rounded-xl transition-all disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      <div className="bg-[#0f1410] border border-rose-500/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[15px] text-white">Account</h2>
        </div>
        <div className="p-6">
          <p className="text-[13px] text-[#6b7a6e] font-body mb-4">Sign out of your BuildOS account on this device.</p>
          <button onClick={signOut}
            className="text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 text-[14px] font-body font-[450] px-5 py-2.5 rounded-xl transition-all">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
