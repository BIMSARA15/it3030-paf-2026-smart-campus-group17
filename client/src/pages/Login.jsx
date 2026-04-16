import { useState } from "react";
import MicrosoftIcon from "../components/auth/MicrosoftIcon.jsx";
import { Link } from "react-router-dom";
import SelectField from "../components/auth/SelectField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,Lock,User,Eye,EyeOff,ArrowLeft,ChevronRight,Shield,Wrench,AlertCircle,Building2,Calendar,BookMarked
} from "lucide-react";

// Import your newly separated components and config
import { portals } from "../config/portals.js";
import LeftPanel from "../components/auth/LeftPanel.jsx";
import InputField from "../components/auth/InputField.jsx";
import GoogleIcon from "../components/auth/GoogleIcon.jsx";


export default function AuthPage() {
 
  const [selectedPortalId, setSelectedPortalId] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { devLogin, login } = useAuth();
  const [faculty, setFaculty] = useState("");
  const [yearSemester, setYearSemester] = useState("");
  const [registeredCourse, setRegisteredCourse] = useState("");

  const selectedPortal = portals.find((p) => p.id === selectedPortalId);
  const isPrivileged = selectedPortal?.isPrivileged ?? false;
  const accentColor = selectedPortal?.accentColor ?? "#1D4ED8";
  const accentLight = selectedPortal?.accentLight ?? "#EFF6FF";

  const handlePortalSelect = (id) => {
    setSelectedPortalId(id);
    setEmail("");
    setPassword("");
    setName("");
    setShowPassword(false);
    const selectedPortalData = portals.find((p) => p.id === id);
    if (selectedPortalData?.isPrivileged) setIsLogin(true);
  };

  const handleBack = () => {
    setSelectedPortalId(null);
    setIsLogin(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Auth submitted", { portal: selectedPortalId, email, password, name, isLogin });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      {/* ── LEFT PANEL ── */}
      <LeftPanel selectedPortal={selectedPortal} />

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Back link */}
          <div className="flex items-center justify-between mb-8">
            {selectedPortalId ? (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 transition-colors"
                style={{ fontSize: "0.875rem", color: "#94A3B8" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#475569")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <ArrowLeft className="w-4 h-4" />
                Change Portal
              </button>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 transition-colors"
                style={{ fontSize: "0.875rem", color: "#94A3B8" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#475569")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            )}

            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accentColor }}>
                <BookMarked className="w-3.5 h-3.5 text-white" />
              </div>
              <span style={{ fontWeight: 750, color: "#0F172A", fontSize: "1rem" }}>UniBook</span>
            </div>
          </div>

          {/* ── PORTAL SELECTOR (Step 1) ── */}
          <AnimatePresence mode="wait">
            {!selectedPortalId ? (
              <motion.div
                key="portal-select"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="mb-8">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                    style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span style={{ fontSize: "0.75rem", color: "#1D4ED8", fontWeight: 600 }}>
                      UNIVERSITY PORTAL
                    </span>
                  </div>
                  <h1 style={{ fontSize: "1.75rem", fontWeight: 750, color: "#0F172A", letterSpacing: "-0.02em" }}>
                    Select Your Portal
                  </h1>
                  <p className="mt-1.5" style={{ color: "#64748B", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                    Choose your role to access the correct login portal for your account.
                  </p>
                </div>

                {/* Portal Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {portals.map((portal, i) => (
                    <motion.button
                      key={portal.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => handlePortalSelect(portal.id)}
                      className="relative flex flex-col items-start p-4 rounded-2xl text-left transition-all group"
                      style={{
                        border: "1.5px solid #E2E8F0",
                        background: "white",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = portal.accentColor;
                        e.currentTarget.style.boxShadow = `0 4px 16px ${portal.accentColor}20`;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E2E8F0";
                        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Privileged badge */}
                      {portal.isPrivileged && (
                        <div
                          className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                        >
                          <Shield className="w-2.5 h-2.5 text-red-500" />
                          <span style={{ fontSize: "0.5625rem", color: "#EF4444", fontWeight: 600 }}>
                            RESTRICTED
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors"
                        style={{ background: portal.accentLight }}
                      >
                        <portal.icon className="w-5 h-5" style={{ color: portal.accentColor }} />
                      </div>

                      {/* Label */}
                      <p style={{ fontSize: "1rem", fontWeight: 650, color: "#0F172A" }}>
                        {portal.label}
                      </p>
                      <p className="mt-0.5" style={{ fontSize: "0.8125rem", color: "#94A3B8" }}>
                        {portal.description}
                      </p>

                      {/* Arrow */}
                      <ChevronRight
                        className="w-4 h-4 mt-2 transition-all"
                        style={{ color: portal.accentColor, opacity: 0.5 }}
                      />
                    </motion.button>
                  ))}
                </div>

                {/* Note */}
                <div
                  className="flex items-start gap-2.5 p-3.5 rounded-xl"
                  style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
                >
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p style={{ fontSize: "0.8125rem", color: "#92400E", lineHeight: 1.55 }}>
                    <strong>Admin & Technician</strong> accounts are provisioned by your system
                    administrator. Contact IT support if you need access.
                  </p>
                </div>
              </motion.div>

            ) : (
              /* ── LOGIN FORM (Step 2) ── */
              <motion.div
                key={`form-${selectedPortalId}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Portal badge */}
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl mb-6"
                  style={{
                    background: accentLight,
                    border: `1.5px solid ${accentColor}30`,
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{selectedPortal?.emoji}</span>
                  <span style={{ fontSize: "0.8125rem", color: accentColor, fontWeight: 600 }}>
                    {selectedPortal?.fullLabel} Portal
                  </span>
                  {isPrivileged && (
                    <>
                      <div className="w-px h-3.5 bg-gray-300 mx-0.5" />
                      <Shield className="w-3.5 h-3.5 text-red-500" />
                      <span style={{ fontSize: "0.75rem", color: "#EF4444", fontWeight: 600 }}>
                        Privileged Access
                      </span>
                    </>
                  )}
                </div>

                {/* Heading */}
                <div className="mb-7">
                  <h1 style={{ fontSize: "1.75rem", fontWeight: 750, color: "#0F172A", letterSpacing: "-0.02em" }}>
                    {isLogin ? "Welcome back 👋" : `Join as a ${selectedPortal?.fullLabel}`}
                  </h1>
                  <p className="mt-1" style={{ color: "#64748B", fontSize: "0.9375rem" }}>
                    {isLogin
                      ? `Sign in to your ${selectedPortal?.fullLabel} dashboard`
                      : `Create your ${selectedPortal?.fullLabel} account — it's free`}
                  </p>
                </div>

                {/* Toggle — only for non-privileged */}
                {!isPrivileged && (
                  <div
                    className="flex rounded-xl p-1 mb-7"
                    style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}
                  >
                    {["Sign In", "Create Account"].map((tab, i) => {
                      const active = (i === 0 && isLogin) || (i === 1 && !isLogin);
                      return (
                        <button
                          key={tab}
                          onClick={() => setIsLogin(i === 0)}
                          className="flex-1 py-2.5 rounded-lg transition-all"
                          style={{
                            fontSize: "0.9375rem",
                            fontWeight: active ? 600 : 450,
                            color: active ? "#0F172A" : "#94A3B8",
                            background: active ? "white" : "transparent",
                            boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                          }}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Privileged notice */}
                {isPrivileged && (
                  <div
                    className="flex items-start gap-3 p-3.5 rounded-xl mb-6"
                    style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                  >
                    <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p style={{ fontSize: "0.8125rem", color: "#991B1B", lineHeight: 1.55 }}>
                      This is a <strong>restricted portal</strong>. Unauthorized access attempts
                      are logged. Only authorized personnel may proceed.
                    </p>
                  </div>
                )}

                {/* === OAUTH BUTTONS === */}
                <div className="space-y-3 mb-5">
                  {/* Microsoft Button - Primary Login for Everyone */}
                  <button
                    type="button"
                    onClick={() => login('microsoft')} // 👈 Here is where 'login' gets used!
                    className="w-full flex items-center justify-center gap-3 rounded-xl transition-all"
                    style={{
                      padding: "0.875rem 1rem", border: "1.5px solid #E2E8F0", background: "white",
                      color: "#374151", fontWeight: 500, fontSize: "0.9375rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#CBD5E1"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                  >
                    <MicrosoftIcon />
                    Continue with Microsoft
                  </button>

                  {/* Google Button - ONLY for Visiting Lecturers */}
                  {selectedPortalId === "lecturer" && (
                    <button
                      type="button"
                      onClick={() => login('google')} // 👈 Used here too!
                      className="w-full flex items-center justify-center gap-3 rounded-xl transition-all"
                      style={{
                        padding: "0.875rem 1rem", border: "1.5px solid #E2E8F0", background: "white",
                        color: "#374151", fontWeight: 500, fontSize: "0.9375rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#CBD5E1"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                    >
                      <GoogleIcon />
                      Continue with Google (Visiting Lecturers)
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 h-px" style={{ background: "#E9EEF5" }} />
                  <span style={{ color: "#94A3B8", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                    or use email & password
                  </span>
                  <div className="flex-1 h-px" style={{ background: "#E9EEF5" }} />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name — Sign Up only */}
                  <AnimatePresence>
                   {/* === SIGN UP ONLY FIELDS === */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <InputField
                      id="name"
                      label="Full Name"
                      type="text"
                      value={name}
                      onChange={setName}
                      placeholder="e.g. John Doe"
                      icon={User}
                      accentColor={selectedPortal?.accentColor}
                    />

                    {/* FACULTY: Shows for both Student and Lecturer */}
                    {(selectedPortalId === "student" || selectedPortalId === "lecturer") && (
                      <SelectField
                        id="faculty"
                        label="Faculty"
                        value={faculty}
                        onChange={setFaculty}
                        icon={Building2}
                        accentColor={selectedPortal?.accentColor}
                        options={[
                          { value: "Computing", label: "Faculty of Computing" },
                          { value: "Business", label: "Faculty of Business" },
                          { value: "UoB", label: "UoB" }
                        ]}
                      />
                    )}

                    {/* STUDENT ONLY FIELDS: Year/Semester and Course */}
                    {selectedPortalId === "student" && (
                      <>
                        <SelectField
                          id="yearSemester"
                          label="Current Year & Semester"
                          value={yearSemester}
                          onChange={setYearSemester}
                          icon={Calendar}
                          accentColor={selectedPortal?.accentColor}
                          options={[
                            { value: "Y1S1", label: "Year 1 Semester 1" },
                            { value: "Y1S2", label: "Year 1 Semester 2" },
                            { value: "Y2S1", label: "Year 2 Semester 1" },
                            { value: "Y2S2", label: "Year 2 Semester 2" },
                            { value: "Y3S1", label: "Year 3 Semester 1" },
                            { value: "Y3S2", label: "Year 3 Semester 2" },
                            { value: "Y4S1", label: "Year 4 Semester 1" },
                            { value: "Y4S2", label: "Year 4 Semester 2" }
                          ]}
                        />

                        <InputField
                          id="registeredCourse"
                          label="Registered Course"
                          type="text"
                          value={registeredCourse}
                          onChange={setRegisteredCourse}
                          placeholder="e.g. BSc (Hons) in Software Engineering"
                          icon={BookMarked}
                          accentColor={selectedPortal?.accentColor}
                        />
                      </>
                    )}
                  </motion.div>
                )}
                  </AnimatePresence>

                  {/* Email */}
                  <InputField
                    id="email" label="Email Address" type="email"
                    value={email} onChange={setEmail}
                    placeholder={isPrivileged ? "admin@university.edu" : "you@university.edu"}
                    icon={Mail} autoComplete="email"
                    accentColor={accentColor}
                  />

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                        Password
                      </label>
                      {isLogin && (
                        <a
                          href="#"
                          style={{ fontSize: "0.8125rem", color: accentColor, fontWeight: 500 }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <div className="mt-1.5 relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        className="w-full outline-none transition-all rounded-xl"
                        style={{
                          paddingLeft: "2.75rem",
                          paddingRight: "3rem",
                          paddingTop: "0.75rem",
                          paddingBottom: "0.75rem",
                          border: "1.5px solid #E2E8F0",
                          fontSize: "0.9375rem",
                          color: "#0F172A",
                          background: "#FAFAFA",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = accentColor;
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}18`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#E2E8F0";
                          e.currentTarget.style.background = "#FAFAFA";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "#94A3B8" }}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me (login only) */}
                  {isLogin && (
                    <div className="flex items-center gap-2.5">
                      <input
                        id="remember"
                        type="checkbox"
                        className="w-4 h-4 rounded"
                        style={{ accentColor }}
                      />
                      <label
                        htmlFor="remember"
                        style={{ fontSize: "0.875rem", color: "#475569", fontWeight: 400, cursor: "pointer" }}
                      >
                        Keep me signed in
                      </label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                    style={{
                      padding: "0.9375rem",
                      background: `linear-gradient(135deg, ${selectedPortal?.accentDark ?? "#1E3A8A"}, ${accentColor})`,
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      boxShadow: `0 4px 16px ${accentColor}35`,
                      marginTop: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.92";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {isPrivileged
                      ? `Sign in as ${selectedPortal?.fullLabel}`
                      : isLogin
                      ? "Sign In to UniBook"
                      : "Create My Account"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Toggle Sign Up / Sign In — non-privileged only */}
                {!isPrivileged && (
                  <p className="text-center mt-6" style={{ fontSize: "0.9375rem", color: "#94A3B8" }}>
                    {isLogin ? "New to UniBook? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      style={{ color: accentColor, fontWeight: 600 }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {isLogin ? "Create a free account" : "Sign in here"}
                    </button>
                  </p>
                )}

                {/* Privacy note */}
                <p className="text-center mt-4" style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>
                  By continuing, you agree to our{" "}
                  <a href="#" style={{ color: "#94A3B8" }} className="hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" style={{ color: "#94A3B8" }} className="hover:underline">Privacy Policy</a>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {/* ========================================================= */}
          {/* 🛠️ DEVELOPER QUICK LOGIN (Only visible on localhost) 🛠️ */}
          {/* ========================================================= */}
          {import.meta.env.DEV && (
            <div className="mt-10 p-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-4 h-4 text-amber-600" />
                <h3 className="text-amber-800 font-bold text-sm">Team 17 Quick Dev Login</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["admin", "technician", "student", "lecturer"].map((role) => (
                  <button
                    key={role}
                    onClick={() => devLogin(role)}
                    className="py-2 px-3 bg-white text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors uppercase tracking-wider"
                  >
                    Log in as {role}
                  </button>
                ))}
              </div>
              <p className="text-amber-700/70 text-[10px] mt-3 text-center leading-tight">
                This panel bypasses OAuth2. It is only visible during local development.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}