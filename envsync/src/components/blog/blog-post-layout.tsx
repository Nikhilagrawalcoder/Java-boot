import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export function BlogPostLayout({
  title,
  date,
  children,
}: {
  title: string;
  date: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/blog" className="text-sm text-muted-foreground underline underline-offset-4">
          ← Blog
        </Link>

        <article className="mt-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{date}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          </div>

          <div className="space-y-5 text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-foreground [&_h2]:pt-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:text-foreground">
            {children}
          </div>
        </article>

        <div className="mt-12 rounded-lg border border-border bg-muted/30 p-5 text-sm">
          <p className="text-foreground">See what EnvSync catches in your own repository.</p>
          <Link href="/signup" className="mt-1 inline-block text-primary underline underline-offset-4">
            Connect a repository — free for one →
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
