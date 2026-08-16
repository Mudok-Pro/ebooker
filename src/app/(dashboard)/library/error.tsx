"use client";

import { Button } from "@/components/ui/button";

export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-2 text-2xl font-bold">خطأ في تحميل المكتبة</h2>
      <p className="mb-6 text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </div>
  );
}
