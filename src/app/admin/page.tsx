import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, ShoppingCart, FileImage } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: booksCount },
    { count: usersCount },
    { count: pendingOrders },
    { count: totalOrders },
  ] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      title: "الكتب",
      value: booksCount ?? 0,
      icon: BookOpen,
      href: "/admin/books",
    },
    {
      title: "المستخدمون",
      value: usersCount ?? 0,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "طلبات معلّقة",
      value: pendingOrders ?? 0,
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      title: "إجمالي الطلبات",
      value: totalOrders ?? 0,
      icon: FileImage,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">لوحة التحكم</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
