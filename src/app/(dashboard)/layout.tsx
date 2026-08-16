import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_NAME_AR } from "@/lib/constants";

export default async function DashboardLayout({
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
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/library" className="font-bold text-lg">
            {SITE_NAME_AR}
          </Link>
          <nav className="flex items-center gap-4">
            {profile?.role === "admin" && (
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  لوحة التحكم
                </Button>
              </Link>
            )}
            <Link href="/library">
              <Button variant="ghost" size="sm">
                مكتبتي
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                خروج
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
