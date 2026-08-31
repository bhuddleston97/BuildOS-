
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";

const status = {
  todo: "bg-white/5 text-[#6b7a6e]",
  in_progress: "bg-blue-400/10 text-blue-400",
  completed: "bg-emerald-400/10 text-emerald-400",
  blocked: "bg-rose-400/10 text-rose-400",
};

const priority = {
  low: "bg-[#4a5c4e]",
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
        <TaskIcon className="w-4 h-4 text-[#6b7a6e]" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
            priority[t.priority] || "bg-[#4a5c4e]"
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
              status[t.status] || "bg-white/5 text-[#6b7a6e]"
            }`}
          >
            {t.status?.replace("_", " ") || "todo"}
          </span>

          {t.assigned_to && (
            <span className="text-[11px] text-[#4a5c4e] font-body truncate">
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
    <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-8 text-center">
      <p className="text-[14px] text-[#4a5c4e] font-body mb-3">
        {label}
      </p>

      {action && (
        <Link
          to={action.to}
          className="text-[13px] text-[#e8ff4d] hover:text-white transition-colors font-body"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export default function AppDashboard() {
  return (
    <div className="min-h-screen bg-[#080c09] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#e8ff4d] font-body mb-2">
            Overview
          </p>

          <h1 className="text-3xl font-display font-[800]">
            Dashboard
          </h1>

          <p className="text-sm text-[#6b7a6e] font-body mt-2">
            Welcome back. Here's what's happening across your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs text-[#6b7a6e] font-body mb-2">
              Active Projects
            </p>
            <p className="text-3xl font-display font-[800] text-white">
              0
            </p>
          </div>

          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs text-[#6b7a6e] font-body mb-2">
              Open Tasks
            </p>
            <p className="text-3xl font-display font-[800] text-white">
              0
            </p>
          </div>

          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs text-[#6b7a6e] font-body mb-2">
              In Progress
            </p>
            <p className="text-3xl font-display font-[800] text-white">
              0
            </p>
          </div>

          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs text-[#6b7a6e] font-body mb-2">
              Issues
            </p>
            <p className="text-3xl font-display font-[800] text-white">
              0
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg text-white font-display font-[700]">
                  Recent Tasks
                </h2>
                <p className="text-xs text-[#6b7a6e] font-body mt-1">
                  Your latest assigned work
                </p>
              </div>

              <Link
                to="/app/tasks"
                className="text-xs text-[#e8ff4d] hover:text-white transition-colors font-body"
              >
                View all →
              </Link>
            </div>

            <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl px-5">
              <EmptyState
                label="No tasks yet"
                action={{
                  to: "/app/tasks",
                  label: "Create your first task",
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg text-white font-display font-[700]">
                  Recent Activity
                </h2>
                <p className="text-xs text-[#6b7a6e] font-body mt-1">
                  Latest workspace activity
                </p>
              </div>
            </div>

            <EmptyState label="No recent activity" />
          </div>
        </div>
      </div>
    </div>
  );
}

