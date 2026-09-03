import { motion } from 'framer-motion'

function ScoreRing({ score }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div className="relative w-24 h-24 shrink-0">
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
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>
          {score}%
        </span>
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

  const { match_score = 0, matched_skills = [], missing_skills = [] } = data

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors col-span-full md:col-span-1"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎯</span>
        <h3 className="text-base font-semibold text-white">Skill Gap</h3>
      </div>

      <div className="flex items-center gap-5 mb-5">
        <ScoreRing score={match_score} />
        <div>
          <p className="text-sm text-zinc-400">
            {match_score >= 70
              ? 'Great match for this role!'
              : match_score >= 40
                ? 'Good progress, some gaps to fill'
                : 'Focus on building core skills'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {matched_skills.length} matched · {missing_skills.length} missing
          </p>
        </div>
      </div>

      {matched_skills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs uppercase tracking-wide text-emerald-400 mb-2">
            Matched
          </p>
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

      {missing_skills.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-red-400 mb-2">
            Missing
          </p>
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
    </motion.div>
  )
}
