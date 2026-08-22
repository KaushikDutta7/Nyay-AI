import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API_URL = 'http://localhost:8000'

export default function CaseQAPage() {
  const { caseId } = useParams()
  const [question, setQuestion] = useState('')
  const [qa, setQa] = useState([])
  const [hearings, setHearings] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [suggested, setSuggested] = useState([])
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/case/${caseId}/qa`).then(r => r.json()).then(setQa)
    fetch(`${API_URL}/case/${caseId}/hearings`).then(r => r.json()).then(setHearings)
    fetch(`${API_URL}/case/${caseId}/full-analysis`).then(r => r.json()).then(setAnalysis)
    fetch(`${API_URL}/case/${caseId}/suggested-questions`)
      .then(r => r.json())
      .then(d => setSuggested(d.suggested_questions || []))
  }, [caseId])

  const askQuestion = async (q) => {
    if (!q.trim()) return
    setAsking(true)
    const res = await fetch(`${API_URL}/case/${caseId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    })
    const data = await res.json()
    setQa(prev => [...prev, data])
    setQuestion('')
    setAsking(false)
  }

  return (
    <div style={{ maxWidth: 750, margin: '0 auto', padding: '48px 24px', color: '#f0ece4' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>{analysis?.name || 'Case Q&A'}</h1>
      <p style={{ color: 'rgba(240,236,228,0.5)', marginBottom: 24 }}>{analysis?.purpose}</p>

      {analysis?.analysis && (
        <div style={{ marginBottom: 24, padding: 16, background: 'rgba(200,169,81,0.05)', borderRadius: 8, border: '1px solid rgba(200,169,81,0.15)' }}>
          <h3 style={{ color: '#C8A951', marginBottom: 8 }}>Case Analysis</h3>
          <p style={{ lineHeight: 1.6, fontSize: 14 }}>{analysis.analysis}</p>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h3>Scheduled Hearings</h3>
        {hearings.map(h => (
          <div key={h.id} style={{ marginBottom: 6 }}>
            {new Date(h.hearing_date).toLocaleString()} —{' '}
            <a href={`${API_URL}/case/${caseId}/hearings/${h.id}/calendar.ics`} style={{ color: '#4CAF64' }}>
              Add to Calendar
            </a>
          </div>
        ))}
      </div>

      {suggested.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 10 }}>AI-Suggested Questions for This Case</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggested.map((q, i) => (
              <button
                key={i}
                onClick={() => askQuestion(q)}
                style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(200,169,81,0.06)', border: '1px solid rgba(200,169,81,0.2)',
                  color: '#f0ece4', cursor: 'pointer', fontSize: 13.5,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        {qa.map((item, i) => (
          <div key={i} style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <p style={{ color: '#C8A951', fontWeight: 600 }}>Q: {item.question}</p>
            <p style={{ marginTop: 6 }}>{item.answer}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask your own question about this case..."
          style={{ flex: 1, padding: 10, borderRadius: 8, background: 'rgba(8,8,8,0.7)', border: '1px solid rgba(240,236,228,0.15)', color: '#f0ece4' }}
        />
        <button onClick={() => askQuestion(question)} disabled={asking} style={{ background: '#C8A951', padding: '10px 16px', borderRadius: 8 }}>
          {asking ? '...' : 'Ask'}
        </button>
      </div>
    </div>
  )
}