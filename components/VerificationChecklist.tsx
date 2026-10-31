"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  UserCheck,
} from "lucide-react";

interface VerificationChecklistProps {
  verification: {
    checkEventExists: boolean;
    checkSwcApproved: boolean;
    checkDateMatch: boolean;
    checkTimeMatch: boolean;
    checkParticipantMatch: boolean;
    checkEvidenceMatch: boolean;
    checkLocationMatch: boolean;
    checkOdLimit: boolean;
    overallStatus: "VERIFIED" | "VERIFICATION_REQUIRED" | "FAILED" | string;
    mismatchDetails?: string | null;
  } | null;
  compact?: boolean;
}

export default function VerificationChecklist({
  verification,
  compact = false,
}: VerificationChecklistProps) {
  if (!verification) {
    return (
      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
        Verification pending execution.
      </div>
    );
  }

  const checks = [
    {
      id: "event",
      label: "Event Registry Valid",
      subtext: "Event verified in university catalogue",
      passed: verification.checkEventExists,
      status: verification.checkEventExists ? "PASS" : "FAIL",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "swc",
      label: "SWC Official Approval",
      subtext: "Prior sanction by Student Welfare Centre",
      passed: verification.checkSwcApproved,
      status: verification.checkSwcApproved ? "PASS" : "FAIL",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "date",
      label: "Event Date Match",
      subtext: "Matches academic calendar & sanctioned schedule",
      passed: verification.checkDateMatch,
      status: verification.checkDateMatch ? "PASS" : "FAIL",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: "time",
      label: "Time Window Overlap",
      subtext: "OD hours align within sanctioned event duration",
      passed: verification.checkTimeMatch,
      status: verification.checkTimeMatch ? "PASS" : "FAIL",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: "participant",
      label: "Club Participant Roster Match",
      subtext: "Verified against official post-event attendance list",
      passed: verification.checkParticipantMatch,
      status: verification.checkParticipantMatch ? "PASS" : "FAIL",
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: "evidence",
      label: "Evidence Documentation",
      subtext: "Registration pass, certificate or photo uploaded",
      passed: verification.checkEvidenceMatch,
      status: verification.checkEvidenceMatch ? "PASS" : "WARN",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "location",
      label: "Geo-Location Verification",
      subtext: "GPS metadata within campus venue perimeter",
      passed: verification.checkLocationMatch,
      status: verification.checkLocationMatch ? "PASS" : "WARN",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: "limit",
      label: "OD Allowance Limit (40h Cap)",
      subtext: "Cumulative hours within semester cap",
      passed: verification.checkOdLimit,
      status: verification.checkOdLimit ? "PASS" : "FAIL",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  let parsedMismatch: string[] = [];
  if (verification.mismatchDetails) {
    try {
      parsedMismatch = JSON.parse(verification.mismatchDetails);
    } catch {
      parsedMismatch = [verification.mismatchDetails];
    }
  }

  const getStatusBadge = () => {
    switch (verification.overallStatus) {
      case "VERIFIED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "VERIFIED",
          icon: <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />,
        };
      case "VERIFICATION_REQUIRED":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          label: "VERIFICATION REQUIRED (MISMATCH)",
          icon: <AlertTriangle className="w-4 h-4 mr-1 text-amber-600" />,
        };
      case "FAILED":
      default:
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          label: "FAILED / REJECTED",
          icon: <XCircle className="w-4 h-4 mr-1 text-rose-600" />,
        };
    }
  };

  const statusBadge = getStatusBadge();

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}
        >
          {statusBadge.icon}
          {statusBadge.label}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Institutional Verification Engine (8-Point Check)
          </h4>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${statusBadge.bg}`}
        >
          {statusBadge.icon}
          {statusBadge.label}
        </span>
      </div>

      {/* Grid of 8 checks */}
      <div className="divide-y divide-slate-100 text-xs">
        {checks.map((chk) => (
          <div
            key={chk.id}
            className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <span className="text-slate-400">{chk.icon}</span>
              <div>
                <span className="font-semibold text-slate-800">{chk.label}</span>
                <p className="text-[11px] text-slate-500">{chk.subtext}</p>
              </div>
            </div>

            <div>
              {chk.status === "PASS" ? (
                <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Passed
                </span>
              ) : chk.status === "WARN" ? (
                <span className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Review
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-bold text-xs">
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Mismatch
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mismatch Details Banner if any */}
      {parsedMismatch.length > 0 && (
        <div className="p-3.5 bg-amber-50/80 border-t border-amber-200/80">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-amber-900">
                Discrepancy Notes Flagged:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-800 text-[11px]">
                {parsedMismatch.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

