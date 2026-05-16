import { useEffect, useState } from 'react'

const slides = [
  {
    title: 'Find Better Opportunities',
    text: 'Discover curated openings that match your skills and profile.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Hire with Confidence',
    text: 'Recruiters can post jobs and manage candidate pipelines in one place.',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Track Growth with Insights',
    text: 'Use analytics and application trends to make better decisions.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
  },
]

export default function AuthShowcase() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <aside className="auth-showcase card" aria-label="Product highlights">
      <div className="auth-showcase-image-wrap">
        <img src={slides[active].image} alt={slides[active].title} className="auth-showcase-image" />
      </div>
      <div className="auth-showcase-copy">
        <p className="small muted">Smart Job Portal</p>
        <h2>{slides[active].title}</h2>
        <p className="muted">{slides[active].text}</p>
      </div>
      <div className="auth-showcase-dots" role="tablist" aria-label="Showcase slides">
        {slides.map((slide, idx) => (
          <button
            key={slide.title}
            type="button"
            className={`dot ${idx === active ? 'active' : ''}`}
            onClick={() => setActive(idx)}
            aria-label={`View slide ${idx + 1}`}
            aria-selected={idx === active}
          />
        ))}
      </div>
    </aside>
  )
}
