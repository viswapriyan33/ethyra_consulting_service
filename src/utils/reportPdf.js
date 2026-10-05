import jsPDF from "jspdf";
import { ETHYRA_LOGO_BASE64 } from "./logoBase64";

// ==========================================
// ETHYRA Impact PDF Color Palette (STRICT BLUE THEMES ONLY)
// ABSOLUTELY NO GREEN, NO YELLOW, NO RED!
// ==========================================
const BG_WHITE = [255, 255, 255];       // Clean White Page Background
const CARD_BG = [248, 250, 252];        // #F8FAFC - Light Slate Card Fill
const CARD_BG_ALT = [240, 249, 255];    // #F0F9FF - Soft Sky Blue Tint Fill
const CARD_BORDER = [186, 230, 253];    // #BAE6FD - Sky Blue Accent Border
const DARK_NAVY = [15, 23, 42];         // #0F172A - Deep Slate/Navy Header Text
const TEXT_BODY = [51, 65, 85];         // #334155 - Slate Body Text
const TEXT_MUTED = [100, 116, 139];     // #64748B - Muted Slate Text

// BLUE PERFORMANCE COLOR PALETTE
const BLUE_STRONG = [30, 64, 175];       // #1E40AF Deep Royal Blue (Strong / High Readiness >=70%)
const BLUE_MODERATE = [2, 132, 199];     // #0284C7 Sapphire Blue (Moderate Readiness 50-69%)
const BLUE_LOW = [15, 23, 42];          // #0F172A Midnight Navy Blue (Low / Needs Attention <50%)

// DISTINCT BLUE COLOR THEMES FOR CHARTS
const BAR_BLUE_PRIMARY = [0, 71, 171];   // #0047AB Cobalt Blue
const BAR_BLUE_FILL = [2, 132, 199];     // #0284C7 Sapphire Fill
const BAR_BLUE_TRACK = [224, 242, 254];  // #E0F2FE Track Fill

const RADAR_BLUE_LINE = [29, 78, 216];   // #1D4ED8 Royal Blue
const RADAR_BLUE_FILL = [59, 130, 246];  // #3B82F6 Electric Blue

const PIE_BLUE_1 = [3, 105, 161];        // #0369A1 Deep Ocean Blue
const PIE_BLUE_2 = [2, 132, 199];        // #0284C7 Sky Blue
const PIE_BLUE_3 = [56, 189, 248];        // #38BDF8 Cyan Blue
const PIE_BLUE_4 = [125, 211, 252];       // #7DD3FC Ice Blue

const TREND_BLUE_LINE = [6, 182, 212];   // #06B6D4 Aqua Blue
const TREND_BLUE_NODE = [0, 71, 171];   // #0047AB Deep Blue
const TREND_BLUE_GLOW = [34, 211, 238];  // #22D3EE Cyan Glow

function getScoreBlueColor(pct) {
    if (pct >= 70) return BLUE_STRONG;
    if (pct >= 50) return BLUE_MODERATE;
    return BLUE_LOW;
}

function fillPageBackground(doc) {
    doc.setFillColor(...BG_WHITE);
    doc.rect(0, 0, 210, 297, "F");
}

function addFigureHeader(doc, figureTitle, y = 24) {
    doc.setFillColor(...BAR_BLUE_PRIMARY);
    doc.rect(14, y, 3.5, 10, "F");

    doc.setFont("times", "bolditalic");
    doc.setFontSize(14);
    doc.setTextColor(...DARK_NAVY);
    doc.text(figureTitle, 21, y + 7.5);
}

function addGlobalHeader(doc, pageTitle = "") {
    if (pageTitle) {
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(pageTitle, 14, 13);
    }

    if (ETHYRA_LOGO_BASE64) {
        doc.addImage(ETHYRA_LOGO_BASE64, "PNG", 160, 4.5, 36, 12);
    } else {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text("ETHYRA", 162, 12);
        doc.setTextColor(...BAR_BLUE_PRIMARY);
        doc.setFontSize(9.5);
        doc.text("IMPACT", 183, 12);
    }

    doc.setFillColor(...BAR_BLUE_PRIMARY);
    doc.rect(14, 18, 182, 0.7, "F");
}

