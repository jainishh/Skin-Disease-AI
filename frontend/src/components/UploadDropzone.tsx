import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Camera, ImagePlus, CheckCircle2, UploadCloud, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onFileSelected: (file: File) => void;
  isAnalyzing: boolean;
}

export default function UploadDropzone({ onFileSelected, isAnalyzing }: Props) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`scan-ring ${isAnalyzing ? "scanning" : ""} relative mx-auto flex aspect-square w-full max-w-sm cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl text-center transition-all duration-300 border-2 border-dashed ${
        isDragActive
          ? "scale-105 bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] shadow-lg"
          : "bg-slate-50/80 dark:bg-[#141C26]/50 border-2 border-dashed border-[var(--brand-border)] hover:border-[var(--brand-primary)] hover:scale-[1.01] transition-all"
      }`}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <img
              src={preview}
              alt="Selected skin lesion"
              className="h-full w-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 rounded-3xl flex items-end justify-center pb-5 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <span className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
                <CheckCircle2 size={14} className="text-[var(--brand-success)]" /> Ready for Clinical AI Scan
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center px-8"
          >
            {/* Medical Orb Icon */}
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)]/15 to-[var(--brand-secondary)]/15 text-[var(--brand-primary)]">
              <UploadCloud size={34} />
            </div>
            
            <p className="font-bold text-base text-[var(--brand-text)] leading-snug">
              {isDragActive ? "Drop image here to scan…" : t("upload.drop_text", { defaultValue: "Drag & drop skin photo here, or browse" })}
            </p>
            
            <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
              High resolution close-up lesion images
            </p>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-[var(--brand-text-muted)] rounded-full px-3 py-1 bg-[var(--brand-bg)] border border-[var(--brand-border)]">
              <Camera size={13} className="text-[var(--brand-primary)]" />
              <span>JPG · PNG · WEBP (Max 8 MB)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag active overlay */}
      {isDragActive && (
        <div className="absolute inset-0 rounded-3xl flex items-center justify-center bg-[var(--brand-primary)]/20 backdrop-blur-xs">
          <p className="font-bold text-lg text-[var(--brand-primary)] flex items-center gap-2">
            <Sparkles size={20} /> Release to scan image
          </p>
        </div>
      )}
    </div>
  );
}
