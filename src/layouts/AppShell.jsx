import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Calendar,
  FileText,
  BarChart2,
  Users,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  FileEdit,
  Building2,
} from "lucide-react";


const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/projects", label: "Projects", icon: FolderOpen },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/schedule", label: "Schedule", icon: Calendar },
  { to: "/app/reports", label: "Field Reports", icon: FileText },
  { to: "/app/financials", label: "Financials", icon: BarChart2 },
  { to: "/app/change-orders", label: "Change Orders", icon: FileEdit },
  { to: "/app/vendors", label: "Vendors & Subs", icon: Building2 },
  { to: "/app/team", label: "Team", icon: Users },
];

export default function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [ unreadCount] = useState(0);


  function handleSignOut() {
    signOut();
    navigate("/");
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#080c0b] flex">
      {/* Sidebar overlay — mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[240px] bg-[#0b0f0e] border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-[60px] border-b border-white/[0.06] shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#e8ff4d] rounded-[5px]" />
              <svg viewBox="0 0 20 20" className="relative w-4 h-4 z-10" fill="none">
                <path d="M4 13.5h12M4 10h8M4 6.5h5" stroke="#0b0f0e" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-[750] text-[16px] text-white tracking-[-0.02em]">
              Build<span className="text-[#e8ff4d]">OS</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#4a5c4e] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-body font-[450] transition-all duration-150 min-h-[40px] ${
                  isActive
                    ? "bg-[#e8ff4d]/10 text-[#e8ff4d] border border-[#e8ff4d]/15"
                    : "text-[#6b7a6e] hover:text-white hover:bg-white/[0.04]"
                }`
              }>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-0.5">
          <NavLink to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-body font-[450] transition-all duration-150 ${
                isActive ? "bg-[#e8ff4d]/10 text-[#e8ff4d]" : "text-[#6b7a6e] hover:text-white hover:bg-white/[0.04]"
              }`
            }>
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>

          {/* User */}
          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13.5px] font-body font-[450] text-[#6b7a6e] hover:text-white hover:bg-white/[0.04] transition-all duration-150">
              <div className="w-6 h-6 rounded-full bg-[#e8ff4d]/20 text-[#e8ff4d] text-[11px] font-display font-[700] flex items-center justify-center shrink-0">
                {initials}
              </div>
              <span className="truncate flex-1 text-left">
                {user?.full_name || user?.email?.split("@")[0] || "Account"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#141918] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden z-10">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[13px] text-white font-body font-[500] truncate">{user?.full_name || "User"}</p>
                  <p className="text-[11px] text-[#4a5c4e] font-body truncate mt-0.5">{user?.email}</p>
                </div>
                <button onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-[13px] text-rose-400 hover:bg-rose-500/10 transition-colors font-body">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[60px] bg-[#0b0f0e]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-5 shrink-0 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#6b7a6e] hover:text-white transition-colors p-1.5 -ml-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <Link to="/app/notifications" className="relative text-[#6b7a6e] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/[0.04]">
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#e8ff4d] text-[#0b0f0e] text-[9px] font-display font-[700] rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#e8ff4d]/20 text-[#e8ff4d] text-[12px] font-display font-[700] flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
