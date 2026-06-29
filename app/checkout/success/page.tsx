"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        const orderId = searchParams.get("order_id");

        if (!sessionId || !orderId) {
          setError("Invalid checkout session");
          setIsProcessing(false);
          return;
        }

        // Verify payment and complete order
        const response = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, orderId }),
        });

        if (!response.ok) {
          setError("Failed to process payment");
          setIsProcessing(false);
          return;
        }

        setIsProcessing(false);
      } catch (err) {
        console.error("Error processing payment:", err);
        setError("An error occurred while processing your payment");
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (isProcessing) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Processing your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">{error}</p>
        </div>
        <Link href="/cart">
          <Button>Return to Cart</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Payment Successful!
      </h1>
      <p className="text-gray-600 mb-8">
        Thank you for your purchase. You can now access your courses.
      </p>

      <div className="space-y-3">
        <Link href="/my-courses" className="block">
          <Button className="w-full" size="lg">
            View My Courses
          </Button>
        </Link>
        <Link href="/courses" className="block">
          <Button variant="outline" className="w-full" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
