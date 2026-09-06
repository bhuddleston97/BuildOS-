import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const root = createRoot(document.getElementById("root"));
const rootPath = new URL(document.baseURI).pathname.replace(/\/$/, "");
const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!hasSupabaseConfig) {
  root.render(
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "#09090b", color: "#e2e8f0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <main style={{ maxWidth: "520px", textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>BuildOS configuration required</h1>
        <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the deployment environment, then redeploy.</p>
      </main>
    </div>,
  );
} else {
  import("./App.jsx").then(({ default: App }) => {
    root.render(
      <StrictMode>
        <BrowserRouter basename={rootPath}>
          <App />
        </BrowserRouter>
      </StrictMode>,
    );
  });
}
