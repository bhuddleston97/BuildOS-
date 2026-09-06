import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function SignIn() {
  const [tab, setTab] = useState("signin");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-[#09090b] border-r border-white/[0.05] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage:"linear-gradient(#60a5fa 1px,transparent 1px),linear-gradient(90deg,#60a5fa 1px,transparent 1px)",backgroundSize:"48px 48px"}} />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#60a5fa]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#60a5fa] rounded-[7px]" />
              <svg viewBox="0 0 20 20" className="relative w-5 h-5 z-10" fill="none">
                <path d="M4 13.5h12M4 10h8M4 6.5h5" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-[750] text-[18px] text-white tracking-[-0.02em]">
              Build<span className="text-[#60a5fa]">OS</span>
            </span>
          </Link>
        </div>

        <div className="relative space-y-6">
          <div>
            <p className="text-[11px] font-body font-[500] text-[#60a5fa] tracking-[0.12em] uppercase mb-4">
              Construction workspace
            </p>
            <h2 className="font-display font-[700] text-[38px] leading-[1.1] text-white tracking-[-0.02em]">
              Every project.<br />Every dollar.<br />Every crew member.
            </h2>
          </div>
          <p className="text-[15px] text-[#94a3b8] font-body leading-relaxed max-w-[320px]">
            Keep your project work organized, from planning to the daily field report.
          </p>

        </div>

        <p className="relative text-sm text-slate-400">A focused workspace for construction projects and daily operations.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-10">
          <Link to="/" className="flex items-center gap-3 justify-center">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#60a5fa] rounded-[6px]" />
              <svg viewBox="0 0 20 20" className="relative w-4.5 h-4.5 z-10" fill="none">
                <path d="M4 13.5h12M4 10h8M4 6.5h5" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-[750] text-[17px] text-white tracking-[-0.02em]">
              Build<span className="text-[#60a5fa]">OS</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-8">
            {["signin", "signup"].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 text-[13.5px] font-body font-[500] rounded-lg transition-all duration-200 ${
                  tab === t ? "bg-[#60a5fa] text-[#09090b] font-[600]" : "text-[#94a3b8] hover:text-white"
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

        <p className="mt-8 text-[12px] text-[#94a3b8] font-body text-center">
          <Link to="/" className="hover:text-[#94a3b8] transition-colors">← Back to BuildOS.com</Link>
        </p>
      </div>
    </div>
  );
}

function SignInForm({ error, setError }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
      navigate(searchParams.get("redirect") || "/app");
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
        <p className="text-[14px] text-[#94a3b8] font-body">Sign in to your BuildOS workspace</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] font-body px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-[12px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Work Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 focus:bg-white/[0.06] text-white text-[14px] font-body px-4 py-3 rounded-xl outline-hidden transition-all duration-200 placeholder:text-slate-500" />
        </div>
        <div>
          <label className="block text-[12px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 focus:bg-white/[0.06] text-white text-[14px] font-body px-4 py-3 pr-12 rounded-xl outline-hidden transition-all duration-200 placeholder:text-slate-500" />
            <button type="button" aria-label={showPass ? "Hide password" : "Show password"} onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#cbd5e1] transition-colors p-1">
              {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-[#60a5fa] hover:bg-white text-[#09090b] font-display font-[700] text-[15px] py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 tracking-[-0.01em]">
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
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", job_title: "", password: "" });

  function set(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setMessage(""); setLoading(true);
    try {
      const result = await signUp(form);
      if (result?.requiresEmailConfirmation) {
        setMessage("Check your email to confirm your account before signing in.");
        return;
      }
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
        <p className="text-[14px] text-[#94a3b8] font-body">Start managing your projects in minutes</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] font-body px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {message && <div role="status" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[13px] font-body px-4 py-3 rounded-xl">{message}</div>}

      <div className="space-y-3">
        {[
          { k: "full_name", label: "Full Name", type: "text", ph: "Jane Smith" },
          { k: "email", label: "Work Email", type: "email", ph: "jane@company.com" },
          { k: "job_title", label: "Job Title", type: "text", ph: "Project Manager" },
        ].map(({ k, label, type, ph }) => (
          <div key={k}>
            <label className="block text-[12px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">{label}</label>
            <input type={type} required={k !== "job_title"} value={form[k]} onChange={set(k)} placeholder={ph}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 focus:bg-white/[0.06] text-white text-[14px] font-body px-4 py-3 rounded-xl outline-hidden transition-all duration-200 placeholder:text-slate-500" />
          </div>
        ))}
        <div>
          <label className="block text-[12px] font-body font-[500] text-[#cbd5e1] mb-1.5 tracking-wide uppercase">Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#60a5fa]/50 focus:bg-white/[0.06] text-white text-[14px] font-body px-4 py-3 pr-12 rounded-xl outline-hidden transition-all duration-200 placeholder:text-slate-500" />
            <button type="button" aria-label={showPass ? "Hide password" : "Show password"} onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#cbd5e1] transition-colors p-1">
              {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-[#60a5fa] hover:bg-white text-[#09090b] font-display font-[700] text-[15px] py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 tracking-[-0.01em]">
        {loading ? "Creating account…" : "Create my account"}
      </button>

      <p className="text-[12px] text-[#94a3b8] font-body text-center">
        Use your work email to create your account.
      </p>
    </form>
  );
}
