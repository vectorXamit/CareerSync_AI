import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setSession(session)
      setLoading(false)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-purple-500" />
        <span className="ml-3 text-white text-sm">Loading...</span>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return children
}