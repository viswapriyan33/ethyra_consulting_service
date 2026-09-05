import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, CheckCircle2, MessageSquare } from "lucide-react";
import { getUserSession, logoutUser } from "../utils/authUtils";
import { QUESTIONS, CATEGORIES, calculateResults, getScore } from "../utils/questions";
import { AssessmentAnswerDB, AssessmentResultDB } from "../utils/db";
import ThemeToggle from "../components/ThemeToggle";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

function generateAttemptId() {
    return "att-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

const CATEGORY_BADGE = {
    "Legal Identity & Registration": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-cyan-300 dark:border-blue-700/50",
    "Statutory & Tax Compliance": "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700/50",
    "Financial Management & Stability": "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-700/50",
    "Governance & Ethics": "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-200 dark:border-cyan-700/50",
    "Program Capability & Strategic Fit": "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700/50",
    "Monitoring, Impact & Transparency": "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700/50",
};

export default function Assessment() {
    const navigate = useNavigate();
    const session = getUserSession();
    const [attemptId] = useState(generateAttemptId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [saving, setSaving] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [direction, setDirection] = useState(1);

    const totalQ = QUESTIONS.length;
    const currentQ = QUESTIONS[currentIndex];
    const progress = Math.round(((currentIndex + 1) / totalQ) * 100);

    const handleAnswer = async (answer) => {
        if (saving) return;
        setSaving(true);
        const q = currentQ;
        const score = getScore(q, answer);
        const answerRecord = {
            userProfileId: session?.id,
            attemptId,
            questionId: q.id,
            questionText: q.text,
            category: q.category,
            documentType: q.type,
            selectedAnswer: answer,
            score: typeof score === "number" ? score : 0,
            remarks: "",
            answeredAt: new Date().toISOString(),
        };
        AssessmentAnswerDB.create(answerRecord);
        setAnswers(prev => ({ ...prev, [q.id]: answer }));

        await new Promise(r => setTimeout(r, 300));
        if (currentIndex < totalQ - 1) {
            setDirection(1);
            setCurrentIndex(i => i + 1);
        } else {
            setShowFeedback(true);
        }
        setSaving(false);
    };

    const handleBack = () => {
        if (showFeedback) { setShowFeedback(false); return; }
        if (currentIndex > 0) { setDirection(-1); setCurrentIndex(i => i - 1); }
    };

    const handleSubmit = async () => {
        const allAnswers = AssessmentAnswerDB.findByAttempt(attemptId);
        const result = calculateResults(allAnswers);
        const savedResult = AssessmentResultDB.create({
            userProfileId: session?.id,
            attemptId,
            ...result,
            completedAt: new Date().toISOString(),
        });
        navigate("/results", { state: { attemptId, resultId: savedResult.id } });
    };

    const handleExit = () => { logoutUser(); navigate("/login"); };

    const catProgress = CATEGORIES.map(cat => {
        const qInCat = QUESTIONS.filter(q => q.category === cat.name);
        const answered = qInCat.filter(q => answers[q.id] !== undefined).length;
        return { name: cat.name, answered, total: qInCat.length };
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a] text-slate-800 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md border-b border-blue-100 dark:border-blue-900/40 shadow-sm transition-colors">
                <div className="max-w-3xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <img src={LOGO} alt="ETHYRA" className="h-8" />
                        <div className="flex items-center gap-2">
                            {!showFeedback && (
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_BADGE[currentQ?.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                    {currentQ?.category}
                                </span>
                            )}
                            <span className="text-xs text-slate-500 dark:text-blue-200 font-medium">
                                {showFeedback ? "Feedback" : `Q${currentIndex + 1} / ${totalQ}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <button onClick={handleExit} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all">
                                <LogOut className="w-3.5 h-3.5" />Exit
                            </button>
                        </div>
                    </div>
                    {!showFeedback && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary via-blue-500 to-cyan-400 rounded-full"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-blue-200 font-bold w-8 text-right">{progress}%</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
                <AnimatePresence mode="wait">
                    {showFeedback ? (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white dark:bg-[#0f2342]/90 rounded-3xl border border-blue-100 dark:border-blue-500/30 shadow-xl p-8"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <MessageSquare className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Share Your Feedback</h2>
                                <p className="text-slate-500 dark:text-blue-200 text-sm mt-1">Optional — your feedback helps us improve</p>
                            </div>
                            <textarea
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="How was your assessment experience? Any suggestions for improvement or additional areas you'd like covered?"
                                rows={5}
                                className="w-full bg-slate-50 dark:bg-[#0a1628] border border-blue-200 dark:border-blue-700/60 rounded-xl p-4 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:border-primary dark:focus:border-cyan-400"
                            />
                            <div className="flex items-center justify-between mt-6">
                                <button onClick={handleBack} className="flex items-center gap-1 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/40 px-4 py-2 rounded-xl border border-slate-200 dark:border-blue-700/50 text-sm transition-all">
                                    <ChevronLeft className="w-4 h-4" />Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-gradient-to-r from-primary to-cyan-500 text-white font-bold px-8 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-95 transition-all shadow-lg cursor-pointer"
                                >
                                    Submit & View Results
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: direction * 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction * -50 }}
                            className="bg-white dark:bg-[#0f2342]/90 rounded-3xl border border-blue-100 dark:border-blue-500/30 shadow-xl p-6 sm:p-8"
                        >
                            {/* Badges row */}
                            <div className="flex items-start justify-between flex-wrap gap-2 mb-5">
                                <div className="flex flex-wrap gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${CATEGORY_BADGE[currentQ.category]}`}>
                                        {currentQ.category}
                                    </span>
                                    {currentQ.type === "Mandatory" ? (
                                        <span className="text-xs px-3 py-1 rounded-full border font-bold bg-red-50 text-red-600 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700/60">
                                            ⚠ Mandatory Requirement
                                        </span>
                                    ) : (
                                        <span className="text-xs px-3 py-1 rounded-full border font-medium bg-green-50 text-green-600 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-700/60">
                                            ● Standard Criteria
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 dark:text-blue-300 font-mono font-bold">#{currentQ.slNo}</span>
                            </div>

                            {/* Question */}
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-snug mb-3">
                                {currentQ.text}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-blue-200 mb-8">
                                {currentQ.type === "Mandatory"
                                    ? "⚠️ Mandatory — Required for eligibility (Pass/Fail)"
                                    : "✦ Yes = 2 points | No = 0 points | NA = not applicable"}
                            </p>

                            {/* Answer options */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[
                                    { value: "Yes", bg: "bg-green-500 dark:bg-emerald-600", border: "border-green-400 dark:border-emerald-500", hover: "hover:bg-green-50 dark:hover:bg-emerald-950/40 hover:border-green-300", icon: "✓" },
                                    { value: "No", bg: "bg-red-500 dark:bg-rose-600", border: "border-red-400 dark:border-rose-500", hover: "hover:bg-red-50 dark:hover:bg-rose-950/40 hover:border-red-300", icon: "✗" },
                                    { value: "NA", bg: "bg-amber-500 dark:bg-amber-600", border: "border-amber-400 dark:border-amber-500", hover: "hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300", icon: "—" },
                                ].map(({ value, bg, border, hover, icon }) => {
                                    const selected = answers[currentQ.id] === value;
                                    return (
                                        <motion.button
                                            key={value}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleAnswer(value)}
                                            className={`py-5 sm:py-6 rounded-2xl border-2 font-bold text-lg transition-all flex flex-col items-center gap-1.5 cursor-pointer 
                        ${selected ? `${bg} border-transparent text-white shadow-lg` : `bg-white dark:bg-[#0a1628]/60 ${border} ${hover} text-slate-700 dark:text-white`}`}
                                        >
                                            <span className="text-2xl">{icon}</span>
                                            <span>{value}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Answer confirmation */}
                            {answers[currentQ.id] && (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-green-600 dark:text-emerald-400 text-sm font-semibold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Answer recorded: <strong>{answers[currentQ.id]}</strong>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                {!showFeedback && (
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={handleBack}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-1 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/40 px-4 py-2 rounded-xl border border-slate-200 dark:border-blue-700/50 text-sm font-medium transition-all disabled:opacity-40"
                        >
                            <ChevronLeft className="w-4 h-4" />Back
                        </button>

                        {/* Step dots */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 7 }).map((_, i) => {
                                const step = Math.floor((currentIndex / (totalQ - 1)) * 6);
                                return (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-primary dark:bg-cyan-400" : "w-1.5 bg-slate-300 dark:bg-slate-700"}`}
                                    />
                                );
                            })}
                        </div>

                        <button
                            onClick={() => {
                                setDirection(1);
                                if (currentIndex < totalQ - 1) setCurrentIndex(i => i + 1);
                                else setShowFeedback(true);
                            }}
                            className="flex items-center gap-1 bg-gradient-to-r from-primary to-cyan-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-95 transition-all shadow-md cursor-pointer"
                        >
                            {currentIndex === totalQ - 1 ? "Feedback" : "Next"}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Category mini-progress */}
                <div className="mt-8 bg-white dark:bg-[#0f2342]/90 rounded-2xl border border-blue-100 dark:border-blue-500/30 p-4 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-blue-200 uppercase tracking-wide mb-3">Section Progress</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {catProgress.map(cat => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-0.5">
                                        <span className="text-xs text-slate-600 dark:text-slate-200 truncate max-w-[140px] font-medium">{cat.name.split(" ")[0]}</span>
                                        <span className="text-xs text-slate-400 dark:text-blue-300">{cat.answered}/{cat.total}</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all"
                                            style={{ width: `${cat.total > 0 ? (cat.answered / cat.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
