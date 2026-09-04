import { motion } from 'framer-motion'

function ScoreRing({ score }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
        <motion.circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-[9px] text-zinc-500">match</span>
      </div>
    </div>
  )
}

function ProgressBar({ value, max = 100, color = '#f87171' }) {
  return (
    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${(value / max) * 100}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

export default function SkillGapCard({ data, loading }) {
  if (loading) {
    return (
      <div className="h-full flex flex-col justify-between bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[20px] p-6 shadow-2xl">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-base">🎯</span>
          <h3 className="text-[14px] font-semibold tracking-wide text-zinc-200">Skill Gap</h3>
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

  const { match_score = 0, matched_skills = [], missing_skills = [] } = data

  // Compute target score and top missing skills for the focus section
  const targetScore = Math.min(match_score + 36, 100)
  const topMissing = missing_skills.slice(0, 3)
  const focusLabel = topMissing.length > 0
    ? `Learn ${topMissing.join(' + ')} to increase match to ${targetScore}%`
    : 'Great job! Keep building on your strengths.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full flex flex-col justify-between bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[20px] p-6 shadow-2xl hover:border-purple-500/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.06)] transition-all duration-300"
    >
      {/* ── Top Section ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-base">🎯</span>
          <h3 className="text-[14px] font-semibold tracking-wide text-zinc-200">Skill Gap</h3>
        </div>

        <div className="flex items-center gap-5 mb-5">
          <ScoreRing score={match_score} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white">
              {match_score >= 70
                ? 'Great match for this role!'
                : match_score >= 40
                  ? 'Good progress, some gaps'
                  : 'Focus on building skills'}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              {matched_skills.length} matched · {missing_skills.length} missing
            </p>
          </div>
        </div>

        {matched_skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium">
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
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.04 }}
                  className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {missing_skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <p className="text-[11px] uppercase tracking-wider text-red-400 font-medium">
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
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.04 }}
                  className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-red-500/10 border border-red-500/20 text-red-300"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Section: Next Focus ── */}
      {missing_skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-auto bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <p className="text-[12px] font-semibold text-white mb-3">Next Focus 🎯</p>

          {/* Progress bar per missing skill */}
          <div className="space-y-2.5 mb-3">
            {topMissing.map((skill) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-400">{skill}</span>
                  <span className="text-[10px] text-zinc-500">0% → 100%</span>
                </div>
                <ProgressBar value={0} max={100} />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
            {focusLabel}
          </p>

          <button className="w-full py-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[12px] font-medium hover:bg-purple-500/25 hover:border-purple-500/50 transition-all">
            View Learning Path →
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
