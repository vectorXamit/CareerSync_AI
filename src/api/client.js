import axios from 'axios'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Relative to the same origin. In dev, Vite proxies /api to the backend;
// in production, the Vercel serverless function api/[...path].js forwards it.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  // Allow Render cold-starts (~45s observed) + AI generation. Hard failures
  // (backend down) return a fast 502 from the proxy instead of hanging.
  timeout: 180000,
})

api.interceptors.request.use(async (config) => {
  if (!isSupabaseConfigured) return config
  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (err) {
    console.warn('Failed to attach auth token:', err.message)
  }
  return config
})

// ========== LOCAL INTERNSHIP FALLBACK ==========
const FALLBACK_INTERNSHIPS = [
  { id: '1', title: 'Python Developer Intern', company: 'Razorpay', location: 'Bangalore, India', mode: 'Remote', stipend: '15k/month', is_paid: true, required_skills: ['Python', 'FastAPI', 'SQL'], url: 'https://razorpay.com/careers', description: 'Backend development intern' },
  { id: '2', title: 'React Frontend Intern', company: 'Zerodha', location: 'Remote, India', mode: 'Remote', stipend: '20k/month', is_paid: true, required_skills: ['React', 'JavaScript', 'CSS'], url: 'https://zerodha.com/careers', description: 'Frontend development intern' },
  { id: '3', title: 'Data Science Intern', company: 'Swiggy', location: 'Bangalore, India', mode: 'Hybrid', stipend: '25k/month', is_paid: true, required_skills: ['Python', 'Machine Learning', 'SQL'], url: 'https://swiggy.com/careers', description: 'Data science intern' },
  { id: '4', title: 'Full Stack Intern', company: 'Freshworks', location: 'Chennai, India', mode: 'Remote', stipend: '18k/month', is_paid: true, required_skills: ['React', 'Node.js', 'SQL'], url: 'https://freshworks.com/careers', description: 'Full stack development intern' },
  { id: '5', title: 'AI/ML Intern', company: 'Infosys', location: 'Hyderabad, India', mode: 'On-site', stipend: '12k/month', is_paid: true, required_skills: ['Python', 'TensorFlow', 'Machine Learning'], url: 'https://infosys.com/careers', description: 'AI/ML intern' },
  { id: '6', title: 'Data Analytics Intern', company: 'Deloitte', location: 'Mumbai, India', mode: 'Hybrid', stipend: '20k/month', is_paid: true, required_skills: ['Python', 'SQL', 'Tableau', 'Excel'], url: 'https://deloitte.com/careers', description: 'Data analytics intern' },
  { id: '7', title: 'Backend Developer Intern', company: 'Flipkart', location: 'Bangalore, India', mode: 'On-site', stipend: '30k/month', is_paid: true, required_skills: ['Java', 'Python', 'SQL', 'System Design'], url: 'https://flipkart.com/careers', description: 'Backend development intern' },
  { id: '8', title: 'Web Development Intern', company: 'Meesho', location: 'Bangalore, India', mode: 'Remote', stipend: '15k/month', is_paid: true, required_skills: ['React', 'JavaScript', 'HTML', 'CSS'], url: 'https://meesho.com/careers', description: 'Web development intern' },
]

function computeInternshipsLocally(userSkills, limit) {
  const userLowerSet = new Set(userSkills.map((s) => s.toLowerCase()))
  const scored = FALLBACK_INTERNSHIPS.map((intern) => {
    const matched = intern.required_skills.filter((s) => userLowerSet.has(s.toLowerCase()))
    const matchScore = intern.required_skills.length > 0
      ? Math.round((matched.length / intern.required_skills.length) * 100)
      : 0
    return { ...intern, match_score: matchScore, matched_skills: matched }
  })
  scored.sort((a, b) => b.match_score - a.match_score)
  return scored.slice(0, limit)
}

// ========== LOCAL SKILL GAP FALLBACK ==========
// Replicates backend's gap_engine.py logic so skill gap works even if backend analyze endpoint fails
const ROLE_SKILLS_MAP = {
  'SDE': ['Python', 'DSA', 'OOPs', 'SQL', 'Git', 'REST APIs', 'System Design'],
  'Data Science': ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Statistics', 'Data Visualization'],
  'AI/ML Engineer': ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Groq', 'LangChain'],
  'Web Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'FastAPI', 'PostgreSQL', 'Git'],
  'Other': ['Python', 'Communication', 'Problem Solving'],
}

