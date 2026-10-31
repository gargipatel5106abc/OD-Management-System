"use client";

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  Table,
} from "lucide-react";

interface CSVParticipantUploaderProps {
  eventId: string;
  onSuccess: () => void;
}

export default function CSVParticipantUploader({
  eventId,
  onSuccess,
}: CSVParticipantUploaderProps) {
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const sampleCsvTemplate = `Register Number,Name,Program,Year,Section,Attendance
23BCE1001,Rahul Sharma,B.Tech CSE,3,A,Present
23BCE1002,Aisha Khan,B.Tech CSE,3,B,Present
23BCE1010,Arjun Patel,B.Tech ECE,2,C,Present
23BCE1042,Vikram Nair,B.Tech EEE,4,B,Present
23BCE1234,Ananya Iyer,B.Tech CSE,3,C,Present`;

  const handleParseCsv = (content: string) => {
    setCsvText(content);
    setValidationErrors([]);
    setUploadSuccess(null);

    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const regIdx = headers.findIndex((h) => h.includes("reg") || h.includes("number"));
    const nameIdx = headers.findIndex((h) => h.includes("name"));
    const progIdx = headers.findIndex((h) => h.includes("prog") || h.includes("branch"));
    const yearIdx = headers.findIndex((h) => h.includes("year"));
    const secIdx = headers.findIndex((h) => h.includes("sec"));
    const attIdx = headers.findIndex((h) => h.includes("attend") || h.includes("status"));

    if (regIdx === -1 || nameIdx === -1) {
      setValidationErrors(["CSV header must include at least 'Register Number' and 'Name'."]);
      return;
    }

    const rows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(",").map((c) => c.trim());

      const regNo = cols[regIdx] ? cols[regIdx].toUpperCase() : "";
      const name = cols[nameIdx] || "";
      const program = progIdx !== -1 ? cols[progIdx] : "B.Tech";
      const year = yearIdx !== -1 ? parseInt(cols[yearIdx]) || 3 : 3;
      const section = secIdx !== -1 ? cols[secIdx] : "A";
      const attendance =
        attIdx !== -1 && cols[attIdx].toLowerCase().includes("abs")
          ? "ABSENT"
          : "PRESENT";

      // Validation
      if (!regNo || regNo.length < 5) {
        errors.push(`Row ${i}: Invalid or missing Register Number (${regNo || "empty"}).`);
      }
      if (!name) {
        errors.push(`Row ${i}: Missing Student Name for ${regNo}.`);
      }

      rows.push({
        regNo,
        studentName: name,
        program,
        year,
        section,
        attendanceStatus: attendance,
        participationType: "PARTICIPANT",
      });
    }

    setValidationErrors(errors);
    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleSubmitRoster = async () => {
    if (parsedRows.length === 0 || validationErrors.length > 0) return;

    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const res = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: parsedRows,
          replaceAll: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import participant roster");
      }

      setUploadSuccess(`Successfully synchronized ${data.count} participant records into event roster.`);
      onSuccess();
    } catch (err: any) {
      setValidationErrors([err.message]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <FileSpreadsheet className="w-5 h-5 text-purple-600" />
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              Official Post-Event Participant Roster Import
            </h4>
            <p className="text-xs text-slate-500">
              Upload attendance list to establish the institutional source of truth for OD matching
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleParseCsv(sampleCsvTemplate)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-xs font-bold cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Load Standard Roster Format</span>
        </button>
      </div>

      {/* File Dropzone & Paste Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload box */}
        <div className="border-2 border-dashed border-slate-200 hover:border-purple-300 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-2 bg-slate-50/50 transition-colors">
          <Upload className="w-8 h-8 text-slate-400" />
          <div>
            <label className="cursor-pointer text-purple-700 font-bold hover:underline">
              Choose CSV or Excel file
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Standard comma-separated format (.csv)
            </p>
          </div>
        </div>

        {/* Quick paste box */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Or Paste CSV Text Directly:
          </label>
          <textarea
            value={csvText}
            onChange={(e) => handleParseCsv(e.target.value)}
            placeholder="Register Number,Name,Program,Year,Attendance..."
            rows={4}
            className="w-full text-[11px] font-mono border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Validation feedback */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Validation Errors Found:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{uploadSuccess}</span>
        </div>
      )}

      {/* Parsed Preview Table */}
      {parsedRows.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Table className="w-4 h-4 text-slate-500" />
              <span>Validated Preview ({parsedRows.length} Students)</span>
            </span>
            <button
              onClick={() => {
                setParsedRows([]);
                setCsvText("");
              }}
              className="text-rose-600 hover:text-rose-700 flex items-center space-x-1 text-[11px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-2 px-3">Reg No</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Program</th>
                  <th className="py-2 px-3">Year</th>
                  <th className="py-2 px-3">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">
                      {row.regNo}
                    </td>
                    <td className="py-2 px-3 font-medium">{row.studentName}</td>
                    <td className="py-2 px-3 text-slate-500">{row.program}</td>
                    <td className="py-2 px-3">{row.year}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.attendanceStatus === "PRESENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {row.attendanceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSubmitRoster}
              disabled={isUploading || validationErrors.length > 0}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <span>Importing & Syncing Roster...</span>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Commit Official Participant Roster</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

