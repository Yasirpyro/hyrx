

# Light Mode for Blog Pages

## Recommendation

As a senior dev, I recommend a **blog-scoped light theme override** rather than a full site-wide dark/light toggle. Here's why:

- Your brand identity (HYRX AI Studio) is built around a dark, hard-tech aesthetic -- the glows, glass effects, and grid backgrounds all depend on the dark palette
- Blog content genuinely reads better on white backgrounds for long-form articles
- A full site toggle would require re-theming every page, component, and animation -- a massive effort with diminishing returns
- A blog-only light override is clean, professional, and what sites like Vercel, Linear, and Stripe do for their blogs

## What Will Change

- Blog listing page (`/blog`) keeps the current dark hero section but article cards get a clean white treatment
- Blog post pages (`/blog/:slug`) switch to a white content area with a dark header/footer preserved
- The header and footer stay dark-themed across the site for brand consistency
- A light-mode CSS variable set is added and applied only within a `.blog-light` wrapper

## Technical Details

### 1. Add light-mode CSS variables (`src/index.css`)

Add a `.blog-light` class with a complete light palette:
- White background, dark text
- Adjusted card, border, muted, and primary colors for light context
- Keeps the same primary (cyan) and accent (magenta) hues but with light-friendly contrast

### 2. Update Blog Post page (`src/pages/BlogPost.tsx`)

- Wrap the main content area (below the header) in a `div` with `className="blog-light"`
- The header/footer remain outside this wrapper, staying dark
- Adjust the progress bar, article text, sidebar, blockquotes, and cards to use the CSS variable-driven colors (which they already do via `text-foreground`, `bg-card`, etc.)

### 3. Update Blog listing page (`src/pages/Blog.tsx`)

- Apply `blog-light` class to the article grid section below the hero
- The hero/header stays dark for visual impact
- Category filter pills and article cards adapt automatically through CSS variables

### 4. Header and footer handling

- The `SiteHeader` and `SiteFooter` remain in the dark scope (outside the `.blog-light` wrapper)
- No changes needed to these components

### 5. Table of Contents sidebar (`src/components/blog/TableOfContents.tsx`)

- Already uses semantic color classes (`text-foreground`, `bg-card`, etc.)
- Will automatically adapt inside the `.blog-light` wrapper
- Minor tweaks if needed for border/hover contrast

### Files Modified
- `src/index.css` -- add `.blog-light` variable overrides
- `src/pages/BlogPost.tsx` -- wrap content in light scope
- `src/pages/Blog.tsx` -- wrap article grid in light scope
- Minor adjustments to `TableOfContents.tsx` if contrast needs tuning

