import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:8000'

const STATUS_COLORS = {
  completed: { bg: 'rgba(76,175,100,0.1)', text: '#4CAF64', border: 'rgba(76,175,100,0.25)' },
  processing: { bg: 'rgba(200,169,81,0.1)', text: '#C8A951', border: 'rgba(200,169,81,0.25)' },
  failed: { bg: 'rgba(231,76,60,0.1)', text: '#e74c3c', border: 'rgba(231,76,60,0.25)' },
  pending: { bg: 'rgba(240,236,228,0.06)', text: 'rgba(240,236,228,0.4)', border: 'rgba(240,236,228,0.12)' },
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/cases`)
      .then(r => r.json())
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = cases.filter(c => {
    const q = search.toLowerCase()
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.case_description || '').toLowerCase().includes(q) ||
      (c.purpose || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-ink grain relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="font-display text-2xl font-light text-parchment tracking-wide"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Nyaya<span style={{ color: '#C8A951', fontStyle: 'italic' }}>AI</span>
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="font-ui text-xs font-medium"
          style={{ color: 'rgba(240,236,228,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          + New case
        </button>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-24" style={{ animation: 'fadeUp 0.6s ease 0.1s both' }}>
        <h1
          className="font-display font-light text-parchment mb-2"
          style={{ fontSize: 'clamp(28px, 4.5vw, 38px)' }}
        >
          Case <em style={{ color: '#C8A951', fontStyle: 'italic' }}>history</em>
        </h1>
        <p className="font-ui font-light mb-6" style={{ fontSize: '13.5px', color: 'rgba(240,236,228,0.45)' }}>
          All cases you've created, in one place.
        </p>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, purpose, or description..."
          className="font-ui mb-6"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '10px',
            background: '#0f0f0f', border: '1px solid rgba(240,236,228,0.12)',
            color: '#f0ece4', fontSize: '13.5px', outline: 'none',
          }}
        />

        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: 'rgba(12,12,12,0.5)', border: '1px solid rgba(240,236,228,0.07)' }}
          >
            <p className="font-ui text-sm" style={{ color: 'rgba(240,236,228,0.35)' }}>
              {cases.length === 0 ? 'No cases yet — create your first one.' : 'No cases match your search.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(c => {
              const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS.pending
              return (
                <button
                  key={c.case_id}
                  onClick={() => navigate(`/case/${c.case_id}/qa`)}
                  className="text-left rounded-2xl px-5 py-4 transition-all duration-200"
                  style={{
                    background: 'rgba(12,12,12,0.7)',
                    border: '1px solid rgba(240,236,228,0.07)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,169,81,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(240,236,228,0.07)'}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 500, color: '#f0ece4' }}>
                      {c.name || 'Untitled case'}
                    </h3>
                    <span
                      className="font-ui font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
                        background: statusStyle.bg, color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                  {c.purpose && (
                    <p className="font-ui text-xs mb-2" style={{ color: 'rgba(200,169,81,0.55)' }}>
                      {c.purpose}
                    </p>
                  )}
                  <p className="font-ui" style={{ fontSize: '13px', color: 'rgba(240,236,228,0.45)', lineHeight: 1.5 }}>
                    {c.case_description}
                  </p>
                  <p className="font-mono mt-2" style={{ fontSize: '11px', color: 'rgba(240,236,228,0.25)' }}>
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  const shimmer = { background: 'rgba(240,236,228,0.05)', borderRadius: '16px' }
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map(i => (
        <div key={i} style={{ ...shimmer, height: 90, width: '100%' }} />
      ))}
    </div>
  )
}