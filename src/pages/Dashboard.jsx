import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import SkillGapCard from '../components/SkillGapCard'
import InternshipCard from '../components/InternshipCard'
import RoadmapCard from '../components/RoadmapCard'
import {
  analyzeSkillGap,
  fetchInternships,
  generateRoadmap,
} from '../api/client'

const TARGET_ROLES = ['SDE', 'Data Science', 'AI/ML Engineer', 'Web Developer', 'Other']

function SectionCard({ title, icon, children, delay = 0, id, accent = 'purple' }) {
  const accentMap = {
    purple: 'hover:border-[rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]',
    cyan: 'hover:border-[rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]',
    emerald: 'hover:border-[rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]',
    amber: 'hover:border-[rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]',
  }
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.015, y: -4 }}
      className={`scroll-mt-28 relative bg-[rgba(18,18,20,0.8)] backdrop-blur-xl border border-white/[0.08] rounded-[20px] p-6 shadow-2xl transition-all duration-500 cursor-default overflow-hidden group ${accentMap[accent]}`}
    >
      {/* Shimmer line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(124,58,237,0)] to-transparent group-hover:via-[rgba(124,58,237,0.4)] transition-all duration-700" />
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-base">{icon}</span>
        <h3 className="text-[14px] font-semibold tracking-wide text-zinc-200">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function StatBadge({ label, value, color = 'purple' }) {
  const colors = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  }
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={`flex flex-col items-center px-4 py-3 rounded-2xl border ${colors[color]} cursor-default`}
    >
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-60 mt-0.5">{label}</span>
    </motion.div>
  )
}

function RoleSelector({ value, onChange }) {
  return (
    <div className="flex items-center justify-center mt-6">
      <div className="inline-flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full p-1 gap-1">
        {TARGET_ROLES.map((role) => (
          <motion.button
            key={role}
            onClick={() => onChange(role)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-300 ${
              value === role
                ? 'bg-white text-black shadow-lg shadow-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {role}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const NAV_SECTIONS = [
  { id: 'ats', label: '⚡ ATS' },
  { id: 'skills', label: '🧠 Skills' },
  { id: 'skillgap', label: '🎯 Skill Gap' },
  { id: 'internships', label: '💼 Internships' },
  { id: 'roadmap', label: '🗺️ Roadmap' },
]

function StickyNav() {
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : -20 }}
      transition={{ duration: 0.3 }}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-3 py-2 rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] shadow-2xl flex items-center gap-1 pointer-events-none"
    >
      <div className="flex items-center gap-1 pointer-events-auto">
        {NAV_SECTIONS.map(({ id, label }) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() =>
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 ${
              active === id
                ? 'bg-white/10 border border-white/20 text-white'
                : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  let data = null
  try {
    const raw = localStorage.getItem('careerpilot_data')
    data = raw ? JSON.parse(raw) : null
  } catch (e) {
    console.warn('Could not parse careerpilot_data:', e)
    data = null
  }

  const hasData = Boolean(data)
  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#08080A] text-white">
        <Navbar showLogout />
        <div className="flex flex-col items-center justify-center gap-4 pt-32">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-2"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <p className="text-zinc-400 text-sm">No resume found</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/upload')}
            className="px-5 py-2.5 bg-white text-black rounded-full text-[13px] font-medium hover:bg-zinc-200 transition-colors"
          >
            Upload Resume
          </motion.button>
        </div>
      </div>
    )
  }

  const parsed = data.parsed_data || data

  const fullName = parsed.full_name
  const email = parsed.email
  const atsScore = data.ats_score ?? parsed.ats_score ?? 0
  const skills = parsed.skills || []
  const education = parsed.education || []
  const experience = parsed.experience || []
  const projects = parsed.projects || []
  const strengths = parsed.strengths || []
  const weaknesses = parsed.weaknesses || []
  const suggestions = parsed.suggestions || []
  const parsedAt = parsed.parsed_at || null

  return (
    <DashboardContent
      fullName={fullName}
      email={email}
      atsScore={atsScore}
      skills={skills}
      education={education}
      experience={experience}
      projects={projects}
      strengths={strengths}
      weaknesses={weaknesses}
      suggestions={suggestions}
      parsedAt={parsedAt}
    />
  )
}

function DashboardContent({
  fullName,
  email,
  atsScore,
  skills,
  education,
  experience,
  projects,
  strengths,
  weaknesses,
  suggestions,
  parsedAt,
}) {
  const [targetRole, setTargetRole] = useState(() => {
    return localStorage.getItem('careersync_target_role') || 'SDE'
  })
  const [skillGap, setSkillGap] = useState(null)
  const [internships, setInternships] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [loadingGap, setLoadingGap] = useState(false)
  const [loadingInternships, setLoadingInternships] = useState(false)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)
  const mouseRef = useRef(null)

  useEffect(() => {
    const el = mouseRef.current
    if (!el) return
    const handler = (e) => {
      el.style.setProperty('--mouse-x', e.clientX + 'px')
      el.style.setProperty('--mouse-y', e.clientY + 'px')
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useEffect(() => {
    localStorage.setItem('careersync_target_role', targetRole)
    let cancelled = false

    async function run() {
      setLoadingGap(true)
      setLoadingInternships(true)
      setLoadingRoadmap(true)
      setSkillGap(null)
      setInternships(null)
      setRoadmap(null)

      const [gapResult, internResult] = await Promise.all([
        analyzeSkillGap(skills, targetRole),
        fetchInternships(skills, 4),
      ])

      if (cancelled) return
      setLoadingGap(false)
      setLoadingInternships(false)

      if (gapResult) {
        setSkillGap(gapResult)
        const missing = gapResult.missing_skills || []
        if (missing.length > 0) {
          setLoadingRoadmap(true)
          const roadResult = await generateRoadmap(missing, targetRole)
          if (cancelled) return
          setLoadingRoadmap(false)
          if (roadResult) setRoadmap(roadResult)
        }
      }

      if (internResult) setInternships(internResult)
    }

    run()
    return () => { cancelled = true }
  }, [targetRole, skills])

  return (
    <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden font-[Inter,sans-serif]">
      {/* ═══════════ ANIMATED AURORA BACKGROUND ═══════════ */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050507]">
        {/* Orb 1 — Purple, top-left */}
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full bg-[#7C3AED] blur-[120px] opacity-25 animate-[float1_20s_ease-in-out_infinite_alternate]" />
        {/* Orb 2 — Blue, top-right */}
        <div className="absolute top-[20%] -right-[5%] w-[600px] h-[600px] rounded-full bg-[#3B82F6] blur-[100px] opacity-20 animate-[float2_25s_ease-in-out_infinite_alternate]" />
        {/* Orb 3 — Violet, bottom-center */}
        <div className="absolute -bottom-[10%] left-[30%] w-[900px] h-[900px] rounded-full bg-[#A855F7] blur-[140px] opacity-15 animate-[float3_30s_ease-in-out_infinite_alternate]" />
        {/* Moving grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] animate-[gridMove_20s_linear_infinite] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px] animate-[gridMove_30s_linear_infinite] opacity-40" />
        {/* Noise texture */}
        <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)%25\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }} />
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #050507 100%)' }} />
        {/* Mouse spotlight */}
        <div ref={mouseRef} className="absolute inset-0 pointer-events-none transition-opacity duration-300" style={{ background: 'radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124,58,237,0.12), transparent 80%)' }} />
      </div>

      <div className="relative z-10">
        <Navbar showLogout />

        <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent"
            >
              {fullName ? `Welcome, ${fullName}` : 'Your Resume Dashboard'}
            </motion.h1>
            {email && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-zinc-400 mt-3 text-[14px]"
              >
                {email}
              </motion.p>
            )}
            {parsedAt && (
              <p className="text-[11px] text-zinc-600 mt-2">
                Parsed {new Date(parsedAt).toLocaleString()}
              </p>
            )}
            <RoleSelector value={targetRole} onChange={setTargetRole} />

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3 mt-6 flex-wrap"
            >
              <StatBadge label="Skills" value={skills.length} color="purple" />
              <StatBadge label="Projects" value={projects.length} color="cyan" />
              <StatBadge label="Education" value={education.length} color="emerald" />
              <StatBadge label="ATS" value={`${atsScore}%`} color={atsScore >= 70 ? 'emerald' : atsScore >= 40 ? 'amber' : 'purple'} />
            </motion.div>
          </motion.header>

          <StickyNav />

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Card 1: ATS Score */}
            <SectionCard id="ats" title="ATS Score" icon="⚡" delay={0} accent="emerald">
              {typeof atsScore === 'number' && atsScore > 0 ? (
                <div>
                  <div className="flex items-center gap-5 mb-5">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                        <motion.circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke={atsScore >= 70 ? '#34d399' : atsScore >= 40 ? '#fbbf24' : '#f87171'}
                          strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 42}
                          initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - atsScore / 100) }}
                          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                          style={{ filter: `drop-shadow(0 0 12px ${atsScore >= 70 ? '#34d399' : atsScore >= 40 ? '#fbbf24' : '#f87171'}60)` }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${atsScore >= 70 ? 'text-emerald-400' : atsScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{atsScore}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-white">
                        {atsScore >= 70 ? 'Great match' : atsScore >= 40 ? 'Room to improve' : 'Needs work'}
                      </p>
                      <p className="text-[12px] text-zinc-500 mt-0.5">Resume optimization score</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Keyword optimization', ok: atsScore >= 70, val: atsScore >= 70 ? 'Strong' : 'Needs work' },
                      { label: 'Skills coverage', ok: skills.length >= 5, val: `${skills.length} skills`, color: 'blue' },
                      { label: 'Experience section', ok: experience.length > 0, val: experience.length > 0 ? 'Present' : 'Missing', colorMissing: 'red' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02, x: 4 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.05] hover:border-white/[0.12] transition-colors cursor-default"
                      >
                        <div className={`w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-400' : item.colorMissing === 'red' ? 'bg-red-400' : item.color === 'blue' ? 'bg-blue-400' : 'bg-zinc-600'}`} />
                        <p className="text-[12px] text-zinc-400 flex-1">{item.label}</p>
                        <p className="text-[11px] text-zinc-500 font-medium">{item.val}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-400">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-zinc-300 font-medium mb-1">No ATS score yet</p>
                  <p className="text-[11px] text-zinc-600">Upload resume to get your score</p>
                </div>
              )}
            </SectionCard>

            {/* Card 2: Skills */}
            <SectionCard id="skills" title="Skills" icon="🧠" delay={0.1} accent="purple">
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.03 }}
                      className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[#1a1625] border border-purple-500/20 text-purple-200 hover:bg-purple-500/25 hover:border-purple-500/40 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-400">
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                      <path d="M8 12h8M12 8v8" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-zinc-300 font-medium mb-1">No skills found</p>
                  <p className="text-[11px] text-zinc-600">Upload a clearer resume</p>
                </div>
              )}
            </SectionCard>

            {/* Card 3: Education */}
            <SectionCard title="Education" icon="🎓" delay={0.2} accent="purple">
              {education.length > 0 ? (
                <div className="space-y-3">
                  {education.map((e, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] hover:border-purple-500/20 hover:bg-white/[0.06] transition-all cursor-default"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-400">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-white font-semibold leading-snug">
                            {e.degree || 'Degree'}
                          </p>
                          <p className="text-[12px] text-zinc-400 mt-0.5">
                            {e.institution || ''}
                          </p>
                          {e.year && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <div className="w-1 h-1 rounded-full bg-zinc-600" />
                              <p className="text-[11px] text-zinc-500">{e.year}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-400">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-zinc-300 font-medium mb-1">No education found</p>
                  <p className="text-[11px] text-zinc-600">Upload a clearer resume</p>
                </div>
              )}
            </SectionCard>

            {/* Card 4: Experience */}
            <SectionCard title="Experience" icon="💼" delay={0.3} accent="cyan">
              {experience.length > 0 ? (
                <div className="space-y-3">
                  {experience.map((ex, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] hover:border-cyan-500/20 hover:bg-white/[0.06] transition-all cursor-default"
                    >
                      <p className="text-[13px] text-white font-semibold">{ex.role || 'Role'}</p>
                      <p className="text-[12px] text-zinc-400 mt-0.5">{ex.company || ''}</p>
                      {ex.duration && <p className="text-[11px] text-zinc-500 mt-1.5">{ex.duration}</p>}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyan-400">
                      <rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="1.5" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-zinc-300 font-medium mb-1">No experience yet</p>
                  <p className="text-[11px] text-zinc-600 mb-3">Add your first role to boost ATS</p>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[16px] font-bold text-zinc-200">0</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Roles</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[16px] font-bold text-zinc-200">0</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Companies</p>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Card 5: Projects */}
            <SectionCard title="Projects" icon="🚀" delay={0.4} accent="emerald">
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((p, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] hover:border-emerald-500/20 hover:bg-white/[0.06] transition-all group cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] text-white font-semibold">{p.name || 'Project'}</p>
                        <motion.svg
                          whileHover={{ x: 4 }}
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          className="text-zinc-600 group-hover:text-emerald-400 transition-colors"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      </div>
                      {p.tech_stack && (
                        <p className="text-[11px] text-zinc-500 mt-1.5">{p.tech_stack.join(' · ')}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-400">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17l10 5 10-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12l10 5 10-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-zinc-300 font-medium mb-1">No projects found</p>
                  <p className="text-[11px] text-zinc-600">Projects showcase your skills</p>
                </div>
              )}
            </SectionCard>

            {/* Card 6: Strengths & Weaknesses */}
            <SectionCard title="Strengths & Weaknesses" icon="📊" delay={0.5} accent="amber">
              <div className="space-y-4">
                {strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium">Strengths</p>
                    </div>
                    <div className="space-y-1.5">
                      {strengths.map((s, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.02, x: 4 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-2 bg-emerald-500/[0.04] rounded-lg px-3 py-2 border border-emerald-500/10 hover:bg-emerald-500/[0.08] cursor-default"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-400 mt-0.5 shrink-0">
                            <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-[12px] text-zinc-300 leading-relaxed">{s}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <p className="text-[11px] uppercase tracking-wider text-amber-400 font-medium">Weaknesses</p>
                    </div>
                    <div className="space-y-1.5">
                      {weaknesses.map((w, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.02, x: 4 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-2 bg-amber-500/[0.04] rounded-lg px-3 py-2 border border-amber-500/10 hover:bg-amber-500/[0.08] cursor-default"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-400 mt-0.5 shrink-0">
                            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16h.01" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <p className="text-[12px] text-zinc-300 leading-relaxed">{w}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Suggestions */}
            <SectionCard title="Suggestions" icon="💡" delay={0.6} accent="purple">
              {suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {suggestions.map((sugg, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-2.5 bg-white/[0.03] rounded-xl px-3.5 py-3 border border-white/[0.05] hover:border-purple-500/20 hover:bg-white/[0.06] transition-all cursor-default"
                    >
                      <span className="text-purple-400 mt-0.5 shrink-0">→</span>
                      <p className="text-[12px] text-zinc-300 leading-relaxed">{sugg}</p>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-400">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-zinc-300 font-medium mb-1">No suggestions yet</p>
                  <p className="text-[11px] text-zinc-600">Upload resume for AI tips</p>
                </div>
              )}
            </SectionCard>

            {/* Skill Gap */}
            <div id="skillgap" className="scroll-mt-28">
              <SkillGapCard data={skillGap} loading={loadingGap} />
            </div>

            {/* Internships */}
            <div id="internships" className="scroll-mt-28">
              <InternshipCard data={internships} loading={loadingInternships} />
            </div>
          </div>

          {/* Roadmap */}
          <div id="roadmap" className="scroll-mt-28 mt-6">
            <RoadmapCard data={roadmap} loading={loadingRoadmap} />
          </div>
        </main>
      </div>
    </div>
  )
}
