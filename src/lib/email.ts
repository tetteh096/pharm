import nodemailer from "nodemailer"
import { formatGhs } from "@/lib/format"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const BRAND_NAME = "Enviro Pharmacy"
const BRAND_PHONE_MADINA = "055 461 2072"
const BRAND_PHONE_ODORKOR = "059 937 6675"
const BRAND_PHONE_SAKUMONO = "053 088 3354"
const BRAND_EMAIL = "enviropharmacyltd@gmail.com"
const BRAND_LOCATIONS = "Madina, Odorkor & Sakumono, Accra"

function getAppBaseUrl(): string {
  // Priority: explicit config → Vercel auto-vars → dynamic fallback
  const configured =
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL

  if (configured) {
    // Already a full URL
    if (configured.startsWith("http://") || configured.startsWith("https://")) {
      return configured.replace(/\/$/, "") // strip trailing slash
    }
    // Vercel gives bare hostname — assume https in production
    return `https://${configured}`
  }

  // Local dev fallback — respects PORT env var so it matches whichever port
  // Next.js actually started on (3000, 3001, 3002, etc.)
  const port = process.env.PORT ?? "3000"
  return `http://localhost:${port}`
}

/**
 * Returns `false` when SMTP credentials are clearly not configured.
 * Lets callers gracefully skip mail sending without crashing the request.
 */
function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return false
  if (user.includes("your-email") || pass.includes("your-app-password")) return false
  return true
}

