import { useEffect, useState } from 'react'
import { getAllAssetStatuses } from '../api/assetStatus'
import { searchTrades } from '../api/trade'
import './AssetStatus.css'

function fmt(val) {
  if (val == null) return '—'
  return Number(val).toFixed(2)
}

function fmt6(val) {
  if (val == null) return '—'
  return Number(val).toFixed(6)
}

function fmtDate(str) {
  if (!str) return '—'
  return str.replace('T', ' ').substring(0, 16)
}

export default function TradeSearch() {
  const [statuses, setStatuses] = useState([])
  const [symbol, setSymbol] = useState('')
  const [strategy, setStrategy] = useState('')
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [query, setQuery] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAllAssetStatuses()
      .then(setStatuses)
      .catch(() => setError('Failed to load options'))
  }, [])

  useEffect(() => {
    if (!query) return
    setLoading(true)
    setError(null)
    searchTrades(query.assetStatusId, query.from, query.to, query.page)
      .then(setResults)
      .catch(() => setError('Search failed'))
      .finally(() => setLoading(false))
  }, [query])

  const uniqueSymbols = [...new Map(statuses.map(st => [st.symbol, st])).values()]

  const availableStrategies = symbol
    ? [...new Set(statuses.filter(st => st.symbol === symbol).map(st => st.strategy).filter(Boolean))]
    : []

  function handleSymbolChange(e) {
    setSymbol(e.target.value)
    setStrategy('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const match = statuses.find(st => st.symbol === symbol && st.strategy === strategy)
    if (!match) {
      setError('No asset status record found for the selected asset and strategy')
      return
    }
    setQuery({ assetStatusId: match.id, from, to, page: 0 })
  }

  function handlePage(newPage) {
    setQuery(q => ({ ...q, page: newPage }))
  }

  const canSearch = symbol && strategy && from && to && !loading

  return (
    <div className="page page-wide">
      <div className="page-header">
        <h2>Trade Search</h2>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit} className="add-form">
        <div className="dropdowns">
          <label className="field">
            <span>Asset <span className="required">*</span></span>
            <select value={symbol} onChange={handleSymbolChange} required>
              <option value="">Select asset</option>
              {uniqueSymbols.map(a => (
                <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Strategy <span className="required">*</span></span>
            <select value={strategy} onChange={e => setStrategy(e.target.value)} required disabled={!symbol}>
              <option value="">Select strategy</option>
              {availableStrategies.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>From <span className="required">*</span></span>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} required />
          </label>

          <label className="field">
            <span>To <span className="required">*</span></span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} required />
          </label>
        </div>

        <button type="submit" className="btn-primary" style={{ marginBottom: '1.5rem' }} disabled={!canSearch}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results && results.firstTrade && results.lastTrade && (() => {
        const first = results.firstTrade
        const last = results.lastTrade
        const amountChange = (last.totalValue ?? 0) - (first.totalValue ?? 0)
        const pctChange = first.totalValue ? (amountChange / first.totalValue) * 100 : 0
        const changeClass = amountChange > 0 ? 'change-pos' : amountChange < 0 ? 'change-neg' : ''
        return (
          <div className="trade-summary">
            <div className="summary-card">
              <span className="summary-label">First Trade</span>
              <span className="summary-value">{fmtDate(first.createDate)}</span>
              <span className="summary-sub">{first.direction} · {fmt(first.totalValue)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Last Trade</span>
              <span className="summary-value">{fmtDate(last.createDate)}</span>
              <span className="summary-sub">{last.direction} · {fmt(last.totalValue)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Amount Change</span>
              <span className={`summary-value ${changeClass}`}>
                {amountChange > 0 ? '+' : ''}{fmt(amountChange)}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">% Change</span>
              <span className={`summary-value ${changeClass}`}>
                {pctChange > 0 ? '+' : ''}{pctChange.toFixed(2)}%
              </span>
            </div>
          </div>
        )
      })()}

      {results && (
        <>
          {results.trades.length === 0 ? (
            <p className="empty">No trades found for the selected filters.</p>
          ) : (
            <>
              <table className="asset-table trade-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Direction</th>
                    <th>Position</th>
                    <th>Strategy</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total Value</th>
                    <th>Change</th>
                    <th>Timeframe</th>
                  </tr>
                </thead>
                <tbody>
                  {results.trades.map(t => (
                    <tr key={t.id}>
                      <td className="date-cell">{fmtDate(t.createDate)}</td>
                      <td className="symbol-cell">{t.symbol}</td>
                      <td>
                        <span className={`badge ${t.direction === 'BUY' ? 'open' : 'closed'}`}>
                          {t.direction}
                        </span>
                      </td>
                      <td>{t.position ?? '—'}</td>
                      <td>{t.strategy?.replace(/_/g, ' ')}</td>
                      <td>{fmt6(t.price)}</td>
                      <td>{t.quantity != null ? t.quantity : '—'}</td>
                      <td>{fmt(t.totalValue)}</td>
                      <td className={t.changeValue > 0 ? 'change-pos' : t.changeValue < 0 ? 'change-neg' : ''}>
                        {t.changeValue != null ? (t.changeValue > 0 ? '+' : '') + fmt6(t.changeValue) : '—'}
                      </td>
                      <td>{t.timeFrame?.replace(/_/g, ' ') ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <span>{results.totalElements} result{results.totalElements !== 1 ? 's' : ''} &nbsp;·&nbsp; Page {results.page + 1} of {results.totalPages}</span>
                <button
                  className="btn-page"
                  onClick={() => handlePage(results.page - 1)}
                  disabled={results.page === 0}
                >
                  Prev
                </button>
                <button
                  className="btn-page"
                  onClick={() => handlePage(results.page + 1)}
                  disabled={results.page + 1 >= results.totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
