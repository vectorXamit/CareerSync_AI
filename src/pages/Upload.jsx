import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

function Stepper() {
  const steps = [
    { label: 'Login', state: 'done' },
    { label: 'Upload Resume', state: 'active' },
    { label: 'Dashboard', state: 'pending' },
  ]
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border ${
                s.state === 'done'
                  ? 'bg-green-500 border-green-500 text-white'
                  : s.state === 'active'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-zinc-700 border-zinc-700 text-white'
              }`}
            >
              {s.state === 'done' ? '✓' : i + 1}
            </div>
            <span
              className={`text-sm hidden sm:block ${
                s.state === 'active' ? 'text-white font-medium' : 'text-zinc-400'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 mx-2 ${s.state === 'done' ? 'bg-green-500' : 'bg-zinc-600'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function FileIcon({ scanning }) {
  return (
    <div className="relative shrink-0 w-24 h-28">
      <div className="absolute inset-0 rounded-2xl border border-purple-400/40 bg-purple-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-300">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      {scanning && (
        <motion.div
          className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
          animate={{ y: [0, 88, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

function UploadIcon() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="w-20 h-20 rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-600/20 to-cyan-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]"
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-300">
        <path d="M12 16V4M12 4L7 9M12 4l5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12h8" strokeWidth="1.5" strokeLinecap="round" className="text-cyan-300" />
      </svg>
    </motion.div>
  )
}

export default function Upload() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.')
      return
    }
    setError('')
    setParsing(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session.access_token
      const res = await axios.post(`${API_URL}/resume/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log('REAL DATA FROM BACKEND', res.data)

      localStorage.setItem('careerpilot_data', JSON.stringify(res.data))
      localStorage.setItem('student_id', res.data.email || '123')

      setParsing(false)
      setScanComplete(true)
      await new Promise((r) => setTimeout(r, 1000))
      navigate('/')
    } catch (err) {
      console.error('Backend error:', err)
      setParsing(false)
      setError('Backend error - check FastAPI terminal')
      await new Promise((r) => setTimeout(r, 800))
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/25 blur-[500px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[500px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between px-6 py-4">
          <Navbar />
          <Stepper />
        </div>

        <div className="text-center pt-10 px-4">
          <h1 className="text-4xl font-bold">Phase 2 — Upload Resume</h1>
          <p className="text-zinc-400 mt-2 max-w-xl mx-auto">
            Upload your resume to continue. We'll extract your experience, skills, and education using AI.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
          <AnimatePresence mode="wait">
            {scanComplete ? (
              <motion.div
                key="scancomplete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-zinc-900/60 backdrop-blur-xl border border-green-500/40 rounded-2xl p-6 max-w-3xl w-full mx-auto mt-8 flex items-center justify-center gap-3"
              >
                <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-400">
                    <path d="M20 6 9 17l-5-5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-green-300 font-medium">Scan complete</p>
              </motion.div>
            ) : !parsing ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFile(e.dataTransfer.files?.[0])
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                className={`border border-dashed rounded-[20px] h-[360px] bg-zinc-900/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center gap-5 transition-all duration-200 ${
                  dragOver
                    ? 'border-solid border-purple-500 bg-zinc-900/80 scale-[1.02] shadow-[0_0_60px_rgba(168,85,247,0.3)]'
                    : 'border-purple-400/50'
                }`}
              >
                <UploadIcon />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {dragOver ? 'Release to upload 🚀' : 'Drop your resume here'}
                  </p>
                  <p className="text-zinc-400 mt-2">PDF only • Max 5MB</p>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="bg-white text-black rounded-full px-6 py-2.5 font-medium hover:scale-105 transition-transform mt-2"
                >
                  Browse File
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </motion.div>
            ) : (
              <motion.div
                key="parsing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 max-w-3xl w-full mx-auto mt-8 flex items-center gap-6"
              >
                <FileIcon scanning />
                <div className="flex-1">
                  <p className="text-purple-200 font-medium text-lg">Parsing with AI... Extracting data...</p>
                  <div className="bg-zinc-800 rounded-full h-3 w-full overflow-hidden mt-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-cyan-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: 'easeInOut' }}
                    />
                  </div>
                  <p className="text-zinc-400 text-sm mt-3">
                    Extracting experience, skills, education • ~3 seconds remaining
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-5 py-3 rounded-xl text-sm font-medium"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}