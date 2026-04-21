// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Wrench, AlertCircle, BookMarked } from "lucide-react";

import { portals } from "../config/portals.js";
import { useAuth } from "../context/AuthContext.jsx";
import LeftPanel from "../components/auth/LeftPanel.jsx";
import MicrosoftIcon from "../components/auth/MicrosoftIcon.jsx";
import GoogleIcon from "../components/auth/GoogleIcon.jsx";

// Import our newly refactored components
import PortalSelector from "../components/auth/PortalSelector.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";
import SignupForm from "../components/auth/SignupForm.jsx";

export default function AuthPage() {
  const [selectedPortalId, setSelectedPortalId] = useState(localStorage.getItem('unibook_portal') || null);
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [yearSemester, setYearSemester] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [errors, setErrors] = useState({});
  const [isRememberMe, setIsRememberMe] = useState(false);

  const { devLogin, login, user } = useAuth();
  const [prevUser, setPrevUser] = useState(null);


  if (user !== prevUser) {
    setPrevUser(user);
    if (user?.requiresRegistration) {
      setIsLogin(false);
      if (user.email) setEmail(user.email);
      if (user.name) setName(user.name);
    }
  }

  const selectedPortal = portals.find((p) => p.id === selectedPortalId);
  const isPrivileged = selectedPortal?.isPrivileged ?? false;
  const accentColor = selectedPortal?.accentColor ?? "#1D4ED8";
  const accentLight = selectedPortal?.accentLight ?? "#EFF6FF";

  const handlePortalSelect = (id) => {
    setSelectedPortalId(id);
    localStorage.setItem('unibook_portal', id);
    setEmail(""); setPassword(""); setName("");
    setErrors({});
    const selectedPortalData = portals.find((p) => p.id === id);
    if (selectedPortalData?.isPrivileged) setIsLogin(true);
  };

  const handleBack = () => {
    setSelectedPortalId(null);
    localStorage.removeItem('unibook_portal');
    setIsLogin(true);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = "Please fill this field";
    if (!user?.requiresRegistration && !password) newErrors.password = "Please fill this field";

    if (!isLogin) {
      if (!name) newErrors.name = "Please fill this field";
      if (!phoneNumber) newErrors.phoneNumber = "Please fill this field";
      if (selectedPortalId === "student" || selectedPortalId === "lecturer") {
        if (!faculty) newErrors.faculty = "Please fill this field";
      }
      if (selectedPortalId === "student") {
        if (!specialization) newErrors.specialization = "Please fill this field";
        if (!yearSemester) newErrors.yearSemester = "Please fill this field";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (user?.requiresRegistration) {
      try {
        await axios.post('http://localhost:8080/api/auth/complete-profile', {
          role: selectedPortalId.toUpperCase(),
          faculty, currentSemester: yearSemester, phoneNumber, specialization
        });
        localStorage.removeItem('unibook_portal');
        alert("Registration Complete! Welcome to UniBook.");
        window.location.href = '/';
      } catch (error) {
        console.error("Profile completion failed:", error);
        alert("Failed to complete registration. Please try again.");
      }
    } else if (!isLogin) {
      try {
        await axios.post('http://localhost:8080/api/auth/register', {
          required: true, name, email, password, role: selectedPortalId.toUpperCase(),
          faculty, yearSemester, phoneNumber, specialization,
        });
        alert("Registration Successful! You can now log in.");
        setIsLogin(true);
        setPassword("");
      } catch (error) {
        console.error("Registration failed:", error);
        alert(error.response?.data || "Registration failed. Please try again.");
      }
    } else {
      try {
        await axios.post('http://localhost:8080/api/auth/login', { 
            email, 
            password,
            rememberMe: isRememberMe // 👈 SEND IT HERE
        });
        window.location.href = '/';
      } catch (error) {
        console.error("Login failed:", error);
        alert(error.response?.data || "Invalid email or password.");
      }
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      <LeftPanel selectedPortal={selectedPortal} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Back link & Mobile Logo */}
          <div className="flex items-center justify-between mb-8">
            {selectedPortalId ? (
              <button onClick={handleBack} className="inline-flex items-center gap-1.5 transition-colors text-sm text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" /> Change Portal
              </button>
            ) : (
              <Link to="/" className="inline-flex items-center gap-1.5 transition-colors text-sm text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
            )}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accentColor }}>
                <BookMarked className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900">UniBook</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!selectedPortalId ? (
              <PortalSelector key="portal-select" onSelect={handlePortalSelect} />
            ) : (
              <Motion.div
  key={`form-${selectedPortalId}`}
  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
>
                {/* Portal badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl mb-6" style={{ background: accentLight, border: `1.5px solid ${accentColor}30` }}>
                  <span className="text-base">{selectedPortal?.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: accentColor }}>{selectedPortal?.fullLabel} Portal</span>
                  {isPrivileged && (
                    <>
                      <div className="w-px h-3.5 bg-gray-300 mx-0.5" />
                      <Shield className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-semibold text-red-500">Privileged Access</span>
                    </>
                  )}
                </div>

                {/* Heading */}
                <div className="mb-7">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {user?.requiresRegistration ? "Complete Your Profile" : isLogin ? "Welcome back 👋" : `Join as a ${selectedPortal?.fullLabel}`}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {user?.requiresRegistration ? "Your Microsoft email is verified! Please fill in the remaining details." : isLogin ? `Sign in to your ${selectedPortal?.fullLabel} dashboard` : `Create your ${selectedPortal?.fullLabel} account — it's free`}
                  </p>
                </div>

                {/* Banner for new MS users */}
                {user?.requiresRegistration && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-6 bg-blue-50 border border-blue-200">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900"><strong>Not a registered user.</strong> Please complete the form below to finish setting up your account.</p>
                  </div>
                )}

                {/* Toggle (Hidden for Privileged or MS setup) */}
                {!isPrivileged && !user?.requiresRegistration && (
                  <div className="flex rounded-xl p-1 mb-7 bg-slate-100 border border-slate-200">
                    {["Sign In", "Create Account"].map((tab, i) => {
                      const active = (i === 0 && isLogin) || (i === 1 && !isLogin);
                      return (
                        <button
                          key={tab} onClick={() => { setIsLogin(i === 0); setErrors({}); }}
                          className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${active ? "bg-white font-semibold text-slate-900 shadow-sm" : "font-medium text-slate-400 bg-transparent"}`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Privileged Notice */}
                {isPrivileged && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl mb-6 bg-red-50 border border-red-200">
                    <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 leading-relaxed">This is a <strong>restricted portal</strong>. Unauthorized access attempts are logged.</p>
                  </div>
                )}

                {/* OAuth Buttons */}
                {!user?.requiresRegistration && (
                  <>
                    <div className="space-y-3 mb-5">
                      <button onClick={() => login('microsoft')} type="button" className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm shadow-sm transition-all">
                        <MicrosoftIcon /> Continue with Microsoft
                      </button>
                      {selectedPortalId === "lecturer" && (
                        <button onClick={() => login('google')} type="button" className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm shadow-sm transition-all">
                          <GoogleIcon /> Continue with Google (Visiting Lecturers)
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400">or use email & password</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                  </>
                )}

               {/* --- RENDERING THE REFACTORED FORMS --- */}
                {isLogin && !user?.requiresRegistration ? (
                  <LoginForm 
                    email={email} setEmail={setEmail} password={password} setPassword={setPassword}
                    errors={errors} accentColor={accentColor} selectedPortal={selectedPortal} 
                    isPrivileged={isPrivileged} onSubmit={handleSubmit}
                    isRememberMe={isRememberMe} setIsRememberMe={setIsRememberMe} 
                  />
                ) : user?.requiresRegistration && isPrivileged ? (
                  /* 🛑 THE BOUNCER: Block unregistered MS users on Admin/Tech portals */
                  <div className="mt-4 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-red-800 font-bold text-lg mb-2">Unauthorized User</h3>
                    <p className="text-sm text-red-600 mb-6 leading-relaxed">
                      Your email <strong>{user?.email}</strong> is not registered in the authorized staff pool. Please contact the IT Administrator to provision your account.
                    </p>
                    <button 
                      onClick={() => {
                        // Clear the held session and refresh
                        axios.post('http://localhost:8080/logout').then(() => window.location.reload());
                      }}
                      className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Sign Out & Try Again
                    </button>
                  </div>
                ) : (
                  /* Standard Signup Form for Students/Lecturers */
                  <SignupForm 
                    name={name} setName={setName} faculty={faculty} setFaculty={setFaculty}
                    phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} specialization={specialization}
                    setSpecialization={setSpecialization} yearSemester={yearSemester} setYearSemester={setYearSemester}
                    email={email} setEmail={setEmail} password={password} setPassword={setPassword}
                    errors={errors} selectedPortalId={selectedPortalId} selectedPortal={selectedPortal} 
                    user={user} onSubmit={handleSubmit}
                  />
                )}

                {/* Footer links */}
                {!isPrivileged && !user?.requiresRegistration && (
                  <p className="text-center mt-6 text-sm text-slate-400">
                    {isLogin ? "New to UniBook? " : "Already have an account? "}
                    <button onClick={() => { setIsLogin(!isLogin); setErrors({}); }} className="font-semibold hover:underline" style={{ color: accentColor }}>
                      {isLogin ? "Create a free account" : "Sign in here"}
                    </button>
                  </p>
                )}
                <p className="text-center mt-4 text-xs text-slate-300">
                  By continuing, you agree to our <a href="#" className="text-slate-400 hover:underline">Terms of Service</a> and <a href="#" className="text-slate-400 hover:underline">Privacy Policy</a>.
                </p>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Dev Quick Login */}
          {import.meta.env.DEV && (
            <div className="mt-10 p-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-4 h-4 text-amber-600" />
                <h3 className="text-amber-800 font-bold text-sm">Team 17 Quick Dev Login</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["admin", "technician", "student", "lecturer"].map((role) => (
                  <button key={role} onClick={() => devLogin(role)} className="py-2 px-3 bg-white text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors uppercase tracking-wider">
                    Log in as {role}
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