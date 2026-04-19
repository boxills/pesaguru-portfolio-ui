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

export default function PortfolioCard({ data }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="symbol">{data.symbol ?? '—'}</span>
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

      {data.openPosition && (
        <div className="signals">
          <div className="signals-title">Keltner Signals</div>
          <div className="signals-grid">
            <div className="signals-col">
              <div className="signals-col-label">↑ Upper Band</div>
              <Signal label="50 EMA (now)"  active={data.touchedUpperAndCrossedBelow50Ema}          variant="bear" />
              <Signal label="Mid (now)"     active={data.touchedUpperAndCrossedBelowMiddleKeltner}   variant="bear" />
              <Signal label="50 EMA (ever)" active={data.everTouchedUpperAndCrossedBelow50Ema}       variant="bear-ever" />
              <Signal label="Mid (ever)"    active={data.everTouchedUpperAndCrossedBelowMiddleKeltner} variant="bear-ever" />
            </div>
            <div className="signals-col">
              <div className="signals-col-label">↓ Lower Band</div>
              <Signal label="50 EMA (now)"  active={data.touchedLowerAndCrossedAbove50Ema}          variant="bull" />
              <Signal label="Mid (now)"     active={data.touchedLowerAndCrossedAboveMiddleKeltner}   variant="bull" />
              <Signal label="50 EMA (ever)" active={data.everTouchedLowerAndCrossedAbove50Ema}       variant="bull-ever" />
              <Signal label="Mid (ever)"    active={data.everTouchedLowerAndCrossedAboveMiddleKeltner} variant="bull-ever" />
            </div>
          </div>
        </div>
      )}

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

function Signal({ label, active, variant }) {
  return (
    <div className={`signal ${active ? `signal-${variant}` : 'signal-off'}`}>
      <span className="signal-dot">{active ? '●' : '○'}</span>
      {label}
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