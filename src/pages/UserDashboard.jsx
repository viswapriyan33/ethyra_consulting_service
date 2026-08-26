import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Plus, LogOut, Award, Lock, Eye, FileDown, TrendingUp, BarChart2
} from "lucide-react";
import {
    LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getUserSession, logoutUser } from "../utils/authUtils";
import { AssessmentResultDB, PaymentRecordDB } from "../utils/db";
import { getRatingCategory, CHART_COLORS } from "../utils/questions";
import { buildAssessmentDoc } from "../utils/reportPdf";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

export default function UserDashboard() {
    const navigate = useNavigate();
    const session = getUserSession();

    const [results, setResults] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.id) { navigate("/login"); return; }
        const r = AssessmentResultDB.findByUser(session.id);
        const p = PaymentRecordDB.findByUser(session.id);
        setResults(r.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)));
        setPayments(p);
        setLoading(false);
    }, []);

    const handleExit = () => { logoutUser(); navigate("/login"); };

    const getPaymentForAttempt = (attemptId) => {
        return payments.find(p => p.attemptId === attemptId) || null;
    };

    const verifiedResults = results.filter(r => {
        const p = getPaymentForAttempt(r.attemptId);
        return p?.status === "success";
    });

    const latestResult = results[0];
    const prevResult = results[1];

    const latestPct = latestResult ? Math.round(latestResult.percentage ?? 0) : null;
    const prevPct = prevResult ? Math.round(prevResult.percentage ?? 0) : null;
    const improvement = latestPct !== null && prevPct !== null ? latestPct - prevPct : null;

    // Stats
    const stats = [
        { label: "Total Assessments", value: results.length, icon: BarChart2, color: "text-blue-600 bg-blue-50" },
        { label: "Verified Reports", value: verifiedResults.length, icon: Award, color: "text-green-600 bg-green-50" },
        { label: "Latest Score", value: latestPct !== null ? `${latestPct}/100` : "N/A", icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
        {
            label: "Improvement",
            value: improvement !== null ? `${improvement > 0 ? "+" : ""}${improvement}%` : "N/A",
            icon: TrendingUp,
            color: improvement > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
        },
    ];

    // Trend data
    const trendData = [...results].reverse().map((r, i) => ({
        name: `#${i + 1}`,
        score: Math.round(r.percentage ?? 0),
    }));

    // Pie data for latest
    const latestCatScores = latestResult?.categoryScores ?? {};
    const pieData = Object.entries(latestCatScores).map(([name, data], i) => ({
        name: name.split(" ")[0],
        value: data.max > 0 ? Math.round((data.scored / data.max) * 100) : 0,
        fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const handleViewResult = (r) => {
        navigate("/results", { state: { attemptId: r.attemptId, resultId: r.id } });
    };

    const handleDownloadPdf = (r) => {
        const profile = {
            fullName: session?.fullName,
            email: session?.email,
            phone: session?.phone,
            organizationName: session?.organizationName,
        };
        const doc = buildAssessmentDoc(r, profile, []);
        doc.save(`ETHYRA_Impact_Assessment_Report_${(session?.organizationName || "NGO").replace(/\s+/g, "_")}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="w-10 h-10 border-4 border-primary border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <img src={LOGO} alt="ETHYRA" className="h-10" />
                    <div className="text-center hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">My Dashboard</p>
                        <p className="text-xs text-slate-500">{session?.organizationName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate("/welcome")}
                            className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />New Assessment
                        </button>
                        <button onClick={handleExit} className="text-red-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-all">
                            <LogOut className="w-3 h-3" />Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 pb-16 space-y-6">
                {results.length === 0 ? (
                    /* Empty State */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                            <BarChart2 className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to ETHYRA Impact</h2>
                        <p className="text-slate-500 mb-6">Start Your First Assessment to see your NGO readiness dashboard.</p>
                        <button
                            onClick={() => navigate("/welcome")}
                            className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-8 py-3 rounded-2xl hover:opacity-90 transition-all"
                        >
                            Start Assessment
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Welcome Banner */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-6 text-white shadow-xl">
                            <h1 className="text-xl font-bold">Welcome back, {session?.fullName?.split(" ")[0]}! 👋</h1>
                            <p className="text-blue-200 text-sm mt-1">
                                {latestPct !== null && latestPct >= 70 ? "Excellent readiness profile. Keep maintaining your standards." : "Continue improving your NGO's compliance and governance posture."}
                            </p>
                        </motion.div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <motion.div key={stat.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
                                    <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts */}
                        {verifiedResults.length > 0 && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {trendData.length >= 2 && (
                                    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-700 mb-4">Assessment Trends Over Time</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={trendData}>
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                                <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                                                <Line type="monotone" dataKey="score" stroke="#0047AB" strokeWidth={2} dot={{ fill: "#00AEEF", r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 mb-4">Score Breakdown — Latest</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                                                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                                            <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Assessment History */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Assessment History</h2>
                            <div className="space-y-3">
                                {results.map((r, i) => {
                                    const pay = getPaymentForAttempt(r.attemptId);
                                    const isVerified = pay?.status === "success";
                                    const isPending = pay?.status === "pending";
                                    const pct = Math.round(r.percentage ?? 0);
                                    const rating = getRatingCategory(pct);

                                    return (
                                        <motion.div key={r.id}
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                            className={`bg-white border-l-4 ${isVerified ? "border-green-400" : "border-amber-400"} border border-blue-100 rounded-2xl p-5 shadow-sm`}
                                        >
                                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVerified ? "bg-green-100" : "bg-amber-100"}`}>
                                                        {isVerified ? <Award className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-amber-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">Assessment #{results.length - i}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                                                {isVerified ? "Verified" : "Pending Payment"}
                                                            </span>
                                                            <span className="text-xs text-slate-400">{new Date(r.completedAt).toLocaleDateString("en-IN")}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-primary">{pct}%</p>
                                                    <p className={`text-xs font-medium ${rating.color === "green" ? "text-green-600" : rating.color === "blue" ? "text-blue-600" : rating.color === "amber" ? "text-amber-600" : "text-red-600"}`}>
                                                        {r.performanceLevel}
                                                    </p>
                                                </div>
                                            </div>
                                            {!isVerified && !isPending && (
                                                <p className="text-xs text-slate-500 mt-2">Pay ₹149 to unlock this report — your full PDF will be emailed to {session?.email} once verified.</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-3">
                                                <button onClick={() => handleViewResult(r)}
                                                    className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-all">
                                                    <Eye className="w-3 h-3" />View
                                                </button>
                                                {isVerified && (
                                                    <button onClick={() => handleDownloadPdf(r)}
                                                        className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all">
                                                        <FileDown className="w-3 h-3" />PDF
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Start New Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-gradient-to-r from-primary to-accent rounded-3xl p-6 shadow-xl text-white text-center">
                            <h3 className="font-bold text-lg mb-1">Ready for your next assessment?</h3>
                            <p className="text-blue-100 text-sm mb-4">Each assessment is ₹149 and generates a fresh readiness report.</p>
                            <button onClick={() => navigate("/welcome")}
                                className="bg-white text-primary font-bold px-8 py-2.5 rounded-xl hover:bg-blue-50 transition-all">
                                Start New Assessment
                            </button>
                        </motion.div>
                    </>
                )}
            </main>
        </div>
    );
}