async function safeSend(opts: {
  to: string
  subject: string
  html: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    console.warn(
      `[email] SMTP not configured; skipping mail to ${opts.to} (${opts.subject}).`
    )
    return { ok: false, error: "SMTP_NOT_CONFIGURED" }
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `${BRAND_NAME} <no-reply@enviro.gh>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    return { ok: true }
  } catch (err) {
    console.error("[email] sendMail failed", err)
    return { ok: false, error: (err as Error).message }
  }
}

// ─── Shared HTML layout ──────────────────────────────────────────────────────

function emailLayout(opts: {
  preheader?: string
  title: string
  subtitle?: string
  bodyHtml: string
  /** Optional accent for the header (default: brand green). */
  accent?: string
}): string {
  const accent = opts.accent ?? "#13EC8A"
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(opts.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#eaf1fa;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    ${
      opts.preheader
        ? `<div style="display:none;font-size:1px;color:#eaf1fa;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(
            opts.preheader
          )}</div>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eaf1fa;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:linear-gradient(135deg, ${accent}, #1157EE); padding:28px 32px; text-align:center;">
                <div style="display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;background:rgba(255,255,255,0.18);border-radius:50%;margin-bottom:10px;">
                  <span style="color:#ffffff;font-size:26px;font-weight:700;line-height:1;">+</span>
                </div>
                <div style="color:#ffffff;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;opacity:0.9;">
                  ${escape(BRAND_NAME)}
                </div>
                <h1 style="color:#ffffff;font-size:22px;margin:6px 0 0 0;font-weight:800;">
                  ${escape(opts.title)}
                </h1>
                ${
                  opts.subtitle
                    ? `<p style="color:rgba(255,255,255,0.92);font-size:14px;margin:8px 0 0 0;">${escape(
                        opts.subtitle
                      )}</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:12px;line-height:1.6;">
                <strong style="color:#0f172a;">${escape(BRAND_NAME)}</strong><br/>
                ${escape(BRAND_LOCATIONS)}<br/>
                Madina: <a href="tel:${BRAND_PHONE_MADINA.replace(
                  /\s+/g,
                  ""
                )}" style="color:#1157EE;text-decoration:none;">${escape(
    BRAND_PHONE_MADINA
  )}</a>
                &nbsp;·&nbsp;
                Odorkor: <a href="tel:${BRAND_PHONE_ODORKOR.replace(
                  /\s+/g,
                  ""
                )}" style="color:#1157EE;text-decoration:none;">${escape(
    BRAND_PHONE_ODORKOR
  )}</a>
                <br/><br/>
                <span style="color:#94a3b8;">© ${new Date().getFullYear()} ${escape(
    BRAND_NAME
  )} · This email was sent because you placed an order with us.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/** Minimal escape for interpolation into HTML attributes/text. */
function escape(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// ─── Public mailers ──────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
) {
  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${resetToken}`

  const body = `
    <h2 style="color:#031130;font-size:18px;margin:0 0 10px 0;">Hi ${escape(name)},</h2>
    <p style="color:#475569;line-height:1.6;margin:0 0 18px 0;">
      You requested a password reset for your ${escape(BRAND_NAME)} account. Click the button below to set a new password.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${resetUrl}" style="background:#1157EE;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">Reset my password</a>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:0;">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
  `

  return safeSend({
    to,
    subject: `${BRAND_NAME} — Reset your password`,
    html: emailLayout({
      title: "Reset your password",
      subtitle: "Tap the button below to choose a new one",
      preheader: "Reset your Enviro Pharmacy password",
      bodyHtml: body,
      accent: "#1157EE",
    }),
  })
}

// ─── Order emails ────────────────────────────────────────────────────────────

export type OrderEmailItem = {
  productName: string
  quantity: number
  unitPrice: number
}

export type OrderEmailPayload = {
  to: string
  customerName: string
  orderNumber: string
  total: number
  items: OrderEmailItem[]
  paymentMethod: string | null
  fulfillmentType: string | null // "PICKUP" | "DELIVERY" | null
  branchName?: string | null
  deliveryAddress?: string | null
  deliveryNotes?: string | null
  deliveryLat?: number | null
  deliveryLng?: number | null
  placedAt: Date
}

function paymentLabel(method: string | null): string {
  if (!method) return "—"
  if (method.startsWith("CASH")) return "Cash on collection / delivery"
  if (method.startsWith("MOBILE")) return "Mobile money"
  return method
}

function itemsTable(items: OrderEmailItem[]): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;">
            ${escape(item.productName)}
            <div style="color:#94a3b8;font-size:12px;margin-top:2px;">${escape(
              formatGhs(item.unitPrice)
            )} × ${item.quantity}</div>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;text-align:right;white-space:nowrap;font-weight:700;">
            ${escape(formatGhs(item.unitPrice * item.quantity))}
          </td>
        </tr>`
    )
    .join("")

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px 0;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 12px;border-bottom:2px solid #e2e8f0;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
          <th align="right" style="padding:8px 12px;border-bottom:2px solid #e2e8f0;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

function deliveryBlock(p: OrderEmailPayload): string {
  if (!p.fulfillmentType) return ""
  const isPickup = p.fulfillmentType === "PICKUP"
  const lines: string[] = []
  lines.push(
    `<strong style="color:#0f172a;">${
      isPickup ? "Pickup at" : "Delivery from"
    }:</strong> ${escape(p.branchName ?? "—")}`
  )
  if (!isPickup && p.deliveryAddress) {
    lines.push(`<strong style="color:#0f172a;">Address:</strong> ${escape(p.deliveryAddress)}`)
  }
  if (!isPickup && p.deliveryLat && p.deliveryLng) {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.deliveryLat},${p.deliveryLng}`
    lines.push(
      `<strong style="color:#0f172a;">GPS:</strong> <a href="${mapsUrl}" style="color:#1157EE;text-decoration:none;">${p.deliveryLat.toFixed(
        5
      )}, ${p.deliveryLng.toFixed(5)}</a>`
    )
  }
  if (p.deliveryNotes) {
    lines.push(`<strong style="color:#0f172a;">Notes:</strong> ${escape(p.deliveryNotes)}`)
  }
  return `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:18px 0 0 0;font-size:13px;color:#0f172a;line-height:1.8;">
      ${lines.map((l) => `<div>${l}</div>`).join("")}
    </div>
  `
}

