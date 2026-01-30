

# SEO Audit Report: HYRX Website

## Executive Summary

**Overall Health Assessment:** Moderate - The site has a solid foundation but is missing several critical SEO elements that prevent it from ranking well and being properly indexed.

### Top 5 Priority Issues

1. **Missing per-page meta tags** - All pages use the same static meta tags from `index.html`
2. **No XML sitemap** - Search engines cannot discover all pages efficiently  
3. **Missing structured data (Schema.org)** - No JSON-LD markup for Organization, Services, or FAQ
4. **Canonical URLs incorrect** - Static canonical points only to homepage
5. **Open Graph/Twitter images use relative paths** - Social sharing previews may break

### Quick Wins Identified

- Fix canonical URL implementation
- Add absolute URLs for OG images
- Fix broken email links in legal pages
- Add `robots.txt` sitemap reference

---

## Detailed Findings

### 1. Crawlability and Indexation Issues

| Issue | Impact | Evidence | Fix | Priority |
|-------|--------|----------|-----|----------|
| **No XML sitemap** | HIGH | No sitemap.xml file exists in `public/` folder | Create `public/sitemap.xml` with all canonical URLs | 1 |
| **robots.txt missing sitemap reference** | MEDIUM | Current robots.txt only has Allow rules | Add `Sitemap: https://hyrx.tech/sitemap.xml` | 2 |
| **Static canonical URL** | HIGH | `<link rel="canonical" href="https://hyrx.tech" />` only points to homepage | Implement dynamic canonical per route | 1 |

### 2. On-Page SEO Issues

| Issue | Impact | Evidence | Fix | Priority |
|-------|--------|----------|-----|----------|
| **Same title/description on all pages** | HIGH | Static meta tags in `index.html` used across 11 pages | Use react-helmet or custom SEO component for per-page meta | 1 |
| **No unique H1s per page** | MEDIUM | Pages have H1s in JSX but no document title sync | Ensure titles match H1 content | 2 |
| **OG/Twitter images use relative paths** | MEDIUM | `content="/brandlogo.png"` should be absolute URL | Change to `https://hyrx.tech/brandlogo.png` | 2 |
| **Missing OG:url meta tag** | LOW | No `og:url` property defined | Add dynamic `og:url` per page | 3 |

### 3. Content and Structure Issues

| Issue | Impact | Evidence | Fix | Priority |
|-------|--------|----------|-----|----------|
| **Broken contact email in legal pages** | HIGH | Both Privacy Policy and Terms link to `hello@example.com` | Update to `contact@hyrx.tech` | 1 |
| **Missing structured data** | HIGH | No JSON-LD schema for Organization, LocalBusiness, Service, FAQ | Implement schema markup | 1 |
| **No FAQ schema** | MEDIUM | Homepage has FAQ section but no structured markup | Add FAQPage schema to enable rich results | 2 |
| **404 page lacks SEO elements** | LOW | NotFound component has no meta noindex tag | Add noindex meta to prevent indexing | 3 |

### 4. Technical SEO Issues

| Issue | Impact | Evidence | Fix | Priority |
|-------|--------|----------|-----|----------|
| **React SPA without SSR/SSG** | MEDIUM | Single-page app may have crawling challenges | Consider pre-rendering or react-snap for critical pages | 3 |
| **No language/hreflang tags** | LOW | Site appears English-only but no explicit declaration | Add `<html lang="en">` (already present, good!) | N/A |

---

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)

**Task 1.1: Create SEO Component for Dynamic Meta Tags**

Create a reusable `SEO` component using `react-helmet-async` that injects per-page:
- Title tag (format: "Page Title | HYRX")
- Meta description (unique per page)
- Canonical URL (dynamic based on route)
- OG tags (title, description, url, image with absolute path)
- Twitter Card tags

**Task 1.2: Add SEO Component to All Pages**

Update each page with unique, keyword-optimized meta:

| Page | Title | Primary Keywords |
|------|-------|------------------|
| `/` | Production Ready AI Agents & Automations | HYRX | AI agents, workflow automation |
| `/services` | AI & Automation Services | HYRX | AI services, custom chatbots |
| `/services/ai-agents` | AI Agents & Workflow Automation | HYRX | AI agents, LangGraph, automation |
| `/services/custom-ai-chatbots` | Custom AI Chatbots | HYRX | AI chatbots, customer support bot |
| `/services/3d-ar-modelling` | 3D & AR Modelling Services | HYRX | 3D models, AR, WebAR |
| `/work` | Case Studies & Demo Projects | HYRX | AI projects, portfolio |
| `/about` | About Us | HYRX | AI studio, company |
| `/contact` | Contact Us | HYRX | request quote, get in touch |
| `/legal/privacy-policy` | Privacy Policy | HYRX | privacy, data protection |
| `/legal/terms` | Terms of Service | HYRX | terms, legal |

