import { motion } from 'framer-motion'

const modeColors = {
  Remote: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  Hybrid: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
  'On-site': 'bg-sky-500/15 border-sky-500/40 text-sky-300',
}

function MatchBadge({ score }) {
  const color =
    score >= 70
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : score >= 40
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40'

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}
    >
      {score}% match
    </span>
  )
}

function InternshipItem({ intern, index }) {
  const modeClass =
    modeColors[intern.mode] || modeColors['On-site']

  return (
    <motion.a
      href={intern.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="block border-l-2 border-cyan-500/40 pl-4 py-3 hover:bg-zinc-800/30 rounded-r-xl transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-white font-medium truncate group-hover:text-cyan-200 transition-colors">
            {intern.title}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {intern.company}
            {intern.location && ` · ${intern.location}`}
          </p>
        </div>
        <MatchBadge score={intern.match_score} />
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${modeClass}`}>
          {intern.mode}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            intern.is_paid
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-zinc-500/15 border-zinc-500/40 text-zinc-400'
          }`}
        >
          {intern.stipend}
        </span>
      </div>

      {intern.matched_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {intern.matched_skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </motion.a>
  )
}

export default function InternshipCard({ data, loading, real = false }) {
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💼</span>
          <h3 className="text-base font-semibold text-white">
            Top Internships
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full flex flex-col bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💼</span>
        <h3 className="text-base font-semibold text-white">
          Top Internships
        </h3>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
          real
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
        }`}>
          {real ? `${data.length} live listings` : 'Sample data'}
        </span>
      </div>

      <div className="space-y-1 divide-y divide-zinc-800/50 flex-1">
        {data.map((intern, i) => (
          <InternshipItem key={intern.id || i} intern={intern} index={i} />
        ))}
      </div>
    </motion.div>
  )
}
