import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const GOOGLE_CLOUD_API_KEY = Deno.env.get("GOOGLE_CLOUD_API_KEY");
const GOOGLE_CLOUD_PROJECT_ID = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID");
const RECAPTCHA_SITE_KEY = Deno.env.get("RECAPTCHA_SITE_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "no-reply@hyrx.tech";
const REPLY_TO_EMAIL = Deno.env.get("REPLY_TO_EMAIL") || "contact@hyrx.tech";
const INTERNAL_NOTIFY_EMAIL = Deno.env.get("INTERNAL_NOTIFY_EMAIL") || "contact@hyrx.tech";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "https://hyrx.tech,https://www.hyrx.tech,http://localhost:5173,http://localhost:8080")
  .split(",")
  .map((origin: string) => origin.trim())
  .filter(Boolean);

const getCorsHeaders = (origin: string | null) => {
  const fallbackOrigin = allowedOrigins[0] || "https://hyrx.tech";
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : fallbackOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

const ContactFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(120).optional().nullable(),
  services: z.array(z.string().trim().max(80)).max(20).default([]),
  budget: z.string().trim().max(80).optional().nullable().default(""),
  message: z.string().trim().min(1).max(5000),
  recaptchaToken: z.string().trim().min(20).max(4000),
});

const SERVICE_LABELS: Record<string, string> = {
  "ai-agents": "AI Agents & Automations",
  "chatbots": "Custom AI Chatbots",
  "3d-ar": "3D & AR Modelling",
  "other": "Other",
};

const BUDGET_LABELS: Record<string, string> = {
  "1k-5k": "$1,000 - $5,000",
  "5k-15k": "$5,000 - $15,000",
  "15k-30k": "$15,000 - $30,000",
  "50k+": "$50,000+",
  "not-sure": "Not sure yet",
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendBrevoEmail(params: {
  to: Array<{ email: string; name?: string }>;
  from: { email: string; name: string };
  replyTo?: { email: string };
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!BREVO_API_KEY) {
    return { success: false, error: "BREVO_API_KEY is missing" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: params.from,
        to: params.to,
        replyTo: params.replyTo,
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Brevo ${response.status}: ${text}` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Brevo error";
    return { success: false, error: message };
  }
}

async function verifyRecaptcha(token: string): Promise<{ ok: boolean; error?: string }> {
  if (!GOOGLE_CLOUD_API_KEY || !GOOGLE_CLOUD_PROJECT_ID || !RECAPTCHA_SITE_KEY) {
    return {
      ok: false,
      error: "Spam protection is not configured. Missing GOOGLE_CLOUD_API_KEY, GOOGLE_CLOUD_PROJECT_ID, or RECAPTCHA_SITE_KEY.",
    };
  }

  const endpoint = `https://recaptchaenterprise.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/assessments?key=${GOOGLE_CLOUD_API_KEY}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        token,
        siteKey: RECAPTCHA_SITE_KEY,
        expectedAction: "contact_form",
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorMessage = result?.error?.message || "reCAPTCHA verification failed";
    return { ok: false, error: errorMessage };
  }

  const tokenValid = result?.tokenProperties?.valid === true;
  const score = Number(result?.riskAnalysis?.score ?? 0);
  const action = result?.tokenProperties?.action;

  if (!tokenValid || action !== "contact_form" || score < 0.5) {
    return { ok: false, error: "Spam detection triggered. Please try again." };
  }

  return { ok: true };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const payload = await req.json();
    const parsed = ContactFormSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid request payload";
      return new Response(JSON.stringify({ success: false, error: firstIssue }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { name, email, company, services, budget, message, recaptchaToken } = parsed.data;

    const recaptchaCheck = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaCheck.ok) {
      return new Response(JSON.stringify({ success: false, error: recaptchaCheck.error }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error: insertError } = await admin.from("contact_submissions").insert({
        name,
        email,
        company: company || null,
        services,
        budget: budget || null,
        message,
        status: "pending",
      });

      if (insertError) {
        console.error("contact_submissions insert failed", insertError);
      }
    } else {
      console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing; skipping DB insert");
    }

    const servicesLabel = services.length > 0
      ? services.map((value: string) => SERVICE_LABELS[value] || value).join(", ")
      : "Not specified";
    const budgetLabel = budget ? (BUDGET_LABELS[budget] || budget) : "Not specified";

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = company ? escapeHtml(company) : "Not provided";
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");

    const userHtml = `
      <h2>Thanks for contacting HYRX, ${safeName}!</h2>
      <p>We received your request and will respond within 1-2 business days.</p>
      <p><strong>Services:</strong> ${servicesLabel}</p>
      <p><strong>Budget:</strong> ${budgetLabel}</p>
      <p><strong>Message:</strong><br>${safeMessage}</p>
      <p>Best regards,<br>HYRX Team</p>
    `;

    const internalHtml = `
      <h2>New contact submission</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Company:</strong> ${safeCompany}</p>
      <p><strong>Services:</strong> ${servicesLabel}</p>
      <p><strong>Budget:</strong> ${budgetLabel}</p>
      <p><strong>Message:</strong><br>${safeMessage}</p>
    `;

    const userEmail = await sendBrevoEmail({
      to: [{ email, name }],
      from: { email: FROM_EMAIL, name: "HYRX" },
      replyTo: { email: REPLY_TO_EMAIL },
      subject: "We received your message — HYRX",
      htmlContent: userHtml,
    });

    if (!userEmail.success) {
      console.error("User confirmation email failed", userEmail.error);
    }

    const internalEmail = await sendBrevoEmail({
      to: [{ email: INTERNAL_NOTIFY_EMAIL }],
      from: { email: FROM_EMAIL, name: "HYRX Website" },
      replyTo: { email },
      subject: `New quote request from ${name}`,
      htmlContent: internalHtml,
    });

    if (!internalEmail.success) {
      console.error("Internal notification email failed", internalEmail.error);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("send-contact-email error", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Something went wrong. Please email us directly at contact@hyrx.tech",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});