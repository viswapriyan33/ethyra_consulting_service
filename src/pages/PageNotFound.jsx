import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a17e06edbff878f7a211934/217e87b0f_Screenshot2026-05-25073529.png";

export default function PageNotFound() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2254] to-[#0a1628] flex flex-col items-center justify-center p-4 text-white">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <img src={LOGO} alt="ETHYRA" className="h-16 mx-auto mb-6" style={{ mixBlendMode: "screen" }} />
                <h1 className="text-8xl font-black text-accent mb-4">404</h1>
                <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
                <p className="text-slate-400 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 border border-white/20 text-white px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm">
                        <ArrowLeft className="w-4 h-4" />Go Back
                    </button>
                    <button onClick={() => navigate("/")} className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm">
                        <Home className="w-4 h-4" />Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
