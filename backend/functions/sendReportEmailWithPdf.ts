// @ts-nocheck
// Deno Edge Function for Resend Email dispatch with jsPDF Attachment
// Matches Section 10 & 11 specifications

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { to, subject, html, filename, pdfBase64, attemptId, adminEmail } = await req.json();

        const RESEND_API_KEY =  Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not set on the server-side environment.");
        }

        // Convert data URL (e.g. data:application/pdf;base64,...) to format Resend requires
        const base64Data = pdfBase64.split(",")[1] || pdfBase64;

        const payload = {
            from: "ETHYRA Impact <onboarding@resend.dev>",
            to: [to, adminEmail || "connect@ethyra.in"],
            subject: subject,
            html: html,
            attachments: [
                {
                    filename: filename,
                    content: base64Data,
                },
            ],
        };

        let attempts = 0;
        let success = false;
        let messageId = "";
        let lastError = "";

        while (attempts < 3 && !success) {
            attempts++;
            try {
                const response = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (response.status >= 200 && response.status < 300) {
                    success = true;
                    messageId = result.id;
                } else if (response.status >= 400 && response.status < 500) {
                    // Permanent abort for 4xx errors
                    throw new Error(`Resend API Error (Permanent - 4xx): ${response.status} - ${JSON.stringify(result)}`);
                } else {
                    // 5xx errors: Retriable
                    throw new Error(`Resend API Error (Retriable - 5xx): ${response.status} - ${JSON.stringify(result)}`);
                }
            } catch (err: any) {
                lastError = err.message;
                if (err.message.includes("Permanent - 4xx")) {
                    break; // Abort retry
                }
                // Wait backoff: 1s for try 1, 2s for try 2
                if (attempts < 3) {
                    await new Promise(r => setTimeout(r, attempts * 1000));
                }
            }
        }

        if (!success) {
            throw new Error(`Failed to send email after ${attempts} attempts. Last error: ${lastError}`);
        }

        return new Response(
            JSON.stringify({
                success: true,
                messageId,
                attempts,
                recipients: [to, adminEmail || "connect@ethyra.in"],
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});

