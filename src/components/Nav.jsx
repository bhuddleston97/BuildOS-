import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/features", label: "Features" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/pricing", label: "Pricing" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0b0f0e]/96 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-lime rounded-[6px]" />
            <svg viewBox="0 0 20 20" className="relative w-4.5 h-4.5 z-10" fill="none">
              <path d="M4 13.5h12M4 10h8M4 6.5h5" stroke="#0b0f0e" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-[750] text-[17px] text-white tracking-[-0.02em]">
            Build<span className="text-brand-lime">OS</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `relative text-[13.5px] font-body font-[450] px-4 py-2 rounded-md transition-all duration-200 ${
                  isActive
                    ? "text-white bg-white/[0.07]"
                    : "text-[#8a9b8e] hover:text-white hover:bg-white/[0.04]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            to="/signin"
            className="text-[13px] text-[#6b7a6e] hover:text-white transition-colors duration-200 font-body font-[450] px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/signin"
            className="bg-brand-lime text-[#0b0f0e] text-[13px] font-display font-[700] px-4 py-2 rounded-md hover:bg-white transition-all duration-200 tracking-[-0.01em]"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#8a9b8e] hover:text-white transition-colors p-2 -mr-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${open ? "max-h-96" : "max-h-0"}`}>
        <div className="bg-[#0f1410] border-t border-white/[0.06] px-6 py-5 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center text-[15px] font-body font-[450] py-2.5 px-3 rounded-md transition-colors min-h-[44px] ${
                  isActive ? "text-brand-lime bg-brand-lime/5" : "text-[#a0b0a4] hover:text-white hover:bg-white/[0.04]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-white/[0.06]">
            <Link
              to="/signin"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-full bg-brand-lime text-[#0b0f0e] text-[14px] font-display font-[700] px-5 py-3 rounded-md"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
