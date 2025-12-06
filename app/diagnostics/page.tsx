'use client'

import { useState, useEffect } from 'react'
import { getWorkingMethod, getMethodStatus } from '@/lib/firebaseWithFallback'

export default function DiagnosticsPage() {
  const [method, setMethod] = useState<'sdk' | 'rest' | 'proxy'>('sdk')
  const [status, setStatus] = useState('Loading...')
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    const addLog = (message: string) => {
      setLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`])
    }

    console.log = (...args) => {
      originalLog(...args)
      addLog(`[LOG] ${args.join(' ')}`)
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLog(`[WARN] ${args.join(' ')}`)
    }

    console.error = (...args) => {
      originalError(...args)
      addLog(`[ERROR] ${args.join(' ')}`)
    }

    // Update method status every second
    const interval = setInterval(() => {
      const currentMethod = getWorkingMethod()
      setMethod(currentMethod)
      setStatus(getMethodStatus())
    }, 1000)

    return () => {
      clearInterval(interval)
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  const methodColors = {
    sdk: 'bg-green-100 border-green-300 text-green-800',
    rest: 'bg-blue-100 border-blue-300 text-blue-800',
    proxy: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  }

  const methodEmojis = {
    sdk: '🔥',
    rest: '📡',
    proxy: '🔄',
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Firebase Connection Diagnostics</h1>
          <p className="text-gray-600">Monitor which backend method is being used</p>
        </div>

        {/* Current Status */}
        <div className={`p-6 rounded-lg border-2 mb-8 ${methodColors[method]}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Current Method</h2>
              <p className="text-lg">{status}</p>
            </div>
            <div className="text-6xl">{methodEmojis[method]}</div>
          </div>
        </div>

        {/* Method Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-2">🔥 Firebase SDK</h3>
            <p className="text-sm text-green-800">Fastest method. Used when Firebase is accessible.</p>
            <p className="text-xs text-green-700 mt-2">Timeout: 3 seconds</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">📡 REST API</h3>
            <p className="text-sm text-blue-800">Fallback if SDK fails. Works through most networks.</p>
            <p className="text-xs text-blue-700 mt-2">Timeout: 5 seconds</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-900 mb-2">🔄 Proxy Server</h3>
            <p className="text-sm text-yellow-800">Final fallback. Requires proxy running.</p>
            <p className="text-xs text-yellow-700 mt-2">Timeout: 5 seconds</p>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Connection Logs</h2>
          <div className="bg-gray-900 text-green-400 rounded p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Waiting for logs...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-4">How to Test</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Open this page in your browser</li>
            <li>Watch the "Current Method" indicator</li>
            <li>If you see 🔥 Firebase SDK - it's working normally</li>
            <li>If you see 📡 REST API - SDK failed, REST API is working</li>
            <li>If you see 🔄 Proxy Server - both SDK and REST API failed, proxy is working</li>
            <li>Check the logs below to see what's happening</li>
          </ol>
        </div>

        {/* Network Test */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-bold text-purple-900 mb-4">Quick Network Test</h3>
          <div className="space-y-2">
            <p className="text-sm text-purple-800">
              <strong>Firebase REST API:</strong>{' '}
              <code className="bg-purple-100 px-2 py-1 rounded text-xs">
                https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app/candidates.json
              </code>
            </p>
            <p className="text-sm text-purple-800">
              <strong>Proxy Server:</strong>{' '}
              <code className="bg-purple-100 px-2 py-1 rounded text-xs">
                http://localhost:5000/health
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
