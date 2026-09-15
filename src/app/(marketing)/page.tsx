"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BOOK_PRICE,
  BOOK_CURRENCY,
  AUTHOR_NAME,
  SITE_NAME_AR,
  WHATSAPP_URL,
} from "@/lib/constants";
import {
  BookOpen,
  Shield,
  Smartphone,
  MessageCircle,
  GraduationCap,
  CheckCircle,
  Sparkles,
} from "lucide-react";

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#FF0033" />
      <path d="M20 16.5c0-1.1 1.1-1.8 2.2-1.3l11.2 7.5c1 .7 1 2.1 0 2.8L22.2 32.8c-1.1.5-2.2-.2-2.2-1.3V16.5Z" fill="white" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#000000" />
      <path d="M26.8 12.5c1.6 1.4 3.4 2.3 5.5 2.5v4.4c-1.9-.1-3.7-.7-5.5-1.8v9.8c0 3.6-2.9 6.5-6.5 6.5s-6.5-2.9-6.5-6.5 2.9-6.5 6.5-6.5c.5 0 1 .1 1.5.2v4.3c-.5-.2-1-.3-1.5-.3-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2 3.2-1.4 3.2-3.2V12.5h3.8Z" fill="white" />
      <path d="M27.4 15.7c.8.6 1.7 1 2.8 1.2v3.3c-.9-.1-1.8-.4-2.8-1V15.7Z" fill="#25F4EE" opacity="0.9" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="instagram-gradient" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9CE34" />
          <stop offset="0.5" stopColor="#EE2A7B" />
          <stop offset="1" stopColor="#6228D7" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#instagram-gradient)" />
      <rect x="14" y="14" width="20" height="20" rx="6" fill="none" stroke="white" strokeWidth="2.2" />
      <circle cx="24" cy="24" r="5.2" fill="none" stroke="white" strokeWidth="2.2" />
      <circle cx="31.5" cy="16.5" r="1.5" fill="white" />
    </svg>
  );
}
import { toast } from "sonner";

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handlePurchase() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/signup");
      return;
    }

    const { data: books } = await supabase
      .from("books")
      .select("id")
      .eq("is_published", true)
      .limit(1)
      .single();

    if (!books) {
      toast.error("الكتاب غير متوفر حالياً");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: books.id }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "حدث خطأ");
      setLoading(false);
      return;
    }

    toast.success("تم إرسال طلبك بنجاح! سيتم مراجعته من الإدارة.");
    router.push("/library");
    setLoading(false);
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-19 w-full max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#fdf8f6] shadow-sm">
              <Image
                src="/mosahila-icon.svg"
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </span>
            <span>{SITE_NAME_AR}</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-5">
            <Link href="/login" className="px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              تسجيل الدخول
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-5">إنشاء حساب</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[calc(100vh-76px)] w-full max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">
          <div className="relative order-2 flex justify-center lg:order-1">
            <div className="absolute -inset-6 rounded-[3rem] bg-[#fff8dc] blur-2xl" />
            <div className="relative flex aspect-square w-[min(76vw,390px)] items-center justify-center rounded-[2.5rem] border border-[#eadcfb] bg-[#f7f0ff] shadow-[0_24px_70px_rgba(106,56,194,0.14)]">
              <div className="absolute right-7 top-7 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-[#ffc107] text-[#6a38c2] shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex h-52 w-52 items-center justify-center rounded-full sm:h-64 sm:w-64">
                <Image
                  src="/mosahila-icon.svg"
                  alt="أيقونة المسهلة للرياضيات"
                  width={190}
                  height={168}
                  className="h-40 w-40 rounded-full object-contain sm:h-48 sm:w-48"
                />
              </div>
              <div className="absolute bottom-7 left-7 rounded-2xl bg-white px-4 py-3 text-right shadow-md">
                <p className="text-xs font-medium text-muted-foreground">معك خطوة بخطوة</p>
                <p className="font-bold text-primary">أ.ملياني فاطمة الزهراء</p>
              </div>
            </div>
          </div>

          <div className="order-1 max-w-2xl text-center lg:order-2 lg:text-right">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#eadcfb] bg-[#f7f0ff] px-4 py-2 text-sm font-medium text-primary">
              <GraduationCap className="h-4 w-4" />
              <span>للسنة الرابعة متوسط</span>
            </div>
            <p className="mb-5 flex items-center justify-center gap-2 text-5xl font-bold leading-tight tracking-tight text-primary sm:text-6xl lg:text-7xl lg:justify-start">
          <span className="h-2 w-2 rounded-full bg-accent" />
          المسهلة فاطمة الزهراء للرياضيات
        </p>
        <p className="mb-4 text-xl leading-relaxed text-foreground sm:text-2xl">
          نبسّط الرياضيات، لنُسهّل النجاح
        </p>
        <div className="mx-auto mb-9 max-w-xl space-y-4 text-muted-foreground lg:mx-0">
          <p>
            الأستاذة ملياني فاطمة الزهراء المعروفة بالمسهلة فاطمة الزهراء للرياضيات، أستاذة رياضيات في التعليم المتوسط وخريجة المدرسة العليا للأساتذة - القبة، بخبرة تزيد عن 6 سنوات.
          </p>
          <p>
            عزيزي تلميذ السنة 4 متوسط، أدرك أن كثرة الدروس وضيق الوقت من أكبر التحديات، لذا صممت لك كتاب Allo BEM كحقيبة تعليمية متكاملة تجمع بين ملخصات مكتوبة وشروحات فيديو مسجلة لتتعلم بالطريقة التي تناسبك.
          </p>
          <p className="font-semibold text-primary">Allo BEM # سهلها تسهال</p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <Button size="lg" className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20" onClick={handlePurchase} disabled={loading}>
            <BookOpen className="h-5 w-5" />
            {loading ? "جاري المعالجة..." : `اشترِ الآن - ${BOOK_PRICE} ${BOOK_CURRENCY}`}
          </Button>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="h-12 rounded-full border-primary/25 px-7 text-base text-primary hover:bg-[#f7f0ff]">
              <MessageCircle className="h-5 w-5" />
              احجز حصة فردية
            </Button>
          </a>
        </div>
          </div>
        </section>

      <section className="border-y border-border/70 bg-surface-alt py-20">
        <div className="mx-auto w-full max-w-7xl px-5 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-bold text-secondary">كل ما يحتاجه الطالب</p>
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">تعلّم بثقة وراحة</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: MessageCircle, title: "دعم مباشر", text: "احجز حصص فردية مع المؤلفة لتوضيح أي نقطة صعبة.", tone: "bg-[#f7f0ff] text-primary" },
              { icon: Smartphone, title: "متوافق مع الجوال", text: "اقرأ الكتاب من هاتفك أو حاسوبك في أي وقت وأي مكان.", tone: "bg-[#fff4e6] text-secondary" },
              { icon: Shield, title: "محتوى محمي", text: "الكتاب محمي — لا يمكن تحميل الملفات الأصلية. اقرأ براحتك من أي جهاز.", tone: "bg-[#fff8dc] text-[#a47700]" },
            ].map(({ icon: Icon, title, text, tone }) => (
              <Card key={title} className="rounded-2xl border-0 bg-white p-2 shadow-[0_1px_3px_rgba(17,17,17,0.06)]">
                <CardHeader className="gap-4 p-6 pb-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></div>
                  <CardTitle className="text-lg font-bold text-primary">{title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-7 leading-7 text-muted-foreground">{text}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-5 lg:px-8">
          <div className="text-center">
            <p className="mb-2 text-sm font-bold text-secondary">بين يديك الآن</p>
            <h2 className="mb-10 text-3xl font-bold text-primary sm:text-4xl">محتويات الكتاب</h2>
            <div className="text-right">
              {[
                "ملخصات كل دروس سنة 4 متوسط",
                "امثلة توضيحية",
                "تمارين",
                "ملخصات لأهم دروس السنة 3 متوسط",
                "بعض أساسيات البرهان في الهندسة (تساعدك على معرفة طريقة الاثبات والبرهان)",
                "دروس أونلاين لبرنامج السنة 4 متوسط",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b border-border py-4 text-base">
                  <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 bg-surface-alt py-20">
        <div className="mx-auto px-5 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary sm:text-4xl">ابدأ رحلتك الآن</h2>
          <p className="mb-8 text-muted-foreground">
            احصل على الكتاب بسعر {BOOK_PRICE} {BOOK_CURRENCY} فقط
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20" onClick={handlePurchase} disabled={loading}>
              <BookOpen className="h-5 w-5" />
              {loading ? "جاري المعالجة..." : `اشترِ الآن - ${BOOK_PRICE} ${BOOK_CURRENCY}`}
            </Button>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="h-12 rounded-full border-primary/25 px-7 text-base text-primary hover:bg-white">
                <MessageCircle className="h-5 w-5" />
                تواصل عبر واتساب
              </Button>
            </a>
          </div>
        </div>
      </section>
      </main>

      <footer className="border-t border-border bg-white py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-5 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            {[
              { href: "https://www.youtube.com/@user-dg1yf2fv2vfatimazohramath", label: "YouTube", icon: YouTubeIcon },
              { href: "https://www.tiktok.com/@fatimamathnember1", label: "TikTok", icon: TikTokIcon },
              { href: "https://www.instagram.com/fatimamathnember1?igsh=MTJvMzYwY24zbm05Mg==", label: "Instagram", icon: InstagramIcon },
            ].map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-[#f7f0ff] p-0.5 transition-transform hover:-translate-y-0.5 hover:bg-[#efe4ff]"
              >
                <Icon className="h-full w-full" />
              </a>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary" />
            <p>© {new Date().getFullYear()} {SITE_NAME_AR} - {AUTHOR_NAME}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
