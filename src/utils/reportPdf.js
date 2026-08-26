import jsPDF from "jspdf";

const PRIMARY = "#0047AB";
const ACCENT = "#00AEEF";
const DARK = "#0a1628";

function addHeader(doc, title = "NGO Sustainability & Funding Readiness Report") {
    // Header background
    doc.setFillColor(0, 71, 171);
    doc.rect(0, 0, 210, 35, "F");
    doc.setFillColor(0, 174, 239);
    doc.rect(0, 30, 210, 5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ETHYRA Impact", 15, 14);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("NGO Readiness Assessment Platform", 15, 22);

    doc.setFontSize(9);
    doc.text(title, 210 - 15, 14, { align: "right" });
    doc.text("Confidential & Proprietary", 210 - 15, 22, { align: "right" });
}

function addFooter(doc, pageNum, total) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(240, 245, 255);
    doc.rect(0, pageHeight - 14, 210, 14, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 130);
    doc.setFont("helvetica", "normal");
    doc.text("ETHYRA Impact | connect@ethyra.in | +91 8190909808 | explore.ethyra.in", 15, pageHeight - 5);
    doc.text(`Page ${pageNum} of ${total}`, 210 - 15, pageHeight - 5, { align: "right" });
    doc.text("Generated: " + new Date().toLocaleDateString("en-IN"), 105, pageHeight - 5, { align: "center" });
}

