// src/pages/Login.jsx
import { BookMarked, Wrench, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import LeftPanel from "../components/auth/LeftPanel.jsx";
import MicrosoftIcon from "../components/auth/MicrosoftIcon.jsx";

export default function AuthPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFF" }}>
      
      {/* Visual Left Panel (Kept exactly as your original component) */}
      <LeftPanel selectedPortal={null} />

      {/* ══ RIGHT AUTH PANEL (New Look applied here) ════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6 py-12 md:px-12">
        
        {/* Subtle background tint circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        {/* Mobile top bar */}
        <div className="absolute top-6 left-6 flex items-center gap-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1D4ED8,#6366F1)" }}>
            <BookMarked className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.125rem", letterSpacing: "-0.02em" }}>UniBook</span>
        </div>

        {/* ── AUTH CARD ── */}
        <div className="w-full max-w-sm">
          <div
            className="rounded-3xl p-8"
            style={{
              background: "white",
              boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 24px 64px rgba(15,23,42,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Logo + heading */}
            <div className="flex flex-col items-center text-center mb-8">
              {/* Shiny logo mark */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: "linear-gradient(135deg, #1E40AF 0%, #4F46E5 50%, #7C3AED 100%)",
                  boxShadow: "0 8px 32px rgba(79,70,229,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <BookMarked className="w-7 h-7 text-white" />
              </div>

              <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                Welcome to UniBook
              </h1>
              <p className="mt-2" style={{ fontSize: "0.9375rem", color: "#64748B", lineHeight: 1.6 }}>
                Sign in with your university Microsoft account to access your portal.
              </p>
            </div>

            {/* Microsoft button using your existing imported component */}
            <button 
              onClick={() => login('microsoft')} 
              type="button" 
              className="relative w-full overflow-hidden flex items-center justify-center gap-3 rounded-2xl hover:scale-[1.015] hover:-translate-y-[1px] active:scale-[0.985] transition-all"
              style={{
                padding: "1rem 1.5rem",
                background: "white",
                border: "1.5px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
                color: "#1E293B",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                letterSpacing: "-0.01em",
              }}
            >
              <MicrosoftIcon />
              <span>Continue with Microsoft</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #E2E8F0)" }} />
              <span style={{ fontSize: "0.75rem", color: "#CBD5E1", fontWeight: 500 }}>Role auto-assigned via SSO</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #E2E8F0, transparent)" }} />
            </div>

            {/* Role indicator dots */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[
                { label: "Administrator", color: "#3B82F6" },
                { label: "Technician", color: "#94A3B8" },
                { label: "Student", color: "#34D399" },
                { label: "Lecturer", color: "#FBBF24" }
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                  <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{p.label}</span>
                </div>
              ))}
            </div>

            {/* Info note */}
            <div
              className="mt-5 rounded-xl p-3.5 flex items-start gap-2.5"
              style={{ background: "#F8FAFF", border: "1px solid #E0E7FF" }}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p style={{ fontSize: "0.8125rem", color: "#64748B", lineHeight: 1.55 }}>
                Your access level is determined automatically by your institutional
                credentials upon sign-in.
              </p>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-5 mt-6">
            {["Privacy Policy", "Terms of Use", "IT Support"].map((link) => (
              <a key={link} href="#"
                className="hover:text-slate-500 transition-colors"
                style={{ fontSize: "0.8125rem", color: "#94A3B8" }}
              >
                {link}
              </a>
            ))}
          </div>

          <p className="text-center mt-3" style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>
            © 2026 UniBook · Powered by Microsoft Azure AD
          </p>

        </div>
      </div>
    </div>
  );
}