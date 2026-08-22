import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:8000'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [purpose, setPurpose] = useState('')
  const [hearingDates, setHearingDates] = useState([''])
  const [saving, setSaving] = useState(false)

  const addHearingRow = () => setHearingDates([...hearingDates, ''])
  const updateHearing = (i, val) => {
    const copy = [...hearingDates]
    copy[i] = val
    setHearingDates(copy)
  }
  const removeHearing = (i) => setHearingDates(hearingDates.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!name || !description) return
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/cases/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, purpose,
          hearing_dates: hearingDates.filter(Boolean).map(d => new Date(d).toISOString()),
        }),
      })
      const data = await res.json()
      navigate(`/case/${data.case_id}/qa`)
    } catch (err) {
      alert('Could not create case — is the backend running?')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px', color: '#f0ece4' }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>New Case File</h1>

      <label>Case Name</label>
      <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

      <label>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={inputStyle} />

      <label>Purpose of the Case</label>
      <input value={purpose} onChange={e => setPurpose(e.target.value)} style={inputStyle} />

      <label>Hearing Dates</label>
      {hearingDates.map((d, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input type="datetime-local" value={d} onChange={e => updateHearing(i, e.target.value)} style={inputStyle} />
          <button onClick={() => removeHearing(i)}>✕</button>
        </div>
      ))}
      <button onClick={addHearingRow} style={{ marginBottom: 24 }}>+ Add another date</button>

      <br />
      <button onClick={handleSubmit} disabled={saving} style={{ background: '#C8A951', padding: '10px 20px', borderRadius: 8 }}>
        {saving ? 'Creating…' : 'Create Case & Continue'}
      </button>
    </div>
  )
}

const inputStyle = {
  width: '100%', marginBottom: 16, padding: 10, borderRadius: 8,
  background: 'rgba(8,8,8,0.7)', border: '1px solid rgba(240,236,228,0.15)', color: '#f0ece4',
}