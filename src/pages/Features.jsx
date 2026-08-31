import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const modules = [
  {
    category: "Project Control",
    accent: "brand-lime",
    accentHex: "#e8ff4d",
    items: [
      { title: "Project Dashboard", desc: "Real-time view of every project's status, milestones, cost, and schedule health. Drill down from portfolio to task level in seconds." },
      { title: "Gantt & Scheduling", desc: "Drag-and-drop schedule builder with critical path detection, dependency linking, and auto-alerts when the plan shifts." },
      { title: "Task Management", desc: "Assign tasks to individuals or crews, set due dates, attach drawings or specs, and track completion in real time." },
      { title: "Change Orders", desc: "Digital change order workflow with approval routing, cost impact tracking, and automatic budget updates." },
    ],
  },
  {
    category: "Field Operations",
    accent: "emerald-400",
    accentHex: "#34d399",
    items: [
      { title: "Daily Reports", desc: "Field employees submit structured daily reports from any phone or tablet — weather, crew count, work performed, materials used, and issues." },
      { title: "Photo & Video Log", desc: "Geo-tagged photos and videos automatically organized by project, date, and trade. Searchable archive, always accessible." },
      { title: "Issue & RFI Tracking", desc: "Log field issues and requests for information with priority, responsible party, and due date. Nothing falls through the cracks." },
      { title: "Equipment Tracking", desc: "Track equipment location, utilization, maintenance schedules, and costs across all job sites." },
    ],
  },
  {
    category: "Financial Management",
    accent: "amber-400",
    accentHex: "#fbbf24",
    items: [
      { title: "Budget Management", desc: "Build detailed budgets by cost code, track actuals vs forecast in real time, and get variance alerts before problems escalate." },
      { title: "Expense Tracking", desc: "Field teams submit expenses with receipts, tagged to project and cost code. Approval workflows built in." },
      { title: "Subcontractor Billing", desc: "Manage pay applications, lien waivers, and retention from one place. No more chasing paper." },
      { title: "Profitability Reports", desc: "See gross margin and profit by project, division, and company — updated as costs flow in." },
    ],
  },
  {
    category: "Compliance & Safety",
    accent: "rose-400",
    accentHex: "#fb7185",
    items: [
      { title: "Safety Checklists", desc: "Digital daily safety inspections, toolbox talks, and pre-task analysis — completed and signed on-site from any device." },
      { title: "Incident Reporting", desc: "Structured incident and near-miss reports with root cause analysis, corrective actions, and OSHA log integration." },
      { title: "Vendor Compliance", desc: "Track insurance certificates, licenses, safety training, and certifications for every subcontractor and vendor." },
      { title: "Document Control", desc: "Contracts, drawings, specs, submittals, and O&M manuals in one version-controlled repository." },
    ],
  },
  {
    category: "Communication & AI",
    accent: "violet-400",
    accentHex: "#a78bfa",
    items: [
      { title: "Notifications & Alerts", desc: "Role-based alerts for deadline risks, approvals needed, safety incidents, and budget variances — delivered via app, email, or SMS." },
      { title: "Team Messaging", desc: "Project-level conversations keep communication in context, not buried in email threads or lost in text messages." },
      { title: "AI Field Report Summaries", desc: "The AI assistant reads all daily reports and delivers a concise briefing each morning — what happened, what's at risk, what needs attention." },
      { title: "AI Project Intelligence", desc: "Proactive analysis of schedules, budgets, and field data to surface risks and recommendations before small problems become big ones." },
    ],
  },
];

export default function Features() {
  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-20 px-6 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          <p className="font-display font-600 text-brand-lime text-sm tracking-widest uppercase mb-5 animate-fade-up">
            Platform features
          </p>
          <h1 className="font-display font-800 text-5xl md:text-6xl text-white leading-tight mb-6 animate-fade-up delay-100 max-w-3xl">
            Every tool your team needs, nothing they don't
          </h1>
          <p className="font-body text-brand-muted text-xl leading-relaxed max-w-2xl animate-fade-up delay-200">
            BuildOS is built around how construction actually works — from the
            owner's portfolio view to the laborer's daily report, every module
            connects to the same source of truth.
          </p>
        </div>
      </section>

      {/* Modules */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-20">
        {modules.map((mod) => (
          <div key={mod.category}>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-brand-border" />
              <h2
                className={`font-display font-800 text-2xl text-${mod.accent} whitespace-nowrap`}
              >
                {mod.category}
              </h2>
              <div className="h-px flex-1 bg-brand-border" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mod.items.map((item) => (
                <div
                  key={item.title}
                  className="group p-6 bg-brand-panel border border-brand-border rounded-sm hover:border-brand-border/80 transition-all duration-300"
                  style={{ borderTopColor: "transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderTopColor = mod.accentHex + "40";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderTopColor = "transparent";
                  }}
                >
                  <div
                    className="w-1 h-8 rounded-full mb-4"
                    style={{ backgroundColor: mod.accentHex + "60" }}
                  />
                  <h3 className="font-display font-700 text-white text-base mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-brand-muted text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="py-20 px-6 bg-brand-panel border-t border-brand-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-800 text-4xl text-white mb-4">
            See everything in action
          </h2>
          <p className="font-body text-brand-muted mb-8">
            The best way to understand BuildOS is to try it. No sales call required.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-brand-lime text-brand-dark font-display font-700 px-8 py-4 rounded-sm hover:bg-white transition-colors"
          >
            Start your free trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