function computeSkillGapLocally(userSkills, targetRole) {
  const required = ROLE_SKILLS_MAP[targetRole] || ROLE_SKILLS_MAP['Other']
  const userLowerSet = new Set(userSkills.map((s) => s.toLowerCase()))
  const matched = required.filter((s) => userLowerSet.has(s.toLowerCase()))
  const missing = required.filter((s) => !userLowerSet.has(s.toLowerCase()))
  const matchScore = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 0
  return {
    student_id: 'local',
    target_role: targetRole,
    match_score: matchScore,
    matched_skills: matched,
    missing_skills: missing,
    gaps: [
      ...matched.map((s) => ({ skill: s, status: 'matched', level: 'Intermediate' })),
      ...missing.map((s) => ({ skill: s, status: 'missing', level: 'Beginner' })),
    ],
    summary: `Good foundation with ${matched.slice(0, 3).join(', ') || 'some skills'}. Focus on learning ${missing.slice(0, 3).join(', ') || 'new skills'} to become ${targetRole} ready.`,
  }
}

// ========== LOCAL ROADMAP FALLBACK ==========
// Generates a basic roadmap locally if backend roadmap endpoint fails
function generateRoadmapLocally(missingSkills, targetRole) {
  const steps = missingSkills.map((skill, i) => ({
    step_no: i + 1,
    skill: skill,
    title: `Learn ${skill} for ${targetRole}`,
    description: `Master fundamentals and intermediate concepts of ${skill} required for ${targetRole} role.`,
    resources: [
      { type: 'youtube', title: `Learn ${skill} Full Course`, url: `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}+for+${encodeURIComponent(targetRole)}` },
      { type: 'docs', title: `${skill} Documentation`, url: `https://developer.mozilla.org` },
    ],
    estimated_days: 3,
    is_completed: false,
  }))
  return {
    student_id: 'local',
    target_role: targetRole,
    roadmap: steps,
    total_estimated_days: steps.length * 3,
    generated_at: new Date().toISOString(),
  }
}

export async function syncUser() {
  try {
    if (!isSupabaseConfigured) return null
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (!session) return null
    const res = await api.post('/auth/sync', {
      supabase_id: session.user.id,
      email: session.user.email,
      full_name: session.user.user_metadata?.full_name || null,
    })
    return res.data
  } catch (err) {
    console.warn('syncUser failed (backend likely down):', err.message)
    return null
  }
}

export async function uploadResume(formData) {
  try {
    const res = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (err) {
    console.warn('uploadResume failed (backend likely down):', err.message)
    return null
  }
}

export async function getMe() {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch (err) {
    console.warn('getMe failed (backend likely down):', err.message)
    return null
  }
}

// ========== CACHE HELPERS ==========
function getCached(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > 1000 * 60 * 30) return null // 30 min expiry
    return data
  } catch { return null }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* quota exceeded — ignore */ }
}

function skillsHash(skills) {
  return [...skills].sort().join(',').toLowerCase()
}

