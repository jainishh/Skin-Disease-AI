import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Scan, 
  Activity, 
  Sparkles, 
  ArrowUpRight, 
  ChevronRight,
  BrainCircuit,
  MapPin,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)] font-sans overflow-x-hidden transition-colors duration-200">
      


      {/* Top Right Theme Toggle Button Only */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
          className="rounded-full p-3 border border-[var(--brand-border)] bg-[var(--brand-surface)]/80 backdrop-blur-md text-[var(--brand-text)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] shadow-lg transition-all duration-200"
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-[var(--brand-warning)]" />
          ) : (
            <Moon size={18} className="text-[var(--brand-primary)]" />
          )}
        </button>
      </div>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* Banner Announcement Tag */}
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-4">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          >
            <Sparkles size={14} className="animate-spin" />
            <span>AI-POWERED CLINICAL DERMATOLOGY PLATFORM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--brand-text)] leading-tight"
          >
            Instant AI Skin Lesion Detection & <span className="bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-emerald-400 bg-clip-text text-transparent">Clinical Care</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[var(--brand-text-muted)] text-base sm:text-lg leading-relaxed font-normal"
          >
            Upload a photo of any skin anomaly to receive instant neural-network triage, risk evaluation, localized doctor appointments, and personalized treatment recommendations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-4 pt-2"
          >
            {user ? (
              <Link
                to={user.role === "doctor" ? "/doctor-portal" : "/dashboard"}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-sm hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <span>{user.role === "doctor" ? "Go to Doctor Portal" : "Go to Patient Dashboard"}</span>
                <ChevronRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to={user ? "/upload" : "/upload?guest=true"}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-sm hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  <Scan size={18} />
                  <span>Start Free AI Scan</span>
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold text-sm hover:border-[var(--brand-primary)] transition-all duration-300 backdrop-blur-md"
                >
                  <span>Portal Login</span>
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* 3D Floating Perspective Showcase Stage (Exact Money Dock Layout Adapted to Brand Palette) */}
        <div className="mt-16 relative flex justify-center items-center min-h-[460px] perspective-1000">
          
          {/* Left Angled Card - Patient Watchlist */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: 18, rotateZ: -6 }}
            animate={{ opacity: 1, x: 0, rotateY: 14, rotateZ: -4 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute left-6 sm:left-14 top-6 w-72 sm:w-80 rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-2xl backdrop-blur-xl z-10 hidden md:block hover:scale-105 transition-all duration-500 cursor-pointer"
          >
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-3 mb-3">
              <span className="text-xs font-bold tracking-wider text-[var(--brand-text-muted)] uppercase flex items-center gap-1.5">
                <Activity size={14} className="text-[var(--brand-primary)]" /> Patient Lesion Log
              </span>
              <span className="text-[10px] font-semibold bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] px-2 py-0.5 rounded-full">ACTIVE</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--brand-bg)] border border-[var(--brand-border)]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-xs">
                    NV
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--brand-text)]">Melanocytic Nevus</h4>
                    <p className="text-[10px] text-[var(--brand-text-muted)]">96.8% Confidence</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--brand-success)]">Mild</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--brand-bg)] border border-[var(--brand-border)]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[var(--brand-warning)]/10 text-[var(--brand-warning)] flex items-center justify-center font-bold text-xs">
                    SK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--brand-text)]">Seborrheic Keratosis</h4>
                    <p className="text-[10px] text-[var(--brand-text-muted)]">92.4% Confidence</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--brand-warning)]">Moderate</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--brand-bg)] border border-[var(--brand-border)]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[var(--brand-error)]/10 text-[var(--brand-error)] flex items-center justify-center font-bold text-xs">
                    BCC
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--brand-text)]">Basal Cell Carcinoma</h4>
                    <p className="text-[10px] text-[var(--brand-text-muted)]">89.1% Confidence</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--brand-error)]">Consult Doc</span>
              </div>
            </div>
          </motion.div>

          {/* Center Main Floating Card - Live Neural AI Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-sm sm:max-w-md rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-2xl backdrop-blur-2xl z-30 transition-all duration-300"
          >
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 flex items-center justify-center">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--brand-text)]">DERMA-NEURAL V4</h3>
                  <p className="text-[11px] text-[var(--brand-primary)] font-semibold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)] animate-ping" /> Real-time AI Engine
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[var(--brand-text)]">99.4%</span>
                <p className="text-[10px] text-[var(--brand-text-muted)] uppercase font-bold">Accuracy Index</p>
              </div>
            </div>

            {/* Neural Graph Graphic */}
            <div className="relative h-44 w-full rounded-2xl bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 overflow-hidden mb-4 flex flex-col justify-between">
              <div className="flex justify-between text-[11px] text-[var(--brand-text-muted)] font-semibold">
                <span>Diagnostic Waveform</span>
                <span className="text-[var(--brand-primary)]">Grad-CAM Active</span>
              </div>

              <svg className="w-full h-24 text-[var(--brand-primary)]" viewBox="0 0 300 80">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 60 Q 40 10, 80 40 T 160 20 T 240 50 T 300 15 L 300 80 L 0 80 Z"
                  fill="url(#grad)"
                />
                <path
                  d="M0 60 Q 40 10, 80 40 T 160 20 T 240 50 T 300 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>

              <div className="flex justify-between items-center text-[10px] text-[var(--brand-text-muted)] border-t border-[var(--brand-border)] pt-2">
                <span>Dermoscopic Layer</span>
                <span>Lesion Segmentation</span>
                <span className="text-[var(--brand-secondary)] font-bold">Status: Clear</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Link
                to={user ? "/upload" : "/upload?guest=true"}
                className="flex-1 py-3 text-center rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs transition-all shadow-md"
              >
                Scan My Lesion Now
              </Link>
              <Link
                to="/doctors"
                className="px-4 py-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-bg)] text-[var(--brand-text)] hover:border-[var(--brand-primary)] font-bold text-xs transition-all"
              >
                Find Specialists
              </Link>
            </div>
          </motion.div>

          {/* Right Angled Card - Doctor Directory */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -18, rotateZ: 6 }}
            animate={{ opacity: 1, x: 0, rotateY: -14, rotateZ: 4 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute right-6 sm:right-14 top-6 w-72 sm:w-80 rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-2xl backdrop-blur-xl z-10 hidden md:block hover:scale-105 transition-all duration-500 cursor-pointer"
          >
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-3 mb-3">
              <span className="text-xs font-bold tracking-wider text-[var(--brand-text-muted)] uppercase flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--brand-secondary)]" /> Verified Dermatologists
              </span>
              <span className="text-[10px] font-semibold bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)] px-2 py-0.5 rounded-full">NEARBY</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[var(--brand-bg)] border border-[var(--brand-border)] space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-[var(--brand-text)]">Dr. Ananya Sharma</h4>
                  <span className="text-[10px] font-bold text-amber-500">★ 4.9</span>
                </div>
                <p className="text-[10px] text-[var(--brand-text-muted)]">Skin Excellence Clinic • Bandra West</p>
                <div className="flex justify-between items-center pt-1 text-[10px]">
                  <span className="text-[var(--brand-success)] font-semibold">Available Today</span>
                  <span className="text-[var(--brand-text-muted)]">2.4 km away</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--brand-bg)] border border-[var(--brand-border)] space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-[var(--brand-text)]">Dr. Rajesh Mehta</h4>
                  <span className="text-[10px] font-bold text-amber-500">★ 4.8</span>
                </div>
                <p className="text-[10px] text-[var(--brand-text-muted)]">Derma Care Hospital • CG Road</p>
                <div className="flex justify-between items-center pt-1 text-[10px]">
                  <span className="text-[var(--brand-success)] font-semibold">Tomorrow at 10 AM</span>
                  <span className="text-[var(--brand-text-muted)]">3.1 km away</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </main>
    </div>
  );
}
