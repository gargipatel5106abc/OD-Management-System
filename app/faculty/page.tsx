"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Building,
  UserCheck,
  Calendar,
  Clock,
  Sparkles,
  Eye,
} from "lucide-react";
import FacultyCorrectionModal from "@/components/FacultyCorrectionModal";
import VerificationChecklist from "@/components/VerificationChecklist";
import GeoTaggedPhotoViewer from "@/components/GeoTaggedPhotoViewer";

export default function FacultyCoordinatorDashboard() {
  const [session, setSession] = useState<any>(null);
  const [mismatches, setMismatches] = useState<any[]>([]);
  const [facultyEvents, setFacultyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCorrectionReq, setSelectedCorrectionReq] = useState<any>(null);
  const [inspectRequest, setInspectRequest] = useState<any>(null);

  const fetchFacultyData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      setSession(authData.user);

      // Fetch all OD requests with mismatch status
      const mismatchRes = await fetch(
        "/api/od-requests?status=VERIFICATION_REQUIRED"
      );
      const mismatchData = await mismatchRes.json();
      setMismatches(mismatchData.odRequests || []);

      // Fetch events
      const evtRes = await fetch("/api/events");
      const evtData = await evtRes.json();
      setFacultyEvents(evtData.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const isFacultyRole = session?.role === "FACULTY";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-amber-200 border border-white/15">
            <Users className="w-4 h-4 text-amber-300" />
            <span>VIT Chennai • Faculty Coordinator Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {session?.name || "Dr. Sunita Rao"}
          </h1>
          <p className="text-xs sm:text-sm text-amber-200">
            {session?.facultyCoordinator?.employeeId || "EMP-FAC-7421"} •{" "}
            {session?.facultyCoordinator?.department ||
              "School of Electronics Engineering (SENSE)"}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[260px] text-xs space-y-1.5">
          <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block">
            Executive Privilege Notice
          </span>
          <p className="text-white font-medium">
            Authorized to sign off roster corrections and resolve participant mismatches.
          </p>
          <span className="text-[11px] text-amber-200 block font-mono">
            Privilege Level: Tier-2 Institutional
          </span>
        </div>
      </div>

      {!isFacultyRole && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start space-x-3 text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-950 font-bold mb-0.5">
              Institutional Authorization Required:
            </strong>
            <span>
              You are currently viewing this portal as <strong>{session?.name} ({session?.role})</strong>. Official participant roster rectifications are strictly restricted to <strong>Faculty Coordinators</strong> under university regulations. To authenticate as faculty, select <strong>Dr. Sunita Rao (Faculty Coordinator)</strong> in the top header.
            </span>
          </div>
        </div>
      )}

      {/* Roster Mismatch Clarification Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Participant Mismatch Resolution Queue
              </h3>
              <p className="text-xs text-slate-500">
                Student claims requiring official Faculty Coordinator roster rectification
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            {mismatches.length} Mismatch Cases Pending
          </span>
        </div>

        {mismatches.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No roster mismatches pending faculty resolution at this time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mismatches.map((req) => (
              <div
                key={req.id}
                className="p-6 hover:bg-slate-50/70 transition-colors space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {req.requestNumber}
                      </span>
                      <strong className="text-slate-900 text-sm">
                        {req.student.name}
                      </strong>
                      <span className="font-mono text-slate-600 font-semibold text-xs">
                        ({req.student.regNo})
                      </span>
                      <span className="text-slate-400 text-xs">
                        • {req.student.program}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                      <span>Event: <strong>{req.event.title}</strong></span>
                      <span>•</span>
                      <span>Club: {req.event.club.name}</span>
                      <span>•</span>
                      <span>Date: {req.event.eventDate} ({req.requestedHours}h OD)</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => setInspectRequest(req)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Evidence</span>
                    </button>

                    <button
                      onClick={() => setSelectedCorrectionReq(req)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Submit Corrected Participant Verification</span>
                    </button>
                  </div>
                </div>

                {/* Clarification logs between Student & Club */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1">
                    <span className="font-bold text-blue-900 block text-[11px]">
                      Student Explanation / Attendance Claim:
                    </span>
                    <p className="text-slate-700 text-[11px]">
                      {req.studentExplanation ||
                        "No student clarification note submitted yet."}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1">
                    <span className="font-bold text-purple-900 block text-[11px]">
                      Club Coordinator Statement:
                    </span>
                    <p className="text-slate-700 text-[11px]">
                      {req.clubExplanation ||
                        "Awaiting club coordinator acknowledgment..."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coordinated Events Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Coordinated Club Events & Academic Schedules
            </h3>
            <p className="text-xs text-slate-500">
              Overview of events under faculty governance
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Event Code</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Club</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Participants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {facultyEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">
                    {evt.eventCode}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {evt.title}
                  </td>
                  <td className="py-3 px-4">{evt.club.name}</td>
                  <td className="py-3 px-4">{evt.eventDate}</td>
                  <td className="py-3 px-4 font-mono font-bold">{evt.expectedHours}h</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.status === "SWC_APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : evt.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {evt._count?.participants || evt.participants?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Evidence Modal */}
      {inspectRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                Inspect Request Telemetry & Evidence: {inspectRequest.requestNumber}
              </h3>
              <button
                onClick={() => setInspectRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {inspectRequest.verificationResult && (
                <VerificationChecklist
                  verification={inspectRequest.verificationResult}
                />
              )}
              {inspectRequest.evidences?.find(
                (e: any) => e.type === "GEOTAGGED_PHOTO"
              ) && (
                <GeoTaggedPhotoViewer
                  evidence={inspectRequest.evidences.find(
                    (e: any) => e.type === "GEOTAGGED_PHOTO"
                  )}
                  eventInfo={inspectRequest.event}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Faculty Correction Modal */}
      <FacultyCorrectionModal
        isOpen={!!selectedCorrectionReq}
        onClose={() => setSelectedCorrectionReq(null)}
        onSuccess={() => {
          fetchFacultyData();
        }}
        odRequest={selectedCorrectionReq}
        facultyUser={session}
      />
    </div>
  );
}

