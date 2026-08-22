import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PolyCanvas from '../components/PolyCanvas'

const EXAMPLE_CASES = [
  'My client\'s land was acquired for highway construction. Compensation is below market value and individual notice was never served.',
  'Cheque bounced under Section 138 NI Act. Accused claims the cheque was not for discharge of legally enforceable debt.',
  'Employee terminated without notice or inquiry. Company claims misconduct but no departmental proceeding was held.',
  'Consumer paid for flat in 2018, builder not delivered. Seeking possession or refund with interest and compensation.',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [caseText, setCaseText] = useState('')
  const [judgeName, setJudgeName] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [focused, setFocused] = useState(false)
  const [hoverSubmit, setHoverSubmit] = useState(false)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSubmit = useCallback(() => {
    if (!caseText.trim()) return
    navigate('/analysis', {
      state: { caseDescription: caseText.trim(), judgeName: judgeName.trim() }
    })
  }, [caseText, judgeName, navigate])

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  const handlePDF = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfFile(file)
    const reader = new FileReader()
    reader.onload = (evt) => {
      // In production, send PDF to backend for text extraction
      // For demo, just set a placeholder
      setCaseText(prev => prev || `[PDF uploaded: ${file.name}] Case details extracted from document.`)
    }
    reader.readAsDataURL(file)
  }

  const useExample = (text) => {
    setCaseText(text)
    textareaRef.current?.focus()
  }

  const canSubmit = caseText.trim().length > 10

  return (
    <div className="min-h-screen bg-ink grain relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

      {/* Radial glow at center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px', height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(200,169,81,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-light text-parchment tracking-wide">
            Nyaya<span style={{ color: '#C8A951', fontStyle: 'italic' }}>AI</span>
          </span>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ border: '1px solid rgba(200,169,81,0.2)', background: 'rgba(200,169,81,0.05)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'pulseGoldDot 2s infinite' }} />
            <span className="font-ui text-xs font-medium" style={{ color: 'rgba(200,169,81,0.8)', letterSpacing: '0.1em' }}>
              LIVE
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="font-ui text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(240,236,228,0.3)' }}>
            5 Crore Cases Pending in India
          </span>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">

        {/* 3D canvas — positioned right */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: '3%', top: '50%', transform: 'translateY(-50%)',
            opacity: 0.7,
            display: 'none',
          }}
        />

        {/* Hero text */}
        <div
          className="text-center mb-10"
          style={{ animation: 'fadeUp 0.7s ease both' }}
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            {/* 3D animated poly icon */}
            <div style={{ animation: 'floatBadge 5s ease-in-out infinite', animationDelay: '0s' }}>
              <PolyCanvas size={64} />
            </div>
          </div>

          <h1
            className="font-display font-light text-parchment text-glow"
            style={{ fontSize: 'clamp(48px, 8vw, 80px)', lineHeight: 1.05, letterSpacing: '-0.01em' }}
          >
            India's first autonomous<br />
            <em style={{ color: '#C8A951', fontStyle: 'italic' }}>legal research agent</em>
          </h1>

          <p
            className="font-ui font-light mt-5 max-w-lg mx-auto"
            style={{
              fontSize: '15px', lineHeight: 1.7,
              color: 'rgba(240,236,228,0.45)',
              animation: 'fadeUp 0.7s ease 0.15s both',
            }}
          >
            Describe any legal case. Four autonomous AI agents will search precedents,
            draft arguments, predict outcomes, and profile the bench — in seconds.
          </p>
        </div>

        {/* Input container — Claude-style */}
        <div
          className="w-full max-w-2xl input-focus-ring"
          style={{
            background: '#0f0f0f',
            border: `1px solid ${focused ? 'rgba(200,169,81,0.35)' : 'rgba(240,236,228,0.09)'}`,
            borderRadius: '16px',
            boxShadow: focused
              ? '0 0 0 1px rgba(200,169,81,0.15), 0 8px 40px rgba(0,0,0,0.6)'
              : '0 4px 24px rgba(0,0,0,0.5)',
            transition: 'all 0.25s ease',
            animation: 'fadeUp 0.7s ease 0.25s both',
          }}
        >
          {/* PDF attachment banner */}
          {pdfFile && (
            <div
              className="flex items-center gap-3 px-4 py-2.5 mx-3 mt-3 rounded-lg"
              style={{ background: 'rgba(200,169,81,0.08)', border: '1px solid rgba(200,169,81,0.2)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A951" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
              </svg>
              <span className="font-ui text-xs" style={{ color: 'rgba(200,169,81,0.8)' }}>{pdfFile.name}</span>
              <button
                onClick={() => setPdfFile(null)}
                className="ml-auto"
                style={{ color: 'rgba(240,236,228,0.3)', fontSize: '16px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={caseText}
            onChange={e => setCaseText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your case in plain language — the AI will handle the legal research..."
            rows={5}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '20px 22px 12px',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '18px',
              fontStyle: caseText ? 'normal' : 'italic',
              fontWeight: 300,
              color: '#f0ece4',
              lineHeight: 1.75,
              resize: 'none',
              caretColor: '#C8A951',
            }}
          />

          {/* Toolbar row */}
          <div
            className="flex items-center justify-between px-3 pb-3 pt-1"
            style={{ borderTop: '1px solid rgba(240,236,228,0.05)', marginTop: '4px' }}
          >
            <div className="flex items-center gap-2">
              {/* PDF upload */}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePDF}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs font-medium transition-all duration-200"
                style={{
                  color: 'rgba(240,236,228,0.4)',
                  background: 'transparent',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#C8A951'
                  e.currentTarget.style.borderColor = 'rgba(200,169,81,0.2)'
                  e.currentTarget.style.background = 'rgba(200,169,81,0.04)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(240,236,228,0.4)'
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                Attach PDF
              </button>

              {/* Judge name */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ border: '1px solid rgba(240,236,228,0.07)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,236,228,0.3)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  value={judgeName}
                  onChange={e => setJudgeName(e.target.value)}
                  placeholder="Presiding judge (optional)"
                  className="font-ui text-xs bg-transparent border-none outline-none"
                  style={{
                    color: 'rgba(240,236,228,0.5)',
                    width: '160px',
                    caretColor: '#C8A951',
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              onMouseEnter={() => setHoverSubmit(true)}
              onMouseLeave={() => setHoverSubmit(false)}
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: canSubmit
                  ? (hoverSubmit ? '#E8C96A' : '#C8A951')
                  : 'rgba(240,236,228,0.07)',
                border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: canSubmit && hoverSubmit ? '0 4px 16px rgba(200,169,81,0.35)' : 'none',
                transform: canSubmit && hoverSubmit ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={canSubmit ? '#080808' : 'rgba(240,236,228,0.2)'} strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
              </svg>
            </button>
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')}>Manage My Cases</button>

        {/* Example cases */}
        <div
          className="w-full max-w-2xl mt-5"
          style={{ animation: 'fadeUp 0.7s ease 0.35s both' }}
        >
          <p className="section-label text-center mb-3">Example cases</p>
          <div className="grid grid-cols-2 gap-2">
            {EXAMPLE_CASES.map((ex, i) => (
              <button
                key={i}
                onClick={() => useExample(ex)}
                className="text-left px-4 py-3 rounded-xl font-ui transition-all duration-200"
                style={{
                  background: 'rgba(15,15,15,0.8)',
                  border: '1px solid rgba(240,236,228,0.06)',
                  fontSize: '12px',
                  color: 'rgba(240,236,228,0.45)',
                  lineHeight: 1.55,
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(200,169,81,0.2)'
                  e.currentTarget.style.color = 'rgba(240,236,228,0.7)'
                  e.currentTarget.style.background = 'rgba(200,169,81,0.03)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(240,236,228,0.06)'
                  e.currentTarget.style.color = 'rgba(240,236,228,0.45)'
                  e.currentTarget.style.background = 'rgba(15,15,15,0.8)'
                }}
              >
                {ex.length > 90 ? ex.slice(0, 90) + '...' : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Agent capabilities pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 mt-8"
          style={{ animation: 'fadeUp 0.7s ease 0.45s both' }}
        >
          {[
            { n: '01', label: 'Precedent Hunter' },
            { n: '02', label: 'Argument Drafter' },
            { n: '03', label: 'Outcome Predictor' },
            { n: '04', label: 'Judge Profiler' },
          ].map(a => (
            <div
              key={a.n}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-ui"
              style={{
                background: 'rgba(15,15,15,0.6)',
                border: '1px solid rgba(240,236,228,0.07)',
                fontSize: '12px',
              }}
            >
              <span style={{ color: 'rgba(200,169,81,0.6)', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
                {a.n}
              </span>
              <span style={{ color: 'rgba(240,236,228,0.5)' }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Keyboard hint */}
        <p
          className="font-ui mt-5"
          style={{
            fontSize: '11px', color: 'rgba(240,236,228,0.2)',
            letterSpacing: '0.05em',
            animation: 'fadeIn 0.7s ease 0.6s both',
          }}
        >
          
        </p>
      </div>
    </div>
  )
}
