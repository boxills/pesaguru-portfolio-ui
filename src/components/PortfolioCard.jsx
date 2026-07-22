import { useState } from 'react'
import { sellInverse } from '../api/trade'
import './PortfolioCard.css'

function fmt(value, decimals = 2) {
  if (value == null) return '—'
  return Number(value).toFixed(decimals)
}

function fmtPct(value) {
  if (value == null) return '—'
  return `${Number(value).toFixed(2)}%`
}

function gainClass(value) {
  if (value == null) return ''
  return Number(value) >= 0 ? 'positive' : 'negative'
}

function fmtStrategy(strategy) {
  if (!strategy) return null
  return strategy.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function PortfolioCard({ data, accentColor, onHide }) {
  const [selling, setSelling] = useState(false)
  const [sellError, setSellError] = useState(null)

  async function handleSell() {
    if (!confirm(`Sell ${data.symbol ?? 'this asset'}? This will execute the trade immediately.`)) return
    setSelling(true)
    setSellError(null)
    try {
      await sellInverse(data.assetStatusId)
    } catch {
      setSellError('Sell failed')
    } finally {
      setSelling(false)
    }
  }

  return (
    <div className="card" style={accentColor ? { backgroundColor: `${accentColor}12` } : undefined}>
      {onHide && (
        <button
          type="button"
          className="hide-btn"
          onClick={onHide}
          aria-label="Hide card"
          title="Hide until new data arrives"
        >
          ×
        </button>
      )}
      <div className="card-header">
        <div className="card-header-left">
          <span className="symbol">{data.symbol ?? '—'}</span>
          {fmtStrategy(data.strategy) && (
            <span className="strategy-label">{fmtStrategy(data.strategy)}</span>
          )}
        </div>
        <span className={`badge ${data.openPosition ? 'open' : 'closed'}`}>
          {data.openPosition ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="card-grid">
        <Stat label="Current Price" value={`$${fmt(data.currentPrice)}`} />
        <Stat label="Entry Price"   value={`$${fmt(data.entryPrice)}`} />

        <Stat
          label="Trade P&L"
          value={`$${fmt(data.currentTradeGainLoss)} (${fmtPct(data.currentTradeGainLossPct)})`}
          className={gainClass(data.currentTradeGainLoss)}
        />
        <Stat
          label="Daily P&L"
          value={`$${fmt(data.dailyGainLoss)} (${fmtPct(data.dailyGainLossPct)})`}
          className={gainClass(data.dailyGainLoss)}
        />
      </div>

      <div className="card-footer">
        <span>
          {sellError ?? (data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '')}
        </span>
        {data.openPosition && (
          <button
            type="button"
            className="sell-link"
            onClick={handleSell}
            disabled={selling}
          >
            {selling ? 'Selling…' : 'Sell'}
          </button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, className }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${className ?? ''}`}>{value}</span>
    </div>
  )
}