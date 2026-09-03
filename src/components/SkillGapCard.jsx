import { motion } from 'framer-motion'

function ScoreRing({ score }) {
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {score}%
        </span>
        <span className="text-[10px] text-zinc-500">match</span>
      </div>
    </div>
  )
}

function ProgressBar({ matched, total }) {
  const pct = total > 0 ? Math.round((matched / total) * 100) : 0
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-zinc-500">Skill Coverage</span>
        <span className="text-[11px] text-zinc-400 font-medium">{matched}/{total}</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct >= 70 ? '#34d399' : pct >= 40 ? '#fbbf24' : '#f87171' }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        />
      </div>
    </div>
  )
}

export default function SkillGapCard({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 col-span-full md:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎯</span>
          <h3 className="text-base font-semibold text-white">Skill Gap</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { match_score = 0, matched_skills = [], missing_skills = [], summary = '' } = data
  const total = matched_skills.length + missing_skills.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors col-span-full md:col-span-1"
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">🎯</span>
        <h3 className="text-base font-semibold text-white">Skill Gap</h3>
      </div>

      {/* Score Ring + Status */}
      <div className="flex items-center gap-5 mb-5">
        <ScoreRing score={match_score} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {match_score >= 70
              ? 'Great match for this role!'
              : match_score >= 40
                ? 'Good progress, some gaps'
                : 'Focus on building skills'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {matched_skills.length} matched · {missing_skills.length} missing
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <ProgressBar matched={matched_skills.length} total={total} />
      </div>

      {/* Matched Skills */}
      {matched_skills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-xs uppercase tracking-wide text-emerald-400 font-medium">
              Matched ({matched_skills.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched_skills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 18,
                  delay: i * 0.04,
                }}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missing_skills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <p className="text-xs uppercase tracking-wide text-red-400 font-medium">
              Missing ({missing_skills.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing_skills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 18,
                  delay: i * 0.04,
                }}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 border border-red-500/40 text-red-300"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {summary && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-start gap-2">
            <span className="text-xs mt-0.5">💡</span>
            <p className="text-xs text-zinc-400 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
