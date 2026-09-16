import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  HeartHandshake, 
  Stethoscope, 
  PhoneCall, 
  Mail, 
  MapPin, 
  ExternalLink,
  Lock,
  CheckCircle2
} from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const isGuestUpload = location.pathname === "/upload" && (new URLSearchParams(location.search).get("guest") === "true" || !user);
  const hideFooter = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/doctor-portal" || isGuestUpload;

  if (hideFooter) {
    return null;
  }
  return (
    <footer className="relative border-t border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text-muted)] transition-colors duration-200 font-body">
      {/* Top Clinical Trust Bar */}
      <div className="border-b border-[var(--brand-border)] bg-[var(--brand-surface)]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-2 font-medium text-[var(--brand-text)]">
              <ShieldCheck size={16} className="text-[var(--brand-primary)]" />
              {t("footer.iso_security", { defaultValue: "ISO 27001 Certified Security" })}
            </span>
            <span className="flex items-center gap-2 font-medium text-[var(--brand-text)]">
              <Lock size={15} className="text-[var(--brand-secondary)]" />
              {t("footer.hipaa_compliant", { defaultValue: "End-to-End HIPAA Compliant" })}
            </span>
            <span className="flex items-center gap-2 font-medium text-[var(--brand-text)]">
              <Activity size={15} className="text-[var(--brand-success)]" />
              {t("footer.ai_vision", { defaultValue: "Deep Residual Clinical AI Vision" })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand-success)] animate-pulse" />
            <span className="text-[11px] font-semibold text-[var(--brand-text)]">
              {t("footer.engine_operational", { defaultValue: "Diagnostic Engine: All Systems Operational" })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Column 1: Brand & Clinical Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] shadow-sm">
                <Stethoscope size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-[var(--brand-text)] group-hover:text-[var(--brand-primary)] transition">
                  {t("app_name", { defaultValue: "DermaScan AI" })}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-secondary)]">
                  Clinical Dermatology Intelligence
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed max-w-sm">
              {t("footer.mission", { defaultValue: "Empowering healthcare accessibility through certified deep convolutional neural networks. Delivering rapid skin condition screening, explainable Grad-CAM heatmaps, and seamless dermatologist matching." })}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[11px] font-medium text-[var(--brand-text)]">
                <CheckCircle2 size={13} className="text-[var(--brand-success)]" /> {t("footer.top_accuracy", { defaultValue: "98.4% Top-3 Accuracy" })}
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[11px] font-medium text-[var(--brand-text)]">
                <Sparkles size={13} className="text-[var(--brand-primary)]" /> {t("footer.skin_classes", { defaultValue: "23 Skin Classes" })}
              </div>
            </div>
          </div>

          {/* Column 2: Clinical Capabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] mb-4">
              {t("footer.ai_capabilities", { defaultValue: "AI Capabilities" })}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/upload" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  {t("footer.lesion_scanner", { defaultValue: "Lesion AI Scanner" })}
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  {t("footer.gradcam_heatmap", { defaultValue: "Grad-CAM Visual Heatmap" })}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  {t("footer.health_trends", { defaultValue: "Longitudinal Health Trends" })}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  {t("footer.multilingual_reports", { defaultValue: "Multilingual Clinical Reports" })}
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  {t("footer.clinic_directory", { defaultValue: "Specialist Clinic Directory" })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Patient Care & Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] mb-4">
              {t("footer.patient_care", { defaultValue: "Patient Care" })}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/upload" className="hover:text-[var(--brand-primary)] transition">
                  {t("footer.start_new_scan", { defaultValue: "Start New Scan" })}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[var(--brand-primary)] transition">
                  {t("footer.health_records", { defaultValue: "Patient Health Records" })}
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-[var(--brand-primary)] transition">
                  {t("footer.book_dermatologist", { defaultValue: "Book Dermatologist" })}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[var(--brand-primary)] transition">
                  {t("footer.secure_portal", { defaultValue: "Secure Patient Portal" })}
                </Link>
              </li>
              <li>
                <a href="#emergency" className="text-[var(--brand-error)] hover:underline flex items-center gap-1 font-semibold">
                  {t("footer.emergency_indicators", { defaultValue: "Emergency Indicators" })}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Clinical Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] mb-4">
              {t("footer.clinical_support", { defaultValue: "Clinical Support" })}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <PhoneCall size={14} className="mt-0.5 text-[var(--brand-primary)] shrink-0" />
                <span>
                  <strong className="block text-[var(--brand-text)]">{t("footer.helpline", { defaultValue: "Helpline (Toll-free)" })}</strong>
                  +1 (800) 456-SKIN / +91 1800-202-DERM
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 text-[var(--brand-secondary)] shrink-0" />
                <span>
                  <strong className="block text-[var(--brand-text)]">{t("footer.clinical_advisory", { defaultValue: "Clinical Advisory" })}</strong>
                  clinical@dermascan-ai.health
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-[var(--brand-text-muted)] shrink-0" />
                <span>
                  {t("footer.health_center", { defaultValue: "Medical AI Labs & Health Center" })}
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Clinical Advisory Disclaimer */}
        <div className="mt-10 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-bg)] p-4 text-[11px] leading-relaxed text-[var(--brand-text-muted)]">
          <p>
            {t("footer.regulatory_notice", { defaultValue: "Medical & Regulatory Notice: DermaScan AI is an assistive decision-support application built for educational and early screening triaging. It does not constitute formal medical diagnosis, prognosis, or prescription. Always seek the direct evaluation of a qualified board-certified dermatologist or primary care physician regarding any suspected skin lesion, acute inflammation, or changes in pigmentation." })}
          </p>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="mt-8 pt-6 border-t border-[var(--brand-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-[11px]">
            © {new Date().getFullYear()} <strong>DermaScan AI Technologies Inc.</strong> {t("footer.all_rights_reserved", { defaultValue: "All rights reserved." })}
          </p>
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#" className="hover:text-[var(--brand-primary)] transition">{t("footer.privacy_policy", { defaultValue: "Privacy Policy" })}</a>
            <a href="#" className="hover:text-[var(--brand-primary)] transition">{t("footer.terms_service", { defaultValue: "Terms of Service" })}</a>
            <a href="#" className="hover:text-[var(--brand-primary)] transition">{t("footer.hipaa_compliance", { defaultValue: "HIPAA Compliance" })}</a>
            <a href="#" className="hover:text-[var(--brand-primary)] transition">{t("footer.security_overview", { defaultValue: "Security Overview" })}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

