import { StopSequencesResponse } from '@/types'

const API_BASE_URL = 'https://prometheus-h24i.onrender.com'

export async function fetchStopSequences(): Promise<StopSequencesResponse> {
  const response = await fetch(`${API_BASE_URL}/combus/stop-sequences`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch stop sequences: ${response.status}`)
  }

  return response.json()
}