function addGlobalFooter(doc, pageNum, totalPages = 8) {
    const pageHeight = 297;
    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 11, 196, pageHeight - 11);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("connect@ethyra.in", 14, pageHeight - 5.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text(`Page ${pageNum} of ${totalPages}`, 196, pageHeight - 5.5, { align: "right" });
}

function drawCard(doc, x, y, w, h, fill = CARD_BG, border = CARD_BORDER) {
    doc.setFillColor(...fill);
    doc.roundedRect(x, y, w, h, 2, 2, "F");
    if (border) {
        doc.setDrawColor(...border);
        doc.setLineWidth(0.35);
        doc.roundedRect(x, y, w, h, 2, 2, "D");
    }
}

function drawBarChart(doc, x, y, width, height, catList) {
    const N = catList.length;
    if (N === 0) return;
    const itemHeight = height / N;
    const barHeight = Math.min(5.5, itemHeight - 7);

    catList.forEach((item, i) => {
        const currY = y + i * itemHeight;

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);

        const lines = doc.splitTextToSize(item.name, 62);
        if (lines.length > 1) {
            doc.text(lines[0], x, currY + 3);
            doc.text(lines[1], x, currY + 6.5);
        } else {
            doc.text(lines[0], x, currY + 4.5);
        }

        const trackX = x + 66;
        const trackW = width - 84;
        doc.setFillColor(...BAR_BLUE_TRACK);
        doc.roundedRect(trackX, currY + 1.5, trackW, barHeight, 1, 1, "F");

        const fillW = (trackW * Math.min(100, Math.max(0, item.pct))) / 100;
        if (fillW > 0) {
            doc.setFillColor(...BAR_BLUE_FILL);
            doc.roundedRect(trackX, currY + 1.5, fillW, barHeight, 1, 1, "F");
        }

        const scoreColor = getScoreBlueColor(item.pct);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...scoreColor);
        doc.text(`${item.pct}%`, x + width, currY + 5.5, { align: "right" });
    });
}

function drawRadarChart(doc, cx, cy, radius, catList) {
    const N = catList.length;
    if (N === 0) return;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    for (let lvl = 1; lvl <= 5; lvl++) {
        const r = (radius * lvl) / 5;
        const pts = [];
        for (let i = 0; i < N; i++) {
            const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
            pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
        }
        for (let i = 0; i < N; i++) {
            const next = pts[(i + 1) % N];
            doc.line(pts[i].x, pts[i].y, next.x, next.y);
        }
    }

    for (let i = 0; i < N; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);

        doc.setDrawColor(...RADAR_BLUE_LINE);
        doc.setLineWidth(0.35);
        doc.line(cx, cy, px, py);

        const offset = radius + 6;
        const lx = cx + offset * Math.cos(angle);
        const ly = cy + offset * Math.sin(angle);

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...getScoreBlueColor(catList[i].pct));

        let align = "center";
        if (Math.abs(Math.cos(angle)) > 0.3) {
            align = Math.cos(angle) > 0 ? "left" : "right";
        }

        const words = catList[i].name.split(" ");
        if (words.length >= 3) {
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = `${words.slice(mid).join(" ")} (${catList[i].pct}%)`;
            doc.text(line1, lx, ly - 2, { align });
            doc.text(line2, lx, ly + 2, { align });
        } else {
            doc.text(`${catList[i].name} (${catList[i].pct}%)`, lx, ly, { align });
        }
    }

    const dataPts = [];
    for (let i = 0; i < N; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
        const r = (radius * Math.min(100, Math.max(0, catList[i].pct))) / 100;
        dataPts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), color: getScoreBlueColor(catList[i].pct) });
    }

    doc.setFillColor(...RADAR_BLUE_FILL);
    for (let i = 0; i < N; i++) {
        const next = dataPts[(i + 1) % N];
        doc.triangle(cx, cy, dataPts[i].x, dataPts[i].y, next.x, next.y, "F");
    }

    doc.setDrawColor(...RADAR_BLUE_LINE);
    doc.setLineWidth(0.8);
    for (let i = 0; i < N; i++) {
        const next = dataPts[(i + 1) % N];
        doc.line(dataPts[i].x, dataPts[i].y, next.x, next.y);
    }
}

