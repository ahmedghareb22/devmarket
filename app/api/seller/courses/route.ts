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

    const courses = await prisma.course.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stats = {
      totalCourses: courses.length,
      totalStudents: courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
      totalEarnings: courses.reduce(
        (sum, c) => sum + Number(c.price) * c.enrollmentCount,
        0
      ),
    };

    return NextResponse.json({ courses, stats });
  } catch (error) {
    console.error("Error fetching seller courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, price, category, level, thumbnail } = body;

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price,
        category,
        level,
        thumbnail,
        authorId: session.user.id,
        status: "DRAFT",
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
