import { useState, useEffect } from 'react'
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

function SectionCard({ title, icon, children, delay = 0, id }) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className="scroll-mt-28 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-6 shadow-2xl hover:border-purple-500/25 hover:shadow-[0_0_40px_rgba(168,85,247,0.08)] transition-all duration-300"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-base">{icon}</span>
        <h3 className="text-[14px] font-semibold tracking-wide text-zinc-200">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function EmptyLine({ text }) {
  return <p className="text-[13px] text-zinc-500">{text}</p>
}

function RoleSelector({ value, onChange }) {
  return (
    <div className="flex items-center justify-center mt-6">
      <div className="inline-flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full p-1 gap-1">
        {TARGET_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => onChange(role)}
            className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-300 ${
              value === role
                ? 'bg-white text-black shadow-lg shadow-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {role}
          </button>
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
          <button
            key={id}
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
          </button>
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
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-zinc-400 text-sm">No resume found</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-5 py-2.5 bg-white text-black rounded-full text-[13px] font-medium hover:bg-zinc-200 transition-colors"
          >
            Upload Resume
          </button>
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
    <div            className="min-h-screen bg-[#08080A] text-white relative overflow-hidden font-[Inter,sans-serif]">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      {/* Header purple glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
      {/* Bottom glow */}
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <Navbar showLogout />

        <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              {fullName ? `Welcome, ${fullName}` : 'Your Resume Dashboard'}
            </h1>
            {email && (
              <p className="text-zinc-400 mt-3 text-[14px]">{email}</p>
            )}
            {parsedAt && (
              <p className="text-[11px] text-zinc-600 mt-2">
                Parsed {new Date(parsedAt).toLocaleString()}
              </p>
            )}
            <RoleSelector value={targetRole} onChange={setTargetRole} />
          </motion.header>

          <StickyNav />

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Card 1: ATS Score */}
            <SectionCard id="ats" title="ATS Score" icon="⚡" delay={0}>
              {typeof atsScore === 'number' ? (
                <div>
                  <div className="flex items-center gap-5 mb-5">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke={atsScore >= 70 ? '#34d399' : atsScore >= 40 ? '#fbbf24' : '#f87171'}
                          strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 * (1 - atsScore / 100)}
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
                    <div className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.05]">
                      <div className={`w-2 h-2 rounded-full ${atsScore >= 70 ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      <p className="text-[12px] text-zinc-400 flex-1">Keyword optimization</p>
                      <p className="text-[11px] text-zinc-500 font-medium">{atsScore >= 70 ? 'Strong' : 'Needs work'}</p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.05]">
                      <div className={`w-2 h-2 rounded-full ${skills.length >= 5 ? 'bg-blue-400' : 'bg-amber-400'}`} />
                      <p className="text-[12px] text-zinc-400 flex-1">Skills coverage</p>
                      <p className="text-[11px] text-zinc-500 font-medium">{skills.length} skills</p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.05]">
                      <div className={`w-2 h-2 rounded-full ${experience.length > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <p className="text-[12px] text-zinc-400 flex-1">Experience section</p>
                      <p className="text-[11px] text-zinc-500 font-medium">{experience.length > 0 ? 'Present' : 'Missing'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyLine text="No ATS score extracted" />
              )}
            </SectionCard>

            {/* Card 2: Skills */}
            <SectionCard id="skills" title="Skills" icon="🧠" delay={0.1}>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.03 }}
                      className="px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-[#1a1625] border border-purple-500/20 text-purple-200 hover:bg-purple-500/20 transition-colors cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <EmptyLine text="No skills extracted" />
              )}
            </SectionCard>

            {/* Card 3: Education */}
            <SectionCard title="Education" icon="🎓" delay={0.2}>
              {education.length > 0 ? (
                <div className="space-y-3">
                  {education.map((e, i) => (
                    <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
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
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyLine text="No education extracted" />
              )}
            </SectionCard>

            {/* Card 4: Experience */}
            <SectionCard title="Experience" icon="💼" delay={0.3}>
              {experience.length > 0 ? (
                <div className="space-y-3">
                  {experience.map((ex, i) => (
                    <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                      <p className="text-[13px] text-white font-semibold">
                        {ex.role || 'Role'}
                      </p>
                      <p className="text-[12px] text-zinc-400 mt-0.5">
                        {ex.company || ''}
                      </p>
                      {ex.duration && (
                        <p className="text-[11px] text-zinc-500 mt-1.5">
                          {ex.duration}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-500">
                      <rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="1.5" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-zinc-400 mb-1">No experience yet</p>
                  <p className="text-[11px] text-zinc-600">Add your first role to boost ATS</p>
                </div>
              )}
            </SectionCard>

            {/* Card 5: Projects */}
            <SectionCard title="Projects" icon="🚀" delay={0.4}>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((p, i) => (
                    <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] hover:border-emerald-500/20 transition-colors group">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] text-white font-semibold">
                          {p.name || 'Project'}
                        </p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-600 group-hover:text-emerald-400 transition-colors">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {p.tech_stack && (
                        <p className="text-[11px] text-zinc-500 mt-1.5">
                          {p.tech_stack.join(' · ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyLine text="No projects extracted" />
              )}
            </SectionCard>

            {/* Card 6: Strengths & Weaknesses */}
            <SectionCard title="Strengths & Weaknesses" icon="📊" delay={0.5}>
              <div className="space-y-4">
                {strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium">Strengths</p>
                    </div>
                    <div className="space-y-1.5">
                      {strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 bg-emerald-500/[0.04] rounded-lg px-3 py-2 border border-emerald-500/10">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-400 mt-0.5 shrink-0">
                            <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-[12px] text-zinc-300 leading-relaxed">{s}</p>
                        </div>
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
                        <div key={i} className="flex items-start gap-2 bg-amber-500/[0.04] rounded-lg px-3 py-2 border border-amber-500/10">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-400 mt-0.5 shrink-0">
                            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16h.01" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <p className="text-[12px] text-zinc-300 leading-relaxed">{w}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Suggestions */}
            <SectionCard title="Suggestions" icon="💡" delay={0.6}>
              {suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {suggestions.map((sugg, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-white/[0.03] rounded-xl px-3.5 py-3 border border-white/[0.05] hover:border-purple-500/20 transition-colors group">
                      <span className="text-purple-400 mt-0.5 shrink-0">→</span>
                      <p className="text-[12px] text-zinc-300 leading-relaxed">{sugg}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyLine text="No suggestions extracted" />
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
