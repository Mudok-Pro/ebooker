import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ApproveRejectButtons from "./approve-reject-buttons";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      created_at,
      profiles:user_id (full_name, email),
      books:book_id (title)
    `
    )
    .order("created_at", { ascending: false });

  type OrderRow = {
    id: string;
    status: string;
    created_at: string;
    profiles: { full_name: string; email: string } | null;
    books: { title: string } | null;
  };

  const typedOrders = (orders ?? []) as unknown as OrderRow[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">إدارة الطلبات</h1>

      {typedOrders.length > 0 ? (
        <div className="space-y-4">
          {typedOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold">
                    {order.profiles?.full_name || "غير معروف"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.profiles?.email}
                  </p>
                  <p className="text-sm">
                    الكتاب: {order.books?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("ar-DZ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      order.status === "approved"
                        ? "default"
                        : order.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {order.status === "approved"
                      ? "مقبول"
                      : order.status === "rejected"
                      ? "مرفوض"
                      : "معلّق"}
                  </Badge>
                  {order.status === "pending" && (
                    <ApproveRejectButtons orderId={order.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            لا توجد طلبات بعد.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
