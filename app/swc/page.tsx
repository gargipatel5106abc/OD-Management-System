"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Users,
  Building,
  BarChart3,
  History,
  Search,
  Filter,
  Eye,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import SWCDecisionModal from "@/components/SWCDecisionModal";
import VerificationChecklist from "@/components/VerificationChecklist";

export default function SWCDashboard() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "ELIGIBLE" | "VERIFICATION_QUEUE" | "CALENDAR" | "ANALYTICS" | "AUDIT"
  >("ELIGIBLE");

  const [odRequests, setOdRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedODForDecision, setSelectedODForDecision] = useState<any>(null);
  const [selectedEventForApproval, setSelectedEventForApproval] = useState<any>(null);
  const [swcRemarksInput, setSwcRemarksInput] = useState("");
  const [updatingEvent, setUpdatingEvent] = useState(false);

  const fetchSWCData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      setSession(authData.user);

      const [reqRes, evtRes, anaRes, logRes] = await Promise.all([
        fetch("/api/od-requests"),
        fetch("/api/events"),
        fetch("/api/analytics"),
        fetch("/api/audit-logs"),
      ]);

      const reqData = await reqRes.json();
      const evtData = await evtRes.json();
      const anaData = await anaRes.json();
      const logData = await logRes.json();

      setOdRequests(reqData.odRequests || []);
      setEvents(evtData.events || []);
      setAnalyticsData(anaData || null);
      setAuditLogs(logData.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSWCData();
  }, []);

  const isSwcAdmin = session?.role === "SWC";

  // KPIs
  const todayStr = "2026-10-09";
  const eventsToday = events.filter((e) => e.eventDate === todayStr);
  const pendingEventApprovals = events.filter((e) => e.status === "PENDING_SWC");
  const autoVerifiedQueue = odRequests.filter((r) => r.status === "AUTO_VERIFIED");
  const mismatchQueue = odRequests.filter((r) => r.status === "VERIFICATION_REQUIRED");
  const approvedODCount = odRequests.filter((r) => r.status === "SWC_APPROVED").length;
  const rejectedODCount = odRequests.filter((r) => r.status === "REJECTED").length;

  const handleUpdateEventStatus = async (
    eventId: string,
    status: "SWC_APPROVED" | "SWC_REJECTED"
  ) => {
    setUpdatingEvent(true);
    try {
      await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          swcRemarks: swcRemarksInput || `Determined by SWC Executive Director: ${status}`,
        }),
      });
      setSelectedEventForApproval(null);
      setSwcRemarksInput("");
      await fetchSWCData();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingEvent(false);
    }
  };

  const filteredRequests = odRequests.filter((r) => {
    return (
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.event.club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-emerald-200 border border-white/15">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Student Welfare Centre (SWC) Administration Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SWC Executive Command Center
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200">
            Director: <strong>Dr. S. Balasubramanian</strong> • Official Sanction Authority for On-Duty Governance
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[260px] text-xs space-y-1">
          <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] block">
            System Integrity Status
          </span>
          <p className="text-white font-medium">
            SHA-256 Tamper-Evident Records Active
          </p>
          <span className="text-[11px] text-emerald-200 font-mono block">
            Campus Geofence: VIT Chennai Kelambakkam
          </span>
        </div>
      </div>

      {!isSwcAdmin && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start space-x-3 text-sm text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-emerald-950 font-bold mb-0.5">
              Administrative Authorization Status:
            </strong>
            <span>
              You are accessing this view with <strong>{session?.name} ({session?.role})</strong> credentials. Executive On-Duty determination and immutable cryptographic signing require verified SWC administrative authority. To authenticate as director, select <strong>Dr. S. Balasubramanian (SWC Admin)</strong> in the top header.
            </span>
          </div>
        </div>
      )}

      {/* SWC Dashboard Cards (Section 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Events Today
          </span>
          <span className="text-xl font-black text-blue-700 font-mono mt-1 block">
            {eventsToday.length}
          </span>
          <span className="text-[10px] text-slate-500">Scheduled</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            This Week
          </span>
          <span className="text-xl font-black text-slate-800 font-mono mt-1 block">
            {events.length}
          </span>
          <span className="text-[10px] text-slate-500">Total Events</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending Proposals
          </span>
          <span className="text-xl font-black text-amber-600 font-mono mt-1 block">
            {pendingEventApprovals.length}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold">Review Req</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Eligible for OD
          </span>
          <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
            {autoVerifiedQueue.length}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">Ready to Sign</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Roster Mismatches
          </span>
          <span className="text-xl font-black text-amber-700 font-mono mt-1 block">
            {mismatchQueue.length}
          </span>
          <span className="text-[10px] text-rose-700 font-semibold">Action Req</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Approved ODs
          </span>
          <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
            {approvedODCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">Sanctioned</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Rejected ODs
          </span>
          <span className="text-xl font-black text-slate-500 font-mono mt-1 block">
            {rejectedODCount}
          </span>
          <span className="text-[10px] text-slate-400">Archived</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Near 40h Limit
          </span>
          <span className="text-xl font-black text-rose-600 font-mono mt-1 block">
            {analyticsData?.kpis?.nearLimitCount || 1}
          </span>
          <span className="text-[10px] text-rose-600 font-semibold">Flagged</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("ELIGIBLE")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === "ELIGIBLE"
              ? "border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Students Eligible for OD Update ({autoVerifiedQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("VERIFICATION_QUEUE")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === "VERIFICATION_QUEUE"
              ? "border-amber-600 text-amber-800 bg-amber-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Verification Queue & Mismatches ({mismatchQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("CALENDAR")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === "CALENDAR"
              ? "border-blue-600 text-blue-800 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Event Proposals & Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab("ANALYTICS")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === "ANALYTICS"
              ? "border-purple-600 text-purple-800 bg-purple-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <span>Analytics & Reports (Recharts)</span>
        </button>

        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`py-3 px-4 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === "AUDIT"
              ? "border-slate-800 text-slate-900 bg-slate-100 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4 text-slate-600" />
          <span>Institutional Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: STUDENTS ELIGIBLE FOR OD UPDATE (Section 16) */}
      {activeTab === "ELIGIBLE" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Students Eligible for On-Duty (OD) Update
              </h3>
              <p className="text-xs text-slate-500">
                Automated 8-point checks PASSED: Club participant roster matched & GPS coordinates verified.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {autoVerifiedQueue.length} Ready for Executive Sign-off
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Current Usage</th>
                  <th className="py-3 px-4">Verification Check</th>
                  <th className="py-3 px-4 text-right">Executive Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {autoVerifiedQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No auto-verified requests currently queued for sign-off.
                    </td>
                  </tr>
                ) : (
                  autoVerifiedQueue.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block font-semibold">
                          {req.student.name}
                        </strong>
                        <span className="font-mono text-blue-700 font-bold text-[11px]">
                          {req.student.regNo}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {" "}• {req.student.school} (Yr {req.student.year})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block truncate max-w-xs">
                          {req.event.title}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {req.event.club.name} • {req.event.venue}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {req.event.eventDate}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          +{req.requestedHours} hrs
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-slate-800 font-semibold">
                          {req.student.odHoursUsed}
                        </span>
                        <span className="text-slate-400"> / {req.student.maxHours}h</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          ✓ Matched (All 8 Pass)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedODForDecision(req)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Approve OD</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION QUEUE & MISMATCHES (Section 7 & 19) */}
      {activeTab === "VERIFICATION_QUEUE" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Verification Queue & Discrepancy Cases
              </h3>
              <p className="text-xs text-slate-500">
                Requests flagged with participant roster mismatches or geofence boundary exceptions
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {mismatchQueue.length} Active Mismatches
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {mismatchQueue.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No active participant mismatches currently in queue.
              </div>
            ) : (
              mismatchQueue.map((req) => (
                <div key={req.id} className="p-5 hover:bg-slate-50/70 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {req.requestNumber}
                        </span>
                        <strong className="text-slate-900">{req.student.name}</strong>
                        <span className="font-mono text-blue-700 font-bold">
                          ({req.student.regNo})
                        </span>
                        <span className="text-slate-400 text-xs">• {req.student.school}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Applied for <strong>{req.event.title}</strong> ({req.event.club.name}) on {req.event.eventDate} ({req.requestedHours}h OD)
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        ⚠ Mismatch – Clarification Required
                      </span>
                      <button
                        onClick={() => setSelectedODForDecision(req)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Decide</span>
                      </button>
                    </div>
                  </div>

                  {/* Clarification notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-200 text-slate-700">
                      <span className="font-bold text-blue-900 block text-[11px]">
                        Student Explanation:
                      </span>
                      <p className="text-[11px] mt-0.5">
                        {req.studentExplanation || "Awaiting explanation note from student..."}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-200 text-slate-700">
                      <span className="font-bold text-purple-900 block text-[11px]">
                        Club Statement:
                      </span>
                      <p className="text-[11px] mt-0.5">
                        {req.clubExplanation || "Awaiting explanation note from club coordinator..."}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EVENT CALENDAR & PROPOSALS (Section 10, 11, 15) */}
      {activeTab === "CALENDAR" && (
        <div className="space-y-6">
          {/* Pending Event Proposals for OD Sanction */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Club Event OD Proposals Awaiting SWC Sanction
                </h3>
                <p className="text-xs text-slate-500">
                  Clubs must receive prior approval before conducting events for students to receive OD
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {pendingEventApprovals.length} Proposals Pending
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingEventApprovals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No event proposals currently awaiting SWC sanction.
                </div>
              ) : (
                pendingEventApprovals.map((evt) => (
                  <div key={evt.id} className="p-5 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {evt.eventCode}
                        </span>
                        <strong className="text-slate-900 text-sm">{evt.title}</strong>
                        <span className="text-xs text-purple-700 font-semibold">• {evt.club.name}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {evt.eventDate} ({evt.startTime} – {evt.endTime}) • Venue: {evt.venue} • Requested OD: <strong>{evt.expectedHours} hours</strong>
                      </p>
                      <p className="text-xs text-slate-500 italic max-w-2xl">
                        &quot;{evt.reasonOD}&quot;
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setSelectedEventForApproval(evt)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Review & Sanction</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calendar View: Today, Previous, Upcoming */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Institutional Event Calendar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Today */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Happening Today ({todayStr})</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 text-[10px]">
                    {eventsToday.length} Active
                  </span>
                </span>
                <div className="space-y-2 pt-1">
                  {eventsToday.map((e) => (
                    <div key={e.id} className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs space-y-1">
                      <strong className="text-slate-900 block">{e.title}</strong>
                      <span className="text-purple-700 block text-[11px]">{e.club.name}</span>
                      <span className="text-slate-500 block text-[10px]">{e.venue} ({e.startTime} - {e.endTime})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Week */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Upcoming Week</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px]">
                    Scheduled
                  </span>
                </span>
                <div className="space-y-2 pt-1">
                  {events
                    .filter((e) => e.eventDate > todayStr)
                    .slice(0, 3)
                    .map((e) => (
                      <div key={e.id} className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 block">{e.title}</strong>
                          <span className="font-mono text-[10px] font-bold text-emerald-700">{e.eventDate}</span>
                        </div>
                        <span className="text-purple-700 block text-[11px]">{e.club.name}</span>
                        <span className="text-slate-500 block text-[10px]">{e.venue}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Previous Completed */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Previous Conducted Events</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                    Archived
                  </span>
                </span>
                <div className="space-y-2 pt-1">
                  {events
                    .filter((e) => e.eventDate < todayStr)
                    .slice(0, 3)
                    .map((e) => (
                      <div key={e.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                        <strong className="text-slate-900 block">{e.title}</strong>
                        <span className="text-slate-500 block text-[10px]">
                          Date: {e.eventDate} • {e.expectedHours}h OD
                        </span>
                        <span className="text-emerald-700 font-bold block text-[10px]">
                          ✓ Roster Processed & Sanctioned
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & REPORTS (Section 26) */}
      {activeTab === "ANALYTICS" && analyticsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: OD Hours by Month */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>OD Hours Sanctioned by Academic Month (Semester 2026)</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.odHoursByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#3B82F6" radius={[6, 6, 0, 0]} name="OD Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Top Clubs Generating OD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span>OD Engagement by University Club & Chapter</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.clubStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={90} />
                    <Tooltip />
                    <Bar dataKey="participants" fill="#8B5CF6" radius={[0, 6, 6, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Verification Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Automated vs Manual Verification Distribution</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.verificationStats}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.verificationStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Students approaching 40-hr limit */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Users className="w-4 h-4 text-rose-600" />
                <span>Student Allowance Usage Distribution (40-Hour Cap)</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.limitDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="bracket" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Near Limit Watchlist */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm text-rose-800">
              Students Flagged Near 40-Hour Cap (&gt;30 Hours Sanctioned)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3">Reg No</th>
                    <th className="py-2 px-3">School</th>
                    <th className="py-2 px-3">Hours Used</th>
                    <th className="py-2 px-3">Remaining</th>
                    <th className="py-2 px-3">Allowance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analyticsData.nearLimitStudents.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{s.regNo}</td>
                      <td className="py-2.5 px-3">{s.school}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{s.used}h</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{s.remaining}h</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          {s.used >= 36 ? "Critical Cap Threshold" : "Watchlist"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL (Section 21) */}
      {activeTab === "AUDIT" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Institutional Audit Trail & Governance Log
              </h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of all proposals, verifications, corrections, and approvals
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {auditLogs.length} Logged Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(log.timestamp).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SWC Decision Modal for Approving / Rejecting OD Requests */}
      <SWCDecisionModal
        isOpen={!!selectedODForDecision}
        onClose={() => setSelectedODForDecision(null)}
        onSuccess={() => {
          fetchSWCData();
        }}
        odRequest={selectedODForDecision}
        swcUser={session}
      />

      {/* Review Event Proposal Modal */}
      {selectedEventForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                SWC Event OD Sanction Determination
              </h3>
              <button
                onClick={() => setSelectedEventForApproval(null)}
                className="text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Proposed Event
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedEventForApproval.title}
                </p>
                <p className="text-purple-700 font-semibold">
                  {selectedEventForApproval.club.name}
                </p>
                <p className="text-slate-600">
                  Date: {selectedEventForApproval.eventDate} ({selectedEventForApproval.startTime} - {selectedEventForApproval.endTime}) • Requested OD: {selectedEventForApproval.expectedHours}h
                </p>
                <p className="text-slate-500 mt-1 italic">
                  &quot;{selectedEventForApproval.reasonOD}&quot;
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  SWC Sanction Order Remarks:
                </label>
                <input
                  type="text"
                  value={swcRemarksInput}
                  onChange={(e) => setSwcRemarksInput(e.target.value)}
                  placeholder="E.g., Approved by Director SWC for 8 hours OD per accredited participant."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateEventStatus(selectedEventForApproval.id, "SWC_REJECTED")
                  }
                  disabled={updatingEvent}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Reject Proposal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateEventStatus(selectedEventForApproval.id, "SWC_APPROVED")
                  }
                  disabled={updatingEvent}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Sanction & Approve OD Eligibility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

