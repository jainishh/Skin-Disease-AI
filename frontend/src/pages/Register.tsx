import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { UserPlus, Sparkles, User, Mail, Lock, Eye, EyeOff, ArrowLeft, Sun, Moon } from "lucide-react";

export default function Register() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const userObj = await register(fullName, email, password, i18n.language || "en", role);
      if (userObj?.role === "doctor" || role === "doctor") {
        navigate("/doctor-portal");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("auth.register_error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-8 overflow-hidden font-body text-[var(--brand-text)]">
      
      {/* Top Controls Header Bar */}
      <div className="w-full max-w-lg flex items-center justify-between py-3 mb-4 z-20">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-xs font-semibold text-[var(--brand-text)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition shadow-xs cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)] transition cursor-pointer"
        >
          {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-emerald-500" />}
        </button>
      </div>

      {/* Immersive Glowing Backdrop Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[var(--brand-primary)]/10 blur-[80px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-[var(--brand-secondary)]/10 blur-[90px] pointer-events-none animate-pulse duration-[8000ms]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-[2.5rem] border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-8 shadow-xl backdrop-blur-md font-body text-[var(--brand-text)]"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="text-[var(--brand-primary)]" size={24} />
          <h1 className="text-2xl font-bold tracking-tight text-[var(--brand-text)] flex items-center gap-1.5">
            {t("auth.register_title")} <Sparkles size={16} className="text-[var(--brand-secondary)] animate-pulse" />
          </h1>
        </div>
        <p className="text-xs text-[var(--brand-text-muted)] mt-1">{t("auth.register_subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          {/* First Name & Last Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">First Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-4 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">Last Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-4 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">{t("auth.email")}</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email_placeholder")}
                className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-4 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] transition"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`py-3 px-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  role === "patient"
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] shadow-xs"
                    : "border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]"
                }`}
              >
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`py-3 px-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  role === "doctor"
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] shadow-xs"
                    : "border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]"
                }`}
              >
                <span>Doctor</span>
              </button>
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">{t("auth.password")}</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars"
                  className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-10 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] hover:text-[var(--brand-primary)] transition p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-10 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] transition"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-[var(--brand-error)] mt-2">⚠️ {error}</p>}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] py-3.5 font-bold text-white shadow-md disabled:opacity-50 transition-all duration-200 mt-5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t("auth.creating_account")}</span>
              </>
            ) : (
              <span>{t("auth.register_button")}</span>
            )}
          </motion.button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--brand-border)] text-center text-xs text-[var(--brand-text-muted)]">
          {t("auth.have_account")}{" "}
          <Link to="/login" className="font-semibold text-[var(--brand-primary)] hover:underline">
            {t("auth.login_here")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
