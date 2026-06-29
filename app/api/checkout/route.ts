import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { generateOrderNumber } from "@/lib/utils";

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
    const { courseIds } = body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
        courseId: { in: courseIds },
      },
      include: {
        course: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Create Stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.course.title,
          description: item.course.description,
          images: item.course.thumbnail ? [item.course.thumbnail] : [],
        },
        unit_amount: Math.round(Number(item.course.price) * 100),
      },
      quantity: 1,
    }));

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.course.price),
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        totalAmount,
        status: "PENDING",
        items: {
          create: cartItems.map((item) => ({
            courseId: item.courseId,
            price: item.course.price,
          })),
        },
      },
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      customer_email: session.user.email || undefined,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
    });

    // Update order with Stripe payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: checkoutSession.id },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
