import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, CheckCircle2, MessageSquare } from "lucide-react";
import { getUserSession, logoutUser } from "../utils/authUtils";
import { QUESTIONS, CATEGORIES, calculateResults, getScore } from "../utils/questions";
import { AssessmentAnswerDB, AssessmentResultDB } from "../utils/db";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

function generateAttemptId() {
    return "att-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

const CATEGORY_BADGE = {
    "Legal Identity & Registration": "bg-blue-100 text-blue-700 border-blue-200",
    "Statutory & Tax Compliance": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Financial Management & Stability": "bg-violet-100 text-violet-700 border-violet-200",
    "Governance & Ethics": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "Program Capability & Strategic Fit": "bg-teal-100 text-teal-700 border-teal-200",
    "Monitoring, Impact & Transparency": "bg-sky-100 text-sky-700 border-sky-200",
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

        // Auto-advance
        await new Promise(r => setTimeout(r, 350));
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

    // Category progress
    const catProgress = CATEGORIES.map(cat => {
        const qInCat = QUESTIONS.filter(q => q.category === cat.name);
        const answered = qInCat.filter(q => answers[q.id] !== undefined).length;
        return { name: cat.name, answered, total: qInCat.length };
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <img src={LOGO} alt="ETHYRA" className="h-8" />
                        <div className="flex items-center gap-2">
                            {!showFeedback && (
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_BADGE[currentQ?.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                    {currentQ?.category}
                                </span>
                            )}
                            <span className="text-xs text-slate-500 font-medium">
                                {showFeedback ? "Feedback" : `Q${currentIndex + 1} / ${totalQ}`}
                            </span>
                        </div>
                        <button onClick={handleExit} className="text-red-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-all">
                            <LogOut className="w-3 h-3" />Exit
                        </button>
                    </div>
                    {!showFeedback && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 font-medium w-8 text-right">{progress}%</span>
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
                            className="bg-white rounded-3xl border border-blue-100 shadow-lg p-8"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Share Your Feedback</h2>
                                <p className="text-slate-500 text-sm mt-1">Optional — your feedback helps us improve</p>
                            </div>
                            <textarea
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="How was your assessment experience? Any suggestions for improvement or additional areas you'd like covered?"
                                rows={5}
                                className="w-full border border-blue-200 rounded-xl p-4 text-slate-700 text-sm resize-none focus:outline-none focus:border-primary"
                            />
                            <div className="flex items-center justify-between mt-6">
                                <button onClick={handleBack} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm transition-all">
                                    <ChevronLeft className="w-4 h-4" />Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-8 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all"
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
                            className="bg-white rounded-3xl border border-blue-100 shadow-lg p-6 sm:p-8"
                        >
                            {/* Badges row */}
                            <div className="flex items-start justify-between flex-wrap gap-2 mb-5">
                                <div className="flex flex-wrap gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${CATEGORY_BADGE[currentQ.category]}`}>
                                        {currentQ.category}
                                    </span>
                                    {currentQ.type === "Mandatory" ? (
                                        <span className="text-xs px-3 py-1 rounded-full border font-medium bg-red-50 text-red-600 border-red-200">
                                            ⚠ Mandatory
                                        </span>
                                    ) : (
                                        <span className="text-xs px-3 py-1 rounded-full border font-medium bg-green-50 text-green-600 border-green-200">
                                            ● Normal
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 font-mono">#{currentQ.slNo}</span>
                            </div>

                            {/* Question */}
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug mb-3">
                                {currentQ.text}
                            </h2>
                            <p className="text-sm text-slate-500 mb-8">
                                {currentQ.type === "Mandatory"
                                    ? "⚠️ Mandatory — Required for eligibility (Pass/Fail)"
                                    : "✦ Yes = 2 points | No = 0 points | NA = not applicable"}
                            </p>

                            {/* Answer options */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[
                                    { value: "Yes", bg: "bg-green-500", border: "border-green-400", hover: "hover:bg-green-50 hover:border-green-300", icon: "✓" },
                                    { value: "No", bg: "bg-red-500", border: "border-red-400", hover: "hover:bg-red-50 hover:border-red-300", icon: "✗" },
                                    { value: "NA", bg: "bg-amber-500", border: "border-amber-400", hover: "hover:bg-amber-50 hover:border-amber-300", icon: "—" },
                                ].map(({ value, bg, border, hover, icon }) => {
                                    const selected = answers[currentQ.id] === value;
                                    return (
                                        <motion.button
                                            key={value}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleAnswer(value)}
                                            className={`py-5 sm:py-6 rounded-2xl border-2 font-bold text-lg transition-all flex flex-col items-center gap-1.5 
                        ${selected ? `${bg} border-transparent text-white shadow-lg` : `bg-white ${border} ${hover} text-slate-700`}`}
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
                                    className="flex items-center gap-2 text-green-600 text-sm">
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
                            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm transition-all disabled:opacity-40"
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
                                        className={`h-1.5 rounded-full transition-all ${i === step ? "w-4 bg-primary" : "w-1.5 bg-slate-300"}`}
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
                            className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
                        >
                            {currentIndex === totalQ - 1 ? "Feedback" : "Next"}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Category mini-progress */}
                <div className="mt-8 bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Section Progress</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {catProgress.map(cat => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-0.5">
                                        <span className="text-xs text-slate-600 truncate max-w-[140px]">{cat.name.split(" ")[0]}</span>
                                        <span className="text-xs text-slate-400">{cat.answered}/{cat.total}</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
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
