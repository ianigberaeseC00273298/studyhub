
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabase'

type StudySession = {
  id: string
  duration: number
  session_date: string
}

export default function StudySessionsPage() {
  const [userId, setUserId] = useState('')
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [duration, setDuration] = useState('30')
  const [sessionDate, setSessionDate] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        window.location.href = '/'
        return
      }

      setUserId(user.id)

      const { data, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('id, duration, session_date')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })

      if (sessionsError) {
        setMessage(sessionsError.message)
      } else {
        setSessions(data ?? [])
      }

      setLoading(false)
    }

    loadSessions()
  }, [])

  async function addSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!userId) {
      setMessage('Please wait while your account loads.')
      return
    }

    const minutes = Number(duration)

    if (!Number.isFinite(minutes) || minutes < 1) {
      setMessage('Please enter a valid study duration.')
      return
    }

    if (!sessionDate) {
      setMessage('Please select the date of your study session.')
      return
    }

    setSaving(true)
    setMessage('')

    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        duration: minutes,
        session_date: sessionDate,
      })
      .select('id, duration, session_date')
      .single()

    setSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setSessions((current) => [data, ...current])
    setDuration('30')
    setSessionDate('')
    setMessage('Your study session has been saved!')
  }

  async function deleteSession(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this study session?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    setSessions((current) => current.filter(
      (session) => session.id !== id
    ))

    setMessage('Study session deleted.')
  }

  const totalMinutes = sessions.reduce(
    (total, session) => total + session.duration,
    0
  )

  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-sm">
              S
            </span>
            <span className="text-xl font-bold text-slate-800">
              StudyHub
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* Welcome banner */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-7 text-white shadow-lg sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-blue-100">
                BUILD YOUR STUDY HABITS
              </span>

              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Study Sessions ⏱️
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Record your study time, track your progress and
                celebrate every step towards your goals.
              </p>
            </div>

            <div className="hidden text-7xl sm:block">📚</div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                ⏱️
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total study time
                </p>

                <h2 className="text-2xl font-bold text-slate-800">
                  {totalHours}h {remainingMinutes}m
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📚
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Sessions recorded
                </p>

                <h2 className="text-2xl font-bold text-slate-800">
                  {sessions.length}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                🎯
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Average session
                </p>

                <h2 className="text-2xl font-bold text-slate-800">
                  {sessions.length > 0
                    ? Math.round(totalMinutes / sessions.length)
                    : 0} min
                </h2>
              </div>
            </div>
          </div>

        </section>

        {/* Main content */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">

          {/* Add session form */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6">
              <span className="text-xs font-bold tracking-wider text-blue-600">
                LOG YOUR PROGRESS
              </span>

              <h2 className="mt-2 text-xl font-bold text-slate-800">
                Add Study Session
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Record how long you have studied.
              </p>
            </div>

            <form onSubmit={addSession} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Study duration (minutes)
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="Example: 45"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Enter the total number of minutes studied.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Study date
                </label>

                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(event) => setSessionDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : '+ Save Study Session'}
              </button>

            </form>

            {message && (
              <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                {message}
              </p>
            )}
          </section>

          {/* Study history */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-6">
              <span className="text-xs font-bold tracking-wider text-blue-600">
                YOUR ACHIEVEMENTS
              </span>

              <h2 className="mt-2 text-xl font-bold text-slate-800">
                My Study History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your recorded study sessions.
              </p>
            </div>

            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Loading your study history...
              </p>
            ) : sessions.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 px-5 py-12 text-center">
                <div className="mb-3 text-5xl">⏱️</div>

                <h3 className="font-semibold text-slate-700">
                  No study sessions yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Save your first session to start tracking your progress.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <article
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                        📖
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-800">
                          {session.duration} minutes of studying
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          📅 {new Date(
                            `${session.session_date}T00:00:00`
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                      className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-slate-200 py-6 text-xs text-slate-500">
          <span>StudyHub © 2026</span>
          <span>Plan your work. Achieve your goals. 🎓</span>
        </footer>

      </div>
    </main>
  )
}
