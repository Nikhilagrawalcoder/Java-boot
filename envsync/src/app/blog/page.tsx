import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = { title: "Blog · EnvSync" };

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Notes on configuration, deployment failures, and what actually breaks in production.
          </p>
        </div>

        <div className="divide-y divide-border border-t border-border">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block py-6 transition-colors hover:bg-muted/30"
            >
              <p className="text-xs text-muted-foreground">{post.date}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">{post.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{post.description}</p>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
