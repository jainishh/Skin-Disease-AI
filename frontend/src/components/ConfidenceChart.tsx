import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DiseasePrediction } from "../types";
import { useTheme } from "../context/ThemeContext";

export default function ConfidenceChart({ predictions }: { predictions: DiseasePrediction[] }) {
  const { theme } = useTheme();

  // Medical green & emerald mint palette
  const lightColors = ["#0F766E", "#14B8A6", "#16A34A", "#64748B"];
  const darkColors = ["#10B981", "#34D399", "#4ADE80", "#94A3B8"];
  const colors = theme === "dark" ? darkColors : lightColors;

  const data = predictions.map((p) => ({
    name: p.title || p.disease.replace(/_/g, " "),
    confidence: Math.round(p.confidence * 1000) / 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} layout="vertical" margin={{ left: 5, right: 25, top: 5, bottom: 5 }}>
        <XAxis 
          type="number" 
          domain={[0, 100]} 
          tick={{ fontSize: 11, fontFamily: "IBM Plex Mono", fill: "var(--brand-text-muted)" }} 
          unit="%" 
          stroke="var(--brand-border)"
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={130} 
          tick={{ fontSize: 11, fill: "var(--brand-text)" }} 
          stroke="var(--brand-border)"
        />
        <Tooltip 
          formatter={(v: number) => [`${v}%`, "Confidence"]}
          contentStyle={{
            backgroundColor: "var(--brand-surface)",
            borderColor: "var(--brand-border)",
            borderRadius: "0.75rem",
            color: "var(--brand-text)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="confidence" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
