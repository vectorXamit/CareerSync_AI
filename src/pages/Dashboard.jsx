import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className="scroll-mt-28 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function EmptyLine({ text }) {
  return <p className="text-sm text-zinc-500">{text}</p>
}

function RoleSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      <span className="text-xs text-zinc-500 mr-1">Target Role:</span>
      {TARGET_ROLES.map((role) => (
        <button
          key={role}
          onClick={() => onChange(role)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            value === role
              ? 'bg-purple-500/20 border-purple-500/60 text-purple-200'
              : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          }`}
        >
          {role}
        </button>
      ))}
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
      className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-3 py-2 rounded-full bg-zinc-900/85 backdrop-blur-xl border border-zinc-700 shadow-lg shadow-black/40 flex items-center gap-1 pointer-events-none"
    >
      <div className="flex items-center gap-1 pointer-events-auto">
        {NAV_SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() =>
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              active === id
                ? 'bg-purple-500/25 border-purple-500/60 text-purple-100'
                : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'
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
      <div className="min-h-screen bg-black text-white">
        <Navbar showLogout />
        <div className="flex flex-col items-center justify-center gap-4 pt-32">
          <p className="text-zinc-400 text-lg">No resume found</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:scale-105 transition-transform"
          >
            Go to Upload
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
  const rawText = parsed.raw_text || ''

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
      rawText={rawText}
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
  rawText,
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
  const [showRawText, setShowRawText] = useState(false)

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
        <Navbar showLogout />

        <main className="max-w-6xl mx-auto px-4 py-10">
          <motion.header
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h1 className="text-3xl font-bold">
              {fullName ? `Welcome, ${fullName}` : 'Your Resume Dashboard'}
            </h1>
            {email && <p className="text-zinc-400 mt-2">{email}</p>}
            {parsedAt && (
              <p className="text-xs text-zinc-600 mt-1">
                Parsed {new Date(parsedAt).toLocaleString()}
              </p>
            )}
            <RoleSelector value={targetRole} onChange={setTargetRole} />
          </motion.header>

          <StickyNav />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <SectionCard id="ats" title="ATS Score" icon="⚡" delay={0}>
              {typeof atsScore === 'number' ? (
                <div className="flex items-center gap-4">
                  <div
                    className={`text-4xl font-bold ${atsScore >= 70 ? 'text-emerald-400' : atsScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}
                  >
                    {atsScore}%
                  </div>
                  <p className="text-sm text-zinc-400">
                    {atsScore >= 70
                      ? 'Great match'
                      : atsScore >= 40
                        ? 'Room to improve'
                        : 'Needs work'}
                  </p>
                </div>
              ) : (
                <EmptyLine text="No ATS score extracted" />
              )}
            </SectionCard>

            <SectionCard id="skills" title="Skills" icon="🧠" delay={0.1}>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 18,
                        delay: i * 0.03,
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500/20 border border-purple-500/50 text-purple-200"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <EmptyLine text="No skills extracted - upload clearer PDF" />
              )}
            </SectionCard>

            <SectionCard title="Education" icon="🎓" delay={0.2}>
              {education.length > 0 ? (
                <div className="space-y-3">
                  {education.map((e, i) => (
                    <div key={i} className="border-l-2 border-purple-500/40 pl-3">
                      <p className="text-sm text-white font-medium">
                        {e.degree || 'Degree'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {e.institution || ''}
                      </p>
                      <p className="text-xs text-zinc-500">{e.year || ''}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyLine text="No education extracted" />
              )}
            </SectionCard>

            <SectionCard title="Experience" icon="💼" delay={0.3}>
              {experience.length > 0 ? (
                <div className="space-y-3">
                  {experience.map((ex, i) => (
                    <div key={i} className="border-l-2 border-cyan-500/40 pl-3">
                      <p className="text-sm text-white font-medium">
                        {ex.role || 'Role'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {ex.company || ''}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {ex.duration || ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyLine text="No experience extracted" />
              )}
            </SectionCard>

            <SectionCard title="Projects" icon="🚀" delay={0.4}>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((p, i) => (
                    <div key={i} className="border-l-2 border-emerald-500/40 pl-3">
                      <p className="text-sm text-white font-medium">
                        {p.name || 'Project'}
                      </p>
                      {p.tech_stack && (
                        <p className="text-xs text-zinc-400">
                          {p.tech_stack.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyLine text="No projects extracted" />
              )}
            </SectionCard>

            <SectionCard
              title="Strengths & Weaknesses"
              icon="📊"
              delay={0.5}
            >
              <div className="space-y-3">
                {strengths.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-400 mb-1">
                      Strengths
                    </p>
                    {strengths.map((s, i) => (
                      <p key={i} className="text-sm text-zinc-300">
                        • {s}
                      </p>
                    ))}
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-red-400 mb-1">
                      Weaknesses
                    </p>
                    {weaknesses.map((w, i) => (
                      <p key={i} className="text-sm text-zinc-300">
                        • {w}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Suggestions" icon="💡" delay={0.6}>
              {suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {suggestions.map((sugg, i) => (
                    <li
                      key={i}
                      className="text-sm text-zinc-300 flex gap-2"
                    >
                      <span className="text-purple-400">→</span>
                      {sugg}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyLine text="No suggestions extracted" />
              )}
            </SectionCard>

            <div id="skillgap" className="scroll-mt-28">
              <SkillGapCard data={skillGap} loading={loadingGap} />
            </div>

            <div id="internships" className="scroll-mt-28">
              <InternshipCard data={internships} loading={loadingInternships} />
            </div>
          </div>

          <div id="roadmap" className="scroll-mt-28 mt-6">
            <RoadmapCard data={roadmap} loading={loadingRoadmap} />
          </div>

          {rawText && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
            >
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="w-full flex items-center gap-2 text-left"
              >
                <span className="text-lg">📄</span>
                <h3 className="text-base font-semibold text-white">
                  Resume Text Preview
                </h3>
                <motion.svg
                  animate={{ rotate: showRawText ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-zinc-500 ml-auto"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </button>
              <AnimatePresence>
                {showRawText && (
                  <motion.pre
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed mt-3 border-t border-zinc-800 pt-4"
                  >
                    {rawText}
                  </motion.pre>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
