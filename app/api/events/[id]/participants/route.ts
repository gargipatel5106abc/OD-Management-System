import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { runVerificationEngine } from "@/lib/verification";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId: params.id },
      orderBy: { regNo: "asc" },
    });
    return NextResponse.json({ participants });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { club: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const { participants, replaceAll } = body;

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: "Participant list must be a non-empty array" },
        { status: 400 }
      );
    }

    if (replaceAll) {
      await prisma.eventParticipant.deleteMany({
        where: { eventId: event.id },
      });
    }

    const inserted: any[] = [];
    for (const p of participants) {
      if (!p.regNo || !p.studentName) continue;

      const regNo = p.regNo.trim().toUpperCase();
      const existing = await prisma.eventParticipant.findUnique({
        where: {
          eventId_regNo: {
            eventId: event.id,
            regNo,
          },
        },
      });

      if (existing) {
        const updated = await prisma.eventParticipant.update({
          where: { id: existing.id },
          data: {
            studentName: p.studentName || existing.studentName,
            program: p.program || existing.program,
            year: p.year ? parseInt(p.year) : existing.year,
            section: p.section || existing.section,
            participationType: p.participationType || existing.participationType,
            attendanceStatus: p.attendanceStatus || existing.attendanceStatus,
            notes: p.notes || existing.notes,
          },
        });
        inserted.push(updated);
      } else {
        const created = await prisma.eventParticipant.create({
          data: {
            eventId: event.id,
            regNo,
            studentName: p.studentName,
            program: p.program || "B.Tech",
            year: p.year ? parseInt(p.year) : 3,
            section: p.section || "A",
            participationType: p.participationType || "PARTICIPANT",
            attendanceStatus: p.attendanceStatus || "PRESENT",
            addedBy: user.role === "FACULTY" ? "FACULTY_CORRECTION" : "CLUB",
            notes: p.notes || null,
          },
        });
        inserted.push(created);
      }
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: "CLUB_PARTICIPANT_LIST_UPLOADED",
        entityType: "PARTICIPANT_LIST",
        entityId: event.id,
        actorName: user.name,
        actorRole: user.role,
        details: `Uploaded/Updated ${inserted.length} participant records for event '${event.title}'.`,
      },
    });

    // Re-evaluate any pending OD requests for this event to see if any mismatches are resolved!
    const pendingRequests = await prisma.oDRequest.findMany({
      where: {
        eventId: event.id,
        status: { in: ["SUBMITTED", "VERIFICATION_REQUIRED"] },
      },
      include: {
        evidences: true,
      },
    });

    for (const reqItem of pendingRequests) {
      const verifyRes = await runVerificationEngine({
        studentId: reqItem.studentId,
        eventId: reqItem.eventId,
        requestedHours: reqItem.requestedHours,
        evidences: reqItem.evidences,
      });

      const newStatus =
        verifyRes.overallStatus === "VERIFIED"
          ? "AUTO_VERIFIED"
          : verifyRes.overallStatus === "VERIFICATION_REQUIRED"
          ? "VERIFICATION_REQUIRED"
          : "REJECTED";

      await prisma.oDRequest.update({
        where: { id: reqItem.id },
        data: { status: newStatus },
      });

      await prisma.verificationResult.upsert({
        where: { odRequestId: reqItem.id },
        update: {
          checkEventExists: verifyRes.checkEventExists,
          checkSwcApproved: verifyRes.checkSwcApproved,
          checkDateMatch: verifyRes.checkDateMatch,
          checkTimeMatch: verifyRes.checkTimeMatch,
          checkParticipantMatch: verifyRes.checkParticipantMatch,
          checkEvidenceMatch: verifyRes.checkEvidenceMatch,
          checkLocationMatch: verifyRes.checkLocationMatch,
          checkOdLimit: verifyRes.checkOdLimit,
          overallStatus: verifyRes.overallStatus,
          mismatchDetails:
            verifyRes.mismatchDetails.length > 0
              ? JSON.stringify(verifyRes.mismatchDetails)
              : null,
          verifiedAt: new Date(),
        },
        create: {
          odRequestId: reqItem.id,
          checkEventExists: verifyRes.checkEventExists,
          checkSwcApproved: verifyRes.checkSwcApproved,
          checkDateMatch: verifyRes.checkDateMatch,
          checkTimeMatch: verifyRes.checkTimeMatch,
          checkParticipantMatch: verifyRes.checkParticipantMatch,
          checkEvidenceMatch: verifyRes.checkEvidenceMatch,
          checkLocationMatch: verifyRes.checkLocationMatch,
          checkOdLimit: verifyRes.checkOdLimit,
          overallStatus: verifyRes.overallStatus,
          mismatchDetails:
            verifyRes.mismatchDetails.length > 0
              ? JSON.stringify(verifyRes.mismatchDetails)
              : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: inserted.length,
      participants: inserted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

