import { Link } from "react-router-dom";
import { ArrowRight, Check, TrendingUp, Users, Shield, Zap, BarChart2, FileText, Camera, Bot } from "lucide-react";

const stats = [
  { value: "40%", label: "Faster project delivery" },
  { value: "28%", label: "Reduction in cost overruns" },
  { value: "10k+", label: "Active field employees" },
  { value: "99.9%", label: "Platform uptime" },
];

const features = [
  {
    icon: BarChart2,
    title: "Real-time project dashboards",
    desc: "Every project's progress, cost, and risk on one screen — updated as your team works.",
    color: "text-brand-lime",
    bg: "bg-brand-lime/10",
  },
  {
    icon: Camera,
    title: "Field reporting & photos",
    desc: "Crew members submit daily reports, upload job-site photos, and flag issues from any phone.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Users,
    title: "Scheduling & tasks",
    desc: "Assign work, track completion, and get automatic alerts when a deadline is at risk.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: FileText,
    title: "Documents & change orders",
    desc: "Contracts, drawings, specs, and change orders in one searchable place.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: TrendingUp,
    title: "Budgets & expenses",
    desc: "Track spend against budget in real time. Flag variances before they become problems.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Shield,
    title: "Compliance & safety",
    desc: "Digital safety checklists, incident logs, certifications, and vendor compliance — all tracked.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    icon: Zap,
    title: "Automated workflows",
    desc: "Approval chains, notifications, and reminders fire automatically so nothing slips through.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    icon: Bot,
    title: "AI assistant",
    desc: "Summarizes field reports, spots budget risks, surfaces schedule conflicts, and answers questions about your projects.",
    color: "text-brand-lime",
    bg: "bg-brand-lime/10",
  },
];

