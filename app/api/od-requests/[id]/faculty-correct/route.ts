import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { runVerificationEngine } from "@/lib/verification";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // STRICT AUTHORIZATION CHECK
    if (user.role !== "FACULTY") {
      return NextResponse.json(
        {
          error:
            "Access Denied: Only a verified Faculty Coordinator is authorized to submit official participant corrections after a roster mismatch.",
        },
        { status: 403 }
      );
    }

    const { correctionNotes, addStudentToRoster, program, year, section } =
      await req.json();

    const odRequest = await prisma.oDRequest.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        event: {
          include: { club: true },
        },
        evidences: true,
      },
    });

    if (!odRequest) {
      return NextResponse.json({ error: "OD request not found" }, { status: 404 });
    }

    // Add or update student on event official participant list
    if (addStudentToRoster !== false) {
      const regNo = odRequest.student.regNo.trim().toUpperCase();
      const existing = await prisma.eventParticipant.findUnique({
        where: {
          eventId_regNo: {
            eventId: odRequest.eventId,
            regNo,
          },
        },
      });

      if (existing) {
        await prisma.eventParticipant.update({
          where: { id: existing.id },
          data: {
            attendanceStatus: "PRESENT",
            addedBy: "FACULTY_CORRECTION",
            notes: `Authorized by Faculty Coordinator: ${user.name}. ${correctionNotes || ""}`,
          },
        });
      } else {
        await prisma.eventParticipant.create({
          data: {
            eventId: odRequest.eventId,
            regNo,
            studentName: odRequest.student.name,
            program: program || odRequest.student.program,
            year: year ? parseInt(year) : odRequest.student.year,
            section: section || odRequest.student.section,
            participationType: "PARTICIPANT",
            attendanceStatus: "PRESENT",
            addedBy: "FACULTY_CORRECTION",
            notes: `Added via Faculty Roster Correction by ${user.name}. Notes: ${correctionNotes || ""}`,
          },
        });
      }
    }

    // Re-run Verification Engine now that student is officially registered
    const verifyRes = await runVerificationEngine({
      studentId: odRequest.studentId,
      eventId: odRequest.eventId,
      requestedHours: odRequest.requestedHours,
      evidences: odRequest.evidences,
    });

    const newStatus =
      verifyRes.overallStatus === "VERIFIED"
        ? "AUTO_VERIFIED"
        : "VERIFICATION_REQUIRED";

    // Update OD Request
    const updatedRequest = await prisma.oDRequest.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        facultyCorrectionNotes: correctionNotes,
        facultyCorrectedAt: new Date(),
      },
      include: {
        student: true,
        event: true,
      },
    });

    // Update Verification Result
    await prisma.verificationResult.upsert({
      where: { odRequestId: odRequest.id },
      update: {
        checkParticipantMatch: true,
        overallStatus: verifyRes.overallStatus,
        mismatchDetails:
          verifyRes.mismatchDetails.length > 0
            ? JSON.stringify(verifyRes.mismatchDetails)
            : null,
        verifiedAt: new Date(),
      },
      create: {
        odRequestId: odRequest.id,
        checkEventExists: true,
        checkSwcApproved: true,
        checkDateMatch: true,
        checkTimeMatch: true,
        checkParticipantMatch: true,
        checkEvidenceMatch: verifyRes.checkEvidenceMatch,
        checkLocationMatch: verifyRes.checkLocationMatch,
        checkOdLimit: verifyRes.checkOdLimit,
        overallStatus: verifyRes.overallStatus,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: "FACULTY_CORRECTION_SUBMITTED",
        entityType: "OD_REQUEST",
        entityId: odRequest.id,
        actorName: user.name,
        actorRole: "FACULTY",
        details: `Faculty Coordinator ${user.name} submitted official roster correction for student ${odRequest.student.regNo}. Request moved to ${newStatus}.`,
      },
    });

    // Notify SWC that corrected submission is ready
    const swcUsers = await prisma.user.findMany({ where: { role: "SWC" } });
    for (const swc of swcUsers) {
      await prisma.notification.create({
        data: {
          userId: swc.id,
          role: "SWC",
          title: "Faculty Corrected Roster Submitted",
          message: `Faculty Coordinator ${user.name} verified & added ${odRequest.student.name} (${odRequest.student.regNo}) for '${odRequest.event.title}'. Ready for SWC sign-off.`,
          type: "INFO",
          linkUrl: "/swc",
        },
      });
    }

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: odRequest.student.userId,
        role: "STUDENT",
        title: "Faculty Coordinator Verified Roster",
        message: `Your OD request for '${odRequest.event.title}' was reviewed and verified by Faculty Coordinator ${user.name}. Sent to SWC for final sign-off.`,
        type: "SUCCESS",
        linkUrl: "/student",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Participant verification corrected and submitted to SWC.",
      odRequest: updatedRequest,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

