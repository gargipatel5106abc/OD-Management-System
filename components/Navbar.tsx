"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Bell,
  Users,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface Persona {
  id: string;
  name: string;
  role: "STUDENT" | "CLUB" | "FACULTY" | "SWC";
  description: string;
  regNo?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPersonas = async () => {
    try {
      const res = await fetch("/api/auth/personas");
      const data = await res.json();
      if (data.personas) setPersonas(data.personas);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchPersonas();
    fetchNotifications();
  }, []);

  const handleSwitchPersona = async (persona: Persona) => {
    setLoading(true);
    setShowPersonaMenu(false);
    try {
      await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: persona.id }),
      });
      await fetchSession();
      await fetchNotifications();

      // Route to appropriate dashboard based on chosen role
      if (persona.role === "STUDENT") router.push("/student");
      else if (persona.role === "CLUB") router.push("/club");
      else if (persona.role === "FACULTY") router.push("/faculty");
      else if (persona.role === "SWC") router.push("/swc");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "STUDENT":
        return {
          bg: "bg-pastel-blue text-pastel-blue-dark border-sky-200",
          label: "Student",
          icon: <GraduationCap className="w-3.5 h-3.5 mr-1" />,
        };
      case "CLUB":
        return {
          bg: "bg-pastel-lavender text-pastel-lavender-dark border-purple-200",
          label: "Club Coordinator",
          icon: <Building className="w-3.5 h-3.5 mr-1" />,
        };
      case "FACULTY":
        return {
          bg: "bg-pastel-yellow text-pastel-yellow-dark border-amber-200",
          label: "Faculty Coordinator",
          icon: <Users className="w-3.5 h-3.5 mr-1" />,
        };
      case "SWC":
        return {
          bg: "bg-pastel-green text-pastel-green-dark border-emerald-200",
          label: "SWC Administration",
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />,
        };
      default:
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          label: role,
          icon: null,
        };
    }
  };

  const currentRoleBadge = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Institutional Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
            VIT Chennai
          </span>
          <span className="hidden sm:inline font-semibold text-blue-100 text-sm">
            Student On-Duty (OD) Management Portal
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-blue-200 text-xs">
            Academic Year 2026–2027 • Official University System
          </span>
        </div>

        {/* User Account / Profile Switcher */}
        <div className="flex items-center space-x-3">
          <span className="hidden md:inline text-slate-300 text-xs font-medium">
            Active Account:
          </span>
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors border border-white/20 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {currentUser?.name || "Select Account"} ({currentUser?.role || "..."})
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {/* Persona Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-88 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2.5 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">
                    Institutional User Profile
                  </p>
                  <p className="text-xs text-slate-500">
                    Switch between Student, Club Coordinator, Faculty, and SWC accounts
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {personas.map((p) => {
                    const isCurrent = currentUser?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchPersona(p)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                          isCurrent ? "bg-blue-50/70" : ""
                        }`}
                      >
                        <div className="mt-1">
                          {p.role === "STUDENT" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                          )}
                          {p.role === "CLUB" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                          )}
                          {p.role === "FACULTY" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          )}
                          {p.role === "SWC" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 truncate">
                              {p.name}
                            </span>
                            <span className="text-[11px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {p.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {p.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-800 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xl text-slate-900 tracking-tight">
                    VIT Chennai
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    OD Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  On-Duty Verification & Welfare Governance
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation links based on role */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/student"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/student")
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Student Portal
            </Link>
            <Link
              href="/club"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/club")
                  ? "bg-purple-50 text-purple-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Club Portal
            </Link>
            <Link
              href="/faculty"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/faculty")
                  ? "bg-amber-50 text-amber-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Faculty Coordinator
            </Link>
            <Link
              href="/swc"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/swc")
                  ? "bg-emerald-50 text-emerald-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              SWC Administration
            </Link>
          </nav>

          {/* Right Side: Active User Badge & Notifications */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Notifications</p>
                      <p className="text-[11px] text-slate-500">
                        Real-time alerts for OD approvals & verifications
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await fetch("/api/notifications", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ markAllRead: true }),
                          });
                          fetchNotifications();
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications at this time
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs flex items-start space-x-2.5 transition-colors ${
                            !n.isRead ? "bg-blue-50/40" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === "SUCCESS" && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            {n.type === "WARNING" && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            {n.type === "ACTION_REQUIRED" && (
                              <AlertTriangle className="w-4 h-4 text-rose-500" />
                            )}
                            {n.type === "INFO" && (
                              <Bell className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{n.title}</p>
                            <p className="text-slate-600 text-[11px] mt-0.5">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active User Pill */}
            {currentUser && currentRoleBadge && (
              <div
                onClick={() => setShowPersonaMenu(true)}
                className={`cursor-pointer hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium shadow-xs transition-transform hover:scale-102 ${currentRoleBadge.bg}`}
              >
                {currentRoleBadge.icon}
                <div className="text-left">
                  <div className="font-semibold leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] opacity-80 leading-tight">
                    {currentRoleBadge.label}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

