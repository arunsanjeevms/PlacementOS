/* Reusable dark, on-brand HTML email shell. Inline styles only (email-client safe). */

interface BaseEmailArgs {
  title: string;
  greeting: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
  extraHtml?: string;
}

export function baseEmail({ title, greeting, body, ctaLabel, ctaUrl, footnote, extraHtml }: BaseEmailArgs): string {
  return `
  <div style="margin:0;padding:0;background:#0b0b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <div style="text-align:center;margin-bottom:28px;">
        <span style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#8b5cf6,#6366f1);-webkit-background-clip:text;background-clip:text;color:#8b5cf6;">🎯 PlacementOS</span>
      </div>
      <div style="background:#14141f;border:1px solid #23232f;border-radius:18px;padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#f4f4f6;">${title}</h1>
        <p style="margin:0 0 8px;font-size:15px;color:#c7c7d1;">${greeting}</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#a0a0ad;">${body}</p>
        ${
          ctaUrl && ctaLabel
            ? `<div style="text-align:center;margin:28px 0;">
                <a href="${ctaUrl}" style="display:inline-block;padding:13px 28px;border-radius:10px;background:linear-gradient(90deg,#8b5cf6,#6366f1);color:#fff;font-weight:600;font-size:15px;text-decoration:none;">${ctaLabel}</a>
              </div>
              <p style="margin:0 0 8px;font-size:12px;color:#6b6b78;word-break:break-all;">Or paste this link: ${ctaUrl}</p>`
            : ""
        }
        ${extraHtml ?? ""}
        ${footnote ? `<p style="margin:20px 0 0;font-size:12px;color:#6b6b78;border-top:1px solid #23232f;padding-top:16px;">${footnote}</p>` : ""}
      </div>
      <p style="text-align:center;margin:20px 0 0;font-size:12px;color:#565663;">You're receiving this because you have a PlacementOS account.</p>
    </div>
  </div>`;
}

/** Renders a compact list of task/deadline lines for digest emails. */
export function emailList(items: string[]): string {
  if (items.length === 0) return `<p style="margin:0;font-size:14px;color:#6b6b78;">Nothing here 🎉</p>`;
  return `<ul style="margin:0;padding-left:18px;color:#c7c7d1;font-size:14px;line-height:1.9;">${items
    .map((i) => `<li>${i}</li>`)
    .join("")}</ul>`;
}