export function buildAssessmentDoc(result, profile, answers = []) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const orgName = profile?.organizationName || "Organization";
    const fullName = profile?.fullName || "Contact Person";
    const email = profile?.email || "";
    const pct = result?.percentage ?? 0;
    const rating = result?.performanceLevel ?? "N/A";

    // === PAGE 1: Executive Summary ===
    addHeader(doc, "Executive Summary");

    // Title block
    doc.setFontSize(22);
    doc.setTextColor(0, 71, 171);
    doc.setFont("helvetica", "bold");
    doc.text("NGO Sustainability &", 15, 52);
    doc.text("Funding Readiness Report", 15, 62);

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 100);
    doc.setFont("helvetica", "normal");
    doc.text(orgName, 15, 72);
    doc.text(`Assessment completed: ${new Date().toLocaleDateString("en-IN")}`, 15, 79);

    // Score circle
    doc.setFillColor(0, 71, 171);
    doc.circle(175, 65, 22, "F");
    doc.setFillColor(0, 174, 239);
    doc.circle(175, 65, 19, "F");
    doc.setFillColor(255, 255, 255);
    doc.circle(175, 65, 16, "F");
    doc.setFontSize(20);
    doc.setTextColor(0, 71, 171);
    doc.setFont("helvetica", "bold");
    doc.text(`${Math.round(pct)}%`, 175, 68, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 130);
    doc.text("OVERALL", 175, 74, { align: "center" });
    doc.text("SCORE", 175, 78, { align: "center" });

    // Divider
    doc.setDrawColor(0, 174, 239);
    doc.setLineWidth(0.5);
    doc.line(15, 86, 195, 86);

    // Summary table
    const summaryFields = [
        ["Organization", orgName],
        ["Contact Person", fullName],
        ["Email", email],
        ["Overall Score", `${result?.totalScore ?? 0} / ${result?.maxScore ?? 0} (${Math.round(pct)}%)`],
        ["Eligibility Status", result?.isEligible ? "✓ ELIGIBLE" : "✗ NOT ELIGIBLE"],
        ["Final Rating", result?.performanceLevel ?? "N/A"],
        ["Risk Level", result?.riskLevel ?? "N/A"],
        ["Questions Answered", `${answers.length} / 61`],
    ];

    let y = 92;
    doc.setFontSize(10);
    summaryFields.forEach(([label, value], idx) => {
        if (idx % 2 === 0) {
            doc.setFillColor(245, 248, 255);
        } else {
            doc.setFillColor(255, 255, 255);
        }
        doc.rect(15, y - 4, 180, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 80);
        doc.text(label + ":", 18, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 71, 171);
        doc.text(String(value), 80, y);
        y += 9;
    });

    // Recommendations section
    y += 5;
    doc.setFillColor(0, 71, 171);
    doc.rect(15, y, 180, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Strategic Recommendations", 18, y + 5.5);
    y += 12;

    const recs = getRecommendations(pct, result?.mandatoryFailed ?? []);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 60);
    recs.forEach((rec) => {
        const lines = doc.splitTextToSize(`• ${rec}`, 170);
        lines.forEach((line) => {
            if (y > 265) { doc.addPage(); addHeader(doc, "Recommendations"); y = 45; }
            doc.text(line, 18, y);
            y += 6;
        });
        y += 2;
    });

    addFooter(doc, 1, 3);

    // === PAGE 2: Category Breakdown ===
    doc.addPage();
    addHeader(doc, "Category Performance Breakdown");

    y = 45;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 71, 171);
    doc.text("Category-Wise Performance Analysis", 15, y);
    y += 10;

    const categories = Object.entries(result?.categoryScores ?? {});
    categories.forEach(([catName, catData]) => {
        if (y > 250) { doc.addPage(); addHeader(doc, "Category Breakdown"); y = 45; }
        const catPct = catData.max > 0 ? (catData.scored / catData.max) * 100 : 0;
        const color = catPct >= 70 ? [16, 185, 129] : catPct >= 50 ? [245, 158, 11] : [239, 68, 68];

        doc.setFillColor(245, 248, 255);
        doc.rect(15, y - 3, 180, 18, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 60);
        doc.text(catName, 18, y + 3);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 100);
        doc.text(`${catData.scored} / ${catData.max} pts (${Math.round(catPct)}%)`, 18, y + 9);

        // Progress bar background
        doc.setFillColor(220, 230, 250);
        doc.rect(100, y + 1, 80, 5, "F");
        // Progress bar fill
        doc.setFillColor(...color);
        doc.rect(100, y + 1, Math.min(80, (catPct / 100) * 80), 5, "F");

        y += 22;
    });

    // Mandatory eligibility
    y += 5;
    doc.setFillColor(0, 71, 171);
    doc.rect(15, y, 180, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Mandatory Criteria Checklist", 18, y + 5.5);
    y += 12;

    const mandatoryFailed = result?.mandatoryFailed ?? [];
    if (mandatoryFailed.length === 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(16, 185, 129);
        doc.text("✓ All 8 mandatory criteria passed — Organization is ELIGIBLE", 18, y);
        y += 8;
    } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(239, 68, 68);
        doc.text(`✗ ${mandatoryFailed.length} mandatory criteria did not pass:`, 18, y);
        y += 8;
        mandatoryFailed.forEach((mf, i) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(239, 68, 68);
            const lines = doc.splitTextToSize(`${i + 1}. ${mf}`, 165);
            lines.forEach((line) => {
                doc.text(line, 20, y);
                y += 6;
            });
        });
    }

    addFooter(doc, 2, 3);

    // === PAGE 3: 30-60-90 Day Roadmap ===
    doc.addPage();
    addHeader(doc, "Strategic Roadmap");

    y = 45;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 71, 171);
    doc.text("30–60–90 Day Strategic Roadmap", 15, y);
    y += 10;

    const roadmap = [
        { period: "0–30 Days (Immediate)", color: [239, 68, 68], items: ["Verify all mandatory registration documents are current", "File any outstanding compliance returns", "Schedule board meeting and document minutes"] },
        { period: "30–60 Days (Short-term)", color: [245, 158, 11], items: ["Develop or update key organizational policies", "Implement financial controls and approval workflows", "Onboard staff for safeguarding/compliance training"] },
        { period: "60–90 Days (Medium-term)", color: [16, 185, 129], items: ["Launch M&E framework for active programs", "Diversify funding through grant applications", "Register on NGO Darpan and Social Stock Exchange"] },
    ];

    roadmap.forEach((phase) => {
        if (y > 240) { doc.addPage(); addHeader(doc, "Roadmap"); y = 45; }
        doc.setFillColor(...phase.color);
        doc.rect(15, y, 180, 9, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(phase.period, 18, y + 6);
        y += 13;

        phase.items.forEach((item) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(40, 40, 60);
            doc.text(`  • ${item}`, 18, y);
            y += 7;
        });
        y += 5;
    });

    // Advisory note
    y += 5;
    doc.setFillColor(240, 248, 255);
    doc.rect(15, y, 180, 35, "F");
    doc.setDrawColor(0, 174, 239);
    doc.setLineWidth(0.5);
    doc.rect(15, y, 180, 35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 71, 171);
    doc.text("Advisory Note", 18, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 80);
    const advisoryText = "This report is generated based on self-declared information. ETHYRA Impact recommends independent verification of all compliance documents before engaging in CSR partnerships or institutional funding agreements. Results are valid at time of assessment.";
    const advisoryLines = doc.splitTextToSize(advisoryText, 170);
    advisoryLines.forEach((line, i) => doc.text(line, 18, y + 15 + (i * 6)));

    addFooter(doc, 3, 3);

    return doc;
}

function getRecommendations(pct, mandatoryFailed) {
    const recs = [];
    if (mandatoryFailed.length > 0) {
        recs.push(`Address ${mandatoryFailed.length} failed mandatory compliance requirement(s) as an immediate priority.`);
    }
    if (pct < 50) {
        recs.push("Conduct a comprehensive governance and compliance review with a legal/NGO consultant.");
        recs.push("Prioritize mandatory registrations: 12AB, 80G, CSR-1, and audited financials.");
        recs.push("Develop a 90-day compliance roadmap with assigned responsibility owners.");
    } else if (pct < 70) {
        recs.push("Strengthen policy documentation: HR, Finance, POSH, and Procurement policies.");
        recs.push("Implement a formal M&E framework for all active programs.");
        recs.push("Diversify funding sources to reduce dependency on single donors.");
    } else if (pct < 85) {
        recs.push("Minor improvements recommended in governance documentation and impact reporting.");
        recs.push("Consider Social Stock Exchange listing to enhance credibility.");
        recs.push("Deepen stakeholder engagement and beneficiary feedback mechanisms.");
    } else {
        recs.push("Excellent readiness profile. Maintain current compliance posture.");
        recs.push("Explore advanced funding opportunities including institutional grants and bilateral aid.");
        recs.push("Share best practices with sector peers and consider CSR consortium leadership.");
    }
    return recs;
}
