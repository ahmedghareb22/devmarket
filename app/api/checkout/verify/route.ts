import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-06-24.dahlia",
});

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
    const { sessionId, orderId } = body;

    // Verify with Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
      },
      include: {
        items: true,
      },
    });

    // Create enrollments for each course
    for (const item of order.items) {
      await prisma.enrollment.create({
        data: {
          studentId: session.user.id,
          courseId: item.courseId,
        },
      });

      // Update course enrollment count
      await prisma.course.update({
        where: { id: item.courseId },
        data: {
          enrollmentCount: {
            increment: 1,
          },
        },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
        courseId: { in: order.items.map((item) => item.courseId) },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying checkout:", error);
    return NextResponse.json(
      { error: "Failed to verify checkout" },
      { status: 500 }
    );
  }
}
