import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createRow, listRows, updateRow } from "../../lib/db.js";
import { useAuth } from "../../lib/auth.jsx";
import { Plus, CheckSquare, X, AlertCircle, ArrowRight, Send, User, Clock, ChevronRight } from "lucide-react";

const statusCfg = {
  todo: { label: "To Do", bg: "bg-white/[0.04]", text: "text-[#8a9b8e]", border: "border-white/[0.06]" },
  in_progress: { label: "In Progress", bg: "bg-sky-400/10", text: "text-sky-400", border: "border-sky-400/20" },
  blocked: { label: "Blocked", bg: "bg-rose-400/10", text: "text-rose-400", border: "border-rose-400/20" },
  done: { label: "Done", bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
};
const priorityCfg = {
  low: { text: "text-[#6b7a6e]", dot: "bg-[#6b7a6e]" },
  medium: { text: "text-sky-400", dot: "bg-sky-400" },
  high: { text: "text-amber-400", dot: "bg-amber-400" },
  critical: { text: "text-rose-400", dot: "bg-rose-400" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AppTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [projects, setProjects] = useState([]);

  const loadTasks = useCallback(() => {
    const ctrl = new AbortController();
    listRows("tasks", { perPage: 100, sort: "-created", signal: ctrl.signal })
      .then(setTasks)
      .catch(e => { if (e?.name !== "AbortError") console.error(e); })
      .finally(() => setLoading(false));
    return ctrl;
  }, []);

  useEffect(() => {
    const ctrl = loadTasks();
    listRows("projects", { perPage: 50, sort: "name" }).then(setProjects).catch(() => {});
    return () => ctrl.abort();
  }, [loadTasks]);

  const filtered = filter === "all" ? tasks
    : filter === "mine" ? tasks.filter(t => t.assigned_user_id === user?.id || t.assigned_to === user?.full_name)
    : tasks.filter(t => t.status === filter);

  async function toggleDone(task, e) {
    e.stopPropagation();
    const next = task.status === "done" ? "todo" : "done";
    try {
      const updated = await updateRow("tasks", task.id, { status: next });
      setTasks(ts => ts.map(t => t.id === task.id ? updated : t));
      if (selectedTask?.id === task.id) setSelectedTask(updated);
    } catch {}
  }

  const counts = {
    all: tasks.length,
    mine: tasks.filter(t => t.assigned_user_id === user?.id || t.assigned_to === user?.full_name).length,
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  function getProjectName(projectId) {
    return projects.find(p => p.id === projectId)?.name || "";
  }

  return (
    <div className="flex h-full min-h-screen">
      {/* Main task list */}
      <div className={`flex-1 min-w-0 p-6 lg:p-8 transition-all ${selectedTask ? "hidden lg:block max-w-[600px]" : ""}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-[700] text-[24px] text-white tracking-[-0.02em]">Tasks</h1>
            <p className="text-[14px] text-[#6b7a6e] font-body mt-0.5">{tasks.length} total · {counts.done} completed</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] text-[13px] font-display font-[700] px-4 py-2.5 rounded-xl hover:bg-white transition-all min-h-[44px]">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {[
            { k: "all", label: "All" },
            { k: "mine", label: "My Tasks" },
            { k: "todo", label: "To Do" },
            { k: "in_progress", label: "In Progress" },
            { k: "blocked", label: "Blocked" },
            { k: "done", label: "Done" },
          ].map(({ k, label }) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`text-[13px] font-body font-[450] px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${
                filter === k ? "bg-[#e8ff4d]/10 text-[#e8ff4d] border border-[#e8ff4d]/20" : "text-[#6b7a6e] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}>
              {label}
              <span className={`ml-1.5 text-[11px] ${filter === k ? "text-[#e8ff4d]/70" : "text-[#4a5c4e]"}`}>{counts[k]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({length: 6}).map((_, i) => <div key={i} className="bg-[#0f1410] border border-white/[0.06] rounded-xl h-[64px] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-10 text-center">
            <CheckSquare className="w-10 h-10 text-[#3a4c3e] mx-auto mb-3" />
            <p className="text-[15px] text-white font-body font-[450] mb-1">
              {filter === "mine" ? "No tasks assigned to you" : filter === "done" ? "No completed tasks" : "No tasks here"}
            </p>
            <p className="text-[13px] text-[#4a5c4e] font-body">
              {filter === "all" ? "Create your first task to get started" : `No tasks with this filter`}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(t => {
              const pCfg = priorityCfg[t.priority] || priorityCfg.medium;
              const sCfg = statusCfg[t.status] || statusCfg.todo;
              const isSelected = selectedTask?.id === t.id;
              const projName = getProjectName(t.project_id);
              return (
                <div key={t.id}
                  onClick={() => setSelectedTask(isSelected ? null : t)}
                  className={`bg-[#0f1410] border rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all cursor-pointer group ${
                    isSelected ? "border-[#e8ff4d]/30 bg-[#e8ff4d]/[0.03]" : "border-white/[0.06] hover:border-white/[0.10]"
                  }`}>
                  {/* Done toggle */}
                  <button
                    onClick={e => toggleDone(t, e)}
                    className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all min-w-[20px] min-h-[20px] ${
                      t.status === "done" ? "border-[#e8ff4d] bg-[#e8ff4d]/20" : "border-white/20 hover:border-[#e8ff4d]"
                    }`}>
                    {t.status === "done" && <div className="w-2.5 h-2.5 bg-[#e8ff4d] rounded-full" />}
                  </button>

                  {/* Priority dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${pCfg.dot}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-body font-[450] truncate ${t.status === "done" ? "line-through text-[#4a5c4e]" : "text-white"}`}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {projName && <span className="text-[11px] text-[#4a5c4e] font-body truncate">{projName}</span>}
                      {projName && t.assigned_to && <span className="text-[#3a4c3e]">·</span>}
                      {t.assigned_to && <span className="text-[11px] text-[#4a5c4e] font-body">{t.assigned_to}</span>}
                      {t.due_date && <><span className="text-[#3a4c3e]">·</span><span className="text-[11px] text-[#4a5c4e] font-body">Due {t.due_date}</span></>}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`shrink-0 text-[11px] font-body font-[500] px-2 py-0.5 rounded-md border ${sCfg.text} ${sCfg.bg} ${sCfg.border}`}>
                    {sCfg.label}
                  </span>

                  {/* Progress */}
                  {t.progress_pct > 0 && t.status !== "done" && (
                    <span className="shrink-0 text-[11px] text-[#6b7a6e] font-body">{t.progress_pct}%</span>
                  )}

                  <ChevronRight className={`w-4 h-4 shrink-0 text-[#3a4c3e] transition-transform ${isSelected ? "rotate-90 text-[#e8ff4d]" : "group-hover:translate-x-0.5"}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task detail / update panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectName={projects.find(p => p.id === selectedTask.project_id)?.name || ""}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={updated => {
            setTasks(ts => ts.map(t => t.id === updated.id ? updated : t));
            setSelectedTask(updated);
          }}
        />
      )}

      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onCreated={t => { setTasks(ts => [t, ...ts]); setShowModal(false); }}
        />
      )}
    </div>
  );
}

// ── Task Detail Panel ──────────────────────────────────────────────────────────
function TaskDetailPanel({ task, projectName, onClose, onTaskUpdated }) {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [message, setMessage] = useState("");
  const [newStatus, setNewStatus] = useState(task.status);
  const [progress, setProgress] = useState(task.progress_pct || 0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setNewStatus(task.status);
    setProgress(task.progress_pct || 0);
    const ctrl = new AbortController();
    listRows("task_updates", { perPage: 50, eq: { task_id: task.id }, sort: "-created", signal: ctrl.signal })
      .then(setUpdates)
      .catch(e => { if (e?.name !== "AbortError") console.error(e); })
      .finally(() => setLoadingUpdates(false));
    return () => ctrl.abort();
  }, [task.id, task.status, task.progress_pct]);

  async function handleSubmitUpdate(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      // Save the update
      const update = await createRow("task_updates", {
        task_id: task.id,
        project_id: task.project_id,
        author_id: user?.id || "",
        author_name: user?.full_name || user?.email || "Team Member",
        message: message.trim(),
        new_status: newStatus !== task.status ? newStatus : "",
        progress_pct: progress,
      });

      // Update the task itself with new status + progress
      const updatedTask = await updateRow("tasks", task.id, {
        status: newStatus,
        progress_pct: progress,
        notes: message.trim(),
      });

      setUpdates(us => [update, ...us]);
      setMessage("");
      onTaskUpdated(updatedTask);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const pCfg = priorityCfg[task.priority] || priorityCfg.medium;

  return (
    <div className="w-full lg:w-[420px] shrink-0 bg-[#0b0f0e] border-l border-white/[0.06] flex flex-col h-full min-h-screen">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full shrink-0 ${pCfg.dot}`} />
            {projectName && <span className="text-[11px] text-[#4a5c4e] font-body truncate">{projectName}</span>}
          </div>
          <h2 className="font-display font-[600] text-[16px] text-white tracking-[-0.01em] leading-snug">{task.title}</h2>
        </div>
        <button onClick={onClose} className="text-[#4a5c4e] hover:text-white transition-colors shrink-0 mt-0.5 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Task meta */}
      <div className="px-5 py-4 border-b border-white/[0.06] space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <MetaItem label="Status">
            <span className={`text-[12px] font-body font-[500] ${statusCfg[task.status]?.text}`}>
              {statusCfg[task.status]?.label}
            </span>
          </MetaItem>
          <MetaItem label="Priority">
            <span className={`text-[12px] font-body font-[500] capitalize ${pCfg.text}`}>{task.priority}</span>
          </MetaItem>
          {task.assigned_to && (
            <MetaItem label="Assigned To">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#e8ff4d]/10 flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-[#e8ff4d]" />
                </div>
                <span className="text-[12px] text-white font-body truncate">{task.assigned_to}</span>
              </div>
            </MetaItem>
          )}
          {task.due_date && (
            <MetaItem label="Due Date">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#4a5c4e]" />
                <span className="text-[12px] text-white font-body">{task.due_date}</span>
              </div>
            </MetaItem>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#4a5c4e] font-body uppercase tracking-wide">Progress</span>
            <span className="text-[12px] text-[#e8ff4d] font-display font-[600]">{task.progress_pct || 0}%</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-[#e8ff4d] rounded-full transition-all duration-500"
              style={{ width: `${task.progress_pct || 0}%` }} />
          </div>
        </div>
      </div>

      {/* Update form */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[11px] font-body font-[500] text-[#6b7a6e] uppercase tracking-wide mb-3">Post an Update</p>
        <form onSubmit={handleSubmitUpdate} className="space-y-3">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="What progress have you made? Any blockers or notes?"
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/40 text-white text-[13px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all resize-none placeholder:text-[#3a4c3e]"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-body text-[#4a5c4e] mb-1 uppercase tracking-wide">Update Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/40 text-white text-[12px] font-body px-3 py-2 rounded-lg outline-hidden">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-body text-[#4a5c4e] mb-1 uppercase tracking-wide">Progress %</label>
              <input type="number" min="0" max="100" value={progress}
                onChange={e => setProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/40 text-white text-[12px] font-body px-3 py-2 rounded-lg outline-hidden" />
            </div>
          </div>
          <button type="submit" disabled={!message.trim() || submitting}
            className="flex items-center gap-2 justify-center w-full bg-[#e8ff4d] text-[#0b0f0e] font-display font-[700] text-[13px] py-2.5 rounded-xl hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]">
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Posting…" : "Post Update"}
          </button>
        </form>
      </div>

      {/* Update history */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-[11px] font-body font-[500] text-[#6b7a6e] uppercase tracking-wide mb-3">Activity</p>
        {loadingUpdates ? (
          <div className="space-y-3">
            {Array.from({length: 3}).map((_, i) => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[13px] text-[#3a4c3e] font-body">No updates yet — post the first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map(u => (
              <div key={u.id} className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#e8ff4d]/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-display font-[700] text-[#e8ff4d]">
                      {(u.author_name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[12px] text-white font-body font-[450]">{u.author_name || "Team Member"}</span>
                  <span className="text-[11px] text-[#3a4c3e] font-body ml-auto">{timeAgo(u.created)}</span>
                </div>
                <p className="text-[13px] text-[#8a9b8e] font-body leading-relaxed">{u.message}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {u.new_status && u.new_status !== task.status && (
                    <span className={`text-[10px] font-body px-2 py-0.5 rounded-md border ${statusCfg[u.new_status]?.text} ${statusCfg[u.new_status]?.bg} ${statusCfg[u.new_status]?.border}`}>
                      → {statusCfg[u.new_status]?.label}
                    </span>
                  )}
                  {u.progress_pct > 0 && (
                    <span className="text-[10px] text-[#e8ff4d]/70 font-body">{u.progress_pct}% progress</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-body text-[#4a5c4e] uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  );
}

function NewTaskModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", project_id: "", assigned_to: "", assigned_user_id: "", priority: "medium", status: "todo", due_date: "" });
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listRows("projects", { perPage: 50, sort: "name" }).then(setProjects).catch(() => {});
    listRows("users", { perPage: 100, sort: "full_name" }).then(setTeamMembers).catch(() => {});
  }, []);

  function set(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })); }

  function handleMemberSelect(e) {
    const uid = e.target.value;
    const member = teamMembers.find(m => m.id === uid);
    setForm(f => ({ ...f, assigned_user_id: uid, assigned_to: member ? (member.full_name || member.email) : "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Task title is required."); return; }
    if (!form.project_id) { setError("Please select a project."); return; }
    setError(""); setLoading(true);
    try {
      const rec = await createRow("tasks", { ...form, progress_pct: 0 });
      onCreated(rec);
    } catch {
      setError("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1410] border border-white/[0.08] rounded-2xl w-full max-w-[460px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-[600] text-[16px] text-white">New Task</h2>
          <button onClick={onClose} className="text-[#4a5c4e] hover:text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-3 py-2.5 rounded-xl font-body">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Task Title *</label>
            <input type="text" value={form.title} onChange={set("title")} placeholder="Install deck formwork"
              autoFocus
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Project *</label>
            <select value={form.project_id} onChange={set("project_id")}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all">
              <option value="">Select project…</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Assign To</label>
            <select value={form.assigned_user_id} onChange={handleMemberSelect}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all">
              <option value="">Unassigned</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Priority</label>
              <select value={form.priority} onChange={set("priority")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Status</label>
              <select value={form.status} onChange={set("status")}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Due Date</label>
            <input type="date" value={form.due_date} onChange={set("due_date")}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] text-[#8a9b8e] hover:text-white text-[14px] font-body py-3 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#e8ff4d] hover:bg-white text-[#0b0f0e] text-[14px] font-display font-[700] py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
