import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MOCK_DATA } from '../data/mockData'

// ─── Collapsible section wrapper ──────────────────────────
function ReportSection({ id, title, badge, badgeColor, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(12,12,12,0.7)',
        border: `1px solid ${open ? 'rgba(200,169,81,0.2)' : 'rgba(240,236,228,0.07)'}`,
        marginBottom: '10px',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-all duration-200"
        style={{
          background: open ? 'rgba(200,169,81,0.03)' : 'transparent',
          cursor: 'pointer', border: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,236,228,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'rgba(200,169,81,0.03)' : 'transparent'}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-ui font-semibold" style={{ fontSize: '15px', color: '#f0ece4' }}>
            {title}
          </h2>
          {badge && (
            <span
              className="font-ui font-medium px-2.5 py-0.5 rounded-full"
              style={{
                fontSize: '11px',
                background: badgeColor?.bg || 'rgba(200,169,81,0.1)',
                color: badgeColor?.text || '#C8A951',
                border: `1px solid ${badgeColor?.border || 'rgba(200,169,81,0.25)'}`,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            color: 'rgba(240,236,228,0.3)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </div>
      </button>

      {/* Content */}
      <div className={`collapsible-content ${open ? 'open' : ''}`}>
        <div style={{ borderTop: '1px solid rgba(240,236,228,0.05)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Outcome section ───────────────────────────────────────
function OutcomeContent({ outcome }) {
  const isFav = outcome.verdict === 'Favourable'
  return (
    <div className="px-6 py-6">
      {/* Verdict + stats */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: isFav ? 'rgba(76,175,100,0.08)' : 'rgba(231,76,60,0.08)',
            border: `1px solid ${isFav ? 'rgba(76,175,100,0.3)' : 'rgba(231,76,60,0.3)'}`,
          }}
        >
          {isFav ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF64" strokeWidth="2.5">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
          <span
            className="font-ui font-semibold"
            style={{
              fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em',
              color: isFav ? '#4CAF64' : '#e74c3c',
            }}
          >
            {outcome.verdict}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6 stats-grid">
        {[
          { label: 'Success Rate', value: `${outcome.success_rate}%` },
          { label: 'Cases Won', value: outcome.won?.toLocaleString() || '—' },
          { label: 'Similar Cases', value: outcome.similar_cases?.toLocaleString() || '—' },
        ].map(s => (
          <div
            key={s.label}
            className="text-center px-4 py-5 rounded-xl"
            style={{ background: 'rgba(200,169,81,0.04)', border: '1px solid rgba(200,169,81,0.12)' }}
          >
            <div className="font-display font-light" style={{ fontSize: '40px', color: '#C8A951', lineHeight: 1 }}>
              {s.value}
            </div>
            <div className="section-label mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Risk */}
      <div
        className="px-5 py-4 rounded-xl mb-6"
        style={{
          background: 'rgba(200,169,81,0.04)',
          borderLeft: '2px solid rgba(200,169,81,0.5)',
          border: '1px solid rgba(200,169,81,0.15)',
        }}
      >
        <p className="section-label mb-1.5">Risk Assessment</p>
        <p className="font-display font-light" style={{ fontSize: '16px', fontStyle: 'italic', color: 'rgba(240,236,228,0.65)', lineHeight: 1.6 }}>
          {outcome.risk}
        </p>
      </div>

      {/* Arguments grid */}
      <div className="grid grid-cols-2 gap-3 args-grid">
        <div className="rounded-xl p-5" style={{ background: 'rgba(76,175,100,0.04)', border: '1px solid rgba(76,175,100,0.15)' }}>
          <p className="font-ui font-semibold mb-3" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(76,175,100,0.8)' }}>
            Arguments that succeed
          </p>
          {(outcome.successful_arguments || []).map((a, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(76,175,100,0.7)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '3px' }}>
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <p className="font-display font-light" style={{ fontSize: '14.5px', color: 'rgba(240,236,228,0.6)', lineHeight: 1.55 }}>{a}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-5" style={{ background: 'rgba(231,76,60,0.04)', border: '1px solid rgba(231,76,60,0.15)' }}>
          <p className="font-ui font-semibold mb-3" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(231,76,60,0.7)' }}>
            Arguments to avoid
          </p>
          {(outcome.failed_arguments || []).map((a, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(231,76,60,0.7)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '3px' }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <p className="font-display font-light" style={{ fontSize: '14.5px', color: 'rgba(240,236,228,0.6)', lineHeight: 1.55 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Precedents section ────────────────────────────────────
function PrecedentsContent({ precedents }) {
  return (
    <div className="px-6 py-5">
      <div className="flex flex-col gap-3">
        {precedents.map((p, i) => (
          <div
            key={p.id || i}
            className="precedent-card rounded-xl p-5"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 500, color: '#f0ece4', lineHeight: 1.3 }}>
                {p.title}
              </h3>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'rgba(240,236,228,0.25)', flexShrink: 0, marginTop: '2px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C8A951'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,228,0.25)'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              )}
            </div>
            <p className="font-display font-light mb-3" style={{ fontSize: '14px', color: 'rgba(240,236,228,0.5)', lineHeight: 1.65 }}>
              {p.principle}
            </p>
            <div className="flex items-center gap-3">
              <span className="font-ui" style={{ fontSize: '10px', color: 'rgba(240,236,228,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {p.court}
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(240,236,228,0.2)', display: 'inline-block' }} />
              <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(240,236,228,0.3)' }}>{p.year}</span>
              {p.citations > 0 && (
                <>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(240,236,228,0.2)', display: 'inline-block' }} />
                  <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(200,169,81,0.6)' }}>
                    {p.citations} citations
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Argument section ──────────────────────────────────────
function ArgumentContent({ argument }) {
  const [displayed, setDisplayed] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const iRef = useRef(null)

  useEffect(() => {
    if (!argument) return
    setDisplayed('')
    setTypingDone(false)
    let i = 0
    iRef.current = setInterval(() => {
      i += 12
      if (i >= argument.length) {
        setDisplayed(argument)
        setTypingDone(true)
        clearInterval(iRef.current)
      } else {
        setDisplayed(argument.slice(0, i))
      }
    }, 16)
    return () => clearInterval(iRef.current)
  }, [argument])

  const handleCopy = () => {
    navigator.clipboard.writeText(argument).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="px-6 py-5">
      <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(8,8,8,0.9)', border: '1px solid rgba(240,236,228,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(240,236,228,0.05)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(231,76,60,0.6)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(200,169,81,0.6)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(76,175,100,0.6)' }} />
            <span className="font-mono ml-2" style={{ fontSize: '11px', color: 'rgba(240,236,228,0.25)' }}>
              legal_argument.txt
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ui font-medium transition-all duration-200"
            style={{
              fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase',
              background: copied ? 'rgba(76,175,100,0.1)' : 'rgba(240,236,228,0.05)',
              border: `1px solid ${copied ? 'rgba(76,175,100,0.3)' : 'rgba(240,236,228,0.1)'}`,
              color: copied ? '#4CAF64' : 'rgba(240,236,228,0.4)',
              cursor: 'pointer',
            }}
          >
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="px-5 py-5 overflow-x-auto">
          <pre className="argument-text">
            {displayed}
            {!typingDone && <span className="typing-cursor" />}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ─── Judge profile section ─────────────────────────────────
function JudgeContent({ profile }) {
  const initials = profile.name
    ? profile.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'JJ'
  const isFav = profile.favour_rate >= 50

  return (
    <div className="px-6 py-6">
      {/* Header row */}
      <div className="flex items-start gap-5 mb-6">
        <div
          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(200,169,81,0.08)',
            border: '1.5px solid rgba(200,169,81,0.35)',
            boxShadow: '0 0 16px rgba(200,169,81,0.1)',
          }}
        >
          <span className="font-display font-medium" style={{ fontSize: '20px', color: '#C8A951' }}>
            {initials}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-display font-medium mb-0.5" style={{ fontSize: '22px', color: '#f0ece4' }}>
            {profile.name}
          </h3>
          <p className="font-ui" style={{ fontSize: '13px', color: 'rgba(240,236,228,0.4)' }}>
            {profile.court}
          </p>
        </div>
        <div
          className="text-center px-5 py-3 rounded-xl flex-shrink-0"
          style={{
            background: isFav ? 'rgba(76,175,100,0.07)' : 'rgba(231,76,60,0.07)',
            border: `1px solid ${isFav ? 'rgba(76,175,100,0.25)' : 'rgba(231,76,60,0.25)'}`,
          }}
        >
          <div className="font-display font-light" style={{ fontSize: '32px', color: isFav ? '#4CAF64' : '#e74c3c', lineHeight: 1 }}>
            {profile.favour_rate}%
          </div>
          <div className="section-label mt-1">Petitioner favour</div>
        </div>
      </div>

      {/* Temperament */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
        style={{ background: 'rgba(240,236,228,0.03)', border: '1px solid rgba(240,236,228,0.06)' }}
      >
        <span className="section-label">Temperament</span>
        <span className="font-display font-light" style={{ fontSize: '15px', fontStyle: 'italic', color: 'rgba(240,236,228,0.6)' }}>
          {profile.temperament}
        </span>
      </div>

      {/* Tips */}
      <div className="mb-5">
        <p className="section-label mb-4">Advocacy Tips</p>
        {(profile.tips || []).map((tip, i) => (
          <div key={i} className="flex gap-4 mb-4 items-start">
            <span
              className="font-display font-light flex-shrink-0"
              style={{ fontSize: '36px', color: 'rgba(200,169,81,0.2)', lineHeight: 1, width: '28px', textAlign: 'right' }}
            >
              {i + 1}
            </span>
            <p
              className="font-display font-light"
              style={{ fontSize: '15px', color: 'rgba(240,236,228,0.6)', lineHeight: 1.65, paddingTop: '4px' }}
            >
              {tip}
            </p>
          </div>
        ))}
      </div>

      {/* Landmark ruling */}
      {profile.landmark && (
        <div
          className="px-5 py-4 rounded-xl"
          style={{
            background: 'rgba(200,169,81,0.04)',
            borderLeft: '2px solid rgba(200,169,81,0.4)',
            border: '1px solid rgba(200,169,81,0.12)',
          }}
        >
          <p className="section-label mb-2">Landmark Ruling</p>
          <p className="font-display font-light" style={{ fontSize: '15px', fontStyle: 'italic', color: 'rgba(240,236,228,0.55)', lineHeight: 1.6 }}>
            "{profile.landmark}"
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main Report Page ──────────────────────────────────────
export default function ReportPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Recover result from navigation state or sessionStorage
  const result = location.state?.result
    || JSON.parse(sessionStorage.getItem('nyaya_result') || 'null')
    || MOCK_DATA

  const [allExpanded, setAllExpanded] = useState(false)

  const handleDownloadPDF = useCallback(() => {
    // In production, call backend /download-report endpoint
    // For demo, trigger browser print dialog
    window.print()
  }, [])

  const handleShare = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      alert('Report URL copied to clipboard')
    }).catch(() => {
      alert('Share URL: ' + url)
    })
  }, [])

  const isFav = result.outcome?.verdict === 'Favourable'

  return (
    <div className="min-h-screen bg-ink grain relative">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Top bar */}
      <div
        className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(240,236,228,0.07)' }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-ui text-sm transition-colors duration-200"
            style={{ color: 'rgba(240,236,228,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#C8A951'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,228,0.35)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
            </svg>
            Home
          </button>
          <span style={{ color: 'rgba(240,236,228,0.1)' }}>|</span>
          <span className="font-display text-xl font-light" style={{ color: '#f0ece4' }}>
            Nyaya<span style={{ color: '#C8A951', fontStyle: 'italic' }}>AI</span>
          </span>
          <span
            className="font-ui font-medium px-2 py-0.5 rounded-md"
            style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(200,169,81,0.1)', color: '#C8A951' }}
          >
            Legal Report
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="btn-outline flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'none', border: '1px solid rgba(240,236,228,0.1)', cursor: 'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
          <button
            onClick={handleDownloadPDF}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px',
              background: '#C8A951', color: '#080808',
              border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.04em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E8C96A'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8A951'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 pb-24">

        {/* Report header */}
        <div
          className="mb-8 px-7 py-7 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(15,15,15,0.9) 0%, rgba(20,16,8,0.9) 100%)',
            border: '1px solid rgba(200,169,81,0.2)',
            animation: 'fadeUp 0.5s ease both',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="section-label mb-2">Legal Research Report</p>
              <h1 className="font-display font-light" style={{ fontSize: 'clamp(24px, 4vw, 32px)', color: '#f0ece4', lineHeight: 1.2 }}>
                {result.case_description?.length > 80
                  ? result.case_description.slice(0, 80) + '…'
                  : result.case_description}
              </h1>
            </div>
            <div
              className="flex-shrink-0 px-4 py-2 rounded-xl text-center"
              style={{
                background: isFav ? 'rgba(76,175,100,0.08)' : 'rgba(231,76,60,0.08)',
                border: `1px solid ${isFav ? 'rgba(76,175,100,0.25)' : 'rgba(231,76,60,0.25)'}`,
              }}
            >
              <div className="font-display font-light" style={{ fontSize: '30px', color: isFav ? '#4CAF64' : '#e74c3c', lineHeight: 1 }}>
                {result.outcome?.success_rate || 0}%
              </div>
              <div className="section-label mt-1">Success Rate</div>
            </div>
          </div>

          <div className="rule mb-4" />

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="section-label mb-0.5">Verdict</p>
              <p className="font-ui font-medium" style={{ fontSize: '13px', color: isFav ? '#4CAF64' : '#e74c3c' }}>
                {result.outcome?.verdict || '—'}
              </p>
            </div>
            {result.judge_name && (
              <div>
                <p className="section-label mb-0.5">Before</p>
                <p className="font-ui" style={{ fontSize: '13px', color: 'rgba(240,236,228,0.55)' }}>
                  {result.judge_name}
                </p>
              </div>
            )}
            <div>
              <p className="section-label mb-0.5">Precedents</p>
              <p className="font-ui" style={{ fontSize: '13px', color: 'rgba(240,236,228,0.55)' }}>
                {result.precedents?.length || 0} cases found
              </p>
            </div>
            <div>
              <p className="section-label mb-0.5">Generated by</p>
              <p className="font-ui" style={{ fontSize: '13px', color: 'rgba(200,169,81,0.6)' }}>
                NyayaAI 4-Agent Pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
          <ReportSection
            id="outcome"
            title="Outcome Prediction"
            badge={result.outcome?.verdict}
            badgeColor={isFav
              ? { bg: 'rgba(76,175,100,0.1)', text: '#4CAF64', border: 'rgba(76,175,100,0.25)' }
              : { bg: 'rgba(231,76,60,0.1)', text: '#e74c3c', border: 'rgba(231,76,60,0.25)' }
            }
            defaultOpen={true}
          >
            {result.outcome && <OutcomeContent outcome={result.outcome} />}
          </ReportSection>

          <ReportSection
            id="precedents"
            title="Relevant Precedents"
            badge={`${result.precedents?.length || 0} Cases`}
            defaultOpen={true}
          >
            {result.precedents && <PrecedentsContent precedents={result.precedents} />}
          </ReportSection>

          <ReportSection
            id="argument"
            title="Drafted Legal Argument"
            badge="5 Sections"
            defaultOpen={false}
          >
            {result.argument && <ArgumentContent argument={result.argument} />}
          </ReportSection>

          <ReportSection
            id="judge"
            title="Judge Profile"
            badge={result.judge_profile?.name ? 'Profile Ready' : 'Generic Profile'}
            defaultOpen={false}
          >
            {result.judge_profile && <JudgeContent profile={result.judge_profile} />}
          </ReportSection>
        </div>

        {/* Bottom actions */}
        <div
          className="mt-8 pt-6 flex items-center justify-between flex-wrap gap-4"
          style={{ borderTop: '1px solid rgba(240,236,228,0.07)' }}
        >
          <p className="font-ui" style={{ fontSize: '11px', color: 'rgba(240,236,228,0.2)', lineHeight: 1.6, maxWidth: '400px' }}>
            This report is generated by AI for research purposes only. It does not constitute legal advice.
            Always consult a qualified advocate for legal proceedings.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-outline flex items-center gap-2 px-5 py-2.5 rounded-xl"
            style={{ background: 'none', border: '1px solid rgba(240,236,228,0.1)', cursor: 'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
            </svg>
            Analyse another case
          </button>
        </div>
      </div>
    </div>
  )
}
