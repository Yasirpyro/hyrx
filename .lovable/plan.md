

# Migration from Lovable Cloud to Cloudflare Pages

## Deploying to Cloudflare Pages via GitHub

Since you already have the GitHub repo connected (`github.com/Yasirpyro/ai-email-assistant`), deployment is straightforward:

1. Go to **Cloudflare Dashboard > Pages > Create a project**
2. Select **Connect to Git** and choose your `ai-email-assistant` repository
3. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add environment variables in Cloudflare Pages settings (you'll need `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` pointing to your personal Supabase project)
5. Since `hyrx.tech` is already configured on Cloudflare, go to **Pages > Custom domains** and add `hyrx.tech`

Every push to your GitHub default branch will auto-deploy.

---

## What Needs to Be Removed / Changed

### 1. Voice Assistant Chatbot (entire feature removal)

**Files to delete:**
- `src/components/chat/VoiceAssistantWidget.tsx`
- `src/components/chat/ChatMessage.tsx`
- `src/components/chat/QuickActions.tsx`
- `src/components/chat/VoiceOrbModal.tsx`
- `src/components/chat/index.ts`
- `src/components/ui/voice-powered-orb.tsx`
- `src/components/ui/shiny-button.tsx`
- `src/components/ui/shiny-button.css`
- `src/lib/stream-chat.ts`
- `src/hooks/use-speech.ts`
- `src/hooks/use-footer-collision.ts`

**Files to edit:**
- `src/components/layout/Layout.tsx` -- Remove the lazy import and `<VoiceAssistantWidget />` rendering

### 2. Edge Functions (Lovable Cloud backend)

**Files to delete:**
- `supabase/functions/hyrx-chat/index.ts`
- `supabase/functions/hyrx-chat/hyrx-knowledge.ts`
- `supabase/functions/send-contact-email/index.ts`
- `supabase/config.toml`

Note: You'll need to re-create `send-contact-email` on your personal Supabase project if you still want the contact form to work.

### 3. Supabase Client (reconnect to your own project)

**Files to update:**
- `src/integrations/supabase/client.ts` -- Update to use your personal Supabase URL and anon key
- `src/integrations/supabase/types.ts` -- Regenerate from your personal Supabase project using `supabase gen types`
- `.env` -- Update `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` to your personal Supabase values

### 4. Contact Form (`src/pages/Contact.tsx`)

Currently calls `supabase.functions.invoke("send-contact-email")`. After migration, you'll need to either:
- Deploy the `send-contact-email` edge function to your personal Supabase project, OR
- Replace with a different email service (e.g., Cloudflare Workers + Brevo API)

### 5. Secrets to Recreate on Your Personal Supabase

These secrets currently live in Lovable Cloud and must be set up in your own Supabase project's Edge Function secrets:
- `BREVO_API_KEY`
- `RECAPTCHA_SECRET_KEY`
- `FROM_EMAIL`
- `REPLY_TO_EMAIL`
- `INTERNAL_NOTIFY_EMAIL`
- `GOOGLE_CLOUD_API_KEY`
- `LOVABLE_API_KEY` (only if you keep the chatbot -- otherwise not needed)

---

## Summary Checklist

| Item | Action |
|------|--------|
| Voice Assistant chatbot | Delete all 11 files + remove from Layout |
| Edge functions (hyrx-chat, send-contact-email) | Delete from repo; re-deploy send-contact-email to your Supabase |
| supabase/config.toml | Delete (recreate for your own Supabase if needed) |
| Supabase client + types | Point to your personal Supabase project |
| .env variables | Update to your Supabase credentials |
| Secrets (Brevo, reCAPTCHA, etc.) | Set up in your Supabase dashboard |
| Cloudflare Pages | Connect GitHub repo, set Vite build, add custom domain |

### What stays unchanged
- All pages, routing, styles, SEO, components, blog, etc. -- no visual changes
- The `@supabase/supabase-js` dependency stays (you're just switching which Supabase project it connects to)

