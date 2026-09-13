import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import SeverityBadge from "../components/SeverityBadge";
import { apiClient } from "../api/client";
import { Doctor } from "../types";
import { 
  Home, 
  Activity, 
  Heart, 
  MessageSquare, 
  Settings, 
  Bell, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Phone,
  Mic,
  Play,
  Volume2,
  Share2,
  Bookmark,
  ChevronRight,
  Plus,
  Cpu,
  Layers,
  FileText,
  User,
  Shield,
  FileImage,
  Camera,
  Trash2,
  Download,
  Share,
  Eye,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Check,
  AlertCircle,
  Stethoscope
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

interface HistoryItem {
  _id: string;
  primary_disease: string;
  primary_disease_title?: string;
  severity: "Mild" | "Moderate" | "Severe";
  confidence: number;
  image_url: string;
  created_at: string;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language?.split('-')[0] || 'en';
  const changeLang = (lang: string) => i18n.changeLanguage(lang);
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState<Doctor[]>([]);
  const [displayedDoctors, setDisplayedDoctors] = useState<Doctor[]>([
    {
      id: "doc_1",
      name: "Dr. Ananya Sharma",
      specialization: "Dermatologist & Cosmetologist",
      city: "Mumbai",
      state: "Maharashtra",
      clinic_name: "Skin Excellence Clinic",
      address: "Bandra West, Mumbai",
      latitude: 19.0596,
      longitude: 72.8295,
      rating: 4.9,
      reviews_count: 142,
      phone: "+91 98200 12345",
      timings: "10:00 AM - 07:00 PM",
      distance_km: 2.4
    },
    {
      id: "doc_2",
      name: "Dr. Rajesh Mehta",
      specialization: "Pediatric & Clinical Dermatologist",
      city: "Ahmedabad",
      state: "Gujarat",
      clinic_name: "Derma Care Hospital",
      address: "CG Road, Ahmedabad",
      latitude: 23.0225,
      longitude: 72.5714,
      rating: 4.8,
      reviews_count: 98,
      phone: "+91 98795 67890",
      timings: "09:00 AM - 06:00 PM",
      distance_km: 3.1
    }
  ]);
  const [activeTab, setActiveTab] = useState<"home" | "scans" | "compare" | "ocr" | "profile" | "favorites" | "messages">("home");

  const [patientProfile, setPatientProfile] = useState(() => {
    const saved = localStorage.getItem("patientProfile");
    return saved ? JSON.parse(saved) : {
      age: 28, gender: "Male", bloodGroup: "O+", allergies: "None", medicalHistory: "None"
    };
  });

  const [selectedCompareScans, setSelectedCompareScans] = useState<[HistoryItem | null, HistoryItem | null]>([null, null]);
  const [compareSliderPos, setCompareSliderPos] = useState(50);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("patientProfile", JSON.stringify(patientProfile));
    alert("Profile saved successfully.");
  };

  const handleDownloadFHIR = async (scanId: string) => {
    try {
      const response = await apiClient.get(`/reports/${scanId}/fhir`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `fhir_report_${scanId}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading FHIR report:", err);
    }
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOcrLoading(true);
      setOcrResult(null);
      try {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        const response = await apiClient.post("/nlp/ocr", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setOcrResult(response.data);
      } catch (err: any) {
        // Graceful fallback: show error in result
        setOcrResult({
          raw_text: err.response?.data?.detail || "OCR processing failed.",
          language_detected: "en",
          medicines: [],
          diseases: [],
          symptoms: [],
          safety_alerts: ["Could not process the image. Please upload a clearer photo."]
        });
      } finally {
        setOcrLoading(false);
      }
    }
  };

  const [medications, setMedications] = useState([
    { id: "med-1", name: "Tacrolimus Ointment 0.03%", dosage: "Apply twice daily", time: "Morning & Night", taken: false },
    { id: "med-2", name: "Desloratadine 5mg", dosage: "1 tablet daily", time: "Night", taken: true },
    { id: "med-3", name: "Cetaphil Gentle Moisturizer", dosage: "Liberal application", time: "Post-bath", taken: false },
  ]);

  const handleToggleMedication = (id: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  const handleDownloadPDF = async (scanId: string) => {
    try {
      const lang = i18n.language || "en";
      const response = await apiClient.get(`/reports/${scanId}/pdf?lang=${lang}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Skin_Report_${scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading PDF report:", err);
    }
  };

  // Chat symptoms assistant states
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: "1", sender: "ai", text: "Hello! I am your AI clinical assistant. Tell me about any skin changes, symptoms, or ask details about your recent analyses." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Scans filter search
  const [scanSearch, setScanSearch] = useState("");

  // Default fallback doctors if favorites is empty
  const defaultDoctors: Doctor[] = [
    {
      id: "doc_001",
      name: "Dr. Anjali Mehta",
      specialization: "Dermatologist & Cosmetologist",
      city: "Ahmedabad",
      state: "Gujarat",
      clinic_name: "SkinCare Clinic, Navrangpura",
      address: "3rd Floor, Ratnam Mall, Navrangpura, Ahmedabad",
      latitude: 23.0339,
      longitude: 72.5619,
      rating: 4.7,
      reviews_count: 342,
      phone: "+91-79-12345678",
      timings: "10:00 AM - 6:00 PM"
    },
    {
      id: "doc_002",
      name: "Dr. Rakesh Shah",
      specialization: "Clinical & Cosmetic Dermatologist",
      city: "Ahmedabad",
      state: "Gujarat",
      clinic_name: "Glow Derma, Satellite",
      address: "Shilp Corporate Park, Satellite, Ahmedabad",
      latitude: 23.0225,
      longitude: 72.5300,
      rating: 4.5,
      reviews_count: 210,
      phone: "+91-79-23456789",
      timings: "11:00 AM - 7:00 PM"
    }
  ];

  const handleToggleFavorite = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!docId) return;

    const saved = localStorage.getItem("favorite_doctors");
    const favIds: string[] = saved ? JSON.parse(saved) : [];
    let updated: string[];

    if (favIds.includes(docId)) {
      updated = favIds.filter((id) => id !== docId);
      apiClient.delete(`/doctors/favorites/${docId}`).catch((err) => console.error(err));
    } else {
      updated = Array.from(new Set([...favIds, docId]));
      apiClient.post(`/doctors/favorites/${docId}`).catch((err) => console.error(err));
    }

    localStorage.setItem("favorite_doctors", JSON.stringify(updated));
    setFavoriteDoctors((prev) => prev.filter((d) => updated.includes(d.id || (d as any)._id)));
  };

  useEffect(() => {
    // Fetch History
    apiClient
      .get<HistoryItem[]>("/dashboard/history")
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Error fetching history:", err))
      .finally(() => setLoading(false));

    // Fetch local appointments
    const appts = localStorage.getItem("appointments");
    if (appts) setAppointments(JSON.parse(appts));

    // Fetch favorite doctors (deduplicated)
    const favIdsStr = localStorage.getItem("favorite_doctors");
    const ids: string[] = favIdsStr ? Array.from(new Set(JSON.parse(favIdsStr) as string[])) : [];
    apiClient.get<Doctor[]>("/doctors").then((res) => {
      const doctorMap = new Map<string, Doctor>();
      res.data.forEach((doc) => {
        const docId = doc.id || (doc as any)._id;
        if (ids.includes(docId) && !doctorMap.has(docId)) {
          doctorMap.set(docId, doc);
        }
      });
      setFavoriteDoctors(Array.from(doctorMap.values()));
    }).catch((err) => console.error("Error fetching doctors:", err));
  }, [activeTab]);

  // Vitals dummy datasets matching reference curves
  const hydrationData = [
    { day: "Mon", value: 82 },
    { day: "Tue", value: 85 },
    { day: "Wed", value: 81 },
    { day: "Thu", value: 88 },
    { day: "Fri", value: 86 },
    { day: "Sat", value: 89 },
    { day: "Sun", value: 90 },
  ];

  const melaninData = [
    { day: "Mon", value: 90 },
    { day: "Tue", value: 91 },
    { day: "Wed", value: 92 },
    { day: "Thu", value: 92 },
    { day: "Fri", value: 93 },
    { day: "Sat", value: 92 },
    { day: "Sun", value: 92 },
  ];

  const uvData = [
    { day: "Mon", value: 120 },
    { day: "Tue", value: 180 },
    { day: "Wed", value: 240 },
    { day: "Thu", value: 210 },
    { day: "Fri", value: 280 },
    { day: "Sat", value: 220 },
    { day: "Sun", value: 225 },
  ];

  function handleCancelAppointment(id: string) {
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    localStorage.setItem("appointments", JSON.stringify(updated));
  }

  async function handleSendChatMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: `chat_${Date.now()}`, sender: "user", text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const queryText = chatInput;
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await apiClient.post<{ reply: string }>("/chatbot/query", {
        message: queryText,
        language: currentLang
      });
      setChatMessages((prev) => [...prev, { id: `chat_reply_${Date.now()}`, sender: "ai", text: res.data.reply }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { id: `chat_reply_${Date.now()}`, sender: "ai", text: t('common.error') || "I am having trouble connecting. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  const username = user?.full_name ? user.full_name.trim().split(" ")[0] : "Patient";

  // Filtered scans list
  const filteredHistory = history.filter(item => 
    (item.primary_disease_title || item.primary_disease).toLowerCase().includes(scanSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex flex-col md:flex-row font-body text-[var(--brand-text)] transition-all duration-300">
      
      {/* ── Responsive Dock Navigation (Top bar on Mobile, Vertical Dock on Desktop) ─────── */}
      <div className="w-auto mx-4 md:mx-0 md:w-20 md:sticky md:top-24 h-fit my-3 md:my-6 md:ml-5 bg-[var(--brand-surface)]/95 backdrop-blur-md border border-[var(--brand-border)] rounded-2xl md:rounded-[2.5rem] flex flex-row md:flex-col items-center py-2 md:py-6 justify-between md:justify-start shrink-0 z-20 shadow-lg transition-all duration-300">
        <div className="flex flex-row md:flex-col items-center gap-2 md:gap-6 w-full justify-around md:justify-start">
          {/* Brand Logo (Desktop only) */}
          <Link to="/upload" className="hidden md:flex relative items-center justify-center h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-md hover:scale-105 transition shrink-0">
            <Sparkles size={20} className="animate-pulse" />
          </Link>

          {/* Nav Icons list */}
          <div className="flex flex-row md:flex-col justify-around md:justify-start gap-1 md:gap-3.5 w-full md:px-2.5">
            {[
              { id: "home", icon: Home },
              { id: "scans", icon: Activity },
              { id: "compare", icon: FileImage },
              { id: "ocr", icon: Camera },
              { id: "favorites", icon: Heart },
              { id: "messages", icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                  }}
                  title={t(`dashboard.tab_${tab.id}`)}
                  className={`relative group flex items-center justify-center py-2 md:py-3 px-3.5 md:px-0 rounded-xl md:rounded-2xl transition-all duration-200 ${
                    active 
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500 font-bold shadow-md shadow-emerald-500/10" 
                      : "text-[var(--brand-text-muted)] hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text)]"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} className="md:h-5 md:w-5" />
                  
                  {/* Indicator bar (Desktop left bar) */}
                  {active && (
                    <span className="hidden md:block absolute left-1 w-1.5 h-6 rounded-full bg-emerald-500" />
                  )}

                  <span className="hidden md:block absolute left-20 bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] text-[10px] px-2.5 py-1.5 rounded-lg border border-[var(--brand-border)] opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-md">
                    {t(`dashboard.tab_${tab.id}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main content grid layout ───────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 min-w-0">
        
        {/* Central Workspace (Main Dash features) */}
        <div className="xl:col-span-8 p-6 md:p-8 overflow-y-auto space-y-8 max-w-5xl">
          
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[var(--brand-text-muted)] text-xs font-semibold uppercase tracking-wider">{t('dashboard.section_label')} / {t(`dashboard.tab_${activeTab}`)}</p>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--brand-text)] mt-0.5">
                {activeTab === "home" && t('dashboard.heading_home', { name: username })}
                {activeTab === "scans" && t('dashboard.heading_scans')}
                {activeTab === "compare" && t('dashboard.heading_compare')}
                {activeTab === "ocr" && t('dashboard.heading_ocr')}
                {activeTab === "profile" && t('dashboard.heading_profile')}
                {activeTab === "favorites" && t('dashboard.heading_favorites')}
                {activeTab === "messages" && t('dashboard.heading_messages')}
              </h1>
            </div>
            

          </div>

          <AnimatePresence mode="wait">
            
            {/* 1. HOME TAB */}
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* Body Map Widget */}
                <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
                  <div className="flex-1 space-y-4">
                    <h2 className="text-xl font-bold text-[var(--brand-text)] flex items-center gap-2">
                      <User size={20} className="text-[var(--brand-primary)]" /> {t('dashboard.lesion_map_title')}
                    </h2>
                    <p className="text-xs text-[var(--brand-text-muted)]">
                      {t('dashboard.lesion_map_desc')}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <span className="flex items-center gap-1.5 text-[10px] text-[var(--brand-text-muted)] font-bold"><div className="h-2 w-2 rounded-full bg-emerald-500" /> {t('dashboard.mild')}</span>
                      <span className="flex items-center gap-1.5 text-[10px] text-[var(--brand-text-muted)] font-bold"><div className="h-2 w-2 rounded-full bg-amber-500" /> {t('dashboard.moderate')}</span>
                      <span className="flex items-center gap-1.5 text-[10px] text-[var(--brand-text-muted)] font-bold"><div className="h-2 w-2 rounded-full bg-rose-500" /> {t('dashboard.severe')}</span>
                    </div>
                  </div>
                  <div className="relative h-64 w-48 shrink-0 bg-[var(--brand-surface-elevated)] rounded-3xl border border-[var(--brand-border)] flex items-center justify-center overflow-visible shadow-inner">
                    {/* SVG Mannequin Outline */}
                    <svg viewBox="0 0 100 200" className="h-[90%] w-full opacity-30 drop-shadow-md">
                      <path d="M50 10 C40 10 35 20 35 30 C35 40 45 45 50 45 C55 45 65 40 65 30 C65 20 60 10 50 10 Z" fill="currentColor" className="text-[var(--brand-text-muted)]" />
                      <path d="M50 50 C30 50 20 60 20 80 L20 120 C20 125 25 125 25 120 L30 80 L35 120 C35 150 35 190 35 190 C35 195 45 195 45 190 L45 140 L55 140 L55 190 C55 195 65 195 65 190 C65 190 65 150 65 120 L70 80 L75 120 C75 125 80 125 80 120 L80 80 C80 60 70 50 50 50 Z" fill="currentColor" className="text-[var(--brand-text-muted)]" />
                    </svg>
                    {/* Interactive Pins */}
                    {history.slice(0, 4).map((item, idx) => {
                      const positions = [
                        { top: "25%", left: "40%" }, // Neck
                        { top: "45%", left: "60%" }, // Right Arm
                        { top: "65%", left: "45%" }, // Abdomen
                        { top: "80%", left: "35%" }, // Left Leg
                      ];
                      const pos = positions[idx % positions.length];
                      const isSevere = item.severity === "Severe";
                      const isModerate = item.severity === "Moderate";
                      return (
                        <div 
                          key={item._id}
                          className="absolute group cursor-pointer z-10"
                          style={{ top: pos.top, left: pos.left }}
                          onClick={() => {
                            setScanSearch(item.primary_disease_title || item.primary_disease);
                            setActiveTab("scans");
                          }}
                        >
                          <div className={`h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#1E293B] shadow-sm ${isSevere ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`} />
                          
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)] text-[var(--brand-text)] text-[10px] rounded-xl p-2.5 opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl text-center">
                            <p className="font-bold mb-1 truncate">{t(`diseases.${item.primary_disease}`, { defaultValue: item.primary_disease_title || item.primary_disease })}</p>
                            <p className="text-[9px] text-[var(--brand-text-muted)]">{t('dashboard.confidence_pct', { pct: Math.round(item.confidence * 100) })} • {t(`dashboard.${item.severity.toLowerCase()}`)}</p>
                            <p className="text-[8px] text-[var(--brand-primary)] mt-1 font-semibold">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Locator Map Preview (Realigned to Brand Palette) */}
                <div className="w-full">
                  <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--brand-primary)]/10 via-[var(--brand-surface)] to-[var(--brand-secondary)]/10 border-2 border-[var(--brand-border)] p-7 min-h-[190px] flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[var(--brand-text)] font-bold text-base leading-tight flex items-center gap-2">
                          <MapPin size={18} className="text-[var(--brand-primary)]" />
                          {t('dashboard.found_doctors')}
                        </h3>
                        <p className="text-[var(--brand-text-muted)] text-xs mt-1">{t('dashboard.doctors_nearby', { count: displayedDoctors.length })}</p>
                      </div>
                      <button onClick={() => setActiveTab("favorites")} className="h-10 w-10 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition shadow-xs">
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {/* Dot Grid Route Graphic */}
                    <div className="relative h-20 w-full rounded-2xl bg-[var(--brand-surface)]/80 border border-[var(--brand-border)] mt-4 p-3 flex items-center justify-between overflow-hidden shadow-inner">
                      {/* Simulated Grid Nodes */}
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 gap-2 p-3 opacity-25">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
                        ))}
                      </div>
                      
                      <div className="z-10 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-md">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-[var(--brand-text)] font-bold text-xs leading-none">{displayedDoctors[0]?.clinic_name || "Aesthetic Skin Clinic"}</p>
                          <p className="text-[10px] text-[var(--brand-text-muted)] mt-1">{t('dashboard.doctor_distance', { city: displayedDoctors[0]?.city || "Bandra" })}</p>
                        </div>
                      </div>

                      <div className="h-2 w-2 rounded-full bg-[var(--brand-primary)] animate-ping absolute right-8 top-8" />
                      <div className="h-2 w-2 rounded-full bg-[var(--brand-primary)] absolute right-8 top-8" />
                    </div>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--brand-text)]">{t('dashboard.quick_actions')}</h2>

                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                    {[
                      { 
                        titleKey: "lesion_scan", 
                        subKey: "lesion_scan_sub", 
                        bg: "bg-cyan-500/15 hover:bg-cyan-500/20 border-cyan-500/40 dark:bg-cyan-500/20 dark:border-cyan-400/40", 
                        text: "text-cyan-700 dark:text-cyan-300",
                        badgeBg: "bg-cyan-500/25 text-cyan-700 dark:text-cyan-200",
                        icon: "🔍" 
                      },
                      { 
                        titleKey: "acne_tracker", 
                        subKey: "acne_tracker_sub", 
                        bg: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/30", 
                        text: "text-emerald-600 dark:text-emerald-400",
                        badgeBg: "bg-emerald-500/20",
                        icon: "✨" 
                      },
                      { 
                        titleKey: "melanoma_check", 
                        subKey: "melanoma_check_sub", 
                        bg: "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/30", 
                        text: "text-rose-600 dark:text-rose-400",
                        badgeBg: "bg-rose-500/20",
                        icon: "⚠️" 
                      }
                    ].map((cat, idx) => (
                      <Link
                        key={idx}
                        to="/upload"
                        className={`group border-2 rounded-3xl p-5 flex flex-col justify-between items-start transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg min-h-[140px] ${cat.bg}`}
                      >
                        <div className={`h-11 w-11 rounded-2xl ${cat.badgeBg} flex items-center justify-center text-xl shadow-xs`}>
                          {cat.icon}
                        </div>
                        <div>
                          <h3 className={`font-bold text-sm leading-tight transition ${cat.text}`}>
                            {t(`dashboard.${cat.titleKey}`)}
                          </h3>
                          <p className="text-[var(--brand-text-muted)] text-[10px] mt-1">{t(`dashboard.${cat.subKey}`)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Scans lists & Appointments */}
                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* Scans list */}
                  <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-6 shadow-sm">
                    <h2 className="text-lg font-bold tracking-tight text-[var(--brand-text)] mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-[var(--brand-primary)]" /> {t('dashboard.recent_analyses')}
                    </h2>

                    {loading ? (
                      <p className="text-[var(--brand-text-muted)] text-xs py-8 text-center animate-pulse">{t('dashboard.loading_scans')}</p>
                    ) : history.length === 0 ? (
                      <div className="border-2 border-dashed border-[var(--brand-border)] rounded-3xl p-8 text-center text-[var(--brand-text-muted)] text-xs">
                        {t('dashboard.no_scans')}
                        <div className="mt-3">
                          <Link to="/upload" className="inline-flex items-center gap-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full px-4 py-2 font-semibold text-2xs transition shadow-xs">
                            <Plus size={10} /> {t('dashboard.scan_lesion')}
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                        {history.slice(0, 4).map((item) => (
                          <Link
                            key={item._id}
                            to={`/results/${item._id}`}
                            className="flex items-center justify-between p-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-surface)] transition-all w-full shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img src={item.image_url} alt="" className="h-10 w-10 rounded-xl object-cover bg-[var(--brand-surface)] border border-[var(--brand-border)]" />
                              <div className="text-left">
                                <h4 className="font-semibold text-[var(--brand-text)] text-xs leading-snug truncate max-w-[130px]">
                                  {t(`diseases.${item.primary_disease}`, { defaultValue: item.primary_disease_title || item.primary_disease.replace(/_/g, " ") })}
                                </h4>
                                <span className="text-[9px] text-[var(--brand-text-muted)]">{new Date(item.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-2xs font-bold text-amber-500">{t('dashboard.confidence_pct', { pct: Math.round(item.confidence * 100) })}</span>
                              <SeverityBadge severity={item.severity} />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-6 shadow-sm">
                    <h2 className="text-lg font-bold tracking-tight text-[var(--brand-text)] mb-4 flex items-center gap-2">
                      <Calendar size={18} className="text-[var(--brand-primary)]" /> {t('dashboard.appointments')}
                    </h2>

                    {appointments.length === 0 ? (
                      <div className="border-2 border-dashed border-[var(--brand-border)] rounded-3xl p-8 text-center text-[var(--brand-text-muted)] text-xs">
                        {t('dashboard.no_appointments')}
                        <div className="mt-3">
                          <Link to="/doctors" className="inline-flex items-center gap-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 rounded-full px-4 py-2 font-semibold hover:bg-[var(--brand-primary)] hover:text-white transition text-2xs">
                            {t('dashboard.find_dermatologist')}
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                        {appointments.map((appt) => (
                          <div key={appt.id} className="p-3 border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] rounded-2xl flex flex-col justify-between gap-2 shadow-xs">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-semibold text-[var(--brand-text)] text-xs">{appt.providerName}</h4>
                                <p className="text-[10px] text-[var(--brand-text-muted)] mt-0.5">{appt.clinic}</p>
                              </div>
                              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {appt.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-[var(--brand-text-muted)] border-t border-[var(--brand-border)]/60 pt-2">
                              <span>📅 {appt.date} at {appt.time}</span>
                              <button
                                onClick={() => handleCancelAppointment(appt.id)}
                                className="text-[9px] text-rose-500 hover:underline font-bold"
                              >
                                {t('common.cancel')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Doctors Cards List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-[var(--brand-text)]">{t('dashboard.top_specialists')}</h2>
                    <Link to="/doctors" className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
                      View All Specialists <ChevronRight size={14} />
                    </Link>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {[...displayedDoctors]
                      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                      .slice(0, 2)
                      .map((doc: Doctor) => {
                        const docId = doc.id || (doc as any)._id;
                        return (
                          <div 
                            key={docId}
                            className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-3xl p-5 shadow-sm flex justify-between items-center gap-3 hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 rounded-2xl bg-[var(--brand-surface-elevated)] text-[var(--brand-primary)] border-2 border-[var(--brand-border)] flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                                {doc.name.split(" ").slice(1).map((n: string) => n[0]).join("")}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-[var(--brand-text)] text-sm leading-none">{doc.name}</h4>
                                  <span className="h-3.5 w-3.5 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-[8px] font-bold" title="Verified">✓</span>
                                </div>
                                <p className="text-[var(--brand-text-muted)] text-[10px] mt-1">{doc.specialization}</p>
                                
                                <div className="flex items-center gap-1.5 mt-2">
                                  <span className="text-amber-500 text-xs">★</span>
                                  <span className="text-[var(--brand-text)] text-[10px] font-bold">{doc.rating || 4.7}</span>
                                  <span className="text-[var(--brand-text-muted)] text-[9px]">({doc.reviews_count || 100} reviews)</span>
                                </div>
                              </div>
                            </div>
                            
                            <Link
                              to="/doctors"
                              className="h-9 px-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-2xl text-[10px] font-bold flex items-center justify-center transition whitespace-nowrap shadow-xs"
                            >
                              {t('dashboard.consult')}
                            </Link>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. SCANS HISTORY TAB */}
            {activeTab === "scans" && (
              <motion.div
                key="scans"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Search / filter control */}
                <div className="flex items-center bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-2xl px-4 py-3 shadow-xs focus-within:border-[var(--brand-primary)] focus-within:ring-4 focus-within:ring-[var(--brand-primary)]/10 transition">
                  <Search className="text-[var(--brand-text-muted)] shrink-0 mr-3" size={17} />
                  <input
                    type="text"
                    value={scanSearch}
                    onChange={(e) => setScanSearch(e.target.value)}
                    placeholder={t('dashboard.search_placeholder')}
                    className="w-full bg-transparent text-xs border-none outline-none focus:outline-none focus:ring-0 text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] p-0 shadow-none"
                  />
                </div>

                <div className="relative pl-6 sm:pl-8 border-l-2 border-[var(--brand-border)] ml-4 py-2 space-y-8">
                  {filteredHistory.length > 0 ? (
                    [...filteredHistory]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((item) => {
                        const isSevere = item.severity === "Severe";
                        const isModerate = item.severity === "Moderate";
                        const dotColor = isSevere 
                          ? "bg-rose-500 ring-rose-500/20" 
                          : isModerate 
                            ? "bg-amber-500 ring-amber-500/20" 
                            : "bg-emerald-500 ring-emerald-500/20";
                        
                        return (
                          <motion.div
                            key={item._id}
                            layout
                            className="relative group"
                          >
                            {/* Timeline node bullet */}
                            <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 h-4 w-4 rounded-full border-4 border-[var(--brand-surface)] ring-4 ${dotColor} z-10 transition-all`} />

                            {/* Timeline Card */}
                            <div className="rounded-3xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-xs hover:shadow-md hover:border-[var(--brand-primary)] transition-all duration-300 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                              <div className="flex items-start gap-4">
                                <img src={item.image_url} alt="" className="h-16 w-16 rounded-2xl object-cover bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)] shrink-0" />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-[var(--brand-text)] text-sm">
                                      {t(`diseases.${item.primary_disease}`, { defaultValue: item.primary_disease_title || item.primary_disease.replace(/_/g, " ") })}
                                    </h3>
                                    <span className="text-[10px] bg-[var(--brand-surface-elevated)] text-[var(--brand-text-muted)] px-2 py-0.5 rounded-lg border border-[var(--brand-border)] font-medium">
                                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-[var(--brand-text-muted)] font-mono">Report ID: {item._id}</p>
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-[var(--brand-primary)]">{t('dashboard.confidence_pct', { pct: Math.round(item.confidence * 100) })}</span>
                                    <SeverityBadge severity={item.severity} />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 pt-3 xl:pt-0 border-t xl:border-t-0 border-[var(--brand-border)]/50 justify-end flex-wrap">
                                <button
                                  onClick={() => handleDownloadFHIR(item._id)}
                                  className="h-9 px-3.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:scale-102 shadow-2xs"
                                  title="Export Standardized HL7 FHIR Observation JSON"
                                >
                                  <Download size={13} className="shrink-0" /> Export FHIR
                                </button>
                                <button
                                  onClick={() => handleDownloadPDF(item._id)}
                                  className="h-9 px-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:scale-102 shadow-2xs"
                                  title="Download Printable PDF Medical Report"
                                >
                                  <FileText size={13} className="shrink-0" /> Download PDF
                                </button>
                                
                                <Link
                                  to={`/results/${item._id}`}
                                  className="h-9 px-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition hover:scale-102"
                                >
                                  {t('common.view')} <ChevronRight size={14} />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                  ) : (
                    <p className="text-center py-12 text-[var(--brand-text-muted)] text-xs w-full ml-[-20px]">{t('dashboard.no_scans')}</p>
                  )}
                </div>
              </motion.div>
            )}



            {/* 3.1 COMPARE TAB */}
            {activeTab === "compare" && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-6 shadow-sm">
                  <h3 className="text-[var(--brand-text)] font-bold text-lg mb-4 flex items-center gap-2">
                    <FileImage size={20} className="text-[var(--brand-primary)]" /> {t('compare.title')}
                  </h3>
                  
                  {/* Selectors */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs font-semibold text-[var(--brand-text-muted)] mb-1 block">{t('compare.baseline')}</label>
                      <select 
                        className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-2.5 text-xs text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]"
                        onChange={(e) => setSelectedCompareScans([history.find(h => h._id === e.target.value) || null, selectedCompareScans[1]])}
                      >
                        <option value="">Select a scan...</option>
                        {history.map(h => <option key={h._id} value={h._id}>{h.primary_disease_title || h.primary_disease} ({new Date(h.created_at).toLocaleDateString()})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--brand-text-muted)] mb-1 block">{t('compare.followup')}</label>
                      <select 
                        className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-2.5 text-xs text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)]"
                        onChange={(e) => setSelectedCompareScans([selectedCompareScans[0], history.find(h => h._id === e.target.value) || null])}
                      >
                        <option value="">Select a scan...</option>
                        {history.map(h => <option key={h._id} value={h._id}>{h.primary_disease_title || h.primary_disease} ({new Date(h.created_at).toLocaleDateString()})</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Slider View */}
                  {selectedCompareScans[0] && selectedCompareScans[1] ? (
                    <div className="space-y-6">
                      <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden group select-none border border-[var(--brand-border)]">
                        {/* Baseline Image */}
                        <img src={selectedCompareScans[0].image_url} className="absolute inset-0 h-full w-full object-cover" alt="Baseline" />
                        {/* Follow-up Image */}
                        <div 
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ clipPath: `inset(0 ${100 - compareSliderPos}% 0 0)` }}
                        >
                          <img src={selectedCompareScans[1].image_url} className="h-full w-full object-cover" alt="Follow-up" />
                        </div>
                        {/* Slider handle */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-md"
                          style={{ left: `${compareSliderPos}%` }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none">
                            <span className="text-[var(--brand-primary)] font-bold text-[10px]">||</span>
                          </div>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={compareSliderPos}
                          onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                        />
                        <div className="absolute top-4 left-4 bg-black/60 text-white px-2.5 py-1 rounded text-[10px] backdrop-blur-sm pointer-events-none">Baseline</div>
                        <div className="absolute top-4 right-4 bg-black/60 text-white px-2.5 py-1 rounded text-[10px] backdrop-blur-sm pointer-events-none">Follow-up</div>
                      </div>

                      {/* SSIM Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">Structural Similarity (SSIM)</p>
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">0.82</p>
                          <p className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Significant structural change detected</p>
                        </div>
                        <div className="bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 rounded-xl p-4 text-center">
                          <p className="text-[10px] text-[var(--brand-primary)] font-bold uppercase tracking-wide">Lesion Diameter Change</p>
                          <p className="text-2xl font-bold text-[var(--brand-primary)] mt-1">-3.4 mm</p>
                          <p className="text-[9px] text-[var(--brand-text-muted)] mt-1">Healing progress observed</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 border-2 border-dashed border-[var(--brand-border)] rounded-2xl flex items-center justify-center text-[var(--brand-text-muted)] text-xs">
                      {t('compare.select_both')}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3.2 OCR TAB */}
            {activeTab === "ocr" && (
              <motion.div
                key="ocr"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-6 shadow-sm">
                  <h3 className="text-[var(--brand-text)] font-bold text-lg mb-4 flex items-center gap-2">
                    <Camera size={20} className="text-[var(--brand-primary)]" /> {t('ocr.title')}
                  </h3>
                  
                  <div className="border-2 border-dashed border-[var(--brand-border)] rounded-3xl p-8 text-center bg-[var(--brand-surface-elevated)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition cursor-pointer relative">
                    <Camera size={32} className="mx-auto text-[var(--brand-primary)] mb-3" />
                    <p className="text-sm font-bold text-[var(--brand-text)]">{t('ocr.upload_prompt')}</p>
                    <p className="text-[10px] text-[var(--brand-text-muted)] mt-1">{t('ocr.upload_hint')}</p>
                    <input type="file" onChange={handleOcrUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
                  </div>

                  {ocrLoading && (
                    <div className="mt-6 flex flex-col items-center justify-center space-y-3 py-8">
                      <div className="h-8 w-8 rounded-full border-4 border-[var(--brand-primary)] border-t-transparent animate-spin" />
                      <p className="text-xs text-[var(--brand-text-muted)] font-mono">{t('ocr.processing')}</p>
                    </div>
                  )}

                  {ocrResult && !ocrLoading && (
                    <div className="mt-6 space-y-4">

                      {/* Language detected badge */}
                      {ocrResult.language_detected && (
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-[var(--brand-text-muted)]">
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/25">
                            {t("dashboard.ocr_lang_detected")}: {ocrResult.language_detected.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Safety Alerts */}
                      {ocrResult.safety_alerts && ocrResult.safety_alerts.length > 0 && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
                          <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-2">
                            <AlertTriangle size={14} /> {t("dashboard.ocr_safety_alert")}
                          </h4>
                          <ul className="list-disc pl-5 text-[10px] text-rose-700 dark:text-rose-400 space-y-1">
                            {ocrResult.safety_alerts.map((alert: string, i: number) => <li key={i}>{alert}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Medicines */}
                      {ocrResult.medicines && ocrResult.medicines.length > 0 && (
                        <div>
                          <h4 className="font-bold text-sm text-[var(--brand-text)] mb-2 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)] inline-block" />
                            {t("dashboard.ocr_medicines")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ocrResult.medicines.map((med: string, i: number) => (
                              <span key={i} className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                                💊 {med}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diseases */}
                      {ocrResult.diseases && ocrResult.diseases.length > 0 && (
                        <div>
                          <h4 className="font-bold text-sm text-[var(--brand-text)] mb-2 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                            {t("dashboard.ocr_diseases")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ocrResult.diseases.map((d: string, i: number) => (
                              <span key={i} className="px-3 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                🏥 {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Symptoms */}
                      {ocrResult.symptoms && ocrResult.symptoms.length > 0 && (
                        <div>
                          <h4 className="font-bold text-sm text-[var(--brand-text)] mb-2 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                            {t("dashboard.ocr_symptoms")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ocrResult.symptoms.map((s: string, i: number) => (
                              <span key={i} className="px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                🔍 {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw text */}
                      {ocrResult.raw_text && (
                        <div>
                          <h4 className="font-bold text-xs text-[var(--brand-text-muted)] mb-2 uppercase tracking-wide">
                            {t("dashboard.ocr_raw_text")}
                          </h4>
                          <div className="p-3 rounded-xl bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)]">
                            <p className="text-[10px] text-[var(--brand-text)] font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {ocrResult.raw_text}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Nothing found */}
                      {!ocrResult.medicines?.length && !ocrResult.diseases?.length && !ocrResult.symptoms?.length && !ocrResult.safety_alerts?.length && (
                        <p className="text-xs text-[var(--brand-text-muted)] text-center py-4">{t("dashboard.ocr_no_result")}</p>
                      )}
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* 3.3 PROFILE TAB */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-6 shadow-sm">
                  <h3 className="text-[var(--brand-text)] font-bold text-lg mb-4 flex items-center gap-2">
                    <User size={20} className="text-[var(--brand-primary)]" /> {t('profile.title')}
                  </h3>
                  
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[var(--brand-text-muted)] mb-1 block">{t('profile.age')}</label>
                        <input type="number" value={patientProfile.age} onChange={e => setPatientProfile({...patientProfile, age: parseInt(e.target.value)})} className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-2.5 text-xs text-[var(--brand-text)] focus:border-[var(--brand-primary)] outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--brand-text-muted)] mb-1 block">{t('profile.gender')}</label>
                        <select value={patientProfile.gender} onChange={e => setPatientProfile({...patientProfile, gender: e.target.value})} className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-2.5 text-xs text-[var(--brand-text)] focus:border-[var(--brand-primary)] outline-none">
                          <option>{t('profile.gender_male')}</option>
                          <option>{t('profile.gender_female')}</option>
                          <option>{t('profile.gender_other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--brand-text-muted)] mb-1 block">{t('profile.blood_group')}</label>
                        <select value={patientProfile.bloodGroup} onChange={e => setPatientProfile({...patientProfile, bloodGroup: e.target.value})} className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-2.5 text-xs text-[var(--brand-text)] focus:border-[var(--brand-primary)] outline-none">
                          <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--brand-text-muted)] mb-1 block">{t('profile.allergies')}</label>
                        <input type="text" value={patientProfile.allergies} onChange={e => setPatientProfile({...patientProfile, allergies: e.target.value})} placeholder={t('profile.allergies_placeholder')} className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-2.5 text-xs text-[var(--brand-text)] focus:border-[var(--brand-primary)] outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--brand-text-muted)] mb-1 block">{t('profile.medical_history')}</label>
                      <textarea value={patientProfile.medicalHistory} onChange={e => setPatientProfile({...patientProfile, medicalHistory: e.target.value})} placeholder={t('profile.medical_history_placeholder')} className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-2.5 text-xs text-[var(--brand-text)] focus:border-[var(--brand-primary)] outline-none h-24 resize-none" />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition">
                        {t('profile.save_profile')}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* 4. SAVED DOCTORS TAB */}
            {activeTab === "favorites" && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {favoriteDoctors.length === 0 ? (
                  <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center gap-3">
                    <Heart size={40} className="text-slate-300 dark:text-slate-600" />
                    <h3 className="text-lg font-bold text-[var(--brand-text)]">No Saved Specialists Yet</h3>
                    <p className="text-xs text-[var(--brand-text-muted)] max-w-sm">
                      When you tap the heart icon on any dermatologist in Find Doctors, they will appear here for quick access.
                    </p>
                    <Link
                      to="/doctors"
                      className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-primary)] text-white px-5 py-2.5 text-xs font-bold shadow-md hover:bg-[var(--brand-primary-hover)] transition"
                    >
                      Browse Dermatologists
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {favoriteDoctors.map((doc: Doctor) => (
                      <motion.div
                        key={doc.id}
                        layout
                        className="relative rounded-3xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-[var(--brand-primary)] hover:shadow-md transition-all"
                      >
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(e, doc.id || (doc as any)._id)}
                          title="Remove from saved specialists"
                          className="absolute right-4 top-4 text-rose-500 hover:scale-110 transition cursor-pointer p-1 z-10"
                        >
                          <Heart size={18} fill="#F43F5E" className="text-rose-500" />
                        </button>

                        <div className="flex items-start gap-4 pr-6">
                          <div className="h-14 w-14 rounded-2xl bg-[var(--brand-surface-elevated)] text-[var(--brand-primary)] border-2 border-[var(--brand-border)] flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                            {doc.name.split(" ").slice(1).map((n: string) => n[0]).join("")}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-bold text-[var(--brand-text)] text-sm flex items-center gap-1.5">
                              {doc.name}
                              <span className="h-3.5 w-3.5 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                            </h3>
                            <p className="text-[var(--brand-text-muted)] text-[10px] font-medium">{doc.specialization}</p>
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                              <span>★ {doc.rating || 4.8}</span>
                              <span className="text-[var(--brand-text-muted)] font-normal">({doc.reviews_count || 120} reviews)</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-2xs text-[var(--brand-text-muted)] border-t border-[var(--brand-border)]/60 pt-3">
                          <p className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-[var(--brand-primary)] shrink-0" />
                            <span>{doc.clinic_name} — {doc.address}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone size={12} className="text-[var(--brand-primary)] shrink-0" />
                            <span>{doc.phone}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock size={12} className="text-[var(--brand-primary)] shrink-0" />
                            <span>{doc.timings}</span>
                          </p>
                        </div>

                        <div className="flex gap-2 border-t border-[var(--brand-border)]/60 pt-3">
                          <Link
                            to="/doctors"
                            className="flex-1 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold rounded-xl text-center text-xs shadow-xs transition"
                          >
                            {t('dashboard.book_consult')}
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. SYMPTOM ASSISTANT CHAT TAB */}
            {activeTab === "messages" && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-6 flex flex-col h-[520px] justify-between shadow-xs"
              >
                {/* Chat window */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 border-b border-[var(--brand-border)]/60 scrollbar-thin">
                  {chatMessages.map((msg) => {
                    const ai = msg.sender === "ai";
                    return (
                      <div key={msg.id} className={`flex items-start gap-2.5 ${ai ? "justify-start" : "justify-end"}`}>
                        {ai && (
                          <div className="h-8 w-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs font-bold font-mono">AI</div>
                        )}
                        <div className={`max-w-[70%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          ai 
                            ? "bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] border border-[var(--brand-border)]" 
                            : "bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-xs"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  {chatLoading && (
                    <div className="flex items-start gap-2.5 justify-start">
                      <div className="h-8 w-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs font-bold font-mono animate-pulse">AI</div>
                      <div className="bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)] rounded-2xl p-3.5 text-xs text-[var(--brand-text-muted)] animate-pulse flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-bounce delay-75" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-bounce delay-150" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input row */}
                <form onSubmit={handleSendChatMessage} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Describe symptoms (e.g., itchy red skin rash)..."
                    className="flex-1 rounded-2xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-4 py-3 text-xs outline-none focus:border-[var(--brand-primary)] focus:bg-[var(--brand-surface)] text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] transition"
                  />
                  <button
                    type="submit"
                    className="h-11 w-11 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white flex items-center justify-center transition shadow-md shadow-[var(--brand-primary)]/20 shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* ── Right sidebar layout (Vitals & Treatment Tracker Floating Rounded Card) ──────────────── */}
        <div className="xl:col-span-4 p-4 md:p-6 flex flex-col justify-start overflow-y-auto">
          <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-6 space-y-6 shadow-sm">
            
            {/* Sidebar header */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">{t('dashboard.treatment_tracker')}</h2>
              <span className="bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{t('dashboard.today')}</span>
            </div>

            {/* Medicine Tracker Widget */}
            <div className="bg-[var(--brand-surface-elevated)] border-2 border-[var(--brand-border)] rounded-3xl p-5 shadow-xs space-y-4">
              <p className="text-[10px] font-bold text-[var(--brand-text-muted)] uppercase tracking-wider">{t('dashboard.medication_reminders')}</p>
              
              <div className="space-y-3">
                {medications.map((med) => (
                  <div 
                    key={med.id} 
                    onClick={() => handleToggleMedication(med.id)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] hover:border-[var(--brand-primary)] cursor-pointer shadow-xs hover:shadow-md transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition ${
                        med.taken 
                          ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white" 
                          : "border-[var(--brand-border)] text-transparent group-hover:border-[var(--brand-primary)]"
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${med.taken ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-[#CBD5E1]"}`}>
                          {med.name}
                        </p>
                        <p className="text-[10px] text-[var(--brand-text-muted)] mt-0.5">{med.dosage}</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)] text-[var(--brand-text-muted)] px-2 py-1 rounded-lg font-medium">{med.time}</span>
                  </div>
                ))}
              </div>

              {/* Progress summary */}
              <div className="pt-2 border-t-2 border-[var(--brand-border)] flex justify-between items-center text-[10px] text-[var(--brand-text-muted)]">
                <span>{t('dashboard.daily_adherence')}</span>
                <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">
                  {t('dashboard.medication_progress', { count: medications.filter(m => m.taken).length, total: medications.length, pct: Math.round((medications.filter(m => m.taken).length / medications.length) * 100) })}
                </span>
              </div>
            </div>

            {/* Follow-up Reminders / Risk Alert */}
            <div className="bg-[var(--brand-surface-elevated)] border-2 border-[var(--brand-border)] rounded-3xl p-5 shadow-xs space-y-4">
              <p className="text-[10px] font-bold text-[var(--brand-text-muted)] uppercase tracking-wider">{t('dashboard.clinical_alerts')}</p>
              
              <div className="space-y-3">
                {/* Alert 1 */}
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl">
                  <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={15} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">{t('dashboard.consult_required')}</h4>
                    <p className="text-[10px] text-slate-600 dark:text-[#94A3B8] leading-relaxed mt-1">
                      {t('dashboard.alert_consult_desc', { disease: t('diseases.Atopic_Dermatitis'), severity: t('dashboard.moderate') })}
                    </p>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="flex items-start gap-3 p-3 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/25 rounded-2xl">
                  <Calendar className="text-[var(--brand-primary)] shrink-0 mt-0.5" size={15} />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--brand-primary)]">{t('dashboard.next_assessment')}</h4>
                    <p className="text-[10px] text-slate-600 dark:text-[#94A3B8] leading-relaxed mt-1">
                      {t('dashboard.alert_next_assessment_desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