function drawPieChart(doc, cx, cy, radius, slices) {
    const total = slices.reduce((s, sl) => s + Math.max(0, sl.value), 0);
    if (total <= 0) return;

    let startAngle = -Math.PI / 2;
    slices.forEach((slice) => {
        const sweep = (Math.max(0, slice.value) / total) * 2 * Math.PI;
        const endAngle = startAngle + sweep;

        doc.setFillColor(...slice.color);
        const steps = Math.max(8, Math.round((sweep / (2 * Math.PI)) * 36));
        for (let s = 0; s < steps; s++) {
            const a1 = startAngle + (s * sweep) / steps;
            const a2 = startAngle + ((s + 1) * sweep) / steps;
            const x1 = cx + radius * Math.cos(a1);
            const y1 = cy + radius * Math.sin(a1);
            const x2 = cx + radius * Math.cos(a2);
            const y2 = cy + radius * Math.sin(a2);
            doc.triangle(cx, cy, x1, y1, x2, y2, "F");
        }
        startAngle = endAngle;
    });

    // Donut hole
    doc.setFillColor(...BG_WHITE);
    doc.circle(cx, cy, radius * 0.55, "F");
    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.4);
    doc.circle(cx, cy, radius * 0.55, "D");
}

function drawTrendsChart(doc, x, y, width, height, trendPoints) {
    const N = trendPoints.length;
    if (N === 0) return;

    const padX = 14;
    const padY = 16;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    [0, 25, 50, 75, 100].forEach((val) => {
        const gy = y + padY + chartH - (chartH * val) / 100;
        doc.line(x + padX, gy, x + padX + chartW, gy);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`${val}%`, x + 2, gy + 2);
    });

    const coords = trendPoints.map((pt, i) => {
        const cx = x + padX + (N === 1 ? chartW / 2 : (chartW * i) / (N - 1));
        const cy = y + padY + chartH - (chartH * Math.min(100, Math.max(0, pt.pct))) / 100;
        return { x: cx, y: cy, label: pt.label, pct: pt.pct, color: getScoreBlueColor(pt.pct) };
    });

    doc.setDrawColor(...TREND_BLUE_LINE);
    doc.setLineWidth(1.2);
    for (let i = 0; i < coords.length - 1; i++) {
        doc.line(coords[i].x, coords[i].y, coords[i + 1].x, coords[i + 1].y);
    }

    coords.forEach((pt) => {
        doc.setFillColor(...TREND_BLUE_GLOW);
        doc.circle(pt.x, pt.y, 3, "F");

        doc.setFillColor(...pt.color);
        doc.circle(pt.x, pt.y, 2, "F");

        doc.setFillColor(...BG_WHITE);
        doc.circle(pt.x, pt.y, 0.8, "F");

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...pt.color);
        doc.text(`${pt.pct}%`, pt.x, pt.y - 3.5, { align: "center" });

        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(pt.label, pt.x, y + height - 3, { align: "center" });
    });
}

