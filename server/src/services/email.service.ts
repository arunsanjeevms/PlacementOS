import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { baseEmail } from "../utils/emailTemplates.js";

const resend = env.email.resendApiKey ? new Resend(env.email.resendApiKey) : null;

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

/** Sends an email via Resend; in dev (or without a key) it logs to the console instead. */
export async function sendEmail({ to, subject, html }: SendArgs): Promise<void> {
  if (!resend) {
    logger.warn(`[email:mock] → ${to} | ${subject}`);
    logger.debug("[email:mock] body preview", html.slice(0, 240));
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: env.email.from, to, subject, html });
    if (error) logger.error("Resend error", error);
    else logger.info(`Email sent → ${to} (${subject})`);
  } catch (err) {
    logger.error("Failed to send email", err);
  }
}

export function sendVerificationEmail(to: string, name: string, url: string): Promise<void> {
  return sendEmail({
    to,
    subject: "Verify your PlacementOS email",
    html: baseEmail({
      title: "Verify your email",
      greeting: `Hey ${name},`,
      body: "Welcome to PlacementOS — your placement-prep command center. Confirm your email to unlock daily digests and reminders.",
      ctaLabel: "Verify Email",
      ctaUrl: url,
      footnote: "This link expires in 24 hours. If you didn't sign up, you can ignore this email.",
    }),
  });
}

export function sendPasswordResetEmail(to: string, name: string, url: string): Promise<void> {
  return sendEmail({
    to,
    subject: "Reset your PlacementOS password",
    html: baseEmail({
      title: "Reset your password",
      greeting: `Hey ${name},`,
      body: "We received a request to reset your password. Click the button below to choose a new one.",
      ctaLabel: "Reset Password",
      ctaUrl: url,
      footnote: "This link expires in 1 hour. If you didn't request this, your password is still safe.",
    }),
  });
}
