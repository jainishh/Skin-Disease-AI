import { useTranslation } from "react-i18next";

interface Props {
  severity: "Mild" | "Moderate" | "Severe";
}

const CONFIG = {
  Mild: {
    cls: "badge-mild",
    icon: "🌿",
    key: "dashboard.mild",
  },
  Moderate: {
    cls: "badge-moderate",
    icon: "⚠️",
    key: "dashboard.moderate",
  },
  Severe: {
    cls: "badge-severe",
    icon: "🚨",
    key: "dashboard.severe",
  },
};

export default function SeverityBadge({ severity }: Props) {
  const { t } = useTranslation();
  const cfg = CONFIG[severity] ?? CONFIG.Mild;
  return (
    <span className={cfg.cls}>
      {cfg.icon} {t(cfg.key, { defaultValue: severity })}
    </span>
  );
}
