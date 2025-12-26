/**
 * Resend Email Client
 *
 * Handles email sending through Resend API
 * Documentation: https://resend.com/docs/send-with-nodejs
 */

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML email content
 * @returns Promise with email send result
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Uphold <noreply@uphold.app>',
      to,
      subject,
      html,
    });

    console.log(`[Email] Sent to ${to}: ${subject} (ID: ${result.data?.id})`);
    return result;
  } catch (error: any) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    throw error;
  }
}
