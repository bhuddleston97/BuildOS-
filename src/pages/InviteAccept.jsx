import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "../lib/auth.jsx";
import { supabase } from "../lib/supabase.js";

export default function InviteAccept() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { setState("signin"); return; }
    const token = params.get("token");
    if (!token) { setState("error"); setMessage("This invitation link is incomplete."); return; }
    supabase.functions.invoke("accept-invitation", { body: { token } }).then(({ data, error }) => {
      if (error) { setState("error"); setMessage(error.message || "This invitation is invalid or expired."); return; }
      setState("success");
      setMessage(`You joined ${data?.organizationId ? "the BuildOS workspace" : "the workspace"}.`);
      setTimeout(() => navigate("/app", { replace: true }), 1200);
    });
  }, [loading, navigate, params, user]);

  return <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6"><div className="w-full max-w-[420px] bg-[#18181b] border border-white/[0.08] rounded-2xl p-8 text-center">
    {state === "success" ? <Check className="w-10 h-10 text-emerald-400 mx-auto mb-4" /> : state === "error" ? <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" /> : state === "signin" ? <LogIn className="w-10 h-10 text-[#60a5fa] mx-auto mb-4" /> : <div className="w-8 h-8 border-2 border-[#60a5fa]/30 border-t-[#60a5fa] rounded-full animate-spin mx-auto mb-4" />}
    <h1 className="font-display font-[700] text-[24px] text-white mb-2">{state === "signin" ? "Sign in to accept" : state === "success" ? "Invitation accepted" : state === "error" ? "Invitation unavailable" : "Checking invitation"}</h1>
    <p className="text-[14px] text-[#94a3b8] font-body">{state === "signin" ? "Sign in with the email address that received this invitation." : message}</p>
    {state === "signin" && <Link to={`/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="inline-flex mt-6 bg-[#60a5fa] text-[#09090b] font-display font-[700] px-5 py-3 rounded-xl">Sign in</Link>}
  </div></div>;
}
