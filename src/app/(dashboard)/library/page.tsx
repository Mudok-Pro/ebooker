import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BOOK_TITLE_AR } from "@/lib/constants";
import { BookOpen, ExternalLink } from "lucide-react";
import { PurchaseBookButton } from "./purchase-book-button";

function getBookCoverUrl(coverUrl: string | null) {
  if (!coverUrl) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/book-covers/${coverUrl}`;
}

export default async function LibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("id, granted_at, books(id, title, description, cover_url, price)")
    .eq("user_id", user!.id);

  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("id, status, book_id")
    .eq("user_id", user!.id)
    .eq("status", "pending");

  const pendingBookIds = pendingOrders?.map((o) => o.book_id) ?? [];
  const { data: pendingBooks } = pendingBookIds.length > 0
    ? await supabase.from("books").select("id, title").in("id", pendingBookIds)
    : { data: [] as { id: string; title: string }[] };
  const pendingBooksMap = new Map(pendingBooks?.map((b) => [b.id, b.title]) ?? []);

  const { data: books } = await supabase
    .from("books")
    .select("id, title, description, cover_url, price")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const ownedBookIds = new Set(
    (userBooks ?? [])
      .map((userBook) => (userBook.books as unknown as { id: string } | null)?.id)
      .filter((bookId): bookId is string => Boolean(bookId))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">مكتبتي</h1>
        <p className="mt-2 text-muted-foreground">
          الكتب المُشترَكة والطلبات المعلّقة
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">كتب للبيع</h2>
        {books && books.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => {
              const coverUrl = getBookCoverUrl(book.cover_url);
              return (
                <Card key={book.id}>
                  <div className="overflow-hidden border-b">
                    {coverUrl ? (
                      <a
                        href={coverUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`فتح غلاف ${book.title} بالحجم الكامل`}
                        className="block"
                      >
                        <Image
                          src={coverUrl}
                          alt={book.title}
                          width={800}
                          height={500}
                          priority={book.id === books[0]?.id}
                          loading={book.id === books[0]?.id ? "eager" : "lazy"}
                          className="h-48 w-full object-cover"
                          unoptimized
                        />
                      </a>
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-muted text-sm text-muted-foreground">
                        غلاف غير متاح
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <CardDescription>{book.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{book.price} DA</p>
                  </CardContent>
                  <CardFooter>
                    {ownedBookIds.has(book.id) ? (
                      <Badge>متاح للقراءة</Badge>
                    ) : pendingBookIds.includes(book.id) ? (
                      <Badge variant="secondary">طلبك قيد المراجعة</Badge>
                    ) : (
                      <PurchaseBookButton
                        bookId={book.id}
                        bookTitle={book.title}
                        buyerName={user?.user_metadata?.full_name || user?.email}
                      />
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              لا توجد كتب للبيع حالياً
            </CardContent>
          </Card>
        )}
      </section>

      {pendingOrders && pendingOrders.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">طلبات معلّقة</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {pendingBooksMap.get(order.book_id) ?? "كتاب"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">قيد المراجعة</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">كتب مُشروَكة</h2>
        {userBooks && userBooks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userBooks.map((ub) => {
              const book = ub.books as unknown as { id: string; title: string; description: string } | null;
              return (
                <Card key={ub.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {book?.title || BOOK_TITLE_AR}
                    </CardTitle>
                    <CardDescription>{book?.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge>مُتاح للقراءة</Badge>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/library/${book?.id}/reader`}>
                      <Button className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        اقرأ الآن
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                لم تشترِ أي كتاب بعد
              </p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  تصفّح الكتاب
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
