/**
 * Payment notification service
 *
 * IMPORTANT:
 * This file runs in the React browser.
 * Do NOT import nodemailer here.
 *
 * Email sending must happen on the backend/server.
 */

export async function sendPaymentNotifications({
    fullName,
    email,
    organizationName,
    phone,
    utrNumber,
}) {
    const emailRecipients = [
        "viswapriyan10@gmail.com",
        "connect@ethyra.in",
    ];

    const smsRecipient = "+918610904242";

    console.log("==========================================");
    console.log("⚡ [PAYMENT NOTIFICATION TRIGGERED]");
    console.log(`User Name: ${fullName}`);
    console.log(`User Email: ${email}`);
    console.log(`Organisation: ${organizationName}`);
    console.log(`Phone: ${phone}`);
    console.log(`Transaction ID: ${utrNumber}`);
    console.log("==========================================");

    const emailSubject =
        `[PAYMENT ALERT] New Assessment Submission - ${organizationName} (UTR: ${utrNumber})`;

    const emailBodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            
            <div style="background: linear-gradient(135deg, #0047AB, #00AEEF); padding: 24px; text-align: center; color: white;">
                <h2 style="margin: 0; font-size: 20px; font-weight: bold;">
                    ETHYRA Impact - New Payment Submitted
                </h2>

                <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">
                    Pending Verification Required
                </p>
            </div>

            <div style="padding: 24px; color: #1e293b;">
                
                <p style="font-size: 14px; line-height: 1.5; color: #334155;">
                    A user has submitted a Transaction Reference ID for manual payment verification:
                </p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
                    
                    <tr style="background-color: #f8fafc;">
                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; width: 38%; color: #475569;">
                            User Login Name
                        </td>

                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: bold;">
                            ${fullName || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">
                            User Email
                        </td>

                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #0047AB;">
                            <a href="mailto:${email}">${email}</a>
                        </td>
                    </tr>

                    <tr style="background-color: #f8fafc;">
                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">
                            Organisation Name
                        </td>

                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: bold;">
                            ${organizationName || "N/A"}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">
                            Phone Number
                        </td>

                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #0f172a;">
                            ${phone || "N/A"}
                        </td>
                    </tr>

                    <tr style="background-color: #eff6ff;">
                        <td style="padding: 12px 14px; border: 1px solid #bfdbfe; font-weight: bold; color: #1d4ed8;">
                            Transaction / UTR ID
                        </td>

                        <td style="padding: 12px 14px; border: 1px solid #bfdbfe; font-family: monospace; font-weight: bold; color: #1d4ed8; font-size: 16px;">
                            ${utrNumber}
                        </td>
                    </tr>

                </table>

                <div style="margin-top: 24px; padding: 14px; background-color: #fffbeeb; border: 1px solid #fde68a; border-radius: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                        ⚡ <strong>Action Required:</strong>
                        Log into the <strong>Admin Dashboard</strong>
                        to verify this payment and dispatch the complete assessment PDF report.
                    </p>
                </div>

            </div>
        </div>
    `;

    const smsText =
        `ETHYRA Alert: Payment submitted by ${fullName} (${organizationName}). Transaction ID: ${utrNumber}. Please log into the Admin Dashboard for verification.`;

    /*
     * IMPORTANT:
     * We do NOT send email directly from React.
     *
     * The frontend will call your backend/Edge Function.
     */

    let emailSent = false;

    try {
        console.log("[EMAIL] Notification prepared.");
        console.log("[EMAIL] Recipients:", emailRecipients);
        console.log("[EMAIL] Subject:", emailSubject);

        // Dispatch via Gmail SMTP backend endpoint
        try {
            const res = await fetch("/api/sendPaymentNotification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    email,
                    organizationName,
                    phone,
                    utrNumber,
                    emailSubject,
                    emailBodyHtml,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                emailSent = !!data.success;
                console.log("[EMAIL] Gmail SMTP dispatch result:", data);
            }
        } catch (dispatchErr) {
            console.warn("[EMAIL] Backend notification call skipped/failed, keeping simulated flow:", dispatchErr);
        }

        /*
         * SMS is currently simulated.
         */
        console.log(`[SMS ALERT TO ${smsRecipient}]:`);
        console.log(smsText);

        return {
            success: true,
            emailRecipients,
            smsRecipient,
            utrNumber,
            emailSent,
            smsText,
        };

    } catch (err) {
        console.error("[NOTIFICATION ERROR]", err);

        return {
            success: false,
            emailRecipients,
            smsRecipient,
            utrNumber,
            emailSent: false,
            smsText,
            error: err.message,
        };
    }
}