import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRow, listRows } from "../../lib/db.js";
import { useAuth } from "../../lib/auth.jsx";
import { Check, Plus, X, ArrowRight, ArrowLeft, AlertCircle, UserPlus, Building2, FolderPlus, ListChecks, Rocket } from "lucide-react";

const STEPS = [
  { id: 1, label: "Company", icon: Building2 },
  { id: 2, label: "Project", icon: FolderPlus },
  { id: 3, label: "Tasks", icon: ListChecks },
  { id: 4, label: "Launch", icon: Rocket },
];

const priorityColors = {
  low: "text-[#6b7a6e] bg-[#6b7a6e]/10 border-[#6b7a6e]/20",
  medium: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  high: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function AppProjectWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  // Step 1 — Company / org name
  const [orgName, setOrgName] = useState(user?.organization_id || "");

  // Step 2 — Project details
  const [project, setProject] = useState({
    name: "", client: "", location: "", phase: "Planning", budget: "", status: "active", description: "",
  });

  // Step 3 — Tasks
  const [tasks, setTasks] = useState([
    { title: "", assigned_to: "", assigned_user_id: "", priority: "medium", due_date: "", description: "" }
  ]);

  // Created records
  const [createdProject, setCreatedProject] = useState(null);

  useEffect(() => {
    // Load team members for assignment
    listRows("users", { perPage: 100, sort: "full_name" })
      .then(setTeamMembers)
      .catch(() => {});
  }, []);

  function setP(k) { return (e) => setProject(p => ({ ...p, [k]: e.target.value })); }

  function addTask() {
    setTasks(ts => [...ts, { title: "", assigned_to: "", assigned_user_id: "", priority: "medium", due_date: "", description: "" }]);
  }

  function removeTask(i) {
    setTasks(ts => ts.filter((_, idx) => idx !== i));
  }

  function setTask(i, k, v) {
    setTasks(ts => ts.map((t, idx) => idx === i ? { ...t, [k]: v } : t));
  }

  function handleMemberSelect(i, userId) {
    const member = teamMembers.find(m => m.id === userId);
    setTasks(ts => ts.map((t, idx) => idx === i ? {
      ...t,
      assigned_user_id: userId,
      assigned_to: member ? (member.full_name || member.email) : "",
    } : t));
  }

  async function handleStep2Next() {
    if (!project.name.trim()) { setError("Project name is required."); return; }
    setError("");
    setStep(3);
  }

  async function handleFinish() {
    const validTasks = tasks.filter(t => t.title.trim());
    setSaving(true); setError("");
    try {
      // Create project
      const proj = await createRow("projects", {
        name: project.name.trim(),
        client: project.client.trim(),
        location: project.location.trim(),
        phase: project.phase.trim(),
        budget: parseFloat(project.budget) || 0,
        spent: 0,
        progress: 0,
        crew_count: 0,
        status: project.status,
      });

      // Create tasks in parallel
      if (validTasks.length > 0) {
        await Promise.all(validTasks.map(t =>
          createRow("tasks", {
            title: t.title.trim(),
            project_id: proj.id,
            assigned_to: t.assigned_to,
            assigned_user_id: t.assigned_user_id,
            priority: t.priority,
            due_date: t.due_date,
            description: t.description,
            status: "todo",
            progress_pct: 0,
          })
        ));
      }

      // Create notifications for assigned team members
      const assignedUserIds = [...new Set(validTasks.map(t => t.assigned_user_id).filter(Boolean))];
      await Promise.all(assignedUserIds.map(uid =>
        createRow("notifications", {
          user_id: uid,
          type: "task_assigned",
          title: "New tasks assigned to you",
          message: `You've been assigned tasks on "${proj.name}". Check your task list to get started.`,
          severity: "info",
          read: false,
          link: "/app/tasks",
        }).catch(() => {})
      ));

      setCreatedProject(proj);
      setStep(4);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080c0b] flex items-start justify-center p-6 lg:p-10">
      <div className="w-full max-w-[760px]">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate("/app/projects")}
            className="flex items-center gap-2 text-[#4a5c4e] hover:text-white transition-colors text-[13px] font-body mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
          <h1 className="font-display font-[750] text-[28px] text-white tracking-[-0.03em] mb-1">
            New Project Wizard
          </h1>
          <p className="text-[14px] text-[#6b7a6e] font-body">
            Set up your company, create a project, and assign tasks to your team — all in one flow.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, idx) => {
            const done = step > s.id;
            const active = step === s.id;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                    done ? "bg-[#e8ff4d] border-[#e8ff4d] text-[#0b0f0e]"
                    : active ? "bg-[#e8ff4d]/10 border-[#e8ff4d]/40 text-[#e8ff4d]"
                    : "bg-white/[0.03] border-white/[0.06] text-[#3a4c3e]"
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] font-body mt-1.5 ${active ? "text-[#e8ff4d]" : done ? "text-white" : "text-[#3a4c3e]"}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 mb-5 transition-all duration-300 ${step > s.id ? "bg-[#e8ff4d]/40" : "bg-white/[0.06]"}`} />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[13px] px-4 py-3 rounded-xl font-body mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* ── STEP 1: Company ── */}
        {step === 1 && (
          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-7 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#e8ff4d]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#e8ff4d]" />
              </div>
              <div>
                <h2 className="font-display font-[650] text-[18px] text-white tracking-[-0.02em]">Your Company</h2>
                <p className="text-[13px] text-[#4a5c4e] font-body">This is how your business will appear across the platform.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-2 tracking-wide uppercase">Company Name *</label>
                <input
                  type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Meridian Construction Group"
                  autoFocus
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[16px] font-body px-4 py-3 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]"
                />
                <p className="text-[12px] text-[#4a5c4e] font-body mt-1.5">Enter the name of your construction company or organization.</p>
              </div>
              <div className="bg-[#e8ff4d]/5 border border-[#e8ff4d]/10 rounded-xl p-4">
                <p className="text-[13px] text-[#8a9b8e] font-body leading-relaxed">
                  Your company name appears in reports, invoices, and notifications sent to your team and clients.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => { if (!orgName.trim()) { setError("Please enter your company name."); return; } setError(""); setStep(2); }}
                className="flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] font-display font-[700] text-[14px] px-6 py-3 rounded-xl hover:bg-white transition-all">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Project ── */}
        {step === 2 && (
          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-7 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#e8ff4d]/10 flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-[#e8ff4d]" />
              </div>
              <div>
                <h2 className="font-display font-[650] text-[18px] text-white tracking-[-0.02em]">Project Details</h2>
                <p className="text-[13px] text-[#4a5c4e] font-body">Tell us about the project you're creating for <span className="text-[#e8ff4d]">{orgName}</span>.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Project Name *</label>
                <input type="text" value={project.name} onChange={setP("name")}
                  placeholder="e.g. Downtown Mixed-Use Tower"
                  autoFocus
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[15px] font-body px-4 py-3 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Client</label>
                  <input type="text" value={project.client} onChange={setP("client")}
                    placeholder="Zenith Properties LLC"
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
                </div>
                <div>
                  <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Location</label>
                  <input type="text" value={project.location} onChange={setP("location")}
                    placeholder="City, State"
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
                </div>
                <div>
                  <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Current Phase</label>
                  <select value={project.phase} onChange={setP("phase")}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all">
                    {["Planning","Design","Permitting","Site Prep","Foundation","Framing","MEP","Finishes","Closeout"].map(ph =>
                      <option key={ph} value={ph}>{ph}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Budget ($)</label>
                  <input type="number" value={project.budget} onChange={setP("budget")}
                    placeholder="0"
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#e8ff4d]/50 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-body font-[500] text-[#8a9b8e] mb-1.5 tracking-wide uppercase">Status</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "active", label: "On Track", color: "emerald" },
                    { value: "at_risk", label: "At Risk", color: "amber" },
                    { value: "delayed", label: "Delayed", color: "rose" },
                  ].map(({ value, label, color }) => (
                    <button key={value} type="button" onClick={() => setProject(p => ({ ...p, status: value }))}
                      className={`px-4 py-2 rounded-xl text-[13px] font-body font-[450] border transition-all ${
                        project.status === value
                          ? color === "emerald" ? "bg-emerald-400/15 border-emerald-400/30 text-emerald-400"
                          : color === "amber" ? "bg-amber-400/15 border-amber-400/30 text-amber-400"
                          : "bg-rose-400/15 border-rose-400/30 text-rose-400"
                          : "bg-white/[0.03] border-white/[0.06] text-[#6b7a6e] hover:text-white"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={() => { setError(""); setStep(1); }}
                className="flex items-center gap-2 text-[#6b7a6e] hover:text-white transition-colors text-[14px] font-body">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleStep2Next}
                className="flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] font-display font-[700] text-[14px] px-6 py-3 rounded-xl hover:bg-white transition-all">
                Add Tasks <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Tasks ── */}
        {step === 3 && (
          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-7 lg:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#e8ff4d]/10 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-[#e8ff4d]" />
              </div>
              <div>
                <h2 className="font-display font-[650] text-[18px] text-white tracking-[-0.02em]">Create & Assign Tasks</h2>
                <p className="text-[13px] text-[#4a5c4e] font-body">Add tasks for <span className="text-white">{project.name}</span> and assign them to your team.</p>
              </div>
            </div>

            <p className="text-[12px] text-[#4a5c4e] font-body mb-6 ml-13">
              Each assigned team member will receive a notification to get started.
            </p>

            <div className="space-y-3 mb-4">
              {tasks.map((t, i) => (
                <div key={i} className="bg-[#080c0b] border border-white/[0.06] rounded-xl p-4 group">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#e8ff4d]/10 text-[#e8ff4d] text-[11px] font-display font-[700] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        type="text" value={t.title}
                        onChange={e => setTask(i, "title", e.target.value)}
                        placeholder="Task title, e.g. Pour concrete footings"
                        className="w-full bg-white/[0.04] border border-white/[0.06] focus:border-[#e8ff4d]/40 text-white text-[14px] font-body px-3.5 py-2.5 rounded-xl outline-hidden transition-all placeholder:text-[#3a4c3e]"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-body font-[500] text-[#4a5c4e] mb-1 tracking-wide uppercase">Assign To</label>
                          <select
                            value={t.assigned_user_id}
                            onChange={e => handleMemberSelect(i, e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.06] focus:border-[#e8ff4d]/40 text-white text-[13px] font-body px-3 py-2 rounded-lg outline-hidden transition-all">
                            <option value="">Unassigned</option>
                            {teamMembers.map(m => (
                              <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-body font-[500] text-[#4a5c4e] mb-1 tracking-wide uppercase">Priority</label>
                          <select value={t.priority} onChange={e => setTask(i, "priority", e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.06] focus:border-[#e8ff4d]/40 text-white text-[13px] font-body px-3 py-2 rounded-lg outline-hidden">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-body font-[500] text-[#4a5c4e] mb-1 tracking-wide uppercase">Due Date</label>
                          <input type="date" value={t.due_date} onChange={e => setTask(i, "due_date", e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.06] focus:border-[#e8ff4d]/40 text-white text-[13px] font-body px-3 py-2 rounded-lg outline-hidden" />
                        </div>
                      </div>
                    </div>
                    {tasks.length > 1 && (
                      <button onClick={() => removeTask(i)}
                        className="text-[#3a4c3e] hover:text-rose-400 transition-colors mt-0.5 p-1 opacity-0 group-hover:opacity-100">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addTask}
              className="flex items-center gap-2 text-[#6b7a6e] hover:text-[#e8ff4d] transition-colors text-[13px] font-body border border-dashed border-white/[0.08] hover:border-[#e8ff4d]/20 rounded-xl px-4 py-2.5 w-full justify-center">
              <Plus className="w-4 h-4" /> Add another task
            </button>

            <div className="flex items-center justify-between mt-8">
              <button onClick={() => { setError(""); setStep(2); }}
                className="flex items-center gap-2 text-[#6b7a6e] hover:text-white transition-colors text-[14px] font-body">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleFinish} disabled={saving}
                className="flex items-center gap-2 bg-[#e8ff4d] text-[#0b0f0e] font-display font-[700] text-[14px] px-6 py-3 rounded-xl hover:bg-white transition-all disabled:opacity-60">
                {saving ? "Creating…" : <><Rocket className="w-4 h-4" /> Launch Project</>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 4 && createdProject && (
          <div className="bg-[#0f1410] border border-white/[0.06] rounded-2xl p-8 lg:p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#e8ff4d]/10 flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8 text-[#e8ff4d]" />
            </div>
            <h2 className="font-display font-[750] text-[24px] text-white tracking-[-0.03em] mb-2">
              {createdProject.name} is live!
            </h2>
            <p className="text-[15px] text-[#6b7a6e] font-body mb-2">
              Your project has been created for <span className="text-white">{orgName}</span>.
            </p>
            <p className="text-[13px] text-[#4a5c4e] font-body mb-8">
              {tasks.filter(t => t.title.trim()).length} task{tasks.filter(t => t.title.trim()).length !== 1 ? "s" : ""} assigned
              {tasks.some(t => t.assigned_user_id) ? " — team members have been notified" : ""}.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate("/app/tasks")}
                className="flex items-center gap-2 justify-center bg-[#e8ff4d] text-[#0b0f0e] font-display font-[700] text-[14px] px-6 py-3 rounded-xl hover:bg-white transition-all">
                View Tasks <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/app/projects")}
                className="flex items-center gap-2 justify-center bg-white/[0.05] border border-white/[0.08] text-white font-body text-[14px] px-6 py-3 rounded-xl hover:bg-white/[0.08] transition-all">
                Back to Projects
              </button>
              <button onClick={() => { setStep(1); setOrgName(""); setProject({ name:"",client:"",location:"",phase:"Planning",budget:"",status:"active",description:"" }); setTasks([{title:"",assigned_to:"",assigned_user_id:"",priority:"medium",due_date:"",description:""}]); setCreatedProject(null); }}
                className="flex items-center gap-2 justify-center text-[#4a5c4e] hover:text-white font-body text-[14px] px-6 py-3 rounded-xl transition-all">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
