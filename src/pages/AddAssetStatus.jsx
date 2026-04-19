import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAssets, getSources, getStrategies, createAssetStatuses } from '../api/assetStatus'
import './AssetStatus.css'

export default function AddAssetStatus() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [sources, setSources] = useState([])
  const [strategies, setStrategies] = useState([])
  const [assetId, setAssetId] = useState('')
  const [inverseAssetId, setInverseAssetId] = useState('')
  const [source, setSource] = useState('')
  const [strategy, setStrategy] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    Promise.all([getAssets(), getSources(), getStrategies()])
      .then(([a, s, st]) => {
        setAssets(a)
        setSources(s)
        setStrategies(st)
      })
      .catch(() => setError('Failed to load data'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!assetId || !source || !strategy) return
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      await createAssetStatuses({
        assetId: Number(assetId),
        inverseAssetId: inverseAssetId ? Number(inverseAssetId) : null,
        source,
        strategy,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to create entry')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = assetId && source && strategy && !submitting

  return (
    <div className="page">
      <div className="page-header">
        <h2>Add Asset Status</h2>
        <button className="btn-link" onClick={() => navigate('/active')}>View Active</button>
      </div>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">Entry created successfully.</p>}

      <form onSubmit={handleSubmit} className="add-form">
        <div className="dropdowns">
          <label className="field">
            <span>Asset <span className="required">*</span></span>
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)} required>
              <option value="">Select asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.symbol}{a.name ? ` — ${a.name}` : ''}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Inverse Asset</span>
            <select value={inverseAssetId} onChange={(e) => setInverseAssetId(e.target.value)}>
              <option value="">None</option>
              {assets.filter((a) => a.inverse).map((a) => (
                <option key={a.id} value={a.id}>{a.symbol}{a.name ? ` — ${a.name}` : ''}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Source <span className="required">*</span></span>
            <select value={source} onChange={(e) => setSource(e.target.value)} required>
              <option value="">Select source</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Strategy <span className="required">*</span></span>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)} required>
              <option value="">Select strategy</option>
              {strategies.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </label>

        </div>

        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}