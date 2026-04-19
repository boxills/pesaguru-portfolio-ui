import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import { usePortfolioSocket } from './hooks/usePortfolioSocket'
import PortfolioCard from './components/PortfolioCard'
import AddAssetStatus from './pages/AddAssetStatus'
import ActiveAssets from './pages/ActiveAssets'

function Portfolio() {
  const { portfolios, connected } = usePortfolioSocket()
  const entries = Object.values(portfolios)

  return (
    <main className="app-main">
      {entries.length === 0 ? (
        <p className="empty">No open positions yet.</p>
      ) : (
        <div className="grid">
          {entries.map((data) => (
            <PortfolioCard key={data.assetStatusId} data={data} />
          ))}
        </div>
      )}
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
        </nav>
        <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Live' : 'Connecting...'}
        </span>
      </header>

      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/add" element={<AddAssetStatus />} />
        <Route path="/active" element={<ActiveAssets />} />
      </Routes>
    </div>
  )
}
