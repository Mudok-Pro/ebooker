import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

function getBodyOrFormData(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    return request.formData();
  }

  return request.json();
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

  const payload = await getBodyOrFormData(request);
  const formData = payload instanceof FormData ? payload : null;

  const title = formData ? (formData.get("title") as string | null) : payload?.title;
  const description = formData ? (formData.get("description") as string | null) : payload?.description;
  const price = formData ? Number(formData.get("price")) : Number(payload?.price);
  const isPublished = formData ? formData.get("is_published") !== null ? formData.get("is_published") === "true" : true : payload?.is_published ?? true;
  const coverFile = formData ? (formData.get("cover") as File | null) : null;

  if (!title || Number.isNaN(price)) {
    return NextResponse.json(
      { error: "Title and price are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("books")
    .insert({
      title,
      description: description || null,
      price,
      cover_url: null,
      is_published: Boolean(isPublished),
    })
    .select()
    .single();

  if (error) {
    logger.error("Failed to create book", { error: error.message });
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }

  if (coverFile && coverFile.size > 0) {
    const extension = (coverFile.name.split(".").pop() || "jpg").toLowerCase();
    const coverPath = `${data.id}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(coverPath, coverFile, {
        contentType: coverFile.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      logger.error("Failed to upload cover", { error: uploadError.message, bookId: data.id });
      return NextResponse.json({ error: "Failed to upload cover" }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("books")
      .update({ cover_url: coverPath })
      .eq("id", data.id);

    if (updateError) {
      logger.error("Failed to save cover URL", { error: updateError.message, bookId: data.id });
      return NextResponse.json({ error: "Failed to save cover" }, { status: 500 });
    }
  }

  logger.info("Book created", { bookId: data.id, title });

  return NextResponse.json({ success: true, book: { ...data, cover_url: data.cover_url ?? null } });
}

export async function PATCH(request: NextRequest) {
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

  const payload = await getBodyOrFormData(request);
  const formData = payload instanceof FormData ? payload : null;
  const id = formData ? (formData.get("id") as string | null) : payload?.id;
  const title = formData ? (formData.get("title") as string | null) : payload?.title;
  const description = formData ? (formData.get("description") as string | null) : payload?.description;
  const price = formData ? Number(formData.get("price")) : Number(payload?.price);
  const isPublished = formData ? formData.get("is_published") !== null ? formData.get("is_published") === "true" : undefined : payload?.is_published;
  const coverFile = formData ? (formData.get("cover") as File | null) : null;

  if (!id) {
    return NextResponse.json({ error: "Book ID required" }, { status: 400 });
  }

  const updates: Record<string, string | number | boolean | null> = {};

  if (title) updates.title = title;
  if (description !== undefined) updates.description = description || null;
  if (!Number.isNaN(price)) updates.price = price;
  if (isPublished !== undefined) updates.is_published = Boolean(isPublished);

  const { error } = await supabase.from("books").update(updates).eq("id", id);

  if (error) {
    logger.error("Failed to update book", { error: error.message });
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  if (coverFile && coverFile.size > 0) {
    const extension = (coverFile.name.split(".").pop() || "jpg").toLowerCase();
    const coverPath = `${id}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(coverPath, coverFile, {
        contentType: coverFile.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      logger.error("Failed to upload cover", { error: uploadError.message, bookId: id });
      return NextResponse.json({ error: "Failed to upload cover" }, { status: 500 });
    }

    const { error: updateCoverError } = await supabase
      .from("books")
      .update({ cover_url: coverPath })
      .eq("id", id);

    if (updateCoverError) {
      logger.error("Failed to save cover URL", { error: updateCoverError.message, bookId: id });
      return NextResponse.json({ error: "Failed to save cover" }, { status: 500 });
    }
  }

  logger.info("Book updated", { bookId: id });

  return NextResponse.json({ success: true });
}
