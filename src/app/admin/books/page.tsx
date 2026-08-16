import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, Plus, FileImage } from "lucide-react";

function getBookCoverUrl(coverUrl: string | null) {
  if (!coverUrl) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/book-covers/${coverUrl}`;
}

export default async function AdminBooksPage() {
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الكتب</h1>
        <Link href="/admin/books/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة كتاب
          </Button>
        </Link>
      </div>

      {books && books.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const coverUrl = getBookCoverUrl(book.cover_url);
            return (
              <Card key={book.id}>
                {coverUrl ? (
                  <div className="overflow-hidden border-b">
                    <Image
                      src={coverUrl}
                      alt={book.title}
                      width={800}
                      height={500}
                      className="h-40 w-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
                <CardHeader>
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {book.description}
                  </p>
                  <p className="font-semibold">{book.price} DA</p>
                  <div className="flex gap-2">
                    <Link href={`/admin/books/${book.id}/pages`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileImage className="h-3 w-3" />
                        الصفحات
                      </Button>
                    </Link>
                    <Link href={`/admin/books/${book.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="h-3 w-3" />
                        تعديل
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            لا توجد كتب بعد. أضف كتاباً جديداً.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
