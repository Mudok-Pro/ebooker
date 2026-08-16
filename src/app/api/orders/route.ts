import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { bookId } = body;

  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .in("status", ["pending", "approved"])
    .single();

  if (existingOrder) {
    return NextResponse.json(
      {
        error:
          existingOrder.status === "approved"
            ? "You already have access to this book"
            : "You already have a pending order",
      },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({ user_id: user.id, book_id: bookId, status: "pending" })
    .select()
    .single();

  if (error) {
    logger.error("Failed to create order", { error: error.message });
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  logger.info("Order created", { orderId: data.id, userId: user.id, bookId });

  return NextResponse.json({ success: true, order: data });
}
