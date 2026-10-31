import { cookies, headers } from "next/headers";
import prisma from "./db";

export interface CurrentUserSession {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "CLUB" | "FACULTY" | "SWC";
  student?: {
    id: string;
    regNo: string;
    name: string;
    program: string;
    school: string;
    year: number;
    section: string;
    odHoursUsed: number;
    maxHours: number;
  } | null;
  club?: {
    id: string;
    name: string;
    code: string;
  } | null;
  facultyCoordinator?: {
    id: string;
    employeeId: string;
    name: string;
    department: string;
  } | null;
}

export async function getCurrentUser(): Promise<CurrentUserSession | null> {
  const cookieStore = cookies();
  const headerStore = headers();
  const userId =
    cookieStore.get("vit_od_user_id")?.value ||
    headerStore.get("x-user-id");

  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        facultyCoordinator: true,
        studentCoordinator: {
          include: { club: true },
        },
      },
    });
  }

  // Fallback to first student if not set
  if (!user) {
    user = await prisma.user.findFirst({
      where: { role: "STUDENT" },
      include: {
        student: true,
        facultyCoordinator: true,
        studentCoordinator: {
          include: { club: true },
        },
      },
    });
  }

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as any,
    student: user.student
      ? {
          id: user.student.id,
          regNo: user.student.regNo,
          name: user.student.name,
          program: user.student.program,
          school: user.student.school,
          year: user.student.year,
          section: user.student.section,
          odHoursUsed: user.student.odHoursUsed,
          maxHours: user.student.maxHours,
        }
      : null,
    club: user.studentCoordinator?.club
      ? {
          id: user.studentCoordinator.club.id,
          name: user.studentCoordinator.club.name,
          code: user.studentCoordinator.club.code,
        }
      : null,
    facultyCoordinator: user.facultyCoordinator
      ? {
          id: user.facultyCoordinator.id,
          employeeId: user.facultyCoordinator.employeeId,
          name: user.facultyCoordinator.name,
          department: user.facultyCoordinator.department,
        }
      : null,
  };
}

