// Sends transactional mail via Resend's REST API — no SDK needed.
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendVerificationEmail(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const from = process.env.MAIL_FROM || "NODOLAB <noreply@nodolab.app>";

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Your NODOLAB verification code: ${code}`,
      text: `Your NODOLAB verification code is ${code}. It expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
      html:
        `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#111">` +
        `<p>Your NODOLAB verification code is:</p>` +
        `<p style="font-size:28px;font-weight:600;letter-spacing:4px">${code}</p>` +
        `<p style="color:#666">It expires in 15 minutes. If you didn't request this, ignore this email.</p>` +
        `</div>`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${detail}`);
  }
}
