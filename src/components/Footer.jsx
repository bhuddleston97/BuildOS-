import { Link } from "react-router-dom";

export default function Footer() {
  const cols = [
    {
      heading: "Product",
      links: [
        { label: "Features", to: "/features" },
        { label: "Dashboard", to: "/dashboard" },
        { label: "Pricing", to: "/pricing" },
        { label: "Security", to: "/contact" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", to: "/contact" },
        { label: "Careers", to: "/contact" },
        { label: "Blog", to: "/contact" },
        { label: "Contact", to: "/contact" },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Help Center", to: "/contact" },
        { label: "API Docs", to: "/contact" },
        { label: "Status", to: "/contact" },
        { label: "Partners", to: "/contact" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-[#0b0f0e]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-16 pb-10">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-lime rounded-[6px]" />
                <svg viewBox="0 0 20 20" className="relative w-4.5 h-4.5 z-10" fill="none">
                  <path d="M4 13.5h12M4 10h8M4 6.5h5" stroke="#0b0f0e" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-display font-[750] text-[17px] text-white tracking-[-0.02em]">
                Build<span className="text-brand-lime">OS</span>
              </span>
            </div>
            <p className="text-[#5a6b5e] text-[13.5px] font-body leading-relaxed">
              The operating system for modern construction companies.
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-body text-[#5a6b5e] ml-1">All systems operational</span>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <h4 className="font-display font-[650] text-[11px] text-[#4a5a4e] uppercase tracking-[0.1em] mb-5">
                {col.heading}
              </h4>
              <ul className="space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-[#6b7a6e] hover:text-[#c5d4c8] text-[13.5px] font-body transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#3a4a3e] text-[12px] font-body">
            © 2026 BuildOS, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <span
                key={item}
                className="text-[#3a4a3e] text-[12px] font-body hover:text-[#6b7a6e] cursor-pointer transition-colors duration-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
