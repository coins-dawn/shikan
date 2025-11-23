import { ReachabilityListResponse } from '@/types'

const API_BASE_URL = 'https://prometheus-h24i.onrender.com'

export async function fetchReachabilityList(): Promise<ReachabilityListResponse> {
  const response = await fetch(`${API_BASE_URL}/area/search/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch reachability list: ${response.status}`)
  }

  return response.json()
}
