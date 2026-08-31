import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <div className="font-display font-800 text-[120px] leading-none text-brand-lime/20 mb-4">
          404
        </div>
        <h1 className="font-display font-800 text-3xl text-white mb-3">
          Page not found
        </h1>
        <p className="font-body text-brand-muted mb-8 max-w-sm mx-auto">
          This page doesn't exist or was moved. Head back to the home screen.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-lime text-brand-dark font-display font-700 px-6 py-3 rounded-sm hover:bg-white transition-colors"
        >
          Back to home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
