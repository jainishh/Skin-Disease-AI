import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Scan, LayoutDashboard, Stethoscope, LogOut, Shield, Bell, Mic, MicOff, Sparkles, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "gu", label: "ગુજ" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "💧 Keep skin moisturized tonight!",
    "🔍 Recheck skin conditions in 30 days.",
    "☀️ UV index is high — apply SPF 30+ sunscreen.",
  ]);
  const [isListening, setIsListening] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  useEffect(() => {
    const appts = localStorage.getItem("appointments");
    if (appts) {
      const parsed = JSON.parse(appts);
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        setNotifications((prev) => [
          `📅 Visit: ${latest.providerName} on ${latest.date}`,
          ...prev.filter((n) => !n.startsWith("📅")),
        ]);
      }
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check active state
  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  // Voice Assistant
  function startVoiceAssistant() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input not supported. Try Chrome.");
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
      if (cmd.includes("scan") || cmd.includes("upload")) {
        dest = "/upload";
        reply = "Opening skin scan";
      }
      else if (cmd.includes("dashboard") || cmd.includes("history")) {
        dest = "/dashboard";
        reply = "Opening dashboard";
      }
      else if (cmd.includes("doctor") || cmd.includes("clinic")) {
        dest = "/doctors";
        reply = "Finding dermatologists";
      }
      else if (cmd.includes("logout")) {
        logout();
        navigate("/login");
        return;
      }
      else {
        reply = "Say: scan, dashboard, doctors, or logout";
      }

      const utt = new SpeechSynthesisUtterance(reply);
      utt.lang = rec.lang;
      window.speechSynthesis.speak(utt);
      if (dest) navigate(dest);
    };
    rec.start();
  }

  const navLinks = [
    { to: "/upload", icon: <Scan size={14} />, label: "Analyze" },
    { to: "/dashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard" },
    { to: "/doctors", icon: <Stethoscope size={14} />, label: "Doctors" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? "border-b border-slate-100/80 dark:border-[#334155]/80 shadow-[0_4px_20px_rgba(240,242,245,0.6)] dark:shadow-none"
        : "border-b border-transparent"
        }`}
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.92)"
          : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.jpg" alt="Darma AI Logo" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" />
          <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-[#F8FAFC] group-hover:text-blue-600 transition">
            Darma AI
          </span>
        </Link>

        {/* Desktop NavLinks */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 rounded-full px-4.5 py-2 text-xs font-semibold transition-all duration-200 ${active
                  ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/35 dark:border-blue-900/35"
                  : "text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B] hover:text-slate-800 dark:hover:text-[#F8FAFC]"
                  }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-full px-4.5 py-2 text-xs font-semibold transition-all duration-200 ${isActive("/admin")
                ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border border-rose-100/35 dark:border-rose-900/35"
                : "text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/10"
                }`}
            >
              <Shield size={14} /> Admin
            </Link>
          )}
        </nav>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2">

          {/* Voice Command (Desktop Only) */}
          <button
            onClick={startVoiceAssistant}
            title="Voice Commands"
            className={`hidden md:inline-flex rounded-full p-2 border transition-all ${isListening
              ? "bg-rose-500 text-white border-rose-400 animate-pulse shadow-md shadow-rose-500/20"
              : "bg-slate-50 dark:bg-[#1E293B] border-slate-100 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] hover:text-slate-700 dark:hover:text-[#F8FAFC]"
              }`}
          >
            {isListening ? <Mic size={14} /> : <MicOff size={14} />}
          </button>


          {/* Notifications Dropdown (Desktop Only) */}
          <div className="hidden md:block relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="rounded-full p-2 border border-slate-100 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] hover:text-slate-700 dark:hover:text-[#F8FAFC] transition relative"
            >
              <Bell size={14} />
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-slate-50 dark:ring-[#0F172A]" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-[#1E293B]/95 border border-slate-100 dark:border-[#334155] rounded-2xl p-4 shadow-xl dark:shadow-none backdrop-blur-md z-50"
                >
                  <div className="flex justify-between items-center border-b border-slate-50 dark:border-[#334155]/30 pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">Alert Center</span>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[9px] text-rose-500 hover:underline font-bold uppercase tracking-wider"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-2xs text-slate-400 py-3 text-center font-medium">All notifications cleared 🌿</p>
                    ) : (
                      notifications.map((note, i) => (
                        <div
                          key={i}
                          className="text-2xs text-slate-650 dark:text-[#CBD5E1] leading-snug py-2 border-b border-slate-50/50 dark:border-[#334155]/30 last:border-0"
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

          {/* Language selection panel (Desktop Only) */}
          <div className="hidden md:flex border border-slate-100 bg-slate-50 p-0.5 rounded-full text-[10px] font-semibold text-slate-400">
            {LANGS.map((l) => {
              const active = i18n.language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => i18n.changeLanguage(l.code)}
                  className={`px-2.5 py-1.5 rounded-full transition-all ${active
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "hover:text-slate-600"
                    }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>

          {/* User Sign out / Register (Desktop Only) */}
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="hidden md:flex items-center gap-1.5 rounded-full px-4.5 py-2 text-xs font-semibold text-slate-600 border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all shadow-2xs"
            >
              <LogOut size={13} /> Log Out
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-block rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs px-5 py-2 transition shadow-md shadow-blue-500/10"
            >
              Log In
            </Link>
          )}

          {/* Mobile Menu Action Toggle (Mobile Only) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 border border-slate-100 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#273449] hover:text-slate-700 dark:hover:text-[#F8FAFC] md:hidden transition"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
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
            className="border-t border-slate-100 dark:border-[#334155] bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md md:hidden overflow-hidden"
          >
            <div className="flex flex-col px-6 py-5 gap-3.5">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-2xl px-4.5 py-3.5 text-xs font-semibold transition-all ${active
                      ? "bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 border border-blue-100/35 dark:border-blue-900/35"
                      : "text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B]"
                      }`}
                  >
                    {link.icon} {link.label}
                  </Link>
                );
              })}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-2xl px-4.5 py-3.5 text-xs font-semibold transition-all ${isActive("/admin")
                    ? "bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 border border-rose-100/35 dark:border-rose-900/35"
                    : "text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/10"
                    }`}
                >
                  <Shield size={14} /> Admin Dashboard
                </Link>
              )}

              <hr className="border-slate-100 dark:border-[#334155]/30 my-1" />

              {/* Mobile controls section */}
              <div className="flex flex-col gap-3">

                {/* Voice assistant */}
                <button
                  onClick={() => {
                    startVoiceAssistant();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-semibold border transition-all ${isListening
                    ? "bg-rose-500 text-white border-rose-400 animate-pulse shadow-md"
                    : "bg-slate-50 dark:bg-[#1E293B] border-slate-100 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1]"
                    }`}
                >
                  {isListening ? <Mic size={14} className="animate-bounce" /> : <MicOff size={14} />}
                  Voice Assistant Command
                </button>

                {/* Mobile Language selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-1">Language / भाषा / ભાષા</span>
                  <div className="flex border border-slate-100 dark:border-[#334155] bg-slate-50 dark:bg-[#0B1220] p-1 rounded-2xl text-xs font-semibold text-slate-400">
                    {LANGS.map((l) => {
                      const active = i18n.language === l.code;
                      return (
                        <button
                          key={l.code}
                          onClick={() => {
                            i18n.changeLanguage(l.code);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex-1 px-3 py-2.5 rounded-xl transition-all ${active
                            ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                            : "hover:text-slate-650"
                            }`}
                        >
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Notification Alert logs */}
                {notifications.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">System Alerts</span>
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[9px] text-rose-500 hover:underline font-bold uppercase tracking-wider"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#0B1220]/50 border border-slate-100 dark:border-[#334155]/55 rounded-2xl p-3.5 space-y-2 max-h-36 overflow-y-auto">
                      {notifications.map((note, i) => (
                        <div key={i} className="text-[10px] text-slate-600 dark:text-[#CBD5E1] leading-snug py-1 border-b border-slate-100/50 dark:border-[#334155]/20 last:border-0">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Auth Sign out / Log In */}
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-rose-500 border border-rose-100 dark:border-rose-950/30 bg-rose-50/50 dark:bg-rose-950/10 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-3.5 transition shadow-md shadow-blue-500/10"
                  >
                    Log In
                  </Link>
                )}

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
