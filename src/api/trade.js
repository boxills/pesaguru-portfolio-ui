const BASE = '/api/trade'

async function get(path) {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json.data ?? {}
}

export const searchTrades = (assetStatusId, from, to, page = 0, size = 20) =>
  get(`/search?assetStatusId=${assetStatusId}&from=${from}&to=${to}&page=${page}&size=${size}`)