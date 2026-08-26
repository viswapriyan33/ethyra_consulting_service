import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Clock, Award, CheckCircle2, AlertCircle, ChevronRight, LogOut } from "lucide-react";
import { getUserSession, logoutUser } from "../utils/authUtils";
import { CATEGORIES } from "../utils/questions";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

export default function Welcome() {
    const navigate = useNavigate();
    const session = getUserSession();

    const handleExit = () => {
        logoutUser();
        navigate("/login");
    };

    const sectionDescriptions = [
        "Legal Identity and Registration",
        "Statutory and Tax Compliance",
        "Financial Management",
        "Governance and Ethics",
        "Program Capability",
        "Monitoring and Impact",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <img src={LOGO} alt="ETHYRA" className="h-10" />
                    <div className="text-center hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">{session?.fullName}</p>
                        <p className="text-xs text-slate-500">{session?.organizationName}</p>
                    </div>
                    <button onClick={handleExit} className="text-red-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all">
                        <LogOut className="w-3.5 h-3.5" />Exit
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 pb-16 space-y-6">
                {/* Welcome Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-8 shadow-xl text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">
                                Welcome back, {session?.fullName?.split(" ")[0] || "there"}! 👋
                            </h1>
                            <p className="text-blue-200 text-sm">{session?.organizationName}</p>
                            <div className="flex flex-wrap gap-3 mt-4">
                                {[
                                    { icon: ClipboardList, label: "61 Questions" },
                                    { icon: Clock, label: "~30-45 minutes" },
                                    { icon: Award, label: "6 Sections" },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm">
                                        <Icon className="w-3.5 h-3.5" />{label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <img src={LOGO} alt="ETHYRA" className="h-16 opacity-80" style={{ mixBlendMode: "screen" }} />
                    </div>
                </motion.div>

                {/* Instructions */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-slate-800">How to Answer</h3>
                        </div>
                        <div className="space-y-2">
                            {[
                                { dot: "bg-green-500", text: "Yes — Your organization complies / has this in place" },
                                { dot: "bg-red-500", text: "No — Your organization does not have this" },
                                { dot: "bg-amber-500", text: "NA — Not applicable to your organization" },
                            ].map(({ dot, text }) => (
                                <div key={text} className="flex items-start gap-2 text-sm text-slate-600">
                                    <div className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0 mt-1`} />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-slate-800">Scoring System</h3>
                        </div>
                        <div className="space-y-2">
                            {[
                                { dot: "bg-blue-500", text: "Mandatory — Pass/Fail required for eligibility" },
                                { dot: "bg-indigo-500", text: "Normal — Yes earns 2 points, No earns 0" },
                                { dot: "bg-slate-400", text: "Final Rating — Based on total percentage score" },
                            ].map(({ dot, text }) => (
                                <div key={text} className="flex items-start gap-2 text-sm text-slate-600">
                                    <div className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0 mt-1`} />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Category Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Assessment Categories</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CATEGORIES.map((cat, i) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-5 shadow-md text-white`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-3xl font-black opacity-40">{i + 1}</span>
                                        <p className="font-bold text-sm mt-1 leading-tight">{sectionDescriptions[i]}</p>
                                    </div>
                                    <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-1 rounded-full">{cat.count}Q</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Start Button */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
                    <button
                        onClick={() => navigate("/assessment")}
                        className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg h-14 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                        Begin Assessment <ChevronRight className="w-5 h-5" />
                    </button>
                    <p className="text-center text-xs text-slate-500">
                        Your answers are auto-saved. You can navigate back to review previous answers.
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