export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
  const placedAt = payload.placedAt.toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const body = `
    <p style="color:#0f172a;font-size:15px;margin:0 0 6px 0;">
      Hi <strong>${escape(payload.customerName)}</strong>,
    </p>
    <p style="color:#475569;line-height:1.65;margin:0 0 18px 0;">
      Thanks for your order with ${escape(
        BRAND_NAME
      )}. A pharmacist will review your items and call you shortly to confirm availability.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin:0 0 18px 0;">
      <div style="color:#15803d;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Order number</div>
      <div style="color:#0f172a;font-size:20px;font-weight:800;letter-spacing:0.02em;margin-top:2px;">${escape(
        payload.orderNumber
      )}</div>
      <div style="color:#64748b;font-size:12px;margin-top:6px;">Placed ${escape(placedAt)}</div>
    </div>

    <h3 style="color:#0f172a;font-size:15px;margin:0 0 8px 0;">Your items</h3>
    ${itemsTable(payload.items)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
      <tr>
        <td style="padding:8px 12px;color:#475569;font-size:14px;">Subtotal</td>
        <td align="right" style="padding:8px 12px;color:#0f172a;font-size:14px;font-weight:700;">${escape(
          formatGhs(payload.total)
        )}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#475569;font-size:14px;">${
          payload.fulfillmentType === "PICKUP" ? "Pickup" : "Delivery"
        }</td>
        <td align="right" style="padding:8px 12px;color:#0f172a;font-size:14px;font-weight:700;">
          ${payload.fulfillmentType === "PICKUP" ? "Free" : "On collection"}
        </td>
      </tr>
      <tr>
        <td style="padding:12px;border-top:2px solid #e2e8f0;color:#0f172a;font-size:16px;font-weight:800;">Total</td>
        <td align="right" style="padding:12px;border-top:2px solid #e2e8f0;color:#1157EE;font-size:18px;font-weight:800;">${escape(
          formatGhs(payload.total)
        )}</td>
      </tr>
    </table>

    <p style="color:#475569;font-size:13px;margin:14px 0 0 0;">
      <strong style="color:#0f172a;">Payment:</strong> ${escape(paymentLabel(payload.paymentMethod))}
    </p>

    ${deliveryBlock(payload)}

    <h3 style="color:#0f172a;font-size:15px;margin:22px 0 8px 0;">What happens next?</h3>
    <ol style="color:#475569;font-size:13px;line-height:1.8;padding-left:18px;margin:0;">
      <li>A pharmacist confirms availability and reviews any prescription items.</li>
      <li>We will call you on the number you provided.</li>
      <li>${
        payload.fulfillmentType === "PICKUP"
          ? "Collect your order from the branch within 30 minutes."
          : "Our rider will deliver to the address you pinned."
      }</li>
      <li>You will receive a final email once your order is completed.</li>
    </ol>
  `

  return safeSend({
    to: payload.to,
    subject: `${BRAND_NAME} — Order ${payload.orderNumber} received`,
    html: emailLayout({
      title: "Order received",
      subtitle: "We're preparing your medications now",
      preheader: `Order ${payload.orderNumber} · ${formatGhs(payload.total)}`,
      bodyHtml: body,
      accent: "#13EC8A",
    }),
  })
}

