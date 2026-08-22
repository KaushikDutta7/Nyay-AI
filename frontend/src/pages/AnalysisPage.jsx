import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis'
import { AGENT_STEPS, MOCK_DATA } from '../data/mockData'

const STATUS_ICON = {
  pending: (
    <div className="w-5 h-5 rounded-full" style={{ border: '1px solid rgba(240,236,228,0.15)', background: 'rgba(15,15,15,0.5)' }} />
  ),
  running: (
    <div className="w-5 h-5 rounded-full status-running" style={{ background: 'rgba(200,169,81,0.15)', border: '1px solid rgba(200,169,81,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-2 h-2 rounded-full" style={{ background: '#C8A951' }} />
    </div>
  ),
  done: (
    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(76,175,100,0.15)', border: '1px solid rgba(76,175,100,0.4)' }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4CAF64" strokeWidth="3">
        <polyline points="20,6 9,17 4,12"/>
      </svg>
    </div>
  ),
}

function AgentCard({ agent, status, isActive, stepIdx }) {
  const [displayedStep, setDisplayedStep] = useState('')
  const [stepCount, setStepCount] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (status !== 'running') {
      clearInterval(intervalRef.current)
      return
    }
    setStepCount(0)
    setDisplayedStep(agent.steps[0])

    intervalRef.current = setInterval(() => {
      setStepCount(prev => {
        const next = prev + 1
        if (next < agent.steps.length) {
          setDisplayedStep(agent.steps[next])
        }
        return next
      })
    }, 650)

    return () => clearInterval(intervalRef.current)
  }, [status, agent.steps])

  const isDone   = status === 'done'
  const isPending = status === 'pending'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
        isActive ? 'agent-active' : isDone ? 'agent-done' : ''
      }`}
      style={{
        background: isPending ? 'rgba(10,10,10,0.6)' : isDone ? 'rgba(12,20,14,0.6)' : 'rgba(16,14,8,0.7)',
        border: isPending
          ? '1px solid rgba(240,236,228,0.06)'
          : isDone
            ? '1px solid rgba(76,175,100,0.25)'
            : '1px solid rgba(200,169,81,0.3)',
        opacity: isPending ? 0.45 : 1,
        padding: '24px',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Shimmer scan on active */}
      {isActive && <div className="shimmer-scan absolute inset-0 pointer-events-none" />}
      {/* Scan line */}
      {isActive && <div className="scan-line pointer-events-none" />}

      <div className="flex items-start gap-4">
        {/* Number + status */}
        <div className="flex flex-col items-center gap-3 pt-0.5">
          <span
            className="font-mono"
            style={{
              fontSize: '11px', fontWeight: 300,
              color: isDone ? 'rgba(76,175,100,0.5)' : isActive ? 'rgba(200,169,81,0.6)' : 'rgba(240,236,228,0.15)',
              letterSpacing: '0.1em',
            }}
          >
            {agent.number}
          </span>
          {STATUS_ICON[status]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h3
              className="font-ui font-semibold"
              style={{
                fontSize: '15px',
                color: isDone ? 'rgba(76,175,100,0.9)' : isActive ? '#C8A951' : 'rgba(240,236,228,0.35)',
                transition: 'color 0.3s ease',
              }}
            >
              {agent.label}
            </h3>
            {isActive && (
              <span
                className="font-ui font-medium px-2 py-0.5 rounded-full"
                style={{
                  fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'rgba(200,169,81,0.1)', color: '#C8A951',
                  border: '1px solid rgba(200,169,81,0.25)',
                }}
              >
                Running
              </span>
            )}
            {isDone && (
              <span
                className="font-ui font-medium px-2 py-0.5 rounded-full"
                style={{
                  fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'rgba(76,175,100,0.1)', color: '#4CAF64',
                  border: '1px solid rgba(76,175,100,0.2)',
                }}
              >
                Complete
              </span>
            )}
          </div>

          <p
            className="font-ui mb-3"
            style={{ fontSize: '12px', color: 'rgba(240,236,228,0.3)', lineHeight: 1.5 }}
          >
            {agent.description}
          </p>

          {/* Live action text */}
          {isActive && (
            <div
              className="flex items-center gap-2"
              style={{ animation: 'fadeIn 0.3s ease' }}
            >
              <div
                className="flex gap-1"
                style={{ paddingTop: '2px' }}
              >
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{
                      background: '#C8A951',
                      animation: `blink 1s step-end ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span
                className="font-mono"
                style={{ fontSize: '12px', color: 'rgba(200,169,81,0.75)', letterSpacing: '0.02em' }}
              >
                {displayedStep}
              </span>
            </div>
          )}

          {/* Done summary */}
          {isDone && (
            <div
              className="flex items-start gap-2"
              style={{ animation: 'fadeIn 0.4s ease' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(76,175,100,0.7)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <span
                className="font-ui"
                style={{ fontSize: '12.5px', color: 'rgba(76,175,100,0.7)', lineHeight: 1.5 }}
              >
                {agent.doneText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state: analysisState, run, reset } = useAnalysis()
  const hasRun = useRef(false)

  const caseDescription = location.state?.caseDescription || MOCK_DATA.case_description
  const judgeName = location.state?.judgeName || ''

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    run(caseDescription, judgeName).then(result => {
      if (result) {
        // Pre-store result in sessionStorage for report page
        sessionStorage.setItem('nyaya_result', JSON.stringify(result))
      }
    })
  }, [])

  const handleViewReport = () => {
    if (analysisState.result) {
      navigate('/report', { state: { result: analysisState.result } })
    }
  }

  const isDone = analysisState.status === 'done'
  const elapsedAgents = AGENT_STEPS.filter((_, i) => i <= analysisState.currentAgentIndex)
  const progressPct = isDone ? 100 : ((analysisState.currentAgentIndex + 0.5) / AGENT_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-ink grain relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-4xl mx-auto">
        <button
          onClick={() => { reset(); navigate('/') }}
          className="flex items-center gap-2 font-ui text-sm transition-colors duration-200"
          style={{ color: 'rgba(240,236,228,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = '#C8A951'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,228,0.35)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
          </svg>
          New case
        </button>
        <span className="font-display text-xl font-light" style={{ color: '#f0ece4' }}>
          Nyaya<span style={{ color: '#C8A951', fontStyle: 'italic' }}>AI</span>
        </span>
        <div style={{ width: '80px' }} />
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-24 pt-2">

        {/* Case description blockquote */}
        <div
          className="mb-8 px-6 py-5 rounded-2xl"
          style={{
            background: 'rgba(10,10,10,0.7)',
            border: '1px solid rgba(240,236,228,0.07)',
            borderLeft: '2px solid rgba(200,169,81,0.4)',
            animation: 'fadeUp 0.5s ease both',
          }}
        >
          <p
            className="section-label mb-2"
          >
            Case under analysis
          </p>
          <p
            className="font-display font-light"
            style={{
              fontSize: '17px', fontStyle: 'italic',
              color: 'rgba(240,236,228,0.65)', lineHeight: 1.7,
            }}
          >
            {caseDescription.length > 220 ? caseDescription.slice(0, 220) + '…' : caseDescription}
          </p>
          {judgeName && (
            <p className="font-ui text-xs mt-2" style={{ color: 'rgba(200,169,81,0.5)' }}>
              Before: {judgeName}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div
          className="mb-8"
          style={{ animation: 'fadeIn 0.5s ease 0.1s both' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="section-label">Pipeline Progress</span>
            <span
              className="font-mono"
              style={{ fontSize: '11px', color: 'rgba(200,169,81,0.6)' }}
            >
              {isDone ? '4 / 4 complete' : `${analysisState.currentAgentIndex + 1} / 4 running`}
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '2px', background: 'rgba(240,236,228,0.06)' }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #8B7535, #C8A951, #E8C96A)',
                borderRadius: '9999px',
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 0 8px rgba(200,169,81,0.5)',
              }}
            />
          </div>
        </div>

        {/* Narration header */}
        {!isDone && (
          <div
            className="mb-6 text-center"
            style={{ animation: 'fadeIn 0.4s ease both' }}
          >
            <NarrationText agentIndex={analysisState.currentAgentIndex} />
          </div>
        )}

        {/* Agent cards */}
        <div className="flex flex-col gap-3">
          {AGENT_STEPS.map((agent, i) => (
            <AgentCard
              key={agent.key}
              agent={agent}
              status={analysisState.agentStatuses[agent.key] || 'pending'}
              isActive={analysisState.agentStatuses[agent.key] === 'running'}
              stepIdx={i}
            />
          ))}
        </div>

        {/* Mock data notice */}
        {isDone && analysisState.usingMock && (
          <div
            className="mt-6 px-4 py-3 rounded-xl font-ui text-xs text-center"
            style={{
              background: 'rgba(200,169,81,0.05)',
              border: '1px solid rgba(200,169,81,0.15)',
              color: 'rgba(200,169,81,0.5)',
            }}
          >
            Backend not reachable — showing demo results for presentation purposes
          </div>
        )}

        {/* Done state — View Report CTA */}
        {isDone && (
          <div
            className="mt-10 flex flex-col items-center gap-4"
            style={{ animation: 'fadeUp 0.6s ease both' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: '#4CAF64', boxShadow: '0 0 8px rgba(76,175,100,0.6)' }}
              />
              <span className="font-ui font-medium" style={{ fontSize: '13px', color: 'rgba(240,236,228,0.5)' }}>
                All 4 agents completed successfully
              </span>
            </div>
            <button
              onClick={handleViewReport}
              className="btn-gold px-8 py-4 rounded-xl font-ui font-semibold"
              style={{
                fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase',
                background: '#C8A951', color: '#080808', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#E8C96A'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(200,169,81,0.35)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#C8A951'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              View Full Legal Report
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
              </svg>
            </button>
            <p className="font-ui text-xs" style={{ color: 'rgba(240,236,228,0.2)' }}>
              Precedents, drafted argument, outcome prediction, judge profile
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const NARRATIONS = [
  'Precedent Hunter is searching the vector database of 50,000+ Indian court judgements...',
  'Argument Drafter is composing a formal legal argument with five-section structure...',
  'Outcome Predictor is analysing patterns from similar cases in Indian courts...',
  'Judge Profiler is building a judicial profile from historical judgements...',
]

function NarrationText({ agentIndex }) {
  const text = NARRATIONS[agentIndex] || ''
  const [displayed, setDisplayed] = useState('')
  const iRef = useRef(null)

  useEffect(() => {
    setDisplayed('')
    let i = 0
    iRef.current = setInterval(() => {
      i += 2
      if (i >= text.length) {
        setDisplayed(text)
        clearInterval(iRef.current)
      } else {
        setDisplayed(text.slice(0, i))
      }
    }, 24)
    return () => clearInterval(iRef.current)
  }, [text])

  return (
    <p className="font-display font-light" style={{ fontSize: '17px', fontStyle: 'italic', color: 'rgba(240,236,228,0.4)' }}>
      {displayed}
      <span className="typing-cursor" />
    </p>
  )
}
