import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

interface Props {
  severity: "Mild" | "Moderate" | "Severe";
}

export default function SeverityBadge({ severity }: Props) {
  const { t } = useTranslation();

  if (severity === "Severe") {
    return (
      <span className="badge-severe inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
        <AlertTriangle size={13} className="shrink-0" />
        {t("dashboard.severe", { defaultValue: "Severe" })}
      </span>
    );
  }

  if (severity === "Moderate") {
    return (
      <span className="badge-moderate inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
        <AlertCircle size={13} className="shrink-0" />
        {t("dashboard.moderate", { defaultValue: "Moderate" })}
      </span>
    );
  }

  return (
    <span className="badge-mild inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
      <CheckCircle2 size={13} className="shrink-0" />
      {t("dashboard.mild", { defaultValue: "Mild" })}
    </span>
  );
}
