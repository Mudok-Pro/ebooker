"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCw, Upload } from "lucide-react";

interface Page {
  id: string;
  page_number: number;
  image_url: string;
}

interface Props {
  bookId: string;
  existingPages: Page[];
}

function PageThumb({
  bookId,
  pageNumber,
}: {
  bookId: string;
  pageNumber: number;
}) {
  const imageUrl = `/api/pages?bookId=${encodeURIComponent(bookId)}&pageNumber=${pageNumber}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt="معاينة" className="aspect-3/4 w-full object-cover" />
  );
}

export default function PageUploader({ bookId, existingPages }: Props) {
  const [uploading, setUploading] = useState(false);
  const [pageNumber, setPageNumber] = useState(
    String(existingPages.length > 0 ? Math.max(...existingPages.map(p => p.page_number)) + 1 : 1)
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleUpload() {
    const selectedFiles = Array.from(fileRef.current?.files ?? []);
    if (selectedFiles.length === 0) {
      toast.error("اختر ملفاً أولاً");
      return;
    }

    const startingPage = parseInt(pageNumber, 10);
    if (isNaN(startingPage) || startingPage < 1) {
      toast.error("رقم الصفحة غير صحيح");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("book_id", bookId);

    if (selectedFiles.length === 1) {
      formData.append("page_number", String(startingPage));
      formData.append("file", selectedFiles[0]);
    } else {
      formData.append("start_page_number", String(startingPage));
      selectedFiles.forEach((file) => formData.append("files", file));
    }

    const res = await fetch("/api/admin/pages", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      toast.error(
        selectedFiles.length > 1 ? "حدث خطأ في رفع الصفحات" : "حدث خطأ في رفع الصفحة"
      );
      setUploading(false);
      return;
    }

    const count = selectedFiles.length;
    toast.success(
      count > 1 ? `تم رفع ${count} صفحات بدءاً من الصفحة ${startingPage}` : `تم رفع الصفحة ${startingPage}`
    );
    setPageNumber(String(startingPage + count));
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    router.refresh();
  }

  async function handleSyncFromBucket() {
    setUploading(true);

    const res = await fetch("/api/admin/sync-pages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookId }),
    });

    setUploading(false);

    if (!res.ok) {
      toast.error("فشل مزامنة الصفحات من التخزين");
      return;
    }

    const data = await res.json();
    toast.success(data.message || "تمت المزامنة");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>رفع صفحات الكتاب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="page_number">رقم البداية</Label>
              <Input
                id="page_number"
                type="number"
                min="1"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                className="w-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">ملفات الصور (JPG/PNG)</Label>
              <Input
                id="file"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                ref={fileRef}
              />
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? "جاري الرفع..." : "رفع"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSyncFromBucket}
              disabled={uploading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              مزامنة من التخزين
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            يمكن رفع ملف واحد أو عدة ملفات دفعة واحدة، أو مزامنة كل الصفحات الموجودة في bucket تلقائياً مع قاعدة البيانات.
          </p>
        </CardContent>
      </Card>

      {existingPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الصفحات الحالية ({existingPages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {existingPages.map((page) => (
                <div
                  key={page.id}
                  className="group relative overflow-hidden rounded-lg border"
                >
                  <PageThumb bookId={bookId} pageNumber={page.page_number} />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-xs text-white">
                    صفحة {page.page_number}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
