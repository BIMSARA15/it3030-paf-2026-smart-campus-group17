// src/components/auth/PortalSelector.jsx
import { motion as Motion } from "framer-motion";
import { Building2, Shield, ChevronRight, AlertCircle } from "lucide-react";
import { portals } from "../../config/portals.js";

export default function PortalSelector({ onSelect }) {
  return (
    <Motion.div
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
          <Motion.button
            key={portal.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onSelect(portal.id)}
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
          </Motion.button>
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
    </Motion.div>
  );
}