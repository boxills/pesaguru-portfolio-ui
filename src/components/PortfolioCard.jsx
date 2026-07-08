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

export default function PortfolioCard({ data, accentColor }) {
  return (
    <div className="card" style={accentColor ? { backgroundColor: `${accentColor}12` } : undefined}>
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
        <span>{data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : ''}</span>
        {data.openPosition && (
          <a
            className="sell-link"
            href={`/api/trade/sell-inverse?assetStatusId=${data.assetStatusId}`}
          >
            Sell
          </a>
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