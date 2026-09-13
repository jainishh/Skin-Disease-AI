import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  Clock, 
  Video, 
  FileText, 
  Cpu, 
  Bell, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  ShieldCheck, 
  Activity, 
  User,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function DoctorPortal() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState(user?.email || "");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  }

  return (
    <div className="relative min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)] font-sans overflow-x-hidden transition-colors duration-200 py-8 px-6">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--brand-primary)]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--brand-secondary)]/10 blur-[100px] pointer-events-none" />

      {/* Top Controls Navigation Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 border-b border-[var(--brand-border)] mb-10 relative z-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-md group-hover:scale-105 transition">
            <Stethoscope size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[var(--brand-text)]">DermaScan AI</span>
            <span className="text-[10px] font-bold text-[var(--brand-secondary)] uppercase">Clinical Doctor Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            title="Edit My Profile"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-xs font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition cursor-pointer"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <User size={14} className="text-[var(--brand-primary)]" />
            )}
            <span>Dr. {user?.full_name || "Specialist"}</span>
            <span className="ml-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold uppercase">Doctor</span>
          </Link>

          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="p-2.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)] transition cursor-pointer"
          >
            {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-emerald-500" />}
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Hero Container */}
      <main className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        
        {/* Status Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
        >
          <Sparkles size={14} className="animate-spin" />
          <span>Doctor Specialist Dashboard</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4 max-w-3xl mx-auto"
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--brand-text)] leading-tight">
            Advanced <span className="bg-gradient-to-r from-[var(--brand-primary)] via-emerald-400 to-[var(--brand-secondary)] bg-clip-text text-transparent">Dermatologist Workstation</span> is Under Construction 🚀
          </h1>
          <p className="text-[var(--brand-text-muted)] text-sm sm:text-base leading-relaxed font-normal max-w-2xl mx-auto">
            Welcome, <strong>Dr. {user?.full_name || "Doctor"}</strong>! We are currently tailoring the Patient AI Lesion Suite first. Your dedicated clinical workspace with tele-dermatology, EHR sync, and AI co-pilot tools will launch in the upcoming release.
          </p>
        </motion.div>

        {/* Feature Roadmap Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-4"
        >
          {[
            {
              icon: Video,
              title: "HD Tele-Consultation",
              desc: "Encrypted video visits with live lesion annotation & snapshot capture.",
              color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
            },
            {
              icon: Cpu,
              title: "AI Co-Pilot Assistant",
              desc: "Pixel-level Grad-CAM heatmaps & multi-class differential diagnosis.",
              color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
            },
            {
              icon: FileText,
              title: "EHR & E-Prescriptions",
              desc: "Instant digital RX generation & seamless hospital record integrations.",
              color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
            },
            {
              icon: Activity,
              title: "Patient Queue Triage",
              desc: "Automated risk grading to prioritize urgent carcinoma & melanoma cases.",
              color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-md backdrop-blur-md space-y-3 hover:border-[var(--brand-primary)] hover:-translate-y-1 transition duration-300"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                <item.icon size={20} />
              </div>
              <h4 className="font-bold text-sm text-[var(--brand-text)]">{item.title}</h4>
              <p className="text-xs text-[var(--brand-text-muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Email Notification Subscription Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-xl mx-auto p-6 rounded-3xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-xl backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
            <Bell size={16} /> Get Early Clinical Access
          </div>
          <h3 className="text-lg font-bold text-[var(--brand-text)]">
            Be the first doctor to try our Clinical Workstation
          </h3>
          <p className="text-xs text-[var(--brand-text-muted)]">
            Enter your doctor email below to receive instant access when the Doctor Portal goes live.
          </p>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Thank you, Dr. {user?.full_name || ""}! You are subscribed for early clinical launch updates.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Doctor email address..."
                  className="flex-1 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-bg)] px-4 py-3 text-xs outline-none focus:border-[var(--brand-primary)] text-[var(--brand-text)]"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Notify Me</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>

      </main>
    </div>
  );
}
