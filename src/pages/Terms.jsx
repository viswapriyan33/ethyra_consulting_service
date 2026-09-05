import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, LogOut, CheckCircle, AlertCircle, CheckSquare } from "lucide-react";
import { getUserSession, logoutUser } from "../utils/authUtils";
import { UserProfileDB } from "../utils/db";
import ThemeToggle from "../components/ThemeToggle";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

const TERMS_SECTIONS = [
    {
        title: "1. Purpose of Assessment",
        color: "border-blue-300 dark:border-blue-700/60 bg-blue-50 dark:bg-blue-950/60",
        headerBg: "bg-blue-100 dark:bg-blue-900/60 text-slate-800 dark:text-white",
        content: "This assessment evaluates NGO readiness for CSR partnerships, grants, and institutional funding. The framework follows Indian regulatory standards including the Income Tax Act, CSR Rules under the Companies Act 2013, and FCRA guidelines. Results are based on self-declared information and reflect organizational status at the time of assessment.",
    },
    {
        title: "2. Data Privacy and Security",
        color: "border-green-300 dark:border-emerald-700/60 bg-green-50 dark:bg-emerald-950/60",
        headerBg: "bg-green-100 dark:bg-emerald-900/60 text-slate-800 dark:text-white",
        content: "All data submitted during this assessment is stored securely and will not be shared with third parties without explicit consent. Your email and phone information may be used for report delivery and platform communications only. ETHYRA Impact follows strict data protection standards.",
    },
    {
        title: "3. Report Access and Payment",
        color: "border-purple-300 dark:border-purple-700/60 bg-purple-50 dark:bg-purple-950/60",
        headerBg: "bg-purple-100 dark:bg-purple-900/60 text-slate-800 dark:text-white",
        content: "A partial summary of your assessment results is available at no cost. The complete 100% executive report, including detailed analytics, category breakdown, dynamic charts, and mandatory audit checklist, is available for a fee of ₹149 via UPI QR code transaction. The full report will be emailed as a PDF attachment once payment is verified by our admin team.",
    },
    {
        title: "4. Accuracy and Responsibility",
        color: "border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/60",
        headerBg: "bg-amber-100 dark:bg-amber-900/60 text-slate-800 dark:text-white",
        content: "You are responsible for providing accurate and truthful information in all assessment responses. ETHYRA Impact does not guarantee funding outcomes based on assessment results. False declarations or misrepresentation of organizational status will invalidate the assessment and may result in account suspension.",
    },
    {
        title: "5. Usage Guidelines",
        color: "border-teal-300 dark:border-teal-700/60 bg-teal-50 dark:bg-teal-950/60",
        headerBg: "bg-teal-100 dark:bg-teal-900/60 text-slate-800 dark:text-white",
        content: "Each assessment session is unique to your organization. You may retake the assessment to reflect updated compliance status. Results are valid at the time of assessment and may need renewal as organizational circumstances change. ETHYRA Impact reserves the right to update the assessment framework to reflect regulatory changes.",
    },
];

