export default function StatsGrid({ items }) {
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <article key={item.label} className={`stat-card stat-${item.tone || 'default'}`}>
          <p className="stat-label">{item.label}</p>
          <p className="stat-value">{item.value}</p>
          {item.hint && <p className="stat-hint muted small">{item.hint}</p>}
        </article>
      ))}
    </div>
  )
}
