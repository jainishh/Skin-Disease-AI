import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImagePlus, RefreshCw, X, Zap, Sliders, Sparkles, CheckCircle2, Shield, Leaf, AlertTriangle, ArrowRight, Cpu, Activity, UploadCloud, ArrowLeft, Sun, Moon } from "lucide-react";
import UploadDropzone from "../components/UploadDropzone";
import { apiClient } from "../api/client";
import SeverityBadge from "../components/SeverityBadge";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const TIPS = [
  "🌿 Good lighting = higher diagnostic precision. Use natural daylight.",
  "📐 Capture a perpendicular, clear close-up of just the lesion area.",
  "🚿 Gently clean and dry the skin area before taking the photo.",
  "🔍 Avoid camera shake and motion blur — keep your device steady.",
];

export default function Upload() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isGuestMode = new URLSearchParams(location.search).get("guest") === "true" || !user;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tipIdx, setTipIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<any | null>(null);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    if (result) {
      setLoadingRec(true);
      const lang = i18n.language;
      apiClient
        .get(`/recommendations/${result.primary_disease}/${result.severity}`, {
          params: { lang },
        })
        .then((res) => setRecommendation(res.data))
        .catch(() => setRecommendation(null))
        .finally(() => setLoadingRec(false));
    }
  }, [result, i18n.language]);

  // Rotate tips
  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (useCamera) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => {
          setError(t("upload.camera_error"));
          setUseCamera(false);
        });
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [useCamera]);

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }

  function processImage(originalFile: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(originalFile);
      reader.onload = (ev) => {
        const img = new Image();
        img.src = ev.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 500;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const min = Math.min(img.width, img.height);
            ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
          }
          canvas.toBlob((blob) => {
            resolve(blob ? new File([blob], originalFile.name || "skin_scan.jpg", { type: "image/jpeg", lastModified: Date.now() }) : originalFile);
          }, "image/jpeg", 0.85);
        };
      };
    });
  }

  function handleFileSelected(f: File) {
    processImage(f).then((p) => {
      setFile(p);
      setError(null);
    });
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    const size = Math.min(v.videoWidth, v.videoHeight) || 500;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(v, (v.videoWidth - size) / 2, (v.videoHeight - size) / 2, size, size, 0, 0, size, size);
    canvas.toBlob((blob) => {
      if (blob) {
        processImage(new File([blob], "captured_skin.jpg", { type: "image/jpeg" })).then((p) => {
          setFile(p);
          setUseCamera(false);
        });
      }
    }, "image/jpeg", 0.85);
  }

  async function handleAnalyze() {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      
      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = { "Content-Type": "multipart/form-data" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Allow full time for deep AI inference & Grad-CAM heatmap generation (120s max)
      const res = await apiClient.post("/predict", form, { 
        headers,
        timeout: 120000 
      });
      setResult(res.data);
    } catch (err: any) {
      console.error("Prediction analysis error:", err);
      const detail = err.response?.data?.detail || err.message;
      setError(detail || "Failed to analyze skin image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto mt-4 max-w-4xl px-6 pb-20 text-center font-body text-[var(--brand-text)]">
      
      {/* Top Header Controls for Guest Mode */}
      {isGuestMode && (
        <div className="flex items-center justify-between py-4 mb-6 border-b border-[var(--brand-border)]">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-xs font-semibold text-[var(--brand-text)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 uppercase tracking-wider">
              Guest AI Scan Mode
            </span>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)] transition"
            >
              {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-emerald-500" />}
            </button>
          </div>
        </div>
      )}

      {/* Upper header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 text-[var(--brand-primary)] px-4 py-1.5 text-xs font-semibold mb-3 shadow-xs">
          <Sparkles size={13} className="animate-pulse" /> {t("auth.sparkles_hint", { defaultValue: "Dermatological Deep Neural Network Vision" })}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--brand-text)] leading-tight tracking-tight">
          {t("upload.title", { defaultValue: "Instant Clinical Skin Lesion Analysis" })}
        </h1>
        <p className="mt-3 text-[var(--brand-text-muted)] text-sm max-w-lg mx-auto leading-relaxed">
          {t("upload.subtitle", { defaultValue: "Upload or capture a close-up photo of any skin anomaly for certified AI triaging and explainable Grad-CAM heatmaps." })}
        </p>
      </motion.div>

      {/* Rotating Tips Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mt-6 mx-auto max-w-md"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-xs font-medium rounded-full bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[var(--brand-text-muted)] px-5 py-2 shadow-xs"
          >
            {TIPS[tipIdx]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="uploader-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Upload Workspace Card - High Visibility Border & Shadow */}
            <div className="mt-8 bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-3xl p-8 max-w-lg mx-auto shadow-xl backdrop-blur-md">
              
              {/* Toggle Mode */}
              <div className="flex justify-center gap-2 bg-slate-100/80 dark:bg-[#141C26] border border-[var(--brand-border)] p-1.5 rounded-2xl mb-8">
                {[
                  { camera: false, Icon: ImagePlus, label: t("upload.upload_file", { defaultValue: "File Upload" }) },
                  { camera: true, Icon: Camera, label: t("upload.use_camera", { defaultValue: "Live Camera" }) },
                ].map(({ camera, Icon, label }) => (
                  <button
                    key={String(camera)}
                    onClick={() => {
                      setUseCamera(camera);
                      setFile(null);
                      setError(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                      useCamera === camera
                        ? "bg-[var(--brand-surface)] text-[var(--brand-primary)] shadow-sm border border-[var(--brand-border)]"
                        : "text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]"
                    }`}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>

              {/* Dropzone or Live camera feed */}
              <div className="flex justify-center min-h-[220px]">
                <AnimatePresence mode="wait">
                  {useCamera ? (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="relative overflow-hidden aspect-square w-full max-w-sm rounded-3xl border border-[var(--brand-border)] bg-black shadow-lg flex items-center justify-center"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="h-full w-full object-cover rounded-3xl"
                        style={{ transform: "scaleX(-1)" }}
                      />
                      
                      {/* Crop target brackets */}
                      {["top-4 left-4 border-t-2 border-l-2", "top-4 right-4 border-t-2 border-r-2",
                        "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"
                      ].map((cls, i) => (
                        <div key={i} className={`absolute w-6 h-6 border-white/80 ${cls}`} />
                      ))}
                      
                      <div className="absolute bottom-5 inset-x-0 flex justify-center gap-2">
                        <button 
                          onClick={capturePhoto} 
                          className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-md transition"
                        >
                          <Camera size={15} /> {t("upload.capture_photo", { defaultValue: "Capture Lesion" })}
                        </button>
                        <button
                          onClick={() => setUseCamera(false)}
                          className="rounded-full bg-black/60 border border-white/20 text-white px-3.5 py-2.5 text-xs hover:bg-black/80 transition"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="w-full"
                    >
                      <UploadDropzone onFileSelected={handleFileSelected} isAnalyzing={isAnalyzing} />

                      {/* Selected File Feedback Banner */}
                      <AnimatePresence>
                        {file && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mt-5 flex items-center justify-between rounded-2xl bg-[var(--brand-success)]/10 border border-[var(--brand-success)]/30 px-4 py-3 text-xs font-semibold text-[var(--brand-success)]"
                          >
                            <span className="flex items-center gap-2">
                              <CheckCircle2 size={15} />
                              <span className="truncate max-w-[190px]">{file.name}</span>
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-[var(--brand-text-muted)] font-mono font-medium">
                              <Sliders size={12} /> Ready
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 text-xs font-semibold text-[var(--brand-error)] flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle size={14} /> {error}
                </motion.p>
              )}

              {/* Action Button */}
              <div className="mt-8 w-full">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all duration-200 ${
                    file && !isAnalyzing 
                      ? "bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-lg hover:opacity-95 cursor-pointer" 
                      : "bg-slate-100 dark:bg-[#182230] text-[var(--brand-text-muted)] border border-[var(--brand-border)] cursor-not-allowed font-medium"
                  }`}
                >
                  {isAnalyzing ? (
                    <><RefreshCw size={17} className="animate-spin" /> {t("upload.analyzing", { defaultValue: "Analyzing with Neural Network..." })}</>
                  ) : (
                    <><Zap size={17} /> {t("upload.analyze_button", { defaultValue: "Run Deep AI Scan" })}</>
                  )}
                </button>
                {file && !isAnalyzing && (
                  <p className="mt-2 text-[11px] text-[var(--brand-text-muted)]">
                    Fast clinical inference • Localized multi-disease grading
                  </p>
                )}
              </div>

            </div>

            {/* 3 Step Interactive Workflow Cards with Hover Effects */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto text-left"
            >
              {[
                {
                  step: "1",
                  title: "Upload close-up photo",
                  desc: "Take or upload a high-clarity photo of the affected skin area",
                  Icon: Camera,
                },
                {
                  step: "2",
                  title: "AI scans 23 pathologies",
                  desc: "Deep neural network evaluates multi-class skin conditions",
                  Icon: Cpu,
                },
                {
                  step: "3",
                  title: "Clinical advice & heatmap",
                  desc: "Grad-CAM lesion focus, severity triage & care suggestions",
                  Icon: Activity,
                },
              ].map(({ step, title, desc, Icon }) => (
                <div
                  key={step}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-md hover:shadow-2xl hover:border-[var(--brand-primary)] hover:-translate-y-2 transition-all duration-300 cursor-default overflow-hidden"
                >
                  {/* Glowing top line accent on hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div>
                    <div className="flex items-center justify-between">
                      {/* Step Number Circle Badge */}
                      <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-2 border-[var(--brand-primary)]/30 group-hover:bg-[var(--brand-primary)] group-hover:text-white group-hover:border-[var(--brand-primary)] group-hover:scale-110 transition-all duration-300 shadow-xs">
                        {step}
                      </div>

                      {/* Icon */}
                      <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)] text-[var(--brand-text-muted)] group-hover:text-[var(--brand-primary)] group-hover:border-[var(--brand-primary)]/30 transition-all duration-300">
                        <Icon size={16} />
                      </div>
                    </div>

                    <h4 className="mt-3.5 font-bold text-sm text-[var(--brand-text)] group-hover:text-[var(--brand-primary)] transition-colors">
                      {title}
                    </h4>
                    
                    <p className="mt-1 text-xs text-[var(--brand-text-muted)] leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--brand-border)] flex items-center justify-between text-[10px] font-bold text-[var(--brand-primary)]">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-200">Stage {step}</span>
                    <span className="text-[var(--brand-secondary)] group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="results-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-3xl p-8 max-w-2xl mx-auto shadow-sm text-left"
          >
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-6 border-b border-[var(--brand-border)]">
              {file && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Scanned lesion"
                  className="h-32 w-32 rounded-2xl object-cover border border-[var(--brand-border)] shadow-xs"
                />
              )}
              <div className="flex-1 space-y-3 text-center md:text-left w-full">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                    {t('results.primary_prediction', { defaultValue: "Primary Match" })}
                  </span>
                  <SeverityBadge severity={result.severity} />
                </div>
                
                <h2 className="text-2xl font-bold text-[var(--brand-text)]">
                  {t(`diseases.${result.primary_disease}`, { defaultValue: result.primary_disease_title || result.primary_disease.replace(/_/g, " ") })}
                </h2>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.round(result.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[var(--brand-primary)] font-mono">
                    {Math.round(result.confidence * 100)}% Match
                  </span>
                </div>
              </div>
            </div>

            {loadingRec ? (
              <p className="text-[var(--brand-text-muted)] text-xs py-8 text-center animate-pulse">{t('common.loading')}</p>
            ) : recommendation ? (
              <div className="py-6 space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-[var(--brand-text)] uppercase tracking-wider mb-2">
                    {t('results.skin_care', { defaultValue: "Clinical Skincare Recommendations" })}
                  </h4>
                  <ul className="space-y-2">
                    {recommendation.skin_care?.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-[var(--brand-text-muted)] flex items-start gap-2">
                        <span className="text-[var(--brand-primary)] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-[var(--brand-text)] uppercase tracking-wider mb-2">
                    {t('results.lifestyle', { defaultValue: "Daily Lifestyle & Hygiene Guidance" })}
                  </h4>
                  <ul className="space-y-2">
                    {recommendation.lifestyle?.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-[var(--brand-text-muted)] flex items-start gap-2">
                        <span className="text-[var(--brand-secondary)] font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[var(--brand-success)]/10 border border-[var(--brand-success)]/25 rounded-2xl p-4">
                    <h5 className="text-[11px] font-bold text-[var(--brand-success)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Leaf size={14} /> {t('results.diet_eat', { defaultValue: "Beneficial Nutrition" })}
                    </h5>
                    <ul className="space-y-1.5">
                      {recommendation.diet_eat?.map((item: string, i: number) => (
                        <li key={i} className="text-xs text-[var(--brand-text)] flex items-start gap-1.5">
                          <span className="text-[var(--brand-success)]">•</span> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-[var(--brand-error)]/10 border border-[var(--brand-error)]/25 rounded-2xl p-4">
                    <h5 className="text-[11px] font-bold text-[var(--brand-error)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> {t('results.diet_avoid', { defaultValue: "Foods & Irritants to Avoid" })}
                    </h5>
                    <ul className="space-y-1.5">
                      {recommendation.diet_avoid?.map((item: string, i: number) => (
                        <li key={i} className="text-xs text-[var(--brand-text)] flex items-start gap-1.5">
                          <span className="text-[var(--brand-error)]">•</span> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--brand-border)]">
              <button 
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setRecommendation(null);
                }}
                className="flex-1 py-3 border border-[var(--brand-border)] bg-[var(--brand-bg)] hover:bg-[var(--brand-surface)] text-[var(--brand-text)] rounded-2xl text-xs font-semibold text-center transition"
              >
                {t('results.scan_another', { defaultValue: "Scan Another Photo" })}
              </button>
              
              <button
                onClick={() => navigate(`/results/${result.prediction_id}`, { state: result })}
                className="flex-1 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-2xl text-xs font-semibold text-center shadow-md transition flex items-center justify-center gap-2"
              >
                View Full Diagnostic Report <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clinical AI Triage Safety Notice Card with Interactive Hover Effect */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="group relative mx-auto mt-14 max-w-2xl p-6 rounded-2xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-md hover:shadow-xl hover:border-[var(--brand-primary)] hover:-translate-y-1.5 transition-all duration-300 text-center overflow-hidden cursor-default"
      >
        {/* Glowing top line accent on hover */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex flex-col items-center">
          {/* Shield Icon with glow on hover */}
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 group-hover:bg-[var(--brand-primary)] group-hover:text-white group-hover:scale-110 group-hover:shadow-md transition-all duration-300 mb-3.5">
            <Shield size={22} className="transition-transform duration-300 group-hover:rotate-6" />
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
            <span className="text-sm font-bold text-[var(--brand-text)] group-hover:text-[var(--brand-primary)] transition-colors">
              Clinical AI Triage Safety Notice
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Assistive Triage Mode
            </span>
          </div>

          <p className="text-xs text-[var(--brand-text-muted)] max-w-lg leading-relaxed">
            DermaScan AI predictions are assistive indicators designed for rapid triage. Always seek direct medical evaluation from a certified dermatologist for definitive clinical diagnosis and treatment plans.
          </p>

          {/* Interactive footer pill list inside card */}
          <div className="mt-4 pt-4 border-t border-[var(--brand-border)] w-full flex items-center justify-center gap-4 text-[11px] font-medium text-[var(--brand-text-muted)] group-hover:text-[var(--brand-text)] transition-colors flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Inference
            </span>
            <span>•</span>
            <span>CE & HIPAA Compliant Data Flow</span>
            <span>•</span>
            <span className="text-[var(--brand-primary)] font-semibold">Triage Support Only</span>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
