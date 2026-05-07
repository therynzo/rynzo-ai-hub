const stats = [
  { value: "12K+", label: "Active users" },
  { value: "98%", label: "Uptime SLA" },
  { value: "<300ms", label: "Avg response" },
  { value: "50M+", label: "AI requests" },
];

export function Stats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass glow-border rounded-2xl p-5 text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-gradient-primary">{s.value}</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}