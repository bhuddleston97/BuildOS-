import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#60a5fa]/30 border-t-[#60a5fa] rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;
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
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
