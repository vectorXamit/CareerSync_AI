import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import { API_BASE_URL } from '../api/client'
import Navbar from '../components/Navbar'

function Sidebar() {
  const steps = [
    { label: 'Login', sub: 'Authenticated', state: 'done' },
    { label: 'Upload Resume', sub: 'Current step', state: 'active' },
    { label: 'Dashboard', sub: 'Next', state: 'pending' },
  ]
  return (
    <aside className="fixed top-0 left-0 w-[280px] h-screen bg-[#0A0A0B]/80 backdrop-blur-xl border-r border-white/[0.06] z-50 flex flex-col justify-between p-6 max-md:hidden">
      <div>
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#A78BFA]"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z" fill="currentColor" /></svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-tight">CareerSync AI</span>
        </div>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <motion.div whileHover={{ scale: 1.1 }} className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${step.state === 'done' ? 'bg-emerald-500/20 border-2 border-emerald-500' : step.state === 'active' ? 'bg-[#7C3AED]/20 border-2 border-[#7C3AED]' : 'bg-white/[0.04] border-2 border-zinc-700'}`}>
                  {step.state === 'done' ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg> : <span className={`text-[13px] font-bold ${step.state === 'active' ? 'text-[#A78BFA]' : 'text-zinc-500'}`}>{i + 1}</span>}
                  {step.state === 'active' && <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />}
                </motion.div>
                {i < steps.length - 1 && <div className={`w-[2px] h-8 ${step.state === 'done' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />}
              </div>
              <motion.div whileHover={{ x: 4 }} className="pt-1.5 pb-4">
                <p className={`text-[13px] font-semibold ${step.state === 'active' ? 'text-white' : step.state === 'done' ? 'text-emerald-300' : 'text-zinc-500'}`}>{step.label}</p>
                <p className={`text-[11px] mt-0.5 ${step.state === 'active' ? 'text-zinc-400' : 'text-zinc-600'}`}>{step.sub}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Progress</span>
            <span className="text-[11px] text-zinc-400 font-medium">66%</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '66%' }} transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }} className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full" />
          </div>
        </div>
        <p className="text-[10px] text-zinc-600">2026 CareerSync AI</p>
      </div>
    </aside>
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
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setError('Only PDF files are allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB.'); return }
    setError(''); setParsing(true)
    const formData = new FormData(); formData.append('file', file)
    try {
      const { data } = await supabase.auth.getSession(); const token = data.session?.access_token
      if (!token) { setError('Session expired'); setParsing(false); return }
      const res = await axios.post(`${API_BASE_URL}/resume/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 180000,
        withCredentials: true,
      })
      console.log('REAL DATA FROM BACKEND', res.data); localStorage.setItem('careerpilot_data', JSON.stringify(res.data))
      setParsing(false); setScanComplete(true); await new Promise((r) => setTimeout(r, 1000)); navigate('/')
    } catch (err) {
      console.error('Backend error:', err)
      setParsing(false)
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is waking up — please try again in 30 seconds')
      } else if (err.message?.includes('Network Error') || err.message?.includes('CORS') || !err.response) {
        setError('Cannot reach server — backend may be down. Try again in a minute.')
      } else {
        const detail = err.response?.data?.detail || err.response?.data?.message || err.response?.statusText || 'Unknown error'
        setError(`Server error (${err.response?.status}): ${detail}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden font-[Inter,sans-serif]">
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050507]">
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full bg-[#7C3AED] blur-[120px] opacity-25 animate-[float1_20s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[20%] -right-[5%] w-[600px] h-[600px] rounded-full bg-[#3B82F6] blur-[100px] opacity-20 animate-[float2_25s_ease-in-out_infinite_alternate]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[900px] h-[900px] rounded-full bg-[#A855F7] blur-[140px] opacity-15 animate-[float3_30s_ease-in-out_infinite_alternate]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] animate-[gridMove_20s_linear_infinite]" />
        <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)%25\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #050507 100%)' }} />
      </div>
      <Sidebar />
      <div className="relative z-10 ml-[280px] max-md:ml-0 min-h-screen flex flex-col">
        <div className="md:hidden"><Navbar /></div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-[#A78BFA] bg-clip-text text-transparent">Upload Resume</h1>
            <p className="text-zinc-500 mt-3 text-[14px]">Drop your PDF and let AI extract your experience, skills and education</p>
          </motion.div>
          <AnimatePresence mode="wait">
            {scanComplete ? (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-[rgba(18,18,20,0.8)] backdrop-blur-xl border border-emerald-500/30 rounded-[24px] p-8 w-full max-w-[600px] flex items-center justify-center gap-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-400">
                    <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-emerald-300 font-semibold text-lg">Resume Uploaded!</p>
                  <p className="text-zinc-500 text-sm mt-1">Redirecting to dashboard...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-[600px]">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileRef.current?.click()}
                  className={`relative cursor-pointer border-2 border-dashed rounded-[24px] p-12 text-center transition-all duration-300 ${
                    dragOver
                      ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                      : 'border-zinc-700 bg-[rgba(18,18,20,0.8)] hover:border-zinc-500 hover:bg-[rgba(18,18,20,0.9)]'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {parsing ? (
                    <div className="flex flex-col items-center gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full"
                      />
                      <div>
                        <p className="text-white font-semibold">Scanning Resume...</p>
                        <p className="text-zinc-500 text-sm mt-1">AI is extracting your data</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#A78BFA]">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="17 8 12 3 7 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="12" y1="3" x2="12" y2="15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Drop your resume here</p>
                        <p className="text-zinc-500 text-sm mt-1">or click to browse • PDF only • Max 5MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
