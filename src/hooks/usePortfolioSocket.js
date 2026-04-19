import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'

export function usePortfolioSocket() {
  const [portfolios, setPortfolios] = useState({}) // keyed by assetStatusId
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
            const existing = prev[data.assetStatusId]
            if (!data.openPosition && existing) {
              return {
                ...prev,
                [data.assetStatusId]: {
                  ...existing,
                  currentPrice: data.currentPrice,
                  timestamp: data.timestamp,
                },
              }
            }
            return { ...prev, [data.assetStatusId]: data }
          })
        })
      },
      onDisconnect: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [])

  return { portfolios, connected }
}