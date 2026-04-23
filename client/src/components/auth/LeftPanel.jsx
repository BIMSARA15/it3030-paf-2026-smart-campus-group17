import { useRef, useEffect } from "react";
import {
  BookMarked,
  Settings,
  Wrench,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Lock,
} from "lucide-react";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1763924121646-994d46165f54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYWVyaWFsJTIwYXJjaGl0ZWN0dXJlJTIwbmlnaHQlMjBsaWdodHN8ZW58MXx8fHwxNzc2ODQ2NjE4fDA&ixlib=rb-4.1.0&q=80&w=1080";

const PORTALS = [
  { icon: Settings,      label: "Administrator", sub: "Full system control",   color: "#3B82F6", glow: "#1E40AF" },
  { icon: Wrench,        label: "Technician",    sub: "Asset & maintenance",   color: "#94A3B8", glow: "#334155" },
  { icon: GraduationCap, label: "Student",       sub: "Book campus resources", color: "#34D399", glow: "#059669" },
  { icon: BookOpen,      label: "Lecturer",      sub: "Faculty & scheduling",  color: "#FBBF24", glow: "#B45309" },
];

const ORB_CONFIGS = [
  { color: "#1E40AF", w: 560, h: 560, top: "-140px", left: "-140px",   dur: 9000,  delay: 0    },
  { color: "#065F46", w: 480, h: 480, top: "-80px",  right: "-100px",  dur: 11000, delay: 2000 },
  { color: "#1E293B", w: 440, h: 440, bottom: "-120px", left: "-60px", dur: 10000, delay: 1000 },
  { color: "#92400E", w: 400, h: 400, bottom: "-80px",  right: "-80px",dur: 13000, delay: 3000 },
  { color: "#312E81", w: 320, h: 320, top: "35%",  left: "30%",        dur: 8000,  delay: 1500 },
];

function useFloatAnimation(ref, amplitude, duration, delay) {
  useEffect(() => {
    if (!ref.current) return;
    let start = null;
    let rafId;

    const tick = (ts) => {
      if (!start) start = ts - delay;
      const elapsed = ts - start;
      const t = (elapsed % duration) / duration;
      const y = -Math.abs(Math.sin(t * Math.PI)) * amplitude;
      if (ref.current) ref.current.style.transform = `translateY(${y}px)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ref, amplitude, duration, delay]);
}

function useOrbAnimation(ref, dur, delay) {
  useEffect(() => {
    if (!ref.current) return;
    let start = null;
    let rafId;

    const tick = (ts) => {
      if (!start) start = ts - delay;
      const elapsed = ts - start;
      const t = (elapsed % dur) / dur;
      const scale = 1 + 0.18 * Math.sin(t * 2 * Math.PI);
      const opacity = 0.45 + 0.25 * Math.sin(t * 2 * Math.PI);
      if (ref.current) {
        ref.current.style.transform = `scale(${scale})`;
        ref.current.style.opacity = opacity;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ref, dur, delay]);
}

function Orb({ config }) {
  const ref = useRef(null);
  useOrbAnimation(ref, config.dur, config.delay);

  const posStyle = {};
  if (config.top    !== undefined) posStyle.top    = config.top;
  if (config.bottom !== undefined) posStyle.bottom = config.bottom;
  if (config.left   !== undefined) posStyle.left   = config.left;
  if (config.right  !== undefined) posStyle.right  = config.right;

  return (
    <div
      ref={ref}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: config.w,
        height: config.h,
        background: `radial-gradient(circle, ${config.color}CC 0%, ${config.color}00 70%)`,
        filter: "blur(1px)",
        opacity: 0.45,
        ...posStyle,
      }}
    />
  );
}

function PortalCard({ portal, index }) {
  const ref = useRef(null);
  useFloatAnimation(ref, index % 2 === 0 ? 8 : 5, 4000 + index * 600, index * 500);

  return (
    <div
      ref={ref}
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${portal.glow}60`, border: `1px solid ${portal.color}50` }}
      >
        <portal.icon className="w-4 h-4" style={{ color: portal.color }} />
      </div>
      <div>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.92)", lineHeight: 1.2 }}>
          {portal.label}
        </p>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>
          {portal.sub}
        </p>
      </div>
      <div
        className="ml-auto w-2 h-2 rounded-full shrink-0"
        style={{ background: portal.color, boxShadow: `0 0 8px ${portal.color}` }}
      />
    </div>
  );
}

export default function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[58%] xl:w-[55%] relative overflow-hidden flex-col"
      style={{ background: "#060C1A" }}
    >
      {/* Campus photo underlay */}
      <div className="absolute inset-0">
        <img
          src={BG_IMAGE}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.12, mixBlendMode: "luminosity" }}
        />
      </div>

      {/* Grid dot texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />

      {/* Animated glowing orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {ORB_CONFIGS.map((cfg, i) => (
          <Orb key={i} config={cfg} />
        ))}
      </div>

      {/* Top gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(6,12,26,0.5) 0%, transparent 40%, rgba(6,12,26,0.6) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-12 xl:p-14">

        {/* Logo */}
        <div
          className="flex items-center gap-3"
          style={{ animation: "fadeSlideDown 0.6s ease both" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #1D4ED8, #6366F1)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.5)",
            }}
          >
            <BookMarked className="w-5 h-5 text-white" />
          </div>
          <div>
            <span style={{ fontSize: "1.375rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
              UniBook
            </span>
            <span
              className="ml-2 px-2 py-0.5 rounded-md text-white"
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                background: "rgba(99,102,241,0.35)",
                border: "1px solid rgba(165,180,252,0.3)",
                letterSpacing: "0.06em",
              }}
            >
              ENTERPRISE
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div
          className="flex-1 flex flex-col justify-center py-10"
          style={{ animation: "fadeSlideUp 0.75s 0.15s ease both" }}
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 self-start"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 500, letterSpacing: "0.04em" }}>
              University Asset Booking System
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem,3.5vw,2.75rem)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
            }}
          >
            One Portal.<br />
            <span
              style={{
                background: "linear-gradient(90deg, #60A5FA 0%, #34D399 40%, #FBBF24 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Every Campus Role.
            </span>
          </h1>

          <p
            className="mt-5 mb-10"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "380px" }}
          >
            Admins, technicians, students, and lecturers — all accessing the right
            tools through a single secure enterprise login.
          </p>

          {/* Portal role cards 2×2 */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {PORTALS.map((portal, i) => (
              <PortalCard key={portal.label} portal={portal} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom security badges */}
        <div
          className="flex items-center gap-3"
          style={{ animation: "fadeIn 0.6s 0.5s ease both" }}
        >
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)" }}>
              Secured by{" "}
              <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Microsoft Azure AD</span>
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)" }}>SSO Enabled</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
