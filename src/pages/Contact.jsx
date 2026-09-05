import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { CheckCircle, ArrowRight } from "lucide-react";

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
    "w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white font-body text-sm placeholder-brand-muted/60 focus:outline-hidden focus:border-brand-lime/50 transition-colors";

  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-16 px-6 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          <p className="font-display font-[600] text-brand-lime text-xs tracking-widest uppercase mb-5 animate-fade-up">
            Get in touch
          </p>

          <h1 className="font-display font-[800] text-5xl md:text-6xl text-white leading-tight mb-5 animate-fade-up delay-100 max-w-2xl">
            Let's talk about your projects
          </h1>

          <p className="font-body text-brand-muted text-lg leading-relaxed max-w-xl animate-fade-up delay-200">
            Have a question about BuildOS? Share your project needs, ask about
            availability, or tell us what would make your day-to-day work easier.
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

              <h2 className="font-display font-[800] text-3xl text-white mb-3">
                Message submitted
              </h2>

              <p className="font-body text-brand-muted leading-relaxed max-w-sm">
                Thanks for reaching out, {form.name.split(" ")[0]}. Your inquiry has been saved.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block font-display font-[600] text-white text-xs mb-2 tracking-wide uppercase">
                    Your name *
                  </label>

                  <input
                    type="text" maxLength={160}
                    required
                    placeholder="Jane Smith"
                    id="contact-name" value={form.name}
                    onChange={set("name")}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="contact-company" className="block font-display font-[600] text-white text-xs mb-2 tracking-wide uppercase">
                    Company name
                  </label>

                  <input
                    type="text" maxLength={160}
                    placeholder="Acme Construction LLC"
                    id="contact-company" value={form.company}
                    onChange={set("company")}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-email" className="block font-display font-[600] text-white text-xs mb-2 tracking-wide uppercase">
                    Work email *
                  </label>

                  <input
                    type="email" maxLength={254}
                    required
                    placeholder="jane@acmebuilds.com"
                    id="contact-email" value={form.email}
                    onChange={set("email")}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block font-display font-[600] text-white text-xs mb-2 tracking-wide uppercase">
                    Phone number
                  </label>

                  <input
                    type="tel" maxLength={40}
                    placeholder="+1 (555) 000-0000"
                    id="contact-phone" value={form.phone}
                    onChange={set("phone")}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-company_size" className="block font-display font-[600] text-white text-xs mb-2 tracking-wide uppercase">
                  Company size
                </label>

                <select
                  id="contact-company_size" value={form.company_size}
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
                <label htmlFor="contact-message" className="block font-display font-[600] text-white text-xs mb-2 tracking-wide uppercase">
                  Anything you'd like us to know?
                </label>

                <textarea
                  rows={4} maxLength={5000}
                  placeholder="Tell us about your biggest project management challenges, how many active projects you typically run, or any specific modules you're most interested in…"
                  id="contact-message" value={form.message}
                  onChange={set("message")}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {status === "error" && (
                <p role="alert" className="font-body text-rose-400 text-sm">
                  Your message could not be saved. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-lime text-brand-dark font-display font-[700] text-base px-10 py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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

        <aside className="lg:col-span-2">
          <div className="bg-brand-panel border border-white/[.08] rounded-2xl p-8">
            <p className="text-xs text-brand-lime tracking-widest uppercase mb-4">About BuildOS</p>
            <h2 className="text-2xl text-white font-semibold mb-4">Built around construction work.</h2>
            <p className="text-brand-muted text-sm mb-6">BuildOS is a construction-management application in development, focused on helping contractors organize projects, tasks, schedules, field reports, and budgets.</p>
            <div className="border-t border-white/[.08] pt-6">
              <h3 className="font-semibold text-white mb-3">What to include</h3>
              <ul className="space-y-3 text-sm text-brand-muted list-disc pl-4">
                <li>The type of construction work you manage</li>
                <li>The workflows you want to improve</li>
                <li>Your questions about the application</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
