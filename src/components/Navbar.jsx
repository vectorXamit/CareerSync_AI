import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function Navbar({ showLogout = false }) {
  const navigate = useNavigate()

  async function handleLogout() {
    localStorage.removeItem('careerpilot_data')
    localStorage.removeItem('student_id')
    try {
      if (supabase) await supabase.auth.signOut()
    } catch (err) {
      console.warn('signOut error:', err.message)
    }
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black/60 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-400">
          <path
            d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z"
            fill="currentColor"
          />
          <path
            d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"
            fill="currentColor"
            opacity="0.7"
          />
        </svg>
        <span className="text-white font-bold text-lg tracking-tight">CareerSync AI</span>
      </div>
      {showLogout && (
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 text-sm font-medium bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 hover:bg-zinc-700 hover:border-purple-500/50 transition-colors"
        >
          Sign Out
        </motion.button>
      )}
    </header>
  )
}