import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const resourceIcons = {
  youtube: '🎬',
  docs: '📄',
  article: '📝',
  course: '🎓',
}

function RoadmapStep({ step, index, total }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative"
    >
      {index < total - 1 && (
        <div className="absolute left-[15px] top-10 bottom-0 w-px bg-zinc-700/50" />
      )}

      <div className="flex gap-4">
        <div className="relative z-10 shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
          <span className="text-xs font-bold text-purple-300">
            {step.step_no}
          </span>
        </div>

        <div className="flex-1 pb-5">
          <button
            onClick={() => setOpen(!open)}
            className="w-full text-left flex items-center justify-between gap-2 group"
          >
            <div className="min-w-0">
              <p className="text-sm text-white font-medium group-hover:text-purple-200 transition-colors truncate">
                {step.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-zinc-500">
                  ~{step.estimated_days} days
                </span>
                {step.is_completed && (
                  <span className="text-[10px] text-emerald-400">✓ done</span>
                )}
              </div>
            </div>
            <motion.svg
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-zinc-500 shrink-0"
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
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {step.description}
                </p>

                {step.resources?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {step.resources.map((res, ri) => (
                      <a
                        key={ri}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-zinc-800/60 border border-zinc-700 text-zinc-300 hover:border-purple-500/40 hover:text-purple-200 transition-colors"
                      >
                        <span>{resourceIcons[res.type] || '🔗'}</span>
                        <span className="truncate max-w-[140px]">
                          {res.title}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default function RoadmapCard({ data, loading, real = false }) {
  if (loading) {
    return (
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🗺️</span>
          <h3 className="text-base font-semibold text-white">
            Learning Roadmap
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
            />
            <p className="text-xs text-zinc-500">
              Generating your roadmap with AI...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.roadmap?.length) return null

  const { roadmap, total_estimated_days, generated_at } = data

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🗺️</span>
        <h3 className="text-base font-semibold text-white">
          Learning Roadmap
        </h3>
      </div>
      <div className="flex items-center gap-3 mb-5 text-xs text-zinc-500">
        <span>{roadmap.length} steps</span>
        <span>·</span>
        <span>~{total_estimated_days} days total</span>
        {generated_at && (
          <>
            <span>·</span>
            <span>
              Generated{' '}
              {new Date(generated_at).toLocaleDateString()}
            </span>
          </>
        )}
        <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
          real
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
        }`}>
          {real ? 'AI-generated' : 'Sample roadmap'}
        </span>
      </div>

      <div>
        {roadmap.map((step, i) => (
          <RoadmapStep
            key={step.step_no || i}
            step={step}
            index={i}
            total={roadmap.length}
          />
        ))}
      </div>
    </motion.div>
  )
}
