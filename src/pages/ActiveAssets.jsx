import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllAssetStatuses, activateAssetStatus, deactivateAssetStatus, deleteAssetStatus } from '../api/assetStatus'
import { sellInverse } from '../api/trade'
import './AssetStatus.css'

export default function ActiveAssets() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    getAllAssetStatuses()
      .then(setItems)
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  async function handleDeactivate(id) {
    await deactivateAssetStatus(id)
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: false } : item))
    )
  }

  async function handleActivate(id) {
    await activateAssetStatus(id)
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: true } : item))
    )
  }

  async function handleDelete(id) {
    if (!confirm('Delete this asset status? This cannot be undone.')) return
    await deleteAssetStatus(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  async function handleSell(id, symbol) {
    if (!confirm(`Sell ${symbol ?? 'this asset'}? This will execute the trade immediately.`)) return
    try {
      await sellInverse(id)
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, openPosition: false } : item))
      )
    } catch {
      setError('Failed to sell')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Active Assets</h2>
        <button className="btn-link" onClick={() => navigate('/')}>Add New</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="empty">Loading...</p>
      ) : items.length === 0 ? (
        <p className="empty">No asset statuses found.</p>
      ) : (
        <table className="asset-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Source</th>
              <th>Strategy</th>
              <th>Open Position</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={item.active ? '' : 'row-inactive'}>
                <td className="symbol-cell">{item.symbol}</td>
                <td>{item.source}</td>
                <td>{item.strategy?.replace(/_/g, ' ')}</td>
                <td>
                  <span className={`badge ${item.openPosition ? 'open' : 'closed'}`}>
                    {item.openPosition ? 'Open' : 'Closed'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${item.active ? 'active' : 'inactive'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions-cell">
                  {item.openPosition && (
                    <button
                      className="btn-sell"
                      onClick={() => handleSell(item.id, item.symbol)}
                    >
                      Sell
                    </button>
                  )}
                  {item.active ? (
                    <button
                      className="btn-danger"
                      onClick={() => handleDeactivate(item.id)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="btn-success"
                      onClick={() => handleActivate(item.id)}
                    >
                      Activate
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}
                    title="Delete record"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}