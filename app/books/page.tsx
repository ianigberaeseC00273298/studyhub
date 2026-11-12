'use client'

import { useState } from 'react'
import Link from 'next/link'

type Book = {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
  edition_count?: number
}

export default function BooksPage() {
  const [search, setSearch] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(
    'Search for a book or study topic to get started.'
  )

  async function searchBooks(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!search.trim()) {
      setMessage('Please enter a book title or subject.')
      return
    }

    setLoading(true)
    setMessage('')
    setBooks([])

    try {
      const url = new URL('https://openlibrary.org/search.json')

      url.search = new URLSearchParams({
        q: search.trim(),
        limit: '12',
        fields: 'key,title,author_name,first_publish_year,cover_i,edition_count',
      }).toString()

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error('Unable to search for books. Please try again.')
      }

      const data = await response.json()

      setBooks(data.docs ?? [])

      if (!data.docs || data.docs.length === 0) {
        setMessage('No books found. Try another search.')
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              StudyHub Book Search
            </h1>
            <p className="text-slate-600">
              Discover books and resources to support your studies.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-800 px-5 py-3 text-white hover:bg-slate-700"
          >
            Back to Dashboard
          </Link>
        </header>

        {/* Search */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Find a book or study resource
          </h2>

          <form
            onSubmit={searchBooks}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try Biology, Mathematics or History"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 p-3 text-slate-800"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Books'}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-800">
              {message}
            </p>
          )}
        </section>

        {/* Results */}
        {books.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-5 text-2xl font-bold text-slate-800">
              Search Results
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <article
                  key={book.key}
                  className="overflow-hidden rounded-xl bg-white p-5 shadow-sm"
                >
                  {book.cover_i ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                      alt={`Cover of ${book.title}`}
                      className="mx-auto mb-4 h-48 max-w-full object-contain"
                    />
                  ) : (
                    <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      No cover available
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-slate-800">
                    {book.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Author: {book.author_name?.slice(0, 2).join(', ') ?? 'Unknown'}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    First published: {book.first_publish_year ?? 'Not available'}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Editions: {book.edition_count ?? 'Not available'}
                  </p>

                  <a
                    href={`https://openlibrary.org${book.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block font-semibold text-blue-600 hover:underline"
                  >
                    View book details →
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
          Book information provided by Open Library.
        </footer>

      </div>
    </main>
  )
}
