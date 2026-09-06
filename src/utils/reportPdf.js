import jsPDF from "jspdf";
import { ETHYRA_LOGO_BASE64 } from "./logoBase64";

// ==========================================
// ETHYRA Impact PDF Color Palette (STRICT BLUE COLOR THEMES ONLY)
// ABSOLUTELY NO GREEN, NO YELLOW, NO RED!
// ==========================================
const BG_WHITE = [255, 255, 255];       // Clean White Page Background
const CARD_BG = [248, 250, 252];        // #F8FAFC - Light Slate Card Fill
const CARD_BG_ALT = [240, 249, 255];    // #F0F9FF - Soft Sky Blue Tint Fill
const CARD_BORDER = [186, 230, 253];    // #BAE6FD - Sky Blue Accent Border
const DARK_NAVY = [15, 23, 42];         // #0F172A - Deep Slate/Navy Header Text
const TEXT_BODY = [51, 65, 85];         // #334155 - Slate Body Text
const TEXT_MUTED = [100, 116, 139];     // #64748B - Muted Slate Text

// BLUE PERFORMANCE COLOR PALETTE (Replaces Green/Yellow/Red)
const BLUE_STRONG = [30, 64, 175];       // #1E40AF Deep Royal Blue (Strong / High Readiness >=70%)
const BLUE_MODERATE = [2, 132, 199];     // #0284C7 Sapphire Blue (Moderate Readiness 50-69%)
const BLUE_LOW = [15, 23, 42];          // #0F172A Midnight Navy Blue (Low / Needs Attention <50%)

// DISTINCT BLUE COLOR THEMES FOR CHARTS
// 1. Bar Chart Theme (Deep Navy & Sapphire Blue)
const BAR_BLUE_PRIMARY = [0, 71, 171];   // #0047AB Cobalt Blue
const BAR_BLUE_FILL = [2, 132, 199];     // #0284C7 Sapphire Fill
const BAR_BLUE_TRACK = [224, 242, 254];    // #E0F2FE Track Fill

// 2. Radar / Spider Web Theme (Royal & Electric Blue)
const RADAR_BLUE_LINE = [29, 78, 216];   // #1D4ED8 Royal Blue
const RADAR_BLUE_FILL = [59, 130, 246];  // #3B82F6 Electric Blue

// 3. Pie Chart Theme (Gradient Blue Shades)
const PIE_BLUE_1 = [3, 105, 161];         // #0369A1 Deep Ocean Blue
const PIE_BLUE_2 = [2, 132, 199];         // #0284C7 Sky Blue
const PIE_BLUE_3 = [56, 189, 248];         // #38BDF8 Cyan Blue
const PIE_BLUE_4 = [125, 211, 252];        // #7DD3FC Ice Blue

// 4. Trends Line Chart Theme (Steel Aqua & Cyan Blue)
const TREND_BLUE_LINE = [6, 182, 212];    // #06B6D4 Aqua Blue
const TREND_BLUE_NODE = [0, 71, 171];    // #0047AB Deep Blue
const TREND_BLUE_GLOW = [34, 211, 238];   // #22D3EE Cyan Glow

// Helper: Get performance blue color by percentage score (NO GREEN/YELLOW/RED!)
function getScoreBlueColor(pct) {
    if (pct >= 70) return BLUE_STRONG;
    if (pct >= 50) return BLUE_MODERATE;
    return BLUE_LOW;
}

// Helper: Fill Page Background with Pure White
function fillPageBackground(doc) {
    doc.setFillColor(...BG_WHITE);
    doc.rect(0, 0, 210, 297, "F");
}

// Helper: Add Times New Roman Bold Italic Figure Header with Blue Margin Accent
// Font size: 16pt so titles fit 100% inside page margins without cutoff!
function addFigureHeader(doc, figureTitle, y = 26) {
    // Blue Margin Bar Accent
    doc.setFillColor(...BAR_BLUE_PRIMARY);
    doc.rect(14, y, 3.5, 12, "F");

    // Times New Roman Bold Italic Title (16 pt - Fits cleanly!)
    doc.setFont("times", "bolditalic");
    doc.setFontSize(16);
    doc.setTextColor(...DARK_NAVY);
    doc.text(figureTitle, 21, y + 9);
}

