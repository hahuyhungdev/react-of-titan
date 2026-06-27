interface StatsCardProps {
  label: string;
  value: string | number;
  change?: number;
}

export function StatsCard({ label, value, change }: StatsCardProps) {
  return (
    <div className="stats-card">
      <span className="stats-card-label">{label}</span>
      <span className="stats-card-value">{value}</span>
      {change !== undefined && (
        <span className={`stats-card-change ${change >= 0 ? "positive" : "negative"}`}>
          {change >= 0 ? "+" : ""}
          {change}%
        </span>
      )}
    </div>
  );
}
