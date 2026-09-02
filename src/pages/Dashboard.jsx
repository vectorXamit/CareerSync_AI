import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

function SectionCard({ title, icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
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

        <main className="max-w-5xl mx-auto px-4 py-10">
          <motion.header
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold">
              {fullName ? `Welcome, ${fullName}` : 'Your Resume Dashboard'}
            </h1>
            {email && <p className="text-zinc-400 mt-2">{email}</p>}
          </motion.header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SectionCard title="ATS Score" icon="⚡" delay={0}>
              {typeof atsScore === 'number' ? (
                <div className="flex items-center gap-4">
                  <div
                    className={`text-4xl font-bold ${atsScore >= 70 ? 'text-emerald-400' : atsScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}
                  >
                    {atsScore}%
                  </div>
                  <p className="text-sm text-zinc-400">
                    {atsScore >= 70 ? 'Great match' : atsScore >= 40 ? 'Room to improve' : 'Needs work'}
                  </p>
                </div>
              ) : (
                <EmptyLine text="No ATS score extracted" />
              )}
            </SectionCard>

            <SectionCard title="Skills" icon="🧠" delay={0.1}>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.03 }}
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
                      <p className="text-sm text-white font-medium">{e.degree || 'Degree'}</p>
                      <p className="text-xs text-zinc-400">{e.institution || ''}</p>
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
                      <p className="text-sm text-white font-medium">{ex.role || 'Role'}</p>
                      <p className="text-xs text-zinc-400">{ex.company || ''}</p>
                      <p className="text-xs text-zinc-500">{ex.duration || ''}</p>
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
                      <p className="text-sm text-white font-medium">{p.name || 'Project'}</p>
                      {p.tech_stack && (
                        <p className="text-xs text-zinc-400">{p.tech_stack.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyLine text="No projects extracted" />
              )}
            </SectionCard>

            <SectionCard title="Strengths & Weaknesses" icon="📊" delay={0.5}>
              <div className="space-y-3">
                {strengths.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-400 mb-1">Strengths</p>
                    {strengths.map((s, i) => (
                      <p key={i} className="text-sm text-zinc-300">• {s}</p>
                    ))}
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-red-400 mb-1">Weaknesses</p>
                    {weaknesses.map((w, i) => (
                      <p key={i} className="text-sm text-zinc-300">• {w}</p>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Suggestions" icon="💡" delay={0.6}>
              {suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {suggestions.map((sugg, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex gap-2">
                      <span className="text-purple-400">→</span>
                      {sugg}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyLine text="No suggestions extracted" />
              )}
            </SectionCard>
          </div>
        </main>
      </div>
    </div>
  )
}