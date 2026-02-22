# HYRX.tech — Migration to Cloudflare Pages

## Opening the Project Locally in VS Code

Your project is already synced to GitHub at `github.com/Yasirpyro/ai-email-assistant`. To open it locally:

```bash
git clone https://github.com/Yasirpyro/ai-email-assistant.git
cd ai-email-assistant
npm install
npm run dev
```

Then open the folder in VS Code:
```bash
code .
```

---

## Remaining Migration Steps

### 1. Connect Your Personal Supabase Project

Update these files to point to your own Supabase project:

- **`.env`** — Replace the three variables:
  ```
  VITE_SUPABASE_PROJECT_ID="your-project-id"
  VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
  VITE_SUPABASE_URL="https://your-project-id.supabase.co"
  ```

- **`src/integrations/supabase/types.ts`** — Regenerate from your Supabase project:
  ```bash
  npx supabase gen types typescript --project-id your-project-id > src/integrations/supabase/types.ts
  ```

### 2. Re-deploy the Contact Email Edge Function

The `send-contact-email` edge function was removed from this repo. To restore it on your personal Supabase:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) → Edge Functions
2. Create a new function called `send-contact-email`
3. Copy the function code from your Git history:
   ```bash
   git show HEAD~1:supabase/functions/send-contact-email/index.ts
   ```
4. Deploy it:
   ```bash
   npx supabase functions deploy send-contact-email --project-ref your-project-id
   ```
5. Set `verify_jwt = false` in your `supabase/config.toml` if needed

### 3. Set Up Secrets in Your Supabase Project

Go to **Supabase Dashboard → Settings → Edge Functions → Secrets** and add:

| Secret | Description |
|--------|-------------|
| `BREVO_API_KEY` | Your Brevo (Sendinblue) API key |
| `GOOGLE_CLOUD_API_KEY` | Google Cloud API key (for reCAPTCHA verification) |
| `GOOGLE_CLOUD_PROJECT_ID` | Your Google Cloud project ID used for reCAPTCHA Enterprise |
| `RECAPTCHA_SITE_KEY` | The same site key used by the frontend script (`grecaptcha.execute`) |
| `FROM_EMAIL` | Sender email, e.g. `no-reply@hyrx.tech` |
| `REPLY_TO_EMAIL` | Reply-to email, e.g. `contact@hyrx.tech` |
| `INTERNAL_NOTIFY_EMAIL` | Where internal notifications go, e.g. `contact@hyrx.tech` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins, e.g. `https://hyrx.tech,https://www.hyrx.tech,http://localhost:5173,http://localhost:8080` |

> `RECAPTCHA_SECRET_KEY` is only needed if you switch to classic `siteverify`. The restored function uses reCAPTCHA Enterprise assessment API.

### 4. Deploy to Cloudflare Pages

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com)** → Pages → Create a project
2. **Connect to Git** → Select `ai-email-assistant`
3. Configure build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Environment variables** — Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from step 1
5. Go to **Pages → Custom domains** → Add `hyrx.tech`

Every push to your default branch will auto-deploy.

### 5. Recreate Database Tables (if fresh Supabase project)

If your personal Supabase project doesn't have the tables yet, run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  services TEXT[],
  budget TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service role) to insert
CREATE POLICY "Service role can insert"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_submissions_updated_at();
```

---

## What Was Already Done (in Lovable)

- ✅ Deleted all 11 chatbot/voice assistant files
- ✅ Deleted edge functions (`hyrx-chat`, `send-contact-email`)
- ✅ Deleted `supabase/config.toml`
- ✅ Cleaned up `Layout.tsx` (removed chatbot widget)

## What Stays Unchanged

- All pages, routing, styles, SEO, blog, components — no visual changes
- `@supabase/supabase-js` dependency stays (just points to your Supabase)
