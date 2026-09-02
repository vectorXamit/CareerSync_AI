import { Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { syncUser } from '../api/client'
import DNAHelix from '../components/DNAHelix'

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate('/upload')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/upload')
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    if (!supabase) {
      setError('Supabase is not configured yet.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      await syncUser()
      navigate('/upload')
    } catch (err) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    if (!supabase) {
      setError('Supabase is not configured yet.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      if (data.user) {
        setToast('Check your email to confirm your account')
        setTab('signin')
      }
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    if (!supabase) {
      setError('Supabase is not configured yet.')
      return
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/upload' },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Google sign in failed')
    }
  }

  const configWarning = !isSupabaseConfigured ? (
    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
      <p className="font-semibold mb-1">You are not set up yet.</p>
      <p>
        To enable authentication, add your Supabase credentials to the{' '}
        <code className="bg-black/40 px-1 rounded">.env</code> file:
      </p>
      <pre className="mt-2 bg-black/40 p-2 rounded text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
      </pre>
      <p className="mt-2 text-amber-200/80">
        If you do not have a Supabase project yet, create one free at supabase.com, then fill in these values and restart the dev server.
      </p>
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
        <div className="fixed inset-0 z-0">
          <DNAHelix />
        </div>
      </Suspense>

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

      <motion.div
        className="absolute top-24 -left-20 z-[1] w-72 h-72 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-24 -right-20 z-[1] w-72 h-72 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"
        animate={{ y: [0, -40, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[420px] bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 rounded-[24px] p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">CareerSync AI</h1>
            <p className="text-zinc-400 text-sm mt-2">
              {isSupabaseConfigured
                ? tab === 'signin'
                  ? 'Welcome back! Sign in to continue'
                  : 'Create your account to get started'
                : 'Login is paused until configured'}
            </p>
          </div>

          {configWarning}

          {isSupabaseConfigured && (
            <>
              <div className="flex bg-zinc-950/60 rounded-xl p-1 mt-6 mb-6">
                {[
                  { id: 'signin', label: 'Sign In' },
                  { id: 'signup', label: 'Sign Up' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTab(t.id)
                      setError('')
                    }}
                    className={`relative flex-1 py-2 text-sm font-medium transition-colors ${
                      tab === t.id ? 'text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab === t.id && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute inset-0 bg-purple-600/20 rounded-lg border border-purple-500/40"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative">{t.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'signin' ? (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="space-y-4"
                    onSubmit={handleSignIn}
                  >
                    <div>
                      <label className="text-sm text-zinc-400 mb-1.5 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 bg-zinc-950/60 border border-zinc-700 rounded-xl px-4 text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400 mb-1.5 block">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 bg-zinc-950/60 border border-zinc-700 rounded-xl px-4 text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Signing in...' : 'Login'}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-4"
                    onSubmit={handleSignUp}
                  >
                    <div>
                      <label className="text-sm text-zinc-400 mb-1.5 block">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-11 bg-zinc-950/60 border border-zinc-700 rounded-xl px-4 text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400 mb-1.5 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 bg-zinc-950/60 border border-zinc-700 rounded-xl px-4 text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400 mb-1.5 block">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 bg-zinc-950/60 border border-zinc-700 rounded-xl px-4 text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400 mb-1.5 block">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 bg-zinc-950/60 border border-zinc-700 rounded-xl px-4 text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-500">OR</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <button
                onClick={handleGoogle}
                className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
              >
                <span className="font-bold">G</span>
                Continue with Google
              </button>
            </>
          )}

          <p className="text-center text-xs text-zinc-500 mt-6">Powered by CareerSync AI</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-5 py-3 rounded-xl text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}