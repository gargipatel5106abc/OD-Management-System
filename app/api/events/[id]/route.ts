import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        club: {
          include: {
            facultyCoordinator: true,
          },
        },
        participants: {
          orderBy: { regNo: "asc" },
        },
        odRequests: {
          include: {
            student: true,
            verificationResult: true,
            odRecord: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, swcRemarks } = body;

    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      include: { club: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        status: status || existingEvent.status,
        swcRemarks: swcRemarks !== undefined ? swcRemarks : existingEvent.swcRemarks,
        approvedAt: status === "SWC_APPROVED" ? new Date() : existingEvent.approvedAt,
      },
      include: { club: true },
    });

    // Create Audit Log
    const action =
      status === "SWC_APPROVED"
        ? "SWC_EVENT_APPROVED"
        : status === "SWC_REJECTED"
        ? "SWC_EVENT_REJECTED"
        : "EVENT_UPDATED";

    await prisma.auditLog.create({
      data: {
        action,
        entityType: "EVENT",
        entityId: updatedEvent.id,
        actorName: user.name,
        actorRole: user.role,
        details: `Event '${updatedEvent.title}' status updated to ${status}. Remarks: ${swcRemarks || "None"}`,
      },
    });

    // Notify club coordinators
    const clubCoords = await prisma.user.findMany({
      where: {
        studentCoordinator: {
          clubId: updatedEvent.clubId,
        },
      },
    });

    for (const coord of clubCoords) {
      await prisma.notification.create({
        data: {
          userId: coord.id,
          role: "CLUB",
          title: `Event OD Status: ${status === "SWC_APPROVED" ? "Approved" : "Updated"}`,
          message: `SWC has updated the status of '${updatedEvent.title}' to ${status}. ${swcRemarks ? `Remarks: ${swcRemarks}` : ""}`,
          type: status === "SWC_APPROVED" ? "SUCCESS" : "WARNING",
          linkUrl: "/club",
        },
      });
    }

    return NextResponse.json({ event: updatedEvent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

