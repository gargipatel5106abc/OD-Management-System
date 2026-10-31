import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const actorRole = searchParams.get("role");
    const entityType = searchParams.get("entityType");
    const search = searchParams.get("search");

    const where: any = {};
    if (actorRole) where.actorRole = actorRole;
    if (entityType) where.entityType = entityType;
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { actorName: { contains: search } },
        { details: { contains: search } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

