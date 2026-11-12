'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabase'

type Assignment = {
  id: string
  title: string
  description: string | null
  deadline: string | null
  priority: string
  status: string
}

export default function AssignmentsPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadAssignments() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/'
      return
    }

    setUserId(user.id)

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setAssignments(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadAssignments()
  }, [])

  async function addAssignment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')

    const { error } = await supabase.from('assignments').insert({
      user_id: userId,
      title,
      description,
      deadline: deadline || null,
      priority,
      status: 'pending',
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setTitle('')
    setDescription('')
    setDeadline('')
    setPriority('medium')
    setMessage('Assignment added successfully!')
    await loadAssignments()
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('assignments')
      .update({ status })
      .eq('id', id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Assignment status updated!')
      await loadAssignments()
    }
  }

  async function deleteAssignment(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this assignment?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Assignment deleted!')
      await loadAssignments()
    }
  }

  const completed = assignments.filter(
    item => item.status === 'completed'
  ).length

  const pending = assignments.filter(
    item => item.status === 'pending'
  ).length

  const inProgress = assignments.filter(
    item => item.status === 'in_progress'
  ).length

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
                YOUR STUDY WORKSPACE
              </span>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                My Assignments 📝
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Keep track of your coursework, organise your deadlines
                and stay on top of your studies.
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
                📝
              </div>
              <div>
                <p className="text-sm text-slate-500">Total assignments</p>
                <h2 className="text-2xl font-bold text-slate-800">
                  {assignments.length}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                ⏳
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <h2 className="text-2xl font-bold text-slate-800">
                  {pending}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                ✓
              </div>
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <h2 className="text-2xl font-bold text-slate-800">
                  {completed}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">

          {/* Add assignment form */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6">
              <span className="text-xs font-bold tracking-wider text-blue-600">
                GET ORGANISED
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-800">
                Add New Assignment
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the details of your coursework below.
              </p>
            </div>

            <form onSubmit={addAssignment} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Assignment title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Web Development Project"
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
                  placeholder="Add some assignment details..."
                  rows={4}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                + Add Assignment
              </button>
            </form>
          </section>

          {/* Saved assignments */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold tracking-wider text-blue-600">
                  YOUR COURSEWORK
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  Saved Assignments
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage and update your assignments.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {assignments.length} total
              </span>
            </div>

            {message && (
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                {message}
              </div>
            )}

            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Loading your assignments...
              </p>
            ) : assignments.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 px-5 py-12 text-center">
                <div className="mb-3 text-5xl">📚</div>
                <h3 className="font-semibold text-slate-700">
                  No assignments yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Add your first assignment using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <article
                    key={assignment.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-base font-bold text-slate-800">
                          {assignment.title}
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {assignment.description || 'No description provided.'}
                        </p>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        assignment.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : assignment.priority === 'medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {assignment.priority} priority
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
                      <span>📅 Deadline: {assignment.deadline || 'Not set'}</span>
                      <span className={`rounded-full px-3 py-1 font-semibold ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : assignment.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <select
                        aria-label={`Update status for ${assignment.title}`}
                        value={assignment.status}
                        onChange={(e) => updateStatus(assignment.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => deleteAssignment(assignment.id)}
                        className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
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