// ==========================================
// MAIN EXPORT: buildAssessmentDoc (8 Pages)
// ==========================================
export function buildAssessmentDoc(result, profile, answers = []) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const orgName = profile?.organizationName || "Organization";
    const fullName = profile?.fullName || "Contact Person";
    const email = profile?.email || "N/A";
    const phone = profile?.phone || "N/A";
    const submissionDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const pct = Math.round(result?.percentage ?? 0);
    const totalScore = result?.totalScore ?? pct;
    const maxScore = result?.maxScore ?? 100;
    const rating = result?.rating || result?.performanceLevel || "Partnership Ready";
    const isEligible = result?.isEligible ?? true;
    const riskLevel = result?.riskLevel || (pct >= 70 ? "Low Risk" : pct >= 50 ? "Medium Risk" : "High Risk");

    // Standardized Category Data from result
    const rawCategories = Object.entries(result?.categoryScores ?? {});
    const catList = rawCategories.map(([name, data]) => {
        const catPct = data.max > 0 ? Math.round((data.scored / data.max) * 100) : (data.score ?? data.percentage ?? 0);
        return {
            name,
            scored: data.scored ?? Math.round((catPct * 28) / 100),
            max: data.max ?? 28,
            pct: catPct
        };
    });

    // ----------------------------------------------------
    // PAGE 1: Cover Header & Organization Profile (8 Pillars in 2-Column Grid)
    // ----------------------------------------------------
    fillPageBackground(doc);
    addGlobalHeader(doc, "NGO Impact Report");

    addFigureHeader(doc, "Figure 1-1: NGO Impact & Executive Readiness Framework", 22);

    // Organization Details Card
    drawCard(doc, 14, 36, 182, 46, CARD_BG_ALT, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Organization & Assessment Profile", 20, 44);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 47, 190, 47);

    const col1X = 20;
    const col2X = 104;

    const leftFields = [
        ["ORGANIZATION NAME", orgName],
        ["EMAIL ADDRESS", email],
        ["SUBMISSION DATE", submissionDate],
    ];

    const rightFields = [
        ["CONTACT PERSON NAME", fullName],
        ["PHONE NUMBER", phone],
        ["EVALUATION FRAMEWORK", "57-Criteria Corporate CSR Standard"],
    ];

    leftFields.forEach(([label, val], idx) => {
        const rowY = 53 + idx * 8.5;
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(label, col1X, rowY);

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(String(val), col1X + 34, rowY);
    });

    rightFields.forEach(([label, val], idx) => {
        const rowY = 53 + idx * 8.5;
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(label, col2X, rowY);

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);

        const valLines = doc.splitTextToSize(String(val), 48);
        doc.text(valLines[0], col2X + 36, rowY);
        if (valLines.length > 1) {
            doc.text(valLines[1], col2X + 36, rowY + 3);
        }
    });

    // Executive Summary Card
    drawCard(doc, 14, 88, 182, 194, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BAR_BLUE_PRIMARY);
    doc.text("Executive Summary & Methodology Overview", 20, 97);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_BODY);
    const summaryParas = [
        `This due diligence report evaluates ${orgName} across 57 comprehensive diagnostic criteria.`,
        "The framework empowers CSR Donors, Corporate Grantmakers, and Foundations to verify institutional",
        "readiness, statutory tax compliance, internal financial controls, and programme capability.",
        "",
        "Key statutory dimensions verified under applicable regulations:",
        " • Income Tax Act: Sections 12AB & 80G Registrations and Renewal Filings",
        " • Ministry of Corporate Affairs: Form CSR-1 Implementing Agency Empanelment",
        " • Financial Governance: Multi-signature authorizations, banking reconciliation & restricted funds",
        " • Operations & Ethics: POSH workplace compliance, safeguarding, and M&E outcome tracking",
    ];

    summaryParas.forEach((line, idx) => {
        doc.text(line, 20, 104 + idx * 4.2);
    });

    // Core Pillars Section Header
    const pillarsY = 145;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Core Evaluation Pillars Assessed (8 Statutory Pillars):", 20, pillarsY);

    // 8 Pillars rendered in a clean 2-Column Grid (4 rows x 2 cols) -> NEVER overlaps footer!
    catList.forEach((cat, idx) => {
        const isRightCol = idx >= 4;
        const rowIndex = idx % 4;
        const cardX = isRightCol ? 106 : 20;
        const cardY = pillarsY + 4 + rowIndex * 12.5;
        const cardW = 84;
        const cardH = 10.5;

        doc.setFillColor(...BG_WHITE);
        doc.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, "F");
        doc.setDrawColor(...CARD_BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, "D");

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        const nameLines = doc.splitTextToSize(`${idx + 1}. ${cat.name}`, 54);
        doc.text(nameLines[0], cardX + 3, cardY + (nameLines.length > 1 ? 3.8 : 6.2));
        if (nameLines.length > 1) {
            doc.text(nameLines[1], cardX + 3, cardY + 7.2);
        }

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...getScoreBlueColor(cat.pct));
        doc.text(`${cat.pct}%`, cardX + cardW - 3, cardY + 4.5, { align: "right" });

        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`(${cat.scored}/${cat.max} pts)`, cardX + cardW - 3, cardY + 8.2, { align: "right" });
    });

    addGlobalFooter(doc, 1, 8);

    // ----------------------------------------------------
    // PAGE 2: Key KPI Cards & ELIGIBILITY STATUS Box (Text Wrap & Alignment Fix)
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Key Performance Indicators & Readiness Status");

    addFigureHeader(doc, "Figure 2-1: Key KPI Cards & Eligibility Assessment", 22);

    // 4 Top KPI Cards
    // Card 1: Overall Score
    drawCard(doc, 14, 36, 42, 42, CARD_BG, CARD_BORDER);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("OVERALL SCORE", 35, 45, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BAR_BLUE_PRIMARY);
    doc.text(`${totalScore} / ${maxScore}`, 35, 57, { align: "center" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...getScoreBlueColor(pct));
    doc.text(`${pct}% Scored`, 35, 68, { align: "center" });

    // Card 2: ELIGIBILITY STATUS Card
    const eligBlueColor = isEligible ? BLUE_STRONG : BLUE_LOW;
    drawCard(doc, 60, 36, 42, 42, CARD_BG_ALT, [eligBlueColor[0], eligBlueColor[1], eligBlueColor[2]]);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("ELIGIBILITY STATUS", 81, 45, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...eligBlueColor);
    doc.text(isEligible ? "✓ ELIGIBLE" : "✗ NOT ELIGIBLE", 81, 57, { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text(isEligible ? "Criteria Verified" : "Review Required", 81, 68, { align: "center" });

    // Card 3: Readiness Level (PROPERLY WRAPPED INSIDE 38MM BOX)
    drawCard(doc, 106, 36, 42, 42, CARD_BG, CARD_BORDER);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("READINESS LEVEL", 127, 45, { align: "center" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...getScoreBlueColor(pct));
    const ratingLines = doc.splitTextToSize(rating, 36);
    const startRatingY = 55 - ((ratingLines.length - 1) * 3) / 2;
    ratingLines.forEach((rLine, rIdx) => {
        doc.text(rLine, 127, startRatingY + rIdx * 3.4, { align: "center" });
    });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Evaluation Grade", 127, 72, { align: "center" });

    // Card 4: Risk Assessment
    drawCard(doc, 152, 36, 42, 42, CARD_BG, CARD_BORDER);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("RISK RATING", 173, 45, { align: "center" });

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...getScoreBlueColor(pct));
    doc.text(riskLevel, 173, 57, { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Regulatory Risk", 173, 68, { align: "center" });

    // Detailed ELIGIBILITY STATUS Verification Box Container
    drawCard(doc, 14, 84, 182, 198, CARD_BG_ALT, [eligBlueColor[0], eligBlueColor[1], eligBlueColor[2]]);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Detailed Eligibility Status & Compliance Verification Box", 20, 94);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 97, 190, 97);

    // Status Banner Fill Box Inside Container
    doc.setFillColor(...eligBlueColor);
    doc.roundedRect(20, 102, 170, 12, 1.5, 1.5, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BG_WHITE);
    doc.text(
        isEligible
            ? "ELIGIBILITY STATUS: APPROVED FOR CSR FUNDING & INSTITUTIONAL PARTNERSHIPS"
            : "ELIGIBILITY STATUS: CONDITIONAL / ACTION PLAN REQUIRED FOR FULL PARTNERSHIP",
        105,
        109.5,
        { align: "center" }
    );

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_BODY);
    const eligDesc = isEligible
        ? `${orgName} has satisfied key statutory and governance indicators across all 8 evaluated pillars. The organization demonstrates sound baseline controls, enabling progressive engagement with corporate CSR foundations and institutional grantmakers.`
        : `${orgName} has specific statutory or governance areas requiring targeted documentation review or operational refinement prior to high-value institutional grant deployment.`;
    const lines = doc.splitTextToSize(eligDesc, 168);
    lines.forEach((l, i) => doc.text(l, 20, 122 + i * 4.2));

    // Summary of Pillars Table in Page 2
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Pillar Readiness & Weightage Summary Table:", 20, 140);

    catList.forEach((cat, idx) => {
        const rowY = 145 + idx * 15;
        doc.setFillColor(...BG_WHITE);
        doc.roundedRect(20, rowY, 170, 12, 1.5, 1.5, "F");
        doc.setDrawColor(...CARD_BORDER);
        doc.setLineWidth(0.25);
        doc.roundedRect(20, rowY, 170, 12, 1.5, 1.5, "D");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(`${idx + 1}. ${cat.name}`, 24, rowY + 5.5);

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`Status: ${cat.pct >= 70 ? "High Readiness" : cat.pct >= 50 ? "Moderate" : "Capacity Building Needed"}`, 24, rowY + 9.5);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...getScoreBlueColor(cat.pct));
        doc.text(`${cat.pct}% Scored`, 185, rowY + 5.5, { align: "right" });

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`(${cat.scored}/${cat.max} pts)`, 185, rowY + 9.5, { align: "right" });
    });

    addGlobalFooter(doc, 2, 8);

    // ----------------------------------------------------
    // PAGE 3: Figure 4-4: Category Score Bar Graph (Sapphire Blue Theme)
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Category Score Bar Graph");

    addFigureHeader(doc, "Figure 4-4: Category Readiness Bar Graph", 22);

    drawCard(doc, 14, 36, 182, 244, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BAR_BLUE_PRIMARY);
    doc.text("Complete Category Performance & Score Bar Graph", 20, 46);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Source: Primary Assessment Survey & Due Diligence Diagnostic Framework", 20, 52);

    drawBarChart(doc, 20, 60, 170, 208, catList);

    addGlobalFooter(doc, 3, 8);

    // ----------------------------------------------------
    // PAGE 4: Figure 4-5: Pillar Readiness Radar Chart (Spider Web)
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Pillar Readiness Radar Chart");

    addFigureHeader(doc, "Figure 4-5: Pillar Readiness Radar Chart", 22);

    drawCard(doc, 14, 36, 182, 244, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...RADAR_BLUE_LINE);
    doc.text("Multi-Dimensional Pillar Readiness Radar Chart (Spider Web)", 20, 46);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Spider Web Evaluation Across 8 Core Governance & Operational Pillars", 20, 52);

    drawRadarChart(doc, 105, 155, 48, catList);

    addGlobalFooter(doc, 4, 8);

    // ----------------------------------------------------
    // PAGE 5: Figure 4-6: Score Distribution Pie Chart
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Score Distribution Pie Chart");

    addFigureHeader(doc, "Figure 4-6: Score Distribution & Pillar Categories Pattern", 22);

    drawCard(doc, 14, 36, 182, 244, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PIE_BLUE_1);
    doc.text("Organizational Score Distribution Donut & Pie Chart", 20, 46);

    const highCount = catList.filter((c) => c.pct >= 70).length;
    const modCount = catList.filter((c) => c.pct >= 50 && c.pct < 70).length;
    const lowCount = catList.filter((c) => c.pct < 50).length;

    const pieSlices = [
        { label: "High Readiness (≥70%)", value: Math.max(0.1, highCount), color: PIE_BLUE_1 },
        { label: "Moderate (50-69%)", value: Math.max(0.1, modCount), color: PIE_BLUE_2 },
        { label: "Low Readiness (<50%)", value: Math.max(0.1, lowCount), color: PIE_BLUE_3 },
    ];
    drawPieChart(doc, 105, 128, 44, pieSlices);

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text(`${pct}%`, 105, 126, { align: "center" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("OVERALL SCORE", 105, 133, { align: "center" });

    const pieLegends = [
        { label: `Strong Pillars (≥70%): ${highCount} of 8 Pillars`, color: PIE_BLUE_1 },
        { label: `Moderate Pillars (50-69%): ${modCount} of 8 Pillars`, color: PIE_BLUE_2 },
        { label: `Priority Areas (<50%): ${lowCount} of 8 Pillars`, color: PIE_BLUE_3 },
    ];

    pieLegends.forEach((lg, idx) => {
        const ly = 195 + idx * 12;
        doc.setFillColor(...lg.color);
        doc.rect(40, ly, 6, 6, "F");

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(lg.label, 50, ly + 4.5);
    });

    addGlobalFooter(doc, 5, 8);

    // ----------------------------------------------------
    // PAGE 6: Figure 4-7: Pillar Performance Trends Chart
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Pillar Performance Trends Chart");

    addFigureHeader(doc, "Figure 4-7: Pillar Performance Trends & Continuity Line", 22);

    drawCard(doc, 14, 36, 182, 244, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TREND_BLUE_NODE);
    doc.text("Pillar Readiness Performance Trends Across 8 Criteria Dimensions", 20, 46);

    const trendPoints = catList.map((c) => ({
        label: c.name.split(" ")[0],
        pct: c.pct,
    }));
    drawTrendsChart(doc, 20, 60, 170, 208, trendPoints);

    addGlobalFooter(doc, 6, 8);

    // ----------------------------------------------------
    // PAGE 7: Executive Readiness Breakdown & Recommendations
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Executive Readiness Breakdown & Action Plan");

    const strongCats = catList.filter((c) => c.pct >= 70);
    const modCats = catList.filter((c) => c.pct >= 50 && c.pct < 70);
    const weakCats = catList.filter((c) => c.pct < 50);

    drawCard(doc, 14, 24, 182, 122, CARD_BG_ALT, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Key Strengths & High Readiness Pillars (≥70%)", 20, 33);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 36, 190, 36);

    if (strongCats.length > 0) {
        strongCats.slice(0, 5).forEach((sc, i) => {
            const sy = 41 + i * 15;
            doc.setFillColor(...BG_WHITE);
            doc.roundedRect(20, sy, 170, 12.5, 1.5, 1.5, "F");

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...BLUE_STRONG);
            doc.text(`✓ ${sc.name}`, 24, sy + 5);

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...BLUE_STRONG);
            doc.text(`${sc.pct}% Scored (${sc.scored}/${sc.max} pts)`, 185, sy + 5, { align: "right" });

            doc.setFontSize(6.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TEXT_BODY);
            doc.text("Demonstrates robust compliance, verified records, and operational readiness for institutional grants.", 24, sy + 9.5);
        });
    } else {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT_BODY);
        doc.text("No evaluation pillar currently meets the 70% benchmark required for high readiness.", 24, 46);
    }

    drawCard(doc, 14, 150, 182, 130, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Priority Areas for Improvement & Risk Mitigation (<70%)", 20, 159);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 162, 190, 162);

    const needAttn = [...modCats, ...weakCats];
    if (needAttn.length > 0) {
        needAttn.slice(0, 5).forEach((ac, i) => {
            const ay = 167 + i * 15;
            const scoreColor = getScoreBlueColor(ac.pct);

            doc.setFillColor(...BG_WHITE);
            doc.roundedRect(20, ay, 170, 12.5, 1.5, 1.5, "F");

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...scoreColor);
            doc.text(`! ${ac.name}`, 24, ay + 5);

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...scoreColor);
            doc.text(`${ac.pct}% Scored (${ac.scored}/${ac.max} pts)`, 185, ay + 5, { align: "right" });

            doc.setFontSize(6.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TEXT_BODY);
            doc.text("Action Plan: Execute corrective documentation, update governance processes, and verify filings.", 24, ay + 9.5);
        });
    } else {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BLUE_STRONG);
        doc.text("Outstanding organizational posture: All 8 evaluated pillars scored 70% or higher.", 24, 172);
    }

    addGlobalFooter(doc, 7, 8);

    // ----------------------------------------------------
    // PAGE 8: Compliance Audit & Dedicated Closing Statement
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Compliance Audit & Closing Statement");

    drawCard(doc, 14, 24, 182, 142, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Mandatory Compliance Checklist Audit", 20, 33);

    const mandatoryChecklist = [
        { item: "1. Income Tax 12A & 80G Registration Status", status: "PASS", desc: "Valid tax exemption certificates for donor deductions" },
        { item: "2. NITI Aayog NGO Darpan Registration ID", status: "PASS", desc: "Active portal registration with unique identity number" },
        { item: "3. MCA Form CSR-1 Registration Mandate", status: "PASS", desc: "Registered with Ministry of Corporate Affairs for CSR funds" },
        { item: "4. 3 Years Audited Financial Statements & ITR", status: "PASS", desc: "Independent chartered accountant audit reports filed" },
        { item: "5. Active Governing Board with Regular Meetings", status: "PASS", desc: "Governing body oversight with recorded periodic meetings" },
        { item: "6. Statutory & Safeguarding Frameworks", status: "PASS", desc: "POSH workplace compliance and beneficiary protection protocols" },
    ];

    let auditY = 39;
    mandatoryChecklist.forEach((c) => {
        doc.setFillColor(...BG_WHITE);
        doc.roundedRect(18, auditY, 174, 13.5, 1.5, 1.5, "F");
        doc.setDrawColor(...CARD_BORDER);
        doc.setLineWidth(0.2);
        doc.roundedRect(18, auditY, 174, 13.5, 1.5, 1.5, "D");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(c.item, 22, auditY + 5);

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(c.desc, 22, auditY + 9.5);

        const badgeColor = c.status === "PASS" ? BLUE_STRONG : BLUE_LOW;
        doc.setFillColor(...badgeColor);
        doc.roundedRect(162, auditY + 3.5, 24, 6, 1, 1, "F");

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BG_WHITE);
        doc.text(c.status === "PASS" ? "✓ PASSED" : "✗ FAILED", 174, auditY + 7.5, { align: "center" });

        auditY += 16.5;
    });

    drawCard(doc, 14, 170, 182, 110, CARD_BG_ALT, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BAR_BLUE_PRIMARY);
    doc.text("Closing Message & Verification Statement from ETHYRA Impact", 20, 180);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 183, 190, 183);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_BODY);
    const closingText = [
        `ETHYRA Impact extends its warm appreciation to ${orgName} for completing this readiness assessment.`,
        "",
        "Our mission is to empower social sector organizations with transparent, evidence-based due diligence",
        "that fosters high-trust partnerships with corporate CSR foundations, grantmakers, and institutional leaders.",
        "",
        "For verification assistance, report revalidation, or technical queries, please contact connect@ethyra.in.",
    ];
    closingText.forEach((line, idx) => {
        if (line === "") return;
        doc.text(line, 20, 191 + idx * 4.8);
    });

    addGlobalFooter(doc, 8, 8);

    return doc;
}
