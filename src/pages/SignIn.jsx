import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function SignIn() {
  const [tab, setTab] = useState("signin");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-[#080c0b] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-[#0b0f0e] border-r border-white/[0.05] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage:"linear-gradient(#e8ff4d 1px,transparent 1px),linear-gradient(90deg,#e8ff4d 1px,transparent 1px)",backgroundSize:"48px 48px"}} />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#e8ff4d]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#e8ff4d] rounded-[7px]" />
              <svg viewBox="0 0 20 20" className="relative w-5 h-5 z-10" fill="none">
                <path d="M4 13.5h12M4 10h8M4 6.5h5" stroke="#0b0f0e" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-[750] text-[18px] text-white tracking-[-0.02em]">
              Build<span className="text-[#e8ff4d]">OS</span>
            </span>
          </Link>
        </div>

        <div className="relative space-y-6">
          <div>
            <p className="text-[11px] font-body font-[500] text-[#e8ff4d] tracking-[0.12em] uppercase mb-4">
              Construction Intelligence
            </p>
            <h2 className="font-display font-[700] text-[38px] leading-[1.1] text-white tracking-[-0.02em]">
              Every project.<br />Every dollar.<br />Every crew member.
            </h2>
          </div>
          <p className="text-[15px] text-[#6b7a6e] font-body leading-relaxed max-w-[320px]">
            Real-time visibility across your entire portfolio — from the job site to the boardroom.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { val: "340+", label: "Active projects" },
              { val: "$2.1B", label: "Managed this year" },
              { val: "98%", label: "On-schedule rate" },
              { val: "4,200+", label: "Field workers" },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                <div className="font-display font-[700] text-[22px] text-[#e8ff4d] tracking-[-0.02em]">{s.val}</div>
                <div className="text-[12px] text-[#6b7a6e] font-body mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-[13px] text-[#4a5c4e] font-body italic">
            "BuildOS transformed how we run 30+ concurrent projects."
          </p>
          <p className="text-[12px] text-[#3a4c3e] font-body mt-1">— VP Construction, Turner-Pacific Group</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-10">
          <Link to="/" className="flex items-center gap-3 justify-center">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#e8ff4d] rounded-[6px]" />
              <svg viewBox="0 0 20 20" className="relative w-4.5 h-4.5 z-10" fill="none">
                <path d="M4 13.5h12M4 10h8M4 6.5h5" stroke="#0b0f0e" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-[750] text-[17px] text-white tracking-[-0.02em]">
              Build<span className="text-[#e8ff4d]">OS</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-8">
            {["signin", "signup"].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 text-[13.5px] font-body font-[500] rounded-lg transition-all duration-200 ${
                  tab === t ? "bg-[#e8ff4d] text-[#0b0f0e] font-[600]" : "text-[#6b7a6e] hover:text-white"
                }`}>
                {t === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {tab === "signin"
            ? <SignInForm error={error} setError={setError} />
            : <SignUpForm error={error} setError={setError} />
          }
        </div>

        <p className="mt-8 text-[12px] text-[#3a4c3e] font-body text-center">
          <Link to="/" className="hover:text-[#6b7a6e] transition-colors">← Back to BuildOS.com</Link>
        </p>
      </div>
    </div>
  );
}

function SignInForm({ error, setError }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/app");
    } catch {
      setError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="font-display font-[700] text-[28px] text-white tracking-[-0.02em] mb-1">Welcome back</h1>
        <p className="text-[14px] text-[#6b7a6e] font-body">Sign in to your BuildOS workspace</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] font-body px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-[12px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Work Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 focus:bg-white/[0.06] text-white text-[14px] font-body px-4 py-3 rounded-xl outline-hidden transition-all duration-200 placeholder:text-[#3a4c3e]" />
        </div>
        <div>
          <label className="block text-[12px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 focus:bg-white/[0.06] text-white text-[14px] font-body px-4 py-3 pr-12 rounded-xl outline-hidden transition-all duration-200 placeholder:text-[#3a4c3e]" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5c4e] hover:text-[#8a9b8e] transition-colors p-1">
              {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-[#e8ff4d] hover:bg-white text-[#0b0f0e] font-display font-[700] text-[15px] py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 tracking-[-0.01em]">
        {loading ? "Signing in…" : "Sign in to BuildOS"}
      </button>
    </form>
  );
}

function SignUpForm({ error, setError }) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", job_title: "", password: "" });

  function set(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setLoading(true);
    try {
      await signUp(form);
      navigate("/app");
    } catch (err) {
      const msg = err?.response?.data?.email?.message || "Something went wrong. Please try again.";
      setError(msg.includes("unique") ? "An account with that email already exists." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="font-display font-[700] text-[28px] text-white tracking-[-0.02em] mb-1">Create your account</h1>
        <p className="text-[14px] text-[#6b7a6e] font-body">Start managing your projects in minutes</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] font-body px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="space-y-3">
        {[
          { k: "full_name", label: "Full Name", type: "text", ph: "Jane Smith" },
          { k: "email", label: "Work Email", type: "email", ph: "jane@company.com" },
          { k: "job_title", label: "Job Title", type: "text", ph: "Project Manager" },
        ].map(({ k, label, type, ph }) => (
          <div key={k}>
            <label className="block text-[12px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">{label}</label>
            <input type={type} required={k !== "job_title"} value={form[k]} onChange={set(k)} placeholder={ph}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 focus:bg-white/[0.06] text-white text-[14px] font-body px-4 py-3 rounded-xl outline-hidden transition-all duration-200 placeholder:text-[#3a4c3e]" />
          </div>
        ))}
        <div>
          <label className="block text-[12px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 focus:bg-white/[0.06] text-white text-[14px] font-body px-4 py-3 pr-12 rounded-xl outline-hidden transition-all duration-200 placeholder:text-[#3a4c3e]" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5c4e] hover:text-[#8a9b8e] transition-colors p-1">
              {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-[#e8ff4d] hover:bg-white text-[#0b0f0e] font-display font-[700] text-[15px] py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 tracking-[-0.01em]">
        {loading ? "Creating account…" : "Create my account"}
      </button>

      <p className="text-[12px] text-[#4a5c4e] font-body text-center">
        By creating an account you agree to our Terms of Service.
      </p>
    </form>
  );
}
