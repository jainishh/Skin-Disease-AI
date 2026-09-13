import { Star, MapPin, Phone, Clock, Stethoscope, ChevronRight } from "lucide-react";
import { Doctor } from "../types";

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
              <Stethoscope size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--brand-text)] leading-tight">{doctor.name}</h3>
              <p className="text-xs font-medium text-[var(--brand-secondary)] mt-0.5">{doctor.specialization}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-[var(--brand-warning)] bg-[var(--brand-warning)]/10 px-2.5 py-1 rounded-full shrink-0">
            <Star size={13} fill="currentColor" /> {doctor.rating}
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-[var(--brand-text-muted)]">
          <p className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />
            <span>
              {doctor.clinic_name}, {doctor.address}
              {doctor.distance_km !== undefined && (
                <span className="ml-1 font-mono text-[11px] font-semibold text-[var(--brand-secondary)]">· {doctor.distance_km} km</span>
              )}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Clock size={14} className="shrink-0 text-[var(--brand-text-muted)]" />
            <span>{doctor.timings}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--brand-border)] flex items-center justify-between gap-2">
        <a
          href={`tel:${doctor.phone}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] px-4 py-1.5 text-xs font-semibold text-white transition shadow-sm"
        >
          <Phone size={13} /> {doctor.phone}
        </a>
        <span className="text-[11px] font-semibold text-[var(--brand-text-muted)] flex items-center gap-0.5">
          Verified <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
}
