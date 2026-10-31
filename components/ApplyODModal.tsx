"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck2,
  Calendar,
  Clock,
  MapPin,
  Building,
  Upload,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface ApplyODModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: {
    id: string;
    regNo: string;
    name: string;
    program: string;
    school: string;
    year: number;
    section: string;
    odHoursUsed: number;
    maxHours: number;
  };
  events: any[];
}

export default function ApplyODModal({
  isOpen,
  onClose,
  onSuccess,
  student,
  events,
}: ApplyODModalProps) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [reason, setReason] = useState("");
  const [includeGeoPhoto, setIncludeGeoPhoto] = useState(true);
  const [includeCertificate, setIncludeCertificate] = useState(true);
  const [photoLocationVerification, setPhotoLocationVerification] = useState("VIT_CHENNAI");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const requestedHours = selectedEvent ? selectedEvent.expectedHours : 0;
  const newProjectedHours = student.odHoursUsed + requestedHours;
  const isOverLimit = newProjectedHours > student.maxHours;
  const overByHours = newProjectedHours - student.maxHours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      setErrorMsg("Please select an approved event.");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Please provide your reason for attending / participation details.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const evidences: any[] = [];

      if (includeGeoPhoto) {
        const isCampus = photoLocationVerification === "VIT_CHENNAI";
        evidences.push({
          type: "GEOTAGGED_PHOTO",
          title: "Event Venue Geo-tagged Attendance Photo",
          fileName: `photo_${student.regNo}_${selectedEvent?.eventCode}.jpg`,
          fileUrl: "/evidence/geophoto_sample.jpg",
          fileSize: "3.2 MB",
          mimeType: "image/jpeg",
          gpsLatitude: isCampus ? (selectedEvent?.latitude || 12.8406) : 13.0827,
          gpsLongitude: isCampus ? (selectedEvent?.longitude || 80.1534) : 80.2707,
          photoTimestamp: new Date(),
          photoLocationName: isCampus
            ? `${selectedEvent?.venue || "VIT Chennai Campus"}, Kelambakkam`
            : "Off-Campus Coordinates (Outside Venue Radius)",
          isGeoVerified: isCampus,
          geoVerificationNotes: isCampus
            ? "EXIF GPS coordinates match sanctioned campus venue coordinates."
            : "Coordinates outside sanctioned venue radius.",
        });
      }

      if (includeCertificate) {
        evidences.push({
          type: "CERTIFICATE",
          title: "Official Event Participation Certificate / Pass",
          fileName: `cert_${student.regNo}.pdf`,
          fileUrl: "/evidence/cert_sample.pdf",
          fileSize: "1.4 MB",
          mimeType: "application/pdf",
        });
      }

      const res = await fetch("/api/od-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          eventId: selectedEventId,
          reason,
          requestedHours,
          evidences,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit OD request");
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
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Apply for On-Duty (OD)
              </h3>
              <p className="text-xs text-blue-200">
                Official Student OD Request Filing • VIT Chennai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Profile Snapshot (Pre-filled) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2">
              Student Information (Auto-populated)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Name</span>
                <span className="font-semibold">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Register No</span>
                <span className="font-semibold text-blue-700 font-mono">
                  {student.regNo}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">School</span>
                <span className="font-semibold">{student.school}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Program</span>
                <span className="truncate block font-semibold">
                  {student.program}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Year / Section</span>
                <span className="font-semibold">
                  Year {student.year} • Sec {student.section}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">OD Balance</span>
                <span className="font-semibold text-emerald-700">
                  {student.maxHours - student.odHoursUsed}h remaining
                </span>
              </div>
            </div>
          </div>

          {/* Event Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Approved Event <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose an SWC Sanctioned Event --</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.eventDate} • {evt.club.name} • {evt.expectedHours}h OD)
                </option>
              ))}
            </select>
          </div>

          {/* Selected Event Details Preview */}
          {selectedEvent && (
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 text-sm">
                  {selectedEvent.title}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  SWC Approved ({selectedEvent.expectedHours} hrs OD)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700 text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{selectedEvent.club.name}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedEvent.eventDate}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{selectedEvent.venue}</span>
                </div>
              </div>
            </div>
          )}

          {/* OD Allowance Calculations & Limit Warning */}
          {selectedEvent && (
            <div className="p-3.5 rounded-xl border bg-slate-50 text-xs">
              <div className="flex items-center justify-between font-medium text-slate-700">
                <span>Current OD Usage:</span>
                <span className="font-bold font-mono">
                  {student.odHoursUsed} / {student.maxHours} hours
                </span>
              </div>
              <div className="flex items-center justify-between font-medium text-blue-700 mt-1">
                <span>Hours For This Event:</span>
                <span className="font-bold font-mono">+{requestedHours} hours</span>
              </div>
              <div className="border-t border-slate-200 my-2 pt-2 flex items-center justify-between font-bold text-slate-900">
                <span>Projected Semester Total:</span>
                <span
                  className={`font-mono text-sm ${
                    isOverLimit ? "text-rose-600" : "text-emerald-700"
                  }`}
                >
                  {newProjectedHours} / {student.maxHours} hours
                </span>
              </div>

              {isOverLimit && (
                <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-start space-x-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>
                    <strong>Allowance Warning:</strong> This request exceeds your remaining 40-hour OD allowance by{" "}
                    <strong>{overByHours} hours</strong>. The request will require manual SWC discretionary review.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reason for Attending */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Attending / Participation Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Competed as team lead in 24-hr Hackathon building an autonomous smart grid solution representing the university..."
              rows={3}
              className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Evidence Upload Section */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-700">
              Evidence & Verification Documentation
            </span>

            {/* Geotagged Photo Switcher */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Upload Geo-Tagged Event Photograph
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeGeoPhoto}
                  onChange={(e) => setIncludeGeoPhoto(e.target.checked)}
                  className="rounded text-blue-600"
                />
              </label>

              {includeGeoPhoto && (
                <div className="pl-6 pt-1 space-y-2 text-xs">
                  <p className="text-xs text-slate-500">
                    System extracts GPS telemetry and timestamp to match against official event venue coordinates.
                  </p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-700 font-medium">Venue Geolocation Coordinates:</span>
                    <select
                      value={photoLocationVerification}
                      onChange={(e) => setPhotoLocationVerification(e.target.value)}
                      className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 font-medium"
                    >
                      <option value="VIT_CHENNAI">
                        📍 VIT Chennai Campus Venue (Verified Geofence)
                      </option>
                      <option value="OFF_CAMPUS">
                        📍 External Venue Coordinates (Requires Review)
                      </option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Certificate attachment checkbox */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Attach Participation Certificate / Registration Ticket
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeCertificate}
                  onChange={(e) => setIncludeCertificate(e.target.checked)}
                  className="rounded text-blue-600"
                />
              </label>
            </div>
          </div>

          {/* Modal Footer */}
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
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5"
            >
              {submitting ? (
                <span>Running Verification Engine...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit OD Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

