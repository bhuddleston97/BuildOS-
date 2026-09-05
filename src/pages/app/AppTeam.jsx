import { useEffect, useState } from "react";
import { listRows } from "../../lib/db.js";
import { useRealtimeRows } from "../../lib/useRealtimeRows.js";
import { useAuth } from "../../lib/auth.jsx";
import { supabase } from "../../lib/supabase.js";
import { Users, Mail, X, AlertCircle, Check } from "lucide-react";

export default function AppTeam() {
  const { user } = useAuth();
  const { rows: members, loading, error: realtimeError } = useRealtimeRows("users", { perPage: 50, sort: "-created" });
  const [error, setError] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const canInvite = ["owner", "admin", "manager"].includes(user?.role);

  useEffect(() => {
    if (realtimeError) {
      setError(realtimeError?.code === "42501" || realtimeError?.status === 403
        ? "You need manager-level access to view team members."
        : "Unable to load team list.");
    }
  }, [realtimeError]);

  const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Team</h1>
            <p className="text-[14px] text-[#94a3b8] font-body mt-0.5">Manage your organization's members</p>
          </div>
          {canInvite && <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 bg-[#60a5fa] text-[#09090b] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl"><Mail className="w-4 h-4" /> Invite member</button>}
        </div>
      </div>

      {/* Your profile */}
      <div className="bg-[#18181b] border border-[#60a5fa]/20 rounded-2xl p-5 mb-6">
        <p className="text-[11px] font-body font-[500] text-[#60a5fa] tracking-wide uppercase mb-3">Your Profile</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#60a5fa]/20 text-[#60a5fa] text-[16px] font-display font-[700] flex items-center justify-center shrink-0">
            {initials(user?.full_name || "")}
          </div>
          <div>
            <p className="text-[15px] text-white font-body font-[500]">{user?.full_name || "—"}</p>
            <p className="text-[13px] text-[#94a3b8] font-body">{user?.email}</p>
            {user?.job_title && <p className="text-[12px] text-[#94a3b8] font-body mt-0.5">{user.job_title}</p>}
          </div>
          <div className="ml-auto">
            <span className="text-[11px] font-body font-[500] px-2.5 py-1 rounded-full bg-[#60a5fa]/10 text-[#60a5fa] border border-[#60a5fa]/20 capitalize">
              {user?.role || "member"}
            </span>
          </div>
        </div>
      </div>

      {/* Team list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 4}).map((_, i) => <div key={i} className="bg-[#18181b] border border-white/[0.06] rounded-2xl h-[68px] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[#18181b] border border-white/[0.06] rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="text-[15px] text-white font-body font-[450] mb-1">Team list restricted</p>
          <p className="text-[13px] text-[#94a3b8] font-body">{error}</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-[#18181b] border border-white/[0.06] rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <p className="text-[14px] text-[#94a3b8] font-body">No other team members yet</p>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.04]">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] text-[#cbd5e1] text-[13px] font-display font-[600] flex items-center justify-center shrink-0">
                {initials(m.full_name || "")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-white font-body font-[450] truncate">{m.full_name || "—"}</p>
                <p className="text-[12px] text-[#94a3b8] font-body truncate">{m.email}{m.job_title ? ` · ${m.job_title}` : ""}</p>
              </div>
              <span className={`text-[11px] font-body font-[500] px-2.5 py-1 rounded-full border capitalize shrink-0 ${
                m.is_active === false ? "bg-white/[0.03] text-[#94a3b8] border-white/[0.06]" : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
              }`}>
                {m.role || "member"}
              </span>
            </div>
          ))}
        </div>
      )}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function InviteModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    const { error: inviteError } = await supabase.functions.invoke("invite-member", { body: { email, role } });
    if (inviteError) setError(inviteError.message || "Unable to send invitation.");
    else setMessage("Invitation sent. It expires in 7 days.");
    setSaving(false);
  }

  return <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={event => event.target === event.currentTarget && onClose()}>
    <form onSubmit={submit} className="bg-[#18181b] border border-white/[0.08] rounded-2xl w-full max-w-[440px] p-6 space-y-4">
      <div className="flex items-center justify-between"><h2 className="font-display font-[650] text-[18px] text-white">Invite a team member</h2><button type="button" onClick={onClose} aria-label="Close"><X className="w-5 h-5 text-[#94a3b8]" /></button></div>
      {error && <p role="alert" className="flex items-center gap-2 text-rose-400 text-[13px]"><AlertCircle className="w-4 h-4" />{error}</p>}
      {message && <p role="status" className="flex items-center gap-2 text-emerald-400 text-[13px]"><Check className="w-4 h-4" />{message}</p>}
      <div><label className="block text-[11px] text-[#cbd5e1] mb-1.5 uppercase">Work email</label><input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3.5 py-3 rounded-xl outline-hidden" placeholder="teammate@company.com" /></div>
      <div><label className="block text-[11px] text-[#cbd5e1] mb-1.5 uppercase">Role</label><select value={role} onChange={event => setRole(event.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] text-white px-3.5 py-3 rounded-xl outline-hidden"><option value="member">Member</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div>
      <button disabled={saving || Boolean(message)} className="w-full bg-[#60a5fa] text-[#09090b] font-display font-[700] py-3 rounded-xl disabled:opacity-50">{saving ? "Sending…" : "Send invitation"}</button>
    </form>
  </div>;
}
