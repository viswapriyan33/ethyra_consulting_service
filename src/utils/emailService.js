// Email service — in a real deployment this calls a backend function (Resend API)
// Here we simulate it with a console log and EmailLog DB entry

import { EmailLogDB, AssessmentResultDB, PaymentRecordDB } from "./db";
import { buildAssessmentDoc } from "./reportPdf";

export function buildReportEmailHtml(profile, result) {
    const pct = Math.round(result?.percentage ?? 0);
    const catScores = result?.categoryScores ?? {};

    const categoryRows = Object.entries(catScores).map(([cat, data]) => {
        const catPct = data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0;
        const color = catPct >= 70 ? "#10B981" : catPct >= 50 ? "#F59E0B" : "#EF4444";
        return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff;font-size:13px;color:#334155">${cat}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff;font-size:13px;color:#0047AB;font-weight:bold">${data.scored}/${data.max}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff;">
          <div style="background:#e2e8f0;border-radius:4px;height:8px;width:120px">
            <div style="background:${color};border-radius:4px;height:8px;width:${catPct * 1.2}px"></div>
          </div>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff;font-size:12px;color:${color};font-weight:bold">${catPct}%</td>
      </tr>
    `;
    }).join("");

    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>ETHYRA Impact Assessment Report</title></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:Arial,sans-serif">
  <div style="max-width:650px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0047AB,#0055CC,#00AEEF);padding:40px 30px;text-align:center">
      <img src="https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png" alt="ETHYRA" style="height:60px;margin-bottom:12px" />
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px">ETHYRA Impact</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0">NGO Readiness Assessment Platform</p>
    </div>

    <!-- Greeting -->
    <div style="padding:30px 30px 0">
      <h2 style="color:#0047AB;font-size:20px;margin:0 0 8px">Dear ${profile?.fullName ?? "NGO Leader"},</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6">
        Thank you for completing your NGO Readiness Assessment. Your comprehensive report is attached to this email as a PDF. 
        Below is a summary of your assessment results.
      </p>
    </div>

    <!-- Score Summary Table -->
    <div style="padding:20px 30px">
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
        <tr style="background:#0047AB">
          <td colspan="2" style="padding:12px 16px;color:#ffffff;font-weight:bold;font-size:14px">Assessment Summary</td>
        </tr>
        <tr style="background:#f8faff">
          <td style="padding:10px 16px;color:#64748b;font-size:13px">Organization</td>
          <td style="padding:10px 16px;color:#1e293b;font-size:13px;font-weight:bold">${profile?.organizationName ?? ""}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#64748b;font-size:13px">Overall Score</td>
          <td style="padding:10px 16px;color:#0047AB;font-size:13px;font-weight:bold">${pct}%</td>
        </tr>
        <tr style="background:#f8faff">
          <td style="padding:10px 16px;color:#64748b;font-size:13px">Eligibility Status</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:bold;color:${result?.isEligible ? "#10B981" : "#EF4444"}">${result?.isEligible ? "✓ ELIGIBLE" : "✗ NOT ELIGIBLE"}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#64748b;font-size:13px">Final Rating</td>
          <td style="padding:10px 16px;color:#1e293b;font-size:13px;font-weight:bold">${result?.performanceLevel ?? "N/A"}</td>
        </tr>
        <tr style="background:#f8faff">
          <td style="padding:10px 16px;color:#64748b;font-size:13px">Risk Level</td>
          <td style="padding:10px 16px;color:#1e293b;font-size:13px;font-weight:bold">${result?.riskLevel ?? "N/A"}</td>
        </tr>
      </table>
    </div>

    <!-- Category Table -->
    <div style="padding:0 30px 20px">
      <h3 style="color:#0047AB;font-size:16px;margin:0 0 12px">Category-Wise Performance</h3>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
        <tr style="background:#0047AB">
          <td style="padding:10px 12px;color:#fff;font-size:12px;font-weight:bold">Category</td>
          <td style="padding:10px 12px;color:#fff;font-size:12px;font-weight:bold">Score</td>
          <td style="padding:10px 12px;color:#fff;font-size:12px;font-weight:bold">Progress</td>
          <td style="padding:10px 12px;color:#fff;font-size:12px;font-weight:bold">%</td>
        </tr>
        ${categoryRows}
      </table>
    </div>

    <!-- PDF Note -->
    <div style="margin:0 30px 20px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px">
      <p style="color:#0369a1;font-size:13px;margin:0">
        📎 <strong>Your Complete PDF Report</strong> — A detailed 3-page executive report is attached to this email, 
        including strategic recommendations, a 30-60-90 day roadmap, and mandatory eligibility checklist.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8faff;padding:24px 30px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="color:#64748b;font-size:12px;margin:0 0 8px">For support, contact us at <a href="mailto:connect@ethyra.in" style="color:#0047AB">connect@ethyra.in</a> | +91 8190909808</p>
      <p style="color:#94a3b8;font-size:11px;margin:0">Generated by ETHYRA Impact | Secure & Confidential | explore.ethyra.in</p>
    </div>
  </div>
</body>
</html>`;
}

// Simulate backend email dispatch
export async function dispatchVerifiedReport(payment) {
    try {
        // Freshly fetch AssessmentResult
        let result = AssessmentResultDB.findByAttempt(payment.attemptId);
        if (!result && payment.assessmentResultId) {
            const all = AssessmentResultDB.findByUser(payment.userProfileId);
            result = all[all.length - 1] || null;
        }

        if (!result) {
            throw new Error("Assessment result not found for this payment");
        }

        const profile = {
            fullName: payment.fullName,
            email: payment.email,
            phone: payment.phone,
            organizationName: payment.organizationName,
        };

        // Generate PDF
        const doc = buildAssessmentDoc(result, profile, []);
        const pdfBase64 = doc.output("datauristring");
        const filename = `ETHYRA_Impact_Assessment_Report_${(profile.organizationName || "NGO").replace(/\s+/g, "_")}.pdf`;

        // Simulate email send (in production: call Resend API backend function)
        console.log("[EMAIL] Dispatching report to:", payment.email);
        console.log("[EMAIL] Admin copy to: connect@ethyra.in");
        console.log("[EMAIL] Attachment:", filename);

        // Log email
        EmailLogDB.create({
            recipient: payment.email,
            subject: `Your ETHYRA Impact Assessment Report — ${profile.organizationName}`,
            status: "Sent",
            timestamp: new Date().toISOString(),
            messageId: "sim-" + Date.now(),
            retryCount: 0,
            assessmentId: result.id,
            paymentId: payment.id,
            attemptId: payment.attemptId,
            userId: payment.userProfileId,
            organizationName: profile.organizationName,
            provider: "Simulated",
            attachmentName: filename,
        });

        return { success: true, pdfBase64, filename };
    } catch (err) {
        EmailLogDB.create({
            recipient: payment.email,
            subject: "ETHYRA Impact Assessment Report",
            status: "Failed",
            timestamp: new Date().toISOString(),
            retryCount: 1,
            errorMessage: err.message,
            paymentId: payment.id,
            attemptId: payment.attemptId,
            userId: payment.userProfileId,
            organizationName: payment.organizationName,
            provider: "Simulated",
        });
        return { success: false, error: err.message };
    }
}
