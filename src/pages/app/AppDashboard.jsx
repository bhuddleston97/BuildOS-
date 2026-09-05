
import { Link } from "react-router-dom";
import { useRealtimeRows } from "../../lib/useRealtimeRows.js";
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, FolderOpen } from "lucide-react";

const status = {
  todo: "bg-white/5 text-[#94a3b8]",
  in_progress: "bg-blue-400/10 text-blue-400",
  completed: "bg-emerald-400/10 text-emerald-400",
  blocked: "bg-rose-400/10 text-rose-400",
};

const priority = {
  low: "bg-[#94a3b8]",
  medium: "bg-amber-400",
  high: "bg-rose-400",
};

function TaskItem({ t }) {
  const TaskIcon =
    t.status === "completed"
      ? CheckCircle2
      : t.status === "in_progress"
        ? Clock
        : t.status === "blocked"
          ? AlertTriangle
          : Circle;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="relative flex-shrink-0">
        <TaskIcon className="w-4 h-4 text-[#94a3b8]" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
            priority[t.priority] || "bg-[#94a3b8]"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-white font-body font-[450] truncate">
          {t.title}
        </p>

        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`text-[10px] font-body px-1.5 py-0.5 rounded font-[500] ${
              status[t.status] || "bg-white/5 text-[#94a3b8]"
            }`}
          >
            {t.status?.replace("_", " ") || "todo"}
          </span>

          {t.assigned_to && (
            <span className="text-[11px] text-[#94a3b8] font-body truncate">
              {t.assigned_to}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label, action }) {
  return (
    <div className="empty-panel">
      <span className="w-12 h-12 rounded-xl bg-white/[.04] text-slate-500 flex items-center justify-center mb-4"><FolderOpen size={22} strokeWidth={1.5}/></span>
      <p className="text-[14px] text-[#94a3b8] font-body mb-3">
        {label}
      </p>

      {action && (
        <Link
          to={action.to}
          className="text-[13px] text-[#60a5fa] hover:text-white transition-colors font-body"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export default function AppDashboard() {
  const { rows: projects } = useRealtimeRows("projects", { perPage: 100, sort: "-created" });
  const { rows: tasks } = useRealtimeRows("tasks", { perPage: 100, sort: "-created" });
  const { rows: notifications } = useRealtimeRows("notifications", { perPage: 25, sort: "-created" });
  const activeProjects = projects.filter(project => project.status !== "completed");
  const openTasks = tasks.filter(task => task.status !== "done");
  const inProgressTasks = tasks.filter(task => task.status === "in_progress");
  const issues = projects.filter(project => ["at_risk", "delayed"].includes(project.status)).length
    + tasks.filter(task => task.status === "blocked").length;
  const recentTasks = tasks.slice(0, 5);
  const recentActivity = notifications.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5"><div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#60a5fa] font-body mb-2">
            Overview
          </p>

          <h1 className="text-3xl font-display font-[800]">
            Dashboard
          </h1>

          <p className="text-sm text-[#94a3b8] font-body mt-2">
            Welcome back. Here's what's happening across your workspace.
          </p>
          </div><Link to="/app/projects/new" className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand-lime text-brand-dark text-sm font-semibold rounded-xl"><Plus size={16}/>New project</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="metric-card">
            <p className="text-xs text-[#94a3b8] font-body mb-2">
              Active Projects
            </p>
            <p className="text-3xl font-display font-[800] text-white">
              {activeProjects.length}
            </p>
          </div>

          <div className="metric-card">
            <p className="text-xs text-[#94a3b8] font-body mb-2">
              Open Tasks
            </p>
            <p className="text-3xl font-display font-[800] text-white">
              {openTasks.length}
            </p>
          </div>

          <div className="metric-card">
            <p className="text-xs text-[#94a3b8] font-body mb-2">
              In Progress
            </p>
            <p className="text-3xl font-display font-[800] text-white">
              {inProgressTasks.length}
            </p>
          </div>

          <div className="metric-card">
            <p className="text-xs text-[#94a3b8] font-body mb-2">
              Issues
            </p>
            <p className="text-3xl font-display font-[800] text-white">
              {issues}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg text-white font-display font-[700]">
                  Recent Tasks
                </h2>
                <p className="text-xs text-[#94a3b8] font-body mt-1">
                  Your latest assigned work
                </p>
              </div>

              <Link
                to="/app/tasks"
                className="text-xs text-[#60a5fa] hover:text-white transition-colors font-body"
              >
                View all →
              </Link>
            </div>

            <div className="workspace-panel">
              {recentTasks.length === 0 ? <EmptyState label="No tasks yet" action={{ to: "/app/tasks", label: "Create your first task" }} /> : recentTasks.map(task => <TaskItem key={task.id} t={task} />)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg text-white font-display font-[700]">
                  Recent Activity
                </h2>
                <p className="text-xs text-[#94a3b8] font-body mt-1">
                  Latest workspace activity
                </p>
              </div>
            </div>

            <div className="workspace-panel">
              {recentActivity.length === 0 ? <EmptyState label="No recent activity" /> : recentActivity.map(item => <div key={item.id} className="py-3 border-b border-white/[0.04] last:border-0"><p className="text-[13px] text-white font-body truncate">{item.title || "Workspace update"}</p><p className="text-[11px] text-[#94a3b8] font-body mt-1 line-clamp-2">{item.message || "A workspace record was updated."}</p></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

