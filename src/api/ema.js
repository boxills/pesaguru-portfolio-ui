const BASE = '/api/ema'

async function get(path) {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json.data ?? []
}

export const getActiveEmaSnapshots = () => get('/active')