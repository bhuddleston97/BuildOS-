import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { LayoutDashboard, FolderOpen, CheckSquare, Calendar, FileText, BarChart2, Users, Bell, Settings, Menu, X, LogOut, FileEdit, Building2, Plus, ChevronRight } from "lucide-react";
const groups = [
  { label: "WORKSPACE", items: [["/app","Overview",LayoutDashboard],["/app/projects","Projects",FolderOpen],["/app/tasks","Tasks",CheckSquare],["/app/schedule","Schedule",Calendar],["/app/reports","Field reports",FileText]] },
  { label: "BUSINESS", items: [["/app/financials","Financials",BarChart2],["/app/change-orders","Change orders",FileEdit],["/app/vendors","Vendors & subs",Building2],["/app/team","Team",Users]] }
];
export default function AppShell() {
 const { user, signOut } = useAuth();
 const { pathname } = useLocation();
 const [mobile,setMobile] = useState(()=>window.innerWidth < 1024);
 useEffect(()=>{const mq=window.matchMedia("(max-width: 1023px)");const update=()=>setMobile(mq.matches);mq.addEventListener("change",update);return()=>mq.removeEventListener("change",update);},[]);
 const [open,setOpen] = useState(false);
 const [error,setError] = useState("");
 const [leaving,setLeaving] = useState(false);
 useEffect(()=>{setOpen(false);},[pathname]);
 useEffect(()=>{if(!open)return; const close=e=>{if(e.key==='Escape')setOpen(false);}; window.addEventListener('keydown',close); return()=>window.removeEventListener('keydown',close);},[open]);
 const name=user?.full_name || user?.email?.split('@')[0] || 'Your account';
 const initials=name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
 const current=pathname.endsWith('/new')?'New project':groups.flatMap(g=>g.items).find(i=>i[0]===pathname)?.[1] || (pathname.includes('settings')?'Settings':'Notifications');
 async function logout(){setLeaving(true);setError('');try{await signOut();}catch{setError('Unable to sign out. Please try again.');}finally{setLeaving(false);}}
 return <div className="premium-shell min-h-screen flex">
  <a className="skip-link" href="#workspace-content">Skip to content</a>
  {open && <button aria-label="Close navigation" onClick={()=>setOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" />}
  <aside inert={mobile && !open} id="workspace-navigation" className={`premium-sidebar fixed inset-y-0 left-0 w-[248px] z-50 flex flex-col transition-transform lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
   <div className="h-[76px] px-6 flex items-center justify-between">
    <Link to="/" className="flex items-center gap-3"><span className="w-8 h-8 bg-brand-lime text-brand-dark rounded-lg flex items-center justify-center"><Building2 size={18}/></span><span className="text-white text-lg font-semibold tracking-tight">Build<span className="text-brand-lime">OS</span></span></Link>
    <button aria-label="Close navigation" onClick={()=>setOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={18}/></button>
   </div>
   <div className="mx-4 mb-5 p-3 rounded-xl border border-white/[.07] bg-white/[.025] flex items-center gap-3"><Building2 size={17} className="text-slate-400"/><div><p className="text-[13px] font-medium text-slate-200">Construction workspace</p><p className="text-[11px] text-slate-400">Projects & operations</p></div></div>
   <nav aria-label="Workspace" className="flex-1 overflow-y-auto px-3 space-y-7">
    {groups.map(group=><div key={group.label}><p className="px-3 mb-2 text-[10px] tracking-[.16em] text-slate-500 font-semibold">{group.label}</p><div className="space-y-1">{group.items.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/app'} className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/[.04]"><Icon size={17} strokeWidth={1.7}/>{label}</NavLink>)}</div></div>)}
   </nav>
   <div className="p-3 mt-5 border-t border-white/[.06]">
    <NavLink to="/app/settings" className="flex items-center gap-3 text-slate-400 hover:text-white text-[13px] px-3 py-3"><Settings size={17}/>Workspace settings</NavLink>
    <div className="flex items-center gap-3 p-3"><span className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center text-xs font-semibold shrink-0">{initials}</span><div className="flex-1 min-w-0"><p className="text-[13px] text-white truncate">{name}</p><p className="text-[11px] text-slate-400 truncate">{user?.email}</p></div><button disabled={leaving} onClick={logout} aria-label="Sign out" className="p-2 text-slate-400 hover:text-white"><LogOut size={16}/></button></div>
    {error && <p role="alert" className="text-xs text-rose-300 px-3">{error}</p>}
   </div>
  </aside>
  <div className="lg:ml-[248px] flex-1 min-w-0">
   <header className="h-[76px] sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[.06] px-4 sm:px-8 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3 text-[13px]"><button aria-label="Open navigation" aria-expanded={open} aria-controls="workspace-navigation" onClick={()=>setOpen(true)} className="lg:hidden p-2 text-slate-400"><Menu size={20}/></button><span className="hidden sm:inline text-slate-500">Workspace</span><ChevronRight size={14} className="hidden sm:block text-slate-600"/><span className="text-slate-200 font-medium">{current}</span></div>
    <div className="flex items-center gap-3"><Link to="/app/projects/new" className="hidden sm:flex items-center gap-2 bg-brand-lime text-brand-dark text-xs font-semibold px-3.5 py-2.5 rounded-lg hover:bg-blue-300"><Plus size={15}/>New project</Link><Link to="/app/notifications" aria-label="Notifications" className="p-2.5 text-slate-400 hover:bg-white/5 rounded-lg"><Bell size={18}/></Link><Link to="/app/settings" aria-label="Account settings" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-200">{initials}</Link></div>
   </header>
   <main id="workspace-content" tabIndex={-1} className="premium-content"><Outlet/></main>
  </div>
 </div>;
}
