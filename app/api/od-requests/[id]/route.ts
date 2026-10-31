import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const odRequest = await prisma.oDRequest.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        event: {
          include: {
            club: {
              include: {
                facultyCoordinator: true,
              },
            },
            participants: true,
          },
        },
        evidences: true,
        verificationResult: true,
        odRecord: true,
      },
    });

    if (!odRequest) {
      return NextResponse.json({ error: "OD Request not found" }, { status: 404 });
    }

    return NextResponse.json({ odRequest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

