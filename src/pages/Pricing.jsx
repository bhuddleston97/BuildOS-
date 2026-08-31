import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "For growing contractors",
    price: { monthly: 299, annual: 249 },
    highlight: false,
    features: [
      "Up to 5 active projects",
      "25 field user seats",
      "Project dashboards & task management",
      "Daily field reports",
      "Photo uploads",
      "Document storage (50 GB)",
      "Basic budget tracking",
      "Email notifications",
      "Mobile app",
    ],
    cta: "Start free trial",
  },
  {
    name: "Professional",
    tagline: "For midsize contractors",
    price: { monthly: 749, annual: 624 },
    highlight: true,
    badge: "Most popular",
    features: [
      "Up to 20 active projects",
      "100 field user seats",
      "Everything in Starter",
      "Change order management",
      "Expense tracking & approvals",
      "Subcontractor billing",
      "Safety checklists & incident logs",
      "Vendor compliance tracking",
      "Advanced budget & cost codes",
      "Automated workflows",
      "API access",
      "AI field report summaries",
    ],
    cta: "Start free trial",
  },
  {
    name: "Enterprise",
    tagline: "For large or multi-division operations",
    price: { monthly: null, annual: null },
    highlight: false,
    features: [
      "Unlimited projects",
      "Unlimited seats",
      "Everything in Professional",
      "Custom AI models on your data",
      "Single sign-on (SSO)",
      "Custom roles & permissions",
      "Dedicated onboarding manager",
      "Priority support SLA",
      "Custom integrations",
      "On-premise option available",
    ],
    cta: "Talk to sales",
  },
];

const faqs = [
  { q: "How does the free trial work?", a: "You get 14 full days with every Professional feature enabled — no credit card needed. At the end of the trial, you choose a plan or your data stays safe for 30 more days while you decide." },
  { q: "Can I change plans later?", a: "Yes. You can upgrade instantly and downgrade at the start of your next billing cycle. We prorate any mid-cycle changes." },
  { q: "Is there a setup or onboarding fee?", a: "No. Starter and Professional include self-service onboarding guides and video walkthroughs. Enterprise customers get a dedicated implementation manager at no extra cost." },
  { q: "What counts as a field user seat?", a: "Anyone who logs in to submit reports, update tasks, or upload photos counts as a field user. Owners, project managers, and admin users are not counted against your field user limit." },
  { q: "Can field employees use it offline?", a: "Yes. The mobile app queues reports, photos, and task updates offline and syncs automatically when connectivity returns." },
  { q: "How is our data protected?", a: "Data is encrypted at rest and in transit. We offer role-based access, audit logs, and optional SSO for Enterprise. We never sell or share your project data." },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-display font-600 text-brand-lime text-xs tracking-widest uppercase mb-5 animate-fade-up">
            Pricing
          </p>
          <h1 className="font-display font-800 text-5xl text-white leading-tight mb-5 animate-fade-up delay-100">
            Simple pricing,<br />serious capability
          </h1>
          <p className="font-body text-brand-muted text-lg mb-10 animate-fade-up delay-200">
            No per-module fees. No surprise add-ons. Every plan includes the mobile app and all core modules.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 border border-brand-border rounded-full p-1 animate-fade-up delay-300">
            <button
              onClick={() => setAnnual(false)}
              className={`text-sm font-display font-600 px-5 py-2 rounded-full transition-all ${
                !annual ? "bg-brand-lime text-brand-dark" : "text-brand-muted"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`text-sm font-display font-600 px-5 py-2 rounded-full transition-all flex items-center gap-2 ${
                annual ? "bg-brand-lime text-brand-dark" : "text-brand-muted"
              }`}
            >
              Annual
              <span className="text-xs font-body bg-brand-dark text-brand-lime px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-sm border p-8 flex flex-col ${
                plan.highlight
                  ? "border-brand-lime/50 bg-brand-lime/5"
                  : "border-brand-border bg-brand-panel"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-lime text-brand-dark text-xs font-display font-700 px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h2 className="font-display font-800 text-2xl text-white mb-1">{plan.name}</h2>
                <p className="font-body text-brand-muted text-sm">{plan.tagline}</p>
              </div>

              <div className="mb-8">
                {plan.price.monthly ? (
                  <>
                    <div className="flex items-end gap-1">
                      <span className="font-display font-800 text-5xl text-white">
                        ${annual ? plan.price.annual : plan.price.monthly}
                      </span>
                      <span className="font-body text-brand-muted text-sm mb-2">/mo</span>
                    </div>
                    <p className="font-body text-brand-muted text-xs mt-1">
                      {annual ? "Billed annually" : "Billed monthly"}
                    </p>
                  </>
                ) : (
                  <div className="font-display font-800 text-3xl text-white">Custom</div>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.highlight ? "text-brand-lime" : "text-emerald-400"
                      }`}
                    />
                    <span className="font-body text-brand-text text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signin"
                className={`text-center font-display font-700 text-sm py-3.5 px-6 rounded-sm transition-colors flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? "bg-brand-lime text-brand-dark hover:bg-white"
                    : "border border-brand-border text-white hover:border-brand-lime/50"
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6 border-t border-brand-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-800 text-4xl text-white text-center mb-14">
            Common questions
          </h2>
          <div className="space-y-8">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-brand-border pb-8">
                <h3 className="font-display font-700 text-white text-lg mb-3">{f.q}</h3>
                <p className="font-body text-brand-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-brand-panel border-t border-brand-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-800 text-4xl text-white mb-4">
            Still have questions?
          </h2>
          <p className="font-body text-brand-muted mb-8">
            Our team is happy to walk you through the platform and find the right fit for your company.
          </p>
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 bg-brand-lime text-brand-dark font-display font-700 px-8 py-4 rounded-sm hover:bg-white transition-colors"
          >
            Talk to us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