// Global Header with Official ETHYRA Logo
function addGlobalHeader(doc, pageTitle = "") {
    if (pageTitle) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(pageTitle, 14, 14);
    }

    if (ETHYRA_LOGO_BASE64) {
        doc.addImage(ETHYRA_LOGO_BASE64, "PNG", 158, 5, 38, 13);
    } else {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text("ETHYRA", 160, 13);
        doc.setTextColor(...BAR_BLUE_PRIMARY);
        doc.setFontSize(10);
        doc.text("IMPACT", 183, 13);
    }

    // Sky Blue Divider Line
    doc.setFillColor(...BAR_BLUE_PRIMARY);
    doc.rect(14, 19, 182, 0.8, "F");
}

// Global Footer
function addGlobalFooter(doc, pageNum, totalPages = 8) {
    const pageHeight = 297;
    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, 196, pageHeight - 12);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("connect@ethyra.in", 14, pageHeight - 6);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text(`Page ${pageNum} of ${totalPages}`, 196, pageHeight - 6, { align: "right" });
}

// Helper: Draw Card Container
function drawCard(doc, x, y, w, h, fill = CARD_BG, border = CARD_BORDER) {
    doc.setFillColor(...fill);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, "F");
    if (border) {
        doc.setDrawColor(...border);
        doc.setLineWidth(0.4);
        doc.roundedRect(x, y, w, h, 2.5, 2.5, "D");
    }
}

// Helper: Draw Category Score Bar Graph (Sapphire Blue Theme)
function drawBarChart(doc, x, y, width, height, catList) {
    const N = catList.length;
    if (N === 0) return;
    const itemHeight = (height - 6) / N;
    const barHeight = Math.min(6.5, itemHeight - 4);

    catList.forEach((item, i) => {
        const currY = y + i * itemHeight;

        // Full Category Name Label
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);

        const lines = doc.splitTextToSize(item.name, 66);
        if (lines.length > 1) {
            doc.text(lines[0], x, currY + 2);
            doc.text(lines[1], x, currY + 5.5);
        } else {
            doc.text(lines[0], x, currY + 4.5);
        }

        // Track Background
        const trackX = x + 70;
        const trackW = width - 88;
        doc.setFillColor(...BAR_BLUE_TRACK);
        doc.roundedRect(trackX, currY + 1, trackW, barHeight, 1, 1, "F");

        // Progress Bar
        const fillW = (trackW * Math.min(100, Math.max(0, item.pct))) / 100;
        if (fillW > 0) {
            doc.setFillColor(...BAR_BLUE_FILL);
            doc.roundedRect(trackX, currY + 1, fillW, barHeight, 1, 1, "F");
        }

        // Percentage Value Badge
        const scoreColor = getScoreBlueColor(item.pct);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...scoreColor);
        doc.text(`${item.pct}%`, x + width - 2, currY + 5, { align: "right" });
    });
}

// Helper: Draw Radar / Spider Web Chart with ALL Text & 6 Full Pillar Names Cleanly Inside Box
function drawRadarChart(doc, cx, cy, radius, catList) {
    const N = catList.length;
    if (N === 0) return;

    // Concentric Grid Rings
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

    // Spokes and FULL Pillar Name Labels (100% inside container box)
    for (let i = 0; i < N; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);

        doc.setDrawColor(...RADAR_BLUE_LINE);
        doc.setLineWidth(0.4);
        doc.line(cx, cy, px, py);

        // Position labels with full names nicely inside
        const offset = radius + 8;
        const lx = cx + offset * Math.cos(angle);
        const ly = cy + offset * Math.sin(angle);

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");

        const scoreColor = getScoreBlueColor(catList[i].pct);
        doc.setTextColor(...scoreColor);

        let align = "center";
        if (Math.abs(Math.cos(angle)) > 0.3) {
            align = Math.cos(angle) > 0 ? "left" : "right";
        }

        const fullNameWithPct = `${catList[i].name} (${catList[i].pct}%)`;
        const words = catList[i].name.split(" ");

        if (words.length >= 3) {
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = `${words.slice(mid).join(" ")} (${catList[i].pct}%)`;
            doc.text(line1, lx, ly - 2, { align });
            doc.text(line2, lx, ly + 2, { align });
        } else {
            doc.text(fullNameWithPct, lx, ly, { align });
        }
    }

    // Filled Polygon for Scores
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

    // Outer Polygon Outline
    doc.setDrawColor(...RADAR_BLUE_LINE);
    doc.setLineWidth(0.8);
    for (let i = 0; i < N; i++) {
        const next = dataPts[(i + 1) % N];
        doc.line(dataPts[i].x, dataPts[i].y, next.x, next.y);
    }

    // Node Dots (Blue Color Theme)
    dataPts.forEach((pt) => {
        doc.setFillColor(...pt.color);
        doc.circle(pt.x, pt.y, 2.2, "F");
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.4);
        doc.circle(pt.x, pt.y, 2.2, "D");
    });
}

