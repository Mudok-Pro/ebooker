import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

function parsePageNumberFromFilename(fileName: string): number | null {
  const normalized = fileName.toLowerCase();

  const possiblePatterns = [
    /page[-_\s]*(\d{1,4})/i,
    /(?:^|[^a-z0-9])(\d{1,4})(?:\.[a-z0-9]+)?$/i,
  ];

  for (const pattern of possiblePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const value = Number.parseInt(match[1], 10);
      if (Number.isFinite(value) && value > 0) {
        return value;
      }
    }
  }

  return null;
}

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

  const formData = await request.formData();
  const bookId = formData.get("book_id") as string;
  const singlePageNumber = parseInt(formData.get("page_number") as string, 10);
  const startPageNumber = parseInt(formData.get("start_page_number") as string, 10);
  const rawFiles = formData.getAll("files");
  const legacyFiles = formData.getAll("file");
  const files = rawFiles.length > 0 ? rawFiles : legacyFiles;

  if (!bookId || files.length === 0) {
    return NextResponse.json(
      { error: "book_id and file(s) are required" },
      { status: 400 }
    );
  }

  const fileEntries = files
    .filter((item): item is File => item instanceof File)
    .map((file, index) => {
      const filePageNumber = parsePageNumberFromFilename(file.name);
      const resolvedPageNumber =
        filePageNumber ??
        (!Number.isNaN(singlePageNumber) && files.length === 1
          ? singlePageNumber
          : !Number.isNaN(startPageNumber)
            ? startPageNumber + index
            : index + 1);

      return { file, pageNumber: resolvedPageNumber };
    });

  if (fileEntries.length === 0) {
    return NextResponse.json(
      { error: "No valid files were uploaded" },
      { status: 400 }
    );
  }

  const uploadedPages: { page_number: number; image_url: string }[] = [];

  for (const { file, pageNumber } of fileEntries) {
    const filePath = `${bookId}/page-${String(pageNumber).padStart(4, "0")}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("book-pages")
      .upload(filePath, file, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      logger.error("Failed to upload page", {
        error: uploadError.message,
        bookId,
        pageNumber,
      });
      return NextResponse.json(
        { error: `Failed to upload page ${pageNumber}` },
        { status: 500 }
      );
    }

    uploadedPages.push({
      page_number: pageNumber,
      image_url: filePath,
    });
  }

  const { error: dbError } = await supabase.from("book_pages").upsert(
    uploadedPages.map((page) => ({
      book_id: bookId,
      page_number: page.page_number,
      image_url: page.image_url,
    })),
    { onConflict: "book_id,page_number" }
  );

  if (dbError) {
    logger.error("Failed to save page records", { error: dbError.message, bookId });
    return NextResponse.json(
      { error: "Failed to save page records" },
      { status: 500 }
    );
  }

  logger.info("Pages uploaded", {
    bookId,
    count: uploadedPages.length,
    pageNumbers: uploadedPages.map((page) => page.page_number),
  });

  return NextResponse.json({ success: true, count: uploadedPages.length });
}
