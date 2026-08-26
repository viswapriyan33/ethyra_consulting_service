import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock, Unlock, FileDown, Download, LogOut, CheckCircle2, XCircle,
    Clock, AlertTriangle, BarChart2, PieChart as PieChartIcon, Radar
} from "lucide-react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar as RechartsRadar, Legend
} from "recharts";
import { getUserSession, logoutUser } from "../utils/authUtils";
import { AssessmentResultDB, PaymentRecordDB, AssessmentAnswerDB } from "../utils/db";
import { getRatingCategory, QUESTIONS, CATEGORIES, CHART_COLORS } from "../utils/questions";
import { buildAssessmentDoc } from "../utils/reportPdf";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

function ScoreCard({ label, value, sub, colorClass }) {
    return (
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-black ${colorClass}`}>{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function Results() {
    const navigate = useNavigate();
    const location = useLocation();
    const session = getUserSession();
    const { attemptId } = location.state || {};

    const [result, setResult] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        if (!session?.id || !attemptId) return;
        const r = AssessmentResultDB.findByAttempt(attemptId);
        setResult(r);
        const payments = PaymentRecordDB.findByAttempt(attemptId);
        const successPay = payments.find(p => p.status === "success");
        const pendingPay = payments.find(p => p.status === "pending");
        setPayment(successPay || pendingPay || null);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        // Subscribe to payment updates
        const unsub = PaymentRecordDB.subscribe(() => loadData());
        return unsub;
    }, [attemptId]);

    const isUnlocked = payment?.status === "success";
    const isPending = payment?.status === "pending";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Calculating your results...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <p className="text-slate-600">No results found. Please complete the assessment first.</p>
                    <button onClick={() => navigate("/assessment")} className="mt-4 bg-primary text-white px-6 py-2 rounded-xl">
                        Go to Assessment
                    </button>
                </div>
            </div>
        );
    }

    const pct = Math.round(result.percentage ?? 0);
    const rating = getRatingCategory(pct);
    const catScores = result.categoryScores ?? {};

    const ratingColor = {
        green: "bg-green-50 border-green-300 text-green-800",
        blue: "bg-blue-50 border-blue-300 text-blue-800",
        amber: "bg-amber-50 border-amber-300 text-amber-800",
        red: "bg-red-50 border-red-300 text-red-800",
    }[rating.color];

    // Chart data
    const pieData = [
        { name: "Scored", value: result.totalScore },
        { name: "Remaining", value: result.maxScore - result.totalScore },
    ];

    const barData = Object.entries(catScores)
        .slice(0, 3)
        .map(([name, data]) => ({
            name: name.split(" ")[0],
            score: data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0,
        }));

    const fullBarData = Object.entries(catScores).map(([name, data]) => ({
        name: name.split(" ").slice(0, 2).join(" "),
        score: data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0,
    }));

    const radarData = Object.entries(catScores).map(([name, data]) => ({
        category: name.split(" ")[0],
        score: data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0,
    }));

    const answers = AssessmentAnswerDB.findByAttempt(attemptId);

    const handleDownloadPdf = () => {
        const profile = {
            fullName: session?.fullName,
            email: session?.email,
            phone: session?.phone,
            organizationName: session?.organizationName,
        };
        const doc = buildAssessmentDoc(result, profile, answers);
        doc.save(`ETHYRA_Impact_Assessment_Report_${(session?.organizationName || "NGO").replace(/\s+/g, "_")}.pdf`);
    };

    const handleExit = () => { logoutUser(); navigate("/login"); };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <img src={LOGO} alt="ETHYRA" className="h-8" />
                    <h1 className="text-sm font-semibold text-slate-700">Assessment Results</h1>
                    <div className="flex items-center gap-2">
                        {isUnlocked && (
                            <>
                                <button onClick={handleDownloadPdf} className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all">
                                    <FileDown className="w-3 h-3" />PDF
                                </button>
                                <button onClick={() => window.print()} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all">
                                    <Download className="w-3 h-3" />Print
                                </button>
                            </>
                        )}
                        <button onClick={handleExit} className="text-red-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-all">
                            <LogOut className="w-3 h-3" />Exit
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 pb-16 space-y-6">
                {/* Eligibility Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 flex items-center gap-3 ${result.isEligible ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
                >
                    {result.isEligible ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                        <p className={`font-bold ${result.isEligible ? "text-green-800" : "text-red-800"}`}>
                            {result.isEligible ? "ELIGIBLE — All mandatory criteria passed." : `NOT ELIGIBLE — ${result.mandatoryFailed?.length || 0} mandatory criteria failed.`}
                        </p>
                        {!result.isEligible && result.mandatoryFailed?.length > 0 && (
                            <p className="text-red-600 text-xs mt-0.5">{result.mandatoryFailed.slice(0, 2).join("; ")}{result.mandatoryFailed.length > 2 ? " ..." : ""}</p>
                        )}
                    </div>
                </motion.div>

                {/* Score Cards */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ScoreCard label="Total Score" value={`${result.totalScore}/${result.maxScore}`} colorClass="text-primary" />
                    <ScoreCard label="Percentage" value={`${pct}%`} colorClass={pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"} />
                    <ScoreCard label="Final Rating" value={result.performanceLevel} colorClass={pct >= 70 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"} />
                    <ScoreCard label="Risk Level" value={result.riskLevel}
                        colorClass={result.riskLevel === "Low" ? "text-green-600" : result.riskLevel === "Medium" ? "text-amber-600" : "text-red-600"}
                    />
                </motion.div>

                {/* Rating Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className={`rounded-2xl border p-4 ${ratingColor}`}>
                    <p className="font-bold text-lg">{rating.label}</p>
                    <p className="text-sm mt-0.5 opacity-80">{rating.description}</p>
                </motion.div>

                {/* --- PARTIAL REPORT (always visible) --- */}
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />Score Distribution
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-sm font-semibold text-slate-600 mb-3">Overall Score</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                                        <Cell fill="#0047AB" />
                                        <Cell fill="#E2E8F0" />
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [`${v} pts`, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <p className="text-center text-3xl font-black text-primary -mt-4">{pct}%</p>
                        </div>
                        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-sm font-semibold text-slate-600 mb-3">Top Categories (Preview)</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={barData} layout="vertical">
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                                    <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} />
                                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                                    <Bar dataKey="score" fill="#0047AB" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pending / Locked / Unlocked */}
                {isPending && !isUnlocked && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-white animate-spin" style={{ animationDuration: "3s" }} />
                        </div>
                        <div>
                            <p className="font-bold text-amber-800">Awaiting admin verification</p>
                            <p className="text-amber-700 text-sm">This page will update automatically once approved — no refresh needed.</p>
                        </div>
                    </motion.div>
                )}

                {!isUnlocked && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-lg">
                        {/* Blurred preview */}
                        <div className="blur-sm pointer-events-none select-none p-8 space-y-4 opacity-50">
                            <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl" />
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
                            </div>
                            <div className="h-40 bg-slate-50 rounded-xl" />
                        </div>
                        {/* Lock overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                            <div className="text-center max-w-sm px-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                                    <Lock className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">
                                    {isPending ? "Verification In Progress" : "Full Report Locked"}
                                </h3>
                                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                                    You're viewing a 30% preview. Unlock 100% of your report for just <strong className="text-primary">₹149</strong>.
                                </p>
                                <div className="text-left space-y-1.5 mb-5">
                                    {["Complete category breakdown", "Detailed recommendations & SWOT", "Full 61-question audit trail", "Multi-dimensional radar analysis", "30-60-90 day strategic roadmap"].map(item => (
                                        <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                {!isPending && (
                                    <button
                                        onClick={() => navigate("/payment", { state: { attemptId, resultId: result.id } })}
                                        className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
                                    >
                                        <Unlock className="w-4 h-4" />Unlock Complete Assessment Report — ₹149
                                    </button>
                                )}
                                <p className="text-xs text-slate-400 mt-3">Full report emailed to {session?.email}</p>
                                <p className="text-xs text-slate-400">Secure payment via Bank Transfer | Instant report delivery to your email</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* FULL REPORT (unlocked) */}
                {isUnlocked && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <p className="text-green-700 text-sm font-medium">Full report unlocked! Your PDF has been emailed to {session?.email}</p>
                        </div>

                        {/* Full Bar Chart */}
                        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" />Category Performance</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={fullBarData} layout="vertical">
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9 }} />
                                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                        {fullBarData.map((entry, i) => (
                                            <Cell key={i} fill={entry.score >= 70 ? "#10B981" : entry.score >= 50 ? "#F59E0B" : "#EF4444"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Radar Chart */}
                        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Radar className="w-4 h-4 text-primary" />Multi-Dimensional Analysis</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <RadarChart data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                                    <RechartsRadar dataKey="score" stroke="#0047AB" fill="#00AEEF" fillOpacity={0.35} />
                                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Detailed Category Breakdown */}
                        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 mb-4">Detailed Category Breakdown</h3>
                            <div className="space-y-4">
                                {Object.entries(catScores).map(([cat, data]) => {
                                    const cp = data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0;
                                    const color = cp >= 70 ? "bg-green-500" : cp >= 50 ? "bg-amber-500" : "bg-red-500";
                                    return (
                                        <div key={cat}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-slate-700">{cat}</span>
                                                <span className={`text-xs font-bold ${cp >= 70 ? "text-green-600" : cp >= 50 ? "text-amber-600" : "text-red-600"}`}>{cp}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${cp}%` }} />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">{data.scored}/{data.max} pts</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mandatory Failed */}
                        {result.mandatoryFailed?.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />Mandatory Criteria Not Met
                                </h3>
                                <div className="space-y-2">
                                    {result.mandatoryFailed.map((mf, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{mf}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Full Question Audit */}
                        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 mb-4">Full Question Audit (61 Questions)</h3>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                                {QUESTIONS.map((q) => {
                                    const ans = answers.find(a => a.questionId === q.id);
                                    const color = ans?.selectedAnswer === "Yes" ? "text-green-600 bg-green-50" : ans?.selectedAnswer === "No" ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50";
                                    return (
                                        <div key={q.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                                            <span className="text-xs text-slate-400 font-mono w-6 flex-shrink-0 mt-0.5">#{q.slNo}</span>
                                            <p className="text-xs text-slate-700 flex-1">{q.text}</p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${color}`}>
                                                {ans?.selectedAnswer || "—"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
