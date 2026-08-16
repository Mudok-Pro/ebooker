import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_NAME_AR } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/library");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-bold text-lg">
              {SITE_NAME_AR} - لوحة التحكم
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  الرئيسية
                </Button>
              </Link>
              <Link href="/admin/books">
                <Button variant="ghost" size="sm">
                  الكتب
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  الطلبات
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  المستخدمون
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/library">
              <Button variant="ghost" size="sm">
                المكتبة
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                خروج
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
