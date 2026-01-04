import { APIResponseWithScore, FacilityType } from '@/types'

const API_BASE_URL = 'https://prometheus-h24i.onrender.com'

export interface AreaSearchRequest {
  'target-spot': string
  'max-minute': number
  'max-walk-distance': number
  'combus-stops': string[]
}

export async function fetchAreaSearch(
  request: AreaSearchRequest
): Promise<APIResponseWithScore> {
  const response = await fetch(`${API_BASE_URL}/area/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch area search: ${response.status}`)
  }

  return response.json()
}
