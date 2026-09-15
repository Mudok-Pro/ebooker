import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { logger } from "@/lib/logger";
import ReaderClient from "./reader-client";

interface Props {
  params: Promise<{ bookId: string }>;
}

export default async function ReaderPage({ params }: Props) {
  const { bookId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: access } = await supabase
    .from("user_books")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .single();

  if (!access) {
    notFound();
  }

  const { data: pages } = await supabase
    .from("book_pages")
    .select("id, page_number, image_url")
    .eq("book_id", bookId)
    .order("page_number", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: book } = await supabase
    .from("books")
    .select("title")
    .eq("id", bookId)
    .single();

  logger.info("Book reader loaded", {
    bookId,
    pageCount: pages?.length ?? 0,
    hasPurchaserProfile: Boolean(profile?.full_name && profile?.email),
  });

  if (!pages || pages.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <p className="mb-4 text-muted-foreground">لا توجد صفحات متاحة لهذا الكتاب بعد.</p>
        <Link href="/library">
          <Button variant="outline" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة إلى المكتبة
          </Button>
        </Link>
      </div>
    );
  }

  const pageEntries = pages.map((page) => ({
    id: page.id,
    page_number: page.page_number,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <ReaderClient
        pages={pageEntries}
        bookTitle={book?.title || "الكتاب"}
        userName={profile?.full_name || ""}
        userEmail={profile?.email || ""}
        bookId={bookId}
      />
    </div>
  );
}
