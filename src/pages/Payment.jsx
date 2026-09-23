import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Hash, ArrowRight, Loader2, LogOut, CheckCircle, Clock, QrCode } from "lucide-react";
import { getUserSession, logoutUser, PAYMENT_AMOUNT } from "../utils/authUtils";
import { PaymentRecordDB, UserProfileDB } from "../utils/db";
import { sendPaymentNotifications } from "../utils/paymentNotificationService";
import ThemeToggle from "../components/ThemeToggle";
import paymentQrImg from "../assets/ethyra_upi_qr.png";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const session = getUserSession();
    const { attemptId, resultId } = location.state || {};

    const [utr, setUtr] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [existingPayment, setExistingPayment] = useState(null);

    useEffect(() => {
        if (!session?.id || !attemptId) return;
        const payments = PaymentRecordDB.findByAttempt(attemptId);
        const pending = payments.find((p) => p.status === "pending");
        const success = payments.find((p) => p.status === "success");
        if (pending || success) {
            setExistingPayment(pending || success);
            setSubmitted(true);
        }
    }, [attemptId, session?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedUtr = utr.trim();
        if (trimmedUtr.length < 6) {
            setError("Please enter a valid Transaction / UTR ID (min 6 characters).");
            return;
        }

        setSubmitting(true);
        setError("");

        const profile = (session?.id ? UserProfileDB.findById(session.id) : null) || session;
        const userEmail = (profile?.email || session?.email || "").trim();
        const userFullName = profile?.fullName || session?.fullName || "";
        const userOrg = profile?.organizationName || session?.organizationName || "";
        const userPhone = profile?.phone || session?.phone || "";

        try {
            // 1. Create Payment Record with Pending Status in DB
            const record = PaymentRecordDB.create({
                userProfileId: session?.id || profile?.id,
                attemptId,
                assessmentResultId: resultId,
                fullName: userFullName,
                email: userEmail,
                phone: userPhone,
                organizationName: userOrg,
                amount: PAYMENT_AMOUNT,
                utrNumber: trimmedUtr,
                status: "pending",
                paidAt: new Date().toISOString(),
            });

            // 2. Trigger Immediate Email Alert (Nodemailer) & SMS Alert (+918610904242)
            await sendPaymentNotifications({
                fullName: userFullName,
                email: userEmail,
                organizationName: userOrg,
                phone: userPhone,
                utrNumber: trimmedUtr,
            });

            setExistingPayment(record);
            setSubmitted(true);
        } catch (err) {
            setError("Failed to submit payment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleExit = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 dark:bg-gradient-to-br dark:from-[#0a1628] dark:via-[#0f2347] dark:to-[#1e3a8a] text-slate-800 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a1628]/90 backdrop-blur-md border-b border-blue-100 dark:border-blue-900/40 shadow-sm transition-colors">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <img src={LOGO} alt="ETHYRA" className="h-8" />
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Payment Portal</p>
                        <p className="text-xs text-slate-500 dark:text-blue-200">UPI Instant Payment · ₹{PAYMENT_AMOUNT}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={handleExit}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 font-semibold transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5" />Exit
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 pb-16 space-y-6">
                {!submitted ? (
                    <>
                        {/* Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-primary via-blue-700 to-indigo-800 rounded-3xl p-7 shadow-xl text-white border border-blue-400/20"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-13 h-13 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <CreditCard className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1 text-white">Unlock Executive PDF Report</h2>
                                        <p className="text-blue-100 text-sm">Pay ₹{PAYMENT_AMOUNT} via UPI to get your verified 100% readiness report</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {["Dynamic Charts", "Pillar Breakdown", "Mandatory Audit", "Direct PDF Email"].map((item) => (
                                                <span key={item} className="inline-flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full font-medium">
                                                    <CheckCircle className="w-3 h-3 text-cyan-300" />{item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl px-5 py-3 text-center sm:text-right flex-shrink-0">
                                    <p className="text-blue-200 text-xs mb-0.5">Amount Payable</p>
                                    <p className="text-3xl font-black text-white">₹{PAYMENT_AMOUNT}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Clean UPI QR Scanner Container */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-3xl p-7 shadow-lg text-center flex flex-col items-center"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <QrCode className="w-5 h-5 text-primary dark:text-cyan-400" />
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">UPI Payment QR Scanner</h3>
                            </div>

                            {/* Clean Container displaying the newly provided QR code image */}
                            <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/50 dark:to-[#0f2342] p-4 rounded-3xl border-2 border-primary/30 dark:border-cyan-400/40 shadow-md mb-3">
                                <img
                                    src={paymentQrImg}
                                    alt="UPI QR Scanner Code"
                                    className="w-56 h-56 object-contain rounded-2xl mx-auto shadow-sm"
                                />
                            </div>

                            {/* Required Subtext */}
                            <p className="text-sm font-bold text-primary dark:text-cyan-300 mt-1 tracking-wide">
                                Scan with any UPI app to pay
                            </p>
                            <p className="text-xs text-slate-500 dark:text-blue-200 mt-1">
                                Google Pay, PhonePe, Paytm, BHIM, or any Banking UPI app
                            </p>
                        </motion.div>

                        {/* Transaction ID Submission Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#0f2342]/90 border-2 border-primary/40 dark:border-cyan-400/50 rounded-3xl p-7 shadow-lg"
                        >
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-cyan-400/20 flex items-center justify-center">
                                    <Hash className="w-5 h-5 text-primary dark:text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Transaction Reference Verification</h3>
                                    <p className="text-xs text-slate-500 dark:text-blue-200">Enter your 12-digit UPI UTR / Transaction ID below</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                                        Transaction / UTR ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={utr}
                                        onChange={(e) => setUtr(e.target.value)}
                                        placeholder="e.g. 428790123456 / UTR reference number"
                                        className="w-full bg-slate-50 dark:bg-[#0a1628] border border-blue-200 dark:border-blue-700/60 rounded-xl px-4 py-3 font-mono text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary dark:focus:border-cyan-400 focus:ring-2 focus:ring-primary/20 dark:focus:ring-cyan-400/20 transition-all"
                                        required
                                    />
                                </div>

                                {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-primary via-blue-600 to-cyan-500 text-white font-bold h-13 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-60 cursor-pointer"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting Payment...
                                        </>
                                    ) : (
                                        <>
                                            Submit Payment for Verification
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </>
                ) : (
                    /* SUBMITTED PENDING STATE */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="bg-white dark:bg-[#0f2342]/90 border border-blue-100 dark:border-blue-500/30 rounded-3xl p-8 shadow-xl text-center">
                            <motion.div
                                animate={{ scale: [1, 1.12, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                                className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                            >
                                <Clock className="w-10 h-10 text-white" />
                            </motion.div>

                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Payment Submitted for Verification</h2>
                            <p className="text-sm text-slate-600 dark:text-blue-200 max-w-md mx-auto">
                                Your payment status is recorded as <strong className="text-amber-600 dark:text-amber-400 font-bold">Pending</strong>. Our admin team has received immediate Email and SMS alerts for verification.
                            </p>

                            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 mt-6 text-left max-w-md mx-auto">
                                <p className="text-amber-800 dark:text-amber-300 text-xs font-bold mb-1">Submitted Reference UTR ID</p>
                                <p className="font-mono text-lg text-amber-900 dark:text-amber-200 font-black tracking-wide">{existingPayment?.utrNumber}</p>
                                <div className="mt-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 border-t border-amber-200/60 dark:border-amber-800/60 pt-2">
                                    <span>Status: <strong className="capitalize">{existingPayment?.status || "Pending"} Verification</strong></span>
                                    <span>Amount: ₹{existingPayment?.amount || PAYMENT_AMOUNT}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                                <button
                                    onClick={() => navigate("/results", { state: { attemptId } })}
                                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
                                >
                                    View Assessment Results <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="flex-1 bg-slate-100 dark:bg-blue-900/40 text-slate-700 dark:text-white border border-slate-200 dark:border-blue-700/50 font-bold h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-blue-800/60 transition-all"
                                >
                                    Go to Dashboard
                                </button>
                            </div>

                            <p className="text-xs text-slate-400 dark:text-blue-300 mt-4">
                                Once verified on the Admin Dashboard, your full executive PDF report will be auto-delivered to <strong>{session?.email}</strong>.
                            </p>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
