import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Lock, Unlock, FileDown, Download, LogOut, CheckCircle2, XCircle,
    Clock, AlertTriangle, BarChart2, PieChart as PieChartIcon, Radar
} from "lucide-react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar as RechartsRadar
} from "recharts";
import { getUserSession, logoutUser } from "../utils/authUtils";
import { AssessmentResultDB, PaymentRecordDB, AssessmentAnswerDB } from "../utils/db";
import { getRatingCategory, QUESTIONS } from "../utils/questions";
import { buildAssessmentDoc } from "../utils/reportPdf";
import ThemeToggle from "../components/ThemeToggle";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

function ScoreCard({ label, value, sub, colorClass }) {
    return (
        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm text-center">
            <p className="text-xs text-slate-500 dark:text-blue-200 uppercase tracking-wide mb-1 font-bold">{label}</p>
            <p className={`text-3xl font-black ${colorClass}`}>{value}</p>
            {sub && <p className="text-xs text-slate-400 dark:text-slate-300 mt-1">{sub}</p>}
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
        const unsub = PaymentRecordDB.subscribe(() => loadData());
        return unsub;
    }, [attemptId]);

    const isUnlocked = payment?.status === "success";
    const isPending = payment?.status === "pending";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-white font-medium">Calculating your assessment results...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a]">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-white">No results found. Please complete the assessment first.</p>
                    <button onClick={() => navigate("/assessment")} className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold">
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
        green: "bg-green-50 border-green-300 text-green-800 dark:bg-emerald-950/60 dark:border-emerald-700/60 dark:text-emerald-200",
        blue: "bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950/60 dark:border-blue-700/60 dark:text-blue-200",
        amber: "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700/60 dark:text-amber-200",
        red: "bg-red-50 border-red-300 text-red-800 dark:bg-rose-950/60 dark:border-rose-700/60 dark:text-rose-200",
    }[rating.color];

    const pieData = [
        { name: "Scored", value: result.totalScore },
        { name: "Remaining", value: Math.max(0, result.maxScore - result.totalScore) },
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a] text-slate-800 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md border-b border-blue-100 dark:border-blue-900/40 shadow-sm transition-colors">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <img src={LOGO} alt="ETHYRA" className="h-8" />
                    <h1 className="text-sm font-bold text-slate-700 dark:text-white">Assessment Results Dashboard</h1>
                    <div className="flex items-center gap-2">
                        {isUnlocked && (
                            <>
                                <button onClick={handleDownloadPdf} className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all font-bold">
                                    <FileDown className="w-3.5 h-3.5" />PDF
                                </button>
                                <button onClick={() => window.print()} className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-blue-900/40 text-slate-700 dark:text-white px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all font-semibold">
                                    <Download className="w-3.5 h-3.5" />Print
                                </button>
                            </>
                        )}
                        <ThemeToggle />
                        <button onClick={handleExit} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all">
                            <LogOut className="w-3.5 h-3.5" />Exit
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 pb-16 space-y-6">
                {/* Eligibility Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 flex items-center gap-3 ${result.isEligible ? "bg-green-50 border-green-300 dark:bg-emerald-950/60 dark:border-emerald-700/60" : "bg-red-50 border-red-300 dark:bg-rose-950/60 dark:border-rose-700/60"}`}
                >
                    {result.isEligible ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-rose-400 flex-shrink-0" />
                    )}
                    <div>
                        <p className={`font-bold ${result.isEligible ? "text-green-800 dark:text-emerald-200" : "text-red-800 dark:text-rose-200"}`}>
                            {result.isEligible ? "ELIGIBLE — All mandatory criteria passed." : `NOT ELIGIBLE — ${result.mandatoryFailed?.length || 0} mandatory criteria failed.`}
                        </p>
                        {!result.isEligible && result.mandatoryFailed?.length > 0 && (
                            <p className="text-red-600 dark:text-rose-300 text-xs mt-0.5">{result.mandatoryFailed.slice(0, 2).join("; ")}{result.mandatoryFailed.length > 2 ? " ..." : ""}</p>
                        )}
                    </div>
                </motion.div>

                {/* Score Cards */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ScoreCard label="Total Score" value={`${result.totalScore}/${result.maxScore}`} colorClass="text-primary dark:text-cyan-400" />
                    <ScoreCard label="Percentage" value={`${pct}%`} colorClass={pct >= 70 ? "text-green-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-rose-400"} />
                    <ScoreCard label="Final Rating" value={result.performanceLevel} colorClass={pct >= 70 ? "text-green-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-rose-400"} />
                    <ScoreCard label="Risk Level" value={result.riskLevel}
                        colorClass={result.riskLevel === "Low" ? "text-green-600 dark:text-emerald-400" : result.riskLevel === "Medium" ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-rose-400"}
                    />
                </motion.div>

                {/* Rating Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className={`rounded-2xl border p-4 ${ratingColor}`}>
                    <p className="font-bold text-lg">{rating.label}</p>
                    <p className="text-sm mt-0.5 opacity-90">{rating.description}</p>
                </motion.div>

                {/* PARTIAL PREVIEW CHARTS */}
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary dark:text-cyan-400" />Score Distribution Preview
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
                            <p className="text-sm font-semibold text-slate-600 dark:text-blue-200 mb-3">Overall Score Breakdown</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                                        <Cell fill="#0047AB" />
                                        <Cell fill="#CBD5E1" />
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [`${v} pts`, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <p className="text-center text-3xl font-black text-primary dark:text-cyan-400 -mt-4">{pct}%</p>
                        </div>
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
                            <p className="text-sm font-semibold text-slate-600 dark:text-blue-200 mb-3 font-bold">Top Categories (Preview)</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={barData} layout="vertical">
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                                    <Bar dataKey="score" fill="#0047AB" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pending Verification Banner */}
                {isPending && !isUnlocked && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 rounded-2xl p-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-white animate-spin" style={{ animationDuration: "3s" }} />
                        </div>
                        <div>
                            <p className="font-bold text-amber-800 dark:text-amber-300">Awaiting Admin Verification</p>
                            <p className="text-amber-700 dark:text-amber-400 text-sm">Your payment submission is under review. Your PDF report will be auto-delivered once verified.</p>
                        </div>
                    </motion.div>
                )}

                {!isUnlocked && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-3xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-[#0f2342]/90 shadow-xl">
                        <div className="blur-sm pointer-events-none select-none p-8 space-y-4 opacity-40">
                            <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl" />
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
                            </div>
                            <div className="h-40 bg-slate-50 rounded-xl" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-[#0a1628]/85 backdrop-blur-md">
                            <div className="text-center max-w-sm px-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary via-blue-600 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                                    <Lock className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                                    {isPending ? "Verification In Progress" : "Full Executive Report Locked"}
                                </h3>
                                <p className="text-slate-600 dark:text-blue-200 text-sm mb-4 leading-relaxed">
                                    Unlock 100% of your executive report & PDF for just <strong className="text-primary dark:text-cyan-400 font-bold">₹149</strong>.
                                </p>
                                <div className="text-left space-y-1.5 mb-5">
                                    {["Complete category breakdown", "Executive PDF report emailed", "Full 61-question audit trail", "Multi-dimensional radar analysis", "Mandatory compliance checklist"].map(item => (
                                        <div key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 dark:text-emerald-400 flex-shrink-0" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                {!isPending && (
                                    <button
                                        onClick={() => navigate("/payment", { state: { attemptId, resultId: result.id } })}
                                        className="w-full bg-gradient-to-r from-primary via-blue-600 to-cyan-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg cursor-pointer"
                                    >
                                        <Unlock className="w-4 h-4" />Unlock Complete Assessment Report — ₹149
                                    </button>
                                )}
                                <p className="text-xs text-slate-500 dark:text-blue-300 mt-3">Full report emailed to {session?.email}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* FULL UNLOCKED REPORT */}
                {isUnlocked && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="bg-green-50 dark:bg-emerald-950/60 border border-green-200 dark:border-emerald-700/60 rounded-xl p-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-emerald-400" />
                            <p className="text-green-700 dark:text-emerald-200 text-sm font-medium">Full report unlocked! Your PDF has been emailed to {session?.email}</p>
                        </div>

                        {/* Full Bar Chart */}
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary dark:text-cyan-400" />Category Performance Bar Chart</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={fullBarData} layout="vertical">
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9, fill: "#94a3b8" }} />
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
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><Radar className="w-4 h-4 text-primary dark:text-cyan-400" />Multi-Dimensional Spider Web Analysis</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#475569" />
                                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                    <RechartsRadar dataKey="score" stroke="#0047AB" fill="#00AEEF" fillOpacity={0.4} />
                                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Category Breakdown */}
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Detailed Category Breakdown</h3>
                            <div className="space-y-4">
                                {Object.entries(catScores).map(([cat, data]) => {
                                    const cp = data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0;
                                    const color = cp >= 70 ? "bg-green-500" : cp >= 50 ? "bg-amber-500" : "bg-red-500";
                                    return (
                                        <div key={cat}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-slate-700 dark:text-slate-200">{cat}</span>
                                                <span className={`text-xs font-bold ${cp >= 70 ? "text-green-600 dark:text-emerald-400" : cp >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-rose-400"}`}>{cp}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${cp}%` }} />
                                            </div>
                                            <p className="text-xs text-slate-400 dark:text-blue-300 mt-0.5">{data.scored}/{data.max} pts</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Question Audit */}
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Full Question Audit (61 Questions)</h3>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                                {QUESTIONS.map((q) => {
                                    const ans = answers.find(a => a.questionId === q.id);
                                    const color = ans?.selectedAnswer === "Yes" ? "text-green-600 bg-green-50 dark:bg-emerald-950/60 dark:text-emerald-300" : ans?.selectedAnswer === "No" ? "text-red-600 bg-red-50 dark:bg-rose-950/60 dark:text-rose-300" : "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300";
                                    return (
                                        <div key={q.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-blue-900/30">
                                            <span className="text-xs text-slate-400 font-mono w-6 flex-shrink-0 mt-0.5">#{q.slNo}</span>
                                            <p className="text-xs text-slate-700 dark:text-slate-200 flex-1">{q.text}</p>
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
