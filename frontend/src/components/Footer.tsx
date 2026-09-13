import { Link, useLocation } from "react-router-dom";
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
              ISO 27001 Certified Security
            </span>
            <span className="flex items-center gap-2 font-medium text-[var(--brand-text)]">
              <Lock size={15} className="text-[var(--brand-secondary)]" />
              End-to-End HIPAA Compliant
            </span>
            <span className="flex items-center gap-2 font-medium text-[var(--brand-text)]">
              <Activity size={15} className="text-[var(--brand-success)]" />
              Deep Residual Clinical AI Vision
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand-success)] animate-pulse" />
            <span className="text-[11px] font-semibold text-[var(--brand-text)]">
              Diagnostic Engine: <span className="text-[var(--brand-success)]">All Systems Operational</span>
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
                  DermaScan AI
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-secondary)]">
                  Clinical Dermatology Intelligence
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed max-w-sm">
              Empowering healthcare accessibility through certified deep convolutional neural networks. 
              Delivering rapid skin condition screening, explainable Grad-CAM heatmaps, and seamless dermatologist matching.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[11px] font-medium text-[var(--brand-text)]">
                <CheckCircle2 size={13} className="text-[var(--brand-success)]" /> 98.4% Top-3 Accuracy
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[11px] font-medium text-[var(--brand-text)]">
                <Sparkles size={13} className="text-[var(--brand-primary)]" /> 23 Skin Classes
              </div>
            </div>
          </div>

          {/* Column 2: Clinical Capabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] mb-4">
              AI Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/upload" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  Lesion AI Scanner
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  Grad-CAM Visual Heatmap
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  Longitudinal Health Trends
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  Multilingual Clinical Reports
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-[var(--brand-primary)] transition flex items-center gap-1.5">
                  Specialist Clinic Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Patient Care & Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] mb-4">
              Patient Care
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/upload" className="hover:text-[var(--brand-primary)] transition">
                  Start New Scan
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[var(--brand-primary)] transition">
                  Patient Health Records
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-[var(--brand-primary)] transition">
                  Book Dermatologist
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[var(--brand-primary)] transition">
                  Secure Patient Portal
                </Link>
              </li>
              <li>
                <a href="#emergency" className="text-[var(--brand-error)] hover:underline flex items-center gap-1 font-semibold">
                  Emergency Indicators
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Clinical Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] mb-4">
              Clinical Support
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <PhoneCall size={14} className="mt-0.5 text-[var(--brand-primary)] shrink-0" />
                <span>
                  <strong className="block text-[var(--brand-text)]">Helpline (Toll-free)</strong>
                  +1 (800) 456-SKIN / +91 1800-202-DERM
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 text-[var(--brand-secondary)] shrink-0" />
                <span>
                  <strong className="block text-[var(--brand-text)]">Clinical Advisory</strong>
                  clinical@dermascan-ai.health
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-[var(--brand-text-muted)] shrink-0" />
                <span>
                  Medical AI Labs & Health Center
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Clinical Advisory Disclaimer */}
        <div className="mt-10 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-bg)] p-4 text-[11px] leading-relaxed text-[var(--brand-text-muted)]">
          <p>
            <strong className="text-[var(--brand-text)]">Medical & Regulatory Notice:</strong> DermaScan AI is an assistive decision-support application built for educational and early screening triaging. It does not constitute formal medical diagnosis, prognosis, or prescription. Always seek the direct evaluation of a qualified board-certified dermatologist or primary care physician regarding any suspected skin lesion, acute inflammation, or changes in pigmentation.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="mt-8 pt-6 border-t border-[var(--brand-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-[11px]">
            © {new Date().getFullYear()} <strong>DermaScan AI Technologies Inc.</strong> All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#" className="hover:text-[var(--brand-primary)] transition">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--brand-primary)] transition">Terms of Service</a>
            <a href="#" className="hover:text-[var(--brand-primary)] transition">HIPAA Compliance</a>
            <a href="#" className="hover:text-[var(--brand-primary)] transition">Security Overview</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
