'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/src/lib/supabase'
import './dashboard.css'

type Assignment = {
  id: string
  title: string
  status: string
  deadline: string | null
}

type Subject = {
  id: string
  subject_name: string
}

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/'
        return
      }

      setEmail(user.email || '')

      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: subjectData } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setAssignments(assignmentData || [])
      setSubjects(subjectData || [])
      setLoading(false)
    }

    loadDashboard()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const completed = assignments.filter(
    item => item.status === 'completed'
  ).length

  const pending = assignments.length - completed

  const features = [
    { icon: '📝', title: 'Assignments', description: 'Organise your coursework and deadlines.', href: '/assignments', colour: 'blue' },
    { icon: '📚', title: 'My Subjects', description: 'Keep all your subjects organised.', href: '/subjects', colour: 'purple' },
    { icon: '⏱️', title: 'Study Sessions', description: 'Track your learning and study time.', href: '/study-sessions', colour: 'green' },
    { icon: '🌤️', title: 'Weather', description: 'Check the latest weather conditions.', href: '/weather', colour: 'sky' },
    { icon: '📖', title: 'Book Search', description: 'Discover useful books and resources.', href: '/books', colour: 'orange' },
    { icon: '✨', title: 'Motivation', description: 'Find inspiration for your studies.', href: '/motivation', colour: 'pink' }
  ]

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        <header className="dashboard-header">
          <Link href="/dashboard" className="brand">
            <span className="brand-icon">S</span>
            StudyHub
          </Link>

          <div className="header-right">
            <div className="user-avatar">
              {email.charAt(0).toUpperCase()}
            </div>
            <span className="user-email">{email}</span>
            <button onClick={logout} className="logout-button">
              Log out
            </button>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <span className="welcome-tag">YOUR PERSONAL STUDY SPACE</span>
            <h1>Welcome back! 👋</h1>
            <p>
              Stay organised, manage your work and make every
              study session count.
            </p>
          </div>
          <div className="welcome-decoration">🎓</div>
        </section>

        {loading ? (
          <p className="loading-card">Loading your dashboard...</p>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue-bg">📝</div>
                <div>
                  <p>Total assignments</p>
                  <h2>{assignments.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green-bg">✓</div>
                <div>
                  <p>Completed</p>
                  <h2>{completed}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange-bg">⌛</div>
                <div>
                  <p>Still pending</p>
                  <h2>{pending}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple-bg">📚</div>
                <div>
                  <p>My subjects</p>
                  <h2>{subjects.length}</h2>
                </div>
              </div>
            </section>

            <section className="features-section">
              <div className="section-heading">
                <span className="section-label">YOUR WORKSPACE</span>
                <h2>Explore StudyHub</h2>
                <p>Everything you need to manage your studies.</p>
              </div>

              <div className="features-grid">
                {features.map(feature => (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    className="feature-card"
                  >
                    <div className={`feature-icon ${feature.colour}`}>
                      {feature.icon}
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <span className="feature-link">Open feature →</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="bottom-grid">
              <div className="content-card">
                <div className="card-heading">
                  <h2>Recent assignments</h2>
                  <Link href="/assignments" className="view-all">
                    View all →
                  </Link>
                </div>

                {assignments.length === 0 ? (
                  <p className="empty-state">No assignments yet.</p>
                ) : (
                  assignments.slice(0, 5).map(assignment => (
                    <div key={assignment.id} className="assignment-row">
                      <div className="assignment-symbol">📄</div>
                      <div className="assignment-details">
                        <h3>{assignment.title}</h3>
                        <p>Deadline: {assignment.deadline || 'Not set'}</p>
                      </div>
                      <span className={
                        assignment.status === 'completed'
                          ? 'status-pill status-completed'
                          : 'status-pill status-pending'
                      }>
                        {assignment.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="content-card">
                <div className="card-heading">
                  <h2>My subjects</h2>
                  <Link href="/subjects" className="view-all">
                    View all →
                  </Link>
                </div>

                {subjects.length === 0 ? (
                  <p className="empty-state">No subjects added yet.</p>
                ) : (
                  subjects.slice(0, 5).map(subject => (
                    <div key={subject.id} className="subject-row">
                      <span>📘</span>
                      {subject.subject_name}
                    </div>
                  ))
                )}

                <Link href="/study-sessions" className="study-prompt">
                  💡 Ready to study? Start a session →
                </Link>
              </div>
            </section>

            <footer className="dashboard-footer">
              <span>StudyHub © 2026</span>
              <span>Plan your work. Achieve your goals. 🎓</span>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}