const testimonials = [
  {
    quote: "We cut our project closeout time in half and our project managers finally have full visibility without chasing emails.",
    name: "Marcus Webb",
    role: "VP Operations · Webb General Contracting",
    avatar: "/static/stock_feature-field-c017be-0.jpg",
  },
  {
    quote: "The field report summaries alone save me two hours every morning. My crew loves how easy it is to log their day.",
    name: "Dana Osei",
    role: "Project Manager · Osei Brothers Construction",
    avatar: "/static/stock_feature-field-c017be-1.jpg",
  },
  {
    quote: "Budget overruns used to blindside us. Now I see the trend three weeks before it becomes a crisis.",
    name: "Kelly Arndt",
    role: "CFO · Arndt Commercial Builders",
    avatar: "/static/stock_feature-field-c017be-2.jpg",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/static/stock_hero-construction-d8aa7f-0.jpg"
            alt="Construction site"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-brand-dark/80 to-brand-dark" />
        </div>

        {/* Decorative lime accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-lime/40 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-brand-lime/30 bg-brand-lime/5 text-brand-lime text-xs font-display font-600 px-3 py-1.5 rounded-full mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse-slow" />
              Now with AI-powered project intelligence
            </div>

            <h1 className="font-display font-800 text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight mb-8 animate-fade-up delay-100">
              One platform for every{" "}
              <span className="text-brand-lime">construction</span>{" "}
              operation
            </h1>

            <p className="font-body text-lg text-brand-muted leading-relaxed max-w-2xl mb-10 animate-fade-up delay-200">
              Project management, field ops, budgets, scheduling, documents, safety, and AI insights —
              unified for midsize contractors who need real control, not just another app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
              <Link
                to="/signin"
                className="inline-flex items-center justify-center gap-2 bg-brand-lime text-brand-dark font-display font-700 text-base px-8 py-4 rounded-sm hover:bg-white transition-all duration-200 group"
              >
                Start your free trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 border border-brand-border text-brand-text font-body font-medium text-base px-8 py-4 rounded-sm hover:border-brand-lime/50 hover:text-white transition-all duration-200"
              >
                See live dashboard
              </Link>
            </div>

            {/* Trust note */}
            <div className="flex flex-wrap items-center gap-6 mt-10 animate-fade-up delay-400">
              {["No credit card required", "14-day free trial", "Set up in under an hour"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-lime" />
                    <span className="text-brand-muted text-sm font-body">{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-brand-border bg-brand-panel">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-800 text-4xl text-brand-lime mb-2">{s.value}</div>
              <div className="font-body text-sm text-brand-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <p className="font-display font-600 text-brand-lime text-sm tracking-widest uppercase mb-4">
              Everything in one place
            </p>
            <h2 className="font-display font-800 text-4xl md:text-5xl text-white leading-tight mb-6">
              Built for every role on every jobsite
            </h2>
            <p className="font-body text-brand-muted text-lg leading-relaxed">
              From the owner's boardroom to the foreman's phone — every module is designed to work
              seamlessly together so information flows where it's needed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 bg-brand-panel border border-brand-border rounded-sm hover:border-brand-lime/30 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 ${f.bg} rounded flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-display font-700 text-white text-base mb-2 leading-tight">
                  {f.title}
                </h3>
                <p className="font-body text-brand-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/features"
              className="inline-flex items-center gap-2 text-brand-lime font-display font-600 text-sm hover:gap-3 transition-all"
            >
              Explore all features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Role split section */}
      <section className="py-24 px-6 bg-brand-panel border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Managers */}
            <div>
              <div className="inline-block bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-display font-600 px-3 py-1 rounded-full mb-6">
                For Owners & Managers
              </div>
              <h3 className="font-display font-800 text-3xl text-white mb-5 leading-tight">
                Command your projects from one screen
              </h3>
              <p className="font-body text-brand-muted mb-8 leading-relaxed">
                Real-time dashboards surface project progress, cost-to-complete, profitability, 
                delays, and risks across your entire portfolio — no more spreadsheet archaeology.
              </p>
              <ul className="space-y-3">
                {[
                  "Portfolio overview with red/amber/green status",
                  "Budget actuals vs forecast with trend lines",
                  "Schedule risk alerts before deadlines slip",
                  "AI-generated weekly summaries per project",
                  "Role-based access so the right people see the right data",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-brand-lime mt-0.5 flex-shrink-0" />
                    <span className="font-body text-brand-text text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Field */}
            <div>
              <div className="inline-block bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-display font-600 px-3 py-1 rounded-full mb-6">
                For Field Employees
              </div>
              <h3 className="font-display font-800 text-3xl text-white mb-5 leading-tight">
                Log, report, and stay connected from anywhere
              </h3>
              <p className="font-body text-brand-muted mb-8 leading-relaxed">
                A phone-first interface that actually works on a jobsite — even with spotty 
                reception. Everything your crew needs, nothing they don't.
              </p>
              <ul className="space-y-3">
                {[
                  "Daily report submission in under 2 minutes",
                  "Photo uploads tagged to task and location",
                  "Issue reporting with priority flagging",
                  "Task list with real-time status updates",
                  "Safety checklist completion & sign-off",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="font-body text-brand-text text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI section */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-sm border border-brand-lime/20 bg-gradient-to-br from-brand-panel to-brand-dark p-10 md:p-16">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-lime/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 bg-brand-lime/15 rounded flex items-center justify-center mb-6">
                  <Bot className="w-6 h-6 text-brand-lime" />
                </div>
                <h2 className="font-display font-800 text-4xl text-white leading-tight mb-5">
                  Your AI project intelligence layer
                </h2>
                <p className="font-body text-brand-muted leading-relaxed mb-8">
                  The more your team uses BuildOS, the smarter it gets. The integrated AI assistant 
                  reads your field reports, documents, budgets, and schedules to surface what matters 
                  before problems escalate.
                </p>
                <Link
                  to="/features"
                  className="inline-flex items-center gap-2 bg-brand-lime text-brand-dark font-display font-700 px-6 py-3 rounded-sm hover:bg-white transition-colors text-sm"
                >
                  Explore AI features <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { q: "Summarize last week's field reports for the Harbor Bridge project.", a: "12 daily reports filed. 3 weather delays logged. Concrete pour on Level 4 completed ahead of schedule. One safety incident reported — resolved. Overall status: on track." },
                  { q: "Are we at risk of missing the Q3 deadline on the Riverside project?", a: "Based on current task velocity, there's a 68% probability of a 5–8 day slip. The critical path is electrical rough-in. I'd recommend a review with your MEP sub this week." },
                ].map((item, i) => (
                  <div key={i} className="bg-brand-dark/60 border border-brand-border rounded-sm p-4">
                    <p className="text-brand-muted text-xs font-body mb-2 font-medium uppercase tracking-wide">You asked</p>
                    <p className="text-white text-sm font-body mb-4 italic">"{item.q}"</p>
                    <p className="text-brand-muted text-xs font-body mb-1 font-medium uppercase tracking-wide text-brand-lime">BuildOS AI</p>
                    <p className="text-brand-text text-sm font-body leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-brand-panel border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-800 text-4xl text-white mb-4">
              Contractors who switched to BuildOS
            </h2>
            <p className="font-body text-brand-muted">
              Real results from midsize construction companies.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-brand-dark border border-brand-border p-8 rounded-sm">
                <p className="font-body text-brand-text text-base leading-relaxed mb-8 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-brand-border"
                  />
                  <div>
                    <div className="font-display font-700 text-white text-sm">{t.name}</div>
                    <div className="font-body text-brand-muted text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-800 text-5xl md:text-6xl text-white leading-tight mb-6">
            Ready to build smarter?
          </h2>
          <p className="font-body text-brand-muted text-lg mb-10 leading-relaxed">
            Join hundreds of midsize contractors running their business on BuildOS.
            Get set up in under an hour — no migration headaches, no long contracts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-lime text-brand-dark font-display font-700 text-base px-10 py-4 rounded-sm hover:bg-white transition-colors"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center font-body text-brand-muted text-base py-4 hover:text-white transition-colors"
            >
              View pricing →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
