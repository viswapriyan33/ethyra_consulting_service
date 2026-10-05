import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckCircle2,
  MessageSquare,
  Award,
  Sparkles,
} from "lucide-react";
import { getUserSession, logoutUser } from "../utils/authUtils";
import {
  QUESTIONS,
  CATEGORIES,
  calculateResults,
  getScore,
} from "../utils/questions";
import { AssessmentAnswerDB, AssessmentResultDB } from "../utils/db";
import ThemeToggle from "../components/ThemeToggle";

const LOGO =
  "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

function generateAttemptId() {
  return "att-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

const CATEGORY_BADGE = {
  "Legal & Institutional Readiness":
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-cyan-300 dark:border-blue-700/50",
  "Statutory & Tax Readiness":
    "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700/50",
  "Governance & Ethics":
    "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-700/50",
  "Financial Management & Controls":
    "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-200 dark:border-cyan-700/50",
  "Programme Capability":
    "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700/50",
  "Monitoring Evaluation & Impact":
    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700/50",
  "Safeguarding Inclusion & Data Responsibility":
    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 dark:border-fuchsia-700/50",
  "CSR & Donor Partnership Readiness":
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700/50",
  "Diagnostic Question 1":
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700/50",
  "Diagnostic Question 2":
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700/50",
};

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

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
    const opt = q.options?.find((o) => o.label === answer);
    const score = opt ? opt.score : getScore(q, answer);

    const answerRecord = {
      userProfileId: session?.id,
      attemptId,
      questionId: q.id,
      qNo: q.qNo,
      questionText: q.text,
      category: q.category,
      documentType: q.type,
      selectedAnswer: answer,
      score: typeof score === "number" ? score : (score === "NA" ? "NA" : 0),
      riskLevel: opt?.riskLevel || "",
      verificationRequired: !!opt?.verificationRequired,
      correctiveAction: opt?.correctiveAction || "",
      remarks: "",
      answeredAt: new Date().toISOString(),
    };

    AssessmentAnswerDB.create(answerRecord);
    setAnswers((prev) => ({ ...prev, [q.id]: answer }));

    await new Promise((r) => setTimeout(r, 220));
    if (currentIndex < totalQ - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    } else {
      setShowFeedback(true);
    }
    setSaving(false);
  };

  const handleBack = () => {
    if (showFeedback) {
      setShowFeedback(false);
      return;
    }
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    } else {
      setShowFeedback(true);
    }
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

  const handleExit = () => {
    logoutUser();
    navigate("/login");
  };

  const catProgress = CATEGORIES.map((cat) => {
    const qInCat = QUESTIONS.filter((q) => q.category === cat.name);
    const answered = qInCat.filter((q) => answers[q.id] !== undefined).length;
    return { name: cat.name, answered, total: qInCat.length };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a] text-slate-800 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-md border-b border-blue-100 dark:border-blue-900/40 shadow-sm transition-colors">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <img src={LOGO} alt="ETHYRA" className="h-8" />
            <div className="flex items-center gap-2">
              {!showFeedback && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    CATEGORY_BADGE[currentQ?.category] ||
                    "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {currentQ?.category}
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-blue-200 font-medium">
                {showFeedback ? "Summary & Feedback" : `Q${currentIndex + 1} / ${totalQ}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleExit}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit
              </button>
            </div>
          </div>
          {!showFeedback && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-blue-200 font-bold w-10 text-right">
                {progress}%
              </span>
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Assessment Completed!
                </h2>
                <p className="text-slate-500 dark:text-blue-200 text-sm mt-1">
                  You have responded to all {totalQ} diagnostic criteria. Optionally share any feedback below before generating your report.
                </p>
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional feedback: Any remarks about this assessment or specific institutional priorities?"
                rows={4}
                className="w-full bg-slate-50 dark:bg-[#0a1628] border border-blue-200 dark:border-blue-700/60 rounded-xl p-4 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
              />

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-900/40 px-4 py-2 rounded-xl border border-slate-200 dark:border-blue-700/50 text-sm transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Review Questions
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-8 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-95 transition-all shadow-lg cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
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
              <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full border font-semibold ${
                      CATEGORY_BADGE[currentQ.category] ||
                      "bg-blue-100 text-blue-700 border-blue-200"
                    }`}
                  >
                    {currentQ.category}
                  </span>
                  {currentQ.type === "Diagnostic" ? (
                    <span className="text-xs px-3 py-1 rounded-full border font-bold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60">
                      ✦ Diagnostic Question
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full border font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-cyan-300 dark:border-blue-700/60">
                      Weightage: {currentQ.weightage}%
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 dark:text-blue-300 font-mono font-bold bg-slate-100 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-blue-800/60">
                  {currentQ.qNo || `Q${currentQ.slNo}`}
                </span>
              </div>

              {/* Question text */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-snug mb-3">
                {currentQ.text}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-blue-200 mb-6">
                {currentQ.type === "Diagnostic"
                  ? "✦ Select the response that best describes your organization's context (Exploratory / Non-scoring)"
                  : "✦ Select the response option that accurately reflects your organization"}
              </p>

              {/* Dynamic Answer Options from Attached File */}
              <div className="space-y-2.5 mb-6">
                {currentQ.options?.map((opt, idx) => {
                  const selected = answers[currentQ.id] === opt.label;
                  return (
                    <motion.button
                      key={opt.label + idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(opt.label)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        selected
                          ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 border-transparent text-white shadow-md shadow-blue-500/20"
                          : "bg-white dark:bg-[#0a1628]/70 border-slate-200 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-cyan-400 text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                            selected
                              ? "bg-white/20 text-white border border-white/30"
                              : "bg-slate-100 dark:bg-blue-950/60 text-slate-600 dark:text-blue-300 border border-slate-200 dark:border-blue-800/60"
                          }`}
                        >
                          {OPTION_LETTERS[idx] || (idx + 1)}
                        </span>
                        <span className="font-semibold text-sm sm:text-base leading-snug">
                          {opt.label}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {opt.score !== "NA" && typeof opt.score === "number" && (
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              selected
                                ? "bg-white/20 text-white"
                                : "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300"
                            }`}
                          >
                            {opt.score} {opt.score === 1 ? "mark" : "marks"}
                          </span>
                        )}
                        {opt.score === "NA" && (
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              selected
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300"
                            }`}
                          >
                            N/A
                          </span>
                        )}
                        {selected && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Answer confirmation */}
              {answers[currentQ.id] && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-blue-700 dark:text-cyan-400 text-xs sm:text-sm font-semibold bg-blue-50 dark:bg-blue-950/50 p-3 rounded-xl border border-blue-200 dark:border-blue-800/60"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                  <span>
                    Selected: <strong>{answers[currentQ.id]}</strong>
                  </span>
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
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <span className="text-xs text-slate-400 dark:text-blue-300 font-medium">
              Question {currentIndex + 1} of {totalQ}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-95 transition-all shadow-md cursor-pointer"
            >
              {currentIndex === totalQ - 1 ? "Review & Submit" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Category mini-progress */}
        <div className="mt-8 bg-white dark:bg-[#0f2342]/90 rounded-2xl border border-blue-100 dark:border-blue-500/30 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 dark:text-blue-200 uppercase tracking-wide mb-3">
            Section Progress
          </h3>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {catProgress.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs text-slate-600 dark:text-slate-200 truncate max-w-[170px] font-medium">
                      {cat.name}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-blue-300 font-mono">
                      {cat.answered}/{cat.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
                      style={{
                        width: `${cat.total > 0 ? (cat.answered / cat.total) * 100 : 0}%`,
                      }}
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