export default function Terms() {
    const navigate = useNavigate();
    const session = getUserSession();
    const [accepted, setAccepted] = useState(false);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
        if (atBottom) setScrolledToBottom(true);
    };

    const handleStart = () => {
        if (!accepted || !scrolledToBottom) return;
        if (session?.id) {
            UserProfileDB.update(session.id, { termsAccepted: true });
        }
        navigate("/welcome");
    };

    const handleExit = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a] text-slate-800 dark:text-white transition-colors duration-300">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md border-b border-blue-100 dark:border-blue-900/40 shadow-sm transition-colors">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <img src={LOGO} alt="ETHYRA" className="h-10" />
                    <h1 className="text-base font-bold text-slate-800 dark:text-white">Terms and Conditions</h1>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button onClick={handleExit} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all">
                            <LogOut className="w-3.5 h-3.5" />Exit
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 pb-16 space-y-6">
                {/* Hero Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary via-blue-700 to-indigo-800 rounded-3xl p-8 shadow-xl text-white"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-1">Terms and Conditions</h2>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Welcome, <strong>{session?.fullName || "there"}!</strong> Before starting the NGO Readiness Assessment, please read and accept the following terms carefully.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5">
                        {["61 Questions", "30-45 minutes", "6 Sections", "Verified Secure"].map(pill => (
                            <span key={pill} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full border border-white/30 font-medium">{pill}</span>
                        ))}
                    </div>
                </motion.div>

                {/* About Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#0f2342]/90 rounded-2xl border border-blue-100 dark:border-blue-500/30 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">About This Assessment</h3>
                    <p className="text-slate-600 dark:text-blue-200 text-sm mb-4">This platform uses an evidence-based due diligence framework designed specifically for Indian NGOs seeking CSR funding, institutional grants, and organizational credibility verification.</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {[
                            { title: "Response Options", desc: "Yes / No / Not Applicable (NA)", icon: "✓", color: "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700/60" },
                            { title: "Scoring", desc: "Mandatory (Pass/Fail) + Normal (0–2 points)", icon: "★", color: "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700/60" },
                            { title: "Final Rating", desc: "Highly Recommended to High Risk", icon: "◆", color: "bg-violet-50 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/60" },
                        ].map(card => (
                            <div key={card.title} className={`${card.color} border rounded-xl p-4`}>
                                <span className="text-2xl text-primary dark:text-cyan-400 font-bold">{card.icon}</span>
                                <p className="font-bold text-slate-800 dark:text-white text-sm mt-2">{card.title}</p>
                                <p className="text-slate-500 dark:text-blue-200 text-xs mt-1">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Terms Content */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#0f2342]/90 rounded-2xl border border-blue-100 dark:border-blue-500/30 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Assessment Terms</h3>
                    <p className="text-slate-400 dark:text-blue-300 text-xs mb-4 font-medium">Scroll to the bottom to enable acceptance</p>

                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="max-h-[420px] overflow-y-auto pr-1 space-y-4 scrollbar-thin"
                    >
                        {TERMS_SECTIONS.map((section, i) => (
                            <div key={i} className={`${section.color} border rounded-xl overflow-hidden`}>
                                <div className={`${section.headerBg} px-4 py-2 font-bold`}>
                                    <p className="font-bold text-sm">{section.title}</p>
                                </div>
                                <p className="px-4 py-3 text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{section.content}</p>
                            </div>
                        ))}
                        <div className="text-xs text-slate-400 dark:text-blue-300 text-center py-3 border-t border-slate-100 dark:border-blue-900/40 font-medium">
                            Last updated: 2026 — For queries, contact connect@ethyra.in
                        </div>
                    </div>
                </motion.div>

                {/* Acceptance */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    {!scrolledToBottom && (
                        <div className="mb-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 rounded-xl p-3 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            Please scroll through all terms above to enable the acceptance checkbox.
                        </div>
                    )}
                    <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${accepted ? "border-green-500 dark:border-emerald-400 bg-green-50 dark:bg-emerald-950/60" : "border-slate-200 dark:border-blue-700/60 bg-white dark:bg-[#0f2342]/90"}`}>
                        <div className="flex-shrink-0 mt-0.5">
                            {accepted ? (
                                <CheckCircle className="w-5 h-5 text-green-500 dark:text-emerald-400" />
                            ) : (
                                <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-blue-600" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">I have read, understood, and agree to the Terms and Conditions</p>
                            <p className="text-slate-500 dark:text-blue-200 text-xs mt-0.5">By accepting, you confirm all information provided will be accurate and truthful.</p>
                        </div>
                        <input type="checkbox" className="sr-only" checked={accepted} onChange={e => {
                            if (!scrolledToBottom) return;
                            setAccepted(e.target.checked);
                        }} />
                    </label>
                </motion.div>

                {/* Start Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={handleStart}
                    disabled={!accepted || !scrolledToBottom}
                    className="w-full bg-gradient-to-r from-primary via-blue-600 to-cyan-500 text-white font-bold text-lg h-14 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <CheckSquare className="w-5 h-5" />
                    I Accept — Start Assessment
                </motion.button>
            </main>
        </div>
    );
}
