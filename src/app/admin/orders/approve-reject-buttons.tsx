"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function ApproveRejectButtons({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function handleAction(status: "approved" | "rejected") {
    setLoading(status === "approved" ? "approve" : "reject");

    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });

    if (res.ok) {
      router.refresh();
    }
    setLoading(null);
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        className="gap-1 text-green-600"
        disabled={loading !== null}
        onClick={() => handleAction("approved")}
      >
        <Check className="h-3 w-3" />
        {loading === "approve" ? "..." : "قبول"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1 text-red-600"
        disabled={loading !== null}
        onClick={() => handleAction("rejected")}
      >
        <X className="h-3 w-3" />
        {loading === "reject" ? "..." : "رفض"}
      </Button>
    </div>
  );
}
