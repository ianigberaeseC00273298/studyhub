'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
window.location.href = '/dashboard'
return
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Account created! Check your email if confirmation is required.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-blue-700">
          StudyHub
        </h1>
        <p className="mb-8 text-center text-slate-600">
          Your personal student productivity space
        </p>

        <h2 className="mb-5 text-center text-xl font-semibold text-slate-800">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-800">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
            }}
            className="font-semibold text-blue-600 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </section>
    </main>
  )
}
