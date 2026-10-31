"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck2,
  Clock,
  Sparkles,
  Hash,
} from "lucide-react";
import VerificationChecklist from "./VerificationChecklist";
import GeoTaggedPhotoViewer from "./GeoTaggedPhotoViewer";

interface SWCDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  odRequest: any;
  swcUser: any;
}

export default function SWCDecisionModal({
  isOpen,
  onClose,
  onSuccess,
  odRequest,
  swcUser,
}: SWCDecisionModalProps) {
  const [decisionMode, setDecisionMode] = useState<"APPROVE" | "REJECT" | "CLARIFY">("APPROVE");
  const [grantedHours, setGrantedHours] = useState(
    odRequest ? odRequest.requestedHours.toString() : "6"
  );
  const [remarks, setRemarks] = useState("Verified by SWC. Sanctioned according to university regulations.");
  const [rejectionReason, setRejectionReason] = useState(
    "Activity does not fulfill statutory university On-Duty criteria."
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !odRequest) return null;

  const isSwc = swcUser?.role === "SWC";
  const geoPhoto = odRequest.evidences?.find((e: any) => e.type === "GEOTAGGED_PHOTO");

  const currentHours = odRequest.student.odHoursUsed;
  const hoursToCredit = parseFloat(grantedHours) || 0;
  const projectedTotal = currentHours + hoursToCredit;
  const isOverLimit = projectedTotal > odRequest.student.maxHours;

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSwc) {
      setErrorMsg("Authorization Error: Only SWC Administrators can issue final OD approvals or rejections.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/od-requests/${odRequest.id}/swc-decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: decisionMode === "CLARIFY" ? "CLARIFICATION" : decisionMode,
          grantedHours: hoursToCredit,
          remarks,
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record SWC decision");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                SWC Executive OD Determination
              </h3>
              <p className="text-xs text-emerald-200">
                Administrative Sign-off & Immutable On-Duty Record Generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {!isSwc && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Note:</strong> You are currently acting as <strong>{swcUser?.name} ({swcUser?.role})</strong>. Please switch to SWC Admin (Dr. S. Balasubramanian) in the top bar to record executive decisions.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Student & Event Summary Header Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Applicant Student
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {odRequest.student.name}
              </p>
              <p className="text-blue-700 font-mono font-semibold">
                {odRequest.student.regNo} • {odRequest.student.school}
              </p>
              <p className="text-slate-500">
                {odRequest.student.program} (Year {odRequest.student.year})
              </p>
              <div className="pt-1.5 flex items-center justify-between text-slate-700">
                <span>Current Allowance:</span>
                <span className="font-bold font-mono">
                  {currentHours} / {odRequest.student.maxHours}h used
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Sanctioned Event
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {odRequest.event.title}
              </p>
              <p className="text-purple-700 font-semibold">
                {odRequest.event.club.name}
              </p>
              <p className="text-slate-500">
                Date: {odRequest.event.eventDate} ({odRequest.event.startTime} - {odRequest.event.endTime})
              </p>
              <p className="text-slate-500 truncate">
                Venue: {odRequest.event.venue}
              </p>
            </div>
          </div>

          {/* Verification Engine Results Checklist */}
          {odRequest.verificationResult && (
            <div>
              <VerificationChecklist verification={odRequest.verificationResult} />
            </div>
          )}

          {/* Geo-tagged photo telemetry if attached */}
          {geoPhoto && (
            <div>
              <GeoTaggedPhotoViewer
                evidence={geoPhoto}
                eventInfo={odRequest.event}
              />
            </div>
          )}

          {/* Faculty Correction Notification if applicable */}
          {odRequest.facultyCorrectionNotes && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Faculty Coordinator Roster Rectification Executed</span>
              </div>
              <p className="text-slate-700 text-[11px]">
                {odRequest.facultyCorrectionNotes}
              </p>
            </div>
          )}

          {/* Decision Selector Tabs */}
          <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Administrative Action:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionMode("APPROVE")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    decisionMode === "APPROVE"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sanction & Approve OD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionMode("REJECT")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    decisionMode === "REJECT"
                      ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Reject Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionMode("CLARIFY")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    decisionMode === "CLARIFY"
                      ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Request Clarification</span>
                </button>
              </div>
            </div>

            {decisionMode === "APPROVE" && (
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    Sanctioned OD Hours to Credit:
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="40"
                      value={grantedHours}
                      onChange={(e) => setGrantedHours(e.target.value)}
                      className="w-20 rounded border border-slate-300 p-1 font-mono font-bold text-right"
                    />
                    <span className="font-semibold text-slate-600">Hours</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>
                    Student Current: <strong>{currentHours}h</strong> • New Total:{" "}
                    <strong>{projectedTotal} / {odRequest.student.maxHours}h</strong>
                  </p>
                  {isOverLimit && (
                    <p className="text-rose-600 font-bold">
                      ⚠ Warning: This approval exceeds the 40-hour limit by {projectedTotal - odRequest.student.maxHours} hours.
                    </p>
                  )}
                  <p className="text-emerald-700">
                    ✓ Approving generates an immutable SHA-256 tamper-evident record.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    SWC Order Remarks / Certification Note:
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 p-2"
                  />
                </div>
              </div>
            )}

            {decisionMode === "REJECT" && (
              <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <label className="block font-bold text-rose-900">
                  Official Rejection Reason (Communicated to Student):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded border border-rose-300 p-2"
                  required
                />
              </div>
            )}

            {decisionMode === "CLARIFY" && (
              <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
                <label className="block font-bold text-amber-900">
                  Clarification Instructions:
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded border border-amber-300 p-2"
                  placeholder="Specify what additional documentation or confirmation is required..."
                  required
                />
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isSwc}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 ${
                  decisionMode === "APPROVE"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : decisionMode === "REJECT"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-amber-600 hover:bg-amber-700"
                } ${!isSwc ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {submitting ? (
                  <span>Executing Order...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Confirm SWC Determination</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

