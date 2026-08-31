import { useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, DollarSign, Users, Building } from "lucide-react";

const projects = [
  {
    name: "Harbor Bridge Expansion",
    status: "on-track",
    phase: "Structural — Phase 3",
    budget: 4200000,
    spent: 2940000,
    progress: 70,
    daysLeft: 45,
    crew: 28,
    issues: 1,
  },
  {
    name: "Riverside Commercial Plaza",
    status: "at-risk",
    phase: "MEP Rough-in",
    budget: 8750000,
    spent: 5250000,
    progress: 60,
    daysLeft: 88,
    crew: 42,
    issues: 4,
  },
  {
    name: "Northgate Residential Block B",
    status: "on-track",
    phase: "Framing",
    budget: 2100000,
    spent: 630000,
    progress: 30,
    daysLeft: 124,
    crew: 17,
    issues: 0,
  },
  {
    name: "Downtown Office Retrofit",
    status: "delayed",
    phase: "Demolition",
    budget: 1350000,
    spent: 540000,
    progress: 40,
    daysLeft: 61,
    crew: 11,
    issues: 2,
  },
  {
    name: "Lakeside Medical Center",
    status: "on-track",
    phase: "Foundation",
    budget: 12500000,
    spent: 1250000,
    progress: 10,
    daysLeft: 310,
    crew: 33,
    issues: 0,
  },
];

const statusConfig = {
  "on-track": { label: "On Track", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", dot: "bg-emerald-400" },
  "at-risk": { label: "At Risk", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", dot: "bg-amber-400" },
  "delayed": { label: "Delayed", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", dot: "bg-rose-400" },
};

const recentActivity = [
  { type: "report", text: "Daily report submitted — Harbor Bridge", user: "J. Morales", time: "9 min ago" },
  { type: "alert", text: "Budget variance flagged — Riverside Plaza (+$42k)", user: "AI Alert", time: "1 hr ago" },
  { type: "task", text: "MEP inspection completed — Downtown Retrofit", user: "K. Liu", time: "2 hr ago" },
  { type: "photo", text: "14 photos uploaded — Northgate Block B", user: "Field crew", time: "3 hr ago" },
  { type: "issue", text: "New issue logged: subcontractor no-show — Riverside", user: "D. Osei", time: "4 hr ago" },
  { type: "doc", text: "Change order #CO-019 approved — Harbor Bridge", user: "M. Webb", time: "5 hr ago" },
];

function fmt(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

export default function Dashboard() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);
  const totalBudget = projects.reduce((a, p) => a + p.budget, 0);
  const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
  const totalCrew = projects.reduce((a, p) => a + p.crew, 0);
  const totalIssues = projects.reduce((a, p) => a + p.issues, 0);

  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-6 px-6 border-b border-brand-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-display font-600 text-brand-lime text-xs tracking-widest uppercase mb-2">
              Portfolio View
            </p>
            <h1 className="font-display font-800 text-4xl text-white">Project Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-body text-brand-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse-slow" />
            Live — updated just now
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Building, label: "Active Projects", value: projects.length, sub: "across all sites", color: "text-brand-lime" },
            { icon: DollarSign, label: "Total Budget", value: fmt(totalBudget), sub: `${fmt(totalSpent)} spent (${Math.round(totalSpent/totalBudget*100)}%)`, color: "text-amber-400" },
            { icon: Users, label: "Crew on Site", value: totalCrew, sub: "across all projects", color: "text-sky-400" },
            { icon: AlertTriangle, label: "Open Issues", value: totalIssues, sub: `${projects.filter(p=>p.status==="at-risk"||p.status==="delayed").length} projects need attention`, color: "text-rose-400" },
          ].map((card) => (
            <div key={card.label} className="bg-brand-panel border border-brand-border rounded-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className={`font-display font-800 text-3xl ${card.color} mb-1`}>
                {card.value}
              </div>
              <div className="font-body text-white text-xs font-medium mb-0.5">{card.label}</div>
              <div className="font-body text-brand-muted text-xs">{card.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects table */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {[["all", "All Projects"], ["on-track", "On Track"], ["at-risk", "At Risk"], ["delayed", "Delayed"]].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`text-xs font-display font-600 px-3 py-1.5 rounded-full border transition-all ${
                    filter === v
                      ? "bg-brand-lime/10 border-brand-lime/40 text-brand-lime"
                      : "border-brand-border text-brand-muted hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map((p) => {
                const s = statusConfig[p.status];
                const pct = Math.round((p.spent / p.budget) * 100);
                return (
                  <div
                    key={p.name}
                    className="bg-brand-panel border border-brand-border rounded-sm p-5 hover:border-brand-lime/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-display font-700 text-white text-base group-hover:text-brand-lime transition-colors">
                          {p.name}
                        </h3>
                        <p className="font-body text-brand-muted text-xs mt-0.5">{p.phase}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 ${s.bg} ${s.border} border ${s.color} text-xs font-display font-600 px-2.5 py-1 rounded-full whitespace-nowrap`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-body text-xs text-brand-muted">Overall progress</span>
                        <span className="font-display font-700 text-xs text-white">{p.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-brand-dark rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-lime transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-center">
                      {[
                        { label: "Budget", value: fmt(p.budget) },
                        { label: "Spent", value: `${fmt(p.spent)} (${pct}%)` },
                        { label: "Days Left", value: p.daysLeft },
                        { label: "Crew", value: p.crew },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="font-display font-700 text-white text-sm">{m.value}</div>
                          <div className="font-body text-brand-muted text-xs">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <h3 className="font-display font-700 text-white text-base mb-4">Recent activity</h3>
            <div className="space-y-1">
              {recentActivity.map((a, i) => {
                const iconMap = {
                  report: CheckCircle,
                  alert: AlertTriangle,
                  task: CheckCircle,
                  photo: Clock,
                  issue: AlertTriangle,
                  doc: TrendingUp,
                };
                const colorMap = {
                  report: "text-emerald-400",
                  alert: "text-amber-400",
                  task: "text-brand-lime",
                  photo: "text-sky-400",
                  issue: "text-rose-400",
                  doc: "text-violet-400",
                };
                const Icon = iconMap[a.type];
                return (
                  <div key={i} className="flex gap-3 p-3 rounded-sm hover:bg-brand-panel/50 transition-colors">
                    <Icon className={`w-4 h-4 ${colorMap[a.type]} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-body text-brand-text text-xs leading-relaxed">{a.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-body text-brand-muted text-xs">{a.user}</span>
                        <span className="text-brand-border">·</span>
                        <span className="font-body text-brand-muted text-xs">{a.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI insight banner */}
        <div className="border border-brand-lime/20 bg-brand-lime/5 rounded-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-8 h-8 bg-brand-lime/15 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-brand-lime text-sm">AI</span>
          </div>
          <div className="flex-1">
            <p className="font-body text-brand-text text-sm leading-relaxed">
              <span className="font-display font-700 text-brand-lime">BuildOS AI:</span>{" "}
              Riverside Commercial Plaza's MEP rough-in is 6 days behind based on task velocity.
              With 88 days until deadline, you have a buffer — but a crew shift this week could
              prevent it becoming critical. Want me to model the schedule impact?
            </p>
          </div>
          <button className="whitespace-nowrap text-xs font-display font-700 text-brand-dark bg-brand-lime px-4 py-2 rounded-sm hover:bg-white transition-colors flex-shrink-0">
            Ask AI
          </button>
        </div>
      </div>
    </>
  );
}