**Task 1.3: Create XML Sitemap**

Create `public/sitemap.xml`:

```text
+-- public/sitemap.xml (new file)
    Contains all indexable URLs:
    - https://hyrx.tech/
    - https://hyrx.tech/services
    - https://hyrx.tech/services/ai-agents
    - https://hyrx.tech/services/custom-ai-chatbots
    - https://hyrx.tech/services/3d-ar-modelling
    - https://hyrx.tech/work
    - https://hyrx.tech/about
    - https://hyrx.tech/contact
    - https://hyrx.tech/legal/privacy-policy
    - https://hyrx.tech/legal/terms
```

**Task 1.4: Update robots.txt**

Add sitemap reference:
```
Sitemap: https://hyrx.tech/sitemap.xml
```

**Task 1.5: Fix Legal Page Contact Emails**

Update `src/pages/legal/PrivacyPolicy.tsx` and `src/pages/legal/Terms.tsx`:
- Change `hello@example.com` to `contact@hyrx.tech`

### Phase 2: Schema Markup (Week 2)

**Task 2.1: Add Organization Schema**

Add to `index.html` or via SEO component:
```
Organization schema with:
- name: "HYRX"
- url: "https://hyrx.tech"
- logo: "https://hyrx.tech/brandlogo.png"
- email: "contact@hyrx.tech"
- sameAs: [Twitter, LinkedIn, Instagram URLs]
```

**Task 2.2: Add Service Schema**

On each service page, add Service schema:
- serviceType
- provider (reference Organization)
- description
- areaServed

**Task 2.3: Add FAQPage Schema**

On homepage, add FAQPage schema for the 5 FAQ items to enable rich results in search.

### Phase 3: Optimizations (Week 3+)

**Task 3.1: Improve OG Images**

- Create dedicated OG image (1200x630px) with brand/text overlay
- Update meta tags to use absolute URL

**Task 3.2: Add noindex to 404**

Update NotFound component with meta robots noindex.

**Task 3.3: Pre-rendering Consideration**

Evaluate react-snap or similar for pre-rendering key pages to improve initial crawlability.

---

## Files to Modify/Create

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `src/components/SEO.tsx` | Reusable SEO component with react-helmet-async |
| MODIFY | `src/pages/Index.tsx` | Add SEO component |
| MODIFY | `src/pages/Services.tsx` | Add SEO component |
| MODIFY | `src/pages/services/ServiceAgents.tsx` | Add SEO component |
| MODIFY | `src/pages/services/ServiceChatbots.tsx` | Add SEO component |
| MODIFY | `src/pages/services/Service3DAR.tsx` | Add SEO component |
| MODIFY | `src/pages/Work.tsx` | Add SEO component |
| MODIFY | `src/pages/About.tsx` | Add SEO component |
| MODIFY | `src/pages/Contact.tsx` | Add SEO component |
| MODIFY | `src/pages/legal/PrivacyPolicy.tsx` | Add SEO component + fix email |
| MODIFY | `src/pages/legal/Terms.tsx` | Add SEO component + fix email |
| MODIFY | `src/pages/NotFound.tsx` | Add noindex meta |
| CREATE | `public/sitemap.xml` | XML sitemap |
| MODIFY | `public/robots.txt` | Add sitemap reference |
| MODIFY | `index.html` | Fix OG image paths + add JSON-LD schema |
| MODIFY | `src/App.tsx` | Wrap with HelmetProvider |
| INSTALL | `react-helmet-async` | Dependency for meta tag management |

---

## Technical Notes

### React Helmet Implementation

The `react-helmet-async` package is recommended over `react-helmet` as it supports concurrent mode and is actively maintained. Install via:
```
npm install react-helmet-async
```

### Canonical URL Strategy

Each page should have a self-referencing canonical URL. For React Router routes, derive from `window.location.pathname`:
```
https://hyrx.tech${pathname}
```

### Schema.org Implementation

JSON-LD is the preferred format. Place either:
1. In `index.html` for static Organization schema
2. Via SEO component for per-page schemas (Service, FAQPage)

---

## Expected Impact

After implementation:
- All 10 pages will have unique, optimized titles and descriptions
- Search engines can efficiently discover all pages via sitemap
- Rich results eligible for FAQ section (potential 2-5x CTR improvement)
- Social sharing will display proper previews with correct images
- Canonical issues resolved, preventing duplicate content concerns

