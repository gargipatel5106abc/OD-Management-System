"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  FileCheck2,
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronRight,
  Fingerprint,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/personas")
      .then((r) => r.json())
      .then((d) => setPersonas(d.personas || []))
      .catch(console.error);
  }, []);

  const handleQuickLogin = async (role: string, personaName?: string) => {
    let target = personas.find((p) => p.role === role);
    if (personaName) {
      const match = personas.find(
        (p) => p.role === role && p.name.includes(personaName)
      );
      if (match) target = match;
    }

    if (target) {
      await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: target.id }),
      });
    }

    if (role === "STUDENT") router.push("/student");
    else if (role === "CLUB") router.push("/club");
    else if (role === "FACULTY") router.push("/faculty");
    else if (role === "SWC") router.push("/swc");
  };

  const workflowSteps = [
    {
      step: 1,
      title: "Event OD Proposal",
      actor: "Club Coordinator",
      desc: "Club proposes event to SWC for OD eligibility prior to conducting.",
    },
    {
      step: 2,
      title: "SWC Official Sanction",
      actor: "SWC Administration",
      desc: "Director SWC reviews venue, schedule, and sanctions OD eligibility.",
    },
    {
      step: 3,
      title: "Event Conducted",
      actor: "Campus Activity",
      desc: "Students participate in hackathons, workshops, competitions or sports.",
    },
    {
      step: 4,
      title: "Participant Roster",
      actor: "Club Coordinator",
      desc: "Official post-event attendance roster uploaded via CSV/Excel.",
    },
    {
      step: 5,
      title: "Student OD Request",
      actor: "Participating Student",
      desc: "Student applies for OD with geo-tagged event photograph & evidence.",
    },
    {
      step: 6,
      title: "8-Point Auto Verification",
      actor: "System Engine",
      desc: "Compares student claim vs club list, geofence radius, and 40h cap.",
    },
    {
      step: 7,
      title: "SWC Sign-off & Ledger",
      actor: "SWC Director",
      desc: "Immutable SHA-256 hash generated; student OD hours updated.",
    },
  ];

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-semibold text-blue-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>VIT Chennai • Academic Governance Protocol</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            VIT OD Management
          </h1>

          <p className="text-lg sm:text-xl text-blue-200/90 leading-relaxed font-light">
            A smarter and more transparent way to manage On-Duty requests. Connecting{" "}
            <strong className="text-white font-semibold">Student</strong> →{" "}
            <strong className="text-white font-semibold">Club</strong> →{" "}
            <strong className="text-white font-semibold">Faculty Coordinator</strong> →{" "}
            <strong className="text-white font-semibold">SWC</strong> with automated dual-source roster matching.
          </p>

          {/* Quick Portal Switcher Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => handleQuickLogin("STUDENT", "Rahul")}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Launch Student Portal</span>
            </button>

            <button
              onClick={() => handleQuickLogin("CLUB")}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>Launch Club Portal</span>
            </button>

            <button
              onClick={() => handleQuickLogin("FACULTY", "Sunita")}
              className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Faculty Coordinator</span>
            </button>

            <button
              onClick={() => handleQuickLogin("SWC")}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>SWC Executive Command</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Accents */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Active University Case Workflows */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-6 h-6 text-blue-700" />
          <h2 className="text-2xl font-bold text-slate-900">
            Active OD Case Workflows & Dual-Source Verification
          </h2>
        </div>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Real-time institutional cases undergoing automated dual-source roster comparison, EXIF telemetry verification, and faculty coordinator review.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Case 1 */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-soft hover:shadow-soft-lg transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Application #1001: Automated Roster Match
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Direct Approval Path
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Rahul Sharma (23BCE1001) — VIT TechFest 2026
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                Student submitted an On-Duty request for the flagship National Hackathon. The student is confirmed on CodeChef&apos;s attendance roster, and geotagged photograph coordinates place him within the VIT Chennai Auditorium geofence. All 8 verification checks passed and queued for SWC sign-off.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified in SWC Queue</span>
              </span>
              <button
                onClick={() => handleQuickLogin("SWC")}
                className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1 cursor-pointer"
              >
                <span>Review in SWC Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Case 2 */}
          <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-soft hover:shadow-soft-lg transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Application #1010: Roster Clarification & Rectification
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Faculty Governance Path
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Arjun Patel (23BCE1010) — Robo Wars 2026
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                Student participated as combat pit crew but was inadvertently omitted from the club&apos;s initial roster file. A participant mismatch was flagged. In accordance with university policy, <strong>Faculty Coordinator Dr. Sunita Rao</strong> reviews student telemetry and submits official roster rectification.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-amber-800 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Faculty Review Required</span>
              </span>
              <button
                onClick={() => handleQuickLogin("FACULTY", "Sunita")}
                className="font-bold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1 cursor-pointer"
              >
                <span>Open Faculty Queue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workflow Flowchart (Section 24 & 35) */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Official 7-Step Institutional OD Workflow
          </h2>
          <p className="text-xs text-slate-500">
            Automated governance architecture enforcing dual-source participant validation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {workflowSteps.map((wf) => (
            <div
              key={wf.step}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-2 hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-[11px] font-bold flex items-center justify-center">
                  {wf.step}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Step {wf.step}
                </span>
              </div>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">
                  {wf.title}
                </strong>
                <span className="text-[10px] text-blue-700 font-semibold block">
                  {wf.actor}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {wf.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Architectural Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-2">
          <Clock className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            40-Hour Cap Regulation
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Strict automated enforcement of the university&apos;s 40-hour limit per academic period. Real-time balance calculations warn students and administrators before quota breaches.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Geotagged Photo Radar
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Extracts GPS latitude, longitude, and timestamps from uploaded photographs. Calculates Haversine distance against sanctioned VIT Chennai venue perimeters.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft space-y-2">
          <Fingerprint className="w-6 h-6 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            SHA-256 Tamper Ledger
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every approved On-Duty record generates an immutable cryptographic signature linking the student register number, sanctioning authority, and time-stamped parameters.
          </p>
        </div>
      </div>
    </div>
  );
}

