
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabase'

type Subject = {
  id: string
  subject_name: string
  description: string | null
}

export default function SubjectsPage() {
  const [subjectName, setSubjectName] = useState('')
  const [description, setDescription] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadSubjects() {
    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      window.location.href = '/'
      return
    }

    setUserId(user.id)

    const { data, error } = await supabase
      .from('subjects')
      .select('id, subject_name, description')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setSubjects(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  async function addSubject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')

    const { error } = await supabase.from('subjects').insert({
      user_id: userId,
      subject_name: subjectName,
      description,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setSubjectName('')
    setDescription('')
    setMessage('Subject added successfully!')
    await loadSubjects()
  }

  async function deleteSubject(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this subject?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Subject deleted successfully!')
      await loadSubjects()
    }
  }

  const subjectIcons = ['📘', '💻', '📊', '🔬', '🎨', '📐']

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
                ORGANISE YOUR LEARNING
              </span>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                My Subjects 📚
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Keep your studies organised by managing all your
                subjects in one place.
              </p>
            </div>
            <div className="hidden text-7xl sm:block">🎓</div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📚
              </div>
              <div>
                <p className="text-sm text-slate-500">Total subjects</p>
                <h2 className="text-2xl font-bold text-slate-800">
                  {subjects.length}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">

          {/* Add subject */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6">
              <span className="text-xs font-bold tracking-wider text-blue-600">
                BUILD YOUR WORKSPACE
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-800">
                Add New Subject
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a subject to organise your learning.
              </p>
            </div>

            <form onSubmit={addSubject} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject name
                </label>
                <input
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Web Development"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter subject details..."
                  rows={5}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                + Add Subject
              </button>
            </form>
          </section>

          {/* Saved subjects */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold tracking-wider text-blue-600">
                  YOUR LEARNING
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  Saved Subjects
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View and manage your subjects.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {subjects.length} subjects
              </span>
            </div>

            {message && (
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                {message}
              </div>
            )}

            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Loading your subjects...
              </p>
            ) : subjects.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 px-5 py-12 text-center">
                <div className="mb-3 text-5xl">📚</div>
                <h3 className="font-semibold text-slate-700">
                  No subjects yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Add your first subject using the form.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {subjects.map((subject, index) => (
                  <article
                    key={subject.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                        {subjectIcons[index % subjectIcons.length]}
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Subject {index + 1}
                      </span>
                    </div>

                    <h3 className="break-words text-base font-bold text-slate-800">
                      {subject.subject_name}
                    </h3>

                    <p className="mt-2 min-h-12 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                      {subject.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() => deleteSubject(subject.id)}
                        className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Delete subject
                      </button>
                    </div>
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
