import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const clubId = searchParams.get("clubId");
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const where: any = {};
    if (status) where.status = status;
    if (clubId) where.clubId = clubId;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { eventCode: { contains: search } },
        { venue: { contains: search } },
        { club: { name: { contains: search } } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        club: {
          include: {
            facultyCoordinator: true,
          },
        },
        participants: true,
        _count: {
          select: {
            participants: true,
            odRequests: true,
          },
        },
      },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({ events });
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
    const {
      title,
      clubId,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      expectedHours,
      venue,
      expectedParticipants,
      reasonOD,
      proposalDocUrl,
      posterUrl,
    } = body;

    if (!title || !clubId || !eventDate || !startTime || !endTime || !venue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const count = await prisma.event.count();
    const eventCode = `EVT-2026-${(count + 1).toString().padStart(3, "0")}`;

    const newEvent = await prisma.event.create({
      data: {
        title,
        eventCode,
        clubId,
        description: description || "Club activity requiring student On-Duty support.",
        category: category || "TECHNICAL",
        eventDate,
        startTime,
        endTime,
        expectedHours: parseFloat(expectedHours) || 6,
        venue,
        latitude: 12.8406,
        longitude: 80.1534,
        venueRadiusMeters: 600,
        expectedParticipants: parseInt(expectedParticipants) || 50,
        reasonOD: reasonOD || "Student participation in college-sanctioned event.",
        status: "PENDING_SWC",
        proposalDocUrl,
        posterUrl,
      },
      include: {
        club: true,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: "EVENT_PROPOSAL_SUBMITTED",
        entityType: "EVENT",
        entityId: newEvent.id,
        actorName: user.name,
        actorRole: user.role,
        details: `Submitted OD proposal for '${newEvent.title}' (${newEvent.expectedHours}h OD). Status: PENDING_SWC.`,
      },
    });

    // Notify SWC
    const swcUsers = await prisma.user.findMany({ where: { role: "SWC" } });
    for (const swc of swcUsers) {
      await prisma.notification.create({
        data: {
          userId: swc.id,
          role: "SWC",
          title: "New Event OD Proposal",
          message: `${newEvent.club.name} has submitted an OD proposal for '${newEvent.title}'. Review required.`,
          type: "ACTION_REQUIRED",
          linkUrl: "/swc",
        },
      });
    }

    return NextResponse.json({ event: newEvent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

