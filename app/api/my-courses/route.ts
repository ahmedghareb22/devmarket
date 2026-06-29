import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
      },
      include: {
        course: {
          include: {
            author: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const courses = enrollments.map((enrollment) => ({
      ...enrollment.course,
      enrollment: {
        progress: enrollment.progress,
        completedAt: enrollment.completedAt,
      },
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
