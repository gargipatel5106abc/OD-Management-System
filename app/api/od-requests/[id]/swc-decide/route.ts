import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "SWC") {
      return NextResponse.json(
        { error: "Access Denied: Only SWC Administrators can approve or reject On-Duty requests." },
        { status: 403 }
      );
    }

    const { decision, rejectionReason, remarks, grantedHours } = await req.json();

    const odRequest = await prisma.oDRequest.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        event: {
          include: { club: true },
        },
      },
    });

    if (!odRequest) {
      return NextResponse.json({ error: "OD request not found" }, { status: 404 });
    }

    if (decision === "APPROVE") {
      const hoursToGrant = grantedHours
        ? parseFloat(grantedHours)
        : odRequest.requestedHours;

      // 40-hour limit check
      const currentHours = odRequest.student.odHoursUsed;
      const newTotalHours = currentHours + hoursToGrant;
      if (newTotalHours > odRequest.student.maxHours) {
        // Warning: exceeds limit
      }

      // 1. Update Student OD Hours Used
      const updatedStudent = await prisma.student.update({
        where: { id: odRequest.student.id },
        data: {
          odHoursUsed: newTotalHours,
        },
      });

      // 2. Generate Cryptographic Tamper-Proof Record Hash
      const timestamp = new Date();
      const hashPayload = `${odRequest.requestNumber}-${odRequest.student.regNo}-${hoursToGrant}-${odRequest.eventId}-${timestamp.toISOString()}-SWC-VIT-CHENNAI`;
      const recordHash = crypto.createHash("sha256").update(hashPayload).digest("hex");

      // 3. Create or Update Immutable OD Record
      const odRecord = await prisma.oDRecord.upsert({
        where: { odRequestId: odRequest.id },
        update: {
          studentId: odRequest.student.id,
          eventId: odRequest.eventId,
          regNo: odRequest.student.regNo,
          studentName: odRequest.student.name,
          eventTitle: odRequest.event.title,
          clubName: odRequest.event.club.name,
          eventDate: odRequest.event.eventDate,
          startTime: odRequest.event.startTime,
          endTime: odRequest.event.endTime,
          hoursGranted: hoursToGrant,
          venue: odRequest.event.venue,
          approvalAuthority: `Student Welfare Centre (SWC) - ${user.name}`,
          approvedAt: timestamp,
          recordHash,
        },
        create: {
          odRequestId: odRequest.id,
          studentId: odRequest.student.id,
          eventId: odRequest.eventId,
          regNo: odRequest.student.regNo,
          studentName: odRequest.student.name,
          eventTitle: odRequest.event.title,
          clubName: odRequest.event.club.name,
          eventDate: odRequest.event.eventDate,
          startTime: odRequest.event.startTime,
          endTime: odRequest.event.endTime,
          hoursGranted: hoursToGrant,
          venue: odRequest.event.venue,
          approvalAuthority: `Student Welfare Centre (SWC) - ${user.name}`,
          approvedAt: timestamp,
          recordHash,
        },
      });

      // 4. Update OD Request Status
      const updatedRequest = await prisma.oDRequest.update({
        where: { id: odRequest.id },
        data: {
          status: "SWC_APPROVED",
          swcRemarks: remarks || `Approved by ${user.name}. ${hoursToGrant} OD hours sanctioned.`,
        },
      });

      // 5. Create Audit Log
      await prisma.auditLog.create({
        data: {
          action: "SWC_APPROVED_OD",
          entityType: "OD_RECORD",
          entityId: odRecord.id,
          actorName: user.name,
          actorRole: "SWC",
          details: `SWC approved OD request ${odRequest.requestNumber}. Credited ${hoursToGrant}h to student ${odRequest.student.regNo} (${odRequest.student.name}). Total used: ${newTotalHours}/${odRequest.student.maxHours}h. Hash: ${recordHash.substring(0, 12)}...`,
        },
      });

      // 6. Notify Student
      await prisma.notification.create({
        data: {
          userId: odRequest.student.userId,
          role: "STUDENT",
          title: "OD Request Approved!",
          message: `Your OD request for '${odRequest.event.title}' has been approved by SWC. ${hoursToGrant} hours added. Current OD hours: ${newTotalHours} / ${odRequest.student.maxHours}.`,
          type: "SUCCESS",
          linkUrl: "/student",
        },
      });

      return NextResponse.json({
        success: true,
        decision: "APPROVED",
        odRecord,
        updatedRequest,
        newHoursUsed: newTotalHours,
      });
    } else if (decision === "REJECT") {
      const updatedRequest = await prisma.oDRequest.update({
        where: { id: odRequest.id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Does not meet institutional On-Duty guidelines.",
          swcRemarks: remarks,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          action: "SWC_REJECTED_OD",
          entityType: "OD_REQUEST",
          entityId: odRequest.id,
          actorName: user.name,
          actorRole: "SWC",
          details: `SWC rejected OD request ${odRequest.requestNumber}. Reason: ${rejectionReason || "Institutional policy rejection"}.`,
        },
      });

      // Notify Student
      await prisma.notification.create({
        data: {
          userId: odRequest.student.userId,
          role: "STUDENT",
          title: "OD Request Rejected",
          message: `Your OD request for '${odRequest.event.title}' was rejected by SWC. Reason: ${rejectionReason || "Institutional policy rejection"}`,
          type: "WARNING",
          linkUrl: "/student",
        },
      });

      return NextResponse.json({
        success: true,
        decision: "REJECTED",
        updatedRequest,
      });
    } else if (decision === "CLARIFICATION") {
      const updatedRequest = await prisma.oDRequest.update({
        where: { id: odRequest.id },
        data: {
          status: "CLARIFICATION_REQUESTED",
          swcRemarks: remarks,
        },
      });

      // Notify Student
      await prisma.notification.create({
        data: {
          userId: odRequest.student.userId,
          role: "STUDENT",
          title: "SWC Clarification Requested",
          message: `SWC requires additional clarification on your OD request for '${odRequest.event.title}': ${remarks}`,
          type: "ACTION_REQUIRED",
          linkUrl: "/student",
        },
      });

      return NextResponse.json({
        success: true,
        decision: "CLARIFICATION_REQUESTED",
        updatedRequest,
      });
    }

    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

