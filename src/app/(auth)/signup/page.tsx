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

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // validation state
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  function validatePassword(pw: string) {
    if (pw.length < 8) return "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
    // disallow emoji / non-ASCII by requiring printable ASCII characters
    if (!/^[\x20-\x7E]+$/.test(pw)) return "الرموز التعبيرية وغير الأحرف الخاصة غير مسموحة في كلمة المرور";
    if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw))
      return "يجب أن تحتوي كلمة المرور على حرف واحد على الأقل ورقم واحد";
    return null;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // final client-side validation
    const pwErr = validatePassword(password);
    setPasswordError(pwErr);
    if (pwErr) {
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("كلمتا المرور غير متطابقتين");
      setLoading(false);
      return;
    }

    // client-side signup (simple flow)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });

      if (error) {
        const message =
          error.status === 429
            ? "تم تجاوز حد محاولات التسجيل. انتظر قليلاً ثم حاول مرة أخرى، أو استخدم رسالة التأكيد التي أُرسلت مسبقاً."
            : error.message;
        toast.error(message);
        return;
      }

      if (!data.session) {
        toast.success("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتفعيل الحساب.");
        return;
      }

      toast.success("تم إنشاء الحساب بنجاح");
      router.push("/library");
      router.refresh();
      return;
    } catch (err) {
      console.error("Signup failed", err);
      toast.error("فشل الاتصال بالخادم. حاول مرة أخرى لاحقاً.");
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">إنشاء حساب</CardTitle>
        <CardDescription>أنشئ حسابك للوصول إلى الكتاب</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="محمد أحمد"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(validatePassword(e.target.value));
                if (confirmPassword) setConfirmError(e.target.value === confirmPassword ? null : "كلمتا المرور غير متطابقتين");
              }}
              required
              minLength={8}
              dir="ltr"
            />
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmError(e.target.value === password ? null : "كلمتا المرور غير متطابقتين");
              }}
              required
              minLength={8}
              dir="ltr"
            />
            {confirmError && <p className="text-sm text-destructive">{confirmError}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </Button>
          <p className="text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary underline">
              سجّل دخولك
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