// Helper: Draw Pie Slice
function drawPieSlice(doc, cx, cy, radius, startAngle, endAngle, color) {
    doc.setFillColor(...color);
    const step = 2;
    for (let a = startAngle; a < endAngle; a += step) {
        const a1 = (a * Math.PI) / 180;
        const a2 = (Math.min(a + step, endAngle) * Math.PI) / 180;
        const x1 = cx + radius * Math.cos(a1);
        const y1 = cy + radius * Math.sin(a1);
        const x2 = cx + radius * Math.cos(a2);
        const y2 = cy + radius * Math.sin(a2);
        doc.triangle(cx, cy, x1, y1, x2, y2, "F");
    }
}

// Helper: Draw Pie / Donut Chart (Blue Gradient Theme)
function drawPieChart(doc, cx, cy, radius, slices) {
    const total = slices.reduce((s, x) => s + x.value, 0);
    if (total === 0) return;

    let currentAngle = -90;
    slices.forEach((slice) => {
        const sliceAngle = (slice.value / total) * 360;
        const endAngle = currentAngle + sliceAngle;
        drawPieSlice(doc, cx, cy, radius, currentAngle, endAngle, slice.color);
        currentAngle = endAngle;
    });

    // Donut Center Cutout
    doc.setFillColor(...BG_WHITE);
    doc.circle(cx, cy, radius * 0.55, "F");
}

// Helper: Draw Trends Line Chart (Steel / Aqua Blue Theme)
function drawTrendsChart(doc, x, y, width, height, trendPoints) {
    const N = trendPoints.length;
    if (N === 0) return;

    const padX = 20;
    const padY = 16;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    // Grid lines
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    [0, 25, 50, 75, 100].forEach((val) => {
        const gy = y + padY + chartH - (chartH * val) / 100;
        doc.line(x + padX, gy, x + padX + chartW, gy);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`${val}%`, x + 3, gy + 2);
    });

    const coords = trendPoints.map((pt, i) => {
        const cx = x + padX + (N === 1 ? chartW / 2 : (chartW * i) / (N - 1));
        const cy = y + padY + chartH - (chartH * Math.min(100, Math.max(0, pt.pct))) / 100;
        return { x: cx, y: cy, label: pt.label, pct: pt.pct, color: getScoreBlueColor(pt.pct) };
    });

    // Connecting Aqua Trend Line
    doc.setDrawColor(...TREND_BLUE_LINE);
    doc.setLineWidth(1.2);
    for (let i = 0; i < coords.length - 1; i++) {
        doc.line(coords[i].x, coords[i].y, coords[i + 1].x, coords[i + 1].y);
    }

    // Color-Coded Node Markers
    coords.forEach((pt) => {
        doc.setFillColor(...TREND_BLUE_GLOW);
        doc.circle(pt.x, pt.y, 3.5, "F");

        doc.setFillColor(...pt.color);
        doc.circle(pt.x, pt.y, 2.5, "F");

        doc.setFillColor(...BG_WHITE);
        doc.circle(pt.x, pt.y, 1, "F");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...pt.color);
        doc.text(`${pt.pct}%`, pt.x, pt.y - 4.5, { align: "center" });

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(pt.label, pt.x, y + height - 3.5, { align: "center" });
    });
}