// All recommenders return { payload, real }.
// real: true  = data came from the live backend
// real: false = backend failed, returned a local sample/estimate instead
// v2 cache keys so older (raw-shaped) cache entries from previous deploys expire cleanly.
export async function analyzeSkillGap(skills, targetRole) {
  const cacheKey = `cs_gap2_${targetRole}_${skillsHash(skills)}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  // Try backend first
  try {
    let studentId = null
    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getSession()
      studentId = data.session?.user?.id
    }
    if (studentId) {
      const res = await api.post(`/analyze/${studentId}`, {
        target_role: targetRole,
      })
      const out = { payload: res.data, real: true }
      setCache(cacheKey, out)
      return out
    }
  } catch (err) {
    console.warn('Backend analyze failed, using local fallback:', err.message)
  }
  // Local fallback — mirrors backend gap_engine.py logic
  // NOTE: not cached so real data isn't blocked when backend comes online
  return { payload: computeSkillGapLocally(skills, targetRole), real: false }
}

// ══════════ SHAPE NORMALIZERS ══════════
// The backend sometimes nests roadmap data differently or misses per-listing
// skill info. These normalizers make ANY plausible backend shape render correctly.

function looksLikeSteps(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false
  const first = arr[0]
  if (!first || typeof first !== 'object' || Array.isArray(first)) return false
  const stepStrong = ['skill', 'step_no', 'estimated_days', 'description', 'is_completed', 'days', 'duration_days']
    .some((k) => k in first)
  const resourceOnly = 'url' in first && 'type' in first
  const titleOnly = 'title' in first && !('url' in first) && !('type' in first)
  return (stepStrong && !resourceOnly) || titleOnly
}

function findSteps(value, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 6) return null
  if (looksLikeSteps(value)) return value
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item && typeof item === 'object') {
        const found = findSteps(item, depth + 1)
        if (found) return found
      }
    }
    return null
  }
  for (const key of Object.keys(value)) {
    const found = findSteps(value[key], depth + 1)
    if (found) return found
  }
  return null
}

function normalizeStep(step, idx) {
  if (!step || typeof step !== 'object') return null
  const skill = String(
    step.skill || (Array.isArray(step.skills) && step.skills[0]) || step.title || step.name || step.course || '',
  )
  const title = String(step.title || step.skill || step.name || step.course || `Step ${idx + 1}`)
  const description = String(step.description || step.summary || step.details || '')
  const resources = Array.isArray(step.resources)
    ? step.resources
        .map((r) => (r && typeof r === 'object'
          ? {
              type: String(r.type || 'link'),
              title: String(r.title || 'Resource'),
              url: String(r.url || r.link || '#'),
            }
          : null))
        .filter(Boolean)
    : []
  const estimated_days = Number(step.estimated_days ?? step.days ?? step.estimated_days_days ?? step.duration_days ?? 3) || 3
  return {
    step_no: Number(step.step_no ?? idx + 1) || idx + 1,
    skill,
    title,
    description,
    resources,
    estimated_days,
    is_completed: Boolean(step.is_completed || step.completed),
  }
}

// Turn any plausible backend roadmap payload into the shape the cards expect.
function normalizeRoadmapPayload(raw) {
  const steps = (findSteps(raw) || []).map(normalizeStep).filter(Boolean)
  const total = Number(raw?.total_estimated_days) ||
    Number(raw?.total_days) ||
    steps.reduce((sum, s) => sum + (s.estimated_days || 0), 0)
  return {
    student_id: raw?.student_id || 'backend',
    target_role: raw?.target_role || '',
    roadmap: steps,
    total_estimated_days: total || steps.length * 3,
    generated_at: raw?.generated_at || raw?.created_at || new Date().toISOString(),
  }
}

function normalizeRoadmapsList(data) {
  let list = data
  if (data && !Array.isArray(data)) {
    if (Array.isArray(data.roadmaps)) list = data.roadmaps
    else if (Array.isArray(data.data)) list = data.data
    else if (Array.isArray(data.items)) list = data.items
    else if (Array.isArray(data.results)) list = data.results
  }
  if (!Array.isArray(list)) return null
  const items = list
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const steps = (findSteps(item) || []).map(normalizeStep).filter(Boolean)
      if (steps.length === 0) return null
      return {
        ...item,
        roadmap: steps,
        total_estimated_days: item.total_estimated_days || item.total_days || steps.length * 3,
        generated_at: item.generated_at || item.created_at || null,
      }
    })
    .filter(Boolean)
  return items.length > 0 ? items : null
}

// The internships endpoint is unauthenticated and ranks against the backend's
// OWN stored resume — and the pool is aggressively scraped, so it has no skill
// tags and lots of non-engineering roles. We therefore re-rank the (real)
// listings against the CURRENT user's skills + target role and drop obvious
// irrelevant noise so the card only shows genuinely relevant entries.
const ROLE_INTERN_KEYWORDS = {
  'SDE': ['software', 'developer', 'engineer', 'backend', 'frontend', 'full stack', 'fullstack', 'devops', 'sdet', 'qa', 'tester', 'java', 'python', 'cloud', 'api', 'security'],
  'Data Science': ['data', 'analyst', 'analytics', 'machine learning', 'data science', 'statistics', 'python', 'sql', 'power bi', 'tableau'],
  'AI/ML Engineer': ['ai', 'machine learning', 'ml', 'deep learning', 'nlp', 'llm', 'neural', 'python', 'tensorflow', 'pytorch', 'langchain', 'engineer'],
  'Web Developer': ['web', 'frontend', 'front-end', 'react', 'javascript', 'html', 'css', 'node', 'full stack', 'ui', 'ux', 'designer'],
  'Other': ['engineer', 'developer', 'software', 'intern', 'data', 'design', 'it', 'technical'],
}

const TECH_TITLE_REGEX = /engineer|developer|software|data|analyst|scientist|devops|sdet|qa|tester|cloud|frontend|backend|full.?stack|security|intern|web|android|ios|ai|ml|python|java|node|technical/i

// Drop obvious non-engineering roles (sales/ops/accounting/marketing) BEFORE
// ranking so a stray skill word in their description can't push them on top.
const NOISE_TITLE_REGEX = /sales|marketing|business development|account\b|go-to-market|partnerships?|payroll|recruit|acquisition|representative|customer support|support specialist|vice president|\bdirector\b|operations|leadership|dispatch/i

function rankInternshipsByUserSkills(pool, userSkills, targetRole) {
  const lowerSkills = (userSkills || [])
    .map((s) => String(s).toLowerCase())
    .filter((s) => s.length >= 3)
  const lowerSet = new Set(lowerSkills)
  const kw = ROLE_INTERN_KEYWORDS[targetRole] || ROLE_INTERN_KEYWORDS['Other']

  const scored = pool
    .map((intern, order) => {
      if (!intern || typeof intern !== 'object') return null
      const req = Array.isArray(intern.required_skills) ? intern.required_skills : []
      const haystack = [intern.title, intern.company, intern.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      let matched = req.filter((s) => lowerSet.has(String(s).toLowerCase()))
      if (matched.length === 0) {
        matched = lowerSkills.filter((s) => haystack.includes(s))
      }

      const kwHits = matched.length === 0
        ? kw.filter((w) => String(intern.title).toLowerCase().includes(w))
        : []

      let score = 0
      if (req.length > 0 && matched.length > 0) {
        score = Math.round((matched.length / req.length) * 100)
      } else if (matched.length > 0) {
        score = Math.min(90, Math.round(20 + (matched.length / Math.max(lowerSet.size, 1)) * 120))
      } else if (kwHits.length > 0) {
        score = 40
      }

      return {
        ...intern,
        required_skills: req,
        match_score: score,
        matched_skills: [...new Set(matched.length > 0 ? matched : kwHits.slice(0, 2))],
        _order: order,
      }
    })
    .filter(Boolean)

  scored.sort((a, b) => b.match_score - a.match_score || a._order - b._order)

  // Real entries matched to the resume first; only fill remaining slots with
  // tech-titled entries (never pure sales/manager/marketing noise)
  const matchedList = scored.filter((s) => s.match_score > 0)
  const restTech = scored.filter((s) => s.match_score === 0 && TECH_TITLE_REGEX.test(s.title))
  return [...matchedList, ...restTech]
}

export async function fetchInternships(userSkills, limit = 4, targetRole = 'Other') {
  const cacheKey = `cs_intern5_${targetRole}_${limit}_${skillsHash(userSkills || [])}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  // Ask the backend to rank with THIS user's skills (server-side, personal),
  // then re-rank the full real pool against the same skills + target role here.
  try {
    const skillNames = (userSkills || []).map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
    const res = await api.get('/internship/internships/recommendations', {
      params: { limit: 50, skills: skillNames.join(',') },
    })
    const data = res.data
    let pool = null
    if (Array.isArray(data)) pool = data
    else if (data && Array.isArray(data.internships)) pool = data.internships
    else if (Array.isArray(data?.data)) pool = data.data
    if (pool && pool.length > 0) {
      const cleanPool = pool.some((i) => !NOISE_TITLE_REGEX.test(i.title || ''))
        ? pool.filter((i) => !NOISE_TITLE_REGEX.test(i.title || ''))
        : pool
      const ranked = rankInternshipsByUserSkills(
        cleanPool,
        (userSkills || []).map((s) => s.name || s),
        targetRole,
      ).slice(0, limit)
      const out = { payload: ranked, real: true }
      setCache(cacheKey, out)
      return out
    }
  } catch (err) {
    console.warn('Backend internships failed, using local fallback:', err.message)
  }
  // Local fallback — NOT cached so real data isn't blocked
  return { payload: computeInternshipsLocally(userSkills || [], limit), real: false }
}

