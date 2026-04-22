// src/pages/Login.jsx
import { BookMarked, Wrench, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import LeftPanel from "../components/auth/LeftPanel.jsx";
import MicrosoftIcon from "../components/auth/MicrosoftIcon.jsx";

export default function AuthPage() {
  const { devLogin, login } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      {/* Visual Left Panel (Keeps your beautiful design) */}
      <LeftPanel selectedPortal={null} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden mb-12">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
              <BookMarked className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">UniBook</span>
          </div>

          {/* Clean SSO Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 bg-blue-50 border border-blue-100">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold tracking-wide text-blue-700 uppercase">Enterprise Secured</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Welcome to UniBook
            </h1>
            <p className="text-slate-500">
              Sign in with your university Microsoft account to access your personalized dashboard.
            </p>
          </div>

          {/* The Single Door (SSO Button) */}
          <button 
            onClick={() => login('microsoft')} 
            type="button" 
            className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <MicrosoftIcon /> Continue with Microsoft
          </button>

          <p className="text-center mt-8 text-xs text-slate-400">
            Account provisioning is managed by the University IT Department.<br/>
            Contact support if you cannot access your portal.
          </p>

          {/* Dev Quick Login (Kept for your team's testing) */}
          {import.meta.env.DEV && (
            <div className="mt-16 p-5 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Wrench className="w-4 h-4 text-amber-600" />
                <h3 className="text-amber-800 font-bold text-sm">Team 17 Quick Dev Login</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["admin", "technician", "student", "lecturer"].map((role) => (
                  <button 
                    key={role} 
                    onClick={() => devLogin(role)} 
                    className="py-2.5 px-3 bg-white text-amber-900 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors uppercase tracking-wider shadow-sm"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}