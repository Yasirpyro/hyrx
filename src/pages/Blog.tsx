import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Tag, BookOpen, TrendingUp } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import {
  Section,
  SectionHeader,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/Section";
import { blogPosts, blogCategories, BlogPost } from "@/data/blogPosts";
import { AdUnit } from "@/components/ads/AdUnit";
import { cn } from "@/lib/utils";

const categoryColorMap: Record<string, string> = {
  "AI Technology": "bg-primary/10 text-primary border-primary/20",
  "AI Across Industries": "bg-accent/10 text-accent border-accent/20",
  "Ethics & Governance": "bg-secondary/80 text-foreground border-secondary/40",
  "AI Business & Market": "bg-primary/10 text-primary border-primary/20",
};

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <StaggerItem>
      <Link to={`/blog/${post.slug}`} className="group block h-full">
        <motion.article
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative h-full flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-primary/40 transition-all duration-300"
        >
          {/* Top accent bar */}
          <div
            className={cn(
              "h-1 w-full",
              post.categoryColor === "primary"
                ? "bg-gradient-to-r from-primary to-primary/40"
                : post.categoryColor === "accent"
                ? "bg-gradient-to-r from-accent to-accent/40"
                : "bg-gradient-to-r from-secondary to-secondary/60"
            )}
          />

          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col flex-1 p-6 sm:p-7">
            {/* Category + Reading time */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                  categoryColorMap[post.category] ??
                    "bg-muted text-muted-foreground border-border"
                )}
              >
                <Tag className="w-3 h-3" />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {post.readingTime}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3 flex-1">
              {post.excerpt}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <span className="text-xs text-muted-foreground">{post.publishedDate}</span>
              <span className="inline-flex items-center gap-1.5 text-primary text-xs font-medium">
                Read article
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </motion.article>
      </Link>
    </StaggerItem>
  );
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  const featured = blogPosts[0];

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "HYRX AI Blog",
    description: "AI industry insights, breakthroughs, and business strategy for 2026.",
    url: "https://hyrx.tech/blog",
    publisher: {
      "@type": "Organization",
      name: "HYRX",
      url: "https://hyrx.tech",
    },
  };

  return (
    <Layout>
      <SEO
        title="AI Industry Blog — Insights & Updates 2026"
        description="Deep-dive articles on AI agents, hardware breakthroughs, enterprise ROI, ethics, and market trends from the HYRX team. Fresh perspectives for tech leaders in 2026."
        schema={blogSchema}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-16 lg:pb-20 overflow-hidden">
        <div className="container-main">
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
                <BookOpen className="w-4 h-4" />
                HYRX Blog
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-display mb-6">
                AI insights for{" "}
                <span className="gradient-text">2026 and beyond</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-body-lg max-w-2xl">
                Deep-dives on autonomous agents, hardware shifts, healthcare AI, enterprise ROI, ethics, and the market forces shaping the next era of artificial intelligence.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Background effects */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 right-16 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Featured Post */}
      <section className="pb-16">
        <div className="container-main">
          <Reveal>
            <Link to={`/blog/${featured.slug}`} className="group block">
              <motion.article
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-3xl bg-card border border-border/50 overflow-hidden hover:border-primary/40 transition-all duration-300"
              >
                {/* Gradient banner */}
                <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />

                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 p-8 sm:p-10 lg:p-12 grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Featured
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Tag className="w-3 h-3" />
                        {featured.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {featured.readingTime}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>

                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {featured.excerpt}
                    </p>

                    <span className="inline-flex items-center gap-2 text-primary font-medium">
                      Read full article
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  {/* Stats panel */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Articles published", value: "8" },
                      { label: "Categories covered", value: "4" },
                      { label: "Min avg read time", value: "7" },
                      { label: "Topics in 2026", value: "20+" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-5 rounded-xl bg-muted/50 border border-border/30 text-center"
                      >
                        <div className="text-3xl font-bold text-primary mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground leading-tight">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Ad Unit */}
      <div className="container-main mb-8">
        <AdUnit format="horizontal" />
      </div>

      {/* Category Filter + Posts */}
      <Section>
        {/* Filter pills */}
        <Reveal>
          <div className="flex flex-wrap gap-2 mb-12">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No posts in this category yet.
              </div>
            ) : (
              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
                {filtered.map((post, i) => (
                  <BlogCard key={post.slug} post={post} index={i} />
                ))}
              </StaggerContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </Section>

      {/* Bottom Ad */}
      <div className="container-main mb-16">
        <AdUnit format="horizontal" />
      </div>

      {/* Newsletter CTA */}
      <Section className="bg-card/30 border-y border-border/30">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <h2 className="text-headline mb-4">Stay ahead of the AI curve</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-body-lg mb-8">
              Get the latest AI industry analysis, breakthroughs, and strategy insights delivered directly to your inbox.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20"
            >
              Get in touch
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Reveal>
        </div>
      </Section>
    </Layout>
  );
}
