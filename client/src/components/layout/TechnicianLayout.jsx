import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Bell, Building2, GraduationCap, LayoutDashboard,
  LogOut, Wrench, X, Menu
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function TechnicianLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Exact matches for the dashboard, startsWith for sub-pages
  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (logout) logout();
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "MT";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const navLinks = [
    { name: "Dashboard", path: "/staff", icon: LayoutDashboard, exact: true },
    { name: "Facilities & Assets", path: "/staff/facilities", icon: Building2 },
    { name: "Maintenance", path: "/staff/maintenance", icon: Wrench },
    { name: "Notifications", path: "/staff/notifications", icon: Bell, badge: 1 },
  ];

  // Using the Technician's specific color palette applied to the new Sidebar structure
  const theme = {
    headerBg: "bg-gradient-to-br from-[#27324A] via-[#303B53] to-[#1F2937]",
    roleTag: "bg-slate-100 border-slate-300 text-[#27324A]",
    linkActive: "bg-[#27324A]/10 text-[#27324A] font-semibold",
    linkHover: "hover:bg-[#27324A]/10 hover:text-[#27324A]",
    iconActive: "text-[#27324A]",
    iconHover: "group-hover:text-[#27324A]",
    tooltipBg: "bg-[#27324A]",
    tooltipArrow: "border-r-[#27324A]",
    tooltipShadow: "shadow-[0_4px_12px_rgba(39,50,74,0.2)]",
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* ── Collapsible Sidebar ── */}
      <aside
        className={`relative z-30 bg-white border-r border-gray-100 flex flex-col shadow-[12px_0_40px_rgba(15,23,42,0.05)] transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* DYNAMIC HEADER SECTION */}
        <div
          className={`relative ${theme.headerBg} text-white transition-all duration-300 ${
            isOpen ? "h-48 rounded-br-[2.5rem]" : "h-32 rounded-br-2xl"
          } flex flex-col shrink-0 overflow-visible`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>

          <div
            className={`px-4 sm:px-6 pt-14 pb-4 flex items-center ${
              isOpen ? "justify-between" : "justify-center"
            } z-10`}
          >
            {isOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 backdrop-blur-sm">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="font-bold text-lg leading-tight tracking-wider whitespace-nowrap text-white">
                      SMART<span className="text-slate-300">CAMPUS</span>
                    </h1>
                    <p className="text-white/80 text-[11px] font-medium tracking-wide uppercase whitespace-nowrap">
                      Technician Portal
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 -mt-4"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* User Profile Card Overlapping Header */}
          <div
            className={`absolute bottom-0 left-4 right-4 translate-y-1/2 z-20 ${
              !isOpen && "flex justify-center translate-y-2/3 left-2 right-2"
            }`}
          >
            <div
              className={`bg-white rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] border border-gray-100 flex items-start gap-3 transition-all ${
                isOpen
                  ? "p-4"
                  : "p-2 items-center justify-center w-12 h-12 mx-auto rounded-2xl"
              }`}
            >
              <div
                className={`${
                  isOpen ? "w-10 h-10 mt-0.5" : "w-8 h-8"
                } rounded-full bg-[#303B53] flex items-center justify-center flex-shrink-0 font-bold ${
                  isOpen ? "text-sm" : "text-xs"
                } text-white shadow-inner transition-all`}
              >
                {getInitials(user?.name)}
              </div>

              {isOpen && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-bold text-sm text-slate-800 truncate">
                    {user?.name || "Dev Technician"}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${theme.roleTag}`}
                  >
                    {user?.role || "Technician"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`shrink-0 ${isOpen ? "h-24" : "h-10"}`}></div>

        {isOpen && (
          <p className="text-[11px] font-bold text-slate-400 tracking-[0.18em] mb-3 px-6 uppercase">
            Navigation
          </p>
        )}

        {/* NAVIGATION LINKS */}
        <div className={`flex-1 overflow-visible ${isOpen ? "px-3 mt-2" : "px-2 mt-4"}`}>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path, link.exact);
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center ${
                    isOpen ? "justify-start px-4" : "justify-center px-0"
                  } py-3.5 rounded-xl transition-all duration-200 group ${
                    active
                      ? theme.linkActive
                      : `text-slate-500 font-medium ${theme.linkHover}`
                  }`}
                >
                  <Icon
                    className={`w-[22px] h-[22px] flex-shrink-0 ${
                      active ? theme.iconActive : `text-slate-400 ${theme.iconHover}`
                    } ${isOpen && "mr-4"}`}
                  />
                  {isOpen && <span className="text-[14px] font-semibold whitespace-nowrap">{link.name}</span>}

                  {/* Notification Badge */}
                  {link.badge && (
                    <span
                      className={`absolute right-3 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold ${
                        !isOpen && "top-1 right-1 min-w-[16px] h-4 text-[8px] px-1"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}

                  {/* DYNAMIC THEME TOOLTIP */}
                  {!isOpen && (
                    <div
                      className={`absolute left-full ml-4 px-2.5 py-1.5 ${theme.tooltipBg} text-white text-[13px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-[100] ${theme.tooltipShadow} flex items-center`}
                    >
                      {link.name}
                      <div
                        className={`absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent ${theme.tooltipArrow}`}
                      ></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SIGN OUT BUTTON */}
        <div className={`p-4 mt-auto shrink-0 ${!isOpen && "flex justify-center"}`}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`relative group flex items-center ${
              isOpen ? "justify-start px-4" : "justify-center"
            } w-full py-3.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-600 font-semibold transition-all duration-200 border border-rose-100/50`}
          >
            <LogOut
              className={`w-[22px] h-[22px] flex-shrink-0 text-rose-500 group-hover:text-rose-700 ${
                isOpen && "mr-4"
              }`}
            />
            {isOpen && <span className="text-[14px] whitespace-nowrap">Logout</span>}

            {!isOpen && (
              <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-rose-600 text-white text-[13px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-[100] shadow-[0_4px_12px_rgba(225,29,72,0.2)] flex items-center">
                Logout
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-rose-600"></div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center z-10 border border-rose-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 mt-2">
              <LogOut className="w-8 h-8 text-rose-600 ml-1" />
            </div>

            <h2 className="text-slate-900 text-xl font-semibold mb-2">Confirm Sign Out</h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to sign out of the Technician portal?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-sm font-medium shadow-[0_4px_12px_rgba(225,29,72,0.3)] transition-all"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}