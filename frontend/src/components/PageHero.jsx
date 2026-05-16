export default function PageHero({ variant = 'default', title, subtitle, children }) {
  const kicker =
    variant === 'recruiter' ? 'Recruiter workspace' : variant === 'seeker' ? 'Job seeker workspace' : 'Dashboard'

  return (
    <header className={`page-hero page-hero-${variant}`}>
      <div className="page-hero-copy">
        <p className="page-hero-kicker">{kicker}</p>
        <h1>{title}</h1>
        {subtitle && <p className="muted page-hero-sub">{subtitle}</p>}
      </div>
      {children && <div className="page-hero-actions">{children}</div>}
    </header>
  )
}
