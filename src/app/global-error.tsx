"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-6xl font-bold">خطأ</h1>
          <p className="mb-2 text-xl text-muted-foreground">
            حدث خطأ غير متوقع
          </p>
          {error.digest && (
            <p className="mb-4 text-sm text-muted-foreground">
              معرف الخطأ: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
