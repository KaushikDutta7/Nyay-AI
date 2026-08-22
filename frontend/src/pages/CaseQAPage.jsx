import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:8000'

export default function CaseQAPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [qa, setQa] = useState([])
  const [hearings, setHearings] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [suggested, setSuggested] = useState([])
  const [asking, setAsking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [qaRes, hearingsRes, analysisRes, suggestedRes] = await Promise.all([
          fetch(`${API_URL}/case/${caseId}/qa`),
          fetch(`${API_URL}/case/${caseId}/hearings`),
          fetch(`${API_URL}/case/${caseId}/full-analysis`),
          fetch(`${API_URL}/case/${caseId}/suggested-questions`),
        ])
        if (cancelled) return
        setQa(await qaRes.json())
        setHearings(await hearingsRes.json())
        setAnalysis(await analysisRes.json())
        const s = await suggestedRes.json()
        setSuggested(s.suggested_questions || [])
      } catch (err) {
        // best-effort — page still renders with whatever loaded
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [caseId])

  const askQuestion = useCallback(async (q) => {
    if (!q.trim() || asking) return
    setAsking(true)
    try {
      const res = await fetch(`${API_URL}/case/${caseId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.trim() }),
      })
      const data = await res.json()
      setQa(prev => [...prev, data])
      setQuestion('')
    } catch (err) {
      // no-op — leave input as-is so the user can retry
    } finally {
      setAsking(false)
    }
  }, [caseId, asking])

  return (
    <div className="min-h-screen bg-ink grain relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-3xl mx-auto">
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-24" style={{ animation: 'fadeUp 0.6s ease 0.1s both' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <h1
              className="font-display font-light text-parchment mb-1"
              style={{ fontSize: 'clamp(26px, 4vw, 36px)' }}
            >
              {analysis?.name || 'Case'}
            </h1>
            {analysis?.purpose && (
              <p className="font-ui font-light mb-6" style={{ fontSize: '13.5px', color: 'rgba(240,236,228,0.45)' }}>
                {analysis.purpose}
              </p>
            )}

            {analysis?.analysis ? (
              <Card title="Case analysis" defaultOpen>
                <p className="font-ui" style={{ fontSize: '13.5px', lineHeight: 1.75, color: 'rgba(240,236,228,0.7)', whiteSpace: 'pre-wrap' }}>
                  {analysis.analysis}
                </p>
              </Card>
            ) : (
              <Card title="Case analysis" defaultOpen>
                <p className="font-ui text-xs" style={{ color: 'rgba(240,236,228,0.35)' }}>
                  Analysis is still processing — refresh in a moment.
                </p>
              </Card>
            )}

            <Card title={`Scheduled hearings${hearings.length ? ` (${hearings.length})` : ''}`}>
              {hearings.length === 0 ? (
                <p className="font-ui text-xs" style={{ color: 'rgba(240,236,228,0.35)' }}>No hearing dates on file.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {hearings.map(h => (
                    <div key={h.id} className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-ui text-xs" style={{ color: 'rgba(240,236,228,0.65)' }}>
                        {new Date(h.hearing_date).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-3">
                        <a
                          href={h.google_calendar_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-ui text-xs font-medium"
                          style={{ color: '#4CAF64' }}
                        >
                          Google Calendar
                        </a>
                        <a
                          href={`${API_URL}${h.ics_url}`}
                          className="font-ui text-xs font-medium"
                          style={{ color: '#C8A951' }}
                        >
                          Outlook / Apple (.ics)
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {suggested.length > 0 && (
              <Card title="AI-suggested questions">
                <div className="flex flex-col gap-2">
                  {suggested.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => askQuestion(q)}
                      disabled={asking}
                      className="font-ui text-left px-3.5 py-2.5 rounded-lg transition-all duration-150"
                      style={{
                        fontSize: '13px',
                        background: 'rgba(200,169,81,0.05)',
                        border: '1px solid rgba(200,169,81,0.18)',
                        color: 'rgba(240,236,228,0.75)',
                        cursor: asking ? 'default' : 'pointer',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {qa.length > 0 && (
              <div className="mb-5 flex flex-col gap-3">
                {qa.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3.5"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(240,236,228,0.06)' }}
                  >
                    <p className="font-ui font-medium mb-1.5" style={{ fontSize: '13px', color: '#C8A951' }}>
                      {item.question}
                    </p>
                    <p className="font-ui" style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(240,236,228,0.65)' }}>
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 sticky bottom-4">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askQuestion(question)}
                placeholder="Ask a question about this case..."
                className="font-ui"
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '10px',
                  background: '#0f0f0f', border: '1px solid rgba(240,236,228,0.12)',
                  color: '#f0ece4', fontSize: '13.5px', outline: 'none',
                }}
              />
              <button
                onClick={() => askQuestion(question)}
                disabled={asking || !question.trim()}
                className="font-ui text-sm font-medium px-5 py-3 rounded-lg"
                style={{
                  background: asking || !question.trim() ? 'rgba(240,236,228,0.07)' : '#C8A951',
                  color: asking || !question.trim() ? 'rgba(240,236,228,0.2)' : '#080808',
                  border: 'none',
                  cursor: asking || !question.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {asking ? '…' : 'Ask'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Card({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className="rounded-2xl overflow-hidden mb-4"
      style={{ background: 'rgba(12,12,12,0.7)', border: `1px solid ${open ? 'rgba(200,169,81,0.2)' : 'rgba(240,236,228,0.07)'}`, transition: 'border-color 0.2s ease' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ background: open ? 'rgba(200,169,81,0.03)' : 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <h2 className="font-ui font-semibold" style={{ fontSize: '13.5px', color: '#f0ece4' }}>{title}</h2>
        <div style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', color: 'rgba(240,236,228,0.3)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </button>
      {open && <div className="px-5 pb-5" style={{ animation: 'fadeIn 0.2s ease both' }}>{children}</div>}
    </div>
  )
}

function LoadingSkeleton() {
  const shimmer = { background: 'rgba(240,236,228,0.05)', borderRadius: '10px' }
  return (
    <div style={{ animation: 'fadeIn 0.3s ease both' }}>
      <div style={{ ...shimmer, height: 32, width: '60%', marginBottom: 10 }} />
      <div style={{ ...shimmer, height: 14, width: '40%', marginBottom: 28 }} />
      <div style={{ ...shimmer, height: 90, width: '100%', marginBottom: 16, borderRadius: 16 }} />
      <div style={{ ...shimmer, height: 60, width: '100%', marginBottom: 16, borderRadius: 16 }} />
      <div style={{ ...shimmer, height: 60, width: '100%', borderRadius: 16 }} />
    </div>
  )
}
