"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export function PurchaseBookButton({
  bookId,
  bookTitle,
  buyerName,
}: {
  bookId: string;
  bookTitle?: string | null;
  buyerName?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePurchase() {
    setLoading(true);

    // open a blank popup synchronously to avoid popup blockers
    let popup: Window | null = null;
    if (typeof window !== "undefined") {
      try {
        popup = window.open("", "_blank");
      } catch {}
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const result = await response.json();

      if (!response.ok) {
        // close popup if opened
        try {
          popup?.close();
        } catch {}
        toast.error(result.error || "حدث خطأ أثناء إرسال الطلب");
        return;
      }

      // notify owner via WhatsApp (click-to-chat fallback)
      try {
        const ownerNumber =
          process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER || WHATSAPP_NUMBER;
        const orderId = result?.order?.id ?? "";
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const adminUrl = origin ? `${origin}/admin/orders` : "/admin/orders";

        const namePart = buyerName ? buyerName : "مستخدم";
        const titlePart = bookTitle ? bookTitle : bookId;
        const message = `${namePart} اريد شراء كتاب ${titlePart}`;

        if (ownerNumber) {
          const normalized = ownerNumber.replace(/[^+0-9]/g, "");
          const waLink = `https://wa.me/${normalized.replace(/^\\+/, "")}?text=${encodeURIComponent(
            message
          )}`;
          // navigate the previously opened popup (avoids popup blocking)
          if (popup) {
            try {
              popup.location.href = waLink;
            } catch {
              // if we can't set location (rare), open a new tab
              window.open(waLink, "_blank");
            }
          } else {
            window.open(waLink, "_blank");
          }
        } else {
          // no owner number configured; close popup if opened
          try {
            popup?.close();
          } catch {}
        }

        toast.success("تم إرسال طلبك بنجاح");
        router.refresh();
      } catch (e) {
        try {
          popup?.close();
        } catch {}
        toast.success("تم إرسال طلبك بنجاح");
        router.refresh();
      }
    } catch {
      try {
        popup?.close();
      } catch {}
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className="gap-2" onClick={handlePurchase} disabled={loading}>
      <ShoppingCart className="h-4 w-4" />
      {loading ? "جاري الإرسال..." : "اشترِ الآن"}
    </Button>
  );
}