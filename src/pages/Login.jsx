import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User, Building2, Phone, Mail, ArrowRight, Loader2,
    ShieldCheck, Globe, AtSign, PhoneCall, CheckCircle2
} from "lucide-react";
import { loginAdmin, loginUser, validateEmail, validatePhone } from "../utils/authUtils";
import { UserProfileDB } from "../utils/db";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

// ---------- Admin Login Form ----------
function AdminLoginForm({ onBack }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        await new Promise(r => setTimeout(r, 600));
        const result = loginAdmin(form.email, form.password);
        if (result.success) {
            navigate("/admin/dashboard");
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Admin Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="admin@ethyra.in"
                        className="w-full pl-10 pr-4 bg-white/10 border border-white/30 text-white placeholder:text-slate-400 focus:border-accent focus:bg-white/15 h-11 rounded-xl outline-none transition-all"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
                <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input
                        type="password"
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 bg-white/10 border border-white/30 text-white placeholder:text-slate-400 focus:border-accent focus:bg-white/15 h-11 rounded-xl outline-none transition-all"
                        required
                    />
                </div>
            </div>
            {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm">{error}</div>
            )}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold h-12 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <><ShieldCheck className="w-4 h-4" />Sign In as Admin</>}
            </button>
            <button type="button" onClick={onBack} className="w-full text-slate-400 hover:text-white text-sm transition-colors py-1">
                ← Back to Registration
            </button>
        </form>
    );
}

// ---------- User Login Form ----------
function UserLoginForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: "", organizationName: "", phone: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!validateEmail(form.email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        await new Promise(r => setTimeout(r, 800));

        try {
            let user = UserProfileDB.findByEmail(form.email);

            if (user) {
                // Returning user
                loginUser(user);
                navigate("/terms");
            } else {
                // New user — validate all fields
                if (!form.fullName.trim()) { setError("Full name is required."); setLoading(false); return; }
                if (!form.organizationName.trim()) { setError("Organization name is required."); setLoading(false); return; }
                if (!validatePhone(form.phone)) { setError("Enter a valid 10-digit phone number."); setLoading(false); return; }

                user = UserProfileDB.create({
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    organizationName: form.organizationName.trim(),
                    sessionStarted: true,
                    sessionCompleted: false,
                    emailVerified: false,
                    phoneVerified: false,
                    termsAccepted: false,
                });
                loginUser(user);
                navigate("/terms");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    const fields = [
        { key: "fullName", label: "Full Name", icon: User, placeholder: "Contact person's full name", type: "text" },
        { key: "organizationName", label: "Organization Name", icon: Building2, placeholder: "NGO / Organization name", type: "text" },
        { key: "phone", label: "Phone Number", icon: Phone, placeholder: "10-digit mobile number", type: "tel", maxLength: 10 },
        { key: "email", label: "Email Address", icon: Mail, placeholder: "your@email.com", type: "email" },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, icon: Icon, placeholder, type, maxLength }) => (
                <div key={key}>
                    <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
                    <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                        <input
                            type={type}
                            value={form[key]}
                            maxLength={maxLength}
                            onChange={e => {
                                let val = e.target.value;
                                if (key === "phone") val = val.replace(/\D/g, "").slice(0, 10);
                                setForm(p => ({ ...p, [key]: val }));
                            }}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-4 bg-white/10 border border-white/30 text-white placeholder:text-slate-400 focus:border-accent focus:bg-white/15 h-11 rounded-xl outline-none transition-all"
                        />
                    </div>
                </div>
            ))}
            {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm">{error}</div>
            )}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold h-12 rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <>Get Started<ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-center text-xs text-slate-400">Returning user? Just enter your email to continue</p>
        </form>
    );
}

// ---------- Login Tabs ----------
function LoginTabs() {
    const [showAdmin, setShowAdmin] = useState(false);
    return (
        <div>
            {showAdmin ? (
                <AdminLoginForm onBack={() => setShowAdmin(false)} />
            ) : (
                <>
                    <UserLoginForm />
                    <div className="mt-6 pt-5 border-t border-white/15">
                        <button
                            onClick={() => setShowAdmin(true)}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl h-10 flex items-center justify-center gap-2 text-sm transition-all"
                        >
                            <ShieldCheck className="w-4 h-4" />Admin Login
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-2">Restricted access for ETHYRA administrators only</p>
                    </div>
                </>
            )}
        </div>
    );
}

// ---------- Main Login Page ----------
export default function Login() {
    const features = [
        "61-Question Comprehensive Assessment",
        "6 Critical Compliance Sections",
        "Instant Score & Rating",
        "Premium PDF Report Delivery",
        "Enterprise-Grade Analytics",
    ];

    const contactInfo = [
        { label: "WEB", value: "explore.ethyra.in", icon: Globe },
        { label: "EMAIL", value: "connect@ethyra.in", icon: AtSign },
        { label: "PHONE", value: "+91 8190909808", icon: PhoneCall },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* LEFT PANEL */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a1628] via-[#0d2254] to-[#0a1628] relative overflow-hidden flex-col items-center justify-center p-12">
                {/* Animated blobs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 right-10 w-64 h-64 rounded-full bg-accent/15 blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-primary/20 blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center w-96 h-96 mx-auto my-auto rounded-full bg-blue-600/10 blur-3xl"
                />

                <div className="relative z-10 max-w-md text-center">
                    <img src={LOGO} alt="ETHYRA" className="h-20 mx-auto mb-6 drop-shadow-2xl" style={{ mixBlendMode: "screen" }} />
                    <h1 className="text-4xl font-extrabold text-white mb-2">NGO Readiness</h1>
                    <h2 className="text-2xl font-semibold text-accent mb-4">Assessment Platform</h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
                    <p className="text-slate-300 text-sm leading-relaxed mb-8">
                        Professional due diligence assessments for NGOs seeking CSR partnerships and institutional funding.
                    </p>

                    <div className="space-y-3 text-left">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-accent" />
                                </div>
                                <span className="text-slate-200 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-10 pt-6 border-t border-white/10">
                        {contactInfo.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="text-center">
                                <Icon className="w-4 h-4 text-accent mx-auto mb-1" />
                                <p className="text-xs text-slate-400">{label}</p>
                                <p className="text-xs text-white font-medium break-all">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 bg-gradient-to-br from-primary via-blue-950 to-slate-950 relative overflow-hidden flex items-center justify-center p-6">
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 60, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 blur-3xl"
                />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <img src={LOGO} alt="ETHYRA" className="h-14 mx-auto mb-3" style={{ mixBlendMode: "screen" }} />
                        <h1 className="text-3xl font-bold text-white">ETHYRA</h1>
                        <p className="text-accent text-sm">NGO Readiness Assessment Platform</p>
                    </div>

                    {/* Glass Card */}
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-1">Get Started</h2>
                        <p className="text-slate-400 text-sm mb-6">Register your NGO for assessment</p>
                        <LoginTabs />
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-4">Secure • Encrypted • Professional</p>
                </motion.div>
            </div>
        </div>
    );
}
