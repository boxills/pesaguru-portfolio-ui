import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'

const STORAGE_KEY = 'pesaguru_portfolios'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToStorage(portfolios) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios))
  } catch {
    // storage full or unavailable — silent fail
  }
}

export function usePortfolioSocket() {
  const [portfolios, setPortfolios] = useState(loadFromStorage)
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new window.SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/portfolio', (message) => {
          const data = JSON.parse(message.body)
          setPortfolios((prev) => {
            const next = { ...prev, [data.assetStatusId]: data }
            saveToStorage(next)
            return next
          })
        })
      },
      onDisconnect: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [])

  function removePortfolio(assetStatusId) {
    setPortfolios((prev) => {
      const next = { ...prev }
      delete next[assetStatusId]
      saveToStorage(next)
      return next
    })
  }

  return { portfolios, connected, removePortfolio }
}