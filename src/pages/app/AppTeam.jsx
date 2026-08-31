import { useEffect, useState } from "react";
import { listRows } from "../../lib/db.js";
import { useAuth } from "../../lib/auth.jsx";
import { Users } from "lucide-react";

export default function AppTeam() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    listRows("users", { perPage: 50, sort: "-created", signal: ctrl.signal })
      .then(setMembers)
      .catch(e => {
        if (e?.name !== "AbortError") {
          if (e?.code === "42501" || e?.status === 403) {
            setError("You need manager-level access to view team members.");
          } else {
            setError("Unable to load team list.");
          }
        }
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Team</h1>
        <p className="text-[14px] text-[#6b7a6e] font-body mt-0.5">Manage your organization's members</p>
      </div>

      {/* Your profile */}
      <div className="bg-[#0f1410] border border-[#e8ff4d]/20 rounded-2xl p-5 mb-6">
        <p className="text-[11px] font-body font-[500] text-[#e8ff4d] tracking-wide uppercase mb-3">Your Profile</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#e8ff4d]/20 text-[#e8ff4d] text-[16px] font-display font-[700] flex items-center justify-center shrink-0">
            {initials(user?.full_name || "")}
          </div>
          <div>
            <p className="text-[15px] text-white font-body font-[500]">{user?.full_name || "—"}</p>
            <p className="text-[13px] text-[#4a5c4e] font-body">{user?.email}</p>
            {user?.job_title && <p className="text-[12px] text-[#6b7a6e] font-body mt-0.5">{user.job_title}</p>}
          </div>
          <div className="ml-auto">
            <span className="text-[11px] font-body font-[500] px-2.5 py-1 rounded-full bg-[#e8ff4d]/10 text-[#e8ff4d] border border-[#e8ff4d]/20 capitalize">
              {user?.role || "member"}
            </span>
          </div>
        </div>
      </div>

      {/* Team list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 4}).map((_, i) => <div key={i} className="bg-[#0f1410] border border-white/[0.06] rounded-2xl h-[68px] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-[#3a4c3e] mx-auto mb-3" />
          <p className="text-[15px] text-white font-body font-[450] mb-1">Team list restricted</p>
          <p className="text-[13px] text-[#4a5c4e] font-body">{error}</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-8 text-center">
          <Users className="w-10 h-10 text-[#3a4c3e] mx-auto mb-3" />
          <p className="text-[14px] text-[#4a5c4e] font-body">No other team members yet</p>
        </div>
      ) : (
        <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.04]">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] text-[#8a9b8e] text-[13px] font-display font-[600] flex items-center justify-center shrink-0">
                {initials(m.full_name || "")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-white font-body font-[450] truncate">{m.full_name || "—"}</p>
                <p className="text-[12px] text-[#4a5c4e] font-body truncate">{m.email}{m.job_title ? ` · ${m.job_title}` : ""}</p>
              </div>
              <span className={`text-[11px] font-body font-[500] px-2.5 py-1 rounded-full border capitalize shrink-0 ${
                m.is_active === false ? "bg-white/[0.03] text-[#4a5c4e] border-white/[0.06]" : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
              }`}>
                {m.role || "member"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
