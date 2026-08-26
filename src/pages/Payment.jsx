import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CreditCard, Landmark, Hash, ArrowRight, Loader2, LogOut,
    Copy, CheckCircle, Clock, Mail, QrCode
} from "lucide-react";
import { getUserSession, logoutUser, PAYMENT_AMOUNT } from "../utils/authUtils";
import { PaymentRecordDB } from "../utils/db";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

const BANK_DETAILS = {
    "Account Name": "ETHYRA CONSULTING SERVICES",
    "Account Number": "44664024713",
    "IFSC Code": "SBIN0040155",
    "Bank Branch": "Hosur",
};

function CopyField({ label, value }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-semibold text-slate-800 font-mono">{value}</p>
            </div>
            <button onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-primary hover:text-accent transition-all px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/5">
                {copied ? <><CheckCircle className="w-3 h-3 text-green-500" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
            </button>
        </div>
    );
}

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
        const pending = payments.find(p => p.status === "pending");
        if (pending) {
            setExistingPayment(pending);
            setSubmitted(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (utr.trim().length < 6) { setError("Please enter a valid UTR reference (min 6 characters)."); return; }
        setSubmitting(true);
        setError("");
        await new Promise(r => setTimeout(r, 1000));
        const record = PaymentRecordDB.create({
            userProfileId: session?.id,
            attemptId,
            assessmentResultId: resultId,
            fullName: session?.fullName,
            email: session?.email,
            phone: session?.phone,
            organizationName: session?.organizationName,
            amount: PAYMENT_AMOUNT,
            upiId: BANK_DETAILS["Account Number"],
            utrNumber: utr.trim(),
            status: "pending",
            paidAt: new Date().toISOString(),
        });
        setExistingPayment(record);
        setSubmitted(true);
        setSubmitting(false);
    };

    const handleExit = () => { logoutUser(); navigate("/login"); };

    const qrData = encodeURIComponent(`Account: ${BANK_DETAILS["Account Number"]}, IFSC: ${BANK_DETAILS["IFSC Code"]}, Name: ${BANK_DETAILS["Account Name"]}, Amount: ${PAYMENT_AMOUNT}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&bgcolor=ffffff&color=0a1628&data=${qrData}`;

    const copyAll = () => {
        const text = Object.entries(BANK_DETAILS).map(([k, v]) => `${k}: ${v}`).join("\n") + `\nAmount: ₹${PAYMENT_AMOUNT}`;
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <img src={LOGO} alt="ETHYRA" className="h-8" />
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700">Unlock Full Report</p>
                        <p className="text-xs text-slate-500">Bank Transfer · ₹{PAYMENT_AMOUNT}</p>
                    </div>
                    <button onClick={handleExit} className="text-red-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-all">
                        <LogOut className="w-3 h-3" />Exit
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 pb-16 space-y-6">
                {!submitted ? (
                    <>
                        {/* Hero Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-8 shadow-xl text-white">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-1">Unlock Your Full Report</h2>
                                    <p className="text-blue-200 text-sm">Pay ₹{PAYMENT_AMOUNT} · Verified manually by our team</p>
                                    <div className="mt-4 space-y-1">
                                        {["Complete category breakdown", "Detailed recommendations", "Risk classification report", "Full PDF report emailed to you"].map(item => (
                                            <div key={item} className="flex items-center gap-2 text-sm text-blue-100">
                                                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />{item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/15 border border-white/30 rounded-xl px-4 py-3 text-center flex-shrink-0">
                                    <p className="text-blue-200 text-xs mb-1">One-time unlock fee</p>
                                    <p className="text-3xl font-black">₹{PAYMENT_AMOUNT}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bank Details */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Landmark className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-slate-800">Bank Transfer Details</h3>
                            </div>
                            {Object.entries(BANK_DETAILS).map(([k, v]) => (
                                <CopyField key={k} label={k} value={v} />
                            ))}
                            <button onClick={copyAll}
                                className="mt-4 w-full border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all">
                                <Copy className="w-4 h-4" />Copy all bank details
                            </button>
                        </motion.div>

                        {/* QR Code */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-4 self-start">
                                <QrCode className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-slate-800">Scan to Pay</h3>
                            </div>
                            <div className="bg-white border-2 border-blue-200 rounded-2xl p-3">
                                <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
                            </div>
                            <p className="text-xs text-slate-400 mt-3">Scan for bank details reference</p>
                        </motion.div>

                        {/* UTR Form */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white border-2 border-primary/30 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Hash className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-slate-800">Submit Transaction Reference ID</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction / UTR Reference ID *</label>
                                    <input
                                        type="text"
                                        value={utr}
                                        onChange={e => setUtr(e.target.value)}
                                        placeholder="e.g. 45671234567890 / UTR number"
                                        className="w-full border border-blue-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold h-12 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
                                >
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <>Submit for Verification<ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </form>
                        </motion.div>

                        {/* Email info */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                            className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                            <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-green-700 text-sm font-medium">Report delivery to: {session?.email}</p>
                                <p className="text-green-600 text-xs">Your full PDF report will be emailed automatically once your payment is verified.</p>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    /* SUBMITTED STATE */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                        <div className="bg-white border border-blue-100 rounded-3xl p-8 shadow-lg text-center">
                            <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 0.6, type: "spring" }}
                                className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl"
                            >
                                <Clock className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Submitted for Verification</h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 text-left">
                                <p className="text-blue-700 text-sm">
                                    Your payment is under verification. Once verified, your full 100% assessment PDF report will be automatically sent to <strong>{session?.email}</strong>.
                                </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 text-left">
                                <p className="text-amber-700 text-xs font-semibold mb-1">Submitted Reference ID</p>
                                <p className="font-mono text-amber-800 font-bold">{existingPayment?.utrNumber}</p>
                                <p className="text-amber-600 text-xs mt-1">Status: Pending Verification</p>
                            </div>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="mt-6 w-full bg-gradient-to-r from-primary to-accent text-white font-semibold h-12 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                            >
                                Go to My Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-slate-400 mt-3">Your dashboard will unlock the full report automatically once verified — no refresh needed.</p>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
