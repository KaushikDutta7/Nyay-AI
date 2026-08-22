import { useState, useRef } from 'react'
import axios from 'axios'
import { MOCK_DATA } from '../data/mockData'

const API_URL = 'http://localhost:8000'

export function useAnalysis() {
  const [state, setState] = useState({
    status: 'idle',        // idle | running | done | error
    currentAgentIndex: -1,
    currentStepIndex: 0,
    agentStatuses: {},     // key -> 'pending' | 'running' | 'done'
    result: null,
    error: null,
    usingMock: false,
  })

  const abortRef = useRef(null)

  const reset = () => {
    setState({
      status: 'idle', currentAgentIndex: -1, currentStepIndex: 0,
      agentStatuses: {}, result: null, error: null, usingMock: false,
    })
  }

  const run = async (caseDescription, judgeName = '') => {
    setState(s => ({
      ...s, status: 'running', currentAgentIndex: 0,
      agentStatuses: { precedent: 'running', argument: 'pending', outcome: 'pending', judge: 'pending' },
      result: null, error: null,
    }))

    // Start backend call in parallel with animation
    const agentKeys = ['precedent', 'argument', 'outcome', 'judge']
    let backendPromise

    try {
      backendPromise = axios.post(`${API_URL}/analyze/text`, {
  description: caseDescription,
  court_type: judgeName || null,
}, { timeout: 90000 })
    } catch {
      backendPromise = Promise.reject(new Error('Network'))
    }

    // Animate pipeline regardless
    const AGENT_DURATION = 2600

    for (let i = 0; i < agentKeys.length; i++) {
      setState(s => ({
        ...s,
        currentAgentIndex: i,
        currentStepIndex: 0,
        agentStatuses: {
          ...Object.fromEntries(agentKeys.map((k, j) => [
            k,
            j < i ? 'done' : j === i ? 'running' : 'pending'
          ]))
        },
      }))
      await sleep(AGENT_DURATION)
    }

    // Wait for backend
    let result
    let usingMock = false
    try {
      const res = await backendPromise
      result = res.data
    } catch (err) {
      console.warn('Backend unavailable — using demo data:', err.message)
      result = { ...MOCK_DATA, case_description: caseDescription, judge_name: judgeName }
      usingMock = true
    }

    setState(s => ({
      ...s, status: 'done',
      agentStatuses: { precedent: 'done', argument: 'done', outcome: 'done', judge: 'done' },
      currentAgentIndex: 3,
      result,
      usingMock,
    }))

    return result
  }

  return { state, run, reset }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))
