// Assessment Questions — all 61
export const QUESTIONS = [
    // SECTION 1 — Legal Identity & Registration (Q1–Q15)
    { id: 1, slNo: 1, category: "Legal Identity & Registration", text: "Is the organization legally registered as a Trust, Society, or Section 8 Company?", type: "Mandatory", maxScore: 0 },
    { id: 2, slNo: 2, category: "Legal Identity & Registration", text: "Are the registration certificate and governing documents (Trust Deed / MOA / AOA / Bylaws) available and updated?", type: "Mandatory", maxScore: 0 },
    { id: 3, slNo: 3, category: "Legal Identity & Registration", text: "Is the organization registered under CSR-1 and eligible to undertake CSR activities?", type: "Mandatory", maxScore: 0 },
    { id: 4, slNo: 4, category: "Legal Identity & Registration", text: "Does the organization possess a valid PAN in the organization's name?", type: "Mandatory", maxScore: 0 },
    { id: 5, slNo: 5, category: "Legal Identity & Registration", text: "Does the organization hold valid registration under Section 12AB of the Income Tax Act?", type: "Mandatory", maxScore: 0 },
    { id: 6, slNo: 6, category: "Legal Identity & Registration", text: "Does the organization hold valid approval under Section 80G of the Income Tax Act?", type: "Mandatory", maxScore: 0 },
    { id: 7, slNo: 7, category: "Legal Identity & Registration", text: "Has the organization renewed or revalidated Income Tax registrations wherever applicable under current Income Tax provisions?", type: "Normal", maxScore: 2 },
    { id: 8, slNo: 8, category: "Legal Identity & Registration", text: "Does the organization possess TAN registration, if applicable?", type: "Normal", maxScore: 2 },
    { id: 9, slNo: 9, category: "Legal Identity & Registration", text: "Is the organization registered under GST, if applicable?", type: "Normal", maxScore: 2 },
    { id: 10, slNo: 10, category: "Legal Identity & Registration", text: "Is the organization registered under EPFO, if applicable?", type: "Normal", maxScore: 2 },
    { id: 11, slNo: 11, category: "Legal Identity & Registration", text: "Is the organization registered under ESIC, if applicable?", type: "Normal", maxScore: 2 },
    { id: 12, slNo: 12, category: "Legal Identity & Registration", text: "Is the organization compliant with Professional Tax registration requirements, if applicable?", type: "Normal", maxScore: 2 },
    { id: 13, slNo: 13, category: "Legal Identity & Registration", text: "Does the organization possess valid FCRA registration / renewal / prior permission documentation, if applicable?", type: "Normal", maxScore: 2 },
    { id: 14, slNo: 14, category: "Legal Identity & Registration", text: "Is the organization registered on the NGO Darpan portal?", type: "Normal", maxScore: 2 },
    { id: 15, slNo: 15, category: "Legal Identity & Registration", text: "Is the organization registered or listed under the Social Stock Exchange (SSE), if applicable?", type: "Normal", maxScore: 2 },

    // SECTION 2 — Statutory & Tax Compliance (Q16–Q24)
    { id: 16, slNo: 16, category: "Statutory & Tax Compliance", text: "Are Income Tax Returns and applicable statutory filings available for the last 3 financial years?", type: "Mandatory", maxScore: 0 },
    { id: 17, slNo: 17, category: "Statutory & Tax Compliance", text: "Are TDS filings and statutory deductions compliant and up to date, if applicable?", type: "Normal", maxScore: 2 },
    { id: 18, slNo: 18, category: "Statutory & Tax Compliance", text: "Are EPFO filings and employee compliances up to date, if applicable?", type: "Normal", maxScore: 2 },
    { id: 19, slNo: 19, category: "Statutory & Tax Compliance", text: "Are ESIC filings and employee compliances up to date, if applicable?", type: "Normal", maxScore: 2 },
    { id: 20, slNo: 20, category: "Statutory & Tax Compliance", text: "Are GST returns and statutory compliances up to date, if applicable?", type: "Normal", maxScore: 2 },
    { id: 21, slNo: 21, category: "Statutory & Tax Compliance", text: "Are Professional Tax filings and compliances up to date, if applicable?", type: "Normal", maxScore: 2 },
    { id: 22, slNo: 22, category: "Statutory & Tax Compliance", text: "Are FCRA annual returns and compliances up to date, if applicable?", type: "Normal", maxScore: 2 },
    { id: 23, slNo: 23, category: "Statutory & Tax Compliance", text: "Is the organization free from pending statutory notices, tax disputes, penalties, or major compliance violations?", type: "Normal", maxScore: 2 },
    { id: 24, slNo: 24, category: "Statutory & Tax Compliance", text: "Has the organization avoided cancellation, suspension, or adverse action relating to 12AB, 80G, CSR-1, or FCRA registrations?", type: "Normal", maxScore: 2 },

    // SECTION 3 — Financial Management & Stability (Q25–Q31)
    { id: 25, slNo: 25, category: "Financial Management & Stability", text: "Are audited financial statements available for the last 3 financial years?", type: "Mandatory", maxScore: 0 },
    { id: 26, slNo: 26, category: "Financial Management & Stability", text: "Are audited financial statements free from major audit qualifications, adverse remarks, or going-concern observations?", type: "Normal", maxScore: 2 },
    { id: 27, slNo: 27, category: "Financial Management & Stability", text: "Does the organization maintain documented financial controls and approval mechanisms?", type: "Normal", maxScore: 2 },
    { id: 28, slNo: 28, category: "Financial Management & Stability", text: "Does the organization maintain annual budgeting and financial planning processes?", type: "Normal", maxScore: 2 },
    { id: 29, slNo: 29, category: "Financial Management & Stability", text: "Does the organization maintain diversified funding sources?", type: "Normal", maxScore: 2 },
    { id: 30, slNo: 30, category: "Financial Management & Stability", text: "Is the organization financially sustainable without over-dependence on a single donor or funding source?", type: "Normal", maxScore: 2 },
    { id: 31, slNo: 31, category: "Financial Management & Stability", text: "Does the organization maintain proper utilization tracking and donor-wise fund accountability systems?", type: "Normal", maxScore: 2 },

    // SECTION 4 — Governance & Ethics (Q32–Q44)
    { id: 32, slNo: 32, category: "Governance & Ethics", text: "Does the organization maintain key organizational policies (HR, Finance, Procurement, IT, Travel, etc.)?", type: "Normal", maxScore: 2 },
    { id: 33, slNo: 33, category: "Governance & Ethics", text: "Does the organization maintain POSH, Child Protection, and Safeguarding policies where relevant?", type: "Normal", maxScore: 2 },
    { id: 34, slNo: 34, category: "Governance & Ethics", text: "Are safeguarding and ethical practices actively implemented within the organization?", type: "Normal", maxScore: 2 },
    { id: 35, slNo: 35, category: "Governance & Ethics", text: "Has staff received training on safeguarding, ethics, and compliance policies?", type: "Normal", maxScore: 2 },
    { id: 36, slNo: 36, category: "Governance & Ethics", text: "Does the organization maintain anti-fraud, whistleblower, or grievance redressal mechanisms?", type: "Normal", maxScore: 2 },
    { id: 37, slNo: 37, category: "Governance & Ethics", text: "Does the Board or Governing Body meet regularly with documented meeting records?", type: "Normal", maxScore: 2 },
    { id: 38, slNo: 38, category: "Governance & Ethics", text: "Does the leadership team possess relevant sector and operational experience?", type: "Normal", maxScore: 2 },
    { id: 39, slNo: 39, category: "Governance & Ethics", text: "Does the organization maintain a structured operational and program management team?", type: "Normal", maxScore: 2 },
    { id: 40, slNo: 40, category: "Governance & Ethics", text: "Is the organization free from major ongoing legal, criminal, or regulatory proceedings?", type: "Normal", maxScore: 2 },
    { id: 41, slNo: 41, category: "Governance & Ethics", text: "Are the Board members and key management personnel free from major legal or criminal cases?", type: "Normal", maxScore: 2 },
    { id: 42, slNo: 42, category: "Governance & Ethics", text: "Has the organization avoided blacklisting, suspension, or de-empanelment by funders, corporates, or government authorities?", type: "Normal", maxScore: 2 },
    { id: 43, slNo: 43, category: "Governance & Ethics", text: "Does the organization maintain operational and political neutrality relevant to its work?", type: "Normal", maxScore: 2 },
    { id: 44, slNo: 44, category: "Governance & Ethics", text: "Does the organization maintain a documented risk mitigation or enterprise risk management approach?", type: "Normal", maxScore: 2 },

    // SECTION 5 — Program Capability & Strategic Fit (Q45–Q52)
    { id: 45, slNo: 45, category: "Program Capability & Strategic Fit", text: "Does the organization work in thematic areas aligned with the proposed program, CSR priorities, or SDGs?", type: "Normal", maxScore: 2 },
    { id: 46, slNo: 46, category: "Program Capability & Strategic Fit", text: "Does the organization possess at least 3 years of experience in the relevant thematic areas?", type: "Normal", maxScore: 2 },
    { id: 47, slNo: 47, category: "Program Capability & Strategic Fit", text: "Has the organization successfully implemented similar projects or programs previously?", type: "Normal", maxScore: 2 },
    { id: 48, slNo: 48, category: "Program Capability & Strategic Fit", text: "Does the organization follow a defined implementation, operational, and reporting structure?", type: "Normal", maxScore: 2 },
    { id: 49, slNo: 49, category: "Program Capability & Strategic Fit", text: "Does the organization demonstrate scalability in geography, outreach, or program volume?", type: "Normal", maxScore: 2 },
    { id: 50, slNo: 50, category: "Program Capability & Strategic Fit", text: "Does the organization maintain a sustainability, transition, or exit strategy for programs?", type: "Normal", maxScore: 2 },
    { id: 51, slNo: 51, category: "Program Capability & Strategic Fit", text: "Does the organization align its programs with government schemes, district priorities, or national development goals?", type: "Normal", maxScore: 2 },
    { id: 52, slNo: 52, category: "Program Capability & Strategic Fit", text: "Does the organization use innovation, technology, digital systems, or data tools in program implementation?", type: "Normal", maxScore: 2 },

    // SECTION 6 — Monitoring, Impact & Transparency (Q53–Q61)
    { id: 53, slNo: 53, category: "Monitoring, Impact & Transparency", text: "Are annual reports or equivalent organizational reports publicly available?", type: "Normal", maxScore: 2 },
    { id: 54, slNo: 54, category: "Monitoring, Impact & Transparency", text: "Does the organization maintain an active website or official digital presence?", type: "Normal", maxScore: 2 },
    { id: 55, slNo: 55, category: "Monitoring, Impact & Transparency", text: "Has the organization shared program updates within the last 6 months through official communication channels or social media?", type: "Normal", maxScore: 2 },
    { id: 56, slNo: 56, category: "Monitoring, Impact & Transparency", text: "Does the organization track outcomes and impact indicators beyond activity reporting?", type: "Normal", maxScore: 2 },
    { id: 57, slNo: 57, category: "Monitoring, Impact & Transparency", text: "Does the organization collect baseline, endline, or beneficiary progress data where relevant?", type: "Normal", maxScore: 2 },
    { id: 58, slNo: 58, category: "Monitoring, Impact & Transparency", text: "Does the organization maintain a Monitoring & Evaluation (M&E) system or framework?", type: "Normal", maxScore: 2 },
    { id: 59, slNo: 59, category: "Monitoring, Impact & Transparency", text: "Is the organization open to employee volunteering and stakeholder engagement initiatives?", type: "Normal", maxScore: 2 },
    { id: 60, slNo: 60, category: "Monitoring, Impact & Transparency", text: "Can the organization effectively engage employees, leadership teams, or external stakeholders in program activities?", type: "Normal", maxScore: 2 },
    { id: 61, slNo: 61, category: "Monitoring, Impact & Transparency", text: "Does the organization maintain a beneficiary feedback or grievance mechanism?", type: "Normal", maxScore: 2 },
];

