import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import { usePortfolioSocket } from './hooks/usePortfolioSocket'
import PortfolioCard from './components/PortfolioCard'
import AddAssetStatus from './pages/AddAssetStatus'
import ActiveAssets from './pages/ActiveAssets'
import TradeSearch from './pages/TradeSearch'
import EmaTab from './pages/EmaTab'

const STRATEGY_COLORS = [
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f97316', // orange
  '#22c55e', // green
  '#ec4899', // pink
  '#14b8a6', // teal
  '#eab308', // yellow
  '#ef4444', // red
  '#6366f1', // indigo
  '#84cc16', // lime
]

function strategyColor(strategy, index) {
  if (!strategy) return STRATEGY_COLORS[0]
  // hash the strategy name for a stable color that doesn't depend on render order
  let hash = 0
  for (let i = 0; i < strategy.length; i++) hash = (hash * 31 + strategy.charCodeAt(i)) >>> 0
  return STRATEGY_COLORS[hash % STRATEGY_COLORS.length]
}

function fmtStrategy(strategy) {
  if (!strategy) return 'Unknown'
  return strategy.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function groupByStrategy(entries) {
  return entries.reduce((acc, data) => {
    const key = data.strategy ?? 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(data)
    return acc
  }, {})
}

function Portfolio() {
  const { portfolios, removePortfolio } = usePortfolioSocket()
  const entries = Object.values(portfolios)

  if (entries.length === 0) {
    return <main className="app-main"><p className="empty">No open positions yet.</p></main>
  }

  const groups = groupByStrategy(entries)

  return (
    <main className="app-main">
      <div className="grid">
        {Object.entries(groups).map(([strategy, items]) => {
          const color = strategyColor(strategy)
          return items.map((data) => (
            <PortfolioCard
              key={data.assetStatusId}
              data={data}
              accentColor={color}
              onHide={() => removePortfolio(data.assetStatusId)}
            />
          ))
        })}
      </div>
    </main>
  )
}

export default function App() {
  const { connected } = usePortfolioSocket()

  return (
    <div className="app">
      <header className="app-header">
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Portfolio
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Add Asset
          </NavLink>
          <NavLink to="/active" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Active Assets
          </NavLink>
          <NavLink to="/trades" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Trades
          </NavLink>
          <NavLink to="/ema" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            EMA
          </NavLink>
        </nav>
        <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Live' : 'Connecting...'}
        </span>
      </header>

      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/add" element={<AddAssetStatus />} />
        <Route path="/active" element={<ActiveAssets />} />
        <Route path="/trades" element={<TradeSearch />} />
        <Route path="/ema" element={<EmaTab />} />
      </Routes>
    </div>
  )
}
