"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message =
        error.code === "email_not_confirmed"
          ? "تحقق من بريدك الإلكتروني لتفعيل الحساب أولاً"
          : error.code === "invalid_credentials"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : error.message;
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success("تم تسجيل الدخول بنجاح");
    router.push("/library");
    router.refresh();
  }

  async function handleResetPassword() {
    if (!email) {
      toast.error("أدخل بريدك الإلكتروني أولاً");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("تم إرسال رابط إعادة تعيين كلمة المرور");
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
        <CardDescription>أدخل بياناتك للوصول إلى حسابك</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <Button
            type="button"
            variant="link"
            className="px-0 text-sm"
            onClick={handleResetPassword}
          >
            نسيت كلمة المرور؟
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
          <p className="text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/signup" className="text-primary underline">
              أنشئ حساباً
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
