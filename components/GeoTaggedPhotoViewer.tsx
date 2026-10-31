"use client";

import React from "react";
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Compass,
  Crosshair,
} from "lucide-react";

interface GeoPhotoProps {
  evidence: {
    title: string;
    fileName: string;
    fileUrl: string;
    gpsLatitude?: number | null;
    gpsLongitude?: number | null;
    photoTimestamp?: string | Date | null;
    photoLocationName?: string | null;
    isGeoVerified?: boolean;
    geoVerificationNotes?: string | null;
  };
  eventInfo: {
    title: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    latitude?: number | null;
    longitude?: number | null;
    venueRadiusMeters?: number | null;
  };
}

export default function GeoTaggedPhotoViewer({
  evidence,
  eventInfo,
}: GeoPhotoProps) {
  const hasGps = evidence.gpsLatitude && evidence.gpsLongitude;
  const isVerified = evidence.isGeoVerified;

  const formattedPhotoDate = evidence.photoTimestamp
    ? new Date(evidence.photoTimestamp).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Metadata not present";

  const formattedPhotoTime = evidence.photoTimestamp
    ? new Date(evidence.photoTimestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Metadata not present";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800">
            Geo-Tagged Photograph Verification
          </h4>
        </div>

        {isVerified ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Photo Metadata Matches Event
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Manual Geo-Verification Required
          </span>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Simulated Visual Image Preview with GPS overlay */}
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-950 text-white min-h-[190px] flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider bg-black/60 px-2 py-0.5 rounded border border-white/20 uppercase">
              EXIF Geo-Telemetry Log
            </span>
            <div className="flex items-center space-x-1 text-emerald-400 text-xs">
              <Crosshair className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[11px] font-mono">GPS LOCK</span>
            </div>
          </div>

          <div className="text-center my-3">
            <Camera className="w-10 h-10 mx-auto text-blue-300 opacity-80 mb-1" />
            <p className="text-xs font-semibold text-slate-100 truncate">
              {evidence.title}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {evidence.fileName}
            </p>
          </div>

          {/* GPS telemetry HUD */}
          <div className="bg-black/60 backdrop-blur-xs rounded p-2 text-[11px] font-mono border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-blue-200">
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-red-400" />
                {evidence.photoLocationName || "VIT Chennai Campus (Kelambakkam)"}
              </span>
            </div>
            {hasGps && (
              <div className="flex items-center justify-between text-slate-300 text-[10px]">
                <span>LAT: {evidence.gpsLatitude?.toFixed(4)}° N</span>
                <span>LON: {evidence.gpsLongitude?.toFixed(4)}° E</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Comparative Event vs Uploaded Metadata Table */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="space-y-2 text-xs">
            {/* Official Event Parameters */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Official Event Sanctioned Parameters
              </p>
              <div className="space-y-1 text-slate-700">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Date: {eventInfo.eventDate}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Time Window: {eventInfo.startTime} – {eventInfo.endTime}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">Venue: {eventInfo.venue}</span>
                </div>
              </div>
            </div>

            {/* Extracted Photo Metadata */}
            <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                Extracted Photograph Metadata
              </p>
              <div className="space-y-1 text-slate-800">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Photo Date: {formattedPhotoDate}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Photo Time: {formattedPhotoTime}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Radius:{" "}
                    {isVerified
                      ? "Within 25 meters of official venue perimeter"
                      : "Outside or missing metadata"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Notes */}
          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
            {evidence.geoVerificationNotes ? (
              <p>
                <strong className="text-slate-800">System Note:</strong>{" "}
                {evidence.geoVerificationNotes}
              </p>
            ) : (
              <p className="italic text-slate-400">
                No automated distance warnings.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

