import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        student: true,
        facultyCoordinator: {
          include: { clubs: true },
        },
        studentCoordinator: {
          include: { club: true },
        },
      },
      orderBy: { role: "asc" },
    });

    const personas = users.map((u) => {
      let description = "";
      if (u.role === "STUDENT" && u.student) {
        description = `${u.student.regNo} • ${u.student.school} • ${u.student.odHoursUsed}/${u.student.maxHours} hrs used`;
      } else if (u.role === "FACULTY" && u.facultyCoordinator) {
        description = `${u.facultyCoordinator.employeeId} • ${u.facultyCoordinator.department.split(" (")[0]}`;
      } else if (u.role === "CLUB" && u.studentCoordinator) {
        description = `Coordinator: ${u.studentCoordinator.club.name}`;
      } else if (u.role === "SWC") {
        description = "Director, Student Welfare Centre";
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        description,
        studentId: u.student?.id,
        regNo: u.student?.regNo,
      };
    });

    return NextResponse.json({ personas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

