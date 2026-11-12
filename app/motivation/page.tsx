'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Quote = {
  id: number
  quote: string
  author: string
}

export default function MotivationPage() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function getQuote() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'https://dummyjson.com/quotes/random'
      )

      if (!response.ok) {
        throw new Error('Could not load a quote.')
      }

      const data: Quote = await response.json()
      setQuote(data)
    } catch {
      setError('Unable to load a quote. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getQuote()
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
          <h1 className="mb-3 text-3xl font-bold text-gray-800">
            Study Motivation
          </h1>

          <p className="mb-8 text-gray-600">
            A little inspiration to keep you going!
          </p>

          {loading && (
            <p className="text-gray-600">Loading your quote...</p>
          )}

          {error && (
            <p className="mb-4 text-red-600">{error}</p>
          )}

          {quote && !loading && (
            <div className="rounded-lg bg-blue-50 p-6">
              <p className="text-xl italic text-gray-800">
                “{quote.quote}”
              </p>

              <p className="mt-4 font-semibold text-blue-700">
                — {quote.author}
              </p>
            </div>
          )}

          <button
            onClick={getQuote}
            disabled={loading}
            className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Another Quote'}
          </button>
        </div>
      </div>
    </main>
  )
}
