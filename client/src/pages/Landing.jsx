
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import {
  BookMarked,
  Calendar,
  Clock,
  Shield,
  Bell,
  BarChart3,
  GraduationCap,
  Wrench,
  Settings,
  ChevronRight,
  Menu,
  X,
  Check,
  ArrowRight,
  MapPin,
  Zap,
  Users,
  BookOpen
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1664273891579-22f28332f3c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmclMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc1MDM4MDExfDA&ixlib=rb-4.1.0&q=80&w=1080";

// ─────────────────────────────────────────
// DATA
// ─────────────────────────────────────────

const features = [
  {
    icon: Calendar,
    title: "Asset Booking",
    description: "Reserve laboratories, equipment, and study rooms with a simple, intuitive interface in just a few clicks.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "hover:border-blue-200",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "Conflict-free time management with real-time availability checks and intelligent scheduling algorithms.",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    border: "hover:border-indigo-200",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Granular permissions tailored to each user type — from students to system administrators.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "hover:border-violet-200",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Receive real-time updates on booking confirmations, rejections, and upcoming reservation reminders.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "hover:border-amber-200",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Gain actionable insights into asset utilization, peak usage times, and historical booking trends.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "hover:border-emerald-200",
  },
  {
    icon: Wrench,
    title: "Maintenance Tracking",
    description: "Technicians can log maintenance activities, flag issues, and update asset availability in real time.",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    border: "hover:border-rose-200",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up using your university email or Google account to get instant access to the platform.",
    icon: Users,
    color: "bg-blue-600",
    shadow: "shadow-blue-200",
  },
  {
    number: "02",
    title: "Browse Available Assets",
    description: "Explore labs, equipment, rooms, and more with live availability across the entire campus.",
    icon: MapPin,
    color: "bg-indigo-600",
    shadow: "shadow-indigo-200",
  },
  {
    number: "03",
    title: "Submit a Booking",
    description: "Select your preferred time slot and submit a booking request in just a few simple steps.",
    icon: Calendar,
    color: "bg-violet-600",
    shadow: "shadow-violet-200",
  },
  {
    number: "04",
    title: "Get Confirmation",
    description: "Receive instant notifications when your booking is approved, with all the details you need.",
    icon: Check,
    color: "bg-emerald-600",
    shadow: "shadow-emerald-200",
  },
];

const roles = [
  {
    icon: Settings,
    title: "Administrator",
    tag: "Full Access",
    gradient: "from-blue-700 to-blue-900",
    tagStyle: { background: "rgba(255,255,255,0.2)", color: "white" },
    permissions: ["Manage all users & roles", "Configure system settings", "Access full analytics", "Approve or reject bookings"],
  },
  {
    icon: Wrench,
    title: "Technician",
    tag: "Asset Manager",
    gradient: "from-slate-600 to-slate-800",
    tagStyle: { background: "rgba(255,255,255,0.2)", color: "white" },
    permissions: ["Update asset availability", "Log maintenance tasks", "View booking schedules", "Report asset issues"],
  },
  {
    icon: GraduationCap,
    title: "Student",
    tag: "Standard User",
    gradient: "from-emerald-500 to-teal-700",
    tagStyle: { background: "rgba(255,255,255,0.2)", color: "white" },
    permissions: ["Book study spaces", "Reserve lab equipment", "Track booking status", "View campus schedules"],
  },
  {
    icon: BookOpen,
    title: "Lecturer / Tutor",
    tag: "Faculty User",
    gradient: "from-amber-500 to-orange-600",
    tagStyle: { background: "rgba(255,255,255,0.2)", color: "white" },
    permissions: ["Reserve classrooms & labs", "Priority booking access", "Schedule recurring sessions", "Manage class resources"],
  },
];

const stats = [
  { value: "500+", label: "Bookable Assets" },
  { value: "10K+", label: "Monthly Bookings" },
  { value: "4", label: "User Role Levels" },
  { value: "99.9%", label: "System Uptime" },
];

// ─────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────

function Navbar({ scrolled }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "User Roles", href: "#roles" },
  ];

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.98)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 16px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1D4ED8" }}>
            <BookMarked className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontSize: "1.125rem", fontWeight: 700, color: scrolled ? "#0f172a" : "white", letterSpacing: "-0.01em" }}>
            UniBook
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors"
              style={{ fontSize: "0.9375rem", color: scrolled ? "#475569" : "rgba(255,255,255,0.8)", fontWeight: 450 }}
              onMouseEnter={(e) => (e.target.style.color = scrolled ? "#1D4ED8" : "white")}
              onMouseLeave={(e) => (e.target.style.color = scrolled ? "#475569" : "rgba(255,255,255,0.8)")}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg transition-all hover:opacity-90"
            style={{ background: "#1D4ED8", color: "white", fontSize: "0.9375rem", fontWeight: 500 }}
          >
            Login
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: scrolled ? "#0f172a" : "white" }}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b px-6 py-4 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{ color: "#475569", fontSize: "0.9375rem", fontWeight: 450 }}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-lg text-center"
            style={{ background: "#1D4ED8", color: "white", fontSize: "0.9375rem", fontWeight: 500 }}
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
        </motion.div>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: "smooth" }}>
      <Navbar scrolled={scrolled} />

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #060D1F 0%, #0F2557 45%, #1E40AF 100%)" }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse at 20% 60%, rgba(59,130,246,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, rgba(99,102,241,0.14) 0%, transparent 50%)" }}
        />

        {/* Grid dots pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-32 lg:py-40 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: "easeOut" }}>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(147,197,253,0.25)" }}
            >
              <Zap className="w-3.5 h-3.5 text-blue-300" />
              <span style={{ fontSize: "0.75rem", color: "#93C5FD", fontWeight: 500, letterSpacing: "0.03em" }}>University Asset Management Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-white mb-5" style={{ fontSize: "clamp(2.2rem, 5vw, 3.75rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em" }}>
              Asset Booking, <span style={{ color: "#FBBF24" }}>Made Effortless</span> for Universities
            </h1>

            {/* Subtext */}
            <p className="mb-10" style={{ fontSize: "1.0625rem", color: "rgba(191,219,254,0.8)", lineHeight: 1.75, maxWidth: "500px" }}>
              Streamline the scheduling of labs, equipment, and rooms across your campus with our intelligent, role-based booking platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)", color: "#0F172A", fontWeight: 650, fontSize: "0.9375rem", boxShadow: "0 4px 20px rgba(251,191,36,0.35)" }}
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)", fontSize: "0.9375rem", fontWeight: 450 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Explore Features <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {["Free for all students", "Instant confirmation", "Real-time availability"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(52,211,153,0.2)", border: "1px solid rgba(52,211,153,0.4)" }}>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span style={{ fontSize: "0.8125rem", color: "rgba(147,197,253,0.75)" }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }} className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3", boxShadow: "0 32px 64px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <img src={HERO_IMAGE} alt="University Campus" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(6,13,31,0.6) 100%)" }} />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-md flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span style={{ fontSize: "0.75rem", color: "white", fontWeight: 500 }}>Main Campus — Active</span>
                </div>
              </div>
            </div>

            {/* Floating Booking Card */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-7 -left-8 bg-white rounded-2xl p-4" style={{ width: "230px", boxShadow: "0 16px 40px rgba(0,0,0,0.18)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#1D4ED8" }}><Calendar className="w-4 h-4 text-white" /></div>
                <div><p style={{ fontSize: "0.75rem", fontWeight: 650, color: "#0f172a" }}>Quick Booking</p><p style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>Physics Lab — Room 204</p></div>
              </div>
              <div className="rounded-lg p-2.5 mb-3" style={{ background: "#EFF6FF" }}><p style={{ fontSize: "0.75rem", color: "#1D4ED8", fontWeight: 550 }}>Today, 2:00 PM – 4:00 PM</p></div>
              <button className="w-full py-2 rounded-lg text-white text-center" style={{ background: "#1D4ED8", fontSize: "0.75rem", fontWeight: 600 }}>Confirm Booking</button>
            </motion.div>

            {/* Floating badge */}
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute -top-5 -right-5 bg-white rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 650, color: "#0f172a" }}>24 Assets Available</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 inset-x-0 leading-none">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 56L1440 56L1440 24C1320 52 1080 4 840 16C600 28 360 2 0 24Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center py-6">
                <p style={{ fontSize: "2.75rem", fontWeight: 800, color: "#1D4ED8", lineHeight: 1, letterSpacing: "-0.02em" }}>{stat.value}</p>
                <p className="mt-1" style={{ fontSize: "0.9375rem", color: "#94A3B8", fontWeight: 450 }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)" }} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span style={{ fontSize: "0.75rem", color: "#1D4ED8", fontWeight: 600, letterSpacing: "0.03em" }}>PLATFORM FEATURES</span>
            </div>
            <h2 className="mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 750, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Everything You Need to Manage<br />University Assets</h2>
            <p style={{ color: "#64748B", fontSize: "1.0625rem", maxWidth: "540px", margin: "0 auto", lineHeight: 1.7 }}>A comprehensive platform built for the academic environment — designed for efficiency, transparency, and ease of use.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`bg-white rounded-2xl p-6 border border-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-md ${feature.border}`} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${feature.iconBg}`}><feature.icon className={`w-5 h-5 ${feature.iconColor}`} /></div>
                <h3 className="mb-2" style={{ fontSize: "1.0625rem", fontWeight: 650, color: "#0F172A" }}>{feature.title}</h3>
                <p style={{ color: "#64748B", fontSize: "0.9375rem", lineHeight: 1.65 }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <span style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: 600, letterSpacing: "0.03em" }}>🔄 SIMPLE PROCESS</span>
            </div>
            <h2 className="mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 750, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.2 }}>How It Works</h2>
            <p style={{ color: "#64748B", fontSize: "1.0625rem", maxWidth: "460px", margin: "0 auto", lineHeight: 1.7 }}>Getting started is quick and easy — book your first asset in under two minutes.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute" style={{ top: "2.6rem", left: "calc(12.5% + 1.75rem)", right: "calc(12.5% + 1.75rem)", height: "2px", background: "linear-gradient(90deg, #BFDBFE, #8B5CF6, #6EE7B7)", opacity: 0.5 }} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {steps.map((step, i) => (
                <motion.div key={step.number} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${step.color} ${step.shadow}`}><step.icon className="w-6 h-6 text-white" /></div>
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#FBBF24", color: "#0F172A", fontSize: "0.6875rem", fontWeight: 750 }}>{step.number.replace("0", "")}</div>
                  </div>
                  <h3 className="mb-2" style={{ fontSize: "1rem", fontWeight: 650, color: "#0F172A" }}>{step.title}</h3>
                  <p style={{ color: "#64748B", fontSize: "0.9375rem", lineHeight: 1.65 }}>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── USER ROLES ── */}
      <section id="roles" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
              <Users className="w-3.5 h-3.5 text-violet-600" />
              <span style={{ fontSize: "0.75rem", color: "#7C3AED", fontWeight: 600, letterSpacing: "0.03em" }}>ROLE-BASED ACCESS</span>
            </div>
            <h2 className="mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 750, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Tailored for Every User</h2>
            <p style={{ color: "#64748B", fontSize: "1.0625rem", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>UniBook adapts to each user's role with customized dashboards and permissions for a seamless campus experience.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((role, i) => (
              <motion.div key={role.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className={`bg-gradient-to-br ${role.gradient} p-6 flex flex-col items-center gap-3`}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}><role.icon className="w-7 h-7 text-white" /></div>
                  <h3 className="text-white" style={{ fontSize: "1.0625rem", fontWeight: 700 }}>{role.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full" style={{ ...role.tagStyle, fontSize: "0.75rem", fontWeight: 500, border: "1px solid rgba(255,255,255,0.3)" }}>{role.tag}</span>
                </div>
                <div className="p-5">
                  <ul className="space-y-2.5">
                    {role.permissions.map((perm) => (
                      <li key={perm} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}><Check className="w-2.5 h-2.5 text-emerald-600" /></div>
                        <span style={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5 }}>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #060D1F 0%, #0F2557 50%, #1E40AF 100%)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 75% 50%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.12) 0%, transparent 50%)" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
            <span style={{ fontSize: "0.75rem", color: "#FBBF24", fontWeight: 500 }}>🎓 Trusted by Universities</span>
          </div>
          <h2 className="text-white mb-5" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 750, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Ready to Streamline Your University's<br />Asset Management?</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/login" className="flex items-center gap-2 px-8 py-4 rounded-xl transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)", color: "#0F172A", fontWeight: 650, fontSize: "0.9375rem" }}>
              Get Started — It's Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#060D1F" }} className="py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#1D4ED8" }}><BookMarked className="w-3.5 h-3.5 text-white" /></div>
            <span style={{ fontWeight: 700, color: "#F8FAFC", fontSize: "1.0625rem" }}>UniBook</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#475569" }}>© 2026 UniBook · University Asset Booking System · All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}