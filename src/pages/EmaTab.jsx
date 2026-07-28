import { useEffect, useState } from 'react'
import { getActiveEmaSnapshots } from '../api/ema'
import './AssetStatus.css'

const POLL_MS = 10_000

function fmt(value) {
  if (value == null) return '—'
  return Number(value).toFixed(4)
}

function priceVsEma(price, ema) {
  if (price == null || ema == null) return ''
  return Number(price) > Number(ema) ? 'change-pos' : 'change-neg'
}

function DirectionArrow({ direction }) {
  if (direction === 'UP') return <span className="change-pos"> ▲</span>
  if (direction === 'DOWN') return <span className="change-neg"> ▼</span>
  if (direction === 'FLAT') return <span className="ema-flat"> —</span>
  return null
}

export default function EmaTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  function load(showLoading = false) {
    if (showLoading) setLoading(true)
    getActiveEmaSnapshots()
      .then((data) => {
        setItems(data)
        setLastUpdated(new Date())
        setError(null)
      })
      .catch(() => setError('Failed to load EMA data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(true)
    const id = setInterval(() => load(false), POLL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="page page-wide">
      <div className="page-header">
        <h2>EMA Snapshot</h2>
        <span className="selected-count">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ''}
        </span>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="empty">Loading...</p>
      ) : items.length === 0 ? (
        <p className="empty">No active assets found.</p>
      ) : (
        <table className="asset-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Time Frame</th>
              <th>Price</th>
              <th>EMA 8</th>
              <th>EMA 12</th>
              <th>EMA 50</th>
              <th>EMA 200</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.assetStatusId}-${item.timeFrame}`}>
                <td className="symbol-cell">{item.symbol}</td>
                <td>{item.timeFrame ?? '—'}</td>
                <td className="stat-value">${fmt(item.currentPrice)}</td>
                <td className={priceVsEma(item.currentPrice, item.ema8)}>
                  ${fmt(item.ema8)}<DirectionArrow direction={item.ema8Direction} />
                </td>
                <td className={priceVsEma(item.currentPrice, item.ema12)}>
                  ${fmt(item.ema12)}<DirectionArrow direction={item.ema12Direction} />
                </td>
                <td className={priceVsEma(item.currentPrice, item.ema50)}>
                  ${fmt(item.ema50)}<DirectionArrow direction={item.ema50Direction} />
                </td>
                <td className={priceVsEma(item.currentPrice, item.ema200)}>
                  ${fmt(item.ema200)}<DirectionArrow direction={item.ema200Direction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}