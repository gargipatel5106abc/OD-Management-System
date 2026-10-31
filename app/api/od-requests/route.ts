import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { runVerificationEngine } from "@/lib/verification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { requestNumber: { contains: search } },
        { student: { name: { contains: search } } },
        { student: { regNo: { contains: search } } },
        { event: { title: { contains: search } } },
        { event: { club: { name: { contains: search } } } },
      ];
    }

    const odRequests = await prisma.oDRequest.findMany({
      where,
      include: {
        student: true,
        event: {
          include: {
            club: {
              include: {
                facultyCoordinator: true,
              },
            },
          },
        },
        evidences: true,
        verificationResult: true,
        odRecord: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ odRequests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, eventId, reason, requestedHours, evidences } = body;

    // Student identity resolution
    let effectiveStudentId = studentId;
    if (user.role === "STUDENT" && user.student) {
      effectiveStudentId = user.student.id;
    }

    const student = await prisma.student.findUnique({
      where: { id: effectiveStudentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const reqCount = await prisma.oDRequest.count();
    const requestNumber = `OD-2026-${(reqCount + 1001).toString()}`;
    const hours = parseFloat(requestedHours) || event.expectedHours || 6;

    // 1. Create OD request
    const odRequest = await prisma.oDRequest.create({
      data: {
        requestNumber,
        studentId: student.id,
        eventId: event.id,
        reason: reason || "Participated in approved college activity.",
        status: "SUBMITTED",
        requestedHours: hours,
      },
    });

    // 2. Insert Evidence files if provided
    const insertedEvidences: any[] = [];
    if (Array.isArray(evidences)) {
      for (const ev of evidences) {
        const createdEvidence = await prisma.evidence.create({
          data: {
            odRequestId: odRequest.id,
            type: ev.type || "OTHER",
            title: ev.title || "Supporting Document",
            fileName: ev.fileName || "evidence.pdf",
            fileUrl: ev.fileUrl || "/evidence/sample.pdf",
            fileSize: ev.fileSize || "1.2 MB",
            mimeType: ev.mimeType || "application/pdf",
            gpsLatitude: ev.gpsLatitude ? parseFloat(ev.gpsLatitude) : null,
            gpsLongitude: ev.gpsLongitude ? parseFloat(ev.gpsLongitude) : null,
            photoTimestamp: ev.photoTimestamp ? new Date(ev.photoTimestamp) : null,
            photoLocationName: ev.photoLocationName || null,
            isGeoVerified: ev.isGeoVerified || false,
            geoVerificationNotes: ev.geoVerificationNotes || null,
          },
        });
        insertedEvidences.push(createdEvidence);
      }
    }

    // 3. Execute Verification Engine
    const verification = await runVerificationEngine({
      studentId: student.id,
      eventId: event.id,
      requestedHours: hours,
      evidences: insertedEvidences,
    });

    const finalStatus =
      verification.overallStatus === "VERIFIED"
        ? "AUTO_VERIFIED"
        : verification.overallStatus === "VERIFICATION_REQUIRED"
        ? "VERIFICATION_REQUIRED"
        : "REJECTED";

    // 4. Update request status
    const updatedRequest = await prisma.oDRequest.update({
      where: { id: odRequest.id },
      data: { status: finalStatus },
      include: {
        student: true,
        event: {
          include: {
            club: true,
          },
        },
        evidences: true,
      },
    });

    // 5. Save Verification Result Record
    const verificationRecord = await prisma.verificationResult.create({
      data: {
        odRequestId: odRequest.id,
        checkEventExists: verification.checkEventExists,
        checkSwcApproved: verification.checkSwcApproved,
        checkDateMatch: verification.checkDateMatch,
        checkTimeMatch: verification.checkTimeMatch,
        checkParticipantMatch: verification.checkParticipantMatch,
        checkEvidenceMatch: verification.checkEvidenceMatch,
        checkLocationMatch: verification.checkLocationMatch,
        checkOdLimit: verification.checkOdLimit,
        overallStatus: verification.overallStatus,
        mismatchDetails:
          verification.mismatchDetails.length > 0
            ? JSON.stringify(verification.mismatchDetails)
            : null,
      },
    });

    // 6. Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: "OD_REQUEST_SUBMITTED",
        entityType: "OD_REQUEST",
        entityId: odRequest.id,
        actorName: student.name,
        actorRole: "STUDENT",
        details: `OD request ${requestNumber} submitted for '${event.title}' (${hours}h). Verification Status: ${finalStatus}.`,
      },
    });

    // 7. Route Notifications based on verification outcome
    if (finalStatus === "AUTO_VERIFIED") {
      // Notify SWC
      const swcUsers = await prisma.user.findMany({ where: { role: "SWC" } });
      for (const swc of swcUsers) {
        await prisma.notification.create({
          data: {
            userId: swc.id,
            role: "SWC",
            title: "OD Request Verified",
            message: `${student.name} (${student.regNo}) is eligible for ${hours}h OD update for '${event.title}'.`,
            type: "INFO",
            linkUrl: "/swc",
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId: student.userId,
          role: "STUDENT",
          title: "OD Request Auto-Verified",
          message: `Your OD request for '${event.title}' passed automated verification and is queued for SWC sign-off.`,
          type: "SUCCESS",
          linkUrl: "/student",
        },
      });
    } else if (finalStatus === "VERIFICATION_REQUIRED") {
      // Participant Mismatch Notification Workflow
      await prisma.auditLog.create({
        data: {
          action: "MISMATCH_DETECTED",
          entityType: "OD_REQUEST",
          entityId: odRequest.id,
          actorName: "Verification Engine",
          actorRole: "SYSTEM",
          details: `Participant mismatch detected: ${verification.mismatchDetails.join("; ")}`,
        },
      });

      // Notify Student
      await prisma.notification.create({
        data: {
          userId: student.userId,
          role: "STUDENT",
          title: "Clarification Required: Participant Mismatch",
          message: `Your request for '${event.title}' could not be automatically matched with the club roster. Please provide clarification.`,
          type: "WARNING",
          linkUrl: "/student",
        },
      });

      // Notify Club Coordinators
      const clubCoords = await prisma.user.findMany({
        where: {
          studentCoordinator: { clubId: event.clubId },
        },
      });
      for (const c of clubCoords) {
        await prisma.notification.create({
          data: {
            userId: c.id,
            role: "CLUB",
            title: "Participant Roster Mismatch Reported",
            message: `Student ${student.regNo} applied for '${event.title}' but was not found on your official participant list.`,
            type: "WARNING",
            linkUrl: "/club",
          },
        });
      }

      // Notify Faculty Coordinator
      const facultyUser = await prisma.user.findFirst({
        where: {
          facultyCoordinator: {
            clubs: { some: { id: event.clubId } },
          },
        },
      });
      if (facultyUser) {
        await prisma.notification.create({
          data: {
            userId: facultyUser.id,
            role: "FACULTY",
            title: "Participant Mismatch Requires Faculty Correction",
            message: `Student ${student.regNo} reported an omission for '${event.title}'. Faculty sign-off required to correct roster.`,
            type: "ACTION_REQUIRED",
            linkUrl: "/faculty",
          },
        });
      }
    }

    return NextResponse.json({
      odRequest: updatedRequest,
      verification: verificationRecord,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

