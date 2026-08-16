import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}