export async function sendOrderDeliveredEmail(payload: OrderEmailPayload) {
  const completedAt = new Date().toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const isPickup = payload.fulfillmentType === "PICKUP"

  const body = `
    <p style="color:#0f172a;font-size:15px;margin:0 0 6px 0;">
      Hi <strong>${escape(payload.customerName)}</strong>,
    </p>
    <p style="color:#475569;line-height:1.65;margin:0 0 18px 0;">
      Your order has been ${
        isPickup ? "collected" : "delivered"
      } and payment is marked as completed. Thank you for choosing ${escape(BRAND_NAME)} — we hope you feel better soon.
    </p>

    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:14px 16px;margin:0 0 18px 0;">
      <div style="color:#047857;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Order completed</div>
      <div style="color:#0f172a;font-size:20px;font-weight:800;letter-spacing:0.02em;margin-top:2px;">${escape(
        payload.orderNumber
      )}</div>
      <div style="color:#475569;font-size:12px;margin-top:6px;">Completed ${escape(completedAt)}</div>
    </div>

    <h3 style="color:#0f172a;font-size:15px;margin:0 0 8px 0;">Receipt summary</h3>
    ${itemsTable(payload.items)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
      <tr>
        <td style="padding:12px;border-top:2px solid #e2e8f0;color:#0f172a;font-size:16px;font-weight:800;">Total paid</td>
        <td align="right" style="padding:12px;border-top:2px solid #e2e8f0;color:#047857;font-size:18px;font-weight:800;">${escape(
          formatGhs(payload.total)
        )}</td>
      </tr>
    </table>

    <p style="color:#475569;font-size:13px;margin:16px 0 0 0;">
      <strong style="color:#0f172a;">Payment method:</strong> ${escape(paymentLabel(payload.paymentMethod))}
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin:20px 0 0 0;color:#475569;font-size:13px;line-height:1.7;">
      Need a follow-up consultation or have a question about your prescription?
      Call us anytime — Madina <a href="tel:${BRAND_PHONE_MADINA.replace(
        /\s+/g,
        ""
      )}" style="color:#1157EE;text-decoration:none;">${escape(BRAND_PHONE_MADINA)}</a>
      or Odorkor <a href="tel:${BRAND_PHONE_ODORKOR.replace(
        /\s+/g,
        ""
      )}" style="color:#1157EE;text-decoration:none;">${escape(BRAND_PHONE_ODORKOR)}</a>.
    </div>
  `

  return safeSend({
    to: payload.to,
    subject: `${BRAND_NAME} — Order ${payload.orderNumber} completed`,
    html: emailLayout({
      title: isPickup ? "Order collected" : "Order delivered",
      subtitle: "Payment completed · Thank you for shopping with us",
      preheader: `Order ${payload.orderNumber} completed · ${formatGhs(payload.total)}`,
      bodyHtml: body,
      accent: "#047857",
    }),
  })
}

// ─── Consultation request emails ──────────────────────────────────────────────

export type ConsultationEmailPayload = {
  fullName: string
  email: string
  phone: string
  medicationInterest?: string | null
  message: string
  submittedAt: Date
}

