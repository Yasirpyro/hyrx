import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, Calendar, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/ui/Section";
import { getBlogPost, blogPosts } from "@/data/blogPosts";
import type { BlogPost } from "@/data/blogPosts";
import { AdUnit } from "@/components/ads/AdUnit";
import { TableOfContents, slugify } from "@/components/blog/TableOfContents";
import { cn } from "@/lib/utils";

const categoryColorMap: Record<string, string> = {
  "AI Technology": "bg-primary/10 text-primary border-primary/20",
  "AI Across Industries": "bg-accent/10 text-accent border-accent/20",
  "Ethics & Governance": "bg-secondary/80 text-foreground border-secondary/40",
  "AI Business & Market": "bg-primary/10 text-primary border-primary/20",
};

/** Renders markdown-like content into styled JSX */
function RenderContent({ content }: { content: string }) {
  const lines = content.trim().split("\n");

  return (
    <div className="prose-custom space-y-4">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // H2
        if (trimmed.startsWith("## ")) {
          const text = trimmed.slice(3);
          return (
            <h2 key={i} id={slugify(text)} className="text-xl sm:text-2xl font-bold text-foreground mt-10 mb-4 pt-6 border-t border-border/30">
              {text}
            </h2>
          );
        }

        // H3
        if (trimmed.startsWith("### ")) {
          const text = trimmed.slice(4);
          return (
            <h3 key={i} id={slugify(text)} className="text-lg sm:text-xl font-semibold text-foreground mt-8 mb-3">
              {text}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-primary pl-5 py-1 my-6 italic text-muted-foreground bg-primary/5 rounded-r-lg pr-5">
              {trimmed.slice(2)}
            </blockquote>
          );
        }

        // Bullet list item
        if (trimmed.startsWith("- ")) {
          const bulletContent = trimmed.slice(2);
          // Handle bold in bullet: **text:** rest
          const boldMatch = bulletContent.match(/^\*\*(.+?)\*\*(.*)$/);
          return (
            <li key={i} className="flex items-start gap-3 text-muted-foreground leading-relaxed ml-4">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>
                {boldMatch ? (
                  <>
                    <strong className="text-foreground font-semibold">{boldMatch[1]}</strong>
                    {boldMatch[2]}
                  </>
                ) : (
                  bulletContent
                )}
              </span>
            </li>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/);
        if (numMatch) {
          return (
            <li key={i} className="flex items-start gap-3 text-muted-foreground leading-relaxed ml-4">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {numMatch[1]}
              </span>
              <span>
                <strong className="text-foreground font-semibold">{numMatch[2]}</strong>
                {numMatch[3]}
              </span>
            </li>
          );
        }

        // Empty line = spacer
        if (!trimmed) return <div key={i} className="h-1" />;

        // Regular paragraph — handle inline bold **text**
        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-muted-foreground leading-relaxed text-base">
            {parts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={j} className="text-foreground font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="p-5 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 h-full"
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-3",
            categoryColorMap[post.category] ?? "bg-muted text-muted-foreground border-border"
          )}
        >
          <Tag className="w-3 h-3" />
          {post.category}
        </span>
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1">
          Read
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </motion.div>
    </Link>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const others = related.length < 3
    ? [...related, ...blogPosts.filter((p) => p.slug !== post.slug && p.category !== post.category)].slice(0, 3)
    : related;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: "https://hyrx.tech/brandlogo.png",
    url: `https://hyrx.tech/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://hyrx.tech/blog/${post.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "HYRX",
      url: "https://hyrx.tech",
      logo: {
        "@type": "ImageObject",
        url: "https://hyrx.tech/brandlogo.png",
      },
    },
    datePublished: "2026-02-01",
    dateModified: "2026-02-21",
    author: {
      "@type": "Organization",
      name: "HYRX",
      url: "https://hyrx.tech",
    },
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <Layout>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/30">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <SEO
        title={post.title}
        description={post.excerpt}
        type="article"
        schema={articleSchema}
        breadcrumbs={[
          { name: "Home", url: "https://hyrx.tech/" },
          { name: "Blog", url: "https://hyrx.tech/blog" },
          { name: post.title, url: `https://hyrx.tech/blog/${post.slug}` },
        ]}
      />

      {/* Back nav */}
      <div className="container-main pt-28 pb-4">
        <Reveal>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </Reveal>
      </div>

      {/* Main content + sidebar */}
      <div className="container-main pb-20">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-16 items-start">
          {/* Left column: header + article */}
          <div>
            <header className="pb-10">
              <div className="max-w-3xl">
                <Reveal>
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                        categoryColorMap[post.category] ?? "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {post.readingTime} read
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {post.publishedDate}
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-5">
                    {post.title}
                  </h1>
                </Reveal>

                <Reveal delay={0.2}>
                  <p className="text-body-lg border-l-4 border-primary/50 pl-5 text-muted-foreground">
                    {post.excerpt}
                  </p>
                </Reveal>
              </div>
            </header>

            <div className="mb-10">
              <div className="max-w-3xl h-px bg-gradient-to-r from-primary/50 via-accent/30 to-transparent" />
            </div>

            {/* Top ad — between header divider and article */}
            <div className="mb-8">
              <AdUnit format="horizontal" slot="4386922121" />
            </div>

            <article className="max-w-2xl">
              <Reveal>
                <RenderContent content={post.content} />
              </Reveal>

              {/* Mid-article ad */}
              <div className="my-10">
                <AdUnit format="rectangle" slot="4386922121" />
              </div>

              {/* Bottom ad — after article content */}
              <div className="my-10">
                <AdUnit format="horizontal" slot="4386922121" />
              </div>

              <Reveal>
                <div className="mt-12 p-6 rounded-2xl bg-card border border-border/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <img src="/brandlogo.webp" alt="HYRX" className="w-8 h-8 rounded-lg object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">HYRX AI Studio</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Building production-ready AI agents, automations, and immersive experiences for modern teams.
                    </p>
                  </div>
                </div>
              </Reveal>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 space-y-6">
            <TableOfContents content={post.content} />
            <AdUnit format="rectangle" />

            {others.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  Related Articles
                </h3>
                <div className="space-y-3">
                  {others.map((p) => (
                    <RelatedCard key={p.slug} post={p} />
                  ))}
                </div>
              </div>
            )}

            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/50">
              <h3 className="text-sm font-bold text-foreground mb-2">Build AI for your business</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                HYRX builds production-ready AI agents and automations. Let's talk about your project.
              </p>
              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                Request a Quote
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
