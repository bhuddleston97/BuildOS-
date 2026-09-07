import { Routes, Route, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import { supabase } from "./lib/supabase.js";
import SiteLayout from "./layouts/SiteLayout.jsx";
import AppShell from "./layouts/AppShell.jsx";
import Home from "./pages/Home.jsx";
import Features from "./pages/Features.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pricing from "./pages/Pricing.jsx";
import Contact from "./pages/Contact.jsx";
import SignIn from "./pages/SignIn.jsx";
import NotFound from "./pages/NotFound.jsx";
import AppDashboard from "./pages/app/AppDashboard.jsx";
import AppProjects from "./pages/app/AppProjects.jsx";
import AppTasks from "./pages/app/AppTasks.jsx";
import AppSchedule from "./pages/app/AppSchedule.jsx";
import AppReports from "./pages/app/AppReports.jsx";
import AppFinancials from "./pages/app/AppFinancials.jsx";
import AppTeam from "./pages/app/AppTeam.jsx";
import AppSettings from "./pages/app/AppSettings.jsx";
import AppChangeOrders from "./pages/app/AppChangeOrders.jsx";
import AppVendors from "./pages/app/AppVendors.jsx";
import AppNotifications from "./pages/app/AppNotifications.jsx";
import AppProjectWizard from "./pages/app/AppProjectWizard.jsx";
import InviteAccept from "./pages/InviteAccept.jsx";
import AppSubscribe from "./pages/app/AppSubscribe.jsx";

const ACTIVE_STATUSES = new Set(["trialing", "active"]);
const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 8; // ~12 seconds

function ProtectedRoute({ children }) {
  const { user, loading, setUser } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [polling, setPolling] = useState(false);

  const checkoutSuccess = searchParams.get("checkout") === "success";

  useEffect(() => {
    if (!checkoutSuccess || !user || ACTIVE_STATUSES.has(user.subscription_status)) return;

    let attempts = 0;
    setPolling(true);

    const interval = setInterval(async () => {
      attempts++;
      // Poll organizations table — that's where the webhook writes subscription_status
      const { data: org } = await supabase
        .from("organizations")
        .select("subscription_status, subscription_plan, subscription_period_end, stripe_customer_id")
        .eq("id", user.organization_id)
        .maybeSingle();

      if (ACTIVE_STATUSES.has(org?.subscription_status)) {
        clearInterval(interval);
        setUser((u) => ({ ...u, ...org }));
        setSearchParams({}, { replace: true });
        setPolling(false);
      } else if (attempts >= POLL_MAX_ATTEMPTS) {
        clearInterval(interval);
        setPolling(false);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [checkoutSuccess, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || polling) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <div className="w-6 h-6 border-2 border-[#60a5fa]/30 border-t-[#60a5fa] rounded-full animate-spin" />
        {polling && (
          <p className="text-[13px] text-slate-400 font-body">Confirming your subscription…</p>
        )}
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  const isSubscribePage = location.pathname === "/app/subscribe";
  if (!isSubscribePage && !ACTIVE_STATUSES.has(user.subscription_status)) {
    return <Navigate to="/app/subscribe" replace />;
  }

  return children;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#60a5fa]/30 border-t-[#60a5fa] rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public marketing site */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth — redirect if already signed in */}
        <Route path="/signin" element={<AuthRoute><SignIn /></AuthRoute>} />
        <Route path="/invite" element={<InviteAccept />} />

        {/* Protected app */}
        <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<AppDashboard />} />
          <Route path="projects" element={<AppProjects />} />
          <Route path="projects/new" element={<AppProjectWizard />} />
          <Route path="tasks" element={<AppTasks />} />
          <Route path="schedule" element={<AppSchedule />} />
          <Route path="reports" element={<AppReports />} />
          <Route path="financials" element={<AppFinancials />} />
          <Route path="team" element={<AppTeam />} />
          <Route path="change-orders" element={<AppChangeOrders />} />
          <Route path="vendors" element={<AppVendors />} />
          <Route path="notifications" element={<AppNotifications />} />
          <Route path="settings" element={<AppSettings />} />
          <Route path="subscribe" element={<AppSubscribe />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
