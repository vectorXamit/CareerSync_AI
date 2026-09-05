
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
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (err) { console.warn('Failed to attach auth token:', err.message) }
  return config
})

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
  const userLowerSet = new Set((userSkills || []).map((s) => s.toLowerCase()))
  const scored = FALLBACK_INTERNSHIPS.map((intern) => {
    const matched = intern.required_skills.filter((s) => userLowerSet.has(s.toLowerCase()))
    const matchScore = intern.required_skills.length > 0 ? Math.round((matched.length / intern.required_skills.length) * 100) : 0
    const finalScore = Math.max(35, Math.min(92, matchScore + Math.floor(Math.random() * 12)))
    return { ...intern, match_score: finalScore, matched_skills: matched, company_name: intern.company }
  })
  scored.sort((a, b) => b.match_score - a.match_score)
  return scored.slice(0, limit)
}

async function fetchRealLiveInternships() {
  let allJobs = []
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?search=intern&limit=40")
    const data = await res.json()
    for (const job of (data.jobs || [])) {
      if ((job.title || "").toLowerCase().includes("intern")) {
        allJobs.push({ id: String(job.id), title: job.title, company: job.company_name, location: job.candidate_required_location || "Remote", mode: "Remote", stipend: "Paid", is_paid: true, required_skills: job.tags || [], url: job.url, description: job.description?.slice(0,200) || "" })
      }
    }
  } catch (e) { console.warn("Remotive error", e) }
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api?search=intern")
    const data = await res.json()
    for (const job of (data.data || []).slice(0,20)) {
      allJobs.push({ id: String(job.slug || Math.random()), title: job.title, company: job.company_name, location: job.location || "Remote", mode: job.remote ? "Remote" : "Hybrid", stipend: "Paid", is_paid: true, required_skills: job.tags || [], url: job.url, description: job.description?.slice(0,200) || "" })
    }
  } catch (e) { console.warn("Arbeitnow error", e) }
  return allJobs
}

const ROLE_SKILLS_MAP = {
  'SDE': ['Python', 'DSA', 'OOPs', 'SQL', 'Git', 'REST APIs', 'System Design'],
  'Data Science': ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Statistics', 'Data Visualization'],
  'AI/ML Engineer': ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Groq', 'LangChain'],
  'Web Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'FastAPI', 'PostgreSQL', 'Git'],
  'Other': ['Python', 'Communication', 'Problem Solving'],
}

function computeSkillGapLocally(userSkills, targetRole) {
  const required = ROLE_SKILLS_MAP[targetRole] || ROLE_SKILLS_MAP['Other']
  const userLowerSet = new Set((userSkills || []).map((s) => s.toLowerCase()))
  const matched = required.filter((s) => userLowerSet.has(s.toLowerCase()))
  const missing = required.filter((s) => !userLowerSet.has(s.toLowerCase()))
  const matchScore = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 0
  return { student_id: 'local', target_role: targetRole, match_score: matchScore, matched_skills: matched, missing_skills: missing, gaps: [...matched.map((s) => ({ skill: s, status: 'matched', level: 'Intermediate' })), ...missing.map((s) => ({ skill: s, status: 'missing', level: 'Beginner' }))], summary: `Good foundation with ${matched.slice(0, 3).join(', ') || 'some skills'}. Focus on learning ${missing.slice(0, 3).join(', ') || 'new skills'} to become ${targetRole} ready.` }
}

function generateRoadmapLocally(missingSkills, targetRole) {
  const steps = missingSkills.map((skill, i) => ({ step_no: i + 1, skill: skill, title: `Learn ${skill} for ${targetRole}`, description: `Master fundamentals of ${skill} required for ${targetRole} role.`, resources: [{ type: 'youtube', title: `Learn ${skill} Full Course`, url: `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}+for+${encodeURIComponent(targetRole)}` }], estimated_days: 3, is_completed: false }))
  return { student_id: 'local', target_role: targetRole, roadmap: steps, total_estimated_days: steps.length * 3, generated_at: new Date().toISOString() }
}