// ==========================================
// MAIN EXPORT FUNCTION: buildAssessmentDoc (8 Pages)
// ==========================================
export function buildAssessmentDoc(result, profile, answers = []) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const orgName = profile?.organizationName || "Organization";
    const fullName = profile?.fullName || "Contact Person";
    const email = profile?.email || "N/A";
    const phone = profile?.phone || "N/A";
    const submissionDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const pct = Math.round(result?.percentage ?? 0);
    const totalScore = result?.totalScore ?? 0;
    const maxScore = result?.maxScore ?? 0;
    const rating = result?.performanceLevel ?? "N/A";
    const isEligible = result?.isEligible ?? false;
    const riskLevel = result?.riskLevel || (pct >= 70 ? "Low Risk" : pct >= 50 ? "Medium Risk" : "High Risk");

    // Standardized Category Data
    const rawCategories = Object.entries(result?.categoryScores ?? {});
    const catList = rawCategories.map(([name, data]) => {
        const catPct = data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0;
        return { name, scored: data.scored, max: data.max, pct: catPct };
    });

    // ----------------------------------------------------
    // PAGE 1: Cover Header & Organization Profile (No text overlap, 100% inside boxes!)
    // ----------------------------------------------------
    fillPageBackground(doc);
    addGlobalHeader(doc, "NGO Impact Report");

    // Figure 1-1 Header (16pt Times New Roman Bold Italic - Never cut off!)
    addFigureHeader(doc, "Figure 1-1: NGO Impact & Executive Readiness Framework", 24);

    // Organization Details Card
    drawCard(doc, 14, 42, 182, 54, CARD_BG_ALT, CARD_BORDER);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Organization & Assessment Profile", 20, 51);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 54, 190, 54);

    // Profile Details with proper column width & text wrapping so EVALUATION FRAMEWORK never overflows!
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
        ["EVALUATION FRAMEWORK", "61-Criteria Corporate CSR Standard"],
    ];

    leftFields.forEach(([label, val], idx) => {
        const rowY = 61 + idx * 10;
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(label, col1X, rowY);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(String(val), col1X + 34, rowY);
    });

    rightFields.forEach(([label, val], idx) => {
        const rowY = 61 + idx * 10;
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(label, col2X, rowY);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);

        // Wrap value if needed so it stays 100% inside the card box boundary (X=190 max)
        const valLines = doc.splitTextToSize(String(val), 48);
        doc.text(valLines[0], col2X + 36, rowY);
        if (valLines.length > 1) {
            doc.text(valLines[1], col2X + 36, rowY + 3.5);
        }
    });

    // Executive Summary Card (Spacing recalculated to eliminate ANY text overlap!)
    drawCard(doc, 14, 102, 182, 180, CARD_BG, CARD_BORDER);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BAR_BLUE_PRIMARY);
    doc.text("Executive Summary & Methodology Overview", 20, 112);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_BODY);
    const summaryParas = [
        `This due diligence report evaluates ${orgName} across 61 comprehensive criteria.`,
        "The framework is designed for CSR Donors, Corporate Grantmakers, and Philanthropic Foundations",
        "to verify institutional readiness, statutory tax compliance, governance, and program capability.",
        "",
        "Evaluation methodology incorporates statutory verifications under Indian law, including:",
        " • Income Tax Act (Sections 12AB and 80G Registration & Revalidation)",
        " • Ministry of Corporate Affairs (MCA Form CSR-1 Empanelment)",
        " • Foreign Contribution Regulation Act (FCRA 2020 Compliance Mandates)",
        " • Statutory & Financial Audits (Audited Statements, TDS, EPFO & GST Compliance)",
        " • Institutional Governance (POSH, Safeguarding, Board Governance & Risk Controls)",
    ];

    summaryParas.forEach((line, idx) => {
        doc.text(line, 20, 120 + idx * 4.8);
    });

    // Core Pillars Section Header placed at Y=175 with zero overlap!
    const pillarsY = 174;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Core Evaluation Pillars Assessed:", 20, pillarsY);

    catList.forEach((cat, idx) => {
        const py = pillarsY + 5 + idx * 15;
        doc.setFillColor(...BG_WHITE);
        doc.roundedRect(20, py, 170, 11, 1.5, 1.5, "F");
        doc.setDrawColor(...CARD_BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(20, py, 170, 11, 1.5, 1.5, "D");

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(`${idx + 1}. ${cat.name}`, 24, py + 7);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...getScoreBlueColor(cat.pct));
        doc.text(`${cat.pct}% Scored (${cat.scored}/${cat.max} pts)`, 185, py + 7, { align: "right" });
    });

    addGlobalFooter(doc, 1, 8);

    // ----------------------------------------------------
    // PAGE 2: Key KPI Cards & ELIGIBILITY STATUS Box (100% Blue Theme, Text Fits inside Box!)
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Key Performance Indicators & Readiness Status");

    addFigureHeader(doc, "Figure 2-1: Key KPI Cards & Eligibility Assessment", 24);

    // 4 Top KPI Cards
    // Card 1: Overall Score
    drawCard(doc, 14, 42, 42, 40, CARD_BG, CARD_BORDER);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("OVERALL SCORE", 35, 50, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BAR_BLUE_PRIMARY);
    doc.text(`${totalScore} / ${maxScore}`, 35, 62, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...getScoreBlueColor(pct));
    doc.text(`${pct}% Scored`, 35, 73, { align: "center" });

    // Card 2: ELIGIBILITY STATUS Card (TEXT 100% INSIDE BOX, NO OVERFLOW!)
    const eligBlueColor = isEligible ? BLUE_STRONG : BLUE_LOW;
    drawCard(doc, 60, 42, 42, 40, CARD_BG_ALT, [eligBlueColor[0], eligBlueColor[1], eligBlueColor[2]]);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("ELIGIBILITY STATUS", 81, 50, { align: "center" });

    // Adjusted font size to 7.5pt so "✓ ELIGIBLE" or "✗ NOT ELIGIBLE" is 100% inside 42mm card!
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...eligBlueColor);
    doc.text(isEligible ? "✓ ELIGIBLE" : "✗ NOT ELIGIBLE", 81, 61, { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text(isEligible ? "All Mandatory Passed" : "Criteria Pending", 81, 72, { align: "center" });

    // Card 3: Readiness Level
    drawCard(doc, 106, 42, 42, 40, CARD_BG, CARD_BORDER);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("READINESS LEVEL", 127, 50, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...getScoreBlueColor(pct));
    doc.text(rating, 127, 62, { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Evaluation Grade", 127, 72, { align: "center" });

    // Card 4: Risk Assessment
    drawCard(doc, 152, 42, 42, 40, CARD_BG, CARD_BORDER);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("RISK RATING", 173, 50, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...getScoreBlueColor(pct));
    doc.text(riskLevel, 173, 62, { align: "center" });

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Regulatory Risk", 173, 72, { align: "center" });

    // Detailed ELIGIBILITY STATUS Verification Box Container
    drawCard(doc, 14, 90, 182, 190, CARD_BG_ALT, [eligBlueColor[0], eligBlueColor[1], eligBlueColor[2]]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Detailed Eligibility Status & Compliance Verification Box", 20, 101);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 104, 190, 104);

    // Status Banner Fill Box Inside Container
    doc.setFillColor(...eligBlueColor);
    doc.roundedRect(20, 110, 170, 14, 2, 2, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BG_WHITE);
    doc.text(isEligible ? "ELIGIBILITY STATUS ANSWER: APPROVED FOR CSR FUNDING & PARTNERSHIPS" : "ELIGIBILITY STATUS ANSWER: NON-COMPLIANT / MANDATORY GATING PENDING", 105, 119, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_BODY);
    const eligDesc = isEligible
        ? `${orgName} has successfully satisfied 100% of mandatory statutory gating criteria (including 12A, 80G, CSR-1, PAN, NGO Darpan, and audited financial filings). The organization is fully eligible to receive corporate CSR grants.`
        : `${orgName} currently fails one or more mandatory gating requirements. Corrective action is required before entering formal CSR partnerships.`;
    const lines = doc.splitTextToSize(eligDesc, 168);
    lines.forEach((l, i) => doc.text(l, 20, 132 + i * 4.5));

    addGlobalFooter(doc, 2, 8);

    // ----------------------------------------------------
    // PAGE 3: Figure 4-4: Category Score Bar Graph (Sapphire Blue Theme)
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Category Score Bar Graph");

    addFigureHeader(doc, "Figure 4-4: Category Readiness Bar Graph", 24);

    drawCard(doc, 14, 42, 182, 238, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BAR_BLUE_PRIMARY);
    doc.text("Complete Category Performance & Score Bar Graph", 20, 53);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Source: Primary Assessment Survey & Due Diligence Audit", 20, 59);

    drawBarChart(doc, 20, 68, 170, 198, catList);

    addGlobalFooter(doc, 3, 8);

    // ----------------------------------------------------
    // PAGE 4: Figure 4-5: Pillar Readiness Radar Chart (Spider Web) (Royal/Electric Blue Theme)
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Pillar Readiness Radar Chart");

    addFigureHeader(doc, "Figure 4-5: Pillar Readiness Radar Chart", 24);

    drawCard(doc, 14, 42, 182, 238, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...RADAR_BLUE_LINE);
    doc.text("Multi-Dimensional Pillar Readiness Radar Chart (Spider Web)", 20, 53);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Spider Web Evaluation Across 6 Core Governance & Operational Pillars", 20, 59);

    drawRadarChart(doc, 105, 160, 50, catList);

    addGlobalFooter(doc, 4, 8);

    // ----------------------------------------------------
    // PAGE 5: Figure 4-6: Score Distribution Pie Chart (Ocean/Sky Blue Theme)
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Score Distribution Pie Chart");

    addFigureHeader(doc, "Figure 4-6: Score Distribution & Pillar Categories Pattern", 24);

    drawCard(doc, 14, 42, 182, 238, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PIE_BLUE_1);
    doc.text("Organizational Score Distribution Donut & Pie Chart", 20, 53);

    const highCount = catList.filter((c) => c.pct >= 70).length;
    const modCount = catList.filter((c) => c.pct >= 50 && c.pct < 70).length;
    const lowCount = catList.filter((c) => c.pct < 50).length;

    const pieSlices = [
        { label: "High Readiness (≥70%)", value: Math.max(0.1, highCount), color: PIE_BLUE_1 },
        { label: "Moderate (50-69%)", value: Math.max(0.1, modCount), color: PIE_BLUE_2 },
        { label: "Low Readiness (<50%)", value: Math.max(0.1, lowCount), color: PIE_BLUE_3 },
    ];
    drawPieChart(doc, 105, 135, 48, pieSlices);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text(`${pct}%`, 105, 133, { align: "center" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_MUTED);
    doc.text("OVERALL SCORE", 105, 140, { align: "center" });

    const pieLegends = [
        { label: `Strong Pillars (≥70%): ${highCount} Categories`, color: PIE_BLUE_1 },
        { label: `Moderate Pillars (50-69%): ${modCount} Categories`, color: PIE_BLUE_2 },
        { label: `Weak / Low Pillars (<50%): ${lowCount} Categories`, color: PIE_BLUE_3 },
    ];

    pieLegends.forEach((lg, idx) => {
        const ly = 205 + idx * 12;
        doc.setFillColor(...lg.color);
        doc.rect(40, ly, 6, 6, "F");

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(lg.label, 50, ly + 4.5);
    });

    addGlobalFooter(doc, 5, 8);

    // ----------------------------------------------------
    // PAGE 6: Figure 4-7: Pillar Performance Trends Chart (Steel/Aqua Blue Theme)
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Pillar Performance Trends Chart");

    addFigureHeader(doc, "Figure 4-7: Pillar Performance Trends & Continuity Line", 24);

    drawCard(doc, 14, 42, 182, 238, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TREND_BLUE_NODE);
    doc.text("Pillar Readiness Performance Trends Across Evaluation Criteria", 20, 53);

    const trendPoints = catList.map((c) => ({
        label: c.name.split(" ")[0],
        pct: c.pct,
    }));
    drawTrendsChart(doc, 20, 68, 170, 198, trendPoints);

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

    drawCard(doc, 14, 26, 182, 120, CARD_BG_ALT, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Key Strengths & High Readiness Pillars (≥70%)", 20, 36);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 39, 190, 39);

    if (strongCats.length > 0) {
        strongCats.forEach((sc, i) => {
            const sy = 45 + i * 17;
            doc.setFillColor(...BG_WHITE);
            doc.roundedRect(20, sy, 170, 14, 1.5, 1.5, "F");

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...BLUE_STRONG);
            doc.text(`✓ ${sc.name}`, 24, sy + 5.5);

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...BLUE_STRONG);
            doc.text(`${sc.pct}% Scored (${sc.scored}/${sc.max} pts)`, 185, sy + 5.5, { align: "right" });

            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TEXT_BODY);
            doc.text("Demonstrates robust compliance, strong internal controls, and operational readiness for corporate CSR grants.", 24, sy + 10.5);
        });
    } else {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT_BODY);
        doc.text("No evaluation category currently meets the 70% threshold required for High Readiness.", 24, 48);
    }

    drawCard(doc, 14, 152, 182, 128, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Priority Areas for Improvement & Risk Mitigation (<70%)", 20, 162);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 165, 190, 165);

    const needAttn = [...modCats, ...weakCats];
    if (needAttn.length > 0) {
        needAttn.forEach((ac, i) => {
            const ay = 171 + i * 17;
            const scoreColor = getScoreBlueColor(ac.pct);

            doc.setFillColor(...BG_WHITE);
            doc.roundedRect(20, ay, 170, 14, 1.5, 1.5, "F");

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...scoreColor);
            doc.text(`! ${ac.name}`, 24, ay + 5.5);

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...scoreColor);
            doc.text(`${ac.pct}% Scored (${ac.scored}/${ac.max} pts)`, 185, ay + 5.5, { align: "right" });

            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...TEXT_BODY);
            doc.text("Requires targeted policy updates, documentation alignment, or operational governance enhancements.", 24, ay + 10.5);
        });
    } else {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...BLUE_STRONG);
        doc.text("Excellent organizational posture: All evaluation categories scored 70% or higher.", 24, 174);
    }

    addGlobalFooter(doc, 7, 8);

    // ----------------------------------------------------
    // PAGE 8: Compliance Audit & Dedicated Closing Statement
    // ----------------------------------------------------
    doc.addPage();
    fillPageBackground(doc);
    addGlobalHeader(doc, "Compliance Audit & Closing Statement");

    drawCard(doc, 14, 26, 182, 142, CARD_BG, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_NAVY);
    doc.text("Mandatory Compliance Checklist Audit", 20, 36);

    const mandatoryChecklist = [
        { item: "1. Income Tax 12A & 80G Registration Status", status: "PASS", desc: "Valid tax exemption certificates for donor deductions" },
        { item: "2. NITI Aayog NGO Darpan Registration ID", status: "PASS", desc: "Active portal registration with unique identity number" },
        { item: "3. MCA Form CSR-1 Registration Mandate", status: "PASS", desc: "Registered with Ministry of Corporate Affairs for CSR funds" },
        { item: "4. 3 Years Audited Financial Statements & ITR", status: "PASS", desc: "Independent chartered accountant audit reports filed" },
        { item: "5. Active Governing Board with Min 3 Trustees", status: "PASS", desc: "Board oversight with active non-executive members" },
        { item: "6. FCRA Foreign Contribution Compliance Status", status: "PASS", desc: "MHA approval or compliant non-receipt declaration" },
    ];

    const mandatoryFailed = result?.mandatoryFailed ?? [];
    if (mandatoryFailed.length > 0) {
        mandatoryChecklist.forEach((chk) => {
            if (mandatoryFailed.some((mf) => mf.toLowerCase().includes(chk.item.split(" ")[1].toLowerCase()))) {
                chk.status = "FAIL";
            }
        });
    }

    let auditY = 42;
    mandatoryChecklist.forEach((c) => {
        doc.setFillColor(...BG_WHITE);
        doc.roundedRect(18, auditY, 174, 15, 1.5, 1.5, "F");
        doc.setDrawColor(...CARD_BORDER);
        doc.setLineWidth(0.2);
        doc.roundedRect(18, auditY, 174, 15, 1.5, 1.5, "D");

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_NAVY);
        doc.text(c.item, 22, auditY + 5.5);

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT_MUTED);
        doc.text(c.desc, 22, auditY + 10.5);

        const badgeColor = c.status === "PASS" ? BLUE_STRONG : BLUE_LOW;
        doc.setFillColor(...badgeColor);
        doc.roundedRect(162, auditY + 4, 24, 6.5, 1, 1, "F");

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BG_WHITE);
        doc.text(c.status === "PASS" ? "✓ PASSED" : "✗ FAILED", 174, auditY + 8.2, { align: "center" });

        auditY += 18;
    });

    drawCard(doc, 14, 174, 182, 106, CARD_BG_ALT, CARD_BORDER);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BAR_BLUE_PRIMARY);
    doc.text("Closing Message & Verification Statement from ETHYRA Impact", 20, 185);

    doc.setDrawColor(...CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.line(20, 188, 190, 188);

    doc.setFontSize(8);
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
        doc.text(line, 20, 196 + idx * 5.2);
    });

    addGlobalFooter(doc, 8, 8);

    return doc;
}
