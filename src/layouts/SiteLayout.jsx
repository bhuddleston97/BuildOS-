import { Outlet } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";

export default function SiteLayout() {
  return (
    <div className="min-h-screen bg-brand-dark text-brand-text">
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
