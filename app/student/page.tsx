"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Calendar,
  Building,
  Filter,
  Eye,
  Send,
  Sparkles,
  FileText,
  ShieldCheck,
} from "lucide-react";
import ApplyODModal from "@/components/ApplyODModal";
import VerificationChecklist from "@/components/VerificationChecklist";
import GeoTaggedPhotoViewer from "@/components/GeoTaggedPhotoViewer";

export default function StudentDashboard() {
  const [session, setSession] = useState<any>(null);
  const [odRequests, setOdRequests] = useState<any[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [studentClarificationText, setStudentClarificationText] = useState("");
  const [clarifying, setClarifying] = useState(false);

  const fetchStudentData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      setSession(authData.user);

      const reqRes = await fetch(
        authData.user?.student
          ? `/api/od-requests?studentId=${authData.user.student.id}`
          : "/api/od-requests"
      );
      const reqData = await reqRes.json();
      setOdRequests(reqData.odRequests || []);

      const evtRes = await fetch("/api/events?status=SWC_APPROVED");
      const evtData = await evtRes.json();
      setApprovedEvents(evtData.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const student = session?.student || {
    id: "student_active",
    regNo: "23BCE1001",
    name: session?.name || "Student",
    program: "B.Tech Computer Science and Engineering",
    school: "SCOPE",
    year: 3,
    section: "A",
    odHoursUsed: 18,
    maxHours: 40,
  };

  const remainingHours = Math.max(0, student.maxHours - student.odHoursUsed);
  const usagePercentage = Math.min(
    100,
    Math.round((student.odHoursUsed / student.maxHours) * 100)
  );

  const pendingCount = odRequests.filter(
    (r) => r.status === "SUBMITTED" || r.status === "AUTO_VERIFIED"
  ).length;
  const approvedCount = odRequests.filter((r) => r.status === "SWC_APPROVED").length;
  const mismatchCount = odRequests.filter(
    (r) => r.status === "VERIFICATION_REQUIRED"
  ).length;
  const rejectedCount = odRequests.filter((r) => r.status === "REJECTED").length;

  const filteredRequests = odRequests.filter((r) => {
    const matchesSearch =
      r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.event.club.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "APPROVED" && r.status === "SWC_APPROVED") ||
      (statusFilter === "PENDING" &&
        (r.status === "SUBMITTED" || r.status === "AUTO_VERIFIED")) ||
      (statusFilter === "MISMATCH" && r.status === "VERIFICATION_REQUIRED") ||
      (statusFilter === "REJECTED" && r.status === "REJECTED");

    return matchesSearch && matchesStatus;
  });

  const handleSendClarification = async (requestId: string) => {
    if (!studentClarificationText.trim()) return;
    setClarifying(true);
    try {
      await fetch(`/api/od-requests/${requestId}/clarify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explanation: studentClarificationText,
          role: "STUDENT",
        }),
      });
      setStudentClarificationText("");
      await fetchStudentData();
      // refresh selected request
      const updated = odRequests.find((r) => r.id === requestId);
      if (updated) {
        setSelectedRequest({
          ...updated,
          studentExplanation: studentClarificationText,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClarifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Allowance Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-200 border border-white/15">
            <GraduationCap className="w-4 h-4 text-blue-300" />
            <span>VIT Chennai • Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {student.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200">
            Reg No: <strong className="font-mono text-white">{student.regNo}</strong> •{" "}
            {student.school} • {student.program} (Year {student.year})
          </p>
        </div>

        {/* Prominent OD Allowance Gauge & Apply Button */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-[300px] sm:min-w-[340px] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-100">Semester OD Quota</span>
            <span className="font-mono font-bold text-amber-300">
              Max: {student.maxHours}h
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                {student.odHoursUsed}{" "}
                <span className="text-xs text-blue-300 font-sans font-normal">
                  / {student.maxHours} Hours Used
                </span>
              </span>
              <span className="text-xs font-bold text-emerald-300">
                {remainingHours}h remaining
              </span>
            </div>

            {/* Visual progress indicator */}
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage > 85
                    ? "bg-rose-400"
                    : usagePercentage > 60
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-blue-200">
              Institutional Cap: 40 hrs / period
            </span>
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for OD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            OD Hours Used
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {student.odHoursUsed}h
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {usagePercentage}% cap
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Remaining Hours
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {remainingHours}h
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Available
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approved ODs
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {approvedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Sanctioned
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pending / In Review
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              {pendingCount + mismatchCount}
            </span>
            {mismatchCount > 0 && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                {mismatchCount} mismatch
              </span>
            )}
          </div>
        </div>
      </div>

      {/* OD Request History & Records */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              My On-Duty Applications & Sanctions
            </h3>
            <p className="text-xs text-slate-500">
              Track status, verification logs, and official SWC approvals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search event, club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>

            {/* Filter buttons */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
              {["ALL", "APPROVED", "PENDING", "MISMATCH", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    statusFilter === st
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {st === "MISMATCH" ? "Action Req" : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Event & Category</th>
                <th className="py-3.5 px-4">Club</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">OD Hours</th>
                <th className="py-3.5 px-4">Verification & Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No On-Duty records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isVerified = req.status === "AUTO_VERIFIED";
                  const isApproved = req.status === "SWC_APPROVED";
                  const isMismatch = req.status === "VERIFICATION_REQUIRED";
                  const isRejected = req.status === "REJECTED";

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {req.requestNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block truncate max-w-xs">
                          {req.event.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {req.event.category} • {req.event.venue}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center text-slate-700 font-medium">
                          <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {req.event.club.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="block font-medium">
                          {req.event.eventDate}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {req.event.startTime} - {req.event.endTime}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {req.requestedHours} hrs
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Approved by SWC
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Auto-Verified (Queue)
                          </span>
                        )}
                        {isMismatch && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            Verification Required
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Rejected
                          </span>
                        )}
                        {req.status === "SUBMITTED" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Submitted
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details & Verification Drill-down Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-blue-300">
                  {selectedRequest.requestNumber}
                </span>
                <h3 className="font-bold text-base text-white">
                  {selectedRequest.event.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Status Banner */}
              {selectedRequest.status === "SWC_APPROVED" && selectedRequest.odRecord && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      Official Sanctioned OD Record Generated
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Hash: {selectedRequest.odRecord.recordHash.substring(0, 16)}...
                    </span>
                  </div>
                  <p className="text-slate-700">
                    Sanctioned by:{" "}
                    <strong>{selectedRequest.odRecord.approvalAuthority}</strong> on{" "}
                    {new Date(selectedRequest.odRecord.approvedAt).toLocaleDateString()}.
                  </p>
                  <p className="text-[11px] text-emerald-800 font-mono">
                    Credited Hours: {selectedRequest.odRecord.hoursGranted} hrs
                  </p>
                </div>
              )}

              {selectedRequest.status === "REJECTED" && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-rose-900 flex items-center">
                    <XCircle className="w-4 h-4 mr-1 text-rose-600" />
                    Request Rejected
                  </span>
                  <p className="text-rose-800">
                    <strong>Reason:</strong> {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

              {/* Mismatch & Clarification Thread */}
              {selectedRequest.status === "VERIFICATION_REQUIRED" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">
                        Participant Roster Mismatch Detected
                      </p>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        Your register number (<strong>{student.regNo}</strong>) was not found on the club&apos;s initial participant list. Per university governance, please submit your clarification below. The <strong>Faculty Coordinator</strong> will review and execute the official roster correction.
                      </p>
                    </div>
                  </div>

                  {/* Previous responses if any */}
                  {selectedRequest.studentExplanation && (
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <span className="font-bold text-blue-900 block text-[11px]">
                        Your Submitted Clarification:
                      </span>
                      <p className="text-slate-700 text-xs mt-1">
                        {selectedRequest.studentExplanation}
                      </p>
                    </div>
                  )}

                  {selectedRequest.clubExplanation && (
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <span className="font-bold text-purple-900 block text-[11px]">
                        Club Coordinator Note:
                      </span>
                      <p className="text-slate-700 text-xs mt-1">
                        {selectedRequest.clubExplanation}
                      </p>
                    </div>
                  )}

                  {/* Clarification input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Provide Clarification / Team Roster Details:
                    </label>
                    <textarea
                      value={studentClarificationText}
                      onChange={(e) => setStudentClarificationText(e.target.value)}
                      placeholder="Explain your participation role, pilot team name, or attach references..."
                      rows={2}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSendClarification(selectedRequest.id)}
                        disabled={clarifying || !studentClarificationText.trim()}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Clarification</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 8-Point Verification Engine Checklist */}
              {selectedRequest.verificationResult && (
                <VerificationChecklist
                  verification={selectedRequest.verificationResult}
                />
              )}

              {/* Geo-tagged photo telemetry */}
              {selectedRequest.evidences?.find(
                (e: any) => e.type === "GEOTAGGED_PHOTO"
              ) && (
                <GeoTaggedPhotoViewer
                  evidence={selectedRequest.evidences.find(
                    (e: any) => e.type === "GEOTAGGED_PHOTO"
                  )}
                  eventInfo={selectedRequest.event}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply OD Modal */}
      <ApplyODModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={() => {
          fetchStudentData();
        }}
        student={student}
        events={approvedEvents}
      />
    </div>
  );
}

