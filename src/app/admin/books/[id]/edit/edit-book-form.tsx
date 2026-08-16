"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number;
  is_published: boolean;
  cover_url?: string | null;
}

export default function EditBookForm({ book }: { book: Book }) {
  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description || "");
  const [price, setPrice] = useState(String(book.price));
  const [isPublished, setIsPublished] = useState(book.is_published);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("id", book.id);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", String(parseFloat(price)));
    formData.append("is_published", String(isPublished));

    if (coverFile) {
      formData.append("cover", coverFile);
    }

    const res = await fetch("/api/admin/books", {
      method: "PATCH",
      body: formData,
    });

    if (!res.ok) {
      toast.error("حدث خطأ في تحديث الكتاب");
      setLoading(false);
      return;
    }

    toast.success("تم تحديث الكتاب بنجاح");
    router.push("/admin/books");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تعديل الكتاب</CardTitle>
        <CardDescription>حدّث بيانات الكتاب</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الكتاب</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">السعر (DA)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">تغيير غلاف الكتاب</Label>
            <Input
              id="cover"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="published">منشور</Label>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "جاري التحديث..." : "تحديث الكتاب"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
