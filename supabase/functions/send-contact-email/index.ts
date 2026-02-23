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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getCorsHeaders = (_origin: string | null) => corsHeaders;

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

    const emailBase = (headerAccent: string, headerLabel: string, bodyContent: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headerLabel}</title>
</head>
<body style="margin:0;padding:0;background-color:#090b18;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#090b18;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding:0 0 24px 0;">
              <img src="https://hyrx.tech/brandlogo.png" alt="HYRX" width="120" style="display:block;height:auto;" />
            </td>
          </tr>

          <!-- Gradient accent bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#00d4f5 0%,#ff1ab5 100%);border-radius:2px 2px 0 0;"></td>
          </tr>

          <!-- Card body -->
          <tr>
            <td style="background-color:#0d1122;border-radius:0 0 12px 12px;padding:36px 40px 32px 40px;">

              <!-- Header label -->
              <p style="margin:0 0 20px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${headerAccent};">${headerLabel}</p>

              ${bodyContent}

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 28px;">
                <tr><td style="height:1px;background-color:#1e2240;"></td></tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#3a4060;">© 2026 HYRX. All rights reserved.</p>
                    <p style="margin:4px 0 0 0;font-size:12px;"><a href="https://hyrx.tech" style="color:#00d4f5;text-decoration:none;">hyrx.tech</a></p>
                  </td>
                  <td align="right" valign="middle">
                    <img src="https://hyrx.tech/brandlogo.png" alt="HYRX" width="52" style="height:auto;opacity:0.4;" />
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const row = (label: string, value: string) => `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
        <tr>
          <td style="padding:12px 16px;background-color:#111528;border-radius:8px;border-left:3px solid #00d4f5;">
            <p style="margin:0 0 2px 0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#00d4f5;">${label}</p>
            <p style="margin:0;font-size:14px;color:#d0d8f0;line-height:1.6;">${value}</p>
          </td>
        </tr>
      </table>`;

    const userHtml = emailBase("#00d4f5", "Message Received", `
      <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#f0f5ff;line-height:1.3;">Thanks for reaching out, ${safeName}!</h1>
      <p style="margin:0 0 28px 0;font-size:15px;color:#8892b0;line-height:1.6;">We've received your request and will get back to you within <span style="color:#00d4f5;font-weight:600;">1–2 business days</span>.</p>
      ${row("Services Requested", servicesLabel)}
      ${row("Budget Range", budgetLabel)}
      ${row("Your Message", safeMessage)}
      <p style="margin:28px 0 0 0;font-size:14px;color:#8892b0;">In the meantime, explore what we build at <a href="https://hyrx.tech" style="color:#00d4f5;text-decoration:none;">hyrx.tech</a>.</p>
      <p style="margin:16px 0 0 0;font-size:14px;color:#8892b0;">Best regards,<br/><span style="color:#f0f5ff;font-weight:600;">The HYRX Team</span></p>
    `);

    const internalHtml = emailBase("#ff1ab5", "New Quote Request", `
      <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#f0f5ff;line-height:1.3;">New submission from ${safeName}</h1>
      <p style="margin:0 0 28px 0;font-size:14px;color:#8892b0;">A new contact form was submitted on <span style="color:#ff1ab5;font-weight:600;">hyrx.tech</span>.</p>
      ${row("Full Name", safeName)}
      ${row("Email", `<a href="mailto:${safeEmail}" style="color:#00d4f5;text-decoration:none;">${safeEmail}</a>`)}
      ${row("Company", safeCompany)}
      ${row("Services", servicesLabel)}
      ${row("Budget", budgetLabel)}
      ${row("Message", safeMessage)}
    `);

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