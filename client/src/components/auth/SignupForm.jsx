// src/components/auth/SignupForm.jsx
import { useState } from "react";
import { User, Building2, Calendar, BookMarked, Mail, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import { motion as Motion } from "framer-motion";
import InputField from "./InputField.jsx";
import SelectField from "./SelectField.jsx";

export default function SignupForm({
  name, setName, faculty, setFaculty, phoneNumber, setPhoneNumber,
  specialization, setSpecialization, yearSemester, setYearSemester,
  email, setEmail, password, setPassword, errors,
  selectedPortalId, selectedPortal, user, onSubmit
}) {
  const [showPassword, setShowPassword] = useState(false);
  const accentColor = selectedPortal?.accentColor;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 overflow-hidden"
      >
        {/* Name */}
        <div>
          <InputField
            id="name" label="Full Name" type="text"
            value={name} onChange={setName}
            placeholder="e.g. John Doe" icon={User}
            accentColor={accentColor}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.name}</p>}
        </div>

        {/* Faculty */}
        {(selectedPortalId === "student" || selectedPortalId === "lecturer") && (
          <div>
            <SelectField
              id="faculty" label="Faculty"
              value={faculty} onChange={setFaculty}
              icon={Building2} accentColor={accentColor}
              options={[
                { value: "Computing", label: "Faculty of Computing" },
                { value: "Business", label: "Faculty of Business" },
                { value: "UoB", label: "UoB" }
              ]}
            />
            {errors.faculty && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.faculty}</p>}
          </div>
        )}

        {/* Phone */}
        <div>
          <InputField
            id="phoneNumber" label="Phone Number" type="tel"
            value={phoneNumber} onChange={setPhoneNumber}
            placeholder="e.g. +94 77 123 4567" icon={User}
            accentColor={accentColor}
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.phoneNumber}</p>}
        </div>

        {/* Student Specifics */}
        {selectedPortalId === "student" && (
          <>
            <div>
              <InputField
                id="specialization" label="Specialization" type="text"
                value={specialization} onChange={setSpecialization}
                placeholder="e.g. Software Engineering" icon={BookMarked}
                accentColor={accentColor}
              />
              {errors.specialization && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.specialization}</p>}
            </div>

            <div>
              <SelectField
                id="yearSemester" label="Current Year & Semester"
                value={yearSemester} onChange={setYearSemester}
                icon={Calendar} accentColor={accentColor}
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
              {errors.yearSemester && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.yearSemester}</p>}
            </div>
          </>
        )}
      </Motion.div>

      {/* Email */}
      <div>
        <InputField
          id="email" label="Email Address" type="email"
          value={email} onChange={setEmail}
          placeholder="you@university.edu"
          icon={Mail} autoComplete="email"
          accentColor={accentColor}
          disabled={user?.requiresRegistration}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
      </div>

      {/* Password - Hidden if Microsoft user */}
      {!user?.requiresRegistration && (
        <div>
          <label htmlFor="password" className="block mb-1.5" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full outline-none transition-all rounded-xl"
              style={{
                paddingLeft: "2.75rem", paddingRight: "3rem", paddingTop: "0.75rem", paddingBottom: "0.75rem",
                border: "1.5px solid #E2E8F0", fontSize: "0.9375rem", color: "#0F172A", background: "#FAFAFA",
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
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full rounded-xl text-white flex items-center justify-center gap-2 transition-all"
        style={{
          padding: "0.9375rem",
          background: `linear-gradient(135deg, ${selectedPortal?.accentDark ?? "#1E3A8A"}, ${accentColor})`,
          fontWeight: 600, fontSize: "0.9375rem",
          boxShadow: `0 4px 16px ${accentColor}35`, marginTop: "0.5rem",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {user?.requiresRegistration ? "Complete Registration" : "Create My Account"}
        <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );
}