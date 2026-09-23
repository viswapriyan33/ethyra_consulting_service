import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';

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

function getTransporter(env) {
  const user = (env.GMAIL_USER || process.env.GMAIL_USER || '').trim();
  const rawPass = (env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').trim();
  const pass = rawPass.replace(/\s+/g, '');

  if (!user || !pass) {
    return { transporter: null, user: null };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  return { transporter, user };
}

function gmailSmtpPlugin(env) {
  return {
    name: 'gmail-smtp-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        if (url === '/api/emailStatus' && req.method === 'GET') {
          const { transporter, user } = getTransporter(env);
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
            const { transporter, user } = getTransporter(env);

            if (!transporter) {
              console.warn('[Gmail SMTP] GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.');
              res.statusCode = 400;
              return res.end(JSON.stringify({
                success: false,
                error: 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.',
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
              let base64Clean = String(pdfBase64).trim();
              if (base64Clean.includes(';base64,')) {
                base64Clean = base64Clean.split(';base64,')[1];
              } else if (base64Clean.startsWith('data:')) {
                base64Clean = base64Clean.replace(/^data:[^,]+,/, '');
              }
              base64Clean = base64Clean.replace(/\s+/g, '');

              const pdfBuffer = Buffer.from(base64Clean, 'base64');
              const magic = pdfBuffer.slice(0, 4).toString('utf8');
              console.log(`[Gmail SMTP] Decoded PDF attachment (${pdfBuffer.length} bytes, header: "${magic}")`);

              attachments.push({
                filename: filename || 'ETHYRA_Impact_Assessment_Report.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf',
              });
            }

            // Send FROM the admin Gmail configured via App Password
            // TO the user's email address provided during login
            const mailOptions = {
              from: `"ETHYRA Impact" <${user}>`,
              to: targetUserEmail,
              subject: subject || 'ETHYRA Impact Assessment Report',
              html: html || '<p>Your ETHYRA Impact Report is attached.</p>',
              attachments,
            };

            const secondaryAdmin = (adminEmail || env.ADMIN_EMAIL || '').trim();
            if (secondaryAdmin && secondaryAdmin.toLowerCase() !== targetUserEmail.toLowerCase()) {
              mailOptions.bcc = secondaryAdmin;
            }

            const info = await transporter.sendMail(mailOptions);
            console.log(`[Gmail SMTP SUCCESS] Sent report email FROM ${user} TO ${targetUserEmail} (Message ID: ${info.messageId})`);

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              messageId: info.messageId,
              from: user,
              to: targetUserEmail,
            }));
          } catch (error) {
            console.error('[Gmail SMTP ERROR] Failed to send report email:', error);
            res.statusCode = 500;
            return res.end(JSON.stringify({
              success: false,
              error: error.message || 'Failed to send email via Gmail SMTP',
            }));
          }
        }

        if (url === '/api/sendPaymentNotification' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { fullName, email, organizationName, phone, utrNumber, emailSubject, emailBodyHtml } = await parseJsonBody(req);
            const { transporter, user } = getTransporter(env);

            if (!transporter) {
              console.warn('[Gmail SMTP] GMAIL_USER or GMAIL_APP_PASSWORD not set in .env. Notification logged only.');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                simulated: true,
                note: 'Gmail credentials not configured in .env. Notification processed locally.',
              }));
            }

            const recipients = [
              env.ADMIN_EMAIL || 'connect@ethyra.in',
              'viswapriyan10@gmail.com',
            ];

            const mailOptions = {
              from: `"ETHYRA Impact System" <${user}>`,
              to: recipients,
              subject: emailSubject || `[PAYMENT ALERT] New Assessment Submission - ${organizationName} (UTR: ${utrNumber})`,
              html: emailBodyHtml,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`[Gmail SMTP SUCCESS] Sent payment notification to ${recipients.join(', ')} (Message ID: ${info.messageId})`);

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              messageId: info.messageId,
              recipients,
            }));
          } catch (error) {
            console.error('[Gmail SMTP ERROR] Failed to send payment notification:', error);
            res.statusCode = 500;
            return res.end(JSON.stringify({
              success: false,
              error: error.message || 'Failed to send payment notification via Gmail SMTP',
            }));
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      gmailSmtpPlugin(env),
    ],
  };
});
