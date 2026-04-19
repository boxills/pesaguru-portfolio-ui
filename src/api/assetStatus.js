const BASE = '/api/asset-status'

async function get(path) {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json.data ?? []
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (json.status !== 0) {
    throw new Error(json.message || 'Request failed')
  }
  return json
}

async function patch(path) {
  const res = await fetch(BASE + path, { method: 'PATCH' })
  return res.json()
}

async function del(path) {
  const res = await fetch(BASE + path, { method: 'DELETE' })
  return res.json()
}

export const getAssets = () => get('/assets')
export const getSources = () => get('/sources')
export const getStrategies = () => get('/strategies')
export const getActiveAssetStatuses = () => get('/active')
export const getAllAssetStatuses = () => get('/all')
export const activateAssetStatus = (id) => patch(`/${id}/activate`)
export const createAssetStatuses = (body) => post('', body)
export const deactivateAssetStatus = (id) => patch(`/${id}/deactivate`)
export const deleteAssetStatus = (id) => del(`/${id}`)
