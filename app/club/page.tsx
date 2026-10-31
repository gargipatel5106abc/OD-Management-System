"use client";

import React, { useState, useEffect } from "react";
import {
  Building,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Send,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import CSVParticipantUploader from "@/components/CSVParticipantUploader";

export default function ClubDashboard() {
  const [session, setSession] = useState<any>(null);
  const [clubEvents, setClubEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventForRoster, setSelectedEventForRoster] = useState<any>(null);
  const [selectedEventODs, setSelectedEventODs] = useState<any[]>([]);
  const [clubClarificationText, setClubClarificationText] = useState("");
  const [clarifyingId, setClarifyingId] = useState<string | null>(null);

  // New Event Form State
  const [eventForm, setEventForm] = useState({
    title: "",
    category: "TECHNICAL",
    eventDate: "2026-10-28",
    startTime: "09:00",
    endTime: "17:00",
    expectedHours: "8",
    venue: "MG Auditorium, VIT Chennai",
    expectedParticipants: "100",
    description: "",
    reasonOD: "Students participating in accredited full-day university event tracks.",
  });
  const [submittingEvent, setSubmittingEvent] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchClubData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      setSession(authData.user);

      const eventsRes = await fetch("/api/events");
      const eventsData = await eventsRes.json();
      // Filter to club's events if club user, or show all with club highlight
      setClubEvents(eventsData.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEvent(true);
    setFormError("");

    try {
      // Find active club or fallback to first club
      const clubId = session?.club?.id || clubEvents[0]?.clubId;
      if (!clubId) {
        throw new Error("No club associated with current session.");
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventForm,
          clubId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit event request");
      }

      setShowCreateModal(false);
      setEventForm({
        title: "",
        category: "TECHNICAL",
        eventDate: "2026-10-28",
        startTime: "09:00",
        endTime: "17:00",
        expectedHours: "8",
        venue: "MG Auditorium, VIT Chennai",
        expectedParticipants: "100",
        description: "",
        reasonOD: "Students participating in accredited full-day university event tracks.",
      });
      await fetchClubData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleSendClubClarification = async (requestId: string) => {
    if (!clubClarificationText.trim()) return;
    try {
      await fetch(`/api/od-requests/${requestId}/clarify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explanation: clubClarificationText,
          role: "CLUB",
        }),
      });
      setClubClarificationText("");
      setClarifyingId(null);
      await fetchClubData();
    } catch (e) {
      console.error(e);
    }
  };

  const viewEventODRequests = async (event: any) => {
    setSelectedEventForRoster(event);
    try {
      const res = await fetch(`/api/od-requests?eventId=${event.id}`);
      const data = await res.json();
      setSelectedEventODs(data.odRequests || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Club Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-purple-200 border border-white/15">
            <Building className="w-4 h-4 text-purple-300" />
            <span>VIT Chennai • Club & Chapter Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {session?.club?.name || "CodeChef VIT Chennai"}
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 max-w-2xl">
            Manage sanctioned event proposals, submit official post-event participant rosters, and collaborate with Faculty Coordinators on attendance governance.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Event OD Request to SWC</span>
          </button>
        </div>
      </div>

      {/* Institutional Requirement Callout */}
      <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-start space-x-3 text-xs text-purple-900">
        <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-purple-950 font-bold mb-0.5">
            Important Institutional Rule (SWC Approval Prerequisite):
          </strong>
          <span>
            Clubs must receive official SWC OD Sanction <strong>prior to conducting the event</strong> for participating students to be eligible for On-Duty hours. After the event concludes, submit the final participant roster via CSV/Excel to enable student auto-verification.
          </span>
        </div>
      </div>

      {/* Club Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Club Events & OD Eligibility Status
            </h3>
            <p className="text-xs text-slate-500">
              Track SWC sanction determinations and upload official attendance rosters
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {clubEvents.length} Events Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Event Code & Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Sanctioned OD</th>
                <th className="py-3.5 px-4">SWC Eligibility Status</th>
                <th className="py-3.5 px-4">Roster Count</th>
                <th className="py-3.5 px-4 text-right">Roster & Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clubEvents.map((evt) => {
                const isApproved = evt.status === "SWC_APPROVED" || evt.status === "COMPLETED";
                const isPending = evt.status === "PENDING_SWC";
                const isRejected = evt.status === "SWC_REJECTED";

                return (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] text-slate-400 block">
                        {evt.eventCode}
                      </span>
                      <strong className="text-slate-900 text-xs block truncate max-w-xs">
                        {evt.title}
                      </strong>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {evt.venue}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {evt.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium block">{evt.eventDate}</span>
                      <span className="text-[10px] text-slate-400">
                        {evt.startTime} – {evt.endTime}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-900">
                        {evt.expectedHours} hrs
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isApproved && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          🟢 OD Eligible (SWC Approved)
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          🟡 Pending SWC Approval
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          🔴 OD Not Approved
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt._count?.participants || evt.participants?.length || 0} students</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => viewEventODRequests(evt)}
                        className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors inline-flex items-center space-x-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Manage Roster</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details & Roster Manager Drawer / Section */}
      {selectedEventForRoster && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono text-purple-600 font-bold">
                {selectedEventForRoster.eventCode}
              </span>
              <h3 className="font-bold text-lg text-slate-900">
                {selectedEventForRoster.title}
              </h3>
              <p className="text-xs text-slate-500">
                Venue: {selectedEventForRoster.venue} • Date: {selectedEventForRoster.eventDate} ({selectedEventForRoster.expectedHours}h OD)
              </p>
            </div>
            <button
              onClick={() => setSelectedEventForRoster(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              Close Panel
            </button>
          </div>

          {/* Participant CSV Uploader */}
          <CSVParticipantUploader
            eventId={selectedEventForRoster.id}
            onSuccess={() => {
              fetchClubData();
              viewEventODRequests(selectedEventForRoster);
            }}
          />

          {/* Student OD Applications filed for this event */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Student OD Applications Filed ({selectedEventODs.length})</span>
            </h4>

            {selectedEventODs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No student OD requests filed yet for this event.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedEventODs.map((od) => (
                  <div
                    key={od.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-slate-900">{od.student.name}</strong>
                        <span className="font-mono text-blue-700 font-bold">
                          {od.student.regNo}
                        </span>
                        <span className="text-slate-400">• {od.student.school}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {od.reason}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {od.status === "VERIFICATION_REQUIRED" && (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ⚠ Roster Mismatch Flagged
                          </span>
                          <button
                            onClick={() => setClarifyingId(od.id)}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
                          >
                            Respond to Mismatch
                          </button>
                        </div>
                      )}
                      {od.status === "AUTO_VERIFIED" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ Matched Roster
                        </span>
                      )}
                      {od.status === "SWC_APPROVED" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ SWC Approved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Club Clarification Response Modal / Popover */}
          {clarifyingId && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
              <span className="font-bold text-amber-900 block">
                Submit Club Coordinator Roster Clarification Note:
              </span>
              <p className="text-[11px] text-amber-800">
                Explain if the student was omitted due to sheet formatting, late registration, or pit crew team assignment.
              </p>
              <textarea
                value={clubClarificationText}
                onChange={(e) => setClubClarificationText(e.target.value)}
                placeholder="E.g., Verified that student Arjun Patel was on auxiliary pilot roster #42..."
                rows={2}
                className="w-full text-xs rounded border border-amber-300 p-2 text-slate-800"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setClarifyingId(null)}
                  className="px-3 py-1 rounded border border-slate-300 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendClubClarification(clarifyingId)}
                  className="px-3 py-1 rounded bg-amber-600 text-white font-bold"
                >
                  Submit Explanation
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Propose Event OD Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  Submit Event OD Sanction Request to SWC
                </h3>
                <p className="text-xs text-purple-200">
                  Prior approval required before hosting event for OD eligibility
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-purple-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. National Autonomous AI Hackathon 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Event Category
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  >
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="HACKATHON">HACKATHON</option>
                    <option value="CONFERENCE">CONFERENCE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Expected Participants
                  </label>
                  <input
                    type="number"
                    value={eventForm.expectedParticipants}
                    onChange={(e) => setEventForm({ ...eventForm, expectedParticipants: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Venue / Campus Location
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sanctioned OD Hours Requested
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={eventForm.expectedHours}
                    onChange={(e) => setEventForm({ ...eventForm, expectedHours: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason OD Support is Required
                </label>
                <textarea
                  rows={2}
                  value={eventForm.reasonOD}
                  onChange={(e) => setEventForm({ ...eventForm, reasonOD: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvent}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {submittingEvent ? "Submitting..." : "Submit Proposal to SWC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

