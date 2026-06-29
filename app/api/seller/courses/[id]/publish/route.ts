import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course || course.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error publishing course:", error);
    return NextResponse.json(
      { error: "Failed to publish course" },
      { status: 500 }
    );
  }
}