export const MANDATORY_IDS = [1, 2, 3, 4, 5, 6, 16, 25];

export const CATEGORIES = [
    { name: "Legal Identity & Registration", color: "from-blue-500 to-blue-600", count: 15, badge: "bg-blue-100 text-blue-700 border-blue-200" },
    { name: "Statutory & Tax Compliance", color: "from-indigo-500 to-indigo-600", count: 9, badge: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { name: "Financial Management & Stability", color: "from-violet-500 to-violet-600", count: 7, badge: "bg-violet-100 text-violet-700 border-violet-200" },
    { name: "Governance & Ethics", color: "from-cyan-500 to-cyan-600", count: 13, badge: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    { name: "Program Capability & Strategic Fit", color: "from-teal-500 to-teal-600", count: 8, badge: "bg-teal-100 text-teal-700 border-teal-200" },
    { name: "Monitoring, Impact & Transparency", color: "from-sky-500 to-sky-600", count: 9, badge: "bg-sky-100 text-sky-700 border-sky-200" },
];

export const CHART_COLORS = ['#0047AB', '#00AEEF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

// Scoring
export function getScore(question, answer) {
    if (question.type === "Mandatory") {
        if (answer === "Yes") return "Pass";
        if (answer === "No") return "Fail";
        return "NA";
    }
    if (answer === "Yes") return question.maxScore;
    if (answer === "NA") return "NA";
    return 0;
}

export function calculateResults(answers) {
    const normalQuestions = QUESTIONS.filter((q) => q.type === "Normal");
    const maxScore = normalQuestions.reduce((sum, q) => sum + q.maxScore, 0);

    let totalScore = 0;
    const mandatoryFailed = [];
    const categoryMap = {};

    CATEGORIES.forEach((cat) => {
        categoryMap[cat.name] = { scored: 0, max: 0, count: 0, answered: 0 };
    });

    QUESTIONS.forEach((q) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const cat = categoryMap[q.category];
        if (!cat) return;
        cat.count++;

        if (q.type === "Mandatory") {
            if (answer?.selectedAnswer === "No") {
                mandatoryFailed.push(q.text);
            }
        } else {
            cat.max += q.maxScore;
            if (answer?.selectedAnswer === "Yes") {
                totalScore += q.maxScore;
                cat.scored += q.maxScore;
                cat.answered++;
            } else if (answer?.selectedAnswer === "No") {
                cat.answered++;
            } else if (answer?.selectedAnswer === "NA") {
                cat.answered++;
            }
        }

        if (answer) cat.answered = cat.answered || 0;
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const isEligible = mandatoryFailed.length === 0;

    let performanceLevel = "Weak";
    if (percentage >= 70) performanceLevel = "Strong";
    else if (percentage >= 50) performanceLevel = "Moderate";

    let riskLevel = "High";
    if (percentage >= 70) riskLevel = "Low";
    else if (percentage >= 50) riskLevel = "Medium";

    return {
        totalScore,
        maxScore,
        percentage,
        performanceLevel,
        riskLevel,
        isEligible,
        mandatoryFailed,
        categoryScores: categoryMap,
    };
}

export function getRatingCategory(percentage) {
    if (percentage >= 85) return {
        label: "Highly Recommended",
        description: "Your organization demonstrates exceptional readiness for CSR partnerships and institutional funding.",
        color: "green",
    };
    if (percentage >= 70) return {
        label: "Recommended with Minor Observations",
        description: "Strong foundation with minor areas for improvement. Well-positioned for most funding opportunities.",
        color: "blue",
    };
    if (percentage >= 50) return {
        label: "Moderate Risk – Requires Review",
        description: "Moderate readiness. Targeted improvements needed before pursuing major CSR partnerships.",
        color: "amber",
    };
    return {
        label: "High Risk / Not Recommended",
        description: "Significant development required across multiple compliance and governance areas.",
        color: "red",
    };
}
