import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import { supabase } from "../../lib/supabase.js";
import { CheckCircle, ArrowRight, AlertCircle } from "lucide-react";

const PLANS = [
  {
    slug: "starter",
    name: "Starter",
    price: "$60/mo",
    annualPrice: "$50/mo",
    features: ["Up to 5 active projects", "25 field user seats", "Dashboards & task management", "Daily field reports", "50 GB storage"],
  },
  {
    slug: "professional",
    name: "Professional",
    price: "$100/mo",
    annualPrice: "$83/mo",
    badge: "Most popular",
    features: ["Up to 20 active projects", "100 field user seats", "Change orders & approvals", "Subcontractor billing", "AI field report summaries", "API access"],
  },
];

export default function AppSubscribe() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  async function startCheckout(slug) {
    setError("");
    setLoading(slug);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout", {
        body: { plan: slug, interval: "year" },
      });
      if (fnError || !data?.url) throw new Error(fnError?.message || "Checkout is temporarily unavailable.");
      window.location.assign(data.url);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full text-center mb-10">
        <p className="text-[11px] font-body font-[500] text-[#60a5fa] tracking-[0.12em] uppercase mb-3">
          Choose a plan
        </p>
        <h1 className="font-display font-[700] text-[36px] text-white tracking-[-0.02em] leading-tight mb-3">
          Start your 14-day free trial
        </h1>
        <p className="text-[15px] text-slate-400 font-body">
          No charge today. Cancel any time before your trial ends.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] font-body px-4 py-3 rounded-xl mb-8 max-w-md w-full">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5 w-full max-w-2xl">
        {PLANS.map((plan) => (
          <div
            key={plan.slug}
            className={`relative rounded-xl border p-7 flex flex-col ${
              plan.badge
                ? "border-[#60a5fa]/40 bg-[#60a5fa]/5"
                : "border-white/[0.08] bg-white/[0.02]"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#60a5fa] text-[#09090b] text-[11px] font-display font-[700] px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="mb-5">
              <h2 className="font-display font-[700] text-[20px] text-white mb-1">{plan.name}</h2>
              <div className="flex items-end gap-1">
                <span className="font-display font-[700] text-[32px] text-white">{plan.price}</span>
              </div>
              <p className="text-[12px] text-slate-500 font-body mt-0.5">{plan.annualPrice} billed annually</p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.badge ? "text-[#60a5fa]" : "text-emerald-400"}`} />
                  <span className="text-[13px] text-slate-400 font-body">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => startCheckout(plan.slug)}
              disabled={loading !== null}
              className={`w-full flex items-center justify-center gap-2 font-display font-[700] text-[14px] py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 ${
                plan.badge
                  ? "bg-[#60a5fa] text-[#09090b] hover:bg-white"
                  : "border border-white/[0.12] text-white hover:border-[#60a5fa]/40"
              }`}
            >
              {loading === plan.slug ? "Opening checkout…" : "Start free trial"}
              {loading !== plan.slug && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[12px] text-slate-600 font-body text-center max-w-sm">
        Need Enterprise pricing or have questions?{" "}
        <Link to="/contact" className="text-slate-400 hover:text-white transition-colors underline underline-offset-2">
          Talk to sales
        </Link>
      </p>
    </div>
  );
}
