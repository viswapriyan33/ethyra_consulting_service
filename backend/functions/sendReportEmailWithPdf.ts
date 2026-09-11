// @ts-nocheck
/**
 * Backend Email Dispatch Function using Gmail SMTP & Google App Passwords (via Nodemailer)
 * Replaces previous Resend API implementation.
 */

import nodemailer from "nodemailer";

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    filename?: string;
    pdfBase64?: string;
    attemptId?: string;
    adminEmail?: string;
}

export function createGmailTransporter() {
    const user = (process.env.GMAIL_USER || "").trim();
    const rawPass = (process.env.GMAIL_APP_PASSWORD || "").trim();
    const pass = rawPass.replace(/\s+/g, ""); // Strip whitespace from 16-char app password

    if (!user || !pass) {
        throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD is not set in the environment.");
    }

    return {
        user,
        transporter: nodemailer.createTransport({
            service: "gmail",
            auth: {
                user,
                pass,
            },
        }),
    };
}

export async function sendReportEmailWithPdf(payload: EmailPayload) {
    const { to, subject, html, filename, pdfBase64, adminEmail } = payload;
    const { user, transporter } = createGmailTransporter();

    const targetUserEmail = (to || "").trim();
    if (!targetUserEmail) {
        throw new Error("Recipient user email is required.");
    }

    const attachments = [];
    if (pdfBase64) {
        let base64Clean = String(pdfBase64).trim();
        if (base64Clean.includes(";base64,")) {
            base64Clean = base64Clean.split(";base64,")[1];
        } else if (base64Clean.startsWith("data:")) {
            base64Clean = base64Clean.replace(/^data:[^,]+,/, "");
        }
        base64Clean = base64Clean.replace(/\s+/g, "");

        const pdfBuffer = Buffer.from(base64Clean, "base64");
        const magic = pdfBuffer.slice(0, 4).toString("utf8");
        console.log(`[Gmail SMTP] Decoded PDF attachment (${pdfBuffer.length} bytes, header: "${magic}")`);

        attachments.push({
            filename: filename || "ETHYRA_Impact_Assessment_Report.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
        });
    }

    const mailOptions = {
        from: `"ETHYRA Impact" <${user}>`,
        to: targetUserEmail,
        subject: subject || "ETHYRA Impact Assessment Report",
        html: html || "<p>Your ETHYRA Impact Report is attached.</p>",
        attachments,
    };

    const secondary = (adminEmail || process.env.ADMIN_EMAIL || "").trim();
    if (secondary && secondary.toLowerCase() !== targetUserEmail.toLowerCase()) {
        mailOptions.bcc = secondary;
    }

    let attempts = 0;
    let lastError = null;

    while (attempts < 3) {
        attempts++;
        try {
            const info = await transporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: info.messageId,
                from: user,
                to: targetUserEmail,
                attempts,
            };
        } catch (err: any) {
            lastError = err;
            if (attempts < 3) {
                await new Promise((resolve) => setTimeout(resolve, attempts * 1000));
            }
        }
    }

    throw new Error(`Failed to send email via Gmail SMTP after ${attempts} attempts: ${lastError?.message || lastError}`);
}

export default sendReportEmailWithPdf;
