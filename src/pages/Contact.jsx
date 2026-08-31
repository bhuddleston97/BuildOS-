import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { CheckCircle, ArrowRight, Phone, Mail, MapPin } from "lucide-react";

const companySizes = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "500+ employees",
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    company_size: "",
    message: "",
  });

  const [status, setStatus] = useState("idle");

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const { error } = await supabase
        .from("contact_enquiries")
        .insert([form]);

      if (error) {
        throw error;
      }

      setStatus("success");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setStatus("error");
    }
  };

  const inputCls =
    "w-full bg-brand-panel border border-brand-border rounded-sm px-4 py-3 text-white font-body text-sm placeholder-brand-muted/60 focus:outline-hidden focus:border-brand-lime/50 transition-colors";

  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-16 px-6 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          <p className="font-display font-600 text-brand-lime text-xs tracking-widest uppercase mb-5 animate-fade-up">
            Get in touch
          </p>

          <h1 className="font-display font-800 text-5xl md:text-6xl text-white leading-tight mb-5 animate-fade-up delay-100 max-w-2xl">
            Let's talk about your projects
          </h1>

          <p className="font-body text-brand-muted text-lg leading-relaxed max-w-xl animate-fade-up delay-200">
            Tell us about your construction company and we'll set you up with
            a free 14-day trial — no credit card, no long-term commitment.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-5 gap-14">
        {/* Form */}
        <div className="lg:col-span-3">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-brand-lime/15 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-brand-lime" />
              </div>

              <h2 className="font-display font-800 text-3xl text-white mb-3">
                We'll be in touch soon
              </h2>

              <p className="font-body text-brand-muted leading-relaxed max-w-sm">
                Thanks for reaching out, {form.name.split(" ")[0]}. Someone
                from our team will contact you within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-display font-600 text-white text-xs mb-2 tracking-wide uppercase">
                    Your name *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={set("name")}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block font-display font-600 text-white text-xs mb-2 tracking-wide uppercase">
                    Company name
                  </label>

                  <input
                    type="text"
                    placeholder="Acme Construction LLC"
                    value={form.company}
                    onChange={set("company")}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-display font-600 text-white text-xs mb-2 tracking-wide uppercase">
                    Work email *
                  </label>

                  <input
                    type="email"
                    required
                    placeholder="jane@acmebuilds.com"
                    value={form.email}
                    onChange={set("email")}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block font-display font-600 text-white text-xs mb-2 tracking-wide uppercase">
                    Phone number
                  </label>

                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block font-display font-600 text-white text-xs mb-2 tracking-wide uppercase">
                  Company size
                </label>

                <select
                  value={form.company_size}
                  onChange={set("company_size")}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="" className="bg-brand-dark">
                    Select company size…
                  </option>

                  {companySizes.map((s) => (
                    <option key={s} value={s} className="bg-brand-dark">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-display font-600 text-white text-xs mb-2 tracking-wide uppercase">
                  Anything you'd like us to know?
                </label>

                <textarea
                  rows={4}
                  placeholder="Tell us about your biggest project management challenges, how many active projects you typically run, or any specific modules you're most interested in…"
                  value={form.message}
                  onChange={set("message")}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {status === "error" && (
                <p className="font-body text-rose-400 text-sm">
                  Something went wrong. Please try again or email us directly.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-lime text-brand-dark font-display font-700 text-base px-10 py-4 rounded-sm hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "submitting"
                  ? "Sending…"
                  : "Send message"}

                {status !== "submitting" && (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-10">
          {/* Contact info */}
          <div>
            <h3 className="font-display font-700 text-white text-lg mb-5">
              Rather talk first?
            </h3>

            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  label: "Email us",
                  value: "hello@buildos.io",
                },
                {
                  icon: Phone,
                  label: "Call sales",
                  value: "+1 (800) 555-0190",
                },
                {
                  icon: MapPin,
                  label: "Headquarters",
                  value: "Chicago, IL",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-brand-panel border border-brand-border rounded flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-brand-lime" />
                  </div>

                  <div>
                    <p className="font-display font-600 text-white text-xs uppercase tracking-wide mb-0.5">
                      {item.label}
                    </p>

                    <p className="font-body text-brand-muted text-sm">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-brand-panel border border-brand-border rounded-sm p-6">
            <h3 className="font-display font-700 text-white text-base mb-5">
              What happens next
            </h3>

            <ol className="space-y-4">
              {[
                {
                  n: "01",
                  text: "We review your message and match you with a construction industry specialist.",
                },
                {
                  n: "02",
                  text: "You get a personalized 30-minute demo focused on your specific project types and workflows.",
                },
                {
                  n: "03",
                  text: "Your free 14-day trial is activated — fully loaded, no limits, no credit card.",
                },
              ].map((step) => (
                <li key={step.n} className="flex gap-4">
                  <span className="font-display font-800 text-brand-lime text-sm flex-shrink-0 w-6">
                    {step.n}
                  </span>

                  <p className="font-body text-brand-muted text-sm leading-relaxed">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
