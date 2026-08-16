import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { buildBookPageRows } from "@/lib/book-pages";

export async function POST(request: NextRequest) {
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

  const { bookId } = await request.json().catch(() => ({ bookId: null }));

  if (!bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  const candidateFolders = [bookId, ""];
  const storagePaths: string[] = [];

  for (const folder of candidateFolders) {
    const { data: objects, error: listError } = await supabase.storage
      .from("book-pages")
      .list(folder, {
        limit: 1000,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) {
      continue;
    }

    for (const item of objects ?? []) {
      if (!item.name) continue;
      const fullPath = folder ? `${folder}/${item.name}` : item.name;
      storagePaths.push(fullPath);
    }
  }

  const rows = buildBookPageRows(bookId, storagePaths);

  if (rows.length === 0) {
    return NextResponse.json(
      { success: true, synced: 0, message: "No page files were found in the bucket" },
      { status: 200 }
    );
  }

  const { error: upsertError } = await supabase.from("book_pages").upsert(rows, {
    onConflict: "book_id,page_number",
  });

  if (upsertError) {
    return NextResponse.json(
      { error: "Failed to sync pages to database", details: upsertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    synced: rows.length,
    message: `Synced ${rows.length} pages`,
  });
}
