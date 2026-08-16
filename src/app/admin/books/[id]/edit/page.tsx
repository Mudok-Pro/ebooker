import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditBookForm from "./edit-book-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <EditBookForm book={book} />
    </div>
  );
}
