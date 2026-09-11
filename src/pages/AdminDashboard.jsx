import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FileSpreadsheet, LogOut, Users, BarChart2, CreditCard, Mail, Download,
    Search, ChevronDown, ChevronUp, CheckCircle2, XCircle, Loader2,
    FileDown, RefreshCw, Shield, AlertCircle, Send
} from "lucide-react";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from "recharts";
import { isAdminLoggedIn, logoutAdmin } from "../utils/authUtils";
import { UserProfileDB, AssessmentResultDB, PaymentRecordDB, EmailLogDB } from "../utils/db";
import { CATEGORIES, QUESTIONS } from "../utils/questions";
import { buildAssessmentDoc } from "../utils/reportPdf";
import { dispatchVerifiedReport } from "../utils/emailService";
import ThemeToggle from "../components/ThemeToggle";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

// ---------- Verification Modal ----------
function VerifyModal({ payment, onConfirm, onCancel, loading, verifyProgress }) {
    const [senderInfo, setSenderInfo] = useState("");

    useEffect(() => {
        fetch("/api/emailStatus")
            .then(r => r.json())
            .then(data => {
                if (data.user) setSenderInfo(data.user);
            })
            .catch(() => {});
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#0f2342] text-slate-800 dark:text-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-blue-100 dark:border-blue-500/30">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Verify Payment & Dispatch Report</h2>
                    <p className="text-xs text-slate-500 dark:text-blue-200 mt-1">
                        Dispatches official 8-page PDF report to user via <strong>Gmail SMTP</strong>
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-700/60 rounded-xl p-4 mb-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-blue-300">From (Your Gmail):</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {senderInfo || "stevejesa24@gmail.com"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-blue-300">To (User Login Email):</span>
                        <span className="font-mono font-bold text-blue-700 dark:text-cyan-300">{payment?.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-blue-300">Protocol:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Gmail SMTP (smtp.gmail.com)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-blue-300">Attachment:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">8-Page Assessment Report PDF</span>
                    </div>
                </div>

                <div className="space-y-2 mb-6 bg-slate-50 dark:bg-[#0a1628]/60 p-4 rounded-xl border border-slate-100 dark:border-blue-900/40">
                    {[
                        ["User Name", payment?.fullName],
                        ["Organization", payment?.organizationName],
                        ["Transaction UTR / ID", payment?.utrNumber],
                        ["Amount", `₹${payment?.amount}`],
                        ["Submission Date", payment?.paidAt ? new Date(payment.paidAt).toLocaleString("en-IN") : "—"],
                    ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-500 dark:text-blue-300">{k}:</span>
                            <span className="font-bold text-slate-800 dark:text-white">{v}</span>
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="mb-5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 rounded-xl p-3 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600 flex-shrink-0" />
                        <span>{verifyProgress || "Compiling PDF and sending via Gmail SMTP..."}</span>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                        className="flex-1 border border-slate-300 dark:border-blue-700/60 text-slate-600 dark:text-slate-200 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-blue-900/40 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 text-xs sm:text-sm transition-all shadow-md disabled:opacity-60 cursor-pointer">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending via Gmail...</> : <><CheckCircle2 className="w-4 h-4" />Verify & Send PDF</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ---------- Admin Dashboard ----------
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [results, setResults] = useState([]);
    const [payments, setPayments] = useState([]);
    const [emailLogs, setEmailLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [expandedUser, setExpandedUser] = useState(null);
    const [verifyModal, setVerifyModal] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verifyProgress, setVerifyProgress] = useState("");
    const [actionFeedback, setActionFeedback] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdminLoggedIn()) { navigate("/login"); return; }
        loadAll();
    }, []);

    const loadAll = () => {
        setUsers(UserProfileDB.getAll());
        setResults(AssessmentResultDB.getAll());
        setPayments(PaymentRecordDB.getAll());
        setEmailLogs(EmailLogDB.getAll());
        setLoading(false);
    };

    const handleLogout = () => { logoutAdmin(); navigate("/login"); };

    const completed = results.length;
    const avgScore = completed > 0 ? Math.round(results.reduce((s, r) => s + (r.percentage ?? 0), 0) / completed) : 0;
    const revenue = payments.filter(p => p.status === "success").reduce((s, p) => s + (p.amount ?? 0), 0);

    const filteredUsers = users.filter(u =>
        `${u.fullName} ${u.email} ${u.organizationName}`.toLowerCase().includes(search.toLowerCase())
    );

    const getLatestResult = (userId) => {
        const r = results.filter(r => r.userProfileId === userId).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        return r[0] || null;
    };

    const confirmVerifyPayment = async () => {
        if (!verifyModal) return;
        setVerifying(true);
        setVerifyProgress("Generating 8-page PDF and contacting Gmail SMTP server...");
        const startTime = Date.now();
        PaymentRecordDB.update(verifyModal.id, { status: "success" });
        const targetEmail = verifyModal.email;
        const res = await dispatchVerifiedReport(verifyModal);
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
        loadAll();
        setVerifyModal(null);
        setVerifying(false);
        setVerifyProgress("");

        if (res.success) {
            if (res.liveEmailSent) {
                setActionFeedback({
                    type: "success",
                    title: "✓ Payment Verified & PDF Dispatched via Gmail SMTP!",
                    message: `Payment verified! The full 8-page PDF Assessment Report was successfully sent to ${targetEmail} via Gmail SMTP in ${elapsedSeconds}s (Message ID: ${res.messageId}).`,
                });
            } else if (res.emailError) {
                setActionFeedback({
                    type: "warning",
                    title: "✓ Payment Verified (PDF Downloaded Locally)",
                    message: `Payment marked as verified and report PDF generated. Note: Gmail SMTP send was not completed: ${res.emailError}.`,
                });
            } else {
                setActionFeedback({
                    type: "success",
                    title: "✓ Payment Verified",
                    message: `8-Page PDF Report dispatched to ${targetEmail} in ${elapsedSeconds}s.`,
                });
            }
        } else {
            setActionFeedback({
                type: "error",
                title: "Verification Error",
                message: `Failed to dispatch report to ${targetEmail}: ${res.error || "Unknown error"}`,
            });
        }
    };

    const handleResendEmail = async (payment) => {
        setVerifying(true);
        const startTime = Date.now();
        const res = await dispatchVerifiedReport(payment);
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
        loadAll();
        setVerifying(false);

        if (res.liveEmailSent) {
            setActionFeedback({
                type: "success",
                title: "PDF Report Resent via Gmail SMTP!",
                message: `8-Page PDF report successfully delivered to ${payment.email} in ${elapsedSeconds}s (Message ID: ${res.messageId}).`,
            });
        } else {
            setActionFeedback({
                type: "warning",
                title: "Report Generated (Local Fallback)",
                message: res.emailError ? `Could not send via Gmail SMTP: ${res.emailError}` : "Report compiled and downloaded.",
            });
        }
    };

    const handleDirectSendEmail = async (user, result) => {
        setVerifying(true);
        const startTime = Date.now();
        const paymentLike = {
            userProfileId: user.id,
            email: user.email,
            fullName: user.fullName,
            organizationName: user.organizationName,
            phone: user.phone,
            attemptId: result.attemptId,
        };
        const res = await dispatchVerifiedReport(paymentLike);
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
        loadAll();
        setVerifying(false);

        if (res.liveEmailSent) {
            setActionFeedback({
                type: "success",
                title: "PDF Report Delivered via Gmail SMTP!",
                message: `8-Page Assessment PDF successfully sent from your Gmail to user login email (${user.email}) in ${elapsedSeconds}s (Message ID: ${res.messageId}).`,
            });
        } else {
            setActionFeedback({
                type: "warning",
                title: "Report Generated (Local Fallback)",
                message: res.emailError ? `Could not send via Gmail SMTP: ${res.emailError}` : `Report compiled for ${user.email}.`,
            });
        }
    };

    const markFailed = (id) => {
        PaymentRecordDB.update(id, { status: "failed" });
        loadAll();
    };

    const strong = results.filter(r => r.percentage >= 70).length;
    const moderate = results.filter(r => r.percentage >= 50 && r.percentage < 70).length;
    const weak = results.filter(r => r.percentage < 50).length;
    const perfPie = [
        { name: "Strong (≥70%)", value: strong, fill: "#10B981" },
        { name: "Moderate (50-69%)", value: moderate, fill: "#F59E0B" },
        { name: "Weak (<50%)", value: weak, fill: "#EF4444" },
    ];

    const catAvgData = CATEGORIES.map(cat => {
        const catResults = results.map(r => {
            const cs = r.categoryScores?.[cat.name];
            return cs?.max > 0 ? (cs.scored / cs.max) * 100 : 0;
        });
        const avg = catResults.length > 0 ? Math.round(catResults.reduce((a, b) => a + b, 0) / catResults.length) : 0;
        return { name: cat.name.split(" ")[0], avg };
    });

    const trendData = [...results]
        .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
        .map((r, i) => ({ name: `#${i + 1}`, score: Math.round(r.percentage ?? 0) }));

    const handleExportCSV = () => {
        const headers = ["Name", "Organization", "Email", "Phone", "Score%", "Rating", "Risk", "Eligible", "Date", "PaymentStatus"];
        QUESTIONS.forEach(q => headers.push(`Q${q.id}: ${q.text.slice(0, 20)}...`));

        const rows = users.map(u => {
            const r = getLatestResult(u.id);
            const p = r ? payments.find(p => p.attemptId === r?.attemptId) : null;
            const row = [
                u.fullName, u.organizationName, u.email, u.phone,
                r ? Math.round(r.percentage ?? 0) : "",
                r?.performanceLevel || "",
                r?.riskLevel || "",
                r?.isEligible ? "Yes" : "No",
                r ? new Date(r.completedAt).toLocaleDateString("en-IN") : "",
                p?.status || "",
            ];
            return row;
        });

        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "ETHYRA_Impact_Assessment_Export.csv"; a.click();
    };

    const pendingPayments = payments.filter(p => p.status === "pending");
    const tabs = [
        { key: "users", label: "Users", icon: Users },
        { key: "analytics", label: "Analytics", icon: BarChart2 },
        { key: "payments", label: `Payments${pendingPayments.length > 0 ? ` (${pendingPayments.length})` : ""}`, icon: CreditCard, count: pendingPayments.length },
        { key: "emails", label: "Email Logs", icon: Mail },
        { key: "export", label: "Export", icon: Download },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a]">
            <div className="w-10 h-10 border-4 border-primary border-t-cyan-400 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a] text-slate-800 dark:text-white transition-colors duration-300">
            {verifyModal && (
                <VerifyModal
                    payment={verifyModal}
                    onConfirm={confirmVerifyPayment}
                    onCancel={() => { setVerifyModal(null); setVerifyProgress(""); }}
                    loading={verifying}
                    verifyProgress={verifyProgress}
                />
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md border-b border-blue-100 dark:border-blue-900/40 shadow-sm transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={LOGO} alt="ETHYRA" className="h-10" />
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Admin Dashboard</p>
                            <p className="text-xs text-slate-500 dark:text-blue-200 flex items-center gap-1"><Shield className="w-3 h-3 text-cyan-400" />ETHYRA Impact Verification Control</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleExportCSV}
                            className="flex items-center gap-1 bg-gradient-to-r from-primary to-cyan-500 text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition-all font-bold shadow-sm">
                            <FileSpreadsheet className="w-3.5 h-3.5" />Export Data
                        </button>
                        <ThemeToggle />
                        <button onClick={loadAll} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all">
                            <LogOut className="w-3.5 h-3.5" />Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 pb-16 space-y-6">
                {/* Action Feedback Banner */}
                {actionFeedback && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border shadow-md flex items-start justify-between gap-3 ${
                            actionFeedback.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100" :
                            actionFeedback.type === "warning" ? "bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100" :
                            "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100"
                        }`}>
                        <div className="flex items-start gap-3">
                            {actionFeedback.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />}
                            <div>
                                <p className="font-bold text-sm">{actionFeedback.title}</p>
                                <p className="text-xs mt-0.5 opacity-90">{actionFeedback.message}</p>
                            </div>
                        </div>
                        <button onClick={() => setActionFeedback(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg text-xs font-bold transition-all">✕</button>
                    </motion.div>
                )}

                {/* Pending Payments Alert Callout */}
                {pendingPayments.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{pendingPayments.length} Payment{pendingPayments.length > 1 ? "s" : ""} Pending Verification</p>
                                <p className="text-xs text-amber-100">Review submitted UTR numbers and dispatch the 8-page PDF report directly to user emails via Gmail SMTP.</p>
                            </div>
                        </div>
                        <button onClick={() => setTab("payments")} className="bg-white text-amber-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-50 transition-all shadow cursor-pointer whitespace-nowrap">
                            Review & Verify ({pendingPayments.length}) →
                        </button>
                    </motion.div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total Users", value: users.length, color: "text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-900/40", icon: Users },
                        { label: "Completed", value: completed, color: "text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40", icon: BarChart2 },
                        { label: "Avg Score", value: `${avgScore}%`, color: "text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/40", icon: BarChart2 },
                        { label: "Revenue", value: `₹${revenue}`, color: "text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-900/40", icon: CreditCard },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-4 shadow-sm">
                            <div className={`w-8 h-8 ${s.color} rounded-xl flex items-center justify-center mb-2`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-blue-200">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-2 shadow-sm">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === t.key ? "bg-gradient-to-r from-primary to-cyan-500 text-white shadow-md" : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/40"}`}>
                            <t.icon className="w-3.5 h-3.5" />{t.label}
                            {t.count > 0 && (
                                <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1 animate-pulse">
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Users Tab */}
                {tab === "users" && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search name, email, organization..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0a1628] border border-blue-200 dark:border-blue-700/60 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary dark:focus:border-cyan-400" />
                        </div>
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-primary to-blue-900 text-white text-xs">
                                            {["#", "User / Org", "Contact", "Score", "Rating", "Risk", "Date", "Payment & Report", ""].map(h => (
                                                <th key={h} className="px-3 py-3 text-left font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 && (
                                            <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No users found</td></tr>
                                        )}
                                        {filteredUsers.map((user, i) => {
                                            const r = getLatestResult(user.id);
                                            const pct = r ? Math.round(r.percentage ?? 0) : null;
                                            const isExpanded = expandedUser === user.id;
                                            const userPayments = payments.filter(p => p.userProfileId === user.id || p.email === user.email);
                                            const pendingPay = userPayments.find(p => p.status === "pending");
                                            const successPay = userPayments.find(p => p.status === "success");

                                            return (
                                                <Fragment key={user.id}>
                                                    <tr className={`text-sm border-b border-slate-100 dark:border-blue-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all ${i % 2 === 0 ? "bg-white dark:bg-[#0f2342]/90" : "bg-slate-50/50 dark:bg-[#0a1628]/40"}`}>
                                                        <td className="px-3 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                                                        <td className="px-3 py-3">
                                                            <p className="font-semibold text-slate-800 dark:text-white">{user.fullName}</p>
                                                            <p className="text-xs text-slate-500 dark:text-blue-200">{user.organizationName}</p>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <p className="text-xs text-slate-600 dark:text-slate-300">{user.email}</p>
                                                            <p className="text-xs text-slate-400 dark:text-blue-300">{user.phone}</p>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {pct !== null ? (
                                                                <span className={`font-bold ${pct >= 70 ? "text-green-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-rose-400"}`}>{pct}%</span>
                                                            ) : <span className="text-slate-300">—</span>}
                                                        </td>
                                                        <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-200">{r?.performanceLevel || "—"}</td>
                                                        <td className="px-3 py-3">
                                                            {r?.riskLevel ? (
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.riskLevel === "Low" ? "bg-green-100 dark:bg-emerald-950 text-green-700 dark:text-emerald-300" : r.riskLevel === "Medium" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" : "bg-red-100 dark:bg-rose-950 text-red-700 dark:text-rose-300"}`}>
                                                                    {r.riskLevel}
                                                                </span>
                                                            ) : "—"}
                                                        </td>
                                                        <td className="px-3 py-3 text-xs text-slate-400 dark:text-blue-300 whitespace-nowrap">
                                                            {r ? new Date(r.completedAt).toLocaleDateString("en-IN") : "—"}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {pendingPay ? (
                                                                <button
                                                                    onClick={() => setVerifyModal(pendingPay)}
                                                                    className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
                                                                    title={`Verify payment (UTR: ${pendingPay.utrNumber}) and dispatch PDF via Gmail SMTP`}
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />Verify & Send
                                                                </button>
                                                            ) : successPay ? (
                                                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-100 dark:bg-emerald-950 text-green-700 dark:text-emerald-300">
                                                                        Verified ✓
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleResendEmail(successPay)}
                                                                        className="p-1.5 text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                                        title="Resend 8-Page PDF via Gmail SMTP"
                                                                    >
                                                                        <Send className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    {r && (
                                                                        <button
                                                                            onClick={() => {
                                                                                const profile = { fullName: user.fullName, email: user.email, phone: user.phone, organizationName: user.organizationName };
                                                                                const doc = buildAssessmentDoc(r, profile, []);
                                                                                doc.save(`ETHYRA_${user.organizationName?.replace(/\s+/g, "_")}.pdf`);
                                                                            }}
                                                                            className="p-1.5 text-primary dark:text-cyan-400 hover:bg-primary/10 rounded-lg transition-all"
                                                                            title="Download PDF locally"
                                                                        >
                                                                            <FileDown className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                                    <span className="text-xs text-slate-400">Unpaid</span>
                                                                    {r && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleDirectSendEmail(user, r)}
                                                                                className="p-1.5 text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                                                title={`Send 8-Page PDF Report directly to user login email (${user.email}) via Gmail SMTP`}
                                                                            >
                                                                                <Send className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const profile = { fullName: user.fullName, email: user.email, phone: user.phone, organizationName: user.organizationName };
                                                                                    const doc = buildAssessmentDoc(r, profile, []);
                                                                                    doc.save(`ETHYRA_${user.organizationName?.replace(/\s+/g, "_")}.pdf`);
                                                                                }}
                                                                                className="p-1.5 text-slate-400 hover:text-primary dark:hover:text-cyan-400 hover:bg-primary/10 rounded-lg transition-all"
                                                                                title="Download preview PDF"
                                                                            >
                                                                                <FileDown className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <button onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                                                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {isExpanded && (
                                                        <tr className="bg-blue-50/40 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/60">
                                                            <td colSpan={9} className="p-4">
                                                                <div className="bg-white dark:bg-[#0a1628] rounded-xl p-4 border border-blue-100 dark:border-blue-900/40 space-y-3">
                                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-blue-900/40 pb-2">
                                                                        <p className="font-bold text-xs text-primary dark:text-cyan-400 uppercase tracking-wider">User Details & Status</p>
                                                                        <div className="flex items-center gap-2">
                                                                            {pendingPay && (
                                                                                <button
                                                                                    onClick={() => setVerifyModal(pendingPay)}
                                                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                                                                                >
                                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify & Dispatch PDF via Gmail
                                                                                </button>
                                                                            )}
                                                                            {successPay && (
                                                                                <button
                                                                                    onClick={() => handleResendEmail(successPay)}
                                                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                                                                                >
                                                                                    <Send className="w-3.5 h-3.5" /> Resend Report via Gmail SMTP
                                                                                </button>
                                                                            )}
                                                                            {!pendingPay && !successPay && r && (
                                                                                <button
                                                                                    onClick={() => handleDirectSendEmail(user, r)}
                                                                                    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                                                                                >
                                                                                    <Send className="w-3.5 h-3.5" /> Dispatch Report to {user.email} via Gmail SMTP
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                                                        <div>
                                                                            <span className="text-slate-400 block">Organization:</span>
                                                                            <span className="font-semibold text-slate-800 dark:text-white">{user.organizationName || "—"}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-400 block">Phone:</span>
                                                                            <span className="font-semibold text-slate-800 dark:text-white">{user.phone || "—"}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-400 block">Payment Status:</span>
                                                                            <span className="font-bold text-slate-800 dark:text-white">
                                                                                {pendingPay ? `Pending (UTR: ${pendingPay.utrNumber})` : successPay ? `Verified (UTR: ${successPay.utrNumber})` : "No payment submitted"}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-400 block">CSR Eligibility:</span>
                                                                            <span className={`font-bold ${r?.isEligible ? "text-emerald-600" : "text-slate-500"}`}>
                                                                                {r ? (r.isEligible ? "Eligible" : "Not Eligible") : "—"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {tab === "analytics" && (
                    <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Performance Distribution</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={perfPie} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                                            {perfPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [v, n]} />
                                        <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Category-Wise Averages</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={catAvgData} layout="vertical">
                                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                        <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                                        <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} />
                                        <Bar dataKey="avg" fill="#0047AB" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payments Tab */}
                {tab === "payments" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Total Submissions", value: payments.length },
                                { label: "Verified & Success", value: payments.filter(p => p.status === "success").length },
                                { label: "Pending Verification", value: payments.filter(p => p.status === "pending").length },
                            ].map(s => (
                                <div key={s.label} className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-xl p-4 shadow-sm text-center">
                                    <p className="text-2xl font-black text-primary dark:text-cyan-400">{s.value}</p>
                                    <p className="text-xs text-slate-500 dark:text-blue-200">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-primary to-blue-900 text-white text-xs">
                                            {["User Name", "Org", "Email", "Amount", "UTR / Txn ID", "Status", "Date", "Report", "Action"].map(h => (
                                                <th key={h} className="px-3 py-3 text-left font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.length === 0 && (
                                            <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No payment records found</td></tr>
                                        )}
                                        {payments.map((pay, i) => {
                                            const r = AssessmentResultDB.findByAttempt(pay.attemptId);
                                            return (
                                                <tr key={pay.id} className={`text-sm border-b border-slate-100 dark:border-blue-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all ${i % 2 === 0 ? "bg-white dark:bg-[#0f2342]/90" : "bg-slate-50/50 dark:bg-[#0a1628]/40"}`}>
                                                    <td className="px-3 py-3 font-medium text-slate-800 dark:text-white">{pay.fullName}</td>
                                                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300 text-xs">{pay.organizationName}</td>
                                                    <td className="px-3 py-3 text-xs text-slate-500 dark:text-blue-200">{pay.email}</td>
                                                    <td className="px-3 py-3 font-bold text-slate-800 dark:text-white">₹{pay.amount}</td>
                                                    <td className="px-3 py-3 font-mono text-xs font-bold text-primary dark:text-cyan-300">{pay.utrNumber}</td>
                                                    <td className="px-3 py-3">
                                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${pay.status === "success" ? "bg-green-100 dark:bg-emerald-950 text-green-700 dark:text-emerald-300" :
                                                            pay.status === "failed" ? "bg-red-100 dark:bg-rose-950 text-red-700 dark:text-rose-300" :
                                                                "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                                            }`}>
                                                            {pay.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-slate-400 dark:text-blue-300">{new Date(pay.paidAt).toLocaleDateString("en-IN")}</td>
                                                    <td className="px-3 py-3">
                                                        {r && (
                                                            <button onClick={() => {
                                                                const profile = { fullName: pay.fullName, email: pay.email, phone: pay.phone, organizationName: pay.organizationName };
                                                                const doc = buildAssessmentDoc(r, profile, []);
                                                                doc.save(`Report_${pay.organizationName?.replace(/\s+/g, "_")}.pdf`);
                                                            }} className="p-1.5 text-primary dark:text-cyan-400 hover:bg-primary/10 rounded-lg transition-all">
                                                                <FileDown className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {pay.status === "pending" && (
                                                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                                <button onClick={() => setVerifyModal(pay)}
                                                                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                                                    title="Verify payment and dispatch 8-page PDF report to user via Gmail SMTP">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />Verify & Send PDF
                                                                </button>
                                                                <button onClick={() => markFailed(pay.id)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all" title="Mark Failed">
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {pay.status === "success" && (
                                                            <button onClick={() => handleResendEmail(pay)}
                                                                className="px-2.5 py-1 border border-blue-200 dark:border-blue-700/60 text-primary dark:text-cyan-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer"
                                                                title="Resend 8-Page PDF Report via Gmail SMTP">
                                                                <Send className="w-3 h-3" />Resend PDF (Gmail)
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Email Logs Tab */}
                {tab === "emails" && (
                    <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-primary to-blue-900 text-white text-xs">
                                        {["Recipient", "Subject", "Status", "Provider", "Attachment", "Retries", "Timestamp"].map(h => (
                                            <th key={h} className="px-3 py-3 text-left font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {emailLogs.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No email logs available</td></tr>
                                    )}
                                    {emailLogs.map((log, i) => (
                                        <tr key={log.id} className={`text-sm border-b border-slate-100 dark:border-blue-900/40 ${i % 2 === 0 ? "bg-white dark:bg-[#0f2342]/90" : "bg-slate-50/50 dark:bg-[#0a1628]/40"}`}>
                                            <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-200">{log.recipient}</td>
                                            <td className="px-3 py-3 text-xs text-slate-700 dark:text-white max-w-[160px] truncate">{log.subject}</td>
                                            <td className="px-3 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${log.status === "Sent" ? "bg-green-100 dark:bg-emerald-950 text-green-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}>{log.status}</span>
                                            </td>
                                            <td className="px-3 py-3 text-xs text-slate-400 dark:text-blue-300">{log.provider}</td>
                                            <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-300 max-w-[120px] truncate">{log.attachmentName || "—"}</td>
                                            <td className="px-3 py-3 text-xs text-center text-slate-500 dark:text-blue-200">{log.retryCount ?? 0}</td>
                                            <td className="px-3 py-3 text-xs text-slate-400 dark:text-blue-300 whitespace-nowrap">{log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN") : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Export Tab */}
                {tab === "export" && (
                    <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-8 shadow-sm text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                            <FileSpreadsheet className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Complete Data Export</h3>
                        <p className="text-slate-500 dark:text-blue-200 text-sm mb-6 max-w-sm mx-auto">
                            Export all users, assessment answers, scores, ratings, payment status, and dates as a CSV file.
                        </p>
                        <button onClick={handleExportCSV}
                            className="bg-gradient-to-r from-primary to-cyan-500 text-white font-bold px-8 py-3 rounded-2xl hover:opacity-95 transition-all flex items-center gap-2 mx-auto shadow-lg cursor-pointer">
                            <Download className="w-4 h-4" />Download Full Export (CSV)
                        </button>
                        <p className="text-xs text-slate-400 dark:text-blue-300 mt-4">{users.length} users · {completed} assessments · {payments.length} payments</p>
                    </div>
                )}
            </main>
        </div>
    );
}
