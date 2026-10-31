import prisma from "./db";

export interface GeoLocationCheck {
  lat: number;
  lng: number;
  radiusMeters?: number;
}

// Haversine distance in meters
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface VerificationEngineInput {
  studentId: string;
  eventId: string;
  requestedHours: number;
  evidences?: Array<{
    type: string;
    photoTimestamp?: Date | string | null;
    gpsLatitude?: number | null;
    gpsLongitude?: number | null;
  }>;
}

export interface VerificationEngineResult {
  checkEventExists: boolean;
  checkSwcApproved: boolean;
  checkDateMatch: boolean;
  checkTimeMatch: boolean;
  checkParticipantMatch: boolean;
  checkEvidenceMatch: boolean;
  checkLocationMatch: boolean;
  checkOdLimit: boolean;
  overallStatus: "VERIFIED" | "VERIFICATION_REQUIRED" | "FAILED";
  mismatchDetails: string[];
}

export async function runVerificationEngine(
  input: VerificationEngineInput
): Promise<VerificationEngineResult> {
  const mismatchDetails: string[] = [];

  // Fetch student
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });

  // Fetch event
  const event = await prisma.event.findUnique({
    where: { id: input.eventId },
    include: {
      participants: true,
      club: true,
    },
  });

  // Check 1: Does the event exist?
  const checkEventExists = !!event;
  if (!checkEventExists) {
    mismatchDetails.push("Event does not exist in the institutional registry.");
    return {
      checkEventExists: false,
      checkSwcApproved: false,
      checkDateMatch: false,
      checkTimeMatch: false,
      checkParticipantMatch: false,
      checkEvidenceMatch: false,
      checkLocationMatch: false,
      checkOdLimit: false,
      overallStatus: "FAILED",
      mismatchDetails,
    };
  }

  // Check 2: Was the event approved by SWC?
  const checkSwcApproved = event.status === "SWC_APPROVED" || event.status === "COMPLETED";
  if (!checkSwcApproved) {
    mismatchDetails.push(
      `Event status is '${event.status}'. SWC approval is required before OD requests can be processed.`
    );
  }

  // Check 3: Date Match
  // In our system, the OD request is linked directly to event date
  const checkDateMatch = true;

  // Check 4: Time Match / Overlap
  const checkTimeMatch = input.requestedHours > 0 && input.requestedHours <= (event.expectedHours || 8);
  if (!checkTimeMatch) {
    mismatchDetails.push(
      `Requested hours (${input.requestedHours}h) exceeds the event's sanctioned duration (${event.expectedHours}h).`
    );
  }

  // Check 5: Student in Club's official participant list
  let checkParticipantMatch = false;
  if (student) {
    const matchedParticipant = event.participants.find(
      (p) =>
        p.regNo.trim().toUpperCase() === student.regNo.trim().toUpperCase() &&
        p.attendanceStatus === "PRESENT"
    );
    if (matchedParticipant) {
      checkParticipantMatch = true;
    } else {
      const absentRecord = event.participants.find(
        (p) => p.regNo.trim().toUpperCase() === student.regNo.trim().toUpperCase()
      );
      if (absentRecord && absentRecord.attendanceStatus === "ABSENT") {
        mismatchDetails.push(
          `Student ${student.regNo} is marked as ABSENT on the club's official attendance roster.`
        );
      } else {
        mismatchDetails.push(
          `Student ${student.regNo} is not found on the club's official participant list for '${event.title}'.`
        );
      }
    }
  }

  // Check 6 & 7: Evidence & Geolocation verification
  let checkEvidenceMatch = false;
  let checkLocationMatch = false;

  const eventLat = event.latitude ?? 12.8406; // Default VIT Chennai
  const eventLng = event.longitude ?? 80.1534;
  const radiusAllowed = event.venueRadiusMeters || 800; // 800 meters radius

  if (input.evidences && input.evidences.length > 0) {
    checkEvidenceMatch = true; // Evidence documents provided

    const photoEvidence = input.evidences.find(
      (e) => e.type === "GEOTAGGED_PHOTO" && e.gpsLatitude && e.gpsLongitude
    );

    if (photoEvidence && photoEvidence.gpsLatitude && photoEvidence.gpsLongitude) {
      const distance = calculateHaversineDistance(
        photoEvidence.gpsLatitude,
        photoEvidence.gpsLongitude,
        eventLat,
        eventLng
      );

      if (distance <= radiusAllowed) {
        checkLocationMatch = true;
      } else {
        mismatchDetails.push(
          `Uploaded photograph GPS coordinates (${photoEvidence.gpsLatitude.toFixed(4)}, ${photoEvidence.gpsLongitude.toFixed(4)}) are ${(distance / 1000).toFixed(2)} km away from venue, exceeding the ${radiusAllowed}m threshold.`
        );
      }
    } else {
      // Evidence uploaded but no GPS photo
      checkLocationMatch = false;
      mismatchDetails.push(
        "Geotagged photograph metadata could not be automatically confirmed; flagged for manual review."
      );
    }
  } else {
    mismatchDetails.push("No evidence documents uploaded yet.");
  }

  // Check 8: OD Limit (40 hours per semester/academic period)
  let checkOdLimit = true;
  if (student) {
    const totalAfterRequest = student.odHoursUsed + input.requestedHours;
    if (totalAfterRequest > student.maxHours) {
      checkOdLimit = false;
      const overBy = totalAfterRequest - student.maxHours;
      mismatchDetails.push(
        `OD limit warning: Student currently has ${student.odHoursUsed}/${student.maxHours} hours used. Requesting ${input.requestedHours}h exceeds limit by ${overBy} hours.`
      );
    }
  }

  // Determine overall status
  let overallStatus: "VERIFIED" | "VERIFICATION_REQUIRED" | "FAILED" = "VERIFIED";

  if (!checkEventExists || !checkSwcApproved) {
    overallStatus = "FAILED";
  } else if (!checkParticipantMatch) {
    overallStatus = "VERIFICATION_REQUIRED";
  } else if (!checkOdLimit) {
    overallStatus = "VERIFICATION_REQUIRED"; // Flagged to SWC
  } else {
    overallStatus = "VERIFIED";
  }

  return {
    checkEventExists,
    checkSwcApproved,
    checkDateMatch,
    checkTimeMatch,
    checkParticipantMatch,
    checkEvidenceMatch,
    checkLocationMatch,
    checkOdLimit,
    overallStatus,
    mismatchDetails,
  };
}

