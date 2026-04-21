// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import InputField from "./InputField.jsx";

export default function LoginForm({ 
  email, setEmail, 
  password, setPassword, 
  errors, 
  accentColor, 
  selectedPortal, 
  isPrivileged, 
  onSubmit 
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <InputField
          id="email" label="Email Address" type="email"
          value={email} onChange={setEmail}
          placeholder={isPrivileged ? "admin@university.edu" : "you@university.edu"}
          icon={Mail} autoComplete="email"
          accentColor={accentColor}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
            Password
          </label>
          <a
            href="#"
            style={{ fontSize: "0.8125rem", color: accentColor, fontWeight: 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Forgot password?
          </a>
        </div>
        <div className="mt-1.5 relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
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
        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
      </div>

      {/* Remember me */}
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
        {isPrivileged ? `Sign in as ${selectedPortal?.fullLabel}` : "Sign In to UniBook"}
        <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );
}