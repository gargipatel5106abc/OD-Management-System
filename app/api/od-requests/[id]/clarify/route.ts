import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { explanation, role } = await req.json();
    if (!explanation) {
      return NextResponse.json({ error: "Explanation required" }, { status: 400 });
    }

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

    const updateData: any = {};
    if (user.role === "STUDENT" || role === "STUDENT") {
      updateData.studentExplanation = explanation;
    } else if (user.role === "CLUB" || role === "CLUB") {
      updateData.clubExplanation = explanation;
    }

    const updated = await prisma.oDRequest.update({
      where: { id: params.id },
      data: updateData,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: "CLARIFICATION_SUBMITTED",
        entityType: "OD_REQUEST",
        entityId: odRequest.id,
        actorName: user.name,
        actorRole: user.role,
        details: `${user.role} submitted clarification response for mismatch on ${odRequest.requestNumber}.`,
      },
    });

    return NextResponse.json({ success: true, odRequest: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

