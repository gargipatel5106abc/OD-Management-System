"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  FileCheck,
  Building,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";

interface FacultyCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  odRequest: any;
  facultyUser: any;
}

export default function FacultyCorrectionModal({
  isOpen,
  onClose,
  onSuccess,
  odRequest,
  facultyUser,
}: FacultyCorrectionModalProps) {
  const [correctionNotes, setCorrectionNotes] = useState(
    "Verified student's attendance records, arena pit credentials, and team presentation log. Officially adding student to the accredited event roster."
  );
  const [addStudentToRoster, setAddStudentToRoster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !odRequest) return null;

  const isFaculty = facultyUser?.role === "FACULTY";

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFaculty) {
      setErrorMsg("Authorization Error: Only Faculty Coordinators can execute official roster corrections.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/od-requests/${odRequest.id}/faculty-correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctionNotes,
          addStudentToRoster,
          program: odRequest.student.program,
          year: odRequest.student.year,
          section: odRequest.student.section,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit correction");
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Submit Corrected Participant Verification
              </h3>
              <p className="text-xs text-amber-200">
                Faculty Coordinator Exclusive Privilege • VIT Chennai Regulations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCorrectionSubmit} className="p-6 space-y-4">
          {!isFaculty && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                <strong>Warning:</strong> You are currently logged in as a <strong>{facultyUser?.role}</strong>. Under university regulations, only a Faculty Coordinator can execute this correction. Please switch persona to Faculty Coordinator (e.g., Dr. Sunita Rao) using the top switcher bar.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Mismatch Context Summary */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900">
                Discrepancy Case: {odRequest.requestNumber}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                Mismatch Under Clarification
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Student</span>
                <span className="font-semibold">{odRequest.student.name} ({odRequest.student.regNo})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Event</span>
                <span className="font-semibold">{odRequest.event.title}</span>
              </div>
            </div>

            {/* Clarification Logs */}
            <div className="pt-2 border-t border-amber-200 space-y-1.5 text-[11px]">
              {odRequest.studentExplanation && (
                <div className="bg-white/80 p-2 rounded border border-amber-200/60">
                  <span className="font-bold text-blue-900 block">
                    Student Explanation:
                  </span>
                  <p className="text-slate-700">{odRequest.studentExplanation}</p>
                </div>
              )}
              {odRequest.clubExplanation && (
                <div className="bg-white/80 p-2 rounded border border-amber-200/60">
                  <span className="font-bold text-purple-900 block">
                    Club Coordinator Response:
                  </span>
                  <p className="text-slate-700">{odRequest.clubExplanation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Roster Rectification Action */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={addStudentToRoster}
                onChange={(e) => setAddStudentToRoster(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-bold text-slate-800">
                Add & Verify Student on Official Event Roster as PRESENT
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              This will update the database roster with status <code>PRESENT</code> and signature tag <code>FACULTY_CORRECTION</code>.
            </p>
          </div>

          {/* Faculty Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Faculty Coordinator Justification & Correction Rationale <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={correctionNotes}
              onChange={(e) => setCorrectionNotes(e.target.value)}
              rows={3}
              className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* Modal Actions */}
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
              disabled={submitting || !isFaculty}
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 ${
                isFaculty
                  ? "bg-amber-600 hover:bg-amber-700 cursor-pointer"
                  : "bg-slate-400 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <span>Submitting Roster Rectification...</span>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Submit Corrected Participant Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

