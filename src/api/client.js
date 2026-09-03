import axios from 'axios'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
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
// Generates matching internships locally if backend endpoint fails
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

export async function analyzeSkillGap(skills, targetRole) {
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
      return res.data
    }
  } catch (err) {
    console.warn('Backend analyze failed, using local fallback:', err.message)
  }
  // Local fallback — mirrors backend gap_engine.py logic
  return computeSkillGapLocally(skills, targetRole)
}

export async function fetchInternships(skills, limit = 4) {
  // Try backend first
  try {
    const res = await api.get('/internship/recommendations', {
      params: { limit },
    })
    const data = res.data
    let result = null
    if (Array.isArray(data)) result = data
    else if (data && Array.isArray(data.internships)) result = data.internships
    else if (Array.isArray(data?.data)) result = data.data
    if (result && result.length > 0) return result
  } catch (err) {
    console.warn('Backend internships failed, using local fallback:', err.message)
  }
  // Local fallback — scores internships against user skills
  return computeInternshipsLocally(skills, limit)
}

export async function generateRoadmap(missingSkills, targetRole) {
  // Try backend first
  try {
    const res = await api.post('/roadmap/generate', null, {
      params: { target_role: targetRole },
    })
    return res.data
  } catch (err) {
    console.warn('Backend roadmap failed, using local fallback:', err.message)
  }
  // Local fallback — generates basic roadmap
  return generateRoadmapLocally(missingSkills, targetRole)
}

export default api
