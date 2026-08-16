import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { orderId, status } = body;

  if (!orderId || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("user_id, book_id")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (updateError) {
    logger.error("Failed to update order", { error: updateError.message });
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  if (status === "approved") {
    const { error: grantError } = await supabase.from("user_books").insert({
      user_id: order.user_id,
      book_id: order.book_id,
    });

    if (grantError) {
      logger.error("Failed to grant access", { error: grantError.message });
    }
  }

  logger.info("Order updated", { orderId, status });

  return NextResponse.json({ success: true });
}
