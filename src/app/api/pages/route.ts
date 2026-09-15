import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");
  const pageNumber = searchParams.get("pageNumber");

  if (!bookId || !pageNumber) {
    return NextResponse.json(
      { error: "bookId and pageNumber required" },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    const { data: access } = await supabase
      .from("user_books")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();

    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const requestedPageNumber = parseInt(pageNumber, 10);
  if (!Number.isInteger(requestedPageNumber) || requestedPageNumber < 1) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  const { data: page, error } = await supabase
    .from("book_pages")
    .select("image_url")
    .eq("book_id", bookId)
    .eq("page_number", requestedPageNumber)
    .maybeSingle();

  let filePath = page?.image_url;

  if (error || !filePath) {
    const { data: objects, error: listError } = await supabase.storage
      .from("book-pages")
      .list(bookId, {
        limit: 1000,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (!listError && objects) {
      const exactMatch = objects.find((item) => {
        if (!item.name) return false;
        const normalized = item.name.toLowerCase();
        const pageMatch = normalized.match(
          /(?:^|[^a-z0-9])page[-_\s]*(\d{1,4})(?:\.[a-z0-9]+)?$/i
        );
        return pageMatch?.[1]
          ? Number.parseInt(pageMatch[1], 10) === requestedPageNumber
          : false;
      });

      if (exactMatch) {
        filePath = `${bookId}/${exactMatch.name}`;
      }
    }
  }

  if (!filePath) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const { data: signedUrl, error: signError } = await supabase.storage
    .from("book-pages")
    .createSignedUrl(filePath, 60 * 15);

  if (signError) {
    return NextResponse.json(
      { error: "Failed to generate URL" },
      { status: 500 }
    );
  }

  const response = NextResponse.redirect(signedUrl.signedUrl, 307);
  response.headers.set(
    "Cache-Control",
    "private, max-age=900"
  );
  response.headers.set("Content-Disposition", "inline");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}