/** Confirmation email sent to the person who filled the form. */
export async function sendConsultationConfirmationEmail(
  payload: ConsultationEmailPayload
) {
  const submittedAt = payload.submittedAt.toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const body = `
    <p style="color:#0f172a;font-size:15px;margin:0 0 6px 0;">
      Hi <strong>${escape(payload.fullName)}</strong>,
    </p>
    <p style="color:#475569;line-height:1.65;margin:0 0 18px 0;">
      Thank you for reaching out to ${escape(BRAND_NAME)}. One of our certified pharmacists
      will review your request and get back to you as soon as possible — usually within a few hours.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 18px;margin:0 0 20px 0;">
      <div style="color:#15803d;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:10px;">Your request summary</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#0f172a;">
        <tr><td style="padding:4px 0;color:#475569;width:38%;">Name</td><td style="padding:4px 0;font-weight:600;">${escape(payload.fullName)}</td></tr>
        <tr><td style="padding:4px 0;color:#475569;">Email</td><td style="padding:4px 0;font-weight:600;">${escape(payload.email)}</td></tr>
        <tr><td style="padding:4px 0;color:#475569;">Phone</td><td style="padding:4px 0;font-weight:600;">${escape(payload.phone)}</td></tr>
        ${payload.medicationInterest ? `<tr><td style="padding:4px 0;color:#475569;">Medication interest</td><td style="padding:4px 0;font-weight:600;">${escape(payload.medicationInterest)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#475569;">Submitted</td><td style="padding:4px 0;">${escape(submittedAt)}</td></tr>
      </table>
    </div>

    <div style="background:#f8fafc;border-left:4px solid #13EC8A;border-radius:4px;padding:14px 16px;margin:0 0 18px 0;color:#475569;font-size:13px;line-height:1.7;">
      <strong style="color:#0f172a;">Your message:</strong><br/>
      ${escape(payload.message)}
    </div>

    <p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 16px 0;">
      In the meantime, you are welcome to reach us directly:<br/>
      Madina (24 hrs): <a href="tel:${BRAND_PHONE_MADINA.replace(/\s+/g, "")}" style="color:#1157EE;text-decoration:none;">${escape(BRAND_PHONE_MADINA)}</a><br/>
      Odorkor: <a href="tel:${BRAND_PHONE_ODORKOR.replace(/\s+/g, "")}" style="color:#1157EE;text-decoration:none;">${escape(BRAND_PHONE_ODORKOR)}</a><br/>
      Sakumono: <a href="tel:${BRAND_PHONE_SAKUMONO.replace(/\s+/g, "")}" style="color:#1157EE;text-decoration:none;">${escape(BRAND_PHONE_SAKUMONO)}</a>
    </p>
  `

  return safeSend({
    to: payload.email,
    subject: `${BRAND_NAME} — We received your consultation request`,
    html: emailLayout({
      title: "Consultation request received",
      subtitle: "A pharmacist will be in touch shortly",
      preheader: "Your consultation request has been received by Enviro Pharmacy",
      bodyHtml: body,
      accent: "#13EC8A",
    }),
  })
}

/** Internal notification email sent to the pharmacy's own inbox. */
export async function sendConsultationNotificationEmail(
  payload: ConsultationEmailPayload
) {
  const submittedAt = payload.submittedAt.toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const body = `
    <p style="color:#0f172a;font-size:15px;margin:0 0 16px 0;">
      A new consultation request was submitted on the website.
    </p>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 18px;margin:0 0 20px 0;">
      <div style="color:#92400e;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:10px;">Requester details</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#0f172a;">
        <tr><td style="padding:4px 0;color:#78350f;width:38%;">Full name</td><td style="padding:4px 0;font-weight:700;">${escape(payload.fullName)}</td></tr>
        <tr><td style="padding:4px 0;color:#78350f;">Email</td><td style="padding:4px 0;"><a href="mailto:${escape(payload.email)}" style="color:#1157EE;text-decoration:none;font-weight:600;">${escape(payload.email)}</a></td></tr>
        <tr><td style="padding:4px 0;color:#78350f;">Phone</td><td style="padding:4px 0;"><a href="tel:${escape(payload.phone.replace(/\s+/g, ""))}" style="color:#1157EE;text-decoration:none;font-weight:600;">${escape(payload.phone)}</a></td></tr>
        ${payload.medicationInterest ? `<tr><td style="padding:4px 0;color:#78350f;">Medication interest</td><td style="padding:4px 0;font-weight:600;">${escape(payload.medicationInterest)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#78350f;">Submitted at</td><td style="padding:4px 0;">${escape(submittedAt)}</td></tr>
      </table>
    </div>

    <div style="background:#f8fafc;border-left:4px solid #f59e0b;border-radius:4px;padding:14px 16px;margin:0 0 18px 0;color:#475569;font-size:13px;line-height:1.7;">
      <strong style="color:#0f172a;">Message / Instructions:</strong><br/>
      ${escape(payload.message)}
    </div>

    <p style="color:#64748b;font-size:12px;margin:0;">
      Log in to the dashboard to view and manage this request.
    </p>
  `

  return safeSend({
    to: BRAND_EMAIL,
    subject: `[New Consultation] ${payload.fullName} — ${payload.phone}`,
    html: emailLayout({
      title: "New consultation request",
      subtitle: `From ${payload.fullName}`,
      preheader: `New consultation from ${payload.fullName} · ${payload.phone}`,
      bodyHtml: body,
      accent: "#f59e0b",
    }),
  })
}

// ─── Contact form emails ──────────────────────────────────────────────────────

export type ContactEmailPayload = {
  fullName: string
  email: string
  phone: string
  branch: string
  subject: string
  message: string
  submittedAt: Date
}

export async function sendContactConfirmationEmail(payload: ContactEmailPayload) {
  const submittedAt = payload.submittedAt.toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const body = `
    <p style="color:#0f172a;font-size:15px;margin:0 0 6px 0;">
      Hi <strong>${escape(payload.fullName)}</strong>,
    </p>
    <p style="color:#475569;line-height:1.65;margin:0 0 18px 0;">
      Thank you for contacting ${escape(BRAND_NAME)}. Our team has received your message
      and will respond as soon as possible.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 18px;margin:0 0 20px 0;">
      <div style="color:#15803d;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:10px;">Your message summary</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#0f172a;">
        <tr><td style="padding:4px 0;color:#475569;width:38%;">Subject</td><td style="padding:4px 0;font-weight:600;">${escape(payload.subject)}</td></tr>
        <tr><td style="padding:4px 0;color:#475569;">Branch</td><td style="padding:4px 0;font-weight:600;">${escape(payload.branch)}</td></tr>
        <tr><td style="padding:4px 0;color:#475569;">Submitted</td><td style="padding:4px 0;">${escape(submittedAt)}</td></tr>
      </table>
    </div>
    <div style="background:#f8fafc;border-left:4px solid #13EC8A;border-radius:4px;padding:14px 16px;color:#475569;font-size:13px;line-height:1.7;">
      ${escape(payload.message)}
    </div>
  `

  return safeSend({
    to: payload.email,
    subject: `${BRAND_NAME} — We received your message`,
    html: emailLayout({
      title: "Message received",
      subtitle: "We'll get back to you shortly",
      preheader: "Your contact message was received by Enviro Pharmacy",
      bodyHtml: body,
      accent: "#13EC8A",
    }),
  })
}

export async function sendContactNotificationEmail(payload: ContactEmailPayload) {
  const submittedAt = payload.submittedAt.toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const body = `
    <p style="color:#475569;line-height:1.65;margin:0 0 18px 0;">
      A new contact form message was submitted on the website.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#0f172a;">
      <tr><td style="padding:4px 0;color:#475569;width:38%;">Name</td><td style="padding:4px 0;font-weight:600;">${escape(payload.fullName)}</td></tr>
      <tr><td style="padding:4px 0;color:#475569;">Email</td><td style="padding:4px 0;font-weight:600;">${escape(payload.email)}</td></tr>
      <tr><td style="padding:4px 0;color:#475569;">Phone</td><td style="padding:4px 0;font-weight:600;">${escape(payload.phone)}</td></tr>
      <tr><td style="padding:4px 0;color:#475569;">Branch</td><td style="padding:4px 0;font-weight:600;">${escape(payload.branch)}</td></tr>
      <tr><td style="padding:4px 0;color:#475569;">Subject</td><td style="padding:4px 0;font-weight:600;">${escape(payload.subject)}</td></tr>
      <tr><td style="padding:4px 0;color:#475569;">Submitted</td><td style="padding:4px 0;">${escape(submittedAt)}</td></tr>
    </table>
    <div style="background:#f8fafc;border-left:4px solid #1157EE;border-radius:4px;padding:14px 16px;margin:18px 0 0 0;color:#475569;font-size:13px;line-height:1.7;">
      <strong style="color:#0f172a;">Message:</strong><br/>
      ${escape(payload.message)}
    </div>
  `

  return safeSend({
    to: BRAND_EMAIL,
    subject: `[Contact] ${payload.subject} — ${payload.fullName}`,
    html: emailLayout({
      title: "New contact message",
      subtitle: payload.subject,
      preheader: `Contact from ${payload.fullName} · ${payload.phone}`,
      bodyHtml: body,
      accent: "#1157EE",
    }),
  })
}
