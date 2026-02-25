import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://hyrx.tech";
const DIST_DIR = path.resolve("dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");

const routeMeta = {
  "/": {
    title: "HYRX | Production Ready AI Agents & Automations",
    description:
      "HYRX builds production-ready AI agents, workflow automations, and customer chat systems—designed for reliability, security, and measurable business outcomes.",
  },
  "/services": {
    title: "AI Services | HYRX",
    description:
      "Explore HYRX services: AI agents, custom chatbots, and 3D/AR modelling built for measurable business outcomes.",
  },
  "/services/ai-agents": {
    title: "AI Agents & Automations Services | HYRX",
    description:
      "Production-ready AI agent workflows with tool use, guardrails, evals, and observability for modern teams.",
  },
  "/services/custom-ai-chatbots": {
    title: "Custom AI Chatbots Services | HYRX",
    description:
      "Customer-facing AI chat systems for lead qualification, support, and routing with human handoff built in.",
  },
  "/services/3d-ar-modelling": {
    title: "3D & AR Modelling Services | HYRX",
    description:
      "Photoreal 3D assets and AR-ready models optimized for web performance and immersive product experiences.",
  },
  "/work": {
    title: "Our Work | HYRX",
    description:
      "See representative concept demos and delivery examples across AI agents, automation, chat, and AR projects.",
  },
  "/about": {
    title: "About HYRX | AI Studio",
    description:
      "Learn about HYRX, our delivery approach, and how we build secure, reliable AI systems for modern teams.",
  },
  "/contact": {
    title: "Contact HYRX | Request a Quote",
    description:
      "Talk to HYRX about your AI project. Share goals, constraints, and timeline to get a tailored implementation plan.",
  },
  "/blog": {
    title: "AI Insights for 2026 and Beyond | HYRX Blog",
    description:
      "Deep-dives on autonomous agents, enterprise ROI, regulation, ethics, and market shifts shaping AI adoption.",
  },
  "/agents": {
    title: "AI Agent Prompt Library | HYRX",
    description:
      "Browse production-ready system prompts for n8n, LangChain, LangGraph, CrewAI, and AutoGen across industries.",
  },
  "/legal/privacy-policy": {
    title: "Privacy Policy | HYRX",
    description: "Review HYRX privacy policy, data handling practices, and customer data protection commitments.",
  },
  "/legal/terms": {
    title: "Terms of Service | HYRX",
    description: "Read HYRX terms of service, engagement terms, usage conditions, and legal provisions.",
  },
};

const fallbackMeta = {
  title: "HYRX | Production Ready AI Agents & Automations",
  description:
    "HYRX builds production-ready AI agents, workflow automations, and customer chat systems—designed for reliability, security, and measurable business outcomes.",
};

function titleizeSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRouteMeta(route) {
  if (routeMeta[route]) return routeMeta[route];

  if (route.startsWith("/blog/") && route.length > "/blog/".length) {
    const slug = route.replace("/blog/", "");
    return {
      title: `${titleizeSlug(slug)} | HYRX Blog`,
      description:
        "Read the latest HYRX AI analysis covering strategy, operations, adoption, and market trends.",
    };
  }

  if (route.startsWith("/services/") && route.length > "/services/".length) {
    const slug = route.replace("/services/", "");
    return {
      title: `${titleizeSlug(slug)} | HYRX Services`,
      description:
        "Explore HYRX implementation services designed for reliable delivery and measurable business outcomes.",
    };
  }

  return fallbackMeta;
}

function toPath(url) {
  if (!url.startsWith(BASE_URL)) return null;
  const pathPart = url.replace(BASE_URL, "") || "/";
  return pathPart.endsWith("/") && pathPart.length > 1
    ? pathPart.slice(0, -1)
    : pathPart;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function upsertMetaTag(html, attrName, attrValue, content) {
  const pattern = new RegExp(
    `<meta[^>]*${attrName}=["']${attrValue}["'][^>]*>`,
    "i",
  );
  const tag = `<meta ${attrName}="${attrValue}" content="${escapeHtml(content)}" />`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `  ${tag}\n</head>`);
}

function upsertCanonical(html, href) {
  const pattern = /<link[^>]*rel=["']canonical["'][^>]*>/i;
  const tag = `<link rel="canonical" href="${href}" />`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `  ${tag}\n</head>`);
}

function upsertTitle(html, title) {
  const pattern = /<title>[\s\S]*?<\/title>/i;
  const tag = `<title>${escapeHtml(title)}</title>`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `  ${tag}\n</head>`);
}

async function getRoutesFromSitemap() {
  const sitemapPath = path.resolve("public", "sitemap.xml");
  const sitemap = await readFile(sitemapPath, "utf8");
  const matches = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  const routes = new Set(["/"]);
  for (const loc of matches) {
    const route = toPath(loc);
    if (route) routes.add(route);
  }

  return [...routes];
}

async function renderRoute(template, route) {
  const metadata = getRouteMeta(route);
  const canonical = `${BASE_URL}${route === "/" ? "" : route}`;

  let html = template;
  html = upsertTitle(html, metadata.title);
  html = upsertMetaTag(html, "name", "description", metadata.description);
  html = upsertCanonical(html, canonical);
  html = upsertMetaTag(html, "property", "og:title", metadata.title);
  html = upsertMetaTag(html, "property", "og:description", metadata.description);
  html = upsertMetaTag(html, "property", "og:url", canonical);
  html = upsertMetaTag(html, "name", "twitter:title", metadata.title);
  html = upsertMetaTag(html, "name", "twitter:description", metadata.description);

  if (route === "/") {
    await writeFile(TEMPLATE_PATH, html, "utf8");
    return;
  }

  const dir = path.join(DIST_DIR, route.replace(/^\//, ""));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), html, "utf8");
}

async function run() {
  const template = await readFile(TEMPLATE_PATH, "utf8");
  const routes = await getRoutesFromSitemap();

  await Promise.all(routes.map((route) => renderRoute(template, route)));
  console.log(`Prerendered SEO metadata for ${routes.length} routes.`);
}

run().catch((error) => {
  console.error("Failed to prerender SEO route HTML:", error);
  process.exit(1);
});