export async function generateRoadmap(missingSkills, targetRole) {
  const cacheKey = `cs_road3_${targetRole}_${skillsHash(missingSkills)}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  // Try backend first — accept ANY response shape containing roadmap steps
  try {
    const res = await api.post('/roadmap/generate', null, {
      params: { target_role: targetRole },
    })
    const raw = res.data
    try { localStorage.setItem('careersync_debug_roadmap', JSON.stringify(raw).slice(0, 20000)) } catch { /* ignore */ }
    console.log('[roadmap] backend response:', raw)
    const payload = normalizeRoadmapPayload(raw)
    if (payload.roadmap.length > 0) {
      const out = { payload, real: true }
      setCache(cacheKey, out)
      return out
    }
  } catch (err) {
    console.warn('Backend roadmap failed, using local fallback:', err.message)
  }
  // Local fallback — NOT cached so real data isn't blocked
  return { payload: generateRoadmapLocally(missingSkills, targetRole), real: false }
}

// Fetch the user's previously generated AI roadmaps (real backend data)
export async function fetchMyRoadmaps() {
  try {
    const res = await api.get('/roadmap/my-roadmaps')
    const normalized = normalizeRoadmapsList(res.data)
    if (normalized) return normalized
  } catch (err) {
    console.warn('Fetch my-roadmaps failed:', err.message)
  }
  return null
}

export default api
