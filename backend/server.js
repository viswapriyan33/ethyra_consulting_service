/**
 * Standalone Node.js HTTP Server for ETHYRA Email API
 * Powered by Nodemailer with Gmail SMTP (Google App Passwords)
 *
 * Usage:
 *   node backend/server.js
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to avoid requiring external dotenv dependency
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const PORT = process.env.BACKEND_PORT || 5000;

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => {
      try {
        const fullBody = Buffer.concat(chunks).toString('utf8');
        resolve(fullBody ? JSON.parse(fullBody) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function getTransporter() {
  const user = (process.env.GMAIL_USER || '').trim();
  const rawPass = (process.env.GMAIL_APP_PASSWORD || '').trim();
  const pass = rawPass.replace(/\s+/g, '');

  if (!user || !pass) {
    return { transporter: null, user: null };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return { transporter, user };
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = req.url.split('?')[0];

  if (url === '/api/emailStatus' && req.method === 'GET') {
    const { transporter, user } = getTransporter();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      configured: !!transporter,
      user: user ? `${user.split('@')[0].slice(0, 3)}***@${user.split('@')[1] || ''}` : null,
    }));
  }

  if (url === '/api/sendReportEmailWithPdf' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { to, subject, html, filename, pdfBase64, adminEmail } = await parseJsonBody(req);
      const { transporter, user } = getTransporter();

      if (!transporter) {
        res.statusCode = 400;
        return res.end(JSON.stringify({
          success: false,
          error: 'GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env',
        }));
      }

      const targetUserEmail = (to || '').trim();
      if (!targetUserEmail) {
        res.statusCode = 400;
        return res.end(JSON.stringify({
          success: false,
          error: 'Recipient user email is required.',
        }));
      }

      const attachments = [];
      if (pdfBase64) {
        let cleanBase64 = String(pdfBase64).trim();
        if (cleanBase64.includes(';base64,')) {
          cleanBase64 = cleanBase64.split(';base64,')[1];
        } else if (cleanBase64.startsWith('data:')) {
          cleanBase64 = cleanBase64.replace(/^data:[^,]+,/, '');
        }
        cleanBase64 = cleanBase64.replace(/\s+/g, '');

        const pdfBuffer = Buffer.from(cleanBase64, 'base64');
        const magic = pdfBuffer.slice(0, 4).toString('utf8');
        console.log(`[Gmail SMTP] Decoded PDF attachment (${pdfBuffer.length} bytes, header: "${magic}")`);

        attachments.push({
          filename: filename || 'ETHYRA_Impact_Assessment_Report.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        });
      }

      const mailOptions = {
        from: `"ETHYRA Impact" <${user}>`,
        to: targetUserEmail,
        subject: subject || 'ETHYRA Impact Assessment Report',
        html: html || '<p>Your ETHYRA Impact Report is attached.</p>',
        attachments,
      };

      const secondary = (adminEmail || process.env.ADMIN_EMAIL || '').trim();
      if (secondary && secondary.toLowerCase() !== targetUserEmail.toLowerCase()) {
        mailOptions.bcc = secondary;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Standalone Server] Sent email FROM ${user} TO ${targetUserEmail} (${info.messageId})`);
      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        messageId: info.messageId,
        from: user,
        to: targetUserEmail,
      }));
    } catch (err) {
      console.error('[Standalone Server ERROR]', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({
        success: false,
        error: err.message,
      }));
    }
  }

  if (url === '/api/sendPaymentNotification' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { fullName, email, organizationName, phone, utrNumber, emailSubject, emailBodyHtml } = await parseJsonBody(req);
      const { transporter, user } = getTransporter();

      if (!transporter) {
        res.statusCode = 200;
        return res.end(JSON.stringify({
          success: true,
          simulated: true,
          note: 'Gmail credentials not configured in .env. Notification logged only.',
        }));
      }

      const recipients = [
        process.env.ADMIN_EMAIL || 'connect@ethyra.in',
        'viswapriyan10@gmail.com',
      ];

      const info = await transporter.sendMail({
        from: `"ETHYRA Impact System" <${user}>`,
        to: recipients,
        subject: emailSubject || `[PAYMENT ALERT] New Assessment Submission - ${organizationName} (UTR: ${utrNumber})`,
        html: emailBodyHtml,
      });

      console.log(`[Standalone Server] Sent payment alert to ${recipients.join(', ')} (${info.messageId})`);
      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        messageId: info.messageId,
        recipients,
      }));
    } catch (err) {
      console.error('[Standalone Server ERROR]', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({
        success: false,
        error: err.message,
      }));
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`⚡ ETHYRA Email Backend Server running on http://localhost:${PORT}`);
});
