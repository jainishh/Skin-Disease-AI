import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Home,
  Scan, 
  LayoutDashboard, 
  Stethoscope, 
  LogOut, 
  Shield, 
  Bell, 
  Mic, 
  MicOff, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Sparkles,
  ChevronRight,
  User,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import ProfileModal from "./ProfileModal";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "gu", label: "ગુજ" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "💧 Keep skin moisturized tonight — humidity index low.",
    "🔍 Routine check recommended: 30-day lesion inspection.",
    "☀️ High UV Index detected — apply SPF 30+ broad spectrum.",
  ]);
  const [isListening, setIsListening] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load appointments notifications
  useEffect(() => {
    const appts = localStorage.getItem("appointments");
    if (appts) {
      try {
        const parsed = JSON.parse(appts);
        if (parsed.length > 0) {
          const latest = parsed[parsed.length - 1];
          setNotifications((prev) => [
            `📅 Confirmed Visit: ${latest.providerName} on ${latest.date}`,
            ...prev.filter((n) => !n.startsWith("📅")),
          ]);
        }
      } catch (e) {
        console.error("Failed to parse appointments:", e);
      }
    }
  }, []);

  // Track scroll position for dynamic glassmorphic elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  // Voice command assistant
  function startVoiceAssistant() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input not supported in this browser. Please try Google Chrome.");
      return;
    }
    const rec = new SR();
    rec.lang = i18n.language === "hi" ? "hi-IN" : i18n.language === "gu" ? "gu-IN" : "en-US";
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (event: any) => {
      const cmd = event.results[0][0].transcript.toLowerCase();
      let dest = "";
      let reply = "";
      if (cmd.includes("scan") || cmd.includes("upload") || cmd.includes("analyze")) {
        dest = "/upload";
        reply = "Opening lesion analysis scan";
      } else if (cmd.includes("dashboard") || cmd.includes("history") || cmd.includes("record")) {
        dest = "/dashboard";
        reply = "Navigating to clinical dashboard";
      } else if (cmd.includes("doctor") || cmd.includes("clinic") || cmd.includes("hospital")) {
        dest = "/doctors";
        reply = "Finding certified dermatologists";
      } else if (cmd.includes("logout") || cmd.includes("sign out")) {
        logout();
        navigate("/login");
        return;
      } else {
        reply = "Voice command recognized. Say 'scan', 'dashboard', or 'doctors'.";
      }

      const utt = new SpeechSynthesisUtterance(reply);
      utt.lang = rec.lang;
      window.speechSynthesis.speak(utt);
      if (dest) navigate(dest);
    };
    rec.start();
  }

  const navLinks = [
    { to: "/", icon: <Home size={15} />, label: "Home" },
    { to: "/upload", icon: <Scan size={15} />, label: "Scan & Analyze" },
    { to: "/dashboard", icon: <LayoutDashboard size={15} />, label: "Dashboard" },
    { to: "/doctors", icon: <Stethoscope size={15} />, label: "Find Doctors" },
  ];

  const isGuestUpload = location.pathname === "/upload" && (new URLSearchParams(location.search).get("guest") === "true" || !user);
  const hideNavbar = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/doctor-portal" || isGuestUpload;

  if (hideNavbar) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--brand-border)] bg-[var(--brand-bg)]/90 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-[var(--brand-bg)]/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        
        {/* Brand Logo & Medical Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Stethoscope size={20} className="text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--brand-success)] ring-2 ring-[var(--brand-bg)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-[var(--brand-text)] group-hover:text-[var(--brand-primary)] transition">
              DermaScan AI
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--brand-secondary)]">
              Clinical Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-full p-1 border border-[var(--brand-border)] bg-[var(--brand-surface)]/60 backdrop-blur-sm">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)]"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2">

          {/* Voice Assistant Trigger */}
          <button
            onClick={startVoiceAssistant}
            title={isListening ? "Listening... click to stop" : "Clinical Voice Commands"}
            className={`hidden md:inline-flex rounded-full p-2 border transition-all duration-200 ${
              isListening
                ? "bg-[var(--brand-error)] text-white border-[var(--brand-error)] animate-pulse shadow-md"
                : "border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] hover:border-[var(--brand-primary)]"
            }`}
          >
            {isListening ? <Mic size={16} /> : <MicOff size={16} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="hidden md:block relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Clinical Alerts & Notifications"
              className="rounded-full p-2 border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] hover:border-[var(--brand-primary)] transition relative"
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--brand-primary)] ring-2 ring-[var(--brand-surface)]" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 shadow-xl backdrop-blur-xl z-50"
                >
                  <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-2.5 mb-2.5">
                    <span className="text-xs font-bold text-[var(--brand-text)] flex items-center gap-1.5">
                      <Bell size={13} className="text-[var(--brand-primary)]" /> Clinical Alert Center
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[10px] font-bold text-[var(--brand-text-muted)] hover:text-[var(--brand-error)] transition uppercase"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[var(--brand-text-muted)] py-4 text-center">
                        All clinical notifications cleared ✨
                      </p>
                    ) : (
                      notifications.map((note, i) => (
                        <div
                          key={i}
                          className="text-xs text-[var(--brand-text)] leading-relaxed p-2.5 rounded-xl bg-[var(--brand-bg)] border border-[var(--brand-border)]"
                        >
                          {note}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Switcher Toggle (Dark Mode / Light Mode) */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
            className="rounded-full p-2 border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all duration-200"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={16} className="text-[var(--brand-warning)]" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={16} className="text-[var(--brand-primary)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Multilingual Selector */}
          <div className="hidden md:flex items-center border border-[var(--brand-border)] bg-[var(--brand-surface)] p-1 rounded-full text-[11px] font-semibold text-[var(--brand-text-muted)]">
            {LANGS.map((l) => {
              const active = i18n.language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => i18n.changeLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-full transition-all duration-150 ${
                    active
                      ? "bg-[var(--brand-primary)] text-white shadow-sm font-bold"
                      : "hover:text-[var(--brand-text)]"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>

          {/* Profile Circle & Dropdown Popup */}
          {user ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setShowProfileModal(!showProfileModal)}
                title="View Profile Information"
                className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-bold text-sm shadow-sm ring-2 ring-transparent hover:ring-[var(--brand-primary)] transition-all overflow-hidden cursor-pointer"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                ) : (
                  <span>{user.full_name ? user.full_name.charAt(0).toUpperCase() : "P"}</span>
                )}
              </button>

              <AnimatePresence>
                {showProfileModal && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-72 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-2xl backdrop-blur-xl z-50"
                  >
                    <div className="flex items-center gap-3 border-b border-[var(--brand-border)] pb-4 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-bold text-lg shadow-sm overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}</span>
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-sm text-[var(--brand-text)] truncate">
                          {user.full_name}
                        </span>
                        <span className="text-xs text-[var(--brand-text-muted)] truncate">
                          {user.email}
                        </span>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] w-fit uppercase">
                          {user.role || "patient"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[var(--brand-text-muted)] mb-4">
                      <div className="flex justify-between py-1 border-b border-[var(--brand-border)]/50">
                        <span>Language:</span>
                        <span className="font-semibold text-[var(--brand-text)] uppercase">{user.preferred_language || "en"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--brand-border)]/50">
                        <span>Account Status:</span>
                        <span className="font-semibold text-[var(--brand-success)] flex items-center gap-1">
                          <Check size={12} /> Verified
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileModal(false)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition cursor-pointer shadow-xs"
                      >
                        <User size={14} /> My Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setShowProfileModal(false)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] transition"
                      >
                        <LayoutDashboard size={14} /> My Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                          logout();
                          navigate("/");
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-[var(--brand-error)] bg-[var(--brand-error)]/10 hover:bg-[var(--brand-error)]/20 transition cursor-pointer"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}

          {/* Mobile Menu Action Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-full p-2 border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] transition"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-5 overflow-hidden shadow-lg"
          >
            <div className="space-y-2">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[var(--brand-primary)] text-white"
                        : "text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {link.icon} {link.label}
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Controls & Actions */}
            <div className="mt-5 pt-5 border-t border-[var(--brand-border)] space-y-4">
              {/* Theme toggle option */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--brand-text)]">Theme Mode</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 border border-[var(--brand-border)] bg-[var(--brand-bg)] text-xs font-medium text-[var(--brand-text)]"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={14} className="text-[var(--brand-warning)]" /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon size={14} className="text-[var(--brand-primary)]" /> Dark Mode
                    </>
                  )}
                </button>
              </div>

              {/* Language selection in mobile */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--brand-text)]">Language</span>
                <div className="flex items-center gap-1">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => i18n.changeLanguage(l.code)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        i18n.language === l.code
                          ? "bg-[var(--brand-primary)] text-white"
                          : "text-[var(--brand-text-muted)] bg-[var(--brand-bg)] border border-[var(--brand-border)]"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Actions in mobile */}
              {user && (
                <div className="pt-2 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition cursor-pointer"
                  >
                    <User size={14} /> My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold border border-[var(--brand-error)] text-[var(--brand-error)] hover:bg-[var(--brand-error)]/10 transition cursor-pointer"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