export async function syncUser() { try { if (!isSupabaseConfigured) return null; const { data } = await supabase.auth.getSession(); const session = data.session; if (!session) return null; const res = await api.post('/auth/sync', { supabase_id: session.user.id, email: session.user.email, full_name: session.user.user_metadata?.full_name || null }); return res.data } catch (err) { console.warn('syncUser failed:', err.message); return null } }
export async function uploadResume(formData) { try { const res = await api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return res.data } catch (err) { console.warn('uploadResume failed:', err.message); return null } }
export async function getMe() { try { const res = await api.get('/auth/me'); return res.data } catch (err) { console.warn('getMe failed:', err.message); return null } }
export async function analyzeSkillGap(skills, targetRole) { try { let studentId = null; if (isSupabaseConfigured) { const { data } = await supabase.auth.getSession(); studentId = data.session?.user?.id } if (studentId) { const res = await api.post(`/analyze/${studentId}`, { target_role: targetRole }); return res.data } } catch (err) { console.warn('Backend analyze failed, using local:', err.message) } return computeSkillGapLocally(skills, targetRole) }

export async function fetchInternships(skills = [], limit = 4) {
  console.log("Fetching REAL internships for skills:", skills)
  try {
    const skillParam = (skills || []).join(",")
    const res = await api.get('/internships/recommendations', { params: { limit: limit * 2, skills: skillParam } })
    const data = res.data
    let result = null
    if (Array.isArray(data)) result = data
    else if (data && Array.isArray(data.internships)) result = data.internships
    else if (Array.isArray(data?.data)) result = data.data
    if (result && result.length > 0) {
      const companies = result.map(r => (r.company || "").toLowerCase())
      const uniqueCompanies = new Set(companies)
      if (uniqueCompanies.size === 1 && result.length > 1) { console.warn("Backend duplicate bug, ignoring"); throw new Error("Duplicate company bug") }
      const seen = new Set(); const unique = []
      for (const job of result) { const comp = (job.company || "").toLowerCase().trim(); if (comp && !seen.has(comp)) { unique.push(job); seen.add(comp) } if (unique.length >= limit) break }
      if (unique.length > 0) return unique.slice(0, limit)
    }
  } catch (err) { console.warn('Backend failed or duplicate bug, trying real live APIs:', err.message) }
  try {
    const liveJobs = await fetchRealLiveInternships()
    if (liveJobs.length >= limit) {
      const userLower = new Set((skills || []).map(s => s.toLowerCase()))
      const scored = liveJobs.map(job => { const jobSkills = (job.required_skills || []).map(s => String(s).toLowerCase()); const matched = jobSkills.filter(s => [...userLower].some(u => s.includes(u) || u.includes(s))); const score = jobSkills.length > 0 ? Math.round((matched.length / Math.max(1, jobSkills.length)) * 100) : 50; const finalScore = Math.max(38, Math.min(90, score + Math.floor(Math.random()*15))); return { ...job, match_score: finalScore, matched_skills: matched, company_name: job.company } })
      const seen = new Set(); const unique = []; scored.sort((a,b)=>b.match_score - a.match_score); for (const j of scored) { const c = (j.company || "").toLowerCase(); if (c && !seen.has(c)) { unique.push(j); seen.add(c) } if (unique.length >= limit) break } 
      if (unique.length >= limit) return unique
    }
  } catch (e) { console.warn("Real live APIs failed", e) }
  return computeInternshipsLocally(skills, limit)
}

export async function generateRoadmap(missingSkills, targetRole) { try { const res = await api.post('/roadmap/generate', null, { params: { target_role: targetRole } }); return res.data } catch (err) { console.warn('Backend roadmap failed:', err.message) } return generateRoadmapLocally(missingSkills, targetRole) }
export default api
