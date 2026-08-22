import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:8000'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [purpose, setPurpose] = useState('')
  const [hearingDates, setHearingDates] = useState([''])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addHearingRow = () => setHearingDates(prev => [...prev, ''])
  const updateHearing = (i, val) => {
    setHearingDates(prev => prev.map((d, idx) => (idx === i ? val : d)))
  }
  const removeHearing = (i) => setHearingDates(prev => prev.filter((_, idx) => idx !== i))

  const canSubmit = name.trim().length > 0 && description.trim().length > 10 && !saving

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/cases/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          purpose: purpose.trim(),
          hearing_dates: hearingDates.filter(Boolean).map(d => new Date(d).toISOString()),
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      navigate(`/case/${data.case_id}/qa`)
    } catch (err) {
      setError('Could not create the case — is the backend running on :8000?')
    } finally {
      setSaving(false)
    }
  }, [canSubmit, name, description, purpose, hearingDates, navigate])

  return (
    <div className="min-h-screen bg-ink grain relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px', height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(200,169,81,0.04) 0%, transparent 70%)',
        }}
      />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="font-display text-2xl font-light text-parchment tracking-wide"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Nyaya<span style={{ color: '#C8A951', fontStyle: 'italic' }}>AI</span>
        </button>
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate('/history')}
            className="font-ui text-xs font-medium"
            style={{ color: 'rgba(240,236,228,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View history
          </button>
          <span className="font-ui text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(240,236,228,0.3)' }}>
            Case Dashboard
          </span>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-20" style={{ animation: 'fadeUp 0.6s ease 0.1s both' }}>
        <h1
          className="font-display font-light text-parchment mb-2"
          style={{ fontSize: 'clamp(30px, 5vw, 42px)', letterSpacing: '-0.01em' }}
        >
          New <em style={{ color: '#C8A951', fontStyle: 'italic' }}>case file</em>
        </h1>
        <p className="font-ui font-light mb-8" style={{ fontSize: '14px', color: 'rgba(240,236,228,0.45)', lineHeight: 1.6 }}>
          Store the case, schedule its hearings, and get an AI research pass — all in one place.
        </p>

        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: '#0f0f0f', border: '1px solid rgba(240,236,228,0.09)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
        >
          <Field label="Case name">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sharma vs. State of Punjab"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the facts of the case..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>

          <Field label="Purpose of the case">
            <input
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="e.g. Seeking compensation for wrongful termination"
              style={inputStyle}
            />
          </Field>

          <div className="mb-2">
            <label className="section-label block mb-2" style={labelStyle}>Hearing dates</label>
            {hearingDates.map((d, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="datetime-local"
                  value={d}
                  onChange={e => updateHearing(i, e.target.value)}
                  style={inputStyle}
                />
                {hearingDates.length > 1 && (
                  <button
                    onClick={() => removeHearing(i)}
                    className="font-ui"
                    style={{ color: 'rgba(240,236,228,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 6px' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addHearingRow}
              className="font-ui text-xs font-medium"
              style={{ color: '#C8A951', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}
            >
              + Add another hearing date
            </button>
          </div>

          {error && (
            <p className="font-ui text-xs mt-4" style={{ color: '#e06a6a' }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="font-ui text-sm font-medium mt-6 w-full py-3 rounded-xl transition-all duration-200"
            style={{
              background: canSubmit ? '#C8A951' : 'rgba(240,236,228,0.07)',
              color: canSubmit ? '#080808' : 'rgba(240,236,228,0.2)',
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Creating case…' : 'Create case & continue'}
          </button>
          {saving && (
            <p className="font-ui text-xs mt-3 text-center" style={{ color: 'rgba(240,236,228,0.35)' }}>
              Running research agents — this can take up to a minute…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-5">
      <label className="section-label block mb-2" style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

const labelStyle = {
  fontSize: '11px',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(240,236,228,0.4)',
}

const inputStyle = {
  width: '100%',
  background: 'rgba(8,8,8,0.7)',
  border: '1px solid rgba(240,236,228,0.12)',
  borderRadius: '10px',
  padding: '11px 14px',
  color: '#f0ece4',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13.5px',
  outline: 'none',
}