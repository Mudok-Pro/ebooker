import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PageUploader from "./page-uploader";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookPagesPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!book) {
    notFound();
  }

  const { data: pages } = await supabase
    .from("book_pages")
    .select("id, page_number, image_url")
    .eq("book_id", id)
    .order("page_number", { ascending: true });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">صفحات: {book.title}</h1>
      <p className="mb-8 text-muted-foreground">
        ارفع صفحات الكتاب بصيغة JPG
      </p>

      <PageUploader bookId={book.id} existingPages={pages || []} />
    </div>
  );
}
