import { Link } from "react-router";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { BookMarked, Check } from "lucide-react";
import { portals } from "../../config/portals.js";

const CAMPUS_IMAGE =
  "https://images.unsplash.com/photo-1664273891579-22f28332f3c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmclMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc1MDM4MDExfDA&ixlib=rb-4.1.0&q=80&w=1080";

export default function LeftPanel({ selectedPortal }) {
  const gradient = selectedPortal?.leftGradient ?? "linear-gradient(150deg, #060D1F 0%, #0F2557 45%, #1E40AF 100%)";
  const badgeBg = selectedPortal?.badgeBg ?? "rgba(59,130,246,0.15)";
  const badgeText = selectedPortal?.badgeText ?? "#93C5FD";

  const features = selectedPortal?.features ?? [
    "Role-based access for all campus users",
    "Real-time asset availability & scheduling",
    "Instant booking confirmations & alerts",
    "Secure university-grade authentication",
  ];

  return (
    <motion.div
      key={selectedPortal?.id ?? "default"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between relative overflow-hidden"
      style={{ background: gradient }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 40%, rgba(255,255,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.04) 0%, transparent 50%)",
        }}
      />
      {/* Grid dots */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      {/* Campus image overlay */}
      <div className="absolute inset-0">
        <img
          src={CAMPUS_IMAGE}
          alt="University"
          className="w-full h-full object-cover"
          style={{ opacity: 0.07 }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 p-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <BookMarked className="w-5 h-5 text-white" />
          </div>
          <span style={{ fontWeight: 750, color: "white", fontSize: "1.25rem", letterSpacing: "-0.01em" }}>
            UniBook
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 px-10 pb-12">
        {/* Portal badge */}
        {selectedPortal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ background: badgeBg, border: `1px solid ${badgeText}30` }}
          >
            <span style={{ fontSize: "1rem" }}>{selectedPortal.emoji}</span>
            <span style={{ fontSize: "0.75rem", color: badgeText, fontWeight: 500 }}>
              {selectedPortal.fullLabel} Portal
            </span>
          </motion.div>
        )}

        <h2
          className="text-white mb-4"
          style={{ fontSize: "1.875rem", fontWeight: 750, lineHeight: 1.2, letterSpacing: "-0.02em" }}
        >
          {selectedPortal
            ? `${selectedPortal.fullLabel} Access`
            : "Manage University Assets with Ease"}
        </h2>
        <p
          className="mb-10"
          style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem", lineHeight: 1.7, maxWidth: "340px" }}
        >
          {selectedPortal?.isPrivileged
            ? "Privileged portal — restricted to authorized personnel only. Contact your system administrator for access."
            : "A unified booking platform for labs, equipment, and rooms — accessible to every member of your campus."}
        </p>

        <ul className="space-y-3.5 mb-12">
          {features.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>{item}</span>
            </li>
          ))}
        </ul>

        {/* Role icons row */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {portals.map((p) => (
              <div
                key={p.id}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                style={{
                  background: p.id === selectedPortal?.id ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                  borderColor: "rgba(0,0,0,0.4)",
                  transform: p.id === selectedPortal?.id ? "scale(1.15)" : "scale(1)",
                  zIndex: p.id === selectedPortal?.id ? 10 : 1,
                  transition: "all 0.2s",
                }}
              >
                <p.icon className="w-3.5 h-3.5 text-white" />
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem" }}>
            4 role levels · RBAC enabled
          </p>
        </div>
      </div>
    </motion.div>
  );
}